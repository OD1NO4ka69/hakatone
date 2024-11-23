document.addEventListener('DOMContentLoaded', () => {
    fetchUserId(); // Вызов функции для получения userId
});

async function fetchUserId() {
    try {
        const response = await fetch('http://localhost:3000/api/get-user-id', {
            method: 'GET',
            credentials: 'include',  // Включаем cookies
        });

        if (!response.ok) {
            throw new Error('Не удалось получить userId');
        }

        const data = await response.json();
        console.log('User ID:', data.userId);  // Выводим полученный userId
    } catch (error) {
        console.error('Ошибка при получении userId:', error.message);  // Логируем ошибку
    }
}

fetchUserId();

async function fetchHistory(userId) {
    try {
        const response = await fetch(`http://localhost:3000/get-history?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки истории: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка при получении истории:', error);
        return [];
    }
}

async function displayHistory() {
    const userId = localStorage.getItem('userId'); // Получаем userId из localStorage
    if (!userId) {
        console.error('User ID не найден');
        return;
    }

    try {
        const history = await fetchHistory(userId); // Передаем userId в fetchHistory
        const historyContainer = document.querySelector('.history-container');
        historyContainer.innerHTML = '';

        history.forEach((transaction) => {
            const li = document.createElement('li');
            li.classList.add(transaction.type === 'income' ? 'pos' : 'neg');
            li.innerHTML = `
                <h3>${transaction.type === 'income' ? 'Доходы' : 'Расходы'}</h3>
                <p>${transaction.category}:</p>
                <p>${transaction.amount}р</p>
                <p>${new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
            `;
            historyContainer.appendChild(li);
        });
    } catch (error) {
        console.error('Ошибка при обновлении истории:', error);
    }
}

// Запрос ID пользователя при загрузке страницы
fetchUserId();
