const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// Generate QR code for a product
router.get('/generate/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        // Create URL for product tracking
        const trackingUrl = `${baseUrl}/track/${productId}`;
        
        // Generate QR code as data URL
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
            productId: productId,
            trackingUrl: trackingUrl,
            qrCode: qrCodeDataUrl
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate QR code',
            message: error.message
        });
    }
});

// Generate QR code as image file
router.get('/image/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        // Create URL for product tracking
        const trackingUrl = `${baseUrl}/track/${productId}`;
        
        // Generate QR code as buffer
        const qrCodeBuffer = await QRCode.toBuffer(trackingUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        // Send as image
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="qr-product-${productId}.png"`);
        res.send(qrCodeBuffer);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate QR code image',
            message: error.message
        });
    }
});

// Batch generate QR codes for multiple products
router.post('/batch', async (req, res) => {
    try {
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'productIds must be an array'
            });
        }
        
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCodes = [];
        
        for (const productId of productIds) {
            const trackingUrl = `${baseUrl}/track/${productId}`;
            const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
                width: 300,
                margin: 2
            });
            
            qrCodes.push({
                productId: productId,
                trackingUrl: trackingUrl,
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
            error: 'Failed to generate batch QR codes',
            message: error.message
        });
    }
});

module.exports = router;
