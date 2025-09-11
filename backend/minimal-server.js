const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'QR Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// QR Code Routes
app.get('/api/qr/generate/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const trackingUrl = `${frontendUrl}/track/${productId}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.json({
      success: true,
      productId,
      trackingUrl,
      qrCode: qrCodeDataUrl,
      message: 'QR Code points to frontend tracking page'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code',
      message: error.message
    });
  }
});

app.get('/api/qr/image/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const trackingUrl = `${frontendUrl}/track/${productId}`;
    
    const qrCodeBuffer = await QRCode.toBuffer(trackingUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qr-product-${productId}.png"`);
    res.send(qrCodeBuffer);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code image',
      message: error.message
    });
  }
});

app.post('/api/qr/batch', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'productIds must be an array'
      });
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrCodes = [];
    
    for (const productId of productIds) {
      const trackingUrl = `${frontendUrl}/track/${productId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 300,
        margin: 2
      });
      
      qrCodes.push({
        productId,
        trackingUrl,
        qrCode: qrCodeDataUrl
      });
    }
    
    res.json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate batch QR codes',
      message: error.message
    });
  }
});

// Mock tracking endpoint that returns sample data
app.get('/api/track/:productId', (req, res) => {
  const productId = req.params.productId;
  
  // Mock product data for testing
  const mockProduct = {
    success: true,
    data: {
      product: {
        productId: productId,
        name: `Sample Product ${productId}`,
        description: 'This is a sample product for testing QR code functionality',
        category: 'Agriculture',
        origin: 'Sample Farm',
        harvestDate: new Date().toISOString(),
        currentState: 'In Transit',
        currentOwner: 'Sample Owner',
        createdAt: new Date().toISOString(),
        verificationStatus: 'Verified'
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
          to: new Date(Date.now() - 86400000).toISOString()
        },
        {
          owner: 'Sample Distributor',
          from: new Date(Date.now() - 86400000).toISOString(),
          to: new Date().toISOString()
        }
      ]
    }
  };
  
  res.json(mockProduct);
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'QR Code & Tracking API',
    endpoints: {
      qr: {
        'GET /api/qr/generate/:productId': 'Generate QR code as data URL',
        'GET /api/qr/image/:productId': 'Generate QR code as PNG image',
        'POST /api/qr/batch': 'Generate multiple QR codes'
      },
      tracking: {
        'GET /api/track/:productId': 'Get product tracking information (public)'
      },
      system: {
        'GET /health': 'Health check endpoint',
        'GET /api': 'API documentation'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 QR & Tracking Server Started!');
  console.log(`🌍 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('\n🎯 QR Code Endpoints:');
  console.log(`   Generate QR: GET /api/qr/generate/PROD001`);
  console.log(`   QR Image: GET /api/qr/image/PROD001`);
  console.log(`   Track Product: GET /api/track/PROD001`);
  console.log('\n✅ Ready for QR code testing!');
});

module.exports = app;
