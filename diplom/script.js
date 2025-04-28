// Модальное окно для регистрации  
var modal = document.getElementById("registrationModal");  
var btn = document.getElementById("registerBtn");  
var span = document.getElementById("closeModal");  

// Открытие модального окна при нажатии на кнопку  
btn.onclick = function() {  
    modal.style.display = "block";  
}  

// Закрытие модального окна при нажатии на (x)  
span.onclick = function() {  
    modal.style.display = "none";  
}  

// Закрытие модального окна при нажатии вне его  
window.onclick = function(event) {  
    if (event.target == modal) {  
        modal.style.display = "none";  
    }  
}  

// Обработка отправки формы регистрации  
document.getElementById("registrationForm").onsubmit = function(event) {  
    event.preventDefault();  
    alert("Форма зареєстрована!");  
    modal.style.display = "none"; // Закрываем модальное окно после отправки  
}  

// Модальное окно редактирования профиля  
document.getElementById('editProfileBtn').addEventListener('click', function() {  
    document.getElementById('editModal').style.display = 'block';  
});  

document.getElementById('closeModal').addEventListener('click', function() {  
    document.getElementById('editModal').style.display = 'none';  
});  

document.getElementById('saveChangesBtn').addEventListener('click', function() {  
    const emailInput = document.getElementById('emailInput').value;  
    document.getElementById('email').textContent = emailInput;  
    document.getElementById('editModal').style.display = 'none';  
});