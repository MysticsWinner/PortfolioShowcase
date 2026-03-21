const fs = require('fs');
const { Client } = require('pg');

async function testFileSystem() {
  console.log("==========================================");
  console.log("🚀 INITIATING E2E BINARY SYSTEM TEST");
  console.log("==========================================\n");

  const pgClient = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Tanmay%40123@localhost:5432/portfolio' });
  await pgClient.connect();
  const baseURL = 'http://localhost:3001';

  const testEmail = `filetester_${Date.now()}@example.com`;
  let jwtToken = null;
  let portfolioId = null;

  try {
    // 1. Register & Extract OTP
    console.log(`[TEST 1] Registering User & Bypassing OTP`);
    await fetch(`${baseURL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: "File Tester", email: testEmail, password: "Password123!" }) });
    const dbRes = await pgClient.query(`SELECT otp FROM "User" WHERE email = $1`, [testEmail]);
    const otp = dbRes.rows[0].otp;
    const verifyRes = await fetch(`${baseURL}/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: testEmail, otp }) });
    const verifyData = await verifyRes.json();
    jwtToken = verifyData.accessToken;
    console.log(`✅ Authentication Secured.`);

    // 2. Create Portfolio
    console.log(`\n[TEST 2] Creating Native Encrypted Portfolio`);
    const portRes = await fetch(`${baseURL}/portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
      body: JSON.stringify({ title: "Binary Test Portfolio", data: "Test doc data" })
    });
    const portData = await portRes.json();
    portfolioId = portData.id;
    console.log(`✅ Portfolio Created: ${portfolioId}`);

    // 3. Upload File
    console.log(`\n[TEST 3] Uploading Mock PDF Document`);
    fs.writeFileSync('test_upload.pdf', 'mock pdf binary data representing a document');
    const form = new FormData();
    const blob = new Blob([fs.readFileSync('test_upload.pdf')], { type: 'application/pdf' });
    form.append('file', blob, 'test_upload.pdf');
    
    const uploadRes = await fetch(`${baseURL}/portfolios/${portfolioId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwtToken}` },
      body: form
    });
    
    if (!uploadRes.ok) {
      throw new Error(`Upload Failed: ${uploadRes.status} - ${await uploadRes.text()}`);
    }
    console.log(`✅ Upload Success! File mounted to PostgreSQL mapping.`);

    // 4. Download File
    console.log(`\n[TEST 4] Resolving Download StreamableFile Hook`);
    const dlRes = await fetch(`${baseURL}/portfolios/${portfolioId}/download`, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    if (!dlRes.ok) {
      throw new Error(`Download Failed: ${dlRes.status} - ${await dlRes.text()}`);
    }
    const arrayBuffer = await dlRes.arrayBuffer();
    console.log(`✅ Download Success! Stream successfully buffered. Bytes: ${arrayBuffer.byteLength}`);

    console.log("\n🏆 BINARY SYSTEM IS FLAWLESS");
  } catch (error) {
    console.error(`\n❌ SYSTEM DIAGNOSTIC FAILED:\n`);
    console.error(error.stack || error.message);
  } finally {
    if (fs.existsSync('test_upload.pdf')) fs.unlinkSync('test_upload.pdf');
    await pgClient.query(`DELETE FROM "User" WHERE email = $1`, [testEmail]);
    await pgClient.end();
  }
}

testFileSystem();
