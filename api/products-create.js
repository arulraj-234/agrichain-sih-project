import { addProduct, getProductsCount } from './_products-store.js';

// Mock registered stakeholders for demo
const registeredStakeholders = new Set([
    'demo-farmer-1',
    'demo-farmer-2',
    'demo-user'
]);

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Extract product data from request body
    const { name, description, quantity, pricePerUnit, origin, isOrganic } = req.body;
    
    // For demo purposes, auto-register the user as a farmer
    const userId = req.headers['x-user-id'] || 'demo-user';
    registeredStakeholders.add(userId);

    // Validate required fields
    if (!name || !description || !quantity || !pricePerUnit || !origin) {
        res.status(400).json({ 
            success: false, 
            message: 'Missing required fields' 
        });
        return;
    }

    // Create mock product (in production, this would interact with blockchain)
    const newProduct = {
        id: Date.now().toString(),
        name,
        description,
        quantity: parseInt(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        origin,
        isOrganic: !!isOrganic,
        currentState: 0,
        timestamp: Date.now(),
        transactionHash: '0x' + Math.random().toString(36).substring(2, 15),
        farmerId: userId,
        farmerName: 'Demo Farmer'
    };

    // Add product to storage
    addProduct(newProduct);
    
    // Log for demo purposes
    console.log('Product created and stored:', newProduct);
    console.log('Total products in storage:', getProductsCount());

    res.status(201).json({
        success: true,
        message: 'Product created successfully! (Demo Mode - Auto-registered as Farmer)',
        data: newProduct,
        totalProducts: getProductsCount(),
        note: 'In production, you would need to be a registered stakeholder with a blockchain wallet.'
    });
}
