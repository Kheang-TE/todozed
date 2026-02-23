document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const email = formData.get('email').toLowerCase().trim();
    const password = formData.get('password');

    try {
        
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies in the request
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = 'board.html';
        } else {
            alert(data.error || data.message || 'Login failed');
        }

    } catch (error) {

        alert('Error logging in: ' + error.message);

    }

});