const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  require('dotenv').config();
  console.log('✅ .env file loaded locally');
} catch (error) {
  console.log('🌐 Using Render environment variables');
}

const PORT = process.env.PORT || 8000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Handle API endpoints
    if (req.url.startsWith('/api/')) {
        handleAPI(req, res);
        return;
    }
    
    // Decode the URL to handle Korean characters
    const decodedUrl = decodeURI(req.url);
    let filePath = '.' + decodedUrl;
    
    // Default to index.html
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            console.log(`Error serving ${filePath}: ${error.code}`);
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Handle API requests
function handleAPI(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // ===== QUESTIONS API =====
    if (req.url.startsWith('/api/questions/')) {
        const subject = req.url.replace('/api/questions/', '');
        const questionsPath = path.join(__dirname, 'questions', subject);
        
        fs.readdir(questionsPath, (err, files) => {
            if (err) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
                return;
            }
            
            const pdfs = files
                .filter(f => f.toLowerCase().endsWith('.pdf'))
                .map((f, i) => {
                    // Category detection
                    let category = 'other';
                    let categoryDisplay = 'Other';
                    
                    if (f.includes('고3') || f.includes('3학년')) {
                        category = 'high3';
                        categoryDisplay = 'High school 3rd year mock exam';
                    } else if (f.includes('고2') || f.includes('2학년')) {
                        category = 'high2';
                        categoryDisplay = 'High school 2nd year mock exam';
                    } else if (f.includes('고1') || f.includes('1학년')) {
                        category = 'high1';
                        categoryDisplay = 'High school 1st year mock exam';
                    } else if (f.includes('대학수학능력시험') || f.includes('수능')) {
                        category = 'high3';
                        categoryDisplay = 'High school 3rd year mock exam';
                    }
                    
                    // Type detection
                    let type = 'question';
                    let typeDisplay = 'Question';
                    
                    if (f.includes('해설') || f.includes('정답') || f.includes('답안') || f.includes('답지')) {
                        type = 'answer';
                        typeDisplay = 'Answer Key';
                    } else if (f.includes('듣기') || f.includes('대본')) {
                        type = 'listening';
                        typeDisplay = 'Listening Script';
                    }
                    
                    const year = f.match(/20\d{2}/)?.[0] || '';
                    const month = f.match(/(\d+월)/)?.[0] || '';
                    
                    return {
                        id: `${subject}-${i}`,
                        filename: f,
                        displayTitle: f.replace('.pdf', '').replace(/-/g, ' '),
                        year,
                        month,
                        category,
                        categoryDisplay,
                        type,
                        typeDisplay,
                        subject,
                        file: `/questions/${subject}/${f}`
                    };
                })
                .sort((a, b) => b.year.localeCompare(a.year));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(pdfs));
        });
        return;
    }
    
    // ===== SUBJECTS API =====
    if (req.url === '/api/subjects') {
        const subjects = [
            { id: 'korean', name: 'Korean', name_ko: '국어', icon: 'fa-solid fa-language', color: '#4361ee' },
            { id: 'math', name: 'Mathematics', name_ko: '수학', icon: 'fa-solid fa-calculator', color: '#f72585' },
            { id: 'english', name: 'English', name_ko: '영어', icon: 'fa-solid fa-book-open', color: '#4cc9f0' },
            { id: 'social', name: 'Social Studies', name_ko: '사회', icon: 'fa-solid fa-globe', color: '#ff9e00' },
            { id: 'science', name: 'Science', name_ko: '과학', icon: 'fa-solid fa-flask', color: '#00bbf9' },
            { id: 'history', name: 'Korean History', name_ko: '한국사', icon: 'fa-solid fa-landmark', color: '#9b5de5' }
        ];
        
        const subjectsWithCount = subjects.map(s => ({ ...s, count: 0 }));
        let processed = 0;
        
        subjects.forEach((s, i) => {
            const subPath = path.join(__dirname, 'questions', s.id);
            fs.readdir(subPath, (err, files) => {
                if (!err) {
                    subjectsWithCount[i].count = files.filter(f => f.endsWith('.pdf')).length;
                }
                processed++;
                if (processed === subjects.length) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(subjectsWithCount));
                }
            });
        });
        return;
    }
    
    // ===== MATERIALS API (NEW) =====
    if (req.url.startsWith('/api/materials/')) {
        const moduleName = req.url.replace('/api/materials/', '');
        const materialsPath = path.join(__dirname, 'materials');
        
        function getAllMaterials(dir, basePath = '') {
            let results = [];
            const list = fs.readdirSync(dir, { withFileTypes: true });
            
            list.forEach(file => {
                const filePath = path.join(dir, file.name);
                const relativePath = path.join(basePath, file.name);
                
                if (file.isDirectory()) {
                    results = results.concat(getAllMaterials(filePath, relativePath));
                } else if (file.name.toLowerCase().endsWith('.pdf')) {
                    const moduleFolder = basePath.split(path.sep)[0] || 'general';
                    results.push({
                        id: results.length,
                        title: file.name.replace('.pdf', '').replace(/-/g, ' '),
                        file: `/materials/${relativePath.replace(/\\/g, '/')}`,
                        module: moduleFolder,
                        filename: file.name
                    });
                }
            });
            
            return results;
        }
        
        try {
            let materials = [];
            
            if (moduleName === 'all') {
                materials = getAllMaterials(materialsPath);
            } else {
                const specificPath = path.join(materialsPath, moduleName);
                if (fs.existsSync(specificPath)) {
                    materials = getAllMaterials(specificPath, moduleName);
                }
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(materials));
        } catch (error) {
            console.log('Error reading materials:', error);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
        }
        return;
    }
    
    // ===== API KEY ENDPOINT =====
    if (req.url === '/api/get-apikey') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            apiKey: process.env.OPENAI_API_KEY || null,
            hasKey: !!process.env.OPENAI_API_KEY
        }));
        return;
    }
    
    res.writeHead(404);
    res.end('API not found');
}

server.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${process.cwd()}`);
    console.log(`\n📁 Available APIs:`);
    console.log(`  • /api/subjects - Get subjects with counts`);
    console.log(`  • /api/questions/[subject] - Get questions`);
    console.log(`  • /api/materials/all - Get all materials`);
    console.log(`  • /api/materials/[module] - Get module materials`);
    console.log(`  • /api/get-apikey - Get API key`);
    console.log(`\n📁 Materials folders detected:`);
    console.log(`  • materials/module1/`);
    console.log(`  • materials/module2/`);
    console.log(`  • materials/module3/`);
    console.log(`  • materials/module4/`);
    console.log(`  • materials/module5/`);
    console.log(`  • materials/module6/`);
    console.log(`  • materials/module7/`);
});