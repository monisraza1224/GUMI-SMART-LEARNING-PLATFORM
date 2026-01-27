// UI Fixes
document.addEventListener('DOMContentLoaded', () => {
    console.log('Applying UI fixes...');
    
    // Add logged-in class if user is logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.body.classList.add('logged-in');
    } else {
        document.body.classList.remove('logged-in');
    }
    
    // Make sure chatbot toggle is visible
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    if (chatbotToggle) {
        chatbotToggle.style.display = 'flex';
    }
    
    console.log('UI fixes applied');
});