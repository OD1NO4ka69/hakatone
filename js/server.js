// // Импортируем необходимые модули
// const express = require('express');
// const cookieParser = require('cookie-parser');
// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// const app = express();

// // Подключаем парсер cookies
// app.use(cookieParser());

// // Для обработки URL-encoded данных и JSON
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // Путь к базе данных
// const dbPath = 'js/newusers5.db';
// console.log(dbPath);  // Выведите путь в консоль для отладки

// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) {
//         console.error('Ошибка при подключении к базе данных:', err.message);
//     } else {
//         console.log('Подключение к базе данных успешно');
//     }
// });

// // Для обслуживания статических файлов (HTML, CSS, JS)
// app.use(express.static(path.join(__dirname, 'public')));

// // Настройка CORS
// const cors = require('cors');

// // Разрешить все источники (для разработки):
// app.use(cors({
//     origin: '*',  // Это разрешит все источники
//     credentials: true,  // Для работы с cookies
// }));


// // **Получение user_id из cookie**
// app.get('/api/get-user-id', (req, res) => {
//     const userId = req.cookies.user_id;
//     if (!userId) {
//         return res.status(401).json({ error: 'Не авторизован' });
//     }
//     res.status(200).json({ userId });
// });

// // Регистрация пользователя
// app.post('/register', (req, res) => {
//     const { username, phone, password } = req.body;

//     if (!username || !phone || !password) {
//         return res.status(400).json({ error: 'Все поля обязательны' });
//     }

//     db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
//         if (err) {
//             return res.status(500).json({ error: 'Ошибка при проверке пользователя' });
//         }

//         if (row) {
//             return res.status(400).json({ error: 'Пользователь с таким номером телефона уже существует' });
//         }

//         const query = 'INSERT INTO users (username, phone, password) VALUES (?, ?, ?)';
//         db.run(query, [username, phone, password], function (err) {
//             if (err) {
//                 return res.status(500).json({ error: 'Ошибка при добавлении пользователя' });
//             }

//             res.cookie('user_id', this.lastID, { httpOnly: true });
//             res.status(201).json({ message: 'Регистрация успешна', user_id: this.lastID });
//         });
//     });
// });



// // Авторизация пользователя
// app.post('/login', (req, res) => {
//     const { phone, password } = req.body;

//     db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
//         if (err) {
//             return res.status(500).json({ error: 'Ошибка при проверке пользователя' });
//         }

//         if (!row || row.password !== password) {
//             return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
//         }

//         res.cookie('user_id', row.id, { httpOnly: true });
//         res.json({ message: 'Успешный вход', user_id: row.id });
//     });
// });






// // Получение истории транзакций для конкретного пользователя
// app.get('/api/get-history', (req, res) => {
//     const userId = req.cookies.user_id;

//     if (!userId) {
//         return res.status(401).json({ error: 'Не авторизован' });
//     }

//     const query = 'SELECT id, amount, category, date, type FROM transactions WHERE user_id = ? ORDER BY date DESC';
//     db.all(query, [userId], (err, rows) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         res.json(rows);
//     });
// });

// // Очистка истории транзакций
// app.delete('/api/clear-history', (req, res) => {
//     const userId = req.cookies.user_id;
//     if (!userId) {
//         return res.status(401).json({ error: 'Не авторизован' });
//     }

//     const query = 'DELETE FROM transactions WHERE user_id = ?';
//     db.run(query, [userId], function (err) {
//         if (err) {
//             return res.status(500).json({ error: 'Ошибка при очистке истории' });
//         }
//         res.status(200).json({ message: 'История очищена' });
//     });
// });

// // Добавление транзакции
// app.post('/add-transaction', (req, res) => {
//     const { amount, category, date, type } = req.body;
//     const userId = req.cookies.user_id;

//     if (!userId) {
//         return res.status(401).json({ error: 'Не авторизован' });
//     }

//     if (!amount || !category || !date || !type) {
//         return res.status(400).json({ error: 'Все поля обязательны' });
//     }

//     const query = `
//         INSERT INTO transactions (user_id, amount, category, date, type)
//         VALUES (?, ?, ?, ?, ?)
//     `;

//     db.run(query, [userId, amount, category, date, type], function (err) {
//         if (err) {
//             return res.status(500).json({ error: 'Ошибка при добавлении транзакции' });
//         }

//         res.status(200).json({ message: 'Транзакция добавлена', transaction_id: this.lastID });
//     });
// });

// // Получение общей суммы доходов, расходов и прибыли
// app.get('/get-summary', (req, res) => {
//     const userId = req.cookies.user_id;

//     if (!userId) {
//         return res.status(401).json({ error: 'Не авторизован' });
//     }

//     const query = `
//         SELECT 
//             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
//             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
//             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
//             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_profit
//         FROM transactions
//         WHERE user_id = ?
//     `;

//     db.get(query, [userId], (err, row) => {
//         if (err) {
//             return res.status(500).json({ error: 'Ошибка при загрузке данных' });
//         }

//         res.json(row);
//     });
// });

// // Получение отчета о транзакциях
// app.get('/get-report', (req, res) => {
//     const query = `
//         WITH daily_data AS (
//             SELECT 
//                 date,
//                 SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
//                 SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
//             FROM transactions
//             GROUP BY date
//             ORDER BY date
//         ),
//         cumulative_data AS (
//             SELECT 
//                 date,
//                 income,
//                 expense,
//                 SUM(income - expense) OVER (ORDER BY date) AS net_profit
//             FROM daily_data
//         )
//         SELECT * FROM cumulative_data
//     `;

//     db.all(query, (err, rows) => {
//         if (err) {
//             return res.status(500).json({ error: 'Ошибка при загрузке отчета' });
//         }

//         const totalDates = rows.length;
//         let limitedRows;
//         if (totalDates > 6) {
//             const step = Math.ceil(totalDates / 6);
//             limitedRows = rows.filter((_, index) => index % step === 0);
//             if (limitedRows.length < 6) {
//                 limitedRows.push(rows[rows.length - 1]); // Добавляем последний день
//             }
//         } else {
//             limitedRows = rows; // Если меньше 6 дат, оставляем все
//         }

//         res.json(limitedRows);
//     });
// });

// // Запуск сервера
// app.listen(3000, () => {
//     console.log('Server is running on http://localhost:3000');
// });

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');  // Подключаем CORS
const port = 3000;
const app = express();  // Создаем объект приложения

app.use(cors({ origin: '*' }));  // Разрешаем все источники
app.use(express.json());  // Парсим JSON в теле запроса

// Настройка CORS
app.use(cors());

// Настройка парсинга данных
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Подключение к базе данных SQLite
const db = new sqlite3.Database('./negusers.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
        return;
    }
    console.log('Подключено к базе данных');
});

// Создание таблицы (если она еще не существует)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Роут для регистрации пользователя
app.post('/register', (req, res) => {
    const { username, phone_number, password } = req.body;

    console.log('Получены данные:', req.body);

    const isValidPhone = phone_number && phone_number.length >= 10;
    if (!isValidPhone) {
        console.error('Неверный формат номера телефона');
        return res.status(400).json({ message: 'Неверный формат номера телефона' });
    }

    db.get('SELECT * FROM users WHERE phone_number = ?', [phone_number], (err, row) => {
        if (err) {
            console.error('Ошибка при запросе к базе данных:', err);
            return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }

        if (row) {
            console.error('Пользователь с таким номером телефона уже существует');
            return res.status(400).json({ message: 'Пользователь с таким номером телефона уже существует' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Ошибка при хешировании пароля:', err);
                return res.status(500).json({ message: 'Ошибка при регистрации' });
            }

            const query = 'INSERT INTO users (username, phone_number, password) VALUES (?, ?, ?)';
            db.run(query, [username, phone_number, hashedPassword], function(err) {
                if (err) {
                    console.error('Ошибка при сохранении пользователя:', err);
                    return res.status(500).json({ message: 'Ошибка при регистрации' });
                }

                console.log('Пользователь успешно зарегистрирован');
                // Отправляем ответ с успешной регистрацией и URL для редиректа
                return res.status(200).json({
                    message: 'Пользователь успешно зарегистрирован',
                    redirectUrl: 'http://127.0.0.1:5500/html/main.html'
                });
            });
        });
    });
});

// Вход пользователя
app.post('/login', (req, res) => {
    const { phone_number, password } = req.body;

    db.get('SELECT * FROM users WHERE phone_number = ?', [phone_number], (err, row) => {
        if (err) return res.status(500).json({ message: 'Ошибка при входе' });
        if (!row) return res.status(400).json({ message: 'Пользователь не найден' });

        bcrypt.compare(password, row.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Ошибка при входе' });
            if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

            // Успешный вход
            res.status(200).json({
                message: 'Успешный вход',
                redirectUrl: `http://127.0.0.1:5500/html/main.html?user_id=${row.id}`
            });
        });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер работает на порту ${port}`);
});
