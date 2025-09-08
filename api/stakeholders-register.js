// Mock registered stakeholders database
const stakeholdersDB = new Map();

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

    // Extract stakeholder data from request body
    const { name, role, location, contact, walletAddress } = req.body;

    // Validate required fields
    if (!name || !role) {
        res.status(400).json({ 
            success: false, 
            message: 'Name and role are required' 
        });
        return;
    }

    // Create mock stakeholder (in production, this would interact with blockchain)
    const stakeholderId = Date.now().toString();
    const newStakeholder = {
        id: stakeholderId,
        name,
        role: role || 'Farmer',
        location: location || 'Not specified',
        contact: contact || 'Not provided',
        walletAddress: walletAddress || '0x' + Math.random().toString(36).substring(2, 15),
        isVerified: true,
        registrationDate: new Date().toISOString(),
        transactionHash: '0x' + Math.random().toString(36).substring(2, 15)
    };

    // Store in mock database
    stakeholdersDB.set(stakeholderId, newStakeholder);

    res.status(201).json({
        success: true,
        message: 'Stakeholder registered successfully! (Demo Mode)',
        data: newStakeholder,
        note: 'In production, this would create a blockchain transaction and require wallet verification.'
    });
}
