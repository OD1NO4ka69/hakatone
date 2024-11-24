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