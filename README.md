# 🌾 Blockchain-Based Agricultural Supply Chain Transparency System

## Overview

A blockchain-based system to track agricultural produce from farm to consumer, ensuring transparency in pricing, quality, and origin. This solution allows stakeholders (farmers, distributors, retailers) to verify transactions and reduce exploitation in the supply chain.

## 🎯 Features

- **Product Tracking**: Complete traceability from farm to consumer
- **Stakeholder Management**: Registration and management of farmers, distributors, retailers, and consumers
- **Smart Contracts**: Automated, tamper-proof transaction recording
- **QR Code Integration**: Easy product tracking via QR codes
- **Transparent Pricing**: All price changes recorded on blockchain
- **Organic Certification**: Verification of organic produce claims
- **User-Friendly Interface**: Simple web interface for all stakeholders

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│                 │     │              │     │                 │
│  Frontend (Web) │────▶│  Backend API │────▶│  Blockchain     │
│   HTML/JS/CSS   │     │   (Node.js)  │     │  (Ethereum)     │
│                 │     │              │     │                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                         QR Code System
```

## 📁 Project Structure

```
blockchain-agricultural-supply-chain/
├── contracts/                  # Smart contracts
│   └── SupplyChain.sol        # Main supply chain contract
├── backend/                    # Backend API
│   ├── server.js              # Express server
│   ├── routes/                # API routes
│   │   ├── stakeholders.js    # Stakeholder endpoints
│   │   ├── products.js        # Product endpoints
│   │   ├── transactions.js    # Transaction endpoints
│   │   └── qr.js             # QR code endpoints
│   └── services/              # Business logic
│       └── blockchain.js      # Blockchain interaction
├── frontend/                   # Frontend application
│   └── public/
│       ├── index.html         # Main HTML
│       ├── styles.css         # Styling
│       └── app.js            # Application logic
├── scripts/                    # Deployment scripts
│   └── deploy.js              # Contract deployment
├── hardhat.config.js          # Hardhat configuration
└── package.json               # Project dependencies
```

## 🚀 Quick Start Guide

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository** (if using git):
```bash
cd blockchain-agricultural-supply-chain
```

2. **Install dependencies**:
```bash
# Install main project dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Start the blockchain network**:
```bash
# Terminal 1: Start Hardhat node
npx hardhat node
```

4. **Deploy smart contracts**:
```bash
# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

5. **Start the backend server**:
```bash
# Terminal 3: Start backend API
cd backend
npm start
```

6. **Start the frontend**:
```bash
# Terminal 4: Start frontend
cd frontend
npm start
```

7. **Access the application**:
Open your browser and navigate to `http://localhost:3000`

## 📱 Using the System

### For Farmers
1. Register as a stakeholder (Type: Farmer)
2. Create new products with details
3. Generate QR codes for products
4. Transfer products to distributors

### For Distributors
1. Register as a stakeholder (Type: Distributor)
2. Receive products from farmers
3. Update product status
4. Transfer to retailers

### For Retailers
1. Register as a stakeholder (Type: Retailer)
2. Receive products from distributors
3. Update pricing information
4. Sell to consumers

### For Consumers
1. Scan QR code on product
2. View complete supply chain journey
3. Verify authenticity and origin
4. Check organic certification

## 🔑 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Stakeholders
- `POST /api/stakeholders/register` - Register new stakeholder
- `GET /api/stakeholders` - Get all stakeholders
- `GET /api/stakeholders/:id` - Get specific stakeholder

### Products
- `POST /api/products/create` - Create new product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product
- `POST /api/products/:id/transfer` - Transfer product ownership

### Transactions
- `GET /api/transactions/product/:productId` - Get product transactions
- `GET /api/transactions/trace/:productId` - Get complete supply chain trace

### QR Codes
- `GET /api/qr/generate/:productId` - Generate QR code for product
- `GET /api/qr/image/:productId` - Get QR code as image

## 🔧 Configuration

### Environment Variables (backend/.env)
```env
# Blockchain Configuration
CONTRACT_ADDRESS=<deployed_contract_address>
BLOCKCHAIN_URL=http://127.0.0.1:8545
NETWORK=localhost

# API Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📊 Smart Contract Functions

### Main Functions
- `registerStakeholder()` - Register new stakeholder
- `createProduct()` - Create new product entry
- `transferProduct()` - Transfer product ownership
- `updateProductState()` - Update product status
- `getProduct()` - Retrieve product details
- `getProductTransactions()` - Get transaction history

## 🧪 Testing

### Run Smart Contract Tests
```bash
npx hardhat test
```

### Test API Endpoints
Use the mock endpoints for testing without blockchain:
- `/api/products/mock/sample` - Sample products
- `/api/stakeholders/mock/sample` - Sample stakeholders
- `/api/transactions/mock/sample/:productId` - Sample transactions

## 🚢 Deployment

### Deploy to Test Network (Sepolia)
1. Update `hardhat.config.js` with network details
2. Set private key in `.env`
3. Run: `npx hardhat run scripts/deploy.js --network sepolia`

### Deploy Frontend
1. Build: `cd frontend && npm run build`
2. Deploy to hosting service (Vercel, Netlify, etc.)

### Deploy Backend
1. Use services like Heroku, AWS, or DigitalOcean
2. Set environment variables
3. Ensure MongoDB or database connectivity if needed

## 🔒 Security Considerations

- Private keys should never be committed to version control
- Use environment variables for sensitive data
- Implement proper access controls in production
- Regular smart contract audits recommended
- Use HTTPS in production environment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Developed for the Government of Odisha, Electronics & IT Department

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## 🎯 Future Enhancements

- [ ] Mobile application for farmers
- [ ] IoT integration for automated data collection
- [ ] AI-based quality assessment
- [ ] Multi-language support
- [ ] Integration with government databases
- [ ] Advanced analytics dashboard
- [ ] Offline mode support
- [ ] SMS notifications for stakeholders

## 🙏 Acknowledgments

- Government of Odisha for the initiative
- Agricultural stakeholders for requirements
- Open source community for tools and frameworks

---

**Note**: This is an MVP (Minimum Viable Product) implementation. For production deployment, additional security measures, scalability considerations, and regulatory compliance checks should be implemented.
