async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/api/get_wallet_data');  // Исправили URL
        console.log('Статус ответа:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Полученные данные:', data);

            const incomeElement = document.querySelector('.income-wallet p:nth-child(2)');
            const expenseElement = document.querySelector('.expense-wallet p:nth-child(2)');
            const freeElement = document.querySelector('.all-wallet p');

            if (incomeElement) incomeElement.textContent = `за сегодня: ${data.income}р`;
            if (expenseElement) expenseElement.textContent = `за сегодня: ${data.expense || 0}р`;

            const freeMoney = data.income - (data.expense || 0);
            if (freeElement) freeElement.textContent = `${freeMoney}р`;
        } else {
            console.error('Ошибка при получении данных: ' + response.statusText);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Запускаем fetchData при загрузке страницы
window.onload = function () {
    fetchData();
};


async function fetchHistory() {
    try {
        const response = await fetch('http://localhost:3000/api/get-history');
        if (response.ok) {
            const transactions = await response.json();
            console.log('История транзакций:', transactions);

            const historyContainer = document.querySelector('.delete-container');
            historyContainer.innerHTML = '';

            transactions.forEach(transaction => {
                const li = document.createElement('li');
                const amount = transaction.amount;
                const type = transaction.type === 'income' ? 'Доход' : 'Расход';
                const date = new Date(transaction.date).toLocaleDateString();
                li.innerHTML = `
                    <div class="delete-icon"></div>
                    <p>${date}</p>
                    <p>${type}:</p>
                    <p id="sum_${type === 'income' ? 'pos' : 'neg'}">${amount}р</p>
                    <button><img src="/images/icons8-мусор.svg" alt="tarash"></button>
                `;
                historyContainer.appendChild(li);
            });
        } else {
            console.error('Ошибка при получении истории:', response.statusText);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

window.onload = function () {
    fetchData();  // Получение данных для кошелька
    fetchHistory();  // Получение истории транзакций
};





async function clearHistory() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/clear-history', {
            method: 'DELETE', // Используем DELETE для очистки истории
        });

        if (response.ok) {
            alert('История очищена!');
            fetchHistory(); // Перезагружаем историю
        } else {
            alert('Не удалось очистить историю.');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

//qr



// Загружаем историю при загрузке страницы
