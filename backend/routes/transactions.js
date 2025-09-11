const express = require('express');
const router = express.Router();
const { blockchainService } = require('../services/blockchain');

// Middleware for validation
const validateTransactionData = (req, res, next) => {
  const { productId, fromUserId, toUserId } = req.body;
  
  if (!productId || !fromUserId || !toUserId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: productId, fromUserId, and toUserId are required'
    });
  }
  
  if (fromUserId === toUserId) {
    return res.status(400).json({
      success: false,
      message: 'fromUserId and toUserId cannot be the same'
    });
  }
  
  next();
};

const validateUserId = (req, res, next) => {
  const { userId } = req.params;
  
  if (!userId || userId.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }
  
  next();
};

/**
 * @route POST /api/transactions
 * @desc Create a new transaction (transfer ownership)
 * @access Public (add authentication middleware as needed)
 */
router.post('/', validateTransactionData, async (req, res) => {
  try {
    const { productId, fromUserId, toUserId } = req.body;
    
    console.log(`🔄 Creating transaction: ${productId} from ${fromUserId} to ${toUserId}`);
    
    const result = await blockchainService.createTransaction(
      productId,
      fromUserId,
      toUserId
    );
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error creating transaction:', error.message);
    
    // Handle specific blockchain errors
    if (error.message.includes('Product does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (error.message.includes('not the current holder')) {
      return res.status(403).json({
        success: false,
        message: 'From user is not the current holder of the product'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
});

/**
 * @route GET /api/transactions/user/:userId
 * @desc Get all transactions for a specific user
 * @access Public
 */
router.get('/user/:userId', validateUserId, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    
    console.log(`👤 Fetching transactions for user: ${userId}`);
    
    const allTransactions = await blockchainService.getUserTransactions(userId);
    
    // Apply pagination
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        page,
        limit,
        total: allTransactions.length,
        totalPages: Math.ceil(allTransactions.length / limit),
        hasNext: endIndex < allTransactions.length,
        hasPrev: page > 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user transactions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user transactions',
      error: error.message
    });
  }
});

/**
 * @route GET /api/transactions/user/:userId/count
 * @desc Get transaction count for a user
 * @access Public
 */
router.get('/user/:userId/count', validateUserId, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = await blockchainService.getUserTransactionCount(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        transactionCount: count
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user transaction count:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user transaction count',
      error: error.message
    });
  }
});

/**
 * @route GET /api/transactions/user/:userId/sent
 * @desc Get transactions sent by a user (where user is the sender)
 * @access Public
 */
router.get('/user/:userId/sent', validateUserId, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📤 Fetching sent transactions for user: ${userId}`);
    
    const allTransactions = await blockchainService.getUserTransactions(userId);
    const sentTransactions = allTransactions.filter(tx => tx.fromUserId === userId);
    
    res.json({
      success: true,
      data: sentTransactions,
      count: sentTransactions.length
    });

  } catch (error) {
    console.error('❌ Error fetching sent transactions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sent transactions',
      error: error.message
    });
  }
});

/**
 * @route GET /api/transactions/user/:userId/received
 * @desc Get transactions received by a user (where user is the receiver)
 * @access Public
 */
router.get('/user/:userId/received', validateUserId, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📥 Fetching received transactions for user: ${userId}`);
    
    const allTransactions = await blockchainService.getUserTransactions(userId);
    const receivedTransactions = allTransactions.filter(tx => tx.toUserId === userId);
    
    res.json({
      success: true,
      data: receivedTransactions,
      count: receivedTransactions.length
    });

  } catch (error) {
    console.error('❌ Error fetching received transactions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch received transactions',
      error: error.message
    });
  }
});

/**
 * @route GET /api/transactions/product/:productId
 * @desc Get all transactions for a specific product (ownership history)
 * @access Public
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId || productId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    console.log(`📜 Fetching ownership history for product: ${productId}`);
    
    const transactions = await blockchainService.getProductTransactions(productId);
    
    // Sort by timestamp (most recent first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
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
 * @route GET /api/transactions/product/:productId/chain
 * @desc Get ownership chain for a product (formatted for easy tracking)
 * @access Public
 */
router.get('/product/:productId/chain', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId || productId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    console.log(`🔗 Fetching ownership chain for product: ${productId}`);
    
    // Get product details to know initial owner
    const product = await blockchainService.getProduct(productId);
    const transactions = await blockchainService.getProductTransactions(productId);
    
    // Sort transactions by timestamp (oldest first)
    transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Build ownership chain
    const ownershipChain = [];
    
    // Add initial owner (creator)
    ownershipChain.push({
      step: 0,
      owner: product.createdBy,
      action: 'Created',
      timestamp: product.createdAt,
      transactionId: null
    });
    
    // Add each transaction as a step in the chain
    transactions.forEach((tx, index) => {
      ownershipChain.push({
        step: index + 1,
        owner: tx.toUserId,
        previousOwner: tx.fromUserId,
        action: 'Transferred',
        timestamp: tx.timestamp,
        transactionId: tx.transactionId
      });
    });
    
    res.json({
      success: true,
      data: {
        productId,
        currentOwner: product.currentHolderId,
        totalSteps: ownershipChain.length,
        ownershipChain
      }
    });

  } catch (error) {
    console.error('❌ Error fetching ownership chain:', error.message);
    
    if (error.message.includes('Product does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ownership chain',
      error: error.message
    });
  }
});

/**
 * @route GET /api/transactions/stats/overview
 * @desc Get transaction statistics overview
 * @access Public
 */
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('📊 Fetching transaction statistics');
    
    // This is a basic implementation - in production, you might want to cache this data
    const totalProducts = await blockchainService.getTotalProducts();
    let totalTransactions = 0;
    let activeProducts = 0; // Products with at least one transaction
    
    const timeRanges = {
      last24h: 0,
      last7days: 0,
      last30days: 0
    };
    
    const now = new Date();
    const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Sample a subset of products to get statistics (for performance)
    const sampleSize = Math.min(totalProducts, 50);
    
    for (let i = 0; i < sampleSize; i++) {
      try {
        const productId = await blockchainService.getProductIdByIndex(i);
        const transactions = await blockchainService.getProductTransactions(productId);
        
        if (transactions.length > 0) {
          activeProducts++;
          totalTransactions += transactions.length;
          
          // Count transactions by time range
          transactions.forEach(tx => {
            const txDate = new Date(tx.timestamp);
            if (txDate >= day24h) timeRanges.last24h++;
            if (txDate >= day7) timeRanges.last7days++;
            if (txDate >= day30) timeRanges.last30days++;
          });
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch transactions for product at index ${i}`);
      }
    }
    
    // Extrapolate to full dataset
    const extrapolationFactor = totalProducts / sampleSize;
    
    const stats = {
      totalProducts,
      activeProducts: Math.round(activeProducts * extrapolationFactor),
      totalTransactions: Math.round(totalTransactions * extrapolationFactor),
      averageTransactionsPerProduct: totalProducts > 0 ? 
        (totalTransactions / sampleSize).toFixed(2) : 0,
      transactionsByTimeRange: {
        last24hours: Math.round(timeRanges.last24h * extrapolationFactor),
        last7days: Math.round(timeRanges.last7days * extrapolationFactor),
        last30days: Math.round(timeRanges.last30days * extrapolationFactor)
      },
      sampleSize,
      note: sampleSize < totalProducts ? 
        `Statistics based on sample of ${sampleSize} products` : 
        'Statistics based on all products'
    };
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching transaction statistics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
});

/**
 * @route POST /api/transactions/batch
 * @desc Create multiple transactions in batch
 * @access Public
 */
router.post('/batch', async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transactions array is required and must not be empty'
      });
    }
    
    if (transactions.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 transactions allowed per batch'
      });
    }
    
    console.log(`📦 Creating batch of ${transactions.length} transactions`);
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < transactions.length; i++) {
      const { productId, fromUserId, toUserId } = transactions[i];
      
      // Validate each transaction
      if (!productId || !fromUserId || !toUserId) {
        errors.push({
          index: i,
          error: 'Missing required fields: productId, fromUserId, toUserId'
        });
        continue;
      }
      
      if (fromUserId === toUserId) {
        errors.push({
          index: i,
          error: 'fromUserId and toUserId cannot be the same'
        });
        continue;
      }
      
      try {
        const result = await blockchainService.createTransaction(
          productId,
          fromUserId,
          toUserId
        );
        
        results.push({
          index: i,
          success: true,
          data: result
        });
        
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }
    
    res.status(errors.length === transactions.length ? 400 : 201).json({
      success: results.length > 0,
      message: `Processed ${transactions.length} transactions: ${results.length} successful, ${errors.length} failed`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: transactions.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating batch transactions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch transactions',
      error: error.message
    });
  }
});

/**
 * @route GET /api/transactions/recent
 * @desc Get recent transactions across all products
 * @access Public
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    console.log(`🕐 Fetching ${limit} most recent transactions`);
    
    // This is a basic implementation - in production, you'd want to optimize this
    const totalProducts = await blockchainService.getTotalProducts();
    const sampleSize = Math.min(totalProducts, 100);
    
    let allTransactions = [];
    
    for (let i = 0; i < sampleSize; i++) {
      try {
        const productId = await blockchainService.getProductIdByIndex(i);
        const transactions = await blockchainService.getProductTransactions(productId);
        allTransactions = allTransactions.concat(transactions);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch transactions for product at index ${i}`);
      }
    }
    
    // Sort by timestamp (most recent first) and limit
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentTransactions = allTransactions.slice(0, limit);
    
    res.json({
      success: true,
      data: recentTransactions,
      count: recentTransactions.length,
      note: sampleSize < totalProducts ? 
        `Recent transactions from sample of ${sampleSize} products` : 
        'Recent transactions from all products'
    });

  } catch (error) {
    console.error('❌ Error fetching recent transactions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent transactions',
      error: error.message
    });
  }
});

/**
 * @route POST /api/transactions/validate
 * @desc Validate if a transaction can be created (without actually creating it)
 * @access Public
 */
router.post('/validate', validateTransactionData, async (req, res) => {
  try {
    const { productId, fromUserId, toUserId } = req.body;
    
    console.log(`🔍 Validating transaction: ${productId} from ${fromUserId} to ${toUserId}`);
    
    // Check if product exists and get its details
    const product = await blockchainService.getProduct(productId);
    
    // Validation checks
    const validationResults = {
      productExists: true,
      isCurrentHolder: product.currentHolderId === fromUserId,
      differentUsers: fromUserId !== toUserId,
      validUserIds: fromUserId.trim() !== '' && toUserId.trim() !== ''
    };
    
    const isValid = Object.values(validationResults).every(result => result === true);
    
    let message = 'Transaction validation passed';
    if (!isValid) {
      const issues = [];
      if (!validationResults.isCurrentHolder) {
        issues.push('fromUserId is not the current holder of the product');
      }
      if (!validationResults.differentUsers) {
        issues.push('fromUserId and toUserId cannot be the same');
      }
      if (!validationResults.validUserIds) {
        issues.push('User IDs cannot be empty');
      }
      message = `Transaction validation failed: ${issues.join(', ')}`;
    }
    
    res.json({
      success: isValid,
      message,
      data: {
        canCreateTransaction: isValid,
        productId,
        currentHolder: product.currentHolderId,
        validationResults
      }
    });

  } catch (error) {
    console.error('❌ Error validating transaction:', error.message);
    
    if (error.message.includes('Product does not exist')) {
      return res.json({
        success: false,
        message: 'Transaction validation failed: Product does not exist',
        data: {
          canCreateTransaction: false,
          validationResults: {
            productExists: false,
            isCurrentHolder: false,
            differentUsers: true,
            validUserIds: true
          }
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to validate transaction',
      error: error.message
    });
  }
});

module.exports = router;