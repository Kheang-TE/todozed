class Auth {
    
    constructor() {
        this.apiUrl = 'http://localhost:8000/api';
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
    }

    fetchApi = async (endpoint, options = {}) => {

        const config = {
            method: options.method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        };

        if (config.method !== 'GET' && options.body) {
            config.body = JSON.stringify(options.body);
        }

        return await fetch(`${this.apiUrl}${endpoint}`, config);

    }
    
    isAuthenticated = async () => {

        try {

            const response = await this.fetchApi('/me', { method: 'GET' });

            if (response.ok) {

                if (this.currentPage === 'index.html' || this.currentPage === 'register.html') {
                    window.location.href = 'board.html';
                }
                const data = await response.json();
                document.querySelector('.profile .username span').textContent = data.email;

            } else {

                if (this.currentPage === 'board.html') {
                    window.location.href = 'index.html';
                }

            }

        } catch (error) {

            console.log('Error authentication:', error);

        }
    }

    logout = async () => {

        try{

            const response = await this.fetchApi('/logout', { method: 'POST' });

            if(response.ok){
                localStorage.clear();
                window.location.href = 'index.html';
            }

        } catch (error){

            console.log('Error logout:', error.message);

        }
    }

    login = async (e) => {

        e.preventDefault();

        const formData = new FormData(e.target);

        const email = formData.get('email').toLowerCase().trim();
        const password = formData.get('password');

        try {
            
            const response = await this.fetchApi('/login', { method: 'POST', body: { email, password } });
            const data = await response.json();

            if (response.ok) {
                window.location.href = 'board.html';
                localStorage.setItem('todozed', JSON.stringify({"filter":["all"]}));
            } else {
                alert(data.error || data.message || 'Login failed');
            }

        } catch (error) {

            alert('Error logging in: ' + error.message);

        }
    }

    register = async (e) => {
        
        e.preventDefault();

        const formData = new FormData(e.target);

        const email = formData.get('email').toLowerCase().trim();;
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if(password !== confirmPassword) {
            return alert('Passwords do not match');
        }

        try {

            const response = await this.fetchApi('/register', { method: 'POST', body: { email, password, confirmPassword } });
            const data = await response.json();

            if (response.ok) {
                window.location.href = 'index.html';
            } else {
                alert(data.error || data.message || 'Registration failed');
            }
            
        } catch (error) {

            console.log('Error registering user:', error.message);

        }
    }

    initEvents = () => {
        // Logout button
        document.getElementById('logout-button')?.addEventListener('click', this.logout);

        // Login form
        document.querySelector('#login form')?.addEventListener('submit', async (e) => {
            this.login(e);
        });

        // Register form
        document.querySelector('#register form')?.addEventListener('submit', async (e) => {
            this.register(e);
        });
    }

    init = () => {
        this.isAuthenticated();
        this.initEvents();
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    auth.init();
});