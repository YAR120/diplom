const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dbModule = require("./database.js");
const db = dbModule.db;
const authRouter = require("./routes/auth.js");
const ordersRouter = require("./routes/orders.js");
const projectsRouter = require("./routes/projects.js"); // Новый импорт
const app = express();
const port = process.env.PORT || 3000;

// Настройка CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

const server = app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

app.use(express.json());
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 }
    })
);
app.use(express.static(__dirname));
app.use("/jscss", express.static(path.join(__dirname, "jscss")));

app.use("/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/projects", projectsRouter); // Новый маршрут

app.get("/auth-buttons", (req, res) => {
    res.json({ message: "Маршрут не используется" });
});

// Профиль (старый маршрут)
app.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Токен не надано" });
    }
    const authToken = authHeader.split(" ")[1];
    dbModule.getUserByAuthToken(authToken, (err, user) => {
        if (err) {
            console.error("Ошибка базы данных:", err);
            return res.status(500).json({ error: "Помилка сервера" });
        }
        if (!user) {
            return res.status(401).json({ error: "Недійсний токен" });
        }
        res.json({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            aboutMe: user.aboutMe || "Тут ваша інформація про себе.",
            role: user.role
        });
    });
});

// Новый маршрут /api/profile
app.get("/api/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Токен не надано" });
    }
    const authToken = authHeader.split(" ")[1];
    dbModule.getUserByAuthToken(authToken, (err, user) => {
        if (err) {
            console.error("Ошибка базы данных:", err);
            return res.status(500).json({ error: "Помилка сервера" });
        }
        if (!user) {
            return res.status(401).json({ error: "Недійсний токен" });
        }
        res.json({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            aboutMe: user.aboutMe || "Тут ваша інформація про себе.",
            role: user.role
        });
    });
});

// Обновление профиля
app.post("/update-profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Токен не надано" });
    }
    const authToken = authHeader.split(" ")[1];
    dbModule.getUserByAuthToken(authToken, (err, user) => {
        if (err) {
            console.error("Ошибка базы данных:", err);
            return res.status(500).json({ error: "Помилка сервера" });
        }
        if (!user) {
            return res.status(401).json({ error: "Недійсний токен" });
        }
        const { email, phone, aboutMe } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email є обов'язковим" });
        }
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.status(400).json({ error: "Невірний формат email" });
        }
        if (phone && !/\+380[0-9]{9}/.test(phone)) {
            return res.status(400).json({ error: "Телефон має бути у форматі +380XXXXXXXXX" });
        }
        db.run(
            `UPDATE users SET email = ?, phone = ?, aboutMe = ? WHERE authToken = ?`,
            [email, phone || null, aboutMe || null, authToken],
            err => {
                if (err) {
                    console.error("Ошибка обновления профиля:", err);
                    return res.status(500).json({ error: "Помилка при оновленні профілю" });
                }
                res.json({ message: "Профіль оновлено!" });
            }
        );
    });
});

// Получение всех пользователей
app.get("/users", (req, res) => {
    dbModule.getUsers((err, rows) => {
        if (err) {
            console.error("Ошибка получения пользователей:", err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ users: rows });
    });
});

// Получение тем форума
app.get("/api/topics", (req, res) => {
    dbModule.getTopics((err, rows) => {
        if (err) {
            console.error("Ошибка получения тем:", err);
            res.status(500).json({ error: "Помилка сервера" });
            return;
        }
        res.json({ topics: rows });
    });
});

// Получение сообщений по теме
app.get("/api/topics/:articleId/messages", (req, res) => {
    const { articleId } = req.params;
    dbModule.getTopicByArticleId(articleId, (err, topic) => {
        if (err) {
            console.error("Ошибка получения темы:", err);
            res.status(500).json({ error: "Помилка сервера" });
            return;
        }
        if (!topic) {
            res.status(404).json({ error: "Тема не знайдена" });
            return;
        }
        dbModule.getMessagesByTopic(topic.id, (err, messages) => {
            if (err) {
                console.error("Ошибка получения сообщений:", err);
                res.status(500).json({ error: "Помилка сервера" });
                return;
            }
            console.log("Messages fetched:", messages);
            res.json({ messages });
        });
    });
});

// Отправка сообщения
app.post("/api/messages", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Токен не надано" });
    }
    const authToken = authHeader.split(" ")[1];
    dbModule.getUserByAuthToken(authToken, (err, user) => {
        if (err) {
            console.error("Ошибка базы данных:", err);
            return res.status(500).json({ error: "Помилка сервера" });
        }
        if (!user) {
            return res.status(401).json({ error: "Недійсний токен" });
        }
        const { articleId, content } = req.body;
        if (!articleId || !content) {
            return res.status(400).json({ error: "articleId і content обов’язкові" });
        }
        dbModule.getTopicByArticleId(articleId, (err, topic) => {
            if (err) {
                console.error("Ошибка получения темы:", err);
                return res.status(500).json({ error: "Помилка сервера" });
            }
            if (!topic) {
                return res.status(404).json({ error: "Тема не знайдена" });
            }
            dbModule.saveMessage({ topicId: topic.id, userId: user.id, content }, (err, result) => {
                if (err) {
                    console.error("Ошибка сохранения сообщения:", err);
                    return res.status(500).json({ error: "Помилка збереження повідомлення" });
                }
                res.json({ message: "Повідомлення збережено!", id: result.id });
            });
        });
    });
});

// Статические маршруты
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Untitled-1.html"));
});

app.get("/news", (req, res) => {
    res.sendFile(path.join(__dirname, "Untitled-1.html"));
});

app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "profile.html"));
});

app.get("/podbortexn", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "Podbortexn.html"));
});

app.get("/project-planner", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "project-planner.html"));
});

app.get("/solnpan", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "SolnPAN1.html"));
});

app.get("/texnologii", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "Texnologii.html"));
});

app.get("/webinar", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "webinar.html"));
});

app.get("/calculator", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "calculator.html"));
});

app.get("/forum", (req, res) => {
    res.sendFile(path.join(__dirname, "jscss", "forum.html"));
});

app.get("/vibor3/dom", (req, res) => {
    res.sendFile(path.join(__dirname, "VIBOR3", "DOM.html"));
});

app.get("/vibor3/hata", (req, res) => {
    res.sendFile(path.join(__dirname, "VIBOR3", "Hata.html"));
});

app.get("/vibor3/ychastok", (req, res) => {
    res.sendFile(path.join(__dirname, "VIBOR3", "YCHASTOK.html"));
});

process.on("SIGINT", () => {
    console.log("Закрытие сервера...");
    server.close(() => {
        console.log("HTTP-сервер закрыт.");
        db.close(err => {
            if (err) {
                console.error("Ошибка закрытия базы данных:", err.message);
            } else {
                console.log("База данных закрыта.");
            }
            process.exit(0);
        });
    });
});

process.on("uncaughtException", err => {
    console.error("Необработанная ошибка:", err);
    server.close(() => {
        db.close(() => {
            process.exit(1);
        });
    });
});