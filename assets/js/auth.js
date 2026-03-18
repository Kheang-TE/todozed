import Alert from './alert.js';

class Auth {
    
    constructor() {
        this.apiUrl = 'http://localhost:8000/api';
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.alert = new Alert();
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

            this.alert.error('Error checking authentication: ' + error.message);

        }
    }

    logout = async () => {

        try{

            const response = await this.fetchApi('/logout', { method: 'POST' });

            if(response.ok){
                window.location.href = 'index.html';
                sessionStorage.setItem('notification', JSON.stringify({type: 'success', message: 'Déconnexion réussie'}));
            }

        } catch (error){

            this.alert.error('Error logging out: ' + error.message);

        }
    }

    login = async (e) => {

        e.preventDefault();

        const formData = new FormData(e.target);

        const email = formData.get('email').toLowerCase().trim();
        const password = formData.get('password');

        if(!email || !password) {
            this.alert.error('Veuillez remplir tous les champs');
            return;
        }

        try {
            
            const response = await this.fetchApi('/login', { method: 'POST', body: { email, password } });
            const data = await response.json();

            if (response.ok) {
                window.location.href = 'board.html';
                sessionStorage.setItem('todozed', JSON.stringify({"filter":["all"]}));
                sessionStorage.setItem('notification', JSON.stringify({type: 'success', message: 'Connexion réussie'}));
            } else {
                this.alert.error(data.error || data.message || 'Login failed');
            }

        } catch (error) {

            this.alert.error('Error logging in: ' + error.message);

        }
    }

    register = async (e) => {
        
        e.preventDefault();

        const formData = new FormData(e.target);

        const email = formData.get('email').toLowerCase().trim();;
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if(password !== confirmPassword) {
            this.alert.error('Les mots de passe ne correspondent pas');
            return;
        }

        try {

            const response = await this.fetchApi('/register', { method: 'POST', body: { email, password, confirmPassword } });
            const data = await response.json();

            if (response.ok) {
                window.location.href = 'index.html';
                sessionStorage.setItem('notification', JSON.stringify({type: 'success', message: 'Inscription réussie'}));
            } else {
                this.alert.error(data.error || data.message || 'Echec de l\'inscription');
            }
            
        } catch (error) {

            this.alert.error('Error registering user: ' + error.message);

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

    notification = () => {
        const notification = sessionStorage.getItem('notification');
        if(notification) {
            const { type, message } = JSON.parse(notification);
            this.alert.show(message, type);
            sessionStorage.removeItem('notification');
        }
    }

    init = () => {
        this.isAuthenticated();
        this.initEvents();
        this.notification();
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    auth.init();
});