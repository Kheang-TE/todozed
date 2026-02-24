const isAuthenticated = async () => {

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    try {

        const response = await fetch('http://localhost:8000/api/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {

            if (currentPage === 'index.html' || currentPage === 'register.html') {
                window.location.href = 'board.html';
            }

        } else {

            if (currentPage === 'board.html') {
                window.location.href = 'index.html';
            }

        }

    } catch (error) {

        console.log('Error authentication:', error);

    }
}

const logout = async () => {
    try{

        const response = await fetch('http://localhost:8000/api/logout', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if(response.ok){
            window.location.href = 'index.html';
        }

    } catch (error){

        console.log('Error logout:', error.message);

    }
}

isAuthenticated();

if(document.getElementById('logout-button')){
    document.getElementById('logout-button').addEventListener('click', logout);
}