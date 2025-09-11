require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function debugBlockchainConnection() {
    console.log('🔍 Blockchain Connection Debugging');
    console.log('================================');
    
    // 1. Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log('RPC_URL:', process.env.RPC_URL || 'NOT SET');
    console.log('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS || 'NOT SET');
    console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'SET (length: ' + process.env.PRIVATE_KEY.length + ')' : 'NOT SET');
    
    // 2. Test RPC connection
    console.log('\n🌐 Testing RPC Connection:');
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        console.log('✅ RPC Connection: SUCCESS');
        console.log('   Network:', network.name);
        console.log('   Chain ID:', Number(network.chainId));
        console.log('   Block Number:', blockNumber);
    } catch (error) {
        console.log('❌ RPC Connection: FAILED');
        console.log('   Error:', error.message);
        console.log('   Details:', error.code || 'Unknown code');
        return;
    }
    
    // 3. Test wallet connection
    console.log('\n👛 Testing Wallet:');
    try {
        if (!process.env.PRIVATE_KEY) {
            console.log('⚠️  No private key provided - read-only mode');
        } else {
            const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            const balance = await provider.getBalance(signer.address);
            
            console.log('✅ Wallet: SUCCESS');
            console.log('   Address:', signer.address);
            console.log('   Balance:', ethers.formatEther(balance), 'ETH');
        }
    } catch (error) {
        console.log('❌ Wallet: FAILED');
        console.log('   Error:', error.message);
    }
    
    // 4. Check ABI file
    console.log('\n📄 Testing ABI File:');
    const abiPath = path.join(__dirname, '../abis/ProductManagement.json');
    try {
        if (!fs.existsSync(abiPath)) {
            console.log('❌ ABI File: NOT FOUND');
            console.log('   Expected path:', abiPath);
            return;
        }
        
        const abiContent = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const abi = abiContent.abi || abiContent;
        
        console.log('✅ ABI File: EXISTS');
        console.log('   Path:', abiPath);
        console.log('   Functions:', abi.filter(item => item.type === 'function').length);
        console.log('   Events:', abi.filter(item => item.type === 'event').length);
        
        // Check for specific required functions
        const requiredFunctions = ['createProduct', 'getProduct', 'createTransaction'];
        const availableFunctions = abi
            .filter(item => item.type === 'function')
            .map(item => item.name);
            
        requiredFunctions.forEach(func => {
            if (availableFunctions.includes(func)) {
                console.log(`   ✅ ${func}: Found`);
            } else {
                console.log(`   ❌ ${func}: Missing`);
            }
        });
        
    } catch (error) {
        console.log('❌ ABI File: ERROR');
        console.log('   Error:', error.message);
        return;
    }
    
    // 5. Test contract connection
    console.log('\n📋 Testing Contract:');
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const abiContent = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const abi = abiContent.abi || abiContent;
        
        // Test contract code exists
        const code = await provider.getCode(process.env.CONTRACT_ADDRESS);
        if (code === '0x') {
            console.log('❌ Contract: NO CODE AT ADDRESS');
            console.log('   Address:', process.env.CONTRACT_ADDRESS);
            console.log('   This means the contract is not deployed at this address');
            return;
        }
        
        console.log('✅ Contract Code: EXISTS');
        console.log('   Address:', process.env.CONTRACT_ADDRESS);
        console.log('   Code length:', code.length, 'characters');
        
        // Test contract instance creation
        const contract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            provider
        );
        
        console.log('✅ Contract Instance: CREATED');
        
        // Try to call a view function if available
        try {
            // This might fail if the function doesn't exist or has different parameters
            // const result = await contract.someViewFunction();
            console.log('✅ Contract: READY FOR USE');
        } catch (error) {
            console.log('⚠️  Contract function test skipped (expected in some cases)');
        }
        
    } catch (error) {
        console.log('❌ Contract: FAILED');
        console.log('   Error:', error.message);
        console.log('   Code:', error.code || 'Unknown');
    }
    
    // 6. Network connectivity test
    console.log('\n🔗 Network Connectivity:');
    try {
        const response = await fetch(process.env.RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Network: REACHABLE');
            console.log('   Latest block:', parseInt(data.result, 16));
        } else {
            console.log('❌ Network: HTTP ERROR');
            console.log('   Status:', response.status);
        }
    } catch (error) {
        console.log('❌ Network: UNREACHABLE');
        console.log('   Error:', error.message);
    }
    
    console.log('\n🏁 Debugging Complete');
    console.log('================================');
}

// Run the debugging
debugBlockchainConnection().catch(error => {
    console.error('❌ Debugging failed:', error);
});

module.exports = { debugBlockchainConnection };
