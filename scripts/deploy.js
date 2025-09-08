const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting deployment of Agricultural Supply Chain Smart Contract...");

    // Get the contract factory
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    
    // Deploy the contract
    console.log("📝 Deploying SupplyChain contract...");
    const supplyChain = await SupplyChain.deploy();
    
    // Wait for deployment
    await supplyChain.waitForDeployment();
    
    const contractAddress = await supplyChain.getAddress();
    console.log("✅ SupplyChain contract deployed to:", contractAddress);
    
    // Save the contract address to a file
    const deploymentInfo = {
        contractAddress: contractAddress,
        network: hre.network.name,
        deployedAt: new Date().toISOString(),
        deployer: (await hre.ethers.getSigners())[0].address
    };
    
    const deploymentPath = path.join(__dirname, "../deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to deployment.json");
    
    // Create .env file for backend
    const envContent = `
# Blockchain Configuration
CONTRACT_ADDRESS=${contractAddress}
BLOCKCHAIN_URL=http://127.0.0.1:8545
NETWORK=${hre.network.name}

# API Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
`;
    
    const envPath = path.join(__dirname, "../backend/.env");
    fs.writeFileSync(envPath, envContent.trim());
    console.log("📄 Environment configuration saved to backend/.env");
    
    // Sample data setup (optional)
    console.log("\n🌱 Setting up sample data...");
    
    try {
        // Register sample stakeholders
        const [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();
        
        // Register a farmer
        await supplyChain.registerStakeholder(
            addr1.address,
            "Green Valley Farm",
            "farm@greenvalley.com",
            0, // Farmer
            "Cuttack, Odisha"
        );
        console.log("✅ Registered farmer");
        
        // Register a distributor
        await supplyChain.registerStakeholder(
            addr2.address,
            "Fresh Logistics",
            "info@freshlogistics.com",
            1, // Distributor
            "Bhubaneswar, Odisha"
        );
        console.log("✅ Registered distributor");
        
        // Register a retailer
        await supplyChain.registerStakeholder(
            addr3.address,
            "City Mart",
            "contact@citymart.com",
            2, // Retailer
            "Puri, Odisha"
        );
        console.log("✅ Registered retailer");
        
        console.log("\n🎉 Deployment and setup completed successfully!");
        console.log("\n📋 Next steps:");
        console.log("1. Keep this terminal running (Hardhat node)");
        console.log("2. In a new terminal, navigate to the backend folder and run: npm install && npm start");
        console.log("3. In another terminal, navigate to the frontend folder and run: npm install && npm start");
        console.log("4. Open http://localhost:3000 in your browser");
        
    } catch (error) {
        console.error("⚠️ Error setting up sample data:", error);
        console.log("Contract deployed successfully, but sample data setup failed.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
