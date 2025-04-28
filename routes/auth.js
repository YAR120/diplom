const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { saveUser, getUserByUsername, getUserByAuthToken, getUserByEmail } = require('../database.js');

// Функция для генерации authToken
const generateAuthToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
};

// POST /auth/register - Handle user registration
router.post('/register', async (req, res) => {
    const { username, fullName, email, phone, password, role } = req.body;

    // Basic validation
    if (!username || !fullName || !email || !phone || !password) {
        return res.status(400).json({ error: 'Усі поля обов’язкові' });
    }

    // Username validation: no digits allowed
    if (/\d/.test(username)) {
        return res.status(400).json({ error: 'Логін не повинен містити цифри' });
    }

    // Email validation
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).json({ error: 'Невірний формат email' });
    }

    // Phone validation: must be in format +380XXXXXXXXX
    if (!/\+380[0-9]{9}/.test(phone)) {
        return res.status(400).json({ error: 'Телефон має бути у форматі +380XXXXXXXXX' });
    }

    // Password validation: minimum 6 characters
    if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль має бути не менше 6 символів' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Set default role
        const userRole = role && role === 'admin' ? 'admin' : 'user';

        // Generate authToken for new user
        const authToken = generateAuthToken();

        // Save user to the database
        const user = { username, fullName, email, phone, password: hashedPassword, role: userRole, authToken };
        saveUser(user, (err, result) => {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Користувач з таким логіном або електронною поштою вже існує' });
                }
                console.error('Ошибка сохранения пользователя:', err);
                return res.status(500).json({ error: 'Помилка сервера' });
            }
            res.status(201).json({ 
                message: 'Реєстрація успішна!', 
                user: { id: result.id, username, fullName, email, phone, role: userRole, authToken }
            });
        });
    } catch (err) {
        console.error('Ошибка хеширования пароля:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

// POST /auth/login - Handle user login
router.post('/login', async (req, res) => {
    const { username, password, rememberMe } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Логін та пароль обов’язкові' });
    }

    // Username validation: no digits allowed (same as in registration)
    if (/\d/.test(username)) {
        return res.status(400).json({ error: 'Логін не повинен містити цифри' });
    }

    // Password validation: minimum 6 characters
    if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль має бути не менше 6 символів' });
    }

    try {
        // Check if user exists by username or email
        const checkUser = new Promise((resolve, reject) => {
            getUserByUsername(username, (err, user) => {
                if (err) return reject(err);
                if (user) return resolve(user);
                getUserByEmail(username, (err, user) => {
                    if (err) return reject(err);
                    resolve(user);
                });
            });
        });

        const user = await checkUser;
        if (!user) {
            return res.status(401).json({ error: 'Користувача з таким логіном або email не знайдено' });
        }

        // Check password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Невірний пароль' });
        }

        // Generate new authToken
        const authToken = generateAuthToken();

        // Save authToken in the database
        const db = require('../database.js').db;
        db.run('UPDATE users SET authToken = ? WHERE id = ?', [authToken, user.id], (err) => {
            if (err) {
                console.error('Ошибка при сохранении authToken:', err);
                return res.status(500).json({ error: 'Помилка сервера при сохранении токена' });
            }

            // Save user in session
            req.session.userId = user.id;

            res.status(200).json({ 
                message: 'Авторизація успішна!', 
                authToken: authToken,
                role: user.role,
                username: user.username,
                email: user.email,
                phone: user.phone,
                aboutMe: user.aboutMe || "Тут ваша інформація про себе."
            });
        });
    } catch (err) {
        console.error('Ошибка авторизации:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

// POST /auth/login-with-token - Handle login with authToken
router.post('/login-with-token', (req, res) => {
    const { authToken } = req.body;

    if (!authToken) {
        return res.status(400).json({ error: 'authToken обов’язковий' });
    }

    getUserByAuthToken(authToken, (err, user) => {
        if (err) {
            console.error('Ошибка базы данных:', err);
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Невірний authToken' });
        }

        // Save user in session
        req.session.userId = user.id;

        res.status(200).json({ 
            message: 'Авторизація за токеном успішна!', 
            authToken: user.authToken,
            role: user.role,
            username: user.username,
            email: user.email,
            phone: user.phone,
            aboutMe: user.aboutMe || "Тут ваша інформація про себе."
        });
    });
});

module.exports = router;