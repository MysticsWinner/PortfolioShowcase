const axios = require('axios');
async function test() {
  console.log('\nTesting Login on user\'s live server (3001)...');
  try {
    const loginRes = await axios.post('http://localhost:3001/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });
    console.log('Login RESPONSE:', Object.keys(loginRes.data));
    console.log('Token successfully generated:', !!loginRes.data.accessToken);
  } catch (err) {
    console.log('Login FAILED:', err.response?.data || err.message);
  }
}
test();
