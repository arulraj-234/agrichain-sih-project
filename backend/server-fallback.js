const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { databaseService } = require('./services/database');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
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

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const databaseStatus = await databaseService.healthCheck();
    
    res.json({
      success: true,
      message: 'Server is running (fallback mode)',
      data: {
        server: 'OK',
        blockchain: 'Fallback Mode (using mock data)',
        database: databaseStatus.status === 'healthy' ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        mode: 'FALLBACK',
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

// Public product tracking route for QR codes (using fallback data)
app.get('/api/track/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log(`🔍 Public tracking request for product: ${productId} (fallback mode)`);
    
    // Fallback product data
    const mockProduct = {
      id: productId,
      name: productId === 'TEST001' ? 'Organic Rice' : 'Premium Product',
      description: 'Mock product for testing QR system',
      farmerId: '1',
      quantity: '1000',
      pricePerUnit: '50',
      currentState: 0,
      harvestDate: new Date().toISOString(),
      origin: 'Test Location',
      isOrganic: true,
      currentHolderId: '1',
      createdBy: '1',
      createdAt: new Date().toISOString()
    };
    
    // Fallback transaction history
    const mockTransactions = [
      {
        transactionId: '1',
        productId: productId,
        fromUserId: '1',
        toUserId: '2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        price: '5000',
        notes: 'Mock transaction for testing'
      }
    ];
    
    // Create ownership chain
    const ownershipChain = [
      {
        step: 0,
        owner: mockProduct.createdBy,
        action: 'Created',
        timestamp: mockProduct.createdAt,
        transactionId: null
      },
      {
        step: 1,
        owner: '2',
        previousOwner: '1',
        action: 'Transferred',
        timestamp: mockTransactions[0].timestamp,
        transactionId: mockTransactions[0].transactionId
      }
    ];
    
    res.json({
      success: true,
      data: {
        product: mockProduct,
        transactions: mockTransactions,
        ownershipChain,
        totalTransactions: mockTransactions.length,
        currentOwner: mockProduct.currentHolderId,
        trackingUrl: `${req.protocol}://${req.get('host')}/api/track/${productId}`,
        mode: 'FALLBACK'
      }
    });
    
  } catch (error) {
    console.error('❌ Error in public tracking:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to track product (fallback mode)',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/qr', qrRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ProductManagement API (Fallback Mode)',
    version: '1.0.0',
    mode: 'FALLBACK - Using mock data for blockchain operations',
    endpoints: {
      qr: {
        'GET /api/qr/generate/:productId': 'Generate QR code for product',
        'GET /api/track/:productId': 'Track product (public, no auth)'
      },
      products: {
        'POST /api/products': 'Create a new product (mock)',
        'GET /api/products': 'Get all products (from database)',
        'GET /api/products/:productId': 'Get product details (mock)'
      },
      auth: {
        'POST /api/auth/login': 'User login',
        'POST /api/auth/register': 'User registration'
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

// Start server without blockchain dependency
async function startFallbackServer() {
  try {
    console.log('🚀 Starting ProductManagement API Server (Fallback Mode)...');
    
    // Initialize database connection
    console.log('🔗 Connecting to database...');
    await databaseService.connect();
    
    console.log('⚠️  Starting in FALLBACK mode - blockchain operations will use mock data');
    console.log('💡 To enable full blockchain functionality, start Hardhat node and restart with "npm start"');
    
    // Start the server
    app.listen(PORT, () => {
      console.log('✅ Server started successfully in FALLBACK mode!');
      console.log(`🌍 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log('🎉 QR Code system is ready to use!');
      
      // Log helpful information
      console.log('\n📖 Available Features:');
      console.log('   ✅ QR Code generation: GET /api/qr/generate/:productId');
      console.log('   ✅ Product tracking: GET /api/track/:productId');
      console.log('   ✅ User authentication: POST /api/auth/login');
      console.log('   ✅ Database operations: All working');
      console.log('   ⚠️  Blockchain operations: Using mock data');
      
      console.log('\n💡 Quick Test:');
      console.log(`   Generate QR: http://localhost:${PORT}/api/qr/generate/TEST001`);
      console.log(`   Track product: http://localhost:${PORT}/api/track/TEST001`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start fallback server:', error.message);
    console.error('📝 Please check your configuration and try again.');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
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

// Start the fallback server
if (require.main === module) {
  startFallbackServer();
}

module.exports = app;
