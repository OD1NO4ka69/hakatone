window.onload = () => {
    if (document.cookie.includes('user=')) {
        window.location.href = '/main.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('/check-auth')
        .then((response) => response.json())
        .then((data) => {
            if (data.isAuthenticated) {
                window.location.href = 'http://127.0.0.1:5500/html/main.html'; // Перенаправляем на главную, если авторизован
            }
        })
        .catch((err) => console.error('Ошибка проверки авторизации:', err));
});

// Обработчик регистрации
document.querySelector('.registration-form').addEventListener('submit', async(e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                phone,
                password
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Регистрация успешна:', data); // Для отладки

            // Сохраняем user_id в localStorage
            localStorage.setItem('user_id', data.user_id);

            alert('Регистрация успешна!');

            // Переход на главную страницу
            window.location.href = 'http://127.0.0.1:5500/html/main.html';
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error.error}`);
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
    }
});

// Обработчик для входа
document.querySelector('.login-form').addEventListener('submit', async(e) => {
    e.preventDefault();

    const phone = e.target.phone.value;
    const password = e.target.password.value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone,
                password
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Успешный вход:', data); // Для отладки

            // Сохраняем user_id в localStorage
            localStorage.setItem('user_id', data.user_id);

            alert('Успешный вход!');

            // Переход на главную страницу
            window.location.href = 'http://127.0.0.1:5500/html/main.html';
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error.error}`);
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
    }
});

// Переключение между формами регистрации и логина
function toggleForms() {
    const registrationForm = document.querySelector('.registration-form');
    const loginForm = document.querySelector('.login-form');

    if (registrationForm.style.display === 'none') {
        loginForm.classList.add('hidden');
        registrationForm.classList.remove('hidden');
        setTimeout(() => {
            loginForm.style.display = 'none';
            registrationForm.style.display = 'block';
        }, 500);
    } else {
        registrationForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        setTimeout(() => {
            registrationForm.style.display = 'none';
            loginForm.style.display = 'block';
        }, 500);
    }
}