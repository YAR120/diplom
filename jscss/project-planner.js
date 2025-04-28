document.addEventListener('DOMContentLoaded', async function () {
    // Переменные  
    let currentAreaFrame = null;
    let scale = 1;
    let isResizing = false;
    let selectedEquipment = [];
    let selectedConnectionType = '';
    let selectedSolarPanelType = '';
    let selectedWindTurbineType = '';

    // Находим нужные элементы  
    const modal = document.getElementById("modal");
    const openModalButton = document.getElementById("open-modal");
    const closeModalButton = document.getElementById("close-modal");
    const orderForm = document.getElementById("order-form");
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const equipmentList = document.getElementById("equipment-list");
    const connectionTypesList = document.getElementById("connection-types");
    const solarPanelSelection = document.getElementById("solar-panel-selection");
    const windTurbineSelection = document.getElementById("wind-turbine-selection");
    const solarPanelTypes = document.getElementById("solar-panel-types");
    const windTurbineTypes = document.getElementById("wind-turbine-types");

    let userData = {};

    // Функция загрузки данных пользователя
    async function loadUserData() {
        try {
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("authToken")}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Неавторизований доступ. Будь ласка, увійдіть в систему.');
                }
                throw new Error(`Помилка ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) {
                alert('Помилка: ' + data.error);
                window.location.href = "../Untitled-1.html";
                return;
            }

            userData = {
                username: data.username || 'Невідомий користувач',
                phone: data.phone || 'Номер телефону відсутній'
            };

            nameInput.value = userData.username;
            phoneInput.value = userData.phone;
        } catch (error) {
            console.error('Помилка завантаження даних користувача:', error);
            alert('Помилка при завантаженні даних користувача: ' + error.message);
            window.location.href = "../Untitled-1.html";
        }
    }

    await loadUserData();

    // Функция для выбора оборудования
    function selectEquipment(equipment) {
        if (selectedEquipment.includes(equipment)) {
            selectedEquipment = selectedEquipment.filter(item => item !== equipment);
        } else {
            selectedEquipment.push(equipment);
        }

        document.querySelectorAll('#equipment-list li').forEach(li => {
            if (selectedEquipment.includes(li.textContent)) {
                li.classList.add('selected');
            } else {
                li.classList.remove('selected');
            }
        });

        solarPanelSelection.style.display = selectedEquipment.includes('Сонячні панелі') ? 'block' : 'none';
        windTurbineSelection.style.display = selectedEquipment.includes('Вітрові турбіни') ? 'block' : 'none';

        updateResults();
    }

    // Функция для выбора типа подключения
    function selectConnectionType(connectionType) {
        selectedConnectionType = connectionType;

        document.querySelectorAll('#connection-types li').forEach(li => {
            li.classList.remove('selected');
            if (li.textContent === connectionType) {
                li.classList.add('selected');
            }
        });

        updateResults();
    }

    // Функция для обновления результатов в таблице
    function updateResults() {
        const equipmentResult = selectedEquipment.length > 0 ? selectedEquipment.join(', ') : 'Нічого не вибрано';
        const solarResult = selectedSolarPanelType || 'Не вибрано';
        const windResult = selectedWindTurbineType || 'Не вибрано';
        const connectionResult = selectedConnectionType || 'Не вибрано';

        // Примерные расчеты (можно заменить на реальные формулы)
        const energyProduction = selectedEquipment.length * 1000; // Пример: 1000 кВт/ч на оборудование
        const paybackYears = energyProduction > 0 ? (5000 / energyProduction).toFixed(1) : 'Немає даних';
        const balance = energyProduction - 500; // Пример: потребление 500 кВт/ч
        const tariffIncome = energyProduction * 0.1; // Пример: 0.1 грн за кВт/ч
        const requiredSpace = selectedEquipment.length * 10; // Пример: 10 м² на оборудование

        // Обновляем таблицу
        document.getElementById('equipment-result').textContent = equipmentResult;
        document.getElementById('solar-result').textContent = solarResult;
        document.getElementById('wind-result').textContent = windResult;
        document.getElementById('connection-result').textContent = connectionResult;
        document.getElementById('energy-result').textContent = `${energyProduction} кВт/ч`;
        document.getElementById('payback-result').textContent = `${paybackYears} років`;
        document.getElementById('balance-result').textContent = `${balance} кВт/ч`;
        document.getElementById('tariff-result').textContent = `${tariffIncome.toFixed(2)} грн`;
        document.getElementById('space-result').textContent = `${requiredSpace} м²`;

        // Сохраняем результаты в глобальный объект для отправки
        window.projectResults = {
            energyProduction: `${energyProduction} кВт/ч`,
            paybackYears: `${paybackYears} років`,
            balance: `${balance} кВт/ч`,
            tariffIncome: `${tariffIncome.toFixed(2)} грн`,
            requiredSpace: `${requiredSpace} м²`,
            equipment: equipmentResult,
            solarPanelType: solarResult,
            windTurbineType: windResult,
            connectionType: connectionResult
        };
    }

    // Слушатели для выбора оборудования
    equipmentList.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => selectEquipment(li.textContent));
    });

    // Слушатели для выбора типа подключения
    connectionTypesList.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => selectConnectionType(li.textContent));
    });

    // Слушатели для выбора типа панелей и турбин
    solarPanelTypes.addEventListener('change', () => {
        selectedSolarPanelType = solarPanelTypes.options[solarPanelTypes.selectedIndex].text;
        updateResults();
    });

    windTurbineTypes.addEventListener('change', () => {
        selectedWindTurbineType = windTurbineTypes.options[windTurbineTypes.selectedIndex].text;
        updateResults();
    });

    // Открытие модального окна
    openModalButton.addEventListener("click", async () => {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    });

    // Закрытие модального окна
    closeModalButton.addEventListener("click", () => {
        modal.classList.add("hidden");
        modal.style.display = "none";
    });

    // Обработка отправки формы
    orderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name || !phone) {
            alert('Будь ласка, заповніть усі поля: ім’я та телефон.');
            return;
        }

        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
            alert('Будь ласка, введіть коректний номер телефону.');
            return;
        }

        const projectData = {
            areaWidth: currentAreaFrame ? parseFloat(currentAreaFrame.style.width) / 20 : 0,
            areaHeight: currentAreaFrame ? parseFloat(currentAreaFrame.style.height) / 20 : 0,
            panels: [],
            equipment: selectedEquipment,
            connectionType: selectedConnectionType,
            solarPanelType: selectedSolarPanelType,
            windTurbineType: selectedWindTurbineType,
            results: window.projectResults // Добавляем результаты расчетов
        };

        const panels = currentAreaFrame ? currentAreaFrame.querySelectorAll('.panel') : [];
        panels.forEach(panel => {
            projectData.panels.push({
                width: parseFloat(panel.style.width) / 20,
                height: parseFloat(panel.style.height) / 20,
                left: parseFloat(panel.style.left),
                top: parseFloat(panel.style.top)
            });
        });

        let technologyDetails = selectedEquipment.join(', ');
        if (selectedEquipment.includes('Сонячні панелі') && selectedSolarPanelType) {
            technologyDetails += ` (${selectedSolarPanelType})`;
        }
        if (selectedEquipment.includes('Вітрові турбіни') && selectedWindTurbineType) {
            technologyDetails += ` (${selectedWindTurbineType})`;
        }
        if (selectedConnectionType) {
            technologyDetails += `, Тип підключення: ${selectedConnectionType}`;
        }

        const orderData = {
            username: name,
            phone: phone,
            project: projectData,
            technology: technologyDetails || 'Нічого не вибрано'
        };

        try {
            const response = await fetch('http://localhost:3000/api/projects/save-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("authToken")}`
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Помилка: ${response.status}`);
            }

            const data = await response.json();
            alert('Проект успішно збережено в профілі! Менеджер скоро зв’яжеться з вами.');
            modal.classList.add("hidden");
            modal.style.display = "none";
        } catch (error) {
            console.error('Помилка відправки проекту:', error);
            alert(`Помилка при відправці проекту: ${error.message}`);
        }
    });

    // Создание области
    document.getElementById('create-area').addEventListener('click', function () {
        const areaSize = parseFloat(document.getElementById('area-size').value);
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = '';

        const panelMaxSize = 500;
        const windMaxSize = 2000;

        let maxAreaSize;
        const panelType = document.getElementById('panel-type').value;
        if (panelType === 'solar') {
            maxAreaSize = panelMaxSize;
        } else if (panelType === 'wind') {
            maxAreaSize = windMaxSize;
        } else {
            alert("Неизвестный тип оборудования.");
            return;
        }

        const totalArea = Math.min(areaSize, maxAreaSize);
        const areaWidth = Math.max(Math.sqrt(totalArea) * 20, 50);
        const areaHeight = Math.max(Math.sqrt(totalArea) * 20, 50);

        currentAreaFrame = document.createElement('div');
        currentAreaFrame.style.width = areaWidth + 'px';
        currentAreaFrame.style.height = areaHeight + 'px';
        currentAreaFrame.style.position = 'absolute';
        currentAreaFrame.style.border = '2px solid blue';
        currentAreaFrame.style.top = '0';
        currentAreaFrame.style.left = '0';
        currentAreaFrame.style.zIndex = '10';
        currentAreaFrame.style.transform = `scale(${scale})`;

        const areaLabel = document.createElement('div');
        areaLabel.innerText = `Площадь участка: ${areaSize} м²`;
        areaLabel.style.position = 'absolute';
        areaLabel.style.top = '0';
        areaLabel.style.left = '0';
        areaLabel.style.background = 'white';
        areaLabel.style.padding = '5px';
        currentAreaFrame.appendChild(areaLabel);

        canvas.appendChild(currentAreaFrame);
        makeResizable(currentAreaFrame);
        document.getElementById('canvas-section').style.display = 'block';
    });

    // Добавление панели
    document.getElementById('add-panel').addEventListener('click', function () {
        const width = parseFloat(document.getElementById('panel-width').value);
        const length = parseFloat(document.getElementById('panel-length').value);

        if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) {
            alert("Введите корректные размеры для панели.");
            return;
        }

        const panelDiv = document.createElement('div');
        panelDiv.className = 'panel';
        panelDiv.style.width = width * 20 + 'px';
        panelDiv.style.height = length * 20 + 'px';
        panelDiv.style.position = 'absolute';
        panelDiv.style.backgroundColor = 'green';
        panelDiv.style.zIndex = '5';
        panelDiv.style.left = '0px';
        panelDiv.style.top = '0px';

        currentAreaFrame.appendChild(panelDiv);
        makeDraggable(panelDiv);
    });

    // Функция для изменения размера рамки
    function makeResizable(div) {
        let startX, startY, originalWidth, originalHeight;

        div.addEventListener('mousedown', function (e) {
            startX = e.clientX;
            startY = e.clientY;
            originalWidth = div.offsetWidth;
            originalHeight = div.offsetHeight;

            function doDrag(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                div.style.width = originalWidth + dx + 'px';
                div.style.height = originalHeight + dy + 'px';
                updateAreaSize(div.offsetWidth, div.offsetHeight);
            }

            function stopDrag() {
                isResizing = false;
                document.documentElement.removeEventListener('mousemove', doDrag);
                document.documentElement.removeEventListener('mouseup', stopDrag);
            }

            document.documentElement.addEventListener('mousemove', doDrag);
            document.documentElement.addEventListener('mouseup', stopDrag);
        });
    }

    // Функция для перемещения панели
    function makeDraggable(div) {
        let startX, startY, originalX, originalY;

        div.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            startX = e.clientX;
            startY = e.clientY;
            originalX = div.offsetLeft;
            originalY = div.offsetTop;

            function doDrag(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                div.style.left = originalX + dx + 'px';
                div.style.top = originalY + dy + 'px';
            }

            function stopDrag() {
                document.documentElement.removeEventListener('mousemove', doDrag);
                document.documentElement.removeEventListener('mouseup', stopDrag);
            }

            document.documentElement.addEventListener('mousemove', doDrag);
            document.documentElement.addEventListener('mouseup', stopDrag);
        });
    }

    // Сохранение проекта локально
    document.getElementById('save-project').addEventListener('click', function () {
        const projectData = {
            areaWidth: currentAreaFrame ? currentAreaFrame.style.width : 'Нет области',
            areaHeight: currentAreaFrame ? currentAreaFrame.style.height : 'Нет области',
            panels: [],
            equipment: selectedEquipment,
            connectionType: selectedConnectionType,
            solarPanelType: selectedSolarPanelType,
            windTurbineType: selectedWindTurbineType,
            results: window.projectResults // Добавляем результаты расчетов
        };

        const panels = currentAreaFrame ? currentAreaFrame.querySelectorAll('.panel') : [];
        panels.forEach(panel => {
            projectData.panels.push({
                width: panel.style.width,
                height: panel.style.height,
                left: panel.style.left,
                top: panel.style.top
            });
        });

        console.log('Данные проекта:', projectData);
        alert('Проект сохранен локально! Чтобы отправить его в профиль, используйте форму в модальном окне.');
    });

    // Масштабирование
    document.getElementById('zoom-in').addEventListener('click', function () {
        scale *= 1.2;
        updateScale();
    });

    document.getElementById('zoom-out').addEventListener('click', function () {
        scale /= 1.2;
        updateScale();
    });

    function updateScale() {
        if (currentAreaFrame) {
            currentAreaFrame.style.transform = `scale(${scale})`;
        }
    }

    function updateAreaSize(width, height) {
        const areaSize = (width / 20) * (height / 20);
        const areaLabel = currentAreaFrame.firstChild;
        if (areaLabel) {
            areaLabel.innerText = `Площадь участка: ${areaSize.toFixed(2)} м²`;
        }
    }

    // Инициализация результатов при загрузке
    updateResults();
});