const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const loginData = JSON.stringify({
  email: 'mahmoudhamedabdo9@gmail.com',
  password: 'password123',
});

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Login Response Status:', res.statusCode);
    console.log('Response Data:', data);
    
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data);
        const token = parsed.accessToken;
        console.log('✅ Got access token:', token.substring(0, 50) + '...');
        
        // Now call export endpoint
        testExport(token);
      } catch (e) {
        console.error('Failed to parse response:', e.message);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(loginData);
req.end();

function testExport(token) {
  const exportOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/application/job/19/export',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const exportReq = http.request(exportOptions, (res) => {
    console.log('\nExport Response Status:', res.statusCode);
    console.log('Export Response Headers:', res.headers['content-type']);
    
    if (res.statusCode === 200) {
      let chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`✅ Received Excel file: ${buffer.length} bytes`);
        console.log(`\n🎉 Export endpoint is working!`);
      });
    } else {
      let errData = '';
      res.on('data', (chunk) => {
        errData += chunk;
      });
      res.on('end', () => {
        console.error('❌ Export failed with status', res.statusCode);
        console.error('Error:', errData);
      });
    }
  });

  exportReq.on('error', (error) => {
    console.error('❌ Export request error:', error);
  });

  exportReq.end();
}
