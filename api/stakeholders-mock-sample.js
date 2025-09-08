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

    // Mock stakeholders data
    const mockStakeholders = [
        {
            id: '1',
            name: 'John Farmer',
            role: 'Farmer',
            location: 'Maharashtra',
            contact: '+91-9876543210',
            isVerified: true,
            address: '0x1234...5678'
        },
        {
            id: '2',
            name: 'ABC Distributors',
            role: 'Distributor',
            location: 'Mumbai',
            contact: '+91-9876543211',
            isVerified: true,
            address: '0x2345...6789'
        },
        {
            id: '3',
            name: 'Fresh Mart',
            role: 'Retailer',
            location: 'Delhi',
            contact: '+91-9876543212',
            isVerified: false,
            address: '0x3456...7890'
        },
        {
            id: '4',
            name: 'Quality Check Labs',
            role: 'Quality Inspector',
            location: 'Pune',
            contact: '+91-9876543213',
            isVerified: true,
            address: '0x4567...8901'
        }
    ];

    res.status(200).json({
        success: true,
        count: mockStakeholders.length,
        data: mockStakeholders
    });
}
