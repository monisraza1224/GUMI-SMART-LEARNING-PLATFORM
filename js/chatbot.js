// AI Chatbot for Learning Support
class AIChatbot {
    constructor() {
        this.apiKey = null;
        this.chatHistory = [];
        this.currentSubject = null;
        this.currentDifficulty = null;
        this.initializeChatbot();
        this.loadAPIKey();
    }

    async loadAPIKey() {
        // Load API key from loader
        this.apiKey = await window.apiLoader?.loadAPIKey() || 
                      localStorage.getItem('openai_api_key');
    }

    initializeChatbot() {
        // Get DOM elements
        this.chatToggle = document.querySelector('.chatbot-toggle');
        this.chatWidget = document.querySelector('.chatbot-widget');
        this.closeBtn = document.querySelector('.close-chatbot');
        this.sendBtn = document.getElementById('sendChat');
        this.chatInput = document.getElementById('chatInput');
        this.messagesDiv = document.querySelector('.chat-messages');

        // Add event listeners
        if (this.chatToggle) {
            this.chatToggle.addEventListener('click', () => this.toggleChat());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeChat());
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Check for active learning session
        this.checkActiveSession();
        
        // Make sure toggle button is visible
        if (this.chatToggle) {
            this.chatToggle.style.display = 'flex';
        }
    }

    toggleChat() {
        if (!this.chatWidget) {
            console.error('Chatbot widget not found');
            return;
        }
        
        this.chatWidget.classList.toggle('active');
        if (this.chatWidget.classList.contains('active')) {
            this.chatInput.focus();
            
            // Add welcome message if empty
            if (this.messagesDiv.children.length <= 1) {
                this.addWelcomeMessage();
            }
        }
    }

    closeChat() {
        this.chatWidget.classList.remove('active');
    }

    addWelcomeMessage() {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        const welcomeMsg = isKorean ? 
            "안녕하세요! 저는 구미 스마트 학습의 AI 학습 도우미입니다. 🎓\n\n" +
            "다음 주제에 대해 도와드릴 수 있습니다:\n" +
            "• 국어, 수학, 영어, 사회, 과학, 한국사 📚\n" +
            "• AI 프롬프팅 코스 (7일 과정) 🤖\n" +
            "• 퀴즈 생성 및 문제 해결 ❓\n\n" +
            "어떤 도움이 필요하신가요?" :
            
            "Hello! I'm your AI Learning Assistant for Gumi Smart Learning. 🎓\n\n" +
            "I can help you with:\n" +
            "• Korean, Math, English, Social Studies, Science, Korean History 📚\n" +
            "• AI Prompting Course (7-day course) 🤖\n" +
            "• Quiz generation and problem solving ❓\n\n" +
            "How can I help you today?";
        
        this.addMessage(welcomeMsg, 'ai');
    }

    checkActiveSession() {
        const session = JSON.parse(localStorage.getItem('currentSession'));
        if (session) {
            this.currentSubject = session.subjectId;
            this.currentDifficulty = session.difficulty;
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        // Check API key
        if (!this.apiKey || !this.apiKey.startsWith('sk-')) {
            this.addMessage(
                localStorage.getItem('preferredLanguage') === 'ko' ?
                    'API 키를 불러오는 중입니다. 잠시만 기다려주세요...' :
                    'Loading API key. Please wait...',
                'ai'
            );
            this.apiKey = await window.apiLoader?.loadAPIKey();
            
            if (!this.apiKey || !this.apiKey.startsWith('sk-')) {
                this.addMessage(
                    localStorage.getItem('preferredLanguage') === 'ko' ?
                        'API 키를 찾을 수 없습니다. 설정에서 API 키를 추가해주세요.' :
                        'API key not found. Please add your API key in settings.',
                    'ai'
                );
                return;
            }
        }

        // Show loading indicator
        const loadingId = this.showLoading();

        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('Chatbot error:', error);
            this.handleChatbotError(error);
        } finally {
            this.removeLoading(loadingId);
        }
    }

    addMessage(content, sender) {
        if (!this.messagesDiv) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        this.messagesDiv.appendChild(messageDiv);
        
        // Scroll to bottom
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
        
        // Add to history (limit to last 10 messages)
        this.chatHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content });
        if (this.chatHistory.length > 10) {
            this.chatHistory = this.chatHistory.slice(-10);
        }
    }

    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai loading';
        loadingDiv.id = 'loading-' + Date.now();
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
            (document.querySelector('.lang-en') ? 'Thinking...' : '생각 중...');
        
        loadingDiv.appendChild(contentDiv);
        this.messagesDiv.appendChild(loadingDiv);
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
        
        return loadingDiv.id;
    }

    removeLoading(id) {
        const loadingElement = document.getElementById(id);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    async getAIResponse(userMessage) {
        // Check API key
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        // Prepare system message based on context
        const systemMessage = this.getSystemMessage();
        
        // Prepare messages for API
        const messages = [
            { role: 'system', content: systemMessage },
            ...this.chatHistory.slice(-10),
            { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API error ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    getSystemMessage() {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        
        if (this.currentSubject && this.currentDifficulty) {
            const subjectName = this.getSubjectName(this.currentSubject);
            const difficultyText = {
                high: isKorean ? '고급' : 'High',
                medium: isKorean ? '중급' : 'Medium',
                low: isKorean ? '초급' : 'Low'
            }[this.currentDifficulty];

            return isKorean ? 
                `당신은 ${subjectName} 과목의 ${difficultyText} 난이도 전문 AI 교사입니다. 
                학생에게 개념을 명확하게 설명하고, 단계별로 문제를 해결하는 방법을 가르쳐주세요.
                친절하고 격려하며 긍정적인 피드백을 제공하세요. 항상 한국어로 대답하세요.` :
                `You are an expert AI teacher for ${subjectName} subject at ${difficultyText} difficulty level.
                Explain concepts clearly to the student, teach problem-solving step by step.
                Be friendly, encouraging and provide positive feedback. Always respond in English.`;
        }

        // General AI assistant for all subjects and AI course
        return isKorean ? 
            `당신은 구미 스마트 학습 플랫폼의 AI 학습 도우미입니다.
            다음 6개 과목을 전문으로 합니다: 국어, 수학, 영어, 사회, 과학, 한국사.
            7일 AI 프롬프팅 코스에 대해서도 도와드릴 수 있습니다.
            학생들의 학습을 돕고, 질문에 답변하며, 효과적인 학습 방법을 제안해주세요.
            친절하고 전문적으로 대답하며 항상 한국어를 사용하세요.
            복잡한 개념은 단계별로 설명해주세요.` :
            `You are an AI learning assistant for Gumi Smart Learning Platform.
            You specialize in 6 subjects: Korean, Mathematics, English, Social Studies, Science, Korean History.
            You can also help with the 7-day AI Prompting Course.
            Help students with their learning, answer questions, and suggest effective study methods.
            Respond in a friendly and professional manner, always in English.
            Explain complex concepts step by step.`;
    }

    getSubjectName(subjectId) {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        const subjects = {
            korean: isKorean ? '국어' : 'Korean',
            math: isKorean ? '수학' : 'Mathematics',
            english: isKorean ? '영어' : 'English',
            social: isKorean ? '사회' : 'Social Studies',
            science: isKorean ? '과학' : 'Science',
            history: isKorean ? '한국사' : 'Korean History'
        };
        return subjects[subjectId] || subjectId;
    }

    handleChatbotError(error) {
        console.error('Chatbot error:', error);
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        
        if (error.message.includes('API key') || error.message.includes('401')) {
            this.addMessage(
                isKorean ? 
                    'API 키에 문제가 있습니다. 설정에서 API 키를 확인해주세요.' :
                    'There is a problem with your API key. Please check it in settings.',
                'ai'
            );
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            this.addMessage(
                isKorean ? 
                    '요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.' :
                    'Rate limit exceeded. Please try again in a moment.',
                'ai'
            );
        } else if (error.message.includes('network')) {
            this.addMessage(
                isKorean ? 
                    '네트워크 오류입니다. 인터넷 연결을 확인해주세요.' :
                    'Network error. Please check your internet connection.',
                'ai'
            );
        } else {
            this.addMessage(
                isKorean ? 
                    '죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.' :
                    'Sorry, I encountered an error. Please try again.',
                'ai'
            );
        }
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const chatbot = new AIChatbot();
        
        // Make sure toggle button is visible
        const chatbotToggle = document.querySelector('.chatbot-toggle');
        if (chatbotToggle) {
            chatbotToggle.style.display = 'flex';
        }
    }, 1000);
});