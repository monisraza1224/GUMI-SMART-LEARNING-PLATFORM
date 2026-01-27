// API Key Loader from .env file
class APILoader {
    constructor() {
        this.apiKey = null;
        this.loading = false;
        this.init();
    }

    async init() {
        await this.loadAPIKey();
    }

    async loadAPIKey() {
        if (this.loading) return null;
        
        this.loading = true;
        
        try {
            // Try to get from server
            const response = await fetch('/api/get-apikey');
            if (response.ok) {
                const data = await response.json();
                if (data.apiKey && data.apiKey.startsWith('sk-')) {
                    this.apiKey = data.apiKey;
                    localStorage.setItem('openai_api_key', this.apiKey);
                    console.log('API key loaded from server');
                    return this.apiKey;
                }
            }
        } catch (error) {
            console.log('Could not load API key from server:', error);
        }
        
        // Fallback to localStorage
        this.apiKey = localStorage.getItem('openai_api_key');
        this.loading = false;
        return this.apiKey;
    }

    getAPIKey() {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('openai_api_key');
        }
        return this.apiKey;
    }

    hasValidKey() {
        const key = this.getAPIKey();
        return key && key.startsWith('sk-') && key.length > 20;
    }

    promptForAPIKey() {
        const isKorean = localStorage.getItem('preferredLanguage') === 'ko';
        const message = isKorean ? 
            'OpenAI API 키를 입력해주세요 (sk-로 시작하는 키):' :
            'Please enter your OpenAI API key (key starting with sk-):';
        
        const key = prompt(message);
        if (key && key.trim() && key.startsWith('sk-')) {
            this.apiKey = key.trim();
            localStorage.setItem('openai_api_key', this.apiKey);
            return true;
        } else {
            alert(isKorean ? 
                '유효한 API 키가 필요합니다 (sk-로 시작)' :
                'Valid API key required (starts with sk-)');
            return false;
        }
    }

    ensureAPIKey() {
        if (!this.hasValidKey()) {
            return this.promptForAPIKey();
        }
        return true;
    }
}

// Global instance
window.apiLoader = new APILoader();