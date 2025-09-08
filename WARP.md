# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a blockchain-based agricultural supply chain transparency system built on Ethereum. It tracks agricultural produce from farm to consumer, ensuring transparency in pricing, quality, and origin through smart contracts.

## Essential Commands

### Initial Setup (Run Once)
```bash
# Install all dependencies (root, backend, and frontend)
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

### Development Workflow (Requires 4 Terminals)

**Terminal 1 - Blockchain Node:**
```bash
npx hardhat node
```

**Terminal 2 - Deploy Smart Contracts:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - Backend API:**
```bash
cd backend && npm start
# Or for development with auto-reload:
cd backend && npm run dev
```

**Terminal 4 - Frontend:**
```bash
cd frontend && npm start
```

### Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Run tests (when tests are created)
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to test network (requires configuration)
npx hardhat run scripts/deploy.js --network sepolia

# Console interaction
npx hardhat console --network localhost
```

### Quick Development Commands

```bash
# Run both backend and frontend concurrently (from root)
npm run dev

# Backend only with auto-reload
cd backend && npm run dev

# Frontend only
cd frontend && npm start
```

## Architecture Overview

### Three-Layer Architecture

1. **Blockchain Layer (Ethereum)**
   - Smart contract: `contracts/SupplyChain.sol`
   - Manages stakeholders, products, and transactions
   - Provides immutable record of supply chain events
   - Uses OpenZeppelin for security patterns

2. **Backend API Layer (Node.js/Express)**
   - Entry point: `backend/server.js`
   - Blockchain service: `backend/services/blockchain.js` - Interfaces with smart contracts using ethers.js
   - Routes organized by domain:
     - `backend/routes/stakeholders.js` - Stakeholder registration and management
     - `backend/routes/products.js` - Product lifecycle management
     - `backend/routes/transactions.js` - Transaction history and tracing
     - `backend/routes/qr.js` - QR code generation for product tracking

3. **Frontend Layer (Vanilla JS)**
   - Single-page application: `frontend/public/index.html`
   - Application logic: `frontend/public/app.js`
   - Styles: `frontend/public/styles.css`
   - Served using `serve` package on port 3000

### Smart Contract Design

The `SupplyChain.sol` contract implements:
- **Stakeholder Types**: Farmer, Distributor, Retailer, Consumer
- **Product States**: Produced, InTransit, Received, Sold
- **Core Functions**:
  - `registerStakeholder()` - Admin-only stakeholder registration
  - `createProduct()` - Farmers create new products
  - `transferProduct()` - Transfer ownership between stakeholders
  - `updateProductState()` - Update product status
  - Product tracking via mappings and transaction history

### Deployment Process

The `scripts/deploy.js` script:
1. Deploys the SupplyChain contract
2. Saves contract address to `deployment.json`
3. Auto-generates `backend/.env` with contract address
4. Optionally registers sample stakeholders (farmer, distributor, retailer)

### Blockchain Service Layer

`backend/services/blockchain.js` provides:
- Automatic connection to local Hardhat node
- Contract ABI loading from artifacts
- High-level methods wrapping contract functions
- Error handling and transaction receipt management
- Uses ethers.js v6 for blockchain interaction

## Configuration Files

### Root Configuration
- `hardhat.config.js` - Hardhat settings for Solidity 0.8.19, networks, and paths
- `package.json` - Root orchestration scripts and Hardhat dependencies

### Backend Configuration
- `backend/.env` (auto-generated on deploy):
  ```
  CONTRACT_ADDRESS=<deployed_address>
  BLOCKCHAIN_URL=http://127.0.0.1:8545
  NETWORK=localhost
  PORT=3001
  FRONTEND_URL=http://localhost:3000
  ```

### Network Configuration
- **Local**: Hardhat node on http://127.0.0.1:8545 (chainId: 1337)
- **Test Networks**: Configured but require private keys in .env

## API Endpoints Structure

All API routes are prefixed with `/api/`:
- Health: `/api/health`
- Stakeholders: `/api/stakeholders/*`
- Products: `/api/products/*`
- Transactions: `/api/transactions/*`
- QR Codes: `/api/qr/*`

Mock endpoints available for testing without blockchain:
- `/api/products/mock/sample`
- `/api/stakeholders/mock/sample`
- `/api/transactions/mock/sample/:productId`

## Development Tips

1. **Contract Changes**: After modifying `SupplyChain.sol`, run `npx hardhat compile` before redeploying
2. **Fresh Start**: Delete `artifacts/` and `cache/` folders if facing compilation issues
3. **Backend Auto-Configuration**: The deploy script auto-generates `backend/.env` with the contract address
4. **Port Conflicts**: Backend runs on 3001, Frontend on 3000, Hardhat node on 8545
5. **Transaction Failures**: Check if stakeholder is registered and has correct permissions
6. **QR Code Generation**: Handled server-side using the `qrcode` npm package

## Common Issues and Solutions

- **Contract not initialized**: Ensure deploy script has run and `backend/.env` contains CONTRACT_ADDRESS
- **Only registered stakeholders error**: Address must be registered via `registerStakeholder()` before performing actions
- **Connection refused on 8545**: Hardhat node must be running in Terminal 1
- **Frontend can't connect to API**: Check backend is running on port 3001 and CORS is configured

## Project Dependencies

### Smart Contract Dependencies
- OpenZeppelin Contracts v5.0.1 for secure contract patterns
- Hardhat v2.19.0 with full toolbox for development

### Backend Dependencies
- Express for API server
- ethers v6.8.1 for blockchain interaction
- qrcode for QR generation
- cors, morgan, dotenv for server utilities

### Frontend Dependencies
- serve package for static file serving
- No framework dependencies (vanilla JavaScript)
