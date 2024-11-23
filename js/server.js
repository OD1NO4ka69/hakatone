// Импортируем необходимые модули
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных успешно');
    }
});

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

db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

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
    db.all('SELECT * FROM transactions', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при загрузке данных' });
        }
        res.json(rows);
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

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

        // Возвращаем user_id для сохранения в localStorage
        res.status(200).json({ user_id: user.id });
    });
});