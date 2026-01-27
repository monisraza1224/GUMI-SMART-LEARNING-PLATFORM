// Quiz Generator System with Question Types
class QuizGenerator {
    constructor() {
        this.apiKey = null;
        this.initializeQuiz();
        this.loadAPIKey();
    }

    async loadAPIKey() {
        // First try to get from .env via server
        try {
            const response = await fetch('/api/get-apikey');
            if (response.ok) {
                const data = await response.json();
                if (data.apiKey) {
                    this.apiKey = data.apiKey;
                    localStorage.setItem('openai_api_key', this.apiKey);
                    console.log('API key loaded from .env');
                    return;
                }
            }
        } catch (error) {
            console.log('Could not load API from server, using localStorage');
        }
        
        // Fallback to localStorage
        this.apiKey = localStorage.getItem('openai_api_key');
    }

    initializeQuiz() {
        console.log('QuizGenerator initialized');
        
        // Fix quiz buttons
        this.fixQuizButtons();
        
        // Add styles
        this.addQuizStyles();
    }

    fixQuizButtons() {
        // Fix navigation quiz button
        document.querySelectorAll('.nav-link.quiz-generator-btn').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openQuizGenerator();
            };
        });
        
        // Fix subject card quiz buttons
        document.querySelectorAll('.subject-card .quiz-generator-btn').forEach(button => {
            if (!button.onclick) {
                button.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const subjectCard = button.closest('.subject-card');
                    const subjectId = subjectCard ? subjectCard.dataset.subjectId : null;
                    this.openQuizGenerator(subjectId);
                };
            }
        });
        
        // Fix homepage quiz button
        document.querySelectorAll('.quiz-generator-btn.btn-large').forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openQuizGenerator();
            };
        });
    }

    openQuizGenerator(subjectId = null, difficulty = null) {
        console.log('Opening quiz generator for subject:', subjectId);
        
        // Check login
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
            alert(isKorean ? '퀴즈를 생성하려면 먼저 로그인해주세요' : 'Please login first to generate quizzes');
            window.location.href = 'login.html';
            return;
        }
        
        // Create quiz modal
        const modal = this.createQuizModal(subjectId, difficulty);
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.querySelector('.quiz-modal-content').style.transform = 'translate(-50%, -50%) scale(1)';
                modal.querySelector('.quiz-modal-content').style.opacity = '1';
            }, 10);
        }, 10);
    }

    createQuizModal(subjectId, difficulty) {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        
        const modal = document.createElement('div');
        modal.className = 'quiz-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        `;
        
        const content = document.createElement('div');
        content.className = 'quiz-modal-content';
        content.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: white;
            padding: 30px;
            border-radius: var(--border-radius);
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        content.innerHTML = `
            <div class="quiz-modal-header">
                <h2>${isKorean ? 'AI 퀴즈 생성기' : 'AI Quiz Generator'}</h2>
                <button class="close-quiz-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">×</button>
            </div>
            
            <div class="quiz-form">
                <div class="form-group">
                    <label>${isKorean ? '과목 선택' : 'Select Subject'}</label>
                    <select id="quizSubject" class="form-select">
                        <option value="">${isKorean ? '과목 선택' : 'Select a subject'}</option>
                        <option value="korean">${isKorean ? '국어' : 'Korean'}</option>
                        <option value="math">${isKorean ? '수학' : 'Mathematics'}</option>
                        <option value="english">${isKorean ? '영어' : 'English'}</option>
                        <option value="social">${isKorean ? '사회' : 'Social Studies'}</option>
                        <option value="science">${isKorean ? '과학' : 'Science'}</option>
                        <option value="history">${isKorean ? '한국사' : 'Korean History'}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>${isKorean ? '문항 유형' : 'Question Types'}</label>
                    <div style="display: flex; gap: 15px; margin-top: 10px;">
                        <label style="display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="typeMcq" checked> 
                            ${isKorean ? '객관식' : 'MCQ'}
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="typeShort"> 
                            ${isKorean ? '단답형' : 'Short'}
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="typeEssay"> 
                            ${isKorean ? '서술형' : 'Essay'}
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>${isKorean ? '난이도' : 'Difficulty Level'}</label>
                    <select id="quizDifficulty" class="form-select">
                        <option value="beginner">${isKorean ? '초급' : 'Beginner'}</option>
                        <option value="intermediate" selected>${isKorean ? '중급' : 'Intermediate'}</option>
                        <option value="advanced">${isKorean ? '고급' : 'Advanced'}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>${isKorean ? '문제 수' : 'Number of Questions'}</label>
                    <select id="quizCount" class="form-select">
                        <option value="5">5</option>
                        <option value="10" selected>10</option>
                        <option value="15">15</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>${isKorean ? '주제 (선택사항)' : 'Topic (Optional)'}</label>
                    <input type="text" id="quizTopic" class="form-control" placeholder="${isKorean ? '예: 이차방정식' : 'e.g., Quadratic equations'}">
                </div>
                
                <div class="quiz-buttons">
                    <button class="btn btn-primary generate-quiz-btn-modal" style="width: 100%; margin-top: 20px;">
                        <i class="fas fa-magic"></i> ${isKorean ? '퀴즈 생성하기' : 'Generate Quiz'}
                    </button>
                </div>
            </div>
            
            <div class="quiz-results" style="display: none; margin-top: 30px;">
                <div class="quiz-loading" style="text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p style="margin-top: 10px;">${isKorean ? 'AI가 퀴즈를 생성 중입니다...' : 'AI is generating your quiz...'}</p>
                </div>
                <div class="quiz-content" style="display: none;"></div>
            </div>
        `;
        
        modal.appendChild(content);
        
        // Set initial values if provided
        if (subjectId) {
            content.querySelector('#quizSubject').value = subjectId;
        }
        if (difficulty) {
            content.querySelector('#quizDifficulty').value = difficulty;
        }
        
        // Add event listeners
        const closeBtn = content.querySelector('.close-quiz-modal');
        closeBtn.addEventListener('click', () => this.closeQuizModal(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeQuizModal(modal);
            }
        });
        
        const generateBtn = content.querySelector('.generate-quiz-btn-modal');
        generateBtn.addEventListener('click', () => this.generateQuiz(content));
        
        return modal;
    }

    closeQuizModal(modal) {
        modal.querySelector('.quiz-modal-content').style.transform = 'translate(-50%, -50%) scale(0.9)';
        modal.querySelector('.quiz-modal-content').style.opacity = '0';
        
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    async generateQuiz(modalContent) {
        const subject = modalContent.querySelector('#quizSubject').value;
        const difficulty = modalContent.querySelector('#quizDifficulty').value;
        const count = modalContent.querySelector('#quizCount').value;
        const topic = modalContent.querySelector('#quizTopic').value;
        
        // Get question types
        const types = [];
        if (modalContent.querySelector('#typeMcq').checked) types.push('mcq');
        if (modalContent.querySelector('#typeShort').checked) types.push('short');
        if (modalContent.querySelector('#typeEssay').checked) types.push('essay');
        
        if (!subject) {
            const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
            alert(isKorean ? '과목을 선택해주세요' : 'Please select a subject');
            return;
        }
        
        if (types.length === 0) {
            const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
            alert(isKorean ? '문항 유형을 선택해주세요' : 'Please select question types');
            return;
        }
        
        // Check API key
        if (!this.apiKey) {
            const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
            const apiKey = prompt(
                isKorean ? 
                    'OpenAI API 키를 입력해주세요:' :
                    'Please enter your OpenAI API key:'
            );
            
            if (apiKey && apiKey.trim()) {
                this.apiKey = apiKey.trim();
                localStorage.setItem('openai_api_key', this.apiKey);
            } else {
                alert(isKorean ? 'API 키가 필요합니다' : 'API key is required');
                return;
            }
        }
        
        // Show loading
        const resultsDiv = modalContent.querySelector('.quiz-results');
        const loadingDiv = modalContent.querySelector('.quiz-loading');
        const contentDiv = modalContent.querySelector('.quiz-content');
        const formDiv = modalContent.querySelector('.quiz-form');
        
        resultsDiv.style.display = 'block';
        loadingDiv.style.display = 'block';
        contentDiv.style.display = 'none';
        formDiv.style.display = 'none';
        contentDiv.innerHTML = '';
        
        try {
            const quizData = await this.generateQuizWithAI(subject, difficulty, count, topic, types);
            this.displayQuiz(quizData, contentDiv);
            
            loadingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
            
            // Scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Quiz generation error:', error);
            loadingDiv.innerHTML = `
                <div style="color: var(--danger-color); text-align: center;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${document.querySelector('.lang-en') ? 
                        'Failed to generate quiz. Please try again.' : 
                        '퀴즈 생성에 실패했습니다. 다시 시도해주세요.'}</p>
                    <p style="font-size: 0.8rem;">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    async generateQuizWithAI(subject, difficulty, count, topic, types) {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        
        const subjectNames = {
            korean: isKorean ? '국어' : 'Korean',
            math: isKorean ? '수학' : 'Mathematics',
            english: isKorean ? '영어' : 'English',
            social: isKorean ? '사회' : 'Social Studies',
            science: isKorean ? '과학' : 'Science',
            history: isKorean ? '한국사' : 'Korean History'
        };
        
        const difficultyNames = {
            beginner: isKorean ? '초급' : 'Beginner',
            intermediate: isKorean ? '중급' : 'Intermediate',
            advanced: isKorean ? '고급' : 'Advanced'
        };
        
        // Build a simple prompt
        let prompt = `Create a quiz for ${subjectNames[subject]} at ${difficulty} level. `;
        prompt += `Generate ${count} questions. `;
        if (topic) prompt += `Topic: ${topic}. `;
        prompt += `Include multiple choice, short answer, and essay questions. `;
        prompt += `Format the response as clear text with numbered questions, answers, and explanations.`;
        
        console.log('Sending prompt to OpenAI:', prompt);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API error: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Return simple object with text content
        return {
            subject: subjectNames[subject],
            difficulty: difficultyNames[difficulty],
            topic: topic || (isKorean ? '일반' : 'General'),
            content: content
        };
    }

    displayQuiz(quizData, container) {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        
        let html = `
            <div class="quiz-header" style="text-align: center; margin-bottom: 20px;">
                <h3>${quizData.subject} ${isKorean ? '퀴즈' : 'Quiz'}</h3>
                <p style="color: var(--gray-color); margin: 5px 0;">
                    ${isKorean ? '난이도' : 'Difficulty'}: ${quizData.difficulty}
                </p>
                ${quizData.topic ? `<p style="color: var(--gray-color); margin: 5px 0;">
                    ${isKorean ? '주제' : 'Topic'}: ${quizData.topic}
                </p>` : ''}
            </div>
            
            <div class="quiz-content-text" style="white-space: pre-wrap; padding: 20px; background: #f9f9f9; border-radius: 8px; line-height: 1.6; font-size: 0.95rem;">
                ${quizData.content}
            </div>
            
            <div class="quiz-actions" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <button class="btn btn-primary" onclick="window.print()" style="margin-right: 10px;">
                    <i class="fas fa-print"></i> ${isKorean ? '인쇄' : 'Print'}
                </button>
                <button class="btn btn-outline" onclick="location.reload()">
                    <i class="fas fa-redo"></i> ${isKorean ? '새 퀴즈' : 'New Quiz'}
                </button>
            </div>
        `;
        
        container.innerHTML = html;
    }

    addQuizStyles() {
        if (!document.getElementById('quiz-styles')) {
            const style = document.createElement('style');
            style.id = 'quiz-styles';
            style.textContent = `
                .quiz-generator-btn {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                
                .quiz-generator-btn:hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    transform: translateY(-2px);
                }
                
                .quiz-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .quiz-modal-header h2 {
                    margin: 0;
                    color: var(--dark-color);
                    font-size: 1.3rem;
                }
                
                .close-quiz-modal {
                    font-size: 1.5rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    transition: color 0.3s ease;
                }
                
                .close-quiz-modal:hover {
                    color: var(--dark-color);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize quiz generator when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Loading Quiz Generator...');
    window.quizGenerator = new QuizGenerator();
    
    // Make it globally accessible
    window.openQuizForSubject = function(subjectId) {
        if (window.quizGenerator) {
            window.quizGenerator.openQuizGenerator(subjectId);
        } else {
            alert('Quiz generator is loading. Please wait...');
        }
    };
    
    console.log('Quiz Generator ready');
});