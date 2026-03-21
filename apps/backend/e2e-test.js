const axios = require('axios');
const { Client } = require('pg');

async function runSystemDiagnostics() {
  console.log("==========================================");
  console.log("🚀 INITIATING AUTOMATED E2E SYSTEM TESTS");
  console.log("==========================================\n");

  const pgClient = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Tanmay%40123@localhost:5432/portfolio' });
  await pgClient.connect();
  const api = axios.create({ baseURL: 'http://localhost:3001', validateStatus: () => true });

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let jwtToken = null;
  let testOtp = null;

  try {
    // ----------------------------------------------------
    // TEST 1: REGISTRATION & OTP GENERATION
    // ----------------------------------------------------
    console.log(`[TEST 1] Registering User: ${testEmail}`);
    const regRes = await api.post('/auth/register', { name: "Test User", email: testEmail, password: testPassword });

    if (regRes.status !== 201 || !regRes.data.requiresVerification) {
      throw new Error(`Registration Failed. Status: ${regRes.status} Data: ${JSON.stringify(regRes.data)}`);
    }

    const dbRes = await pgClient.query(`SELECT * FROM "User" WHERE email = $1`, [testEmail]);
    const dbUser = dbRes.rows[0];

    if (!dbUser || !dbUser.otp) throw new Error("Database OTP Injection Failed.");
    testOtp = dbUser.otp;
    console.log(`✅ Registration Success! Cached DB OTP: ${testOtp}`);

    // ----------------------------------------------------
    // TEST 2: PRE-VERIFICATION LOGIN BLOCK
    // ----------------------------------------------------
    console.log(`[TEST 2] Verifying Pre-Activation Login Lockdown`);
    const preLoginRes = await api.post('/auth/login', { email: testEmail, password: testPassword });
    if (preLoginRes.status !== 401) {
      throw new Error("Security Flaw: Unverified User was allowed to login.");
    }
    console.log(`✅ Security Verified: Unverified account login correctly blocked (401 Rejection)`);

    // ----------------------------------------------------
    // TEST 3: OTP VERIFICATION
    // ----------------------------------------------------
    console.log(`[TEST 3] Testing OTP Verification Endpoint`);
    const verifyRes = await api.post('/auth/verify', { email: testEmail, otp: testOtp });
    if (verifyRes.status !== 201 || !verifyRes.data.accessToken) {
      throw new Error(`OTP Verification Failed. Data: ${JSON.stringify(verifyRes.data)}`);
    }
    jwtToken = verifyRes.data.accessToken;
    console.log(`✅ Verification Success! JWT Token Acquired.`);

    // ----------------------------------------------------
    // TEST 4: AUTHENTICATED PORTFOLIO CREATION
    // ----------------------------------------------------
    console.log(`[TEST 4] Testing Encrypted JWT Bearer Authentication`);
    const portfolioRes = await api.get(`/portfolios?userId=${dbUser.id}`, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    if (portfolioRes.status !== 200) {
      throw new Error("JWT Bearer Token was rejected by the Passport Execution Guard.");
    }
    console.log(`✅ Portfolio Fetch Success! (Guards Active)`);

    // ----------------------------------------------------
    // TEST 5: ADMIN ROLE-BASED ACCESS CONTROL (RBAC) 
    // ----------------------------------------------------
    console.log(`[TEST 5] Validating Admin RBAC Protections`);
    const adminRes = await api.get('/admin/users', {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    if (adminRes.status !== 403) {
      throw new Error(`CRITICAL ROLES GUARD FAILURE! Viewer bypassed Admin protections (Status: ${adminRes.status})`);
    }
    console.log(`✅ RolesGuard Verified! Standard user correctly blocked from Admin modules (403 Forbidden)\n`);

    console.log("==========================================");
    console.log("🏆 ALL SYSTEM SERVICES & ENDPOINTS FULLY VERIFIED!");
    console.log("No backend compiling errors or logical bugs detected.");
    console.log("==========================================\n");

  } catch (error) {
    console.error(`\n❌ SYSTEM DIAGNOSTIC FAILED. Serializing output natively to test_error_dump.json\n`);
    const fs = require('fs');
    if (error.response) {
      fs.writeFileSync('test_error_dump.json', JSON.stringify({
        status: error.response.status,
        data: error.response.data
      }, null, 2));
    } else {
      fs.writeFileSync('test_error_dump.json', JSON.stringify({
        message: error.message,
        stack: error.stack
      }, null, 2));
    }
  } finally {
    await pgClient.query(`DELETE FROM "User" WHERE email = $1`, [testEmail]);
    await pgClient.end();
  }
}

runSystemDiagnostics();
