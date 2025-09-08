const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');

// Get all transactions for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const transactions = await blockchainService.getProductTransactions(productId);
        
        res.json({
            success: true,
            productId: productId,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get transactions',
            message: error.message
        });
    }
});

// Get supply chain trace for a product
router.get('/trace/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        
        // Get product details
        const product = await blockchainService.getProduct(productId);
        
        // Get all transactions
        const transactions = await blockchainService.getProductTransactions(productId);
        
        // Build supply chain trace
        const trace = {
            product: product,
            journey: transactions.map(tx => ({
                from: tx.fromStakeholder,
                to: tx.toStakeholder,
                timestamp: new Date(parseInt(tx.timestamp) * 1000).toISOString(),
                price: tx.price,
                notes: tx.notes
            }))
        };
        
        res.json({
            success: true,
            data: trace
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get supply chain trace',
            message: error.message
        });
    }
});

// Mock transaction data for testing
router.get('/mock/sample/:productId', (req, res) => {
    const productId = req.params.productId;
    
    const mockTransactions = [
        {
            productId: productId,
            fromStakeholder: '1',
            toStakeholder: '2',
            timestamp: (Date.now() - 86400000).toString(), // 1 day ago
            price: '5000',
            notes: 'Fresh harvest, packed for transport'
        },
        {
            productId: productId,
            fromStakeholder: '2',
            toStakeholder: '3',
            timestamp: (Date.now() - 43200000).toString(), // 12 hours ago
            price: '7500',
            notes: 'Delivered to retail store'
        }
    ];
    
    res.json({
        success: true,
        productId: productId,
        count: mockTransactions.length,
        data: mockTransactions
    });
});

module.exports = router;
