const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/v1/chat/completions') {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const userMessage = data.messages?.[data.messages.length - 1]?.content || 'Hello';
        
        const response = {
          choices: [{
            message: {
              content: `这是对您问题的模拟回复：\n\n"${userMessage}"\n\n(注意：这是测试模式，使用的是模拟响应。如需真实 AI 响应，请配置 DeepSeek API Key。)`
            }
          }]
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 1234;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock AI API server running on http://127.0.0.1:${PORT}`);
});