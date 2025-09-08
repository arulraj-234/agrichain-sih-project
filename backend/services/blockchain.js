const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.contract = null;
        this.signer = null;
        this.contractAddress = process.env.CONTRACT_ADDRESS || null;
        this.init();
    }

    async init() {
        try {
            // Connect to local Hardhat network
            this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL || 'http://127.0.0.1:8545');
            
            // Load contract ABI
            const contractPath = path.join(__dirname, '../../artifacts/contracts/SupplyChain.sol/SupplyChain.json');
            if (fs.existsSync(contractPath)) {
                const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                this.contractABI = contractJson.abi;
            }

            // Setup signer (for development, use the first account)
            const accounts = await this.provider.listAccounts();
            if (accounts && accounts.length > 0) {
                this.signer = await this.provider.getSigner(0);
            }

            // Initialize contract if address is available
            if (this.contractAddress && this.contractABI) {
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer || this.provider);
            }
        } catch (error) {
            console.error('Error initializing blockchain service:', error);
        }
    }

    async deployContract() {
        try {
            if (!this.contractABI) {
                throw new Error('Contract ABI not loaded');
            }

            const contractFactory = new ethers.ContractFactory(
                this.contractABI,
                this.contractBytecode,
                this.signer
            );

            const contract = await contractFactory.deploy();
            await contract.waitForDeployment();
            
            this.contractAddress = await contract.getAddress();
            this.contract = contract;
            
            return this.contractAddress;
        } catch (error) {
            console.error('Error deploying contract:', error);
            throw error;
        }
    }

    setContractAddress(address) {
        this.contractAddress = address;
        if (this.contractABI && (this.signer || this.provider)) {
            this.contract = new ethers.Contract(address, this.contractABI, this.signer || this.provider);
        }
    }

    // Stakeholder management
    async registerStakeholder(walletAddress, name, contactInfo, stakeholderType, location) {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const tx = await this.contract.registerStakeholder(
                walletAddress,
                name,
                contactInfo,
                stakeholderType,
                location
            );
            
            const receipt = await tx.wait();
            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('Error registering stakeholder:', error);
            throw error;
        }
    }

    async getStakeholder(stakeholderId) {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const stakeholder = await this.contract.getStakeholder(stakeholderId);
            return {
                id: stakeholder.id.toString(),
                walletAddress: stakeholder.walletAddress,
                name: stakeholder.name,
                contactInfo: stakeholder.contactInfo,
                stakeholderType: stakeholder.stakeholderType,
                location: stakeholder.location,
                isActive: stakeholder.isActive
            };
        } catch (error) {
            console.error('Error getting stakeholder:', error);
            throw error;
        }
    }

    // Product management
    async createProduct(name, description, quantity, pricePerUnit, origin, isOrganic) {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const tx = await this.contract.createProduct(
                name,
                description,
                quantity,
                pricePerUnit,
                origin,
                isOrganic
            );
            
            const receipt = await tx.wait();
            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async getProduct(productId) {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const product = await this.contract.getProduct(productId);
            return {
                id: product.id.toString(),
                name: product.name,
                description: product.description,
                farmerId: product.farmerId.toString(),
                quantity: product.quantity.toString(),
                pricePerUnit: product.pricePerUnit.toString(),
                currentState: product.currentState,
                harvestDate: product.harvestDate.toString(),
                origin: product.origin,
                isOrganic: product.isOrganic,
                currentHolderId: product.currentHolderId.toString()
            };
        } catch (error) {
            console.error('Error getting product:', error);
            throw error;
        }
    }

    async transferProduct(productId, toStakeholderId, price, notes) {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const tx = await this.contract.transferProduct(
                productId,
                toStakeholderId,
                price,
                notes
            );
            
            const receipt = await tx.wait();
            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('Error transferring product:', error);
            throw error;
        }
    }

    async getProductTransactions(productId) {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const transactions = await this.contract.getProductTransactions(productId);
            return transactions.map(tx => ({
                productId: tx.productId.toString(),
                fromStakeholder: tx.fromStakeholder.toString(),
                toStakeholder: tx.toStakeholder.toString(),
                timestamp: tx.timestamp.toString(),
                price: tx.price.toString(),
                notes: tx.notes
            }));
        } catch (error) {
            console.error('Error getting product transactions:', error);
            throw error;
        }
    }

    async getAllProducts() {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const productIds = await this.contract.getAllProducts();
            return productIds.map(id => id.toString());
        } catch (error) {
            console.error('Error getting all products:', error);
            throw error;
        }
    }

    async getAllStakeholders() {
        try {
            if (!this.contract) throw new Error('Contract not initialized');
            
            const stakeholderIds = await this.contract.getAllStakeholders();
            return stakeholderIds.map(id => id.toString());
        } catch (error) {
            console.error('Error getting all stakeholders:', error);
            throw error;
        }
    }
}

module.exports = new BlockchainService();
