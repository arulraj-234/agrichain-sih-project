const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');

// Create a new product
router.post('/create', async (req, res) => {
    try {
        const { name, description, quantity, pricePerUnit, origin, isOrganic } = req.body;
        
        if (!name || !description || !quantity || !pricePerUnit || !origin || isOrganic === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'description', 'quantity', 'pricePerUnit', 'origin', 'isOrganic']
            });
        }

        const result = await blockchainService.createProduct(
            name,
            description,
            quantity,
            pricePerUnit,
            origin,
            isOrganic
        );

        res.json({
            success: true,
            message: 'Product created successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create product',
            message: error.message
        });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await blockchainService.getProduct(productId);
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get product',
            message: error.message
        });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const productIds = await blockchainService.getAllProducts();
        const products = [];
        
        for (const id of productIds) {
            try {
                const product = await blockchainService.getProduct(id);
                products.push(product);
            } catch (err) {
                console.error(`Error fetching product ${id}:`, err);
            }
        }
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get products',
            message: error.message
        });
    }
});

// Transfer product ownership
router.post('/:id/transfer', async (req, res) => {
    try {
        const productId = req.params.id;
        const { toStakeholderId, price, notes } = req.body;
        
        if (!toStakeholderId || !price) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['toStakeholderId', 'price']
            });
        }

        const result = await blockchainService.transferProduct(
            productId,
            toStakeholderId,
            price,
            notes || ''
        );

        res.json({
            success: true,
            message: 'Product transferred successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to transfer product',
            message: error.message
        });
    }
});

// Get product transaction history
router.get('/:id/transactions', async (req, res) => {
    try {
        const productId = req.params.id;
        const transactions = await blockchainService.getProductTransactions(productId);
        
        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get product transactions',
            message: error.message
        });
    }
});

// Mock data for testing without blockchain
router.get('/mock/sample', (req, res) => {
    const mockProducts = [
        {
            id: '1',
            name: 'Organic Rice',
            description: 'Premium quality organic basmati rice',
            farmerId: '1',
            quantity: '1000',
            pricePerUnit: '50',
            currentState: 0, // Produced
            harvestDate: Date.now().toString(),
            origin: 'Cuttack, Odisha',
            isOrganic: true,
            currentHolderId: '1'
        },
        {
            id: '2',
            name: 'Fresh Tomatoes',
            description: 'Locally grown fresh tomatoes',
            farmerId: '1',
            quantity: '500',
            pricePerUnit: '30',
            currentState: 1, // InTransit
            harvestDate: Date.now().toString(),
            origin: 'Puri, Odisha',
            isOrganic: false,
            currentHolderId: '2'
        },
        {
            id: '3',
            name: 'Organic Mangoes',
            description: 'Sweet and juicy organic mangoes',
            farmerId: '1',
            quantity: '300',
            pricePerUnit: '80',
            currentState: 2, // Received
            harvestDate: Date.now().toString(),
            origin: 'Sambalpur, Odisha',
            isOrganic: true,
            currentHolderId: '3'
        }
    ];

    res.json({
        success: true,
        count: mockProducts.length,
        data: mockProducts
    });
});

module.exports = router;
