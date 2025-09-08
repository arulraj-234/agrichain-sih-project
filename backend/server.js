const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const stakeholderRoutes = require('./routes/stakeholders');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const qrRoutes = require('./routes/qr');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/stakeholders', stakeholderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/qr', qrRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Agricultural Supply Chain API is running',
        timestamp: new Date().toISOString()
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Agricultural Supply Chain API',
        version: '1.0.0',
        endpoints: [
            '/api/health',
            '/api/stakeholders',
            '/api/products',
            '/api/transactions',
            '/api/qr'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Agricultural Supply Chain API is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 API Documentation: http://localhost:${PORT}`);
});

module.exports = app;
