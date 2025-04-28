function filterProducts() {  
    const typeFilterValue = document.getElementById('filter').value;  
    const brandFilterValue = document.getElementById('brand-filter').value;  

    const solarPanels = document.querySelectorAll('#solar-panels .card');  
    const windTurbines = document.querySelectorAll('#wind-turbines .card');  
    const inverters = document.querySelectorAll('#inverters .card');  
    const batteries = document.querySelectorAll('#batteries .card');  
    const chargers = document.querySelectorAll('#chargers .card');  
    const poles = document.querySelectorAll('#poles .card');  
    const anemometers = document.querySelectorAll('#anemometers .card');  

    solarPanels.forEach(card => card.style.display = 'none');  
    windTurbines.forEach(card => card.style.display = 'none');  
    inverters.forEach(card => card.style.display = 'none');  
    batteries.forEach(card => card.style.display = 'none');  
    chargers.forEach(card => card.style.display = 'none');  
    poles.forEach(card => card.style.display = 'none');  
    anemometers.forEach(card => card.style.display = 'none');  

    if (typeFilterValue === 'all') {  
        solarPanels.forEach(card => card.style.display = 'block');  
        windTurbines.forEach(card => card.style.display = 'block');  
        inverters.forEach(card => card.style.display = 'block');  
        batteries.forEach(card => card.style.display = 'block');  
        chargers.forEach(card => card.style.display = 'block');  
        poles.forEach(card => card.style.display = 'block');  
        anemometers.forEach(card => card.style.display = 'block');  
    } else if (typeFilterValue === 'solar') {  
        solarPanels.forEach(card => card.style.display = 'block');  
    } else if (typeFilterValue === 'wind') {  
        windTurbines.forEach(card => card.style.display = 'block');  
    } else if (typeFilterValue === 'inverters') {  
        inverters.forEach(card => card.style.display = 'block');  
    } else if (typeFilterValue === 'batteries') {  
        batteries.forEach(card => card.style.display = 'block');  
    } else if (typeFilterValue === 'chargers') {  
        chargers.forEach(card => card.style.display = 'block');  
    } else if (typeFilterValue === 'poles') {  
        poles.forEach(card => card.style.display = 'block');  
    } else if (typeFilterValue === 'anemometers') {  
        anemometers.forEach(card => card.style.display = 'block');  
    }  

    const allCards = document.querySelectorAll('.card');  
    allCards.forEach(card => {  
        const matchesType = (typeFilterValue === 'all' || card.getAttribute('data-type') === typeFilterValue);  
        const matchesBrand = (brandFilterValue === 'all' || card.getAttribute('data-brand') === brandFilterValue);  

        if (matchesType && matchesBrand) {  
            card.style.display = 'block';  
        } else {  
            card.style.display = 'none';  
        }  
    });  
}  

function clearSelectedItems() {  
    $('#selectedItemsTable tbody').empty();  
}  

document.addEventListener('DOMContentLoaded', function() {  
    const authToken = localStorage.getItem("authToken");  
    if (!authToken) {  
        window.location.href = "../Untitled-1.html";  
        return;  
    }  

    const orderBtn = document.getElementById('headerOrderBtn');  
    const modal = document.getElementById('orderModal');  
    const closeBtn = document.querySelector('.close');  
    const cancelBtn = document.getElementById('cancelOrder');  
    const orderForm = document.getElementById('orderForm');  
    const userNameInput = document.getElementById('userName');  
    const userPhoneInput = document.getElementById('userPhone');  
    const addEquipmentBtn = document.getElementById('addEquipmentBtn');  
    const selectedItemsTable = document.getElementById('selectedItemsTable');  

    let userData = {}; // Переменная для хранения данных пользователя

    orderBtn.onclick = async function() {  
        try {
            const response = await fetch('http://localhost:3000/auth/login-with-token', {  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json'  
                },  
                body: JSON.stringify({ authToken })  
            });  

            if (!response.ok) {  
                if (response.status === 401) {  
                    throw new Error('Неавторизований доступ. Ваш токен може бути недійсним.');  
                }  
                throw new Error(`Помилка ${response.status}: ${response.statusText}`);  
            }  

            const data = await response.json();  
            if (data.error) {  
                alert('Помилка: ' + data.error);  
                if (data.error === 'Невірний authToken') {  
                    localStorage.removeItem("authToken");  
                    window.location.href = "../Untitled-1.html";  
                }  
                return;  
            }  

            // Сохраняем данные пользователя
            userData = {
                username: data.username || 'Невідомий користувач',
                phone: data.phone || 'Номер телефону відсутній'
            };

            // Заполняем поля формы данными пользователя
            userNameInput.value = userData.username;  
            userPhoneInput.value = userData.phone;  
            modal.style.display = 'block';  
        } catch (error) {  
            console.error('Помилка завантаження даних користувача:', error);  
            alert('Помилка при завантаженні даних користувача: ' + error.message);  
            localStorage.removeItem("authToken");  
            window.location.href = "../Untitled-1.html";  
        }  
    };  

    closeBtn.onclick = function() {  
        modal.style.display = 'none';  
        clearSelectedItems();  
    };  

    cancelBtn.onclick = function() {  
        modal.style.display = 'none';  
        clearSelectedItems();  
    };  

    window.onclick = function(event) {  
        if (event.target == modal) {  
            modal.style.display = 'none';  
            clearSelectedItems();  
        }  
    };  

    addEquipmentBtn.onclick = function() {  
        const selectedEquipment = $('#equipment-select').val();  
        if (!selectedEquipment) {  
            alert('Будь ласка, виберіть обладнання.');  
            return;  
        }  

        const quantity = prompt("Введіть кількість для: " + selectedEquipment, 1);  
        if (!quantity || isNaN(quantity) || quantity <= 0) {  
            alert('Будь ласка, введіть коректну кількість.');  
            return;  
        }  

        const tbody = $('#selectedItemsTable tbody');  
        const existingRow = tbody.find(`tr:contains('${selectedEquipment}')`);  
        if (existingRow.length) {  
            const currentQty = parseInt(existingRow.find('td:last').text());  
            existingRow.find('td:last').text(currentQty + parseInt(quantity));  
        } else {  
            tbody.append(`  
                <tr>  
                    <td>${selectedEquipment}</td>  
                    <td>${quantity}</td>  
                </tr>  
            `);  
        }  
    };  

    orderForm.onsubmit = async function(event) {  
        event.preventDefault();  

        const items = [];  
        $('#selectedItemsTable tbody tr').each(function() {  
            const equipment = $(this).find('td:first').text();  
            const quantity = parseInt($(this).find('td:last').text());  
            items.push(`${equipment} (x${quantity})`);  
        });  

        if (items.length === 0) {  
            alert('Будь ласка, додайте хоча б одне обладнання до замовлення.');  
            return;  
        }  

        // Формируем данные для отправки заказа
        const orderData = {  
            kit: items.join(', '), // Поле kit, как ожидает orders.js
            username: userNameInput.value || userData.username, // Берем из поля или из userData
            phone: userPhoneInput.value || userData.phone, // Берем из поля или из userData
            date: new Date().toISOString().split('T')[0]  
        };  

        // Проверяем, что все поля заполнены
        if (!orderData.kit || !orderData.username || !orderData.phone) {
            alert('Будь ласка, заповніть усі поля: виберіть обладнання, вкажіть ім’я та телефон.');
            return;
        }

        try {  
            console.log("Sending order data:", orderData); // Лог для отладки
            const response = await fetch('http://localhost:3000/api/orders', {  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json',  
                    'Authorization': `Bearer ${authToken}`  
                },  
                body: JSON.stringify(orderData)  
            });  

            console.log("Response status:", response.status);  
            console.log("Response headers:", response.headers.get("content-type"));  

            const contentType = response.headers.get("content-type");  
            if (!contentType || !contentType.includes("application/json")) {  
                const text = await response.text();  
                console.error("Очікувався JSON, але отримано:", text);  
                throw new Error("Сервер повернув не JSON-відповідь");  
            }  

            if (!response.ok) {  
                const errorData = await response.json();  
                throw new Error(errorData.error || `Помилка: ${response.status}`);  
            }  

            const data = await response.json();  
            alert('Замовлення успішно відправлено! Менеджер скоро зв’яжеться з вами для уточнення замовлення.');  
            modal.style.display = 'none';  
            clearSelectedItems();  
        } catch (error) {  
            console.error('Помилка відправки замовлення:', error);  
            alert(`Помилка при відправці замовлення: ${error.message}`);  
        }  
    };  
});