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

    // Mock products data
    const mockProducts = [
        {
            id: '1',
            name: 'Organic Tomatoes',
            description: 'Fresh organic tomatoes from local farm',
            quantity: 100,
            pricePerUnit: 50,
            origin: 'Farm A, Maharashtra',
            currentState: 0,
            isOrganic: true,
            timestamp: Date.now()
        },
        {
            id: '2',
            name: 'Basmati Rice',
            description: 'Premium quality basmati rice',
            quantity: 500,
            pricePerUnit: 120,
            origin: 'Farm B, Punjab',
            currentState: 1,
            isOrganic: false,
            timestamp: Date.now()
        },
        {
            id: '3',
            name: 'Organic Mangoes',
            description: 'Sweet Alphonso mangoes',
            quantity: 200,
            pricePerUnit: 200,
            origin: 'Farm C, Ratnagiri',
            currentState: 2,
            isOrganic: true,
            timestamp: Date.now()
        }
    ];

    res.status(200).json({
        success: true,
        count: mockProducts.length,
        data: mockProducts
    });
}
