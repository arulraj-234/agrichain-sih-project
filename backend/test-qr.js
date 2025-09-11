const express = require('express');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();

// Test QR code generation with correct URL
async function testQRGeneration() {
    try {
        const productId = 'PROD001';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const trackingUrl = `${frontendUrl}/track/${productId}`;
        
        console.log('🧪 Testing QR Code Generation...');
        console.log('📍 Frontend URL from env:', frontendUrl);
        console.log('🔗 Tracking URL:', trackingUrl);
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        console.log('✅ QR Code generated successfully!');
        console.log('📱 QR Code will redirect to:', trackingUrl);
        console.log('📊 QR Data URL length:', qrCodeDataUrl.length);
        
        return {
            success: true,
            productId,
            trackingUrl,
            qrCode: qrCodeDataUrl
        };
        
    } catch (error) {
        console.error('❌ QR Generation failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test server endpoints without blockchain
app.get('/api/qr/test/:productId', async (req, res) => {
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
            error: error.message
        });
    }
});

// Mock tracking endpoint for testing
app.get('/api/track/:productId', (req, res) => {
    const productId = req.params.productId;
    
    res.json({
        success: true,
        message: 'This should redirect to frontend instead',
        correctUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${productId}`,
        productId
    });
});

if (require.main === module) {
    // Run test
    testQRGeneration().then(result => {
        console.log('\n📋 Test Results:');
        console.log(JSON.stringify(result, null, 2));
        
        // Start simple test server
        const PORT = 3001;
        app.listen(PORT, () => {
            console.log(`\n🧪 Test server running on port ${PORT}`);
            console.log(`📱 Test QR endpoint: http://localhost:${PORT}/api/qr/test/PROD001`);
            console.log(`🔗 Mock tracking endpoint: http://localhost:${PORT}/api/track/PROD001`);
        });
    });
}
