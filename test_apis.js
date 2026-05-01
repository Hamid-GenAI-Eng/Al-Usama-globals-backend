const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let token = '';

const test = async () => {
  try {
    console.log('--- Testing AL-Usama Backend APIs ---');

    // 1. Health Check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data.status);

    // 2. Register
    const register = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: `testuser_${Date.now()}@example.com`,
      password: 'password123',
      fullName: 'Test Auditor',
      role: 'MASTER_ADMIN'
    });
    console.log('✅ Register:', register.data.message);
    token = register.data.data.token;

    // 3. Login
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: register.data.data.email,
      password: 'password123'
    });
    console.log('✅ Login:', login.data.message);

    // 4. Get Me
    const me = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Profile:', me.data.data.fullName);

    // 5. Create Shipment
    const shipment = await axios.post(`${BASE_URL}/api/shipments`, {
      shipmentId: `SHP-${Date.now()}`,
      origin: 'Shanghai',
      destination: 'Karachi',
      vesselName: 'Ever Given',
      departureDate: '2026-05-10',
      arrivalDate: '2026-06-01'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Create Shipment:', shipment.data.data.shipmentId);

    // 6. Get Analytics
    const analytics = await axios.get(`${BASE_URL}/api/analytics/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Analytics Stats:', JSON.stringify(analytics.data.data.stats));

    console.log('\n🚀 ALL TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
};

test();
