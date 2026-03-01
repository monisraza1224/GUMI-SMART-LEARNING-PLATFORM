// Question Bank JavaScript - With Categories
document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    loadSavedState();
    window.questionBankApiKey = null; // Initialize API key storage
});

let currentSubject = null;
let allPapers = [];
let filteredPapers = [];
let currentCategory = 'all';
let questionStats = {
    viewed: 0,
    downloaded: 0,
    aiHelped: 0
};

// Subject data
const subjects = [
    {
        id: 'korean',
        icon: 'fa-solid fa-language',
        title: 'Korean',
        title_ko: '국어',
        description: 'Korean language questions and past papers',
        description_ko: '국어 문제 및 기출문제',
        color: '#4361ee'
    },
    {
        id: 'math',
        icon: 'fa-solid fa-calculator',
        title: 'Mathematics',
        title_ko: '수학',
        description: 'Mathematics questions and past papers',
        description_ko: '수학 문제 및 기출문제',
        color: '#f72585'
    },
    {
        id: 'english',
        icon: 'fa-solid fa-book-open',
        title: 'English',
        title_ko: '영어',
        description: 'English questions and past papers',
        description_ko: '영어 문제 및 기출문제',
        color: '#4cc9f0'
    },
    {
        id: 'social',
        icon: 'fa-solid fa-globe',
        title: 'Social Studies',
        title_ko: '사회',
        description: 'Social Studies questions and past papers',
        description_ko: '사회 문제 및 기출문제',
        color: '#ff9e00'
    },
    {
        id: 'science',
        icon: 'fa-solid fa-flask',
        title: 'Science',
        title_ko: '과학',
        description: 'Science questions and past papers',
        description_ko: '과학 문제 및 기출문제',
        color: '#00bbf9'
    },
    {
        id: 'history',
        icon: 'fa-solid fa-landmark',
        title: 'Korean History',
        title_ko: '한국사',
        description: 'Korean History questions and past papers',
        description_ko: '한국사 문제 및 기출문제',
        color: '#9b5de5'
    }
];

// Category definitions
const categories = [
    { id: 'all', name: 'All Questions', name_ko: '모든 문제', icon: 'fa-solid fa-list' },
    { id: 'high3', name: 'High school 3rd year mock exam', name_ko: '고3 모의고사', icon: 'fa-solid fa-graduation-cap' },
    { id: 'high2', name: 'High school 2nd year mock exam', name_ko: '고2 모의고사', icon: 'fa-solid fa-book-open' },
    { id: 'high1', name: 'High school 1st year mock exam', name_ko: '고1 모의고사', icon: 'fa-solid fa-school' },
    { id: 'military', name: 'Military Academy & Police Academy', name_ko: '육군/경찰/사관학교', icon: 'fa-solid fa-shield' },
    { id: 'black', name: 'Black test', name_ko: '블랙 테스트', icon: 'fa-solid fa-flask' },
    { id: 'admission', name: 'Admission materials', name_ko: '입시 자료', icon: 'fa-solid fa-file-signature' },
    { id: 'certificate', name: 'Certificate', name_ko: '자격증', icon: 'fa-solid fa-certificate' },
    { id: 'other', name: 'Other', name_ko: '기타', icon: 'fa-solid fa-question' }
];

// Load subjects from API
function loadSubjects() {
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading subjects...</p></div>';
    
    fetch('/api/subjects')
        .then(response => response.json())
        .then(subjectsWithCount => {
            grid.innerHTML = '';
            
            subjectsWithCount.forEach(subject => {
                const title = document.documentElement.lang === 'ko' ? subject.name_ko : subject.name;
                const description = document.documentElement.lang === 'ko' ? 
                    `${subject.name_ko} 문제 및 기출문제` : 
                    `${subject.name} questions and past papers`;
                
                const card = document.createElement('div');
                card.className = 'subject-card';
                card.setAttribute('data-subject', subject.id);
                card.onclick = () => selectSubject(subject.id);
                
                card.innerHTML = `
                    <div class="subject-icon">
                        <i class="${subject.icon}"></i>
                    </div>
                    <h2 class="subject-title">${title}</h2>
                    <p class="subject-description">${description}</p>
                    <div class="question-count">${subject.count} Questions</div>
                `;
                
                grid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading subjects:', error);
            grid.innerHTML = '<div class="no-results"><i class="fas fa-exclamation-circle"></i><p>Error loading subjects</p></div>';
        });
}

// Select subject
function selectSubject(subjectId) {
    currentSubject = subjectId;
    currentCategory = 'all';
    
    document.getElementById('subjectGrid').style.display = 'none';
    document.getElementById('papersSection').style.display = 'block';
    
    const subject = subjects.find(s => s.id === subjectId);
    const title = document.documentElement.lang === 'ko' ? subject.title_ko : subject.title;
    document.getElementById('categoryTitle').textContent = title;
    
    loadPapersFromAPI(subjectId);
}

// Load papers from API
function loadPapersFromAPI(subjectId) {
    const grid = document.getElementById('papersGrid');
    
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading questions...</p></div>';
    
    fetch(`/api/questions/${subjectId}`)
        .then(response => response.json())
        .then(papers => {
            allPapers = papers;
            filterByCategory('all');
        })
        .catch(error => {
            console.error('Error loading papers:', error);
            grid.innerHTML = '<div class="no-results"><i class="fas fa-exclamation-circle"></i><p>Error loading papers</p></div>';
        });
}

// Filter by category
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    
    if (categoryId === 'all') {
        filteredPapers = [...allPapers];
    } else {
        filteredPapers = allPapers.filter(paper => paper.category === categoryId);
    }
    
    updateCategoryButtons();
    displayCategoryCounts();
    displayPapers(filteredPapers);
}

// Update category buttons
function updateCategoryButtons() {
    const container = document.getElementById('categoryButtons');
    if (!container) return;
    
    let buttonsHtml = '';
    categories.forEach(cat => {
        const count = cat.id === 'all' ? allPapers.length : allPapers.filter(p => p.category === cat.id).length;
        if (count > 0 || cat.id === 'all') {
            const name = document.documentElement.lang === 'ko' ? cat.name_ko : cat.name;
            const activeClass = currentCategory === cat.id ? 'active' : '';
            
            buttonsHtml += `
                <button class="category-btn ${activeClass}" onclick="filterByCategory('${cat.id}')">
                    <i class="${cat.icon}"></i>
                    ${name} (${count})
                </button>
            `;
        }
    });
    
    container.innerHTML = buttonsHtml;
}

// Display category counts
function displayCategoryCounts() {
    const paperCount = document.getElementById('paperCount');
    const category = categories.find(c => c.id === currentCategory);
    const categoryName = document.documentElement.lang === 'ko' ? category.name_ko : category.name;
    
    paperCount.innerHTML = `
        <i class="fas fa-layer-group"></i> 
        ${categoryName}: ${filteredPapers.length} questions
        (Total: ${allPapers.length})
    `;
}

// Display papers
function displayPapers(papers) {
    const grid = document.getElementById('papersGrid');
    
    if (papers.length === 0) {
        grid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No papers found in this category</p></div>';
        return;
    }
    
    grid.innerHTML = '';
    
    // Group by year for better display
    const groupedByYear = {};
    papers.forEach(paper => {
        const year = paper.year || 'No Year';
        if (!groupedByYear[year]) {
            groupedByYear[year] = [];
        }
        groupedByYear[year].push(paper);
    });
    
    // Sort years descending
    const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
        if (a === 'No Year') return 1;
        if (b === 'No Year') return -1;
        return b.localeCompare(a);
    });
    
    sortedYears.forEach(year => {
        // Add year header
        if (year !== 'No Year') {
            const yearHeader = document.createElement('div');
            yearHeader.className = 'year-header';
            yearHeader.innerHTML = `<h3><i class="fa-solid fa-calendar"></i> ${year}</h3>`;
            grid.appendChild(yearHeader);
        }
        
        // Add papers for this year
        groupedByYear[year].forEach(paper => {
            const card = document.createElement('div');
            card.className = 'paper-card';
            
            // Determine type styling
            let typeClass = 'question';
            if (paper.type === 'answer') {
                typeClass = 'answer';
            } else if (paper.type === 'listening') {
                typeClass = 'listening';
            }
            
            let typeText = paper.typeDisplay;
            
            // Create display title
            let displayTitle = paper.displayTitle;
            
            // IMPORTANT FIX: Use paper.file directly - server handles encoding
            const filePath = paper.file;
            
            card.innerHTML = `
                <div class="paper-header">
                    <span class="paper-type ${typeClass}">${typeText}</span>
                    ${paper.month ? `<span class="paper-month">${paper.month}</span>` : ''}
                </div>
                <h4 class="paper-title">${displayTitle}</h4>
                <div class="paper-meta">
                    <span><i class="fas fa-tag"></i> ${paper.categoryDisplay}</span>
                </div>
                <div class="paper-actions">
                    <button class="btn-paper btn-preview-paper" onclick="previewPaper('${filePath}', '${displayTitle.replace(/'/g, "\\'")}')">
                        <i class="fas fa-eye"></i> ${document.documentElement.lang === 'ko' ? '미리보기' : 'Preview'}
                    </button>
                    <button class="btn-paper btn-download-paper" onclick="downloadPaper('${filePath}', '${displayTitle.replace(/'/g, "\\'")}')">
                        <i class="fas fa-download"></i> ${document.documentElement.lang === 'ko' ? '다운로드' : 'Download'}
                    </button>
                </div>
                <button class="btn-ask-ai" onclick="askAIAboutPaper('${displayTitle.replace(/'/g, "\\'")}', '${filePath}')">
                    <i class="fas fa-robot"></i> ${document.documentElement.lang === 'ko' ? 'AI에게 물어보기' : 'Ask AI'}
                </button>
            `;
            
            grid.appendChild(card);
        });
    });
}

// Search papers
function searchPapers() {
    const searchTerm = document.getElementById('searchPapers').value.toLowerCase();
    
    if (!searchTerm) {
        filterByCategory(currentCategory);
    } else {
        const categoryFiltered = currentCategory === 'all' ? 
            allPapers : 
            allPapers.filter(p => p.category === currentCategory);
        
        filteredPapers = categoryFiltered.filter(paper => {
            return paper.displayTitle.toLowerCase().includes(searchTerm) || 
                   (paper.year && paper.year.includes(searchTerm)) ||
                   (paper.month && paper.month.toLowerCase().includes(searchTerm));
        });
        
        displayPapers(filteredPapers);
        
        // Update count
        const paperCount = document.getElementById('paperCount');
        paperCount.innerHTML = `
            <i class="fas fa-search"></i> 
            Search results: ${filteredPapers.length} of ${categoryFiltered.length} papers
        `;
    }
}

// Go back to subjects
function goBackToSubjects() {
    document.getElementById('subjectGrid').style.display = 'grid';
    document.getElementById('papersSection').style.display = 'none';
    document.getElementById('searchPapers').value = '';
    currentSubject = null;
}

// Preview paper
function previewPaper(filePath, title) {
    questionStats.viewed++;
    saveStats();
    
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    const modalTitle = document.getElementById('pdfModalTitle');
    
    modalTitle.textContent = title;
    viewer.src = filePath;
    modal.classList.add('active');
}

// Download paper
function downloadPaper(filePath, title) {
    questionStats.downloaded++;
    saveStats();
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = filePath;
    link.download = title.replace(/[^a-z0-9가-힣]/gi, '_') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(document.documentElement.lang === 'ko' ? 
        '다운로드가 시작되었습니다!' : 
        'Download started!');
}

// Close PDF modal
function closePDFModal() {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    modal.classList.remove('active');
    viewer.src = '';
}

// ===== AI ASSISTANT FIXES =====
// Open AI Assistant
function openAIAssistant() {
    document.getElementById('aiAssistantPanel').style.display = 'flex';
    // Load API key when opening
    if (!window.questionBankApiKey) {
        loadAPIKeyForAssistant();
    }
}

// Close AI Assistant
function closeAIAssistant() {
    document.getElementById('aiAssistantPanel').style.display = 'none';
}

// Load API key for assistant
async function loadAPIKeyForAssistant() {
    try {
        const response = await fetch('/api/get-apikey');
        if (response.ok) {
            const data = await response.json();
            window.questionBankApiKey = data.apiKey;
            console.log('API key loaded for Question Bank AI');
        }
    } catch (error) {
        console.log('Could not load API key');
    }
}

// Ask AI about paper
function askAIAboutPaper(paperTitle, paperFile) {
    openAIAssistant();
    questionStats.aiHelped++;
    saveStats();
    
    const input = document.getElementById('assistantInput');
    input.value = document.documentElement.lang === 'ko' ?
        `"${paperTitle}" 문제에 대해 도움이 필요합니다. 개념을 설명해 주실 수 있나요?` :
        `I need help with questions from "${paperTitle}". Can you explain the concepts?`;
    
    setTimeout(() => {
        sendAssistantMessage();
    }, 500);
}

// Send message to AI Assistant
async function sendAssistantMessage() {
    const input = document.getElementById('assistantInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessageToChat('user', message);
    input.value = '';
    
    // Show loading indicator
    const loadingId = showAssistantLoading();
    
    try {
        // Load API key if not loaded
        if (!window.questionBankApiKey) {
            await loadAPIKeyForAssistant();
        }
        
        if (!window.questionBankApiKey) {
            throw new Error('API key not available');
        }
        
        const response = await getAIResponseFromAPI(message);
        removeAssistantLoading(loadingId);
        addMessageToChat('ai', response);
        
    } catch (error) {
        console.error('AI Assistant error:', error);
        removeAssistantLoading(loadingId);
        
        const errorMsg = document.documentElement.lang === 'ko' ?
            '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' :
            'Sorry, an error occurred. Please try again.';
        addMessageToChat('ai', errorMsg);
    }
}

// Get AI response from OpenAI
async function getAIResponseFromAPI(userMessage) {
    const isKorean = document.documentElement.lang === 'ko';
    
    const systemMessage = isKorean ?
        '당신은 구미 스마트 학습의 AI 도우미입니다. 학생들의 질문에 친절하고 도움이 되게 답변해주세요. 한국어로 답변해주세요.' :
        'You are an AI assistant for Gumi Smart Learning. Answer students questions kindly and helpfully. Answer in English.';
    
    const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.questionBankApiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API error');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Show loading in assistant
function showAssistantLoading() {
    const chat = document.getElementById('assistantChat');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai loading';
    loadingDiv.id = 'assistant-loading-' + Date.now();
    loadingDiv.innerHTML = '<div class="message-content"><i class="fas fa-spinner fa-spin"></i> Thinking...</div>';
    chat.appendChild(loadingDiv);
    chat.scrollTop = chat.scrollHeight;
    return loadingDiv.id;
}

// Remove loading
function removeAssistantLoading(id) {
    const loading = document.getElementById(id);
    if (loading) loading.remove();
}

// Add message to chat
function addMessageToChat(sender, message) {
    const chat = document.getElementById('assistantChat');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4cc9f0;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Save stats
function saveStats() {
    localStorage.setItem('questionBankStats', JSON.stringify(questionStats));
}

// Load saved state
function loadSavedState() {
    const saved = localStorage.getItem('questionBankStats');
    if (saved) {
        questionStats = JSON.parse(saved);
    }
}

// Listen for language changes
document.addEventListener('languageChanged', function() {
    if (currentSubject) {
        const subject = subjects.find(s => s.id === currentSubject);
        const title = document.documentElement.lang === 'ko' ? subject.title_ko : subject.title;
        document.getElementById('categoryTitle').textContent = title;
        
        displayCategoryCounts();
        updateCategoryButtons();
        displayPapers(filteredPapers);
    } else {
        loadSubjects();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePDFModal();
        closeAIAssistant();
    }
});

// Click outside modal to close
window.onclick = function(event) {
    const modal = document.getElementById('pdfModal');
    if (event.target === modal) {
        closePDFModal();
    }
};