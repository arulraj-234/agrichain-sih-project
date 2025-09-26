const express = require('express');
const router = express.Router();
const { blockchainService } = require('../services/blockchain');
const { protect, optionalProtect } = require('../middleware/auth');

// Middleware for validation
const validateProductData = (req, res, next) => {
  const { id, name, createdBy } = req.body;
  
  if (!id || !name || !createdBy) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: id, name, and createdBy are required'
    });
  }
  
  next();
};

const validateProductId = (req, res, next) => {
  const { productId } = req.params;
  
  if (!productId || productId.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }
  
  next();
};

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Public (you can add authentication middleware later)
 */
router.post('/', validateProductData, async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      farmerId,
      quantity,
      pricePerUnit,
      currentState,
      harvestDate,
      origin,
      isOrganic,
      currentHolderId,
      createdBy
    } = req.body;

    console.log(`📝 Creating product: ${name} (${id})`);

    const result = await blockchainService.createProduct({
      id,
      name,
      description,
      farmerId,
      quantity: parseInt(quantity) || 0,
      pricePerUnit: parseFloat(pricePerUnit) || 0,
      currentState: parseInt(currentState) || 0,
      harvestDate,
      origin,
      isOrganic: Boolean(isOrganic),
      currentHolderId,
      createdBy
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    
    // Handle specific blockchain errors
    if (error.message.includes('Product with this ID already exists')) {
      return res.status(409).json({
        success: false,
        message: 'Product with this ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

/**
 * @route GET /api/products/my
 * @desc Get current user's products with pagination
 * @access Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user._id.toString();
    
    // Validate pagination parameters
    if (page < 0 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 0, limit must be 1-100'
      });
    }
    
    console.log(`📋 Fetching products for user ${userId} - Page: ${page}, Limit: ${limit}`);
    
    // Get all products and filter by user
    const allProductsResult = await blockchainService.getAllProducts(0, 1000); // Get larger batch
    const userProducts = allProductsResult.products.filter(product => 
      product.createdBy === userId || product.farmerId === userId || product.currentHolderId === userId
    );
    
    // Apply pagination to filtered results
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = userProducts.slice(startIndex, endIndex);
    
    const pagination = {
      page,
      limit,
      total: userProducts.length,
      totalPages: Math.ceil(userProducts.length / limit),
      hasNext: endIndex < userProducts.length,
      hasPrev: page > 0
    };
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user products:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user products',
      error: error.message
    });
  }
});

/**
 * @route GET /api/products/:productId
 * @desc Get product details by ID
 * @access Public
 */
router.get('/:productId', validateProductId, async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log(`🔍 Fetching product: ${productId}`);
    
    const product = await blockchainService.getProduct(productId);
    
    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('❌ Error fetching product:', error.message);
    
    if (error.message.includes('Product does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});


/**
 * @route GET /api/products
 * @desc Get all products with pagination (public view)
 * @access Public
 */
router.get('/', optionalProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate pagination parameters
    if (page < 0 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 0, limit must be 1-100'
      });
    }
    
    // If user is authenticated and requests their products, redirect to /my endpoint
    if (req.user && req.query.userOnly === 'true') {
      return res.redirect(`/api/products/my?page=${page}&limit=${limit}`);
    }
    
    console.log(`📋 Fetching all products - Page: ${page}, Limit: ${limit}`);
    
    const result = await blockchainService.getAllProducts(page, limit);
    
    res.json({
      success: true,
      data: {
        products: result.products,
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/products/:productId/state
 * @desc Update product state
 * @access Public
 */
router.put('/:productId/state', validateProductId, async (req, res) => {
  try {
    const { productId } = req.params;
    const { state, newState } = req.body;
    
    // Accept either 'state' or 'newState' parameter for compatibility
    const stateValue = newState !== undefined ? newState : state;
    
    // Validate state
    if (stateValue === undefined || stateValue === null) {
      return res.status(400).json({
        success: false,
        message: 'State or newState is required'
      });
    }
    
    const stateNum = parseInt(stateValue);
    if (isNaN(stateNum) || stateNum < 0 || stateNum > 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state. Must be 0-4 (Produced, Processing, Shipped, Delivered, Sold)'
      });
    }
    
    console.log(`🔄 Updating product ${productId} state to: ${stateNum}`);
    
    const result = await blockchainService.updateProductState(productId, stateNum);
    
    res.json({
      success: true,
      message: 'Product state updated successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error updating product state:', error.message);
    
    if (error.message.includes('Product does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update product state',
      error: error.message
    });
  }
});

/**
 * @route GET /api/products/:productId/transactions
 * @desc Get all transactions for a specific product
 * @access Public
 */
router.get('/:productId/transactions', validateProductId, async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log(`📜 Fetching transactions for product: ${productId}`);
    
    const transactions = await blockchainService.getProductTransactions(productId);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });

  } catch (error) {
    console.error('❌ Error fetching product transactions:', error.message);
    
    if (error.message.includes('Product does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product transactions',
      error: error.message
    });
  }
});

/**
 * @route GET /api/products/:productId/transaction-count
 * @desc Get transaction count for a product
 * @access Public
 */
router.get('/:productId/transaction-count', validateProductId, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const count = await blockchainService.getProductTransactionCount(productId);
    
    res.json({
      success: true,
      data: {
        productId,
        transactionCount: count
      }
    });

  } catch (error) {
    console.error('❌ Error fetching product transaction count:', error.message);
    
    if (error.message.includes('Product does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product transaction count',
      error: error.message
    });
  }
});

/**
 * @route GET /api/products/stats/overview
 * @desc Get product statistics overview
 * @access Public
 */
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('📊 Fetching product statistics');
    
    const totalProducts = await blockchainService.getTotalProducts();
    
    // Get sample of products to analyze states
    const sampleSize = Math.min(totalProducts, 100);
    const stateCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let organicCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      try {
        const productId = await blockchainService.getProductIdByIndex(i);
        const product = await blockchainService.getProduct(productId);
        stateCount[product.currentState] = (stateCount[product.currentState] || 0) + 1;
        if (product.isOrganic) organicCount++;
      } catch (error) {
        console.warn(`⚠️ Failed to fetch product at index ${i}`);
      }
    }
    
    const stats = {
      totalProducts,
      productStates: {
        produced: stateCount[0] || 0,
        processing: stateCount[1] || 0,
        shipped: stateCount[2] || 0,
        delivered: stateCount[3] || 0,
        sold: stateCount[4] || 0
      },
      organicProducts: organicCount,
      sampleSize: sampleSize
    };
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching product statistics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message
    });
  }
});

/**
 * @route POST /api/products/search
 * @desc Search products by various criteria
 * @access Public
 */
router.post('/search', async (req, res) => {
  try {
    const { 
      farmerId, 
      origin, 
      isOrganic, 
      currentState, 
      page = 0, 
      limit = 10 
    } = req.body;
    
    console.log('🔍 Searching products with filters');
    
    // Get all products (this is a basic implementation - in production, you'd want to optimize this)
    const allProductsResult = await blockchainService.getAllProducts(0, 1000);
    let filteredProducts = allProductsResult.products;
    
    // Apply filters
    if (farmerId) {
      filteredProducts = filteredProducts.filter(p => 
        p.farmerId.toLowerCase().includes(farmerId.toLowerCase())
      );
    }
    
    if (origin) {
      filteredProducts = filteredProducts.filter(p => 
        p.origin.toLowerCase().includes(origin.toLowerCase())
      );
    }
    
    if (isOrganic !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isOrganic === Boolean(isOrganic));
    }
    
    if (currentState !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.currentState === parseInt(currentState));
    }
    
    // Apply pagination
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
        hasNext: endIndex < filteredProducts.length,
        hasPrev: page > 0
      }
    });

  } catch (error) {
    console.error('❌ Error searching products:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
});

module.exports = router;