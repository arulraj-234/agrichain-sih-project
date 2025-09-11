const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  console.log("🚀 Starting deployment of ProductManagement contract...");

  // Get contract factory
  const ProductManagement = await ethers.getContractFactory(
    "ProductManagement"
  );

  // Deploy contract
  console.log("⏳ Deploying ProductManagement contract...");
  const productManagement = await ProductManagement.deploy();

  // Wait until deployment is mined
  await productManagement.waitForDeployment();

  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract address:", productManagement.target);

  // Deployment transaction info
  const deploymentTx = productManagement.deploymentTransaction();
  console.log("🔗 Transaction hash:", deploymentTx.hash);
  console.log("⛽ Gas limit:", deploymentTx.gasLimit.toString());

  // Network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🆔 Chain ID:", network.chainId);

  // Deployer info
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployed by:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");

  // Save deployment info
 const deploymentInfo = {
  contractName: "ProductManagement",
  contractAddress: productManagement.target,
  transactionHash: deploymentTx.hash,
  gasUsed: deploymentTx.gasLimit.toString(),   // BigInt → string
  network: network.name,
  chainId: network.chainId.toString(),        // BigInt → string
  deployer: deployer.address,
  deploymentTime: new Date().toISOString(),
  blockNumber: deploymentTx.blockNumber?.toString() // BigInt → string (optional, may be undefined until mined)
};


  console.log("\n📋 Deployment Information (JSON):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 🔹 Basic functionality test
  console.log("\n🧪 Running basic functionality test...");
  try {
    const testTx = await productManagement.createProduct(
      "TEST001",
      "Test Product",
      "A test product for deployment verification",
      "FARMER001",
      100,
      ethers.parseEther("0.01"), // ✅ v6 uses ethers.parseEther
      0, // ProductState.Produced
      "2024-01-01",
      "Test Farm, India",
      true,
      deployer.address,
      deployer.address
    );

    await testTx.wait();
    console.log("✅ Test product created successfully");

    const totalProducts = await productManagement.getTotalProducts();
    console.log("📊 Total products in contract:", totalProducts.toString());

    const productDetails = await productManagement.getProduct("TEST001");
    console.log("🏷️  Test product name:", productDetails.name);

    console.log("✅ Basic functionality test passed!");
  } catch (error) {
    console.log("❌ Basic functionality test failed:", error.message);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📚 Interact with the contract at:", productManagement.target);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
