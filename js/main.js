// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Mobile Navigation Toggle
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Initialize Dashboard Stats
function initDashboardStats() {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (user) {
        // Update welcome message
        const welcomeElements = document.querySelectorAll('.welcome-message h1');
        welcomeElements.forEach(el => {
            if (el.classList.contains('lang-en')) {
                el.textContent = `Welcome back, ${user.name}!`;
            } else if (el.classList.contains('lang-ko')) {
                el.textContent = `${user.name}님, 환영합니다!`;
            }
        });
        
        // Update profile if on profile page
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileType = document.getElementById('profileType');
        
        if (profileName) profileName.textContent = user.name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileType) {
            const typeText = user.studentType === 'advanced' ? 
                (document.querySelector('.lang-en') ? 'Advanced Student' : '고급 학생') :
                (document.querySelector('.lang-en') ? 'General Student' : '일반 학생');
            profileType.textContent = typeText;
        }
    }
}

// Load Subjects Data
async function loadSubjects() {
    try {
        const response = await fetch('content/subjects.json');
        const subjects = await response.json();
        
        const container = document.getElementById('subjectsContainer');
        if (!container) return;
        
        container.innerHTML = subjects.map(subject => `
            <div class="subject-card" data-subject-id="${subject.id}">
                <div class="subject-header">
                    <i class="${subject.icon}"></i>
                    <h3>${subject.name}</h3>
                </div>
                <div class="subject-content">
                    <div class="difficulty-levels">
                        <button class="btn difficulty-btn high" onclick="startSubject('${subject.id}', 'high')">
                            ${document.querySelector('.lang-en') ? 'High Difficulty' : '고난이도'}
                        </button>
                        <button class="btn difficulty-btn medium" onclick="startSubject('${subject.id}', 'medium')">
                            ${document.querySelector('.lang-en') ? 'Medium Difficulty' : '중간 난이도'}
                        </button>
                        <button class="btn difficulty-btn low" onclick="startSubject('${subject.id}', 'low')">
                            ${document.querySelector('.lang-en') ? 'Low Difficulty' : '저난이도'}
                        </button>
                    </div>
                    <p>${subject.description}</p>
                    <button class="btn quiz-generator-btn" onclick="window.openQuizForSubject('${subject.id}')">
                        <i class="fas fa-question-circle"></i>
                        <span class="lang-en">Generate Quiz</span>
                        <span class="lang-ko" style="display:none;">퀴즈 생성</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

// Load AI Course Data
async function loadAICourse() {
    try {
        const response = await fetch('content/ai-course.json');
        const course = await response.json();
        
        // Update progress
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progress = calculateCourseProgress(course.modules);
            progressFill.style.width = `${progress}%`;
        }
        
        // Load modules
        const container = document.getElementById('courseModules');
        if (!container) return;
        
        container.innerHTML = course.modules.map(module => `
            <div class="module-card">
                <div class="module-header">
                    <div class="module-number">${module.day}</div>
                    <span class="module-status ${module.completed ? 'completed' : ''}">
                        ${module.completed ? 
                            (document.querySelector('.lang-en') ? 'Completed' : '완료') : 
                            (document.querySelector('.lang-en') ? 'Not Started' : '시작 전')}
                    </span>
                </div>
                <h3>${module.title}</h3>
                <p>${module.description}</p>
                <button class="btn btn-primary btn-small" onclick="startModule(${module.day})" 
                    style="margin-top: 20px;">
                    ${document.querySelector('.lang-en') ? 'Start Lesson' : '강의 시작'}
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading AI course:', error);
    }
}

// Calculate course progress
function calculateCourseProgress(modules) {
    const completed = modules.filter(module => module.completed).length;
    return (completed / modules.length) * 100;
}

// Start Subject Learning
function startSubject(subjectId, difficulty) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!user) {
        alert(document.querySelector('.lang-en') ? 'Please login first' : '먼저 로그인해주세요');
        window.location.href = 'login.html';
        return;
    }
    
    // Save current learning session
    const session = {
        subjectId,
        difficulty,
        startTime: new Date().toISOString(),
        studentType: user.studentType
    };
    
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    // Show AI chatbot for learning
    const chatbot = document.querySelector('.chatbot-widget');
    if (chatbot) {
        chatbot.classList.add('active');
    }
    
    // Initialize AI learning session
    const subjectName = getSubjectName(subjectId);
    const difficultyText = {
        high: document.querySelector('.lang-en') ? 'High' : '고급',
        medium: document.querySelector('.lang-en') ? 'Medium' : '중급',
        low: document.querySelector('.lang-en') ? 'Low' : '초급'
    }[difficulty];
    
    const welcomeMessage = document.querySelector('.lang-en') ? 
        `Hello! I'm your AI tutor for ${subjectName} (${difficultyText} difficulty). Let's start learning!` :
        `안녕하세요! 저는 ${subjectName}(${difficultyText} 난이도)의 AI 튜터입니다. 학습을 시작해볼까요?`;
    
    const messagesDiv = document.querySelector('.chat-messages');
    if (messagesDiv) {
        messagesDiv.innerHTML = `
            <div class="message ai">
                <div class="message-content">${welcomeMessage}</div>
            </div>
        `;
    }
}

// Get subject name by ID
function getSubjectName(id) {
    const subjects = {
        korean: document.querySelector('.lang-en') ? 'Korean' : '국어',
        math: document.querySelector('.lang-en') ? 'Mathematics' : '수학',
        english: document.querySelector('.lang-en') ? 'English' : '영어',
        social: document.querySelector('.lang-en') ? 'Social Studies' : '사회',
        science: document.querySelector('.lang-en') ? 'Science' : '과학',
        history: document.querySelector('.lang-en') ? 'Korean History' : '한국사'
    };
    return subjects[id] || id;
}

// Start AI Course Module
function startModule(day) {
    const moduleTitles = {
        1: document.querySelector('.lang-en') ? 'Basic Prompts' : '기본 프롬프트',
        2: document.querySelector('.lang-en') ? 'Goal Setting' : '목표 설정',
        3: document.querySelector('.lang-en') ? 'Concept Understanding' : '개념 이해',
        4: document.querySelector('.lang-en') ? 'Problem Solving' : '문제 해결',
        5: document.querySelector('.lang-en') ? 'Feedback' : '피드백',
        6: document.querySelector('.lang-en') ? 'Advanced Usage' : '고급 사용법',
        7: document.querySelector('.lang-en') ? 'Practice' : '실습'
    };
    
    alert(`${moduleTitles[day]} ${document.querySelector('.lang-en') ? 'module started!' : '모듈이 시작되었습니다!'}`);
    
    // Update module completion in localStorage
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        user.completedModules = user.completedModules || [];
        if (!user.completedModules.includes(day)) {
            user.completedModules.push(day);
            localStorage.setItem('currentUser', JSON.stringify(user));
            loadAICourse(); // Refresh course view
        }
    }
}

// FIXED: Global function to open quiz generator
window.openQuizForSubject = function(subjectId = null) {
    console.log('Opening quiz generator for subject:', subjectId);
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!user) {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        alert(isKorean ? '퀴즈를 생성하려면 먼저 로그인해주세요' : 'Please login first to generate quizzes');
        window.location.href = 'login.html';
        return;
    }
    
    // Check if quiz generator is loaded
    if (typeof window.quizGenerator !== 'undefined') {
        console.log('Quiz generator found, opening...');
        window.quizGenerator.openQuizGenerator(subjectId);
    } else {
        console.log('Quiz generator not loaded, loading now...');
        // Create and load quiz.js
        const script = document.createElement('script');
        script.src = 'js/quiz.js';
        script.onload = function() {
            console.log('quiz.js loaded successfully');
            // Wait a moment for initialization
            setTimeout(() => {
                if (typeof window.quizGenerator !== 'undefined') {
                    console.log('Opening quiz generator after load');
                    window.quizGenerator.openQuizGenerator(subjectId);
                } else {
                    console.error('quizGenerator still undefined after loading');
                    const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
                    alert(isKorean ? 
                        '퀴즈 생성기를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.' : 
                        'Failed to load quiz generator. Please refresh the page.');
                }
            }, 500);
        };
        
        script.onerror = function() {
            console.error('Failed to load quiz.js');
            const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
            alert(isKorean ? 
                '퀴즈 생성기 파일을 찾을 수 없습니다.' : 
                'Quiz generator file not found.');
        };
        
        document.head.appendChild(script);
    }
};

// FIXED: Global function to try chatbot
window.tryChatbot = function() {
    console.log('Opening chatbot...');
    const chatbot = document.querySelector('.chatbot-widget');
    if (chatbot) {
        chatbot.classList.add('active');
        console.log('Chatbot opened');
        
        // Focus on input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 100);
        }
    } else {
        console.error('Chatbot widget not found');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    
    // Load user stats if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        initDashboardStats();
    }
    
    // Load subjects if on subjects page
    if (window.location.pathname.includes('subjects.html')) {
        loadSubjects();
    }
    
    // Load AI course if on course page
    if (window.location.pathname.includes('ai-course.html')) {
        loadAICourse();
    }
    
    // Load profile data if on profile page
    if (window.location.pathname.includes('profile.html')) {
        initDashboardStats();
        loadProfileData();
    }
    
    // Fix all quiz buttons dynamically
    setTimeout(() => {
        fixAllQuizButtons();
        fixTryAIAssistantButton();
    }, 1000);
    
    // Ensure chatbot toggle is visible
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    if (chatbotToggle) {
        chatbotToggle.style.display = 'flex';
    }
    
    console.log('Initialization complete');
});

// Fix all quiz buttons
function fixAllQuizButtons() {
    console.log('Fixing all quiz buttons...');
    
    // Fix navigation quiz generator links
    document.querySelectorAll('.nav-link.quiz-generator-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navigation quiz button clicked');
            window.openQuizForSubject(null);
        });
    });
    
    // Fix homepage big quiz button
    document.querySelectorAll('.quiz-generator-btn.btn-large').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Homepage big quiz button clicked');
            window.openQuizForSubject(null);
        });
    });
    
    // Fix subject card quiz buttons
    document.querySelectorAll('.subject-card .quiz-generator-btn').forEach(button => {
        const subjectCard = button.closest('.subject-card');
        const subjectId = subjectCard ? subjectCard.dataset.subjectId : null;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Subject card quiz button clicked for subject:', subjectId);
            window.openQuizForSubject(subjectId);
        });
    });
}

// Fix Try AI Assistant button
function fixTryAIAssistantButton() {
    const tryChatbotBtn = document.querySelector('.try-chatbot-btn');
    if (tryChatbotBtn) {
        tryChatbotBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Try AI Assistant button clicked');
            window.tryChatbot();
        });
    }
}

// Load profile data
function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    // Populate form fields
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('studentType').value = user.studentType || 'general';
    document.getElementById('language').value = user.language || 'en';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentSession');
    window.location.href = 'index.html';
}