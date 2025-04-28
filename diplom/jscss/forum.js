let enterPressTimer;  

const postsContainer = document.getElementById('posts');  
const postForm = document.getElementById('post-form');  

document.getElementById("submit-post").addEventListener("click", submitPost);  

document.getElementById("post-content").addEventListener("keypress", function (event) {  
    if (event.key === "Enter") {  
        event.preventDefault(); // предотвращаем стандартное поведение (перевод строки)  

        // Сбрасываем таймер, если пользователь нажал Enter еще раз  
        if (enterPressTimer) {  
            clearTimeout(enterPressTimer);  
            enterPressTimer = null;  
            submitPost(); // вызываем функцию отправки сообщения  
        } else {  
            enterPressTimer = setTimeout(() => {  
                enterPressTimer = null; // сбрасываем таймер, если второй Enter не был нажат  
            }, 1500); // 1.5 секунды  
        }  
    }  
});  

// Добавляем обработчик события для кнопки прокрутки вверх  
document.getElementById("scroll-up").addEventListener("click", scrollToTop);  

function submitPost() {  
    const postContent = document.getElementById("post-content").value;  
    if (postContent.trim() === '') {  
        alert("Пожалуйста, введите сообщение."); // Проверка на пустое сообщение  
        return;  
    }  

    addPost(postContent); // Добавляем сообщение через функцию addPost  
    document.getElementById("post-content").value = ''; // очищаем текстовое поле  
}  

function addPost(message) {  
    const newPost = document.createElement('div');  
    newPost.className = 'post';  
    const now = new Date();  
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });  
    const userName = "Пользователь"; // Здесь можно заменить на реальное имя пользователя  

    newPost.innerHTML = `  
        <div class="post-header">  
            <strong>${userName}</strong> - ${timeString}  
        </div>  
        <div class="post-content">${message}</div>  
    `;  

    postsContainer.appendChild(newPost); // Добавляем новое сообщение в конец списка  

    // Прокручиваем вниз  
    postsContainer.scrollTop = postsContainer.scrollHeight;  
}  

// Функция прокрутки к началу контейнера сообщений  
function scrollToTop() {  
    postsContainer.scrollTop = 0; // Установить scrollTop в 0, чтобы прокрутить вверх  
}