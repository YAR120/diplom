const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const db = new sqlite3.Database(
  process.env.DB_PATH || "./mydatabase.db",
  (err) => {
    if (err) {
      console.error("Ошибка подключения к базе данных:", err.message);
    } else {
      console.log("Подключение к базе данных успешно");
    }
  }
);

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            fullName TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            password TEXT,
            role TEXT DEFAULT 'user',
            authToken TEXT,
            aboutMe TEXT
        )`,
      (err) => {
        if (err) {
          console.error("Ошибка создания таблицы users:", err.message);
        } else {
          console.log("Таблица users создана или уже существует");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            articleId TEXT UNIQUE,
            title TEXT
        )`,
      (err) => {
        if (err) {
          console.error("Ошибка создания таблицы topics:", err.message);
        } else {
          console.log("Таблица topics создана или уже существует");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topicId INTEGER,
            userId INTEGER,
            content TEXT,
            createdAt TEXT,
            FOREIGN KEY (topicId) REFERENCES topics(id),
            FOREIGN KEY (userId) REFERENCES users(id)
        )`,
      (err) => {
        if (err) {
          console.error("Ошибка создания таблицы messages:", err.message);
        } else {
          console.log("Таблица messages создана или уже существует");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            username TEXT NOT NULL,
            phone TEXT NOT NULL,
            technology TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (userId) REFERENCES users(id)
        )`,
      (err) => {
        if (err) {
          console.error("Ошибка создания таблицы orders:", err.message);
        } else {
          console.log("Таблица orders создана или уже существует");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS order_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER,
            userId INTEGER,
            status TEXT,
            date TEXT,
            FOREIGN KEY (orderId) REFERENCES orders(id),
            FOREIGN KEY (userId) REFERENCES users(id)
        )`,
      (err) => {
        if (err) {
          console.error("Ошибка создания таблицы order_history:", err.message);
        } else {
          console.log("Таблица order_history создана или уже существует");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`,
      (err) => {
        if (err) {
          console.error("Ошибка создания таблицы notifications:", err.message);
        } else {
          console.log("Таблица notifications создана или уже существует");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            username TEXT NOT NULL,
            phone TEXT NOT NULL,
            project TEXT NOT NULL,
            technology TEXT,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`,
      (err) => {
        if (err) {
          console.error("Ошибка создания таблицы projects:", err.message);
        } else {
          console.log("Таблица projects создана или уже существует");
        }
      }
    );

    const initialTopics = [
      {
        articleId: "article_1",
        title: "Старі вітряки можуть виробляти на 30% більше енергії",
      },
      { articleId: "article_2", title: "Сонячні панелі на будь-якій поверхні" },
      {
        articleId: "article_3",
        title: "Огляд 2E PSPLW300: портативна сонячна панель",
      },
      {
        articleId: "article_4",
        title: "Чи вигідно встановлювати сонячну батарею на балконі",
      },
    ];

    initialTopics.forEach((topic) => {
      db.run(
        `INSERT OR IGNORE INTO topics (articleId, title) VALUES (?, ?)`,
        [topic.articleId, topic.title],
        (err) => {
          if (err) {
            console.error(
              `Ошибка добавления темы ${topic.title}:`,
              err.message
            );
          }
        }
      );
    });

    insertInitialUsers();
    insertTestMessages();
    insertTestOrders();
  });
};

const insertInitialUsers = () => {
  const initialUsers = [
    {
      username: "admin",
      fullName: "Admin User",
      email: "admin@example.com",
      phone: "+380000000000",
      password: "111111", // Пароль відповідає вимогам (6+ символів)
      role: "admin",
      authToken: uuidv4(),
      aboutMe: "Я адміністратор системи EcoEnergy.",
    },
    {
      username: "olena",
      fullName: "Олена Зеленська",
      email: "olena@example.com",
      phone: "+380111111111",
      password: "123456", // Пароль відповідає вимогам
      role: "user",
      authToken: uuidv4(),
      aboutMe: "Цікавлюсь відновлювальною енергією.",
    },
    {
      username: "ivan",
      fullName: "Іван Сонячний",
      email: "ivan@example.com",
      phone: "+380222222222",
      password: "456789", // Пароль відповідає вимогам
      role: "manager", // Змінено роль на manager
      authToken: uuidv4(),
      aboutMe: "Власник сонячної панелі.",
    },
  ];

  db.get(`SELECT COUNT(*) as count FROM users`, async (err, row) => {
    if (err) {
      console.error("Ошибка проверки количества пользователей:", err.message);
      return;
    }

    if (row.count === 0) {
      console.log("Таблица users пуста, добавляем начальные записи.");
      for (const user of initialUsers) {
        try {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          db.run(
            `INSERT INTO users (username, fullName, email, phone, password, role, authToken, aboutMe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              user.username,
              user.fullName,
              user.email,
              user.phone,
              hashedPassword,
              user.role,
              user.authToken,
              user.aboutMe,
            ],
            (err) => {
              if (err) {
                console.error(
                  `Ошибка добавления пользователя ${user.email}:`,
                  err.message
                );
              } else {
                console.log(
                  `Добавлен пользователь: ${user.username}, authToken: ${user.authToken}`
                );
              }
            }
          );
        } catch (err) {
          console.error(
            `Ошибка хеширования пароля для ${user.username}:`,
            err.message
          );
        }
      }
      console.log("Начальные пользователи добавлены.");
    } else {
      console.log(
        "Таблица users уже содержит пользователей, пропускаем добавление."
      );
    }
  });
};

const insertTestMessages = () => {
  db.get(`SELECT COUNT(*) as count FROM messages`, (err, row) => {
    if (err) {
      console.error("Ошибка проверки количества сообщений:", err.message);
      return;
    }

    if (row.count === 0) {
      console.log("Таблица messages пуста, добавляем тестовые записи.");
      const testMessages = [
        {
          topicArticleId: "article_1",
          username: "admin",
          content:
            "Хтось пробував модернізувати старі вітряки? Які технології дають +30% ефективності?",
          createdAt: "2025-04-18T09:00:00Z",
        },
        {
          topicArticleId: "article_1",
          username: "olena",
          content:
            "Читала про нові лопаті з композитних матеріалів. Вони легші і краще ловлять вітер.",
          createdAt: "2025-04-18T09:15:00Z",
        },
        {
          topicArticleId: "article_1",
          username: "ivan",
          content:
            "Так, але композитні лопаті коштують дорого. Може, є дешевші рішення?",
          createdAt: "2025-04-18T09:30:00Z",
        },
        {
          topicArticleId: "article_2",
          username: "ivan",
          content: "Сонячні панелі на даху будинку — реально? Які є нюанси?",
          createdAt: "2025-04-18T11:00:00Z",
        },
        {
          topicArticleId: "article_2",
          username: "olena",
          content:
            "Реально, але треба перевірити міцність даху і кут нахилу. У мене стоять, дають 5 кВт.",
          createdAt: "2025-04-18T11:20:00Z",
        },
        {
          topicArticleId: "article_2",
          username: "admin",
          content:
            "А як щодо гнучких панелей? Вони підходять для нерівних поверхонь?",
          createdAt: "2025-04-18T11:40:00Z",
        },
        {
          topicArticleId: "article_3",
          username: "ivan",
          content:
            "Цікавить PSPLW300 для походів. Як вона в похмуру погоду працює?",
          createdAt: "2025-04-18T12:15:00Z",
        },
        {
          topicArticleId: "article_4",
          username: "olena",
          content:
            "Хочу батарею на балкон. Хтось рахував, за скільки окупається?",
          createdAt: "2025-04-18T13:00:00Z",
        },
        {
          topicArticleId: "article_4",
          username: "admin",
          content:
            "Залежить від тарифів. У середньому 5-7 років, якщо економить електрику.",
          createdAt: "2025-04-18T13:20:00Z",
        },
      ];

      testMessages.forEach((message) => {
        db.get(
          "SELECT id FROM users WHERE username = ?",
          [message.username],
          (err, user) => {
            if (err || !user) {
              console.error(`Пользователь ${message.username} не найден`);
              return;
            }
            db.get(
              "SELECT id FROM topics WHERE articleId = ?",
              [message.topicArticleId],
              (err, topic) => {
                if (err || !topic) {
                  console.error(`Тема ${message.topicArticleId} не найдена`);
                  return;
                }
                db.run(
                  `INSERT INTO messages (topicId, userId, content, createdAt) VALUES (?, ?, ?, ?)`,
                  [topic.id, user.id, message.content, message.createdAt],
                  (err) => {
                    if (err) {
                      console.error(
                        `Ошибка добавления сообщения:`,
                        err.message
                      );
                    } else {
                      console.log(`Добавлено сообщение от ${message.username}`);
                    }
                  }
                );
              }
            );
          }
        );
      });
      console.log("Тестовые сообщения добавлены.");
    } else {
      console.log(
        "Таблица messages уже содержит записи, пропускаем добавление."
      );
    }
  });
};

const insertTestOrders = () => {
  db.get(`SELECT COUNT(*) as count FROM orders`, (err, row) => {
    if (err) {
      console.error("Ошибка проверки количества заказов:", err.message);
      return;
    }

    if (row.count === 0) {
      console.log("Таблица orders пуста, добавляем тестовые записи.");
      const testOrders = [
        {
          username: "Admin User",
          phone: "+380000000000",
          technology: "Комплект 1: Збалансований комплект",
          date: "2025-04-19",
          status: "confirmed",
        },
        {
          username: "Admin User",
          phone: "+380000000000",
          technology: "Вітрогенератор: Компактний",
          date: "2025-04-18",
          status: "rejected",
        },
        {
          username: "Олена Зеленська",
          phone: "+380111111111",
          technology: "Комплект 1: Потужний комплект сонячних панелей",
          date: "2025-04-19",
          status: "pending",
        },
        {
          username: "Іван Сонячний",
          phone: "+380222222222",
          technology: "Комплект 3: Максимальний вихід",
          date: "2025-04-17",
          status: "confirmed",
        },
      ];

      testOrders.forEach((order) => {
        db.get(
          "SELECT id FROM users WHERE fullName = ?",
          [order.username],
          (err, user) => {
            if (err || !user) {
              console.error(
                `Пользователь с fullName ${order.username} не найден`
              );
              return;
            }
            db.run(
              `INSERT INTO orders (userId, username, phone, technology, date, status) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                user.id,
                order.username,
                order.phone,
                order.technology,
                order.date,
                order.status,
              ],
              (err) => {
                if (err) {
                  console.error(`Ошибка добавления заказа:`, err.message);
                } else {
                  console.log(
                    `Добавлен заказ для ${order.username} со статусом ${order.status}`
                  );
                }
              }
            );
          }
        );
      });
      console.log("Тестовые заказы добавлены.");
    } else {
      console.log("Таблица orders уже содержит записи, пропускаем добавление.");
    }
  });
};

const saveUser = (user, callback) => {
  const { username, fullName, email, phone, password, role = "user" } = user;
  const authToken = uuidv4();
  db.run(
    `INSERT INTO users (username, fullName, email, phone, password, role, authToken) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, fullName, email, phone, password, role, authToken],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, { id: this.lastID, authToken });
    }
  );
};

const getUsers = (callback) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, rows);
  });
};

const getUserByUsername = (username, callback) => {
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, row);
  });
};

const getUserByEmail = (email, callback) => {
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, row);
  });
};

const getUserByAuthToken = (authToken, callback) => {
  db.get("SELECT * FROM users WHERE authToken = ?", [authToken], (err, row) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, row);
  });
};

const getTopics = (callback) => {
  db.all("SELECT * FROM topics", [], (err, rows) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, rows);
  });
};

const getMessagesByTopic = (topicId, callback) => {
  db.all(
    `SELECT m.*, u.username FROM messages m
        JOIN users u ON m.userId = u.id
        WHERE m.topicId = ?
        ORDER BY m.createdAt ASC`,
    [topicId],
    (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, rows);
    }
  );
};

const saveMessage = (message, callback) => {
  const { topicId, userId, content } = message;
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO messages (topicId, userId, content, createdAt) VALUES (?, ?, ?, ?)`,
    [topicId, userId, content, createdAt],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, { id: this.lastID });
    }
  );
};

const getTopicByArticleId = (articleId, callback) => {
  db.get(
    "SELECT * FROM topics WHERE articleId = ?",
    [articleId],
    (err, row) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, row);
    }
  );
};

const getOrdersByUserId = (userId, callback) => {
  db.all(
    `SELECT * FROM orders WHERE userId = ? AND status = 'pending'`,
    [userId],
    (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, rows);
    }
  );
};

const getAllOrders = (callback) => {
  db.all(`SELECT * FROM orders WHERE status = 'pending'`, [], (err, rows) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, rows);
  });
};

const getOrderById = (orderId, callback) => {
  db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, row) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, row);
  });
};

const saveOrder = (order, callback) => {
  const { userId, username, phone, technology, date } = order;
  db.run(
    `INSERT INTO orders (userId, username, phone, technology, date, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
    [userId, username, phone, technology, date],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, { id: this.lastID });
    }
  );
};

const updateOrderStatus = (orderId, userId, status, callback) => {
  const updateDate = new Date().toISOString().split("T")[0];
  db.serialize(() => {
    if (userId) {
      db.run(
        `UPDATE orders SET status = ? WHERE id = ? AND userId = ?`,
        [status, orderId, userId],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          if (this.changes === 0) {
            callback(null, { changes: 0 });
            return;
          }
          db.run(
            `INSERT INTO order_history (orderId, userId, status, date) VALUES (?, ?, ?, ?)`,
            [orderId, userId, status, updateDate],
            function (err) {
              if (err) {
                console.error(
                  "Ошибка добавления в order_history:",
                  err.message
                );
              }
              callback(null, { changes: this.changes });
            }
          );
        }
      );
    } else {
      db.run(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, orderId],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          if (this.changes === 0) {
            callback(null, { changes: 0 });
            return;
          }
          db.get(
            `SELECT userId FROM orders WHERE id = ?`,
            [orderId],
            (err, row) => {
              if (err || !row) {
                console.error(
                  "Ошибка получения userId для order_history:",
                  err ? err.message : "Заказ не найден"
                );
                callback(null, { changes: this.changes });
                return;
              }
              db.run(
                `INSERT INTO order_history (orderId, userId, status, date) VALUES (?, ?, ?, ?)`,
                [orderId, row.userId, status, updateDate],
                function (err) {
                  if (err) {
                    console.error(
                      "Ошибка добавления в order_history:",
                      err.message
                    );
                  }
                  callback(null, { changes: this.changes });
                }
              );
            }
          );
        }
      );
    }
  });
};

const deleteOrder = (orderId, userId, callback) => {
  db.run(
    `DELETE FROM orders WHERE id = ? AND userId = ?`,
    [orderId, userId],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, this.changes > 0);
    }
  );
};

const deleteOrderById = (orderId, callback) => {
  db.run(`DELETE FROM orders WHERE id = ?`, [orderId], function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, this.changes > 0);
  });
};

const saveNotification = (notification, callback) => {
  const { userId, username, message, date, type } = notification;
  db.run(
    `INSERT INTO notifications (userId, username, message, date, type) VALUES (?, ?, ?, ?, ?)`,
    [userId, username, message, date, type],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, { id: this.lastID });
    }
  );
};

const getNotifications = (userId, callback) => {
  db.all(
    `SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, rows);
    }
  );
};

const getOrderHistoryByUserId = (userId, callback) => {
  db.all(
    `SELECT * FROM orders 
         WHERE userId = ? AND status IN ('confirmed', 'rejected', 'declined', 'cancelled')`,
    [userId],
    (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, rows);
    }
  );
};

const getAllOrderHistory = (callback) => {
  db.all(
    `SELECT * FROM orders 
         WHERE status IN ('confirmed', 'rejected', 'declined', 'cancelled')`,
    [],
    (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, rows);
    }
  );
};

const saveProject = (project, callback) => {
  const {
    userId,
    username,
    phone,
    project: projectData,
    technology,
    createdAt,
  } = project;
  db.run(
    `INSERT INTO projects (userId, username, phone, project, technology, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, username, phone, projectData, technology, createdAt],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, { id: this.lastID });
    }
  );
};

const getProjectsByUserId = (userId, callback) => {
  db.all(
    `SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, rows);
    }
  );
};

initializeDatabase();

module.exports = {
  saveUser,
  getUsers,
  getUserByUsername,
  getUserByEmail,
  getUserByAuthToken,
  getTopics,
  getMessagesByTopic,
  saveMessage,
  getTopicByArticleId,
  getOrdersByUserId,
  getAllOrders,
  getOrderById,
  saveOrder,
  updateOrderStatus,
  deleteOrder,
  deleteOrderById,
  saveNotification,
  getNotifications,
  getOrderHistoryByUserId,
  getAllOrderHistory,
  saveProject,
  getProjectsByUserId,
  db,
};
