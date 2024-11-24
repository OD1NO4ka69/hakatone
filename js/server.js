// Импортируем необходимые модули
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
// Настройка CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500',  // Пример: ваш фронтенд на другом порту
    credentials: true,  // Чтобы отправлять cookies
}));

// Подключаем парсер cookies
app.use(cookieParser());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'js', 'newusers8.db');

// Создание подключения к базе данных

// Для обслуживания статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API для получения данных о кошельке
app.get('/api/get_wallet_data', async (req, res) => {
    const date = req.query.date; // Получаем дату из запроса
    if (!date) {
        return res.status(400).json({ error: 'Дата не указана' });
    }

    try {
        const income = await getIncomeForDate(date); // Функция для получения доходов
        const expense = await getExpenseForDate(date); // Функция для получения расходов
        res.json({ income, expense });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});








// Настройка CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500',  // Пример: ваш фронтенд на другом порту
    credentials: true,  // Чтобы отправлять cookies
}));

// Подключаем парсер cookies
app.use(cookieParser());

// Для обработки JSON
app.use(express.json());

// Простая база данных в памяти для хранения пользователей
let users = [];
let userIdCounter = 1;

// **Получение user_id из cookie**
app.get('/api/get-user-id', (req, res) => {
    const userId = req.cookies.user_id;
    if (!userId) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    res.status(200).json({ userId });
});

// Серверная часть (Node.js)
app.delete('/api/clear-history', (req, res) => {
    const userId = req.cookies.user_id;
    if (!userId) {
        return res.status(401).json({ error: 'Не авторизован' });
    }

    const query = `
        DELETE FROM transactions
        WHERE user_id = ?
    `;

    db.run(query, [userId], function(err) {
        if (err) {
            console.error('Ошибка при очистке истории:', err);
            return res.status(500).json({ error: 'Ошибка при очистке истории' });
        }
        res.status(200).json({ message: 'История очищена' });
    });
});


// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, phone, password } = req.body;

    // Проверка на наличие всех необходимых данных
    if (!username || !phone || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Проверяем, существует ли пользователь с таким номером телефона
    const existingUser = users.find(user => user.phone === phone);
    if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким номером телефона уже существует' });
    }

    // Создаем нового пользователя
    const newUser = {
        id: userIdCounter++,
        username,
        phone,
        password,
    };

    users.push(newUser);

    // Устанавливаем cookie с ID пользователя
    res.cookie('user_id', newUser.id, { httpOnly: true });

    res.status(201).json({ message: 'Регистрация успешна', user_id: newUser.id });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
    const { phone, password } = req.body;

    const user = users.find(u => u.phone === phone && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
    }

    // Устанавливаем cookie с ID пользователя
    res.cookie('user_id', user.id, { httpOnly: true });

    res.json({ user_id: user.id });
});

// Проверка авторизации
app.get('/check-auth', (req, res) => {
    if (req.cookies.user_id) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});


// Подключение к базе данных
const sqlite3 = require('sqlite3').verbose();

// Подключение к базе данных
const db = new sqlite3.Database('./newusers8.db', (err) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных успешно');
    }
});

// Создание таблицы пользователей
db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`,
    (err) => {
        if (err) {
            console.error('Ошибка при создании таблицы:', err.message);
        } else {
            console.log('Таблица users успешно создана или уже существует');
        }
    }
);

// Создание таблицы транзакций
db.run(
    `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
);

// **Получение user_id из cookie**
// Возвращаем userId из cookies
app.get('/api/get-user-id', (req, res) => {
    const userId = req.cookies.user_id;
    if (!userId) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    res.status(200).json({ userId });
});

// Возвращаем историю транзакций для конкретного пользователя
// Эндпоинт для получения истории транзакций
app.get('/api/get-history', (req, res) => {
    const userId = req.userId;  // Предполагается, что userId получаем через сессию или JWT

    db.all(
        'SELECT id, amount, category, date, type FROM transactions WHERE user_id = ? ORDER BY date DESC',
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Возвращаем транзакции в JSON формате
            res.json(rows);
        }
    );
});


// Пример на Express.js
app.get('/check-auth', (req, res) => {
    if (req.cookies.user) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// **Добавление транзакции**
app.post('/add-transaction', (req, res) => {
    const { user_id, amount, category, date, type } = req.body;

    if (!user_id || !amount || !category || !date || !type) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const checkQuery = `
        SELECT * FROM transactions
        WHERE user_id = ? AND amount = ? AND category = ? AND date = ? AND type = ?
        LIMIT 1
    `;

    db.get(checkQuery, [user_id, amount, category, date, type], (err, row) => {
        if (err) {
            console.error('Ошибка при проверке транзакции:', err.message);
            return res.status(500).json({ error: 'Ошибка при проверке транзакции' });
        }

        if (row) {
            return res.status(400).json({ error: 'Такая транзакция уже существует' });
        }

        const insertQuery = `
            INSERT INTO transactions (user_id, amount, category, date, type)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [user_id, amount, category, date, type], function(err) {
            if (err) {
                console.error('Ошибка при добавлении транзакции:', err.message);
                return res.status(500).json({ error: 'Ошибка при добавлении транзакции' });
            }

            res.status(200).json({ message: 'Транзакция добавлена', transaction_id: this.lastID });
        });
    });
});

// **Получение всех транзакций**
app.get('/get-transactions', (req, res) => {
    const query = `SELECT * FROM transactions`;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Ошибка при получении транзакций:', err.message);
            return res.status(500).json({ error: 'Ошибка загрузки данных' });
        }

        console.log('Транзакции загружены:', rows);
        res.json(rows);
    });
});

// **Получение общей суммы доходов, расходов и прибыли**
app.get('/get-summary', (req, res) => {
    const query = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_profit
        FROM transactions
    `;

    db.get(query, (err, row) => {
        if (err) {
            console.error('Ошибка при получении общей суммы:', err.message);
            return res.status(500).json({ error: 'Ошибка при загрузке данных' });
        }

        console.log('Общая сумма (все время):', row); // Лог для проверки
        res.json(row);
    });
});

// **Получение отчета о транзакциях**
app.get('/get-report', (req, res) => {
    const query = `
        WITH daily_data AS (
            SELECT 
                date,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
            FROM transactions
            GROUP BY date
            ORDER BY date
        ),
        cumulative_data AS (
            SELECT 
                date,
                income,
                expense,
                SUM(income - expense) OVER (ORDER BY date) AS net_profit
            FROM daily_data
        )
        SELECT * FROM cumulative_data
    `;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Ошибка при получении отчета:', err.message);
            return res.status(500).json({ error: 'Ошибка при загрузке отчета' });
        }

        const totalDates = rows.length;

        // Ограничиваем до 6 дат, если их больше
        let limitedRows;
        if (totalDates > 6) {
            const step = Math.ceil(totalDates / 6);
            limitedRows = rows.filter((_, index) => index % step === 0);
            if (limitedRows.length < 6) {
                limitedRows.push(rows[rows.length - 1]); // Добавляем последний день
            }
        } else {
            limitedRows = rows; // Если меньше 6 дат, оставляем все
        }

        console.log('Ограниченные данные для отчета:', limitedRows); // Лог для проверки
        res.json(limitedRows);
    });
});

app.get('/get-financial-report', (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    db.all('SELECT * FROM transactions WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error('Ошибка получения данных транзакций:', err.message);
            return res.status(500).json({ message: 'Ошибка сервера при получении отчета' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Нет данных для отчета' });
        }

        // Подготовка данных отчета
        let totalIncome = 0;
        let totalExpense = 0;

        rows.forEach(row => {
            if (row.type === 'income') {
                totalIncome += row.amount;
            } else if (row.type === 'expense') {
                totalExpense += row.amount;
            }
        });

        const netProfit = totalIncome - totalExpense;

        // Рекомендации
        const recommendations = [
            'Сократите расходы на ненужные покупки.',
            'Рассмотрите возможность увеличения доходов через дополнительные проекты.',
            `Рекомендуется откладывать 10-15% от прибыли на сбережения (примерно ${Math.round(netProfit * 0.1)} — ${Math.round(netProfit * 0.15)} руб.).`
        ];

        // Предупреждения
        const warnings = [];
        rows.forEach(row => {
            if (row.type === 'expense' && row.amount > totalIncome * 0.1) {
                warnings.push(`Большая трата в категории "${row.category}" на сумму ${row.amount} руб.`);
            }
        });

        // Формирование ответа
        const reportData = {
            month: new Date().toLocaleString('ru', { month: 'long' }),
            year: new Date().getFullYear(),
            netProfit,
            recommendations,
            warnings
        };

        res.json(reportData);
    });
});


const PORT = 3000;

// Подключение базы данных
// const db = require('./newusers8.db'); // Настройте подключение к базе данных

app.get('/get-financial-report', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Получение данных из базы
        const transactions = await db.query(`
            SELECT date, income, expense, (income - expense) AS net_profit
            FROM negusers
            WHERE user_id = $1 AND date >= DATE_TRUNC('month', CURRENT_DATE)
        `, [user_id]);

        // Подсчёт прибыли и расходов
        let totalIncome = 0;
        let totalExpense = 0;
        let warnings = [];

        transactions.rows.forEach(row => {
            totalIncome += row.income;
            totalExpense += row.expense;
        });

        const netProfit = totalIncome - totalExpense;

        // Генерация рекомендаций
        const recommendations = [
            'Расходы на аренду квартиры составляют 53% от общего бюджета. Возможно, вам стоит рассмотреть возможность снижения расходов на жильё, например, переезд в более доступное место.',
            'Расходы на продукты составляют 21%. Чтобы снизить общие расходы, можно начать более внимательно планировать покупки, избегать импульсивных трат.',
            'Траты на развлечения — 13%. Возможно, стоит пересмотреть этот пункт и уделить больше внимания экономии в этом направлении.',
            `Рекомендуется откладывать 10-15% от прибыли на сбережения. Это составит около ${Math.round(netProfit * 0.1)} — ${Math.round(netProfit * 0.15)} руб. в месяц.`,
        ];

        // Формирование предупреждений
        const largeExpenses = transactions.rows.filter(row => row.expense > totalIncome * 0.1);
        largeExpenses.forEach(expense => {
            if (totalExpense / totalIncome > 0.9) {
                warnings.push(`Большие расходы на ${expense.date}: ${expense.expense} руб.`);
            }
        });

        // Ответ сервера
        res.json({
            month: new Date().toLocaleString('ru', { month: 'long' }),
            year: new Date().getFullYear(),
            netProfit,
            recommendations,
            warnings
        });
    } catch (error) {
        console.error('Ошибка получения отчета:', error);
        res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
    }
});



// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});






