let selectedEquipment = [];  
let selectedConnectionType = '';
let availableArea = 0;

// Обработка выбора оборудования  
function selectEquipment(equipment) {  
    if (selectedEquipment.includes(equipment)) {  
        selectedEquipment = selectedEquipment.filter(item => item !== equipment);  
    } else {  
        selectedEquipment.push(equipment);  
    }  

    // Обновляем классы для выделения выбранного оборудования  
    document.querySelectorAll('#equipment-list li').forEach(li => {  
        if (selectedEquipment.includes(li.textContent)) {  
            li.classList.add('selected');  
        } else {  
            li.classList.remove('selected');  
        }  
    });  

    updateEquipmentDisplay();  
}  

// Обработка выбора типа подключения  
function selectConnectionType(connectionType) {  
    selectedConnectionType = connectionType;  

    // Снимаем выделение со всех элементов подключения  
    document.querySelectorAll('#connection-types li').forEach(li => {  
        li.classList.remove('selected');  
    });  

    // Добавляем выделение для выбранного типа подключения  
    const selectedLi = Array.from(document.querySelectorAll('#connection-types li')).find(li => li.textContent === connectionType);  
    if (selectedLi) {  
        selectedLi.classList.add('selected');  
    }  

    updateEquipmentDisplay();  
}  

// Обновление доступной площади  
function updateAvailableSpace() {  
    const areaInput = document.getElementById("available-area");  
    if (!areaInput) {  
        console.error("Поле для ввода площади не найдено!");  
        return;  
    }  

    availableArea = parseFloat(areaInput.value);  

    if (isNaN(availableArea) || availableArea <= 0) {  
        alert("Будь ласка, введіть дійсну площу.");  
        availableArea = 0; // Сбрасываем значение, если оно некорректное  
    }  
}  

// Обновление эффективности солнечных панелей  
function updateSolarPanelEfficiency() {  
    const selectedType = document.getElementById("solar-panel-types")?.value;  
    const efficiencyElement = document.getElementById("solar-panel-efficiency");  
    const descriptionElement = document.getElementById("solar-panel-description");  

    if (!efficiencyElement || !descriptionElement) {  
        console.error("Элементы для отображения эффективности солнечных панелей не найдены!");  
        return;  
    }  

    switch (selectedType) {  
        case 'monocrystalline':  
            efficiencyElement.textContent = 'Ефективність: 15-22%';  
            descriptionElement.textContent = 'Монокристалічні панелі мають високу ефективність. Використовуються для побутових і комерційних установок.';  
            break;  
        case 'polycrystalline':  
            efficiencyElement.textContent = 'Ефективність: 13-16%';  
            descriptionElement.textContent = 'Полікристалічні панелі коштують менше. Підходять для великих проектів.';  
            break;  
        case 'thin-film':  
            efficiencyElement.textContent = 'Ефективність: 10-12%';  
            descriptionElement.textContent = 'Тонкоплівкові панелі гнучкі й легкі. Ідеальні для обмежених просторів.';  
            break;  
        default:  
            efficiencyElement.textContent = '';  
            descriptionElement.textContent = '';  
    }  
}  

// Обновление информации о ветряных турбинах  
function updateWindTurbineInfo() {  
    const windTurbineType = document.getElementById('wind-turbine-types')?.value;  
    const infoElement = document.getElementById('wind-turbine-info');  
    const efficiencyElement = document.getElementById('wind-turbine-efficiency');  
    const descriptionElement = document.getElementById("wind-turbine-description");  

    if (!infoElement || !efficiencyElement || !descriptionElement) {  
        console.error("Элементы для отображения информации о ветряных турбинах не найдены!");  
        return;  
    }  

    switch (windTurbineType) {  
        case 'horizontal-axis':  
            infoElement.textContent = 'Горизонтально-осні вітрові турбіни є найбільш поширеними.';  
            efficiencyElement.textContent = 'Ефективність: 35-45%';  
            descriptionElement.textContent = 'Горизонтально-осні турбіни є найбільш ефективними. Використовуються в комерційних проектах.';  
            break;  
        case 'vertical-axis':  
            infoElement.textContent = 'Вертикально-осні вітрові турбіни забезпечують стабільну продуктивність.';  
            efficiencyElement.textContent = 'Ефективність: 30-40%';  
            descriptionElement.textContent = 'Вертикально-осні турбіни забезпечують стабільну продуктивність. Підходять для міських умов.';  
            break;  
        case 'commercial':  
            infoElement.textContent = 'Комерційні вітрові турбіни використовуються для генерації електрики з великих масштабів.';  
            efficiencyElement.textContent = 'Ефективність: 35-45%';  
            descriptionElement.textContent = 'Комерційні турбіни широко використовуються у великих проектах. Висока продуктивність.';  
            break;  
        case 'small-scale':  
            infoElement.textContent = 'Малі вітрові турбіни підходять для домашнього використання.';  
            efficiencyElement.textContent = 'Ефективність: 20-30%';  
            descriptionElement.textContent = 'Малі вітрові турбіни підходять для індивідуального використання. Ідеальні для дач.';  
            break;  
        case 'offshore':  
            infoElement.textContent = 'Морські вітрові турбіни мають більшу продуктивність.';  
            efficiencyElement.textContent = 'Ефективність: 45-50%';  
            descriptionElement.textContent = 'Морські турбіни мають більшу ефективність. Використовуються для великих енергетичних проектів.';  
            break;  
        case 'land-based':  
            infoElement.textContent = 'Наземні вітрові турбіни встановлюються на суші.';  
            efficiencyElement.textContent = 'Ефективність: 30-40%';  
            descriptionElement.textContent = 'Наземні турбіни прості у встановленні. Використовуються в сільських районах.';  
            break;  
        default:  
            infoElement.textContent = '';  
            efficiencyElement.textContent = '';  
            descriptionElement.textContent = '';  
    }  
}  

// Обновление отображения выбранного оборудования  
function updateEquipmentDisplay() {  
    const additionalList = document.getElementById("additional-list");  
    if (!additionalList) {  
        console.error("Список дополнительного оборудования не найден!");  
        return;  
    }  

    additionalList.innerHTML = '';  

    const selectedText = selectedEquipment.length > 0 ? selectedEquipment.join(', ') : 'Нічого не вибрано';  
    document.getElementById("selected-equipment").textContent = `Вибране обладнання: ${selectedText}`;  

    let additionalEquipment = [];  

    if (selectedEquipment.includes('Сонячні панелі')) {  
        additionalEquipment.push(  
            'Інвертори',  
            'Модератори зарядного пристрою',  
            'Стовпи і щогли',  
            'Типи акумуляторів: Літій-іонні, Свинцево-кислотні'  
        );  
    }  

    if (selectedEquipment.includes('Вітрові турбіни')) {  
        additionalEquipment.push(  
            'Інвертори',  
            'Системи анемометрів',  
            'Стовпи і щогли',  
            'Типи акумуляторів: Літій-іонні, Свинцево-кислотні'  
        );  
    }  

    if (additionalEquipment.length === 0) {  
        additionalEquipment.push('Загальне обладнання');  
    }  

    if (selectedConnectionType) {  
        additionalEquipment.push(`Додатково для типу підключення: ${selectedConnectionType}`);  
    }  

    additionalEquipment.forEach(item => {  
        const li = document.createElement('li');  
        li.textContent = item;  
        li.addEventListener('click', handleAdditionalEquipmentClick);  
        additionalList.appendChild(li);  
    });  

    document.getElementById("additional-equipment").style.display = selectedEquipment.length > 0 ? 'block' : 'none';  
}  

// Обработчик клика для пунктов дополнительного оборудования  
function handleAdditionalEquipmentClick(event) {  
    const equipment = event.target.textContent;  
    if (selectedEquipment.includes(equipment)) {  
        selectedEquipment = selectedEquipment.filter(item => item !== equipment);  
    } else {  
        selectedEquipment.push(equipment);  
    }  
    updateEquipmentDisplay();  
}  

// Переход на страницу calculator.html  
function goToCalculator() {  
    const selectedEquipmentText = selectedEquipment.length > 0 ? selectedEquipment.join(', ') : "Нічого не вибрано";  
    const solarPanelType = document.getElementById('solar-panel-types')?.value || "Не вибрано";  
    const windTurbineType = document.getElementById('wind-turbine-types')?.value || "Не вибрано";  
    const connectionType = selectedConnectionType || "Не вибрано";  
    const area = availableArea > 0 ? availableArea : "Не вказано";  

    // Формируем URL с параметрами  
    const url = `calculator.html?equipment=${encodeURIComponent(selectedEquipmentText)}&solar=${encodeURIComponent(solarPanelType)}&wind=${encodeURIComponent(windTurbineType)}&connection=${encodeURIComponent(connectionType)}&area=${encodeURIComponent(area)}`;  

    console.log("Переход на URL:", url); // Для отладки  
    window.location.href = url;  
}

// Обработка клика на элементы списка оборудования  
document.querySelectorAll('#equipment-list li').forEach(li => {  
    li.addEventListener('click', function () {  
        selectEquipment(li.textContent);  
    });  
});