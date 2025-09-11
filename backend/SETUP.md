# 🌾 Agricultural Supply Chain - Setup Guide

## Overview

This is a blockchain-based agricultural supply chain system with:
- **Smart Contract**: Product and transaction management on Ethereum
- **Backend**: Node.js API with MongoDB authentication
- **Frontend**: React/TypeScript application

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend    │────▶│   Blockchain    │
│  (React/TS)     │     │  (Node.js)   │     │  (Ethereum)     │
│  Port: 5173     │     │  Port: 3000  │     │  Port: 8545     │
└─────────────────┘     └──────────────┘     └─────────────────┘
                               │
                        ┌──────────────┐
                        │   MongoDB    │
                        │  Port: 27017 │
                        └──────────────┘
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- Git

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies  
cd backend && npm install --legacy-peer-deps && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Setup MongoDB
Make sure MongoDB is running on `mongodb://localhost:27017`

### 3. Start Services (4 terminals needed)

**Terminal 1 - Blockchain Node:**
```bash
npx hardhat node
```

**Terminal 2 - Deploy Contract:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - Backend API:**
```bash
cd backend && npm start
```

**Terminal 4 - Frontend:**
```bash
cd frontend && npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## 👤 Default Users

The system seeds with these users in development:

### Admin User
- **Email**: admin@supplychainfarming.com
- **Password**: admin123456
- **Role**: admin

### Sample Farmer
- **Email**: farmer@example.com
- **Password**: farmer123
- **Role**: farmer
- **Wallet**: 0x742d35Cc6635C0532925a3b8D0B51b4a2b7f3e3e

### Sample Distributor
- **Email**: distributor@example.com
- **Password**: distributor123
- **Role**: distributor
- **Wallet**: 0x8ba1f109551bD432803012645Hac136c9e6a3e3e

## 🔧 Configuration

### Backend Environment (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/agricultural-supply-chain
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Blockchain
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
PRIVATE_KEY=0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e
LISTEN_TO_EVENTS=true
```

## 📱 Usage

### Registration & Login
1. Visit http://localhost:5173
2. Register a new account or use default credentials
3. Choose role: farmer, distributor, retailer, consumer, admin

### For Farmers
1. Login with farmer credentials
2. Create products with details
3. Generate QR codes
4. Transfer ownership to distributors

### For Distributors/Retailers
1. Login with distributor credentials
2. Receive products from farmers
3. Update product state (Processing → Shipped → Delivered)
4. Transfer to next party in chain

### For Consumers
1. Scan QR codes or view products
2. See complete supply chain journey
3. Verify authenticity and origin

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile
- `POST /api/auth/logout` - Logout

### Products (Blockchain)
- `POST /api/products` - Create product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details

### Transactions (Blockchain)
- `POST /api/transactions` - Transfer ownership
- `GET /api/transactions/product/:id` - Get product history

## 🧪 Testing

### Test Blockchain Connection
```bash
npx hardhat console --network localhost
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "farmer@example.com", "password": "farmer123"}'
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
- Ensure MongoDB is running: `mongod --dbpath /path/to/data`
- Check connection string in backend/.env

**2. Blockchain Connection Failed** 
- Start Hardhat node: `npx hardhat node`
- Deploy contract: `npx hardhat run scripts/deploy.js --network localhost`

**3. Frontend Can't Connect to Backend**
- Check backend is running on port 3000
- Verify CORS settings in backend/server.js

**4. Contract Deployment Issues**
- Delete cache and artifacts folders
- Run `npx hardhat clean && npx hardhat compile`

**5. Authentication Issues**
- Check JWT_SECRET in .env
- Clear browser cookies/localStorage

## 🔒 Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Keep private keys secure
- Use environment variables for sensitive data

## 📊 Project Structure

```
├── contracts/              # Smart contracts
│   └── ProductManagement.sol
├── backend/                 # Node.js API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── middleware/         # Auth middleware
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   └── providers/      # Context providers
├── scripts/                # Deployment scripts
└── abis/                   # Contract ABIs
```

## 🎯 Features Implemented

✅ User authentication with MongoDB  
✅ Product management on blockchain  
✅ Ownership transfer tracking  
✅ QR code generation  
✅ Supply chain traceability  
✅ Role-based access control  
✅ Responsive UI with dark/light theme  
✅ Real-time blockchain events  

## 📝 Next Steps

- [ ] Add product state updates
- [ ] Implement batch operations
- [ ] Add product search and filters
- [ ] Mobile responsive improvements
- [ ] Email notifications
- [ ] File upload for product images
- [ ] Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

**Ready to use! 🎉** 

The system now has authentication with MongoDB, blockchain product/transaction management, and a complete React frontend.
