// Загрузка Google Charts
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

async function handleLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('user_id', data.user_id);
            alert('Вход выполнен успешно!');
            window.location.href = '/html/main.html';
        } else {
            alert(data.error || 'Ошибка авторизации');
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
    }
}


async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/get-transactions');
        if (!response.ok) throw new Error('Ошибка загрузки данных');

        const transactions = await response.json();

        // преоданных для диаграммы
        const dataArray = [
            ['Дата', 'Доходы', 'Расходы']
        ];
        transactions.forEach((t) => {
            const date = new Date(t.date).toLocaleDateString('ru-RU');
            if (t.type === 'income') {
                dataArray.push([date, t.amount, 0]);
            } else {
                dataArray.push([date, 0, t.amount]);
            }
        });

        return dataArray;
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        return [
            ['Дата', 'Доходы', 'Расходы']
        ];
    }
}

async function drawChart() {
    const data = google.visualization.arrayToDataTable(await fetchData());

    const options = {
        curveType: 'function',
        legend: { position: 'bottom' },
        hAxis: { title: 'Дата' },
        vAxis: { title: 'Сумма' },
        width: '100%',
        height: '100%',
    };

    const chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.finance-form');

    if (form) {
        form.replaceWith(form.cloneNode(true));
        form.addEventListener('submit', async(e) => {
            e.preventDefault();

            const user_id = localStorage.getItem('user_id'); // Получение user_id из localStorage
            if (!user_id) {
                alert('Пользователь не авторизован');
                return;
            }

            const amount = parseFloat(document.getElementById('amount').value);
            const category = document.getElementById('category').value;
            const date = document.getElementById('date').value;
            const type = document.getElementById('type').value;

            if (!amount || !category || !date || !type) {
                alert('Заполните все поля!');
                return;
            }

            const transaction = { user_id, amount, category, date, type };

            try {
                const response = await fetch('http://localhost:3000/add-transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transaction),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Транзакция добавлена!');
                    drawChart(); // Обновляем график
                } else {
                    alert(`Ошибка: ${data.error}`);
                }
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
            }
        });
    }
});

window.addEventListener('resize', drawChart);


let data_income = [
    ['Доходы', 'в течении дня'],
    ['ЗП', 1200],
    ['Фриланс', 2100],
    ['Другое', 14500],
];

google.charts.setOnLoadCallback(drawChart2);

function drawChart2() {

    const data = google.visualization.arrayToDataTable(data_income);

    const options = {
        curveType: 'function',
        chartArea: {
            width: '100%',
            height: '70%'
        },
        width: '100%',
        height: '80%',
        legend: { position: 'right' }

    };

    const chart = new google.visualization.PieChart(document.getElementById('positive-diagram'));

    chart.draw(data, options);
}

window.addEventListener('resize', drawChart2);





let data_expenses = [
    ['Расходы', 'в течении дня'],
    ['Кино', 11],
    ['Фастфуд', 2],
    ['Музыка', 2],
    ['Комуналка', 2],
    ['Клуб', 7]
];

google.charts.setOnLoadCallback(drawChart3);

function drawChart3() {

    const data = google.visualization.arrayToDataTable(data_expenses);

    const options = {
        chartArea: {
            curveType: 'function',
            width: '100%',
            height: '70%'
        },
        width: '100%',
        height: '80%',
        legend: { position: 'right' }

    };

    const chart = new google.visualization.PieChart(document.getElementById('negative-diagram'));

    chart.draw(data, options);
}

window.addEventListener('resize', drawChart3);