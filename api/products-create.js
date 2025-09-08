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
        transactionHash: '0x' + Math.random().toString(36).substring(2, 15)
    };

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
    });
}
