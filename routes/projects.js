const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware для проверки сессии
const authenticateSession = (req, res, next) => {
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

// Сохранение проекта
router.post('/save-project', authenticateSession, (req, res) => {
    const user = req.user;
    const { username, phone, project, technology } = req.body;

    if (!username || !phone || !project) {
        return res.status(400).json({ error: 'Поля username, phone, project обов’язкові' });
    }

    const projectData = {
        userId: user.id,
        username: username,
        phone: phone,
        project: JSON.stringify(project),
        technology: technology,
        createdAt: new Date().toISOString()
    };

    db.saveProject(projectData, (err, result) => {
        if (err) {
            console.error('Ошибка сохранения проекта:', err);
            return res.status(500).json({ error: 'Помилка збереження проекту' });
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
router.get('/', authenticateSession, (req, res) => {
    const user = req.user;

    db.getProjectsByUserId(user.id, (err, projects) => {
        if (err) {
            console.error('Ошибка получения проектов:', err);
            return res.status(500).json({ error: 'Помилка сервера' });
        }
        res.json({ projects });
    });
});

// Удаление проекта (admin only)
router.delete('/:id', authenticateSession, (req, res) => {
    const user = req.user;
    const projectId = req.params.id;

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Тільки адміністратор може видаляти проекти' });
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