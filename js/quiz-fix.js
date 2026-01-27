// Quiz Generator Fix - Simple and Reliable
document.addEventListener('DOMContentLoaded', function() {
    console.log('Quiz fix loaded');
    
    // Fix ALL Quiz Generator buttons
    function fixQuizButtons() {
        console.log('Fixing quiz buttons...');
        
        // 1. Fix navigation Quiz Generator links
        document.querySelectorAll('.nav-link.quiz-generator-btn').forEach(link => {
            link.onclick = function(e) {
                e.preventDefault();
                console.log('Quiz Generator nav clicked');
                openQuizGenerator();
            };
        });
        
        // 2. Fix homepage Quiz Generator buttons
        document.querySelectorAll('.quiz-generator-btn:not(.nav-link)').forEach(button => {
            button.onclick = function(e) {
                e.preventDefault();
                console.log('Quiz Generator button clicked');
                openQuizGenerator();
            };
        });
        
        // 3. Fix Try AI Assistant button
        document.querySelectorAll('.try-chatbot-btn').forEach(button => {
            button.onclick = function(e) {
                e.preventDefault();
                console.log('Try AI Assistant clicked');
                const chatbot = document.querySelector('.chatbot-widget');
                if (chatbot) {
                    chatbot.classList.add('active');
                }
            };
        });
    }
    
    // Function to open quiz generator
    function openQuizGenerator(subjectId = null) {
        console.log('Opening quiz generator...');
        
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
            alert(isKorean ? '퀴즈를 생성하려면 먼저 로그인해주세요' : 'Please login first to generate quizzes');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if quiz generator is loaded
        if (typeof window.quizGenerator === 'undefined') {
            console.log('Loading quiz generator...');
            
            // Create modal to show loading
            showLoadingModal();
            
            // Load quiz.js
            const script = document.createElement('script');
            script.src = 'js/quiz.js';
            script.onload = function() {
                console.log('quiz.js loaded');
                hideLoadingModal();
                
                // Wait a bit for initialization
                setTimeout(() => {
                    if (typeof window.quizGenerator !== 'undefined') {
                        window.quizGenerator.openQuizGenerator(subjectId);
                    } else {
                        alert('Quiz generator failed to load. Please refresh the page.');
                    }
                }, 300);
            };
            
            script.onerror = function() {
                hideLoadingModal();
                alert('Failed to load quiz generator. Please check console for errors.');
            };
            
            document.head.appendChild(script);
        } else {
            console.log('Quiz generator already loaded');
            window.quizGenerator.openQuizGenerator(subjectId);
        }
    }
    
    // Loading modal functions
    function showLoadingModal() {
        const modal = document.createElement('div');
        modal.id = 'quiz-loading-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                <div class="fa-spin" style="font-size: 40px; margin-bottom: 20px;">⏳</div>
                <p>Loading Quiz Generator...</p>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    function hideLoadingModal() {
        const modal = document.getElementById('quiz-loading-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Make functions available globally
    window.openQuizGenerator = openQuizGenerator;
    window.openQuizForSubject = openQuizGenerator;
    window.tryChatbot = function() {
        const chatbot = document.querySelector('.chatbot-widget');
        if (chatbot) {
            chatbot.classList.add('active');
        }
    };
    
    // Run the fix
    setTimeout(fixQuizButtons, 1000);
    
    console.log('Quiz fix initialized');
});