// Импортируем необходимые модули
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// Настройка CORS
const corsOptions = {
    origin: 'http://127.0.0.1:5500',  // Пример: ваш фронтенд на другом порту
    credentials: true,  // Чтобы отправлять cookies
};
app.use(cors(corsOptions));

// Подключаем парсер cookies
app.use(cookieParser());



const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
// const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Подключение к базе данных
const db = new sqlite3.Database('./newusers5.db', (err) => {
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
app.get('/api/get-user-id', (req, res) => {
    console.log('Запрос на /api/get-user-id получен');
    const userId = req.cookies.user_id;

    if (userId) {
        res.json({ userId });
    } else {
        res.status(404).json({ error: 'User not found' });
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


// **Получение всех транзакций**
app.post('/add-transaction', (req, res) => {
    const { user_id, amount, category, date, type } = req.body;

    if (!user_id || !amount || !category || !date || !type) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const query = `INSERT INTO transactions (user_id, amount, category, date, type) VALUES (?, ?, ?, ?, ?)`;

    db.run(query, [user_id, amount, category, date, type], function (err) {
        if (err) {
            console.error('Ошибка добавления транзакции:', err.message);
            return res.status(500).json({ error: 'Не удалось добавить транзакцию' });
        }
        res.json({ success: true, id: this.lastID });
    });
});


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



// **Регистрация пользователя**
app.post('/register', (req, res) => {
    const { username, phone, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `INSERT INTO users (username, phone, password) VALUES (?, ?, ?)`;
    db.run(query, [username, phone, hashedPassword], function(err) {
        if (err) {
            console.error('Ошибка при добавлении пользователя:', err.message);
            return res.status(400).send('Пользователь с таким номером уже существует');
        }

        res.json({ user_id: this.lastID });
    });
});

// **Авторизация пользователя**
// **Авторизация пользователя**
app.post('/login', (req, res) => {
    const { phone, password } = req.body;

    const query = `SELECT * FROM users WHERE phone = ?`;
    db.get(query, [phone], (err, user) => {
        if (err) {
            console.error('Ошибка при поиске пользователя:', err.message);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        // Устанавливаем cookie с идентификатором пользователя
        res.cookie('user_id', user.id, { httpOnly: true, secure: true });

        res.status(200).json({ user_id: user.id });
    });
});



app.get('/get-history', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM transactions WHERE user_id = ?', [req.query.user_id]);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения истории:', error);
        res.status(500).send('Ошибка получения данных');
    }
});


app.delete('/delete-transaction/:id', async (req, res) => {
    const transactionId = req.params.id;
    try {
        await db.query('DELETE FROM transactions WHERE id = $1', [transactionId]);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при удалении транзакции' });
    }
});





// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
