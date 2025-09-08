const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');

// Register a new stakeholder
router.post('/register', async (req, res) => {
    try {
        const { walletAddress, name, contactInfo, stakeholderType, location } = req.body;
        
        if (!walletAddress || !name || !contactInfo || stakeholderType === undefined || !location) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['walletAddress', 'name', 'contactInfo', 'stakeholderType', 'location']
            });
        }

        const result = await blockchainService.registerStakeholder(
            walletAddress,
            name,
            contactInfo,
            stakeholderType,
            location
        );

        res.json({
            success: true,
            message: 'Stakeholder registered successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to register stakeholder',
            message: error.message
        });
    }
});

// Get stakeholder by ID
router.get('/:id', async (req, res) => {
    try {
        const stakeholderId = req.params.id;
        const stakeholder = await blockchainService.getStakeholder(stakeholderId);
        
        res.json({
            success: true,
            data: stakeholder
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get stakeholder',
            message: error.message
        });
    }
});

// Get all stakeholders
router.get('/', async (req, res) => {
    try {
        const stakeholderIds = await blockchainService.getAllStakeholders();
        const stakeholders = [];
        
        for (const id of stakeholderIds) {
            try {
                const stakeholder = await blockchainService.getStakeholder(id);
                stakeholders.push(stakeholder);
            } catch (err) {
                console.error(`Error fetching stakeholder ${id}:`, err);
            }
        }
        
        res.json({
            success: true,
            count: stakeholders.length,
            data: stakeholders
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get stakeholders',
            message: error.message
        });
    }
});

// Mock data for testing without blockchain
router.get('/mock/sample', (req, res) => {
    const mockStakeholders = [
        {
            id: '1',
            walletAddress: '0x123...',
            name: 'Green Valley Farm',
            contactInfo: 'farm@greenvalley.com',
            stakeholderType: 0, // Farmer
            location: 'Odisha, India',
            isActive: true
        },
        {
            id: '2',
            walletAddress: '0x456...',
            name: 'Fresh Logistics',
            contactInfo: 'info@freshlogistics.com',
            stakeholderType: 1, // Distributor
            location: 'Bhubaneswar, India',
            isActive: true
        },
        {
            id: '3',
            walletAddress: '0x789...',
            name: 'City Mart',
            contactInfo: 'contact@citymart.com',
            stakeholderType: 2, // Retailer
            location: 'Cuttack, India',
            isActive: true
        }
    ];

    res.json({
        success: true,
        count: mockStakeholders.length,
        data: mockStakeholders
    });
});

module.exports = router;
