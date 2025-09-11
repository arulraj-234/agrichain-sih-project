const { ethers } = require("ethers");
const contractABI = require("../../abis/ProductManagement.json"); // You'll need to generate this

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS || "";
    this.isInitialized = false;
  }

  /**
   * Initialize the blockchain service
   * @param {string} rpcUrl - RPC URL for the blockchain network
   * @param {string} privateKey - Private key for transactions (optional for read-only)
   * @param {string} contractAddress - Contract address (optional, can use env var)
   */
  async initialize(rpcUrl, privateKey = null, contractAddress = null) {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Test connection
      await this.provider.getNetwork();
      console.log("✅ Connected to blockchain network");

      // Initialize signer if private key provided
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
        console.log("✅ Wallet initialized:", this.signer.address);
      }

      // Set contract address
      if (contractAddress) {
        this.contractAddress = contractAddress;
      }

      if (!this.contractAddress) {
        throw new Error("Contract address not provided");
      }

      // Initialize contract instance
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI.abi || contractABI,
        this.signer || this.provider
      );

      this.isInitialized = true;
      console.log("✅ Blockchain service initialized successfully");

      return true;
    } catch (error) {
      console.error(
        "❌ Failed to initialize blockchain service:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Check if the service is initialized
   */
  _checkInitialized() {
    if (!this.isInitialized) {
      throw new Error(
        "Blockchain service not initialized. Call initialize() first."
      );
    }
  }

  /**
   * Create a new product on the blockchain
   * @param {Object} productData - Product information
   */
  async createProduct(productData) {
    this._checkInitialized();

    try {
      const {
        id,
        name,
        description,
        farmerId,
        quantity,
        pricePerUnit,
        currentState = 0, // Default to Produced
        harvestDate,
        origin,
        isOrganic = false,
        currentHolderId,
        createdBy,
      } = productData;

      // Validate required fields
      if (!id || !name || !createdBy) {
        throw new Error("Missing required fields: id, name, or createdBy");
      }

      console.log(`📝 Creating product: ${name} (${id})`);

      const tx = await this.contract.createProduct(
        id,
        name,
        description || "",
        farmerId || "",
        quantity || 0,
        ethers.parseEther(pricePerUnit?.toString() || "0"),
        currentState,
        harvestDate || "",
        origin || "",
        isOrganic,
        currentHolderId || createdBy,
        createdBy
      );

      console.log("⏳ Transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Product created successfully");

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        productId: id,
      };
    } catch (error) {
      console.error("❌ Failed to create product:", error.message);
      throw error;
    }
  }

  /**
   * Get product details from the blockchain
   * @param {string} productId - Product ID
   */
  async getProduct(productId) {
    this._checkInitialized();

    try {
      console.log(`🔍 Fetching product: ${productId}`);

      const product = await this.contract.getProduct(productId);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        farmerId: product.farmerId,
        quantity: product.quantity ? product.quantity.toString() : "0", // BigInt → string
        pricePerUnit: product.pricePerUnit
          ? ethers.formatEther(product.pricePerUnit) // assumes price stored in wei
          : "0",
        currentState: Number(product.currentState), // enum → number
        harvestDate: product.harvestDate,
        origin: product.origin,
        isOrganic: product.isOrganic,
        currentHolderId: product.currentHolderId,
        createdBy: product.createdBy,
        createdAt: product.createdAt
          ? new Date(Number(product.createdAt) * 1000).toISOString() // BigInt → Date
          : null,
      };
    } catch (error) {
      console.error("❌ Failed to get product:", error.message);
      throw error;
    }
  }

  /**
   * Create a transaction (transfer ownership)
   * @param {string} productId - Product ID
   * @param {string} fromUserId - Current owner
   * @param {string} toUserId - New owner
   */
  async createTransaction(productId, fromUserId, toUserId) {
    this._checkInitialized();

    try {
      console.log(
        `🔄 Creating transaction: ${productId} from ${fromUserId} to ${toUserId}`
      );

      const tx = await this.contract.createTransaction(
        productId,
        fromUserId,
        toUserId
      );
      console.log("⏳ Transaction submitted:", tx.hash);

      const receipt = await tx.wait();

      // Extract transaction ID from events
      const event = receipt.events?.find(
        (e) => e.event === "TransactionCreated"
      );
      const transactionId = event?.args?.transactionId || "Unknown";

      console.log("✅ Ownership transferred successfully");

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        transactionId,
        productId,
        fromUserId,
        toUserId,
      };
    } catch (error) {
      console.error("❌ Failed to create transaction:", error.message);
      throw error;
    }
  }

  /**
   * Get all transactions for a product
   * @param {string} productId - Product ID
   */
  async getProductTransactions(productId) {
  this._checkInitialized();

  try {
    console.log(`📜 Fetching transactions for product: ${productId}`);

    // Step 1: Get transaction count
    const count = await this.contract.getProductTransactionCount(productId);

    const transactions = [];
    for (let i = 0; i < count; i++) {
      // Step 2: Fetch each transaction by index
      const tx = await this.contract.getProductTransactionByIndex(productId, i);

      transactions.push({
        transactionId: tx[0],
        fromUserId: tx[1],
        toUserId: tx[2],
        timestamp: new Date(Number(tx[3]) * 1000).toISOString(),
        previousHolderId: tx[4],
      });
    }

    return transactions;
  } catch (error) {
    console.error("❌ Failed to get product transactions:", error.message);
    throw error;
  }
}


  /**
   * Get all transactions for a user
   * @param {string} userId - User ID
   */
  async getUserTransactions(userId) {
    this._checkInitialized();

    try {
      console.log(`👤 Fetching transactions for user: ${userId}`);

      // Get transaction count first
      const count = await this.contract.getUserTransactionCount(userId);
      const transactionCount = Number(count);

      const transactions = [];

      // Fetch each transaction by index
      for (let i = 0; i < transactionCount; i++) {
        try {
          const result = await this.contract.getUserTransactionByIndex(
            userId,
            i
          );
          transactions.push({
            transactionId: result.transactionId,
            productId: result.productId,
            fromUserId: result.fromUserId,
            toUserId: result.toUserId,
            timestamp: new Date(Number(result.timestamp) * 1000).toISOString(),
            previousHolderId: result.previousHolderId,
          });
        } catch (error) {
          console.warn(
            `⚠️ Failed to fetch transaction at index ${i}:`,
            error.message
          );
        }
      }

      return transactions;
    } catch (error) {
      console.error("❌ Failed to get user transactions:", error.message);
      throw error;
    }
  }

  /**
   * Update product state
   * @param {string} productId - Product ID
   * @param {number} newState - New state (0-4: Produced, Processing, Shipped, Delivered, Sold)
   */
  async updateProductState(productId, newState) {
    this._checkInitialized();

    try {
      const stateNames = [
        "Produced",
        "Processing",
        "Shipped",
        "Delivered",
        "Sold",
      ];
      console.log(
        `🔄 Updating product ${productId} state to: ${stateNames[newState]}`
      );

      const tx = await this.contract.updateProductState(productId, newState);
      console.log("⏳ Transaction submitted:", tx.hash);

      const receipt = await tx.wait();
      console.log("✅ Product state updated successfully");

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        productId,
        newState: stateNames[newState],
      };
    } catch (error) {
      console.error("❌ Failed to update product state:", error.message);
      throw error;
    }
  }

  /**
   * Get total number of products
   */
  async getTotalProducts() {
    this._checkInitialized();

    try {
      const total = await this.contract.getTotalProducts();
      return Number(total);
    } catch (error) {
      console.error("❌ Failed to get total products:", error.message);
      throw error;
    }
  }

  /**
   * Get product ID by index
   * @param {number} index - Index
   */
  async getProductIdByIndex(index) {
    this._checkInitialized();

    try {
      return await this.contract.getProductIdByIndex(index);
    } catch (error) {
      console.error("❌ Failed to get product ID by index:", error.message);
      throw error;
    }
  }

  /**
   * Get all products (paginated)
   * @param {number} page - Page number (0-based)
   * @param {number} limit - Items per page
   */
  async getAllProducts(page = 0, limit = 10) {
    this._checkInitialized();

    try {
      const totalProducts = await this.getTotalProducts();
      const startIndex = page * limit;
      const endIndex = Math.min(startIndex + limit, totalProducts);

      console.log(
        `📋 Fetching products ${startIndex + 1}-${endIndex} of ${totalProducts}`
      );

      const products = [];
      for (let i = startIndex; i < endIndex; i++) {
        try {
          const productId = await this.getProductIdByIndex(i);
          const product = await this.getProduct(productId);
          products.push(product);
        } catch (error) {
          console.warn(
            `⚠️ Failed to fetch product at index ${i}:`,
            error.message
          );
        }
      }

      // Convert any BigInt values to strings before returning
      const serializedProducts = products.map((product) => ({
        ...product,
        quantity: product.quantity?.toString?.() || product.quantity,
        pricePerUnit:
          product.pricePerUnit?.toString?.() || product.pricePerUnit,
        currentState: Number(product.currentState),
      }));

      return {
        products: serializedProducts,
        pagination: {
          page,
          limit,
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          hasNext: endIndex < totalProducts,
          hasPrev: page > 0,
        },
      };
    } catch (error) {
      console.error("❌ Failed to get all products:", error.message);
      throw error;
    }
  }

  /**
   * Get transaction count for a product
   * @param {string} productId - Product ID
   */
  async getProductTransactionCount(productId) {
    this._checkInitialized();

    try {
      const count = await this.contract.getProductTransactionCount(productId);
      return Number(count);
    } catch (error) {
      console.error(
        "❌ Failed to get product transaction count:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Get transaction count for a user
   * @param {string} userId - User ID
   */
  async getUserTransactionCount(userId) {
    this._checkInitialized();

    try {
      const count = await this.contract.getUserTransactionCount(userId);
      return Number(count);
    } catch (error) {
      console.error("❌ Failed to get user transaction count:", error.message);
      throw error;
    }
  }

  /**
   * Listen to contract events
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  listenToEvent(eventName, callback) {
    this._checkInitialized();

    try {
      console.log(`👂 Listening to ${eventName} events`);

      this.contract.on(eventName, (...args) => {
        console.log(`🔔 ${eventName} event received:`, args);
        callback(...args);
      });
    } catch (error) {
      console.error("❌ Failed to listen to events:", error.message);
      throw error;
    }
  }

  /**
   * Stop listening to events
   * @param {string} eventName - Event name (optional, removes all if not provided)
   */
  stopListening(eventName = null) {
    this._checkInitialized();

    try {
      if (eventName) {
        this.contract.removeAllListeners(eventName);
        console.log(`🔇 Stopped listening to ${eventName} events`);
      } else {
        this.contract.removeAllListeners();
        console.log("🔇 Stopped listening to all events");
      }
    } catch (error) {
      console.error("❌ Failed to stop listening:", error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   * @param {string} address - Address to check (optional, uses signer address)
   */
  async getBalance(address = null) {
    this._checkInitialized();

    try {
      const targetAddress = address || this.signer?.address;
      if (!targetAddress) {
        throw new Error("No address provided and no signer available");
      }

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("❌ Failed to get balance:", error.message);
      throw error;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    this._checkInitialized();

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();

      return {
        name: network.name,
        chainId: Number(network.chainId),
        blockNumber,
        contractAddress: this.contractAddress,
      };
    } catch (error) {
      console.error("❌ Failed to get network info:", error.message);
      throw error;
    }
  }

  /**
   * Estimate gas for a transaction
   * @param {string} method - Contract method name
   * @param {Array} args - Method arguments
   */
  async estimateGas(method, args = []) {
    this._checkInitialized();

    try {
      const estimatedGas = await this.contract.estimateGas[method](...args);
      return {
        gasLimit: estimatedGas.toString(),
        gasLimitHex: estimatedGas.toHexString(),
      };
    } catch (error) {
      console.error("❌ Failed to estimate gas:", error.message);
      throw error;
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();

module.exports = {
  BlockchainService,
  blockchainService,
};

// Usage example:
/*
const { blockchainService } = require('./services/blockchain');

async function example() {
  // Initialize the service
  await blockchainService.initialize(
    'http://localhost:8545', // RPC URL
    'your-private-key', // Private key
    '0xYourContractAddress' // Contract address
  );

  // Create a product
  const result = await blockchainService.createProduct({
    id: 'PRODUCT001',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes from local farm',
    farmerId: 'FARMER001',
    quantity: 100,
    pricePerUnit: '0.01', // in ETH
    harvestDate: '2024-01-15',
    origin: 'Maharashtra, India',
    isOrganic: true,
    createdBy: 'USER001'
  });

  console.log('Product created:', result);

  // Get product details
  const product = await blockchainService.getProduct('PRODUCT001');
  console.log('Product details:', product);
}
*/
