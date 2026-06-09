const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3004,
  path: '/ai/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-565a2a7246574104be61a3148938d8f7'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.write(JSON.stringify({
  model: 'deepseek-v4-pro',
  messages: [{ role: 'user', content: 'hello' }],
  stream: false
}));
req.end();