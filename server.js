const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables
try {
  require('dotenv').config();
  console.log('✅ .env file loaded locally');
} catch (error) {
  console.log('🌐 Using Render environment variables');
}

const PORT = 8000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse the URL
    const parsedUrl = url.parse(req.url);
    let filePath = '.' + parsedUrl.pathname;
    
    // Handle API config endpoint - THIS MUST BE HERE, AFTER parsedUrl is defined!
    if (parsedUrl.pathname === '/api/get-apikey') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            apiKey: process.env.OPENAI_API_KEY || null,
            hasKey: !!process.env.OPENAI_API_KEY
        }));
        return;
    }
    
    // If no file specified, default to index.html
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Gumi Smart Learning Server started at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${process.cwd()}`);
    console.log(`🔑 API Key Loaded: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
    console.log("\n📋 Available Pages:");
    console.log("  • http://localhost:8000/                - Main landing page");
    console.log("  • http://localhost:8000/login.html      - Login page");
    console.log("  • http://localhost:8000/register.html   - Registration page");
    console.log("  • http://localhost:8000/dashboard.html  - User dashboard");
    console.log("  • http://localhost:8000/subjects.html   - Subjects page");
    console.log("  • http://localhost:8000/ai-course.html  - AI Course page");
    console.log("  • http://localhost:8000/profile.html    - Profile page");
    console.log("\n🔧 API Endpoints:");
    console.log("  • http://localhost:8000/api/get-apikey  - Get API key");
    console.log("\n⚠️  Press Ctrl+C to stop the server\n");
});