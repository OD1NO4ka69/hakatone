// Загрузка Google Charts
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawAllCharts);

google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawLineChart);
    
async function fetchTransactions() {
    try {
        const response = await fetch('http://localhost:3000/get-transactions');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const data = await response.json();
        console.log('Полученные транзакции:', data);
        return data;
    } catch (error) {
        console.error('Ошибка загрузки транзакций:', error);
        return [];
    }
}
    

function groupTransactionsByCategory(transactions, type) {
    if (!transactions) return {}; // Ensure transactions is valid
    return transactions
        .filter(t => t.type === type)
        .reduce((grouped, transaction) => {
            grouped[transaction.category] = (grouped[transaction.category] || 0) + transaction.amount;
            return grouped;
        }, {});
}


function drawPieChart(data, elementId, ulId) {
    const chartData = google.visualization.arrayToDataTable([
        ['Категория', 'Сумма'],
        ...Object.entries(data),
    ]);

    const options = {
        chartArea: {
            width: '100%',
            height: '70%',
        },
        width: '100%',
        height: '80%',
        legend: { position: 'right' },
    };

    const chart = new google.visualization.PieChart(document.getElementById(elementId));
    chart.draw(chartData, options);

    const ulElement = document.getElementById(ulId);
    ulElement.innerHTML = ''; 

    Object.entries(data).forEach(([category, sum]) => {
        const li = document.createElement('li');
        
        const categoryElement = document.createElement('p');
        categoryElement.textContent = category + ":";
        
        const sumElement = document.createElement('p');
        sumElement.textContent = `${sum}р`;
        sumElement.id = `sum_kat_${category.replace(/\s+/g, '_').toLowerCase()}`;

        li.appendChild(categoryElement);
        li.appendChild(sumElement);
        ulElement.appendChild(li);
    });
}




async function drawAllCharts() {
    try {
        const transactions = await fetchTransactions(); // Получение данных транзакций
        console.log('Транзакции для диаграмм:', transactions);

        const incomeData = groupTransactionsByCategory(transactions, 'income');
        const expenseData = groupTransactionsByCategory(transactions, 'expense');

        drawPieChart(incomeData, 'positive-diagram', 'ul-positive-diagram');
        drawPieChart(expenseData, 'negative-diagram', 'ul-negative-diagram');
    } catch (error) {
        console.error('Ошибка при отрисовке диаграмм:', error);
    }
}





document.addEventListener('DOMContentLoaded', () => {
    updateCategories();
    const form = document.querySelector('.finance-form');

    if (form) {
        form.replaceWith(form.cloneNode(true));
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user_id = localStorage.getItem('user_id'); 
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
                    drawAllCharts(); // Обновляем графики
                } else {
                    alert(`Ошибка: ${data.error}`);
                }
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
            }
        });
    }
});

window.addEventListener('resize', drawAllCharts);

// Загрузка Google Charts
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawLineChart); // возможно drawHistogram


// Получение данных для гистограммы с сервера
async function fetchReportData() {
    try {
      const response = await fetch('http://localhost:3000/get-report');
      if (!response.ok) throw new Error('Ошибка загрузки отчета');
      return await response.json();
    } catch (error) {
      console.error('Ошибка загрузки данных для отчета:', error);
      return [];
    }
  }

  function prepareHistogramData(data) {
    const result = [['Дата', 'Доходы', 'Расходы', 'Чистая прибыль']];
    data.forEach((row) => {
      result.push([row.date, row.income || 0, Math.abs(row.expense) || 0, row.net_profit || 0]);
    });
    return result;
  }


  async function fetchReportData() {
    try {
        const response = await fetch('http://localhost:3000/get-report');
        if (!response.ok) throw new Error('Ошибка загрузки отчета');
        const data = await response.json();

        // Лог данных, чтобы проверить их на клиенте
        console.log('Полученные данные для отчета:', data);

        return data;
    } catch (error) {
        console.error('Ошибка загрузки данных для отчета:', error);
        return [];
    }
}

  
function prepareLineChartData(data) {
    const result = [['Дата', 'Ежедневные доходы', 'Ежедневные расходы', 'Чистая прибыль']];
    data.forEach((row) => {
        const dateObj = new Date(row.date);
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()}`; // Форматируем как DD-MM-YYYY
        console.log('Обработка строки:', row, 'Форматированная дата:', formattedDate);
        result.push([formattedDate, row.income || 0, Math.abs(row.expense) || 0, row.net_profit || 0]);
    });
    console.log('Подготовленные данные для графика:', result);
    return result;
}




  
  async function drawLineChart() {
    const reportData = await fetchReportData();
    if (reportData.length === 0) {
      console.error('Данных для отображения нет.');
      return;
    }
  
    const chartData = google.visualization.arrayToDataTable(prepareLineChartData(reportData));
  
    const options = {
      hAxis: { title: 'Дата' }, 
      vAxis: { title: 'Сумма' },
      legend: { position: 'top' },
      width: "100%",
      height: "80%",
      lineWidth: 3, 
    //   pointSize: 5, 
    };
  
    const chart = new google.visualization.LineChart(document.getElementById('linechart_values'));
    chart.draw(chartData, options);
  }
  
  window.addEventListener('resize', drawLineChart);
  
  // Категории
  const incomeCategories = [
        "Зарплата",
        "Фриланс",
        "Инвестиции",
        "Аренда",
        "Продажа",
        "Дивиденды",
        "Пенсия",
        "Другое"
    ];

    const expenseCategories = [
        "Продукты",
        "Игры",
        "Развлечения",
        "Транспорт",
        "Кредиты",
        "Коммунальные услуги",
        "Другое"
    ];
   

    // Move the window.onload after all function declarations
function updateCategories() {
    const typeSelect = document.getElementById("type");
    const categorySelect = document.getElementById("category");
    const customCategoryInput = document.getElementById("custom-category");
    
    categorySelect.innerHTML = "";
    customCategoryInput.style.display = "none";
    
    const categories = typeSelect.value === "income" ? incomeCategories : expenseCategories;
    
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCategories();
    
    document.getElementById("category").addEventListener('change', function() {
        const customCategoryInput = document.getElementById("custom-category");
    });
    
    document.getElementById("type").addEventListener("change", updateCategories);
});

window.onload = updateCategories;


