// // Обработчик регистрации
// document.querySelector('.registration-form').addEventListener('submit', async(e) => {
//     e.preventDefault();

//     const username = e.target.username.value;
//     const phone = e.target.phone.value;
//     const password = e.target.password.value;

//     try {
//         const API_URL = 'http://localhost:3000';

//         const response = await fetch(`${API_URL}/register`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, phone, password }),
//         });

//         if (response.ok) {
//             const data = await response.json();
//             console.log('Регистрация успешна:', data);
        
//             // Сохраняем user_id в localStorage
//             if (data.user_id) {
//                 localStorage.setItem('user_id', data.user_id);
//                 window.location.href = 'http://127.0.0.1:5500/html/main.html';
//             } else {
//                 console.error('Ошибка: user_id отсутствует в ответе сервера.');
//             }
//         } else {
//             const error = await response.json();
//             console.error('Ошибка регистрации:', error);
//             alert(`Ошибка: ${error.error}`);
//         }
//     } catch (error) {
//         console.error('Ошибка при регистрации:', error);
//     }
// });

// // Обработчик для входа
// document.querySelector('.login-form').addEventListener('submit', async(e) => {
//     e.preventDefault();

//     const phone = e.target.phone.value;
//     const password = e.target.password.value;

//     try {
//         const response = await fetch('http://localhost:3000/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 phone,
//                 password
//             }),
//         });

//         if (response.ok) {
//             const data = await response.json();
//             console.log('Успешный вход:', data); // Для отладки

//             // Сохраняем user_id в localStorage
//             localStorage.setItem('user_id', data.user_id);

//             alert('Успешный вход!');

//             // Переход на главную страницу
//             window.location.href = 'http://127.0.0.1:5500/html/main.html';
//         } else {
//             const error = await response.json();
//             alert(`Ошибка: ${error.error}`);
//         }
//     } catch (error) {
//         console.error('Ошибка при входе:', error);
//     }
// });



// Функция для показа/скрытия пароля
function show_hide_password(target) {
    const input = document.getElementById('password');
    const img = document.getElementById('pass-img-open');
    
    if (input.type === 'password') {
        input.type = 'text';
        img.src = '/images/close.png';
    } else {
        input.type = 'password';
        img.src = '/images/open.png';
    }
    return false;
}

function show_hide_password2(target) {
    const input = document.getElementById('password2');
    const img = document.getElementById('pass-img-open2');
    
    if (input.type === 'password') {
        input.type = 'text';
        img.src = '/images/close.png';
    } else {
        input.type = 'password';
        img.src = '/images/open.png';
    }
    return false;
}

// Функция для переключения между формами
function toggleForms() {
    const registrationForm = document.querySelector('.registration-form');
    const loginForm = document.querySelector('.login-form');
    
    if (registrationForm.style.display === 'none') {
        registrationForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        registrationForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

// Обработка отправки формы регистрации
// Обработка отправки формы регистрации
document.getElementById('registration-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const phone_number = document.getElementById('phone_number').value;
    const password = document.getElementById('password').value;

    console.log('Отправляемые данные:', { username, phone_number, password });

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, phone_number, password }),
        });

        const result = await response.json(); // Парсим ответ как JSON

        if (response.status === 200) {
            document.getElementById('success-message').textContent = result.message;
            document.getElementById('error-message').textContent = '';
            // Переход на главную страницу
            console.log('Redirecting to:', result.redirectUrl); // Логируем URL для редиректа
            window.location.replace("http://127.0.0.1:5500/html/main.html");  // Используем replace для явного редиректа
        } else {
            document.getElementById('error-message').textContent = result.message || 'Ошибка при регистрации.';
            document.getElementById('success-message').textContent = '';
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        document.getElementById('error-message').textContent = 'Ошибка при регистрации. Попробуйте позже.';
    }
});





// Обработка отправки формы входа
// Обработка отправки формы входа
// Обработка отправки формы входа
document.querySelector('.login-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Предотвращаем стандартное поведение формы

    // Сбор данных из формы
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password2').value;

    // Простая валидация
    if (!phone || !password) {
        alert('Заполните все поля');
        return;
    }

    // Отправка данных на сервер
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),  // Преобразуем данные в JSON
        credentials: 'include'  // Отправка cookies
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);  // Если ошибка, выводим сообщение
        } else {
            alert(data.message);  // Успех, выводим сообщение
            window.location.href = '/dashboard';  // Перенаправление после успешного входа
        }
    })
    .catch(error => {
        console.error('Ошибка при входе:', error);
        alert('Произошла ошибка при входе');
    });
});



