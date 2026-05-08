const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let token = '';

const test = async () => {
  try {
    console.log('--- Testing AL-Usama Backend APIs ---');

    // 1. Health Check
    console.log('\n[1/10] Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data.status);

    // 2. Register MASTER_ADMIN
    console.log('\n[2/10] Testing Auth: Register...');
    const email = `test_admin_${Date.now()}@al-usama.com`;
    const register = await axios.post(`${BASE_URL}/api/auth/register`, {
      email,
      password: 'password123',
      fullName: 'Test Admin',
      role: 'MASTER_ADMIN'
    });
    console.log('✅ Register Admin:', register.data.message);
    token = register.data.data.token;

    // 3. Login
    console.log('\n[3/10] Testing Auth: Login...');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password: 'password123'
    });
    console.log('✅ Login Admin:', login.data.message);

    // 4. Agency Settings
    console.log('\n[4/10] Testing Agency Settings...');
    const getSettings = await axios.get(`${BASE_URL}/api/settings/agency`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Settings:', getSettings.data.data.name);

    const updateSettings = await axios.patch(`${BASE_URL}/api/settings/agency`, {
      name: "AL-Usama Test Agency",
      phone: "+92 300 1234567"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Update Settings:', updateSettings.data.data.name);

    // 5. Contacts (Suppliers/Buyers)
    console.log('\n[5/10] Testing Contacts...');
    const contact = await axios.post(`${BASE_URL}/api/contacts`, {
      name: "Global Textiles Ltd",
      type: "SUPPLIER",
      email: "info@globaltextiles.com",
      country: "China"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Create Contact:', contact.data.data.name);

    const contacts = await axios.get(`${BASE_URL}/api/contacts?type=SUPPLIER`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Contacts Count:', contacts.data.data.length);

    // 6. Orders
    console.log('\n[6/10] Testing Orders...');
    const order = await axios.post(`${BASE_URL}/api/orders`, {
      orderNumber: `PO-${Date.now()}`,
      type: "PURCHASE",
      contactId: contact.data.data.id,
      items: [
        { description: "Raw Cotton", quantity: 100, unitPrice: 50, hsCode: "5201.00" }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Create Order:', order.data.data.orderNumber);

    // 7. Customs
    console.log('\n[7/10] Testing Customs HS Codes...');
    const hsCodes = await axios.get(`${BASE_URL}/api/customs/hs-codes?q=5201`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ HS Code Search Results:', hsCodes.data.data.length);

    // 8. Finance Rates
    console.log('\n[8/10] Testing Finance Exchange Rates...');
    const updateRate = await axios.post(`${BASE_URL}/api/finance/rates`, {
      currencyCode: "USD",
      rateToPkr: 278.50,
      source: "Manual Test"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Update Exchange Rate:', updateRate.data.data.currencyCode);

    // 9. Admin & Audit
    console.log('\n[9/10] Testing Admin & Audit Logs...');
    const users = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Admin: Get Users Count:', users.data.data.length);

    const audit = await axios.get(`${BASE_URL}/api/admin/audit-log`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Admin: Audit Logs Count:', audit.data.data.length);

    // 10. Reports
    console.log('\n[10/10] Testing Reports Summary...');
    const summary = await axios.get(`${BASE_URL}/api/reports/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reports Summary retrieved');

    console.log('\n🚀 ALL MODULES TESTED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

test();
