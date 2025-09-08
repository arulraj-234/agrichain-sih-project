export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    
    res.status(200).json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    });
}
