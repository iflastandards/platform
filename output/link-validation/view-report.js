#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.json') contentType = 'application/json';
    if (ext === '.txt') contentType = 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n🌐 Link Validation Report Server\n`);
  console.log(`📍 Open in browser: http://localhost:${PORT}\n`);
  console.log(`Press Ctrl+C to stop the server\n`);
});
