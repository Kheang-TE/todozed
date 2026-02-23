document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const email = formData.get('email').toLowerCase().trim();;
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    if(password !== confirmPassword) {
        return alert('Passwords do not match');
    }

    try {

        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            alert(data.error || data.message || 'Registration failed');
        }
        
    } catch (error) {

        console.log('Error registering user:', error.message);

    }

});