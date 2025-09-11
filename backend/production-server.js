const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
require('dotenv').config();

// Import services
const { databaseService } = require('./services/database');
const { blockchainService } = require('./services/blockchain');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const qrRoutes = require('./routes/qr');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global blockchain status
let blockchainStatus = {
  isConnected: false,
  error: null,
  retryCount: 0,
  maxRetries: 3
};

// Enhanced blockchain check middleware
const checkBlockchainService = (req, res, next) => {
  if (!blockchainService.isInitialized) {
    // Try to reconnect if we haven't exceeded max retries
    if (blockchainStatus.retryCount < blockchainStatus.maxRetries) {
      console.log(`🔄 Attempting blockchain reconnection (${blockchainStatus.retryCount + 1}/${blockchainStatus.maxRetries})`);
      
      blockchainService.initialize(
        process.env.RPC_URL,
        process.env.PRIVATE_KEY,
        process.env.CONTRACT_ADDRESS
      ).then(() => {
        blockchainStatus.isConnected = true;
        blockchainStatus.error = null;
        console.log('✅ Blockchain reconnected successfully');
        next();
      }).catch(error => {
        blockchainStatus.retryCount++;
        blockchainStatus.error = error.message;
        console.error(`❌ Blockchain reconnection failed (attempt ${blockchainStatus.retryCount}):`, error.message);
        
        if (blockchainStatus.retryCount >= blockchainStatus.maxRetries) {
          return res.status(503).json({
            success: false,
            error: 'Blockchain service unavailable',
            message: 'Unable to connect to blockchain network. Please try again later.',
            details: error.message,
            fallbackAvailable: false
          });
        } else {
          return res.status(503).json({
            success: false,
            error: 'Blockchain service temporarily unavailable',
            message: `Connection attempt ${blockchainStatus.retryCount} failed. Retrying...`,
            willRetry: true
          });
        }
      });
    } else {
      return res.status(503).json({
        success: false,
        error: 'Blockchain service unavailable',
        message: 'Maximum connection attempts exceeded. Blockchain functionality is temporarily disabled.',
        details: blockchainStatus.error
      });
    }
  } else {
    blockchainStatus.isConnected = true;
    blockchainStatus.retryCount = 0; // Reset retry count on successful connection
    next();
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    success: true,
    server: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    blockchain: 'disconnected',
    database: 'disconnected'
  };

  try {
    // Check database
    if (databaseService.isConnected) {
      health.database = 'connected';
      health.databaseInfo = {
        name: process.env.DB_NAME,
        host: 'MongoDB Atlas'
      };
    }
  } catch (error) {
    health.database = 'error';
    health.databaseError = error.message;
  }

  try {
    // Check blockchain
    if (blockchainService.isInitialized) {
      const networkInfo = await blockchainService.getNetworkInfo();
      health.blockchain = 'connected';
      health.networkInfo = networkInfo;
    }
  } catch (error) {
    health.blockchain = 'error';
    health.blockchainError = error.message;
  }

  res.json(health);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', checkBlockchainService, productRoutes);
app.use('/api/transactions', checkBlockchainService, transactionRoutes);
app.use('/api/qr', qrRoutes);

// Enhanced tracking endpoint with fallback
app.get('/api/track/:productId', async (req, res) => {
  const productId = req.params.productId;
  
  try {
    let trackingData;
    
    if (blockchainService.isInitialized) {
      // Try blockchain first
      try {
        const product = await blockchainService.getProduct(productId);
        const transactions = await blockchainService.getProductTransactions(productId);
        
        trackingData = {
          product,
          transactions: transactions || [],
          ownershipChain: transactions ? formatOwnershipChain(transactions) : [],
          totalTransactions: transactions?.length || 0,
          currentOwner: product.currentHolderId || product.createdBy,
          trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${productId}`,
          source: 'blockchain'
        };
      } catch (blockchainError) {
        console.warn('⚠️  Blockchain query failed, using fallback data:', blockchainError.message);
        trackingData = getFallbackTrackingData(productId);
      }
    } else {
      // Use fallback data if blockchain not available
      trackingData = getFallbackTrackingData(productId);
    }
    
    res.json({
      success: true,
      data: trackingData
    });
    
  } catch (error) {
    console.error('❌ Tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track product',
      message: error.message
    });
  }
});

// Fallback tracking data
function getFallbackTrackingData(productId) {
  return {
    product: {
      productId: productId,
      id: productId,
      name: `Sample Product ${productId}`,
      description: 'This is a sample product for testing QR code functionality',
      category: 'Agriculture',
      origin: 'Sample Farm',
      harvestDate: new Date().toISOString(),
      currentState: Math.floor(Math.random() * 3), // Random state 0-2
      currentOwner: 'Sample Owner',
      createdAt: new Date().toISOString(),
      verificationStatus: 'Verified',
      isOrganic: Math.random() > 0.5,
      quantity: '1000',
      pricePerUnit: '50'
    },
    transactions: [
      {
        id: 'TX001',
        from: 'Farm',
        to: 'Distributor',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'Completed'
      },
      {
        id: 'TX002',
        from: 'Distributor', 
        to: 'Retailer',
        timestamp: new Date().toISOString(),
        status: 'Completed'
      }
    ],
    ownershipChain: [
      {
        owner: 'Sample Farm',
        from: new Date(Date.now() - 172800000).toISOString(),
        to: new Date(Date.now() - 86400000).toISOString(),
        timestamp: new Date(Date.now() - 172800000).toISOString()
      },
      {
        owner: 'Sample Distributor',
        from: new Date(Date.now() - 86400000).toISOString(),
        to: new Date().toISOString(),
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    totalTransactions: 2,
    currentOwner: 'Sample Distributor',
    trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${productId}`,
    source: 'fallback'
  };
}

// Format blockchain transactions into ownership chain
function formatOwnershipChain(transactions) {
  return transactions.map((tx, index) => ({
    step: index,
    action: index === 0 ? 'Created' : 'Transferred',
    owner: tx.toUserId || tx.toUser,
    previousOwner: index > 0 ? tx.fromUserId || tx.fromUser : null,
    timestamp: tx.timestamp || new Date().toISOString(),
    transactionId: tx.id || tx.transactionId
  }));
}

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Agricultural Supply Chain API',
    version: '2.0.0',
    blockchain: {
      status: blockchainStatus.isConnected ? 'connected' : 'disconnected',
      retries: blockchainStatus.retryCount,
      error: blockchainStatus.error
    },
    endpoints: {
      qr: {
        'GET /api/qr/generate/:productId': 'Generate QR code as data URL',
        'GET /api/qr/image/:productId': 'Generate QR code as PNG image',
        'POST /api/qr/batch': 'Generate multiple QR codes'
      },
      tracking: {
        'GET /api/track/:productId': 'Get product tracking information (public, with fallback)'
      },
      products: {
        'POST /api/products': 'Create a new product (requires blockchain)',
        'GET /api/products': 'Get all products (requires blockchain)',
        'GET /api/products/:productId': 'Get product details (requires blockchain)'
      },
      transactions: {
        'POST /api/transactions': 'Create a new transaction (requires blockchain)',
        'GET /api/transactions/product/:productId': 'Get product transactions (requires blockchain)'
      },
      system: {
        'GET /health': 'Health check endpoint',
        'GET /api': 'API documentation'
      }
    },
    notes: [
      'QR and tracking endpoints work with or without blockchain',
      'Product and transaction endpoints require blockchain connection',
      'Fallback data is provided when blockchain is unavailable',
      'System automatically attempts to reconnect to blockchain'
    ]
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
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('🚀 Starting Agricultural Supply Chain API Server...');
    
    // Initialize database connection
    console.log('🔗 Connecting to database...');
    await databaseService.connect();
    
    // Seed database with initial data (development only)
    if (process.env.NODE_ENV === 'development') {
      await databaseService.seedDatabase();
    }
    
    // Try to initialize blockchain (non-blocking)
    console.log('🔗 Attempting blockchain connection...');
    try {
      await blockchainService.initialize(
        process.env.RPC_URL,
        process.env.PRIVATE_KEY,
        process.env.CONTRACT_ADDRESS
      );
      
      const networkInfo = await blockchainService.getNetworkInfo();
      console.log('🌐 Connected to blockchain network:', networkInfo.name);
      console.log('📍 Contract address:', networkInfo.contractAddress);
      console.log('📦 Block number:', networkInfo.blockNumber);
      
      blockchainStatus.isConnected = true;
      blockchainStatus.error = null;
      
      // Set up event listeners if enabled
      if (process.env.LISTEN_TO_EVENTS === 'true') {
        console.log('👂 Setting up blockchain event listeners...');
        
        blockchainService.listenToEvent('ProductCreated', (productId, name, createdBy, timestamp) => {
          console.log('🔔 Product created:', { productId, name, createdBy, timestamp: new Date(timestamp * 1000) });
        });
        
        blockchainService.listenToEvent('TransactionCreated', (transactionId, productId, fromUserId, toUserId, timestamp) => {
          console.log('🔔 Transaction created:', { transactionId, productId, fromUserId, toUserId, timestamp: new Date(timestamp * 1000) });
        });
      }
    } catch (blockchainError) {
      console.warn('⚠️  Blockchain connection failed:', blockchainError.message);
      console.log('📝 Server will continue with limited functionality (QR codes and fallback data)');
      blockchainStatus.isConnected = false;
      blockchainStatus.error = blockchainError.message;
    }
    
    // Start the server regardless of blockchain status
    app.listen(PORT, () => {
      console.log('✅ Server started successfully!');
      console.log(`🌍 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      
      if (blockchainStatus.isConnected) {
        console.log('🎉 Full functionality available (Blockchain + QR + Tracking)');
        console.log('   📝 Product APIs: Available');
        console.log('   🔄 Transaction APIs: Available');
      } else {
        console.log('⚠️  Limited functionality (QR + Tracking with fallback data)');
        console.log('   📝 Product APIs: Unavailable (will retry on request)');
        console.log('   🔄 Transaction APIs: Unavailable (will retry on request)');
      }
      
      console.log('   📱 QR Generation: Available');
      console.log('   🔍 Product Tracking: Available (with fallback)');
      
      console.log('\\n🎯 Ready to use!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
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

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
