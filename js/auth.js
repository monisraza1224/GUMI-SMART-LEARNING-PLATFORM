// Authentication System for Gumi Smart Learning

// Check if user is logged in
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const protectedPages = ['dashboard.html', 'subjects.html', 'ai-course.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Redirect to dashboard if logged in and trying to access auth pages
    const authPages = ['login.html', 'register.html'];
    if (authPages.includes(currentPage) && currentUser) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// Registration Function
function registerUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const studentType = document.getElementById('studentType').value;
    const language = document.getElementById('language').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        alert(document.querySelector('.lang-en') ? 
            'Please fill in all fields' : '모든 필드를 입력해주세요');
        return;
    }
    
    if (password !== confirmPassword) {
        alert(document.querySelector('.lang-en') ? 
            'Passwords do not match' : '비밀번호가 일치하지 않습니다');
        return;
    }
    
    if (password.length < 6) {
        alert(document.querySelector('.lang-en') ? 
            'Password must be at least 6 characters' : '비밀번호는 최소 6자 이상이어야 합니다');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
        alert(document.querySelector('.lang-en') ? 
            'Email already registered' : '이미 등록된 이메일입니다');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: btoa(password), // Simple encoding (use proper hashing in production)
        studentType,
        language,
        createdAt: new Date().toISOString(),
        completedModules: [],
        learningProgress: {}
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Show success message
    alert(document.querySelector('.lang-en') ? 
        'Registration successful! Redirecting to dashboard...' : 
        '회원가입 성공! 대시보드로 이동합니다...');
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

// Login Function
function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
        alert(document.querySelector('.lang-en') ? 
            'Please enter email and password' : '이메일과 비밀번호를 입력해주세요');
        return;
    }
    
    // Find user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && atob(u.password) === password);
    
    if (!user) {
        alert(document.querySelector('.lang-en') ? 
            'Invalid email or password' : '잘못된 이메일 또는 비밀번호입니다');
        return;
    }
    
    // Set current user (remove password for security)
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    // Update language preference
    if (user.language) {
        const currentLang = localStorage.getItem('preferredLanguage') || 'en';
        if (user.language !== currentLang) {
            localStorage.setItem('preferredLanguage', user.language);
            location.reload();
        }
    }
    
    // Show success message
    alert(document.querySelector('.lang-en') ? 
        'Login successful! Redirecting...' : '로그인 성공! 이동합니다...');
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

// Update Profile Function
function updateProfile(event) {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert(document.querySelector('.lang-en') ? 
            'Please login first' : '먼저 로그인해주세요');
        window.location.href = 'login.html';
        return;
    }
    
    const name = document.getElementById('name').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const studentType = document.getElementById('studentType').value;
    const language = document.getElementById('language').value;
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) {
        alert(document.querySelector('.lang-en') ? 
            'User not found' : '사용자를 찾을 수 없습니다');
        return;
    }
    
    // Update basic info
    users[userIndex].name = name;
    users[userIndex].studentType = studentType;
    users[userIndex].language = language;
    
    // Update password if provided
    if (currentPassword && newPassword) {
        if (atob(users[userIndex].password) !== currentPassword) {
            alert(document.querySelector('.lang-en') ? 
                'Current password is incorrect' : '현재 비밀번호가 틀렸습니다');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert(document.querySelector('.lang-en') ? 
                'New passwords do not match' : '새 비밀번호가 일치하지 않습니다');
            return;
        }
        
        if (newPassword.length < 6) {
            alert(document.querySelector('.lang-en') ? 
                'Password must be at least 6 characters' : '비밀번호는 최소 6자 이상이어야 합니다');
            return;
        }
        
        users[userIndex].password = btoa(newPassword);
    }
    
    // Save updated users
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    const { password: _, ...userWithoutPassword } = users[userIndex];
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    // Update language if changed
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    if (language !== currentLang) {
        localStorage.setItem('preferredLanguage', language);
        alert(document.querySelector('.lang-en') ? 
            'Profile updated! Language changed, refreshing page...' : 
            '프로필 업데이트 완료! 언어가 변경되어 페이지를 새로고침합니다...');
        setTimeout(() => location.reload(), 1000);
    } else {
        alert(document.querySelector('.lang-en') ? 
            'Profile updated successfully!' : '프로필이 성공적으로 업데이트되었습니다!');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Add event listeners for forms
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (registerForm) {
        registerForm.addEventListener('submit', registerUser);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});