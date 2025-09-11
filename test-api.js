// Simple test script to verify API endpoints
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.success ? 'PASS' : 'FAIL');
    console.log('   Server:', healthResponse.data.data.server);
    console.log('   Blockchain:', healthResponse.data.data.blockchain);
    console.log('   Database:', healthResponse.data.data.database);
    console.log();

    // Test API documentation
    console.log('2. Testing API documentation...');
    const docsResponse = await axios.get(`${API_BASE_URL}/api`);
    console.log('✅ API docs:', docsResponse.data.success ? 'PASS' : 'FAIL');
    console.log();

    // Test QR generation (this will work even without blockchain)
    console.log('3. Testing QR generation...');
    try {
      const qrResponse = await axios.get(`${API_BASE_URL}/api/qr/generate/TEST_PRODUCT_001`);
      console.log('✅ QR generation:', qrResponse.data.success ? 'PASS' : 'FAIL');
      if (qrResponse.data.success) {
        console.log('   Generated QR for:', qrResponse.data.productId);
        console.log('   Tracking URL:', qrResponse.data.trackingUrl);
      }
    } catch (error) {
      console.log('❌ QR generation: FAIL -', error.response?.data?.message || error.message);
    }
    console.log();

    // Test product tracking (this will require blockchain)
    console.log('4. Testing product tracking...');
    try {
      const trackResponse = await axios.get(`${API_BASE_URL}/api/track/TEST_PRODUCT_001`);
      console.log('✅ Product tracking:', trackResponse.data.success ? 'PASS' : 'FAIL');
    } catch (error) {
      console.log('❌ Product tracking: FAIL -', error.response?.data?.message || error.message);
      if (error.response?.status === 503) {
        console.log('   This is expected if blockchain service is not initialized');
      }
    }
    console.log();

    // Test products endpoint (this will require blockchain)
    console.log('5. Testing products endpoint...');
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
      console.log('✅ Products API:', productsResponse.data.success ? 'PASS' : 'FAIL');
      console.log('   Products count:', productsResponse.data.data?.products?.length || 0);
    } catch (error) {
      console.log('❌ Products API: FAIL -', error.response?.data?.message || error.message);
      if (error.response?.status === 503) {
        console.log('   This is expected if blockchain service is not initialized');
      }
    }
    console.log();

    console.log('🎉 API testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Health and QR endpoints should work without blockchain');
    console.log('- Product and transaction endpoints require blockchain connection');
    console.log('- Make sure to set up your .env file with blockchain configuration');

  } catch (error) {
    console.error('❌ Failed to test APIs:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm start');
    }
  }
}

// Run the test
testAPIs();
