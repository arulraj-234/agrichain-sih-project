const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { blockchainService } = require('./services/blockchain');
const { databaseService } = require('./services/database');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.43.160:5173', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle BigInt serialization
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
    }
    return originalSend.call(this, data);
  };
  next();
});

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Custom middleware to check blockchain service initialization
const checkBlockchainService = (req, res, next) => {
  if (!blockchainService.isInitialized) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain service is not initialized. Please try again later.'
    });
  }
  next();
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const networkInfo = blockchainService.isInitialized ? 
      await blockchainService.getNetworkInfo() : null;
    
    const databaseStatus = await databaseService.healthCheck();
    
    res.json({
      success: true,
      message: 'Server is running',
      data: {
        server: 'OK',
        blockchain: blockchainService.isInitialized ? 'Connected' : 'Disconnected',
        database: databaseStatus.status === 'healthy' ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        networkInfo,
        databaseInfo: databaseStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Public product tracking route for QR codes (no auth required)
app.get('/api/track/:productId', checkBlockchainService, async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log(`🔍 Public tracking request for product: ${productId}`);
    
    // Get product details
    const product = await blockchainService.getProduct(productId);
    
    // Get transaction history
    const transactions = await blockchainService.getProductTransactions(productId);
    
    // Get ownership chain
    const ownershipChain = [];
    
    // Sort transactions by timestamp (oldest first)
    transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Add initial owner (creator)
    ownershipChain.push({
      step: 0,
      owner: product.createdBy,
      action: 'Created',
      timestamp: product.createdAt,
      transactionId: null
    });
    
    // Add each transaction as a step in the chain
    transactions.forEach((tx, index) => {
      ownershipChain.push({
        step: index + 1,
        owner: tx.toUserId,
        previousOwner: tx.fromUserId,
        action: 'Transferred',
        timestamp: tx.timestamp,
        transactionId: tx.transactionId
      });
    });
    
    res.json({
      success: true,
      data: {
        product,
        transactions,
        ownershipChain,
        totalTransactions: transactions.length,
        currentOwner: product.currentHolderId,
        trackingUrl: `${req.protocol}://${req.get('host')}/api/track/${productId}`
      }
    });
    
  } catch (error) {
    console.error('❌ Error in public tracking:', error.message);
    
    if (error.message.includes('Product does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        productId
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to track product',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', checkBlockchainService, productRoutes);
app.use('/api/transactions', checkBlockchainService, transactionRoutes);
app.use('/api/qr', qrRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ProductManagement API',
    version: '1.0.0',
    endpoints: {
      products: {
        'POST /api/products': 'Create a new product',
        'GET /api/products': 'Get all products (paginated)',
        'GET /api/products/:productId': 'Get product details',
        'PUT /api/products/:productId/state': 'Update product state',
        'GET /api/products/:productId/transactions': 'Get product transaction history',
        'GET /api/products/:productId/transaction-count': 'Get product transaction count',
        'GET /api/products/stats/overview': 'Get product statistics',
        'POST /api/products/search': 'Search products with filters'
      },
      transactions: {
        'POST /api/transactions': 'Create a new transaction (transfer ownership)',
        'GET /api/transactions/user/:userId': 'Get user transactions',
        'GET /api/transactions/user/:userId/count': 'Get user transaction count',
        'GET /api/transactions/user/:userId/sent': 'Get transactions sent by user',
        'GET /api/transactions/user/:userId/received': 'Get transactions received by user',
        'GET /api/transactions/product/:productId': 'Get product ownership history',
        'GET /api/transactions/product/:productId/chain': 'Get formatted ownership chain',
        'GET /api/transactions/stats/overview': 'Get transaction statistics',
        'POST /api/transactions/batch': 'Create multiple transactions',
        'GET /api/transactions/recent': 'Get recent transactions',
        'POST /api/transactions/validate': 'Validate transaction before creating'
      },
      system: {
        'GET /health': 'Health check endpoint',
        'GET /api': 'API documentation'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  
  // Handle other errors
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Initialize blockchain service and start server
async function startServer() {
  try {
    console.log('🚀 Starting ProductManagement API Server...');
    
    // Initialize database connection
    console.log('🔗 Connecting to database...');
    await databaseService.connect();
    
    // Seed database with initial data (development only)
    if (process.env.NODE_ENV === 'development') {
      await databaseService.seedDatabase();
    }
    
    // Check required environment variables
    const requiredEnvVars = ['RPC_URL', 'CONTRACT_ADDRESS'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
      console.log('📝 Please set the following in your .env file:');
      console.log('   RPC_URL=http://localhost:8545');
      console.log('   CONTRACT_ADDRESS=0xYourContractAddress');
      console.log('   PRIVATE_KEY=your-private-key (optional, for read-only operations)');
      process.exit(1);
    }
    
    // Initialize blockchain service
    console.log('🔗 Initializing blockchain connection...');
    await blockchainService.initialize(
      process.env.RPC_URL,
      process.env.PRIVATE_KEY, // Optional for read-only operations
      process.env.CONTRACT_ADDRESS
    );
    
    // Get network information
    const networkInfo = await blockchainService.getNetworkInfo();
    console.log('🌐 Connected to network:', networkInfo.name);
    console.log('📍 Contract address:', networkInfo.contractAddress);
    console.log('📦 Block number:', networkInfo.blockNumber);
    
    // Start listening for events (optional)
    if (process.env.LISTEN_TO_EVENTS === 'true') {
      console.log('👂 Setting up event listeners...');
      
      blockchainService.listenToEvent('ProductCreated', (productId, name, createdBy, timestamp) => {
        console.log('🔔 Product created event:', { productId, name, createdBy, timestamp: new Date(timestamp * 1000) });
      });
      
      blockchainService.listenToEvent('TransactionCreated', (transactionId, productId, fromUserId, toUserId, timestamp) => {
        console.log('🔔 Transaction created event:', { transactionId, productId, fromUserId, toUserId, timestamp: new Date(timestamp * 1000) });
      });
      
      blockchainService.listenToEvent('OwnershipTransferred', (productId, fromUserId, toUserId, timestamp) => {
        console.log('🔔 Ownership transferred event:', { productId, fromUserId, toUserId, timestamp: new Date(timestamp * 1000) });
      });
    }
    
    // Start the server
    app.listen(PORT, "0.0.0.0", () => {
      console.log('✅ Server started successfully!');
      console.log(`🌍 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log('🎉 ProductManagement API is ready to use!');
      
      // Log some helpful information
      console.log('\n📖 Quick Start:');
      console.log('   Create a product: POST /api/products');
      console.log('   Get all products: GET /api/products');
      console.log('   Transfer ownership: POST /api/transactions');
      console.log('   Get product history: GET /api/transactions/product/:productId/chain');
      console.log('\n💡 Set LISTEN_TO_EVENTS=true in .env to enable real-time event logging');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('📝 Please check your configuration and try again.');
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('💡 Make sure your blockchain node is running (e.g., Hardhat network, Ganache, or actual node)');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  
  if (blockchainService.isInitialized) {
    blockchainService.stopListening();
  }
  
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  
  if (blockchainService.isInitialized) {
    blockchainService.stopListening();
  }
  
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;