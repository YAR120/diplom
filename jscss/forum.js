document.addEventListener('DOMContentLoaded', () => {
    const postList = document.getElementById('post-list');
    const postContent = document.getElementById('post-content');
    const submitPostButton = document.getElementById('submit-post');
    const scrollUpButton = document.getElementById('scroll-up');
    let authToken = localStorage.getItem('authToken');
    let currentUsername = null;

    // Проверяем текущего пользователя
    if (authToken) {
        fetch('/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => {
                console.log('Profile response status:', response.status); // Отладка
                if (!response.ok) throw new Error('Failed to fetch profile');
                return response.json();
            })
            .then(data => {
                console.log('Profile data:', data); // Отладка
                if (data.username) {
                    currentUsername = data.username;
                }
            })
            .catch(error => console.error('Ошибка получения профиля:', error));
    } else {
        console.log('No authToken found'); // Отладка
    }

    // Получаем articleId из URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('articleId');
    console.log('Article ID:', articleId); // Отладка

    // Загружаем сообщения для текущей темы
    if (articleId) {
        loadMessages(articleId);
    } else {
        postList.innerHTML = '<p class="text-center text-gray-500">Оберіть тему для перегляду повідомлень.</p>';
    }

    // Отправка сообщения
    submitPostButton.addEventListener('click', submitPost);
    postContent.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitPost();
        }
    });

    scrollUpButton.addEventListener('click', () => {
        postList.scrollTop = 0;
    });

    function loadMessages(articleId) {
        console.log('Loading messages for articleId:', articleId); // Отладка
        fetch(`/api/topics/${articleId}/messages`)
            .then(response => {
                console.log('Messages response status:', response.status); // Отладка
                if (!response.ok) throw new Error('Failed to fetch messages');
                return response.json();
            })
            .then(data => {
                console.log('Messages data:', data); // Отладка
                postList.innerHTML = ''; // Очищаем список
                if (data.messages && Array.isArray(data.messages)) {
                    data.messages.forEach(message => {
                        addPost(message);
                    });
                    // Прокручиваем вниз только если есть сообщения
                    if (data.messages.length > 0) {
                        postList.scrollTop = postList.scrollHeight;
                    }
                } else {
                    console.log('No messages found'); // Отладка
                    postList.innerHTML = '<p class="text-center text-gray-500">Немає повідомлень.</p>';
                }
            })
            .catch(error => console.error('Ошибка загрузки сообщений:', error));
    }

    function submitPost() {
        const content = postContent.value.trim();
        console.log('Submitting post:', content); // Отладка
        if (!content) {
            alert('Введіть повідомлення!');
            return;
        }
        if (!articleId) {
            alert('Тема не обрана!');
            return;
        }
        if (!authToken) {
            alert('Увійдіть в систему, щоб відправляти повідомлення!');
            return;
        }

        fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ articleId, content })
        })
            .then(response => {
                console.log('Submit response status:', response.status); // Отладка
                if (!response.ok) throw new Error('Failed to submit message');
                return response.json();
            })
            .then(data => {
                console.log('Submit response data:', data); // Отладка
                if (data.error) {
                    alert(data.error);
                    return;
                }
                postContent.value = ''; // Очищаем форму
                loadMessages(articleId); // Перезагружаем сообщения
            })
            .catch(error => {
                console.error('Ошибка отправки сообщения:', error);
                alert('Помилка при відправленні повідомлення!');
            });
    }

    function addPost(message) {
        console.log('Adding post:', message); // Отладка
        const post = document.createElement('div');
        const isCurrentUser = currentUsername && message.username === currentUsername;
        post.className = `post modal-post ${isCurrentUser ? 'modal-post-own' : 'modal-post-other'}`;
        const createdAt = new Date(message.createdAt).toLocaleString('uk', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const initial = message.username.charAt(0).toUpperCase();
        post.innerHTML = `
            <div class="post-header modal-post-header">
                <div class="user-info">
                    <span class="user-initial">${initial}</span>
                    <strong>${message.username}</strong>
                </div>
                <span>${createdAt}</span>
            </div>
            <div class="post-content modal-post-content">${message.content}</div>
        `;
        postList.appendChild(post);
    }
});