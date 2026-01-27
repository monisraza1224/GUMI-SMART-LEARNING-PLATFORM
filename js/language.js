// Language Switching System
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
        this.initialize();
    }

    initialize() {
        // Set initial language
        this.switchLanguage(this.currentLang);
        
        // Add event listeners to language buttons
        document.querySelectorAll('.lang-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);
                localStorage.setItem('preferredLanguage', lang);
                
                // Update user language preference if logged in
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user) {
                    user.language = lang;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    // Update in users array
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const userIndex = users.findIndex(u => u.id === user.id);
                    if (userIndex !== -1) {
                        users[userIndex].language = lang;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                }
            });
        });
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(button => {
            if (button.dataset.lang === lang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Show/hide language-specific elements
        document.querySelectorAll('.lang-en, .lang-ko').forEach(element => {
            if (element.classList.contains(`lang-${lang}`)) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
        
        // Update page titles
        this.updatePageTitle(lang);
        
        // Update form placeholders
        this.updateFormPlaceholders(lang);
        
        // Update AI course progress text
        this.updateProgressText(lang);
    }

    updatePageTitle(lang) {
        const titles = {
            'index.html': {
                en: 'Gumi Smart Learning Support Service',
                ko: '구미 스마트 학습 지원 서비스'
            },
            'dashboard.html': {
                en: 'Dashboard - Gumi Smart Learning',
                ko: '대시보드 - 구미 스마트 학습'
            },
            'subjects.html': {
                en: 'Subjects - Gumi Smart Learning',
                ko: '과목 - 구미 스마트 학습'
            },
            'ai-course.html': {
                en: 'AI Course - Gumi Smart Learning',
                ko: 'AI 코스 - 구미 스마트 학습'
            },
            'login.html': {
                en: 'Login - Gumi Smart Learning',
                ko: '로그인 - 구미 스마트 학습'
            },
            'register.html': {
                en: 'Register - Gumi Smart Learning',
                ko: '회원가입 - 구미 스마트 학습'
            },
            'profile.html': {
                en: 'Profile - Gumi Smart Learning',
                ko: '프로필 - 구미 스마트 학습'
            }
        };
        
        const currentPage = window.location.pathname.split('/').pop();
        if (titles[currentPage]) {
            document.title = titles[currentPage][lang];
        }
    }

    updateFormPlaceholders(lang) {
        const placeholders = {
            en: {
                name: 'Full Name',
                email: 'Email Address',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                currentPassword: 'Current Password',
                newPassword: 'New Password',
                confirmNewPassword: 'Confirm New Password',
                search: 'Search subjects...',
                chat: 'Type your question...'
            },
            ko: {
                name: '전체 이름',
                email: '이메일 주소',
                password: '비밀번호',
                confirmPassword: '비밀번호 확인',
                currentPassword: '현재 비밀번호',
                newPassword: '새 비밀번호',
                confirmNewPassword: '새 비밀번호 확인',
                search: '과목 검색...',
                chat: '질문을 입력하세요...'
            }
        };
        
        document.querySelectorAll('[id]').forEach(input => {
            const id = input.id;
            if (placeholders[lang][id] && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
                input.placeholder = placeholders[lang][id];
            }
        });
    }

    updateProgressText(lang) {
        const progressElements = document.querySelectorAll('.module-status');
        progressElements.forEach(element => {
            if (element.classList.contains('completed')) {
                element.textContent = lang === 'en' ? 'Completed' : '완료';
            } else {
                element.textContent = lang === 'en' ? 'Not Started' : '시작 전';
            }
        });
    }
}

// Initialize language manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LanguageManager();
});