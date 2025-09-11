// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductManagement {
    
    // Enum for product states
    enum ProductState { Produced, Processing, Shipped, Delivered, Sold }
    
    // Product structure
    struct Product {
        string id;
        string name;
        string description;
        string farmerId;
        uint256 quantity;
        uint256 pricePerUnit;
        ProductState currentState;
        string harvestDate;
        string origin;
        bool isOrganic;
        string currentHolderId;
        string createdBy;
        uint256 createdAt;
        bool exists;
    }
    
    // Transaction structure
    struct Transaction {
        string transactionId;
        string productId;
        string fromUserId;
        string toUserId;
        uint256 timestamp;
        string previousHolderId;
    }
    
    // Mappings
    mapping(string => Product) public products;
    mapping(string => Transaction[]) public productTransactions; // productId => transactions
    mapping(string => Transaction[]) public userTransactions; // userId => transactions
    mapping(string => bool) public productExists;
    
    // Arrays to store all product and transaction IDs
    string[] public productIds;
    uint256 public transactionCounter;
    
    // Events
    event ProductCreated(
        string indexed productId,
        string name,
        string createdBy,
        uint256 timestamp
    );
    
    event TransactionCreated(
        string indexed transactionId,
        string indexed productId,
        string fromUserId,
        string toUserId,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        string indexed productId,
        string fromUserId,
        string toUserId,
        uint256 timestamp
    );
    
    // Create a new product
    function createProduct(
        string memory _id,
        string memory _name,
        string memory _description,
        string memory _farmerId,
        uint256 _quantity,
        uint256 _pricePerUnit,
        ProductState _currentState,
        string memory _harvestDate,
        string memory _origin,
        bool _isOrganic,
        string memory _currentHolderId,
        string memory _createdBy
    ) public returns (bool) {
        // Check if product already exists
        require(!productExists[_id], "Product with this ID already exists");
        require(bytes(_id).length > 0, "Product ID cannot be empty");
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(bytes(_createdBy).length > 0, "Created by field cannot be empty");
        
        // Create the product
        products[_id] = Product({
            id: _id,
            name: _name,
            description: _description,
            farmerId: _farmerId,
            quantity: _quantity,
            pricePerUnit: _pricePerUnit,
            currentState: _currentState,
            harvestDate: _harvestDate,
            origin: _origin,
            isOrganic: _isOrganic,
            currentHolderId: _currentHolderId,
            createdBy: _createdBy,
            createdAt: block.timestamp,
            exists: true
        });
        
        // Mark product as existing and add to product list
        productExists[_id] = true;
        productIds.push(_id);
        
        emit ProductCreated(_id, _name, _createdBy, block.timestamp);
        return true;
    }
    
    // Fetch product details - Split into multiple functions to avoid stack too deep
    function getProductBasicInfo(string memory _productId) public view returns (
        string memory id,
        string memory name,
        string memory description,
        string memory farmerId,
        uint256 quantity,
        uint256 pricePerUnit,
        ProductState currentState
    ) {
        require(productExists[_productId], "Product does not exist");
        
        Product memory product = products[_productId];
        return (
            product.id,
            product.name,
            product.description,
            product.farmerId,
            product.quantity,
            product.pricePerUnit,
            product.currentState
        );
    }
    
    function getProductExtendedInfo(string memory _productId) public view returns (
        string memory harvestDate,
        string memory origin,
        bool isOrganic,
        string memory currentHolderId,
        string memory createdBy,
        uint256 createdAt
    ) {
        require(productExists[_productId], "Product does not exist");
        
        Product memory product = products[_productId];
        return (
            product.harvestDate,
            product.origin,
            product.isOrganic,
            product.currentHolderId,
            product.createdBy,
            product.createdAt
        );
    }
    
    // Get complete product info (combines both functions)
    function getProduct(string memory _productId) public view returns (
        string memory id,
        string memory name,
        string memory description,
        string memory farmerId,
        uint256 quantity,
        uint256 pricePerUnit,
        ProductState currentState,
        string memory harvestDate,
        string memory origin,
        bool isOrganic,
        string memory currentHolderId,
        string memory createdBy,
        uint256 createdAt
    ) {
        require(productExists[_productId], "Product does not exist");
        
        Product storage product = products[_productId];
        return (
            product.id,
            product.name,
            product.description,
            product.farmerId,
            product.quantity,
            product.pricePerUnit,
            product.currentState,
            product.harvestDate,
            product.origin,
            product.isOrganic,
            product.currentHolderId,
            product.createdBy,
            product.createdAt
        );
    }
    
    // Create a transaction and transfer ownership
    function createTransaction(
        string memory _productId,
        string memory _fromUserId,
        string memory _toUserId
    ) public returns (string memory) {
        require(productExists[_productId], "Product does not exist");
        require(bytes(_fromUserId).length > 0, "From user ID cannot be empty");
        require(bytes(_toUserId).length > 0, "To user ID cannot be empty");
        require(
            keccak256(abi.encodePacked(_fromUserId)) != keccak256(abi.encodePacked(_toUserId)),
            "From and to user IDs cannot be the same"
        );
        
        // Verify that fromUserId is the current holder
        require(
            keccak256(abi.encodePacked(products[_productId].currentHolderId)) == 
            keccak256(abi.encodePacked(_fromUserId)),
            "From user is not the current holder of the product"
        );
        
        // Generate transaction ID
        transactionCounter++;
        string memory transactionId = string(abi.encodePacked("TXN", uint2str(transactionCounter)));
        
        // Store previous holder ID
        string memory previousHolderId = products[_productId].currentHolderId;
        
        // Create transaction
        Transaction memory newTransaction = Transaction({
            transactionId: transactionId,
            productId: _productId,
            fromUserId: _fromUserId,
            toUserId: _toUserId,
            timestamp: block.timestamp,
            previousHolderId: previousHolderId
        });
        
        // Add transaction to mappings
        productTransactions[_productId].push(newTransaction);
        userTransactions[_fromUserId].push(newTransaction);
        userTransactions[_toUserId].push(newTransaction);
        
        // Update product ownership
        products[_productId].currentHolderId = _toUserId;
        
        emit TransactionCreated(transactionId, _productId, _fromUserId, _toUserId, block.timestamp);
        emit OwnershipTransferred(_productId, _fromUserId, _toUserId, block.timestamp);
        
        return transactionId;
    }
    
    // Get product transactions count
    function getProductTransactionCount(string memory _productId) public view returns (uint256) {
        require(productExists[_productId], "Product does not exist");
        return productTransactions[_productId].length;
    }
    
    // Get product transaction IDs only
    function getProductTransactionIds(string memory _productId) public view returns (string[] memory) {
        require(productExists[_productId], "Product does not exist");
        
        Transaction[] memory transactions = productTransactions[_productId];
        string[] memory transactionIds = new string[](transactions.length);
        
        for (uint256 i = 0; i < transactions.length; i++) {
            transactionIds[i] = transactions[i].transactionId;
        }
        
        return transactionIds;
    }
    
    // Get product transaction details by index
    function getProductTransactionByIndex(string memory _productId, uint256 _index) public view returns (
        string memory transactionId,
        string memory fromUserId,
        string memory toUserId,
        uint256 timestamp,
        string memory previousHolderId
    ) {
        require(productExists[_productId], "Product does not exist");
        require(_index < productTransactions[_productId].length, "Index out of bounds");
        
        Transaction memory transaction = productTransactions[_productId][_index];
        return (
            transaction.transactionId,
            transaction.fromUserId,
            transaction.toUserId,
            transaction.timestamp,
            transaction.previousHolderId
        );
    }
    
    // Get user transaction count
    function getUserTransactionCount(string memory _userId) public view returns (uint256) {
        return userTransactions[_userId].length;
    }
    
    // Get user transaction IDs only
    function getUserTransactionIds(string memory _userId) public view returns (string[] memory) {
        Transaction[] memory transactions = userTransactions[_userId];
        string[] memory transactionIds = new string[](transactions.length);
        
        for (uint256 i = 0; i < transactions.length; i++) {
            transactionIds[i] = transactions[i].transactionId;
        }
        
        return transactionIds;
    }
    
    // Get user transaction details by index
    function getUserTransactionByIndex(string memory _userId, uint256 _index) public view returns (
        string memory transactionId,
        string memory productId,
        string memory fromUserId,
        string memory toUserId,
        uint256 timestamp,
        string memory previousHolderId
    ) {
        require(_index < userTransactions[_userId].length, "Index out of bounds");
        
        Transaction memory transaction = userTransactions[_userId][_index];
        return (
            transaction.transactionId,
            transaction.productId,
            transaction.fromUserId,
            transaction.toUserId,
            transaction.timestamp,
            transaction.previousHolderId
        );
    }
    
    // Get total number of products
    function getTotalProducts() public view returns (uint256) {
        return productIds.length;
    }
    
    // Get product ID by index
    function getProductIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < productIds.length, "Index out of bounds");
        return productIds[_index];
    }
    
    // Update product state
    function updateProductState(string memory _productId, ProductState _newState) public returns (bool) {
        require(productExists[_productId], "Product does not exist");
        products[_productId].currentState = _newState;
        return true;
    }
    
    // Update product quantity
    function updateProductQuantity(string memory _productId, uint256 _newQuantity) public returns (bool) {
        require(productExists[_productId], "Product does not exist");
        products[_productId].quantity = _newQuantity;
        return true;
    }
    
    // Update product price
    function updateProductPrice(string memory _productId, uint256 _newPrice) public returns (bool) {
        require(productExists[_productId], "Product does not exist");
        products[_productId].pricePerUnit = _newPrice;
        return true;
    }
    
    // Check if product exists
    function doesProductExist(string memory _productId) public view returns (bool) {
        return productExists[_productId];
    }
    
    // Get current holder of a product
    function getCurrentHolder(string memory _productId) public view returns (string memory) {
        require(productExists[_productId], "Product does not exist");
        return products[_productId].currentHolderId;
    }
    
    // Utility function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
}