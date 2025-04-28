const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Токен не надано' });
    }
    const authToken = authHeader.split(' ')[1];
    
    db.getUserByAuthToken(authToken, (err, user) => {
        if (err) {
            console.error('Ошибка базы данных:', err);
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Недійсний токен' });
        }
        req.user = user;
        next();
    });
};

// Сохранение заказа
router.post('/', authenticateToken, (req, res) => {
    const user = req.user;
    const { kit, username, phone, date } = req.body;
    if (!kit || !username || !phone) {
        return res.status(400).json({ error: 'Поля kit, username, phone обов’язкові' });
    }

    const order = {
        userId: user.id,
        username: username || user.username,
        phone: phone || user.phone,
        technology: kit,
        date: date || new Date().toISOString().split('T')[0],
        status: 'pending' // Додаємо статус за замовчуванням
    };

    db.saveOrder(order, (err, result) => {
        if (err) {
            console.error('Помилка збереження замовлення:', err);
            return res.status(500).json({ error: 'Помилка збереження замовлення' });
        }

        // Уведомления админу и менеджеру
        db.getUsers((err, users) => {
            if (err) {
                console.error('Помилка получения пользователей:', err);
                return;
            }

            const adminAndManagers = users.filter(u => u.role === 'admin' || u.role === 'manager');
            adminAndManagers.forEach(adminOrManager => {
                const notification = {
                    userId: adminOrManager.id,
                    username: adminOrManager.username,
                    message: `Нове замовлення від ${order.username}: ${order.technology} (#${result.id})`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'new_order'
                };

                db.saveNotification(notification, (err) => {
                    if (err) {
                        console.error('Помилка збереження повідомлення:', err);
                    }
                });
            });
        });

        res.status(200).json({ 
            message: 'Замовлення успішно збережено', 
            orderId: result.id,
            orderNumber: result.id 
        });
    });
});

// Получение заказов
router.get('/', authenticateToken, (req, res) => {
    const user = req.user;

    if (user.role === 'admin' || user.role === 'manager') {
        db.getAllOrders((err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Помилка сервера' });
            }
            res.status(200).json(orders);
        });
    } else {
        db.getOrdersByUserId(user.id, (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Помилка сервера' });
            }
            res.status(200).json(orders);
        });
    }
});

// Получение истории заказов
router.get('/history', authenticateToken, (req, res) => {
    const user = req.user;
    const userId = req.query.userId || user.id; // Отримуємо userId із запиту або токена

    if (user.role === 'user') {
        // Для користувача повертаємо лише їхні замовлення зі статусами confirmed, rejected, declined, cancelled
        db.getOrderHistoryByUserId(userId, (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Помилка сервера' });
            }
            res.status(200).json(orders);
        });
    } else if (user.role === 'admin' || user.role === 'manager') {
        // Для адмінів і менеджерів повертаємо всі замовлення зі статусами confirmed, rejected, declined, cancelled
        db.getAllOrderHistory((err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Помилка сервера' });
            }
            res.status(200).json(orders);
        });
    } else {
        return res.status(403).json({ error: 'Недостатньо прав' });
    }
});

// Удаление заказа
router.delete('/:id', authenticateToken, (req, res) => {
    const user = req.user;
    const orderId = req.params.id;

    db.getOrderById(orderId, (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Замовлення не знайдено' });
        }

        if (user.role === 'admin' || user.role === 'manager' || user.id === order.userId) {
            db.deleteOrderById(orderId, (err, success) => {
                if (err) {
                    return res.status(500).json({ error: 'Помилка видалення замовлення' });
                }
                if (!success) {
                    return res.status(404).json({ error: 'Замовлення не знайдено' });
                }

                if (user.role === 'admin' || user.role === 'manager') {
                    db.getUserByAuthToken(req.headers.authorization.split(' ')[1], (err, adminUser) => {
                        if (!err && adminUser) {
                            const notification = {
                                userId: order.userId,
                                username: order.username,
                                message: `Ваше замовлення (${order.technology}) було скасовано адміністратором`,
                                date: new Date().toISOString().split('T')[0],
                                type: 'order_cancelled'
                            };
                            db.saveNotification(notification, (err) => {
                                if (err) {
                                    console.error('Помилка збереження повідомлення:', err);
                                }
                            });
                        }
                    });
                }

                res.status(200).json({ message: 'Замовлення успішно видалено' });
            });
        } else {
            return res.status(403).json({ error: 'Немає доступу для видалення цього замовлення' });
        }
    });
});

// Подтверждение заказа (admin/manager only)
router.put('/:id/confirm', authenticateToken, (req, res) => {
    const user = req.user;
    const orderId = req.params.id;

    if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ error: 'Тільки адміністратор або менеджер може підтверджувати замовлення' });
    }

    db.getOrderById(orderId, (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Замовлення не знайдено' });
        }

        db.updateOrderStatus(orderId, null, 'confirmed', (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Помилка оновлення статусу замовлення' });
            }
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Замовлення не знайдено' });
            }

            const notification = {
                userId: order.userId,
                username: order.username,
                message: `Ваше замовлення (${order.technology}) підтверджено`,
                date: new Date().toISOString().split('T')[0],
                type: 'order_confirmed'
            };

            db.saveNotification(notification, (err) => {
                if (err) {
                    console.error('Помилка збереження повідомлення:', err);
                }
            });

            res.status(200).json({ message: 'Замовлення успішно підтверджено' });
        });
    });
});

// Отклонение заказа (admin/manager only)
router.put('/:id/reject', authenticateToken, (req, res) => {
    const user = req.user;
    const orderId = req.params.id;

    if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ error: 'Тільки адміністратор або менеджер може відхиляти замовлення' });
    }

    db.getOrderById(orderId, (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Замовлення не знайдено' });
        }

        db.updateOrderStatus(orderId, null, 'rejected', (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Помилка оновлення статусу замовлення' });
            }
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Замовлення не знайдено' });
            }

            const notification = {
                userId: order.userId,
                username: order.username,
                message: `Ваше замовлення (${order.technology}) відхилено`,
                date: new Date().toISOString().split('T')[0],
                type: 'order_rejected'
            };

            db.saveNotification(notification, (err) => {
                if (err) {
                    console.error('Помилка збереження повідомлення:', err);
                }
            });

            res.status(200).json({ message: 'Замовлення успішно відхилено' });
        });
    });
});

// Получение уведомлений
router.get('/notifications', authenticateToken, (req, res) => {
    const user = req.user;

    if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ error: 'Немає доступу до повідомлень' });
    }

    db.getNotifications(user.id, (err, notifications) => {
        if (err) {
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        res.status(200).json(notifications);
    });
});

// Сохранение проекта
router.post('/save-project', authenticateToken, (req, res) => {
    const user = req.user;
    const { username, phone, project } = req.body;

    if (!username || !phone || !project) {
        return res.status(400).json({ error: 'Поля username, phone, project обов’язкові' });
    }

    const projectData = {
        userId: user.id,
        username: username,
        phone: phone,
        project: JSON.stringify(project),
        createdAt: new Date().toISOString()
    };

    db.saveProject(projectData, (err, result) => {
        if (err) {
            console.error('Ошибка сохранения проекта:', err);
            return res.status(500).json({ error: 'Помилка збереження проекту' });
        }

        // Уведомления админу и менеджеру о новом проекте
        db.getUsers((err, users) => {
            if (err) {
                console.error('Помилка получения пользователей:', err);
                return;
            }

            const adminAndManagers = users.filter(u => u.role === 'admin' || u.role === 'manager');
            adminAndManagers.forEach(adminOrManager => {
                const notification = {
                    userId: adminOrManager.id,
                    username: adminOrManager.username,
                    message: `Новий проект від ${projectData.username} (#${result.id})`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'new_project'
                };

                db.saveNotification(notification, (err) => {
                    if (err) {
                        console.error('Помилка збереження повідомлення:', err);
                    }
                });
            });
        });

        res.json({ message: 'Проект успішно збережено!', projectId: result.id });
    });
});

// Получение проектов пользователя
router.get('/projects', authenticateToken, (req, res) => {
    const user = req.user;

    if (user.role === 'admin' || user.role === 'manager') {
        db.getAllProjects((err, projects) => {
            if (err) {
                console.error('Ошибка получения проектов:', err);
                return res.status(500).json({ error: 'Помилка сервера' });
            }
            res.json({ projects });
        });
    } else {
        db.getProjectsByUserId(user.id, (err, projects) => {
            if (err) {
                console.error('Ошибка получения проектов:', err);
                return res.status(500).json({ error: 'Помилка сервера' });
            }
            res.json({ projects });
        });
    }
});

// Удаление проекта (admin only)
router.delete('/projects/:id', authenticateToken, (req, res) => {
    const user = req.user;
    const projectId = req.params.id;

    if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ error: 'Тільки адміністратор або менеджер може видаляти проекти' });
    }

    db.db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
        if (err) {
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        if (!project) {
            return res.status(404).json({ error: 'Проект не знайдено' });
        }

        db.db.run('DELETE FROM projects WHERE id = ?', [projectId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Помилка видалення проекту' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Проект не знайдено' });
            }

            const notification = {
                userId: project.userId,
                username: project.username,
                message: `Ваш проект (#${projectId}) було видалено адміністратором`,
                date: new Date().toISOString().split('T')[0],
                type: 'project_deleted'
            };

            db.saveNotification(notification, (err) => {
                if (err) {
                    console.error('Помилка збереження повідомлення:', err);
                }
            });

            res.status(200).json({ message: 'Проект успішно видалено' });
        });
    });
});

module.exports = router;