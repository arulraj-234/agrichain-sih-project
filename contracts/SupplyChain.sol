// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SupplyChain
 * @dev Smart contract for tracking agricultural produce from farm to consumer
 */
contract SupplyChain is Ownable {
    uint256 private _productIdCounter;
    uint256 private _stakeholderIdCounter;

    // Enums for product state and stakeholder types
    enum ProductState { 
        Produced, 
        InTransit, 
        Received, 
        Sold 
    }
    
    enum StakeholderType { 
        Farmer, 
        Distributor, 
        Retailer, 
        Consumer 
    }

    // Structures
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 farmerId;
        uint256 quantity;
        uint256 pricePerUnit;
        ProductState currentState;
        uint256 harvestDate;
        string origin;
        bool isOrganic;
        uint256 currentHolderId;
    }

    struct Stakeholder {
        uint256 id;
        address walletAddress;
        string name;
        string contactInfo;
        StakeholderType stakeholderType;
        string location;
        bool isActive;
    }

    struct Transaction {
        uint256 productId;
        uint256 fromStakeholder;
        uint256 toStakeholder;
        uint256 timestamp;
        uint256 price;
        string notes;
    }

    // State variables
    mapping(uint256 => Product) public products;
    mapping(uint256 => Stakeholder) public stakeholders;
    mapping(address => uint256) public addressToStakeholderId;
    mapping(uint256 => Transaction[]) public productTransactions;
    
    uint256[] public allProductIds;
    uint256[] public allStakeholderIds;

    // Events
    event StakeholderRegistered(uint256 indexed stakeholderId, address indexed walletAddress, StakeholderType stakeholderType);
    event ProductCreated(uint256 indexed productId, string name, uint256 farmerId);
    event ProductTransferred(uint256 indexed productId, uint256 from, uint256 to, uint256 price);
    event ProductStateChanged(uint256 indexed productId, ProductState newState);

    constructor() Ownable(msg.sender) {}

    // Modifiers
    modifier onlyRegisteredStakeholder() {
        require(addressToStakeholderId[msg.sender] != 0, "Only registered stakeholders can perform this action");
        _;
    }

    modifier onlyProductOwner(uint256 productId) {
        require(products[productId].currentHolderId == addressToStakeholderId[msg.sender], "Only current product owner can perform this action");
        _;
    }

    modifier productExists(uint256 productId) {
        require(productId > 0 && productId <= _productIdCounter, "Product does not exist");
        _;
    }

    // Stakeholder management functions
    function registerStakeholder(
        address walletAddress,
        string memory name,
        string memory contactInfo,
        StakeholderType stakeholderType,
        string memory location
    ) public onlyOwner returns (uint256) {
        require(addressToStakeholderId[walletAddress] == 0, "Address already registered");
        
        _stakeholderIdCounter++;
        uint256 stakeholderId = _stakeholderIdCounter;
        
        stakeholders[stakeholderId] = Stakeholder({
            id: stakeholderId,
            walletAddress: walletAddress,
            name: name,
            contactInfo: contactInfo,
            stakeholderType: stakeholderType,
            location: location,
            isActive: true
        });
        
        addressToStakeholderId[walletAddress] = stakeholderId;
        allStakeholderIds.push(stakeholderId);
        
        emit StakeholderRegistered(stakeholderId, walletAddress, stakeholderType);
        return stakeholderId;
    }

    // Product management functions
    function createProduct(
        string memory name,
        string memory description,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        bool isOrganic
    ) public onlyRegisteredStakeholder returns (uint256) {
        uint256 farmerId = addressToStakeholderId[msg.sender];
        require(stakeholders[farmerId].stakeholderType == StakeholderType.Farmer, "Only farmers can create products");
        
        _productIdCounter++;
        uint256 productId = _productIdCounter;
        
        products[productId] = Product({
            id: productId,
            name: name,
            description: description,
            farmerId: farmerId,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            currentState: ProductState.Produced,
            harvestDate: block.timestamp,
            origin: origin,
            isOrganic: isOrganic,
            currentHolderId: farmerId
        });
        
        allProductIds.push(productId);
        
        emit ProductCreated(productId, name, farmerId);
        return productId;
    }

    function transferProduct(
        uint256 productId,
        uint256 toStakeholderId,
        uint256 price,
        string memory notes
    ) public onlyRegisteredStakeholder onlyProductOwner(productId) productExists(productId) {
        require(stakeholders[toStakeholderId].isActive, "Target stakeholder is not active");
        
        uint256 fromStakeholderId = addressToStakeholderId[msg.sender];
        
        // Update product owner
        products[productId].currentHolderId = toStakeholderId;
        products[productId].currentState = ProductState.InTransit;
        
        // Record transaction
        productTransactions[productId].push(Transaction({
            productId: productId,
            fromStakeholder: fromStakeholderId,
            toStakeholder: toStakeholderId,
            timestamp: block.timestamp,
            price: price,
            notes: notes
        }));
        
        emit ProductTransferred(productId, fromStakeholderId, toStakeholderId, price);
    }

    function updateProductState(uint256 productId, ProductState newState) 
        public 
        onlyRegisteredStakeholder 
        onlyProductOwner(productId) 
        productExists(productId) 
    {
        products[productId].currentState = newState;
        emit ProductStateChanged(productId, newState);
    }

    // View functions
    function getProduct(uint256 productId) public view productExists(productId) returns (Product memory) {
        return products[productId];
    }

    function getStakeholder(uint256 stakeholderId) public view returns (Stakeholder memory) {
        require(stakeholderId > 0 && stakeholderId <= _stakeholderIdCounter, "Stakeholder does not exist");
        return stakeholders[stakeholderId];
    }

    function getProductTransactions(uint256 productId) public view productExists(productId) returns (Transaction[] memory) {
        return productTransactions[productId];
    }

    function getAllProducts() public view returns (uint256[] memory) {
        return allProductIds;
    }

    function getAllStakeholders() public view returns (uint256[] memory) {
        return allStakeholderIds;
    }

    function getMyStakeholderId() public view returns (uint256) {
        return addressToStakeholderId[msg.sender];
    }

    function getTotalProducts() public view returns (uint256) {
        return _productIdCounter;
    }

    function getTotalStakeholders() public view returns (uint256) {
        return _stakeholderIdCounter;
    }
}
