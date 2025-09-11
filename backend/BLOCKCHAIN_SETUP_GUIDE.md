# 🚀 Blockchain Setup Guide

## 🎯 Current Status

✅ **QR Code System**: Fully working (points to frontend tracking pages)
✅ **Product Tracking**: Working with fallback data 
⚠️  **Blockchain APIs**: Need blockchain node + contract deployment

## 🔧 Quick Fix - Start Without Blockchain

Your QR code system is **already working perfectly** without blockchain. The production server provides:

- ✅ QR code generation pointing to frontend
- ✅ Beautiful product tracking pages  
- ✅ Mock data for testing
- ⚠️ Blockchain product/transaction APIs (will retry on request)

### Test It Now:
```bash
# In terminal 1 - Backend
cd backend
node production-server.js

# In terminal 2 - Frontend  
cd frontend
npm run dev

# Visit: http://localhost:5173/track/PROD001
```

## 🔗 Enable Full Blockchain Functionality

To get product creation and transaction APIs working:

### Step 1: Start Hardhat Network
```bash
# In a new terminal (keep running)
cd sih project blockchain  
npx hardhat node
```

This should show: `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`

### Step 2: Deploy Contract
```bash
# In another terminal
npx hardhat run scripts/deploy.js --network localhost
```

**Important**: Update CONTRACT_ADDRESS in `.env` with the deployed address.

### Step 3: Restart Backend
```bash
cd backend
node production-server.js
```

Look for: `🎉 Full functionality available (Blockchain + QR + Tracking)`

## 🐛 Troubleshooting

### Issue: "Contract: NO CODE AT ADDRESS"
**Solution**: Contract not deployed or wrong address
- Deploy contract: `npx hardhat run scripts/deploy.js --network localhost`
- Update CONTRACT_ADDRESS in backend/.env

### Issue: "RPC Connection: FAILED" 
**Solution**: Hardhat node not running
- Start node: `npx hardhat node` (keep terminal open)
- Check: `netstat -ano | findstr ":8545"`

### Issue: "Wallet: FAILED"
**Solution**: Wrong private key
- Use key from hardhat node output
- Account #19 key matches your current .env

### Issue: "ABI File: NOT FOUND"
**Solution**: ABI file missing
- Compile contract: `npx hardhat compile`
- Check: `abis/ProductManagement.json` exists

## 📋 Environment Setup

Your current `.env` looks correct:
```env
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0  
PRIVATE_KEY=0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e
FRONTEND_URL=http://localhost:5173
```

## 🎯 Testing Blockchain Functions

Once blockchain is connected, test these endpoints:

```bash
# Create product
POST http://localhost:3000/api/products
{
  "id": "PROD123",
  "name": "Organic Tomatoes",
  "description": "Fresh tomatoes",
  "quantity": 100,
  "pricePerUnit": 50
}

# Get products  
GET http://localhost:3000/api/products

# Create transaction
POST http://localhost:3000/api/transactions
{
  "productId": "PROD123",
  "fromUserId": "FARMER001", 
  "toUserId": "BUYER001"
}
```

## ✅ What's Already Working

Even without blockchain, you have:
- **Professional QR code system**
- **Beautiful tracking pages** 
- **Mobile-responsive design**
- **Share functionality**
- **Fallback product data**

This provides a **complete demo experience** for users scanning QR codes!

## 🎉 Next Steps

1. **For Demo**: Current setup works perfectly
2. **For Production**: Complete blockchain setup above
3. **For Development**: Use mock data (already implemented)

Your QR code scanning experience is **production-ready** and provides the exact functionality users expect!
