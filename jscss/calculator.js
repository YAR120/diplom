// Переключение полей для солнечных и ветряных установок  
function toggleEquipmentFields() {  
    const equipmentType = document.getElementById('equipment-type').value;  
    const solarFields = document.getElementById('solar-fields');  
    const windFields = document.getElementById('wind-fields');  

    if (equipmentType === 'solar') {  
        solarFields.style.display = 'block';  
        windFields.style.display = 'none';  
    } else if (equipmentType === 'wind') {  
        solarFields.style.display = 'none';  
        windFields.style.display = 'block';  
    } else {  
        solarFields.style.display = 'none';  
        windFields.style.display = 'none';  
    }  
}  

// Сохранение данных в localStorage  
function saveToLocalStorage(key, data) {  
    localStorage.setItem(key, JSON.stringify(data));  
}  

// Валидация положительных чисел  
function validatePositiveNumber(value, fieldName) {  
    const num = parseFloat(value);  
    if (isNaN(num) || num < 0) {  
        alert(`Будь ласка, введіть коректне значення для "${fieldName}".`);  
        return false;  
    }  
    return num;  
}  

// Калькулятор выработки энергии  
document.getElementById('calculate-energy').addEventListener('click', function () {  
    const panelPower = validatePositiveNumber(document.getElementById('panel-power').value, 'Потужність панелі');  
    const numberOfPanels = validatePositiveNumber(document.getElementById('number-of-panels').value, 'Кількість панелей');  
    const sunHours = validatePositiveNumber(document.getElementById('sun-hours').value, 'Сонячні години');  

    if (panelPower !== false && numberOfPanels !== false && sunHours !== false) {  
        const dailyEnergy = (panelPower * numberOfPanels * sunHours) / 1000; // кВт·ч  
        const monthlyEnergy = dailyEnergy * 30; // кВт·ч  
        const yearlyEnergy = dailyEnergy * 365; // кВт·ч  

        document.getElementById('energy-output').innerHTML = `  
            <p>Щоденна вироблення: ${dailyEnergy.toFixed(2)} кВт·г</p>  
            <p>Щомісячна вироблення: ${monthlyEnergy.toFixed(2)} кВт·г</p>  
            <p>Річна вироблення: ${yearlyEnergy.toFixed(2)} кВт·г</p>  
        `;  

        // Сохраняем данные в localStorage  
        const energyData = {  
            daily: dailyEnergy.toFixed(2),  
            monthly: monthlyEnergy.toFixed(2),  
            yearly: yearlyEnergy.toFixed(2)  
        };  
        saveToLocalStorage('energyProduction', energyData);  
    }  
});  

// Калькулятор окупаемости  
document.getElementById('calculate-payback').addEventListener('click', function () {  
    const initialInvestment = validatePositiveNumber(document.getElementById('initial-investment').value, 'Початкові інвестиції');  
    const monthlySavings = validatePositiveNumber(document.getElementById('monthly-savings').value, 'Щомісячна економія');  
    const systemLifetime = validatePositiveNumber(document.getElementById('system-lifetime').value, 'Термін служби') * 12; // в месяцах  

    if (initialInvestment !== false && monthlySavings !== false && systemLifetime !== false) {  
        const paybackTime = initialInvestment / monthlySavings;  
        document.getElementById('payback-output').innerHTML = `  
            <p>Час окупності: ${paybackTime.toFixed(2)} місяців (${(paybackTime / 12).toFixed(2)} років)</p>  
        `;  

        let tableHTML = '<tr><th>Рік</th><th>Економія (грн)</th><th>Залишок (грн)</th></tr>';  
        for (let year = 1; year <= systemLifetime / 12; year++) {  
            const savings = monthlySavings * 12 * year;  
            const remaining = initialInvestment - savings;  
            tableHTML += `<tr><td>${year}</td><td>${savings.toFixed(2)}</td><td>${remaining > 0 ? remaining.toFixed(2) : 0}</td></tr>`;  
        }  
        document.getElementById('payback-table').innerHTML = tableHTML;  

        // Сохраняем данные в localStorage  
        const paybackData = {  
            investment: initialInvestment.toFixed(2),  
            savings: monthlySavings.toFixed(2),  
            paybackMonths: paybackTime.toFixed(2)  
        };  
        saveToLocalStorage('paybackData', paybackData);  
    }  
});  

// Калькулятор баланса энергии  
document.getElementById('calculate-balance').addEventListener('click', function () {  
    const totalEnergy = validatePositiveNumber(document.getElementById('total-energy').value, 'Загальна вироблення енергії');  
    const userConsumption = validatePositiveNumber(document.getElementById('user-consumption').value, 'Споживання енергії');  
    const resultOperation = document.getElementById("excess-energy")
    if (totalEnergy !== false && userConsumption !== false) {  
        const energyBalance = (totalEnergy - userConsumption) * 0.9;  

        let balanceText;  
        if (energyBalance >= 0) {  
            balanceText = `Надлишкова енергія: ${energyBalance.toFixed(2)} кВт·г`;  
        } else {  
            balanceText = `Недостаток енергії: ${Math.abs(energyBalance).toFixed(2)} кВт·г`;  
        }  

        document.getElementById('balance-output').innerHTML = `<p>${balanceText}</p>`;  
        document.getElementById('excess-energy').value   = `${energyBalance.toFixed(2)}`

        // Сохраняем данные в localStorage  
        const balanceData = {  
            balance: energyBalance.toFixed(2),  
            text: balanceText  
        };  
        saveToLocalStorage('energyBalance', balanceData);  
    }  
});  

// Калькулятор зеленого тарифа  
document.getElementById('calculate-tariff').addEventListener('click', function () {  
    const excessEnergy = validatePositiveNumber(document.getElementById('excess-energy').value, 'Зайва енергія');  
    const tariffRate = validatePositiveNumber(document.getElementById('tariff-rate').value, 'Тариф');  

    if (excessEnergy !== false && tariffRate !== false) {  
        const hourIncome = excessEnergy * tariffRate;
         const dayIncome = (excessEnergy * tariffRate * 24 );
        const weekIncome = (excessEnergy * tariffRate * 24 ) * 7;
        const monthlyIncome = (excessEnergy  * tariffRate * 24) * 30;  
        const yearlyIncome = (monthlyIncome * 9) + monthlyIncome * (3 * 0.4) ;  

        document.getElementById('tariff-output').innerHTML = `  
        <p>Дохід за час: ${hourIncome.toFixed(2)} грн</p>  
         <p>Дохід за день: ${dayIncome.toFixed(2)} грн</p>  
        <p>Дохід за тиждень: ${weekIncome.toFixed(2)} грн</p>  
            <p>Дохід за місяць: ${monthlyIncome.toFixed(2)} грн</p>  
            <p>Дохід за рік: ${yearlyIncome.toFixed(2)} грн</p>  
        `;  

        // Сохраняем данные в localStorage  
        const tariffData = {  
            monthly: monthlyIncome.toFixed(2),  
            yearly: yearlyIncome.toFixed(2)  
        };  
        saveToLocalStorage('tariffData', tariffData);  
    }  
});  

// Калькулятор необходимого места  
document.getElementById('calculate-space').addEventListener('click', function () {  
    const equipmentType = document.getElementById('equipment-type').value;  
    let totalSpace = 0;  

    if (equipmentType === 'solar') {  
        const solarPanelArea = validatePositiveNumber(document.getElementById('solar-panel-area').value, 'Площа сонячної панелі');  
        const solarPanelCount = validatePositiveNumber(document.getElementById('solar-panel-count').value, 'Кількість сонячних панелей');  
        const panelAngle = validatePositiveNumber(document.getElementById('panel-angle').value, 'Кут установки панелей');  
        const additionalArea = validatePositiveNumber(document.getElementById('solar-additional-area').value || '0', 'Додаткова площа');  

        if (solarPanelArea !== false && solarPanelCount !== false && panelAngle !== false && additionalArea !== false) {  
            const angleInRadians = panelAngle * (Math.PI / 180);  
            totalSpace = (solarPanelArea * solarPanelCount) / Math.cos(angleInRadians) + additionalArea;  
        } else {  
            return;  
        }  
    } else if (equipmentType === 'wind') {  
        const windTurbineArea = validatePositiveNumber(document.getElementById('wind-turbine-area').value, 'Площа вітрової турбіни');  
        const windTurbineCount = validatePositiveNumber(document.getElementById('wind-turbine-count').value, 'Кількість вітрових турбін');  
        const additionalArea = validatePositiveNumber(document.getElementById('wind-additional-area').value || '0', 'Додаткова площа');  

        if (windTurbineArea !== false && windTurbineCount !== false && additionalArea !== false) {  
            totalSpace = windTurbineArea * windTurbineCount + additionalArea;  
        } else {  
            return;  
        }  
    } else {  
        alert('Будь ласка, виберіть тип обладнання.');  
        return;  
    }  

    document.getElementById('space-output').innerHTML = `  
        <p>Необхідна площа для обладнання: ${totalSpace.toFixed(2)} м²</p>  
    `;  

    const spaceData = {  
        totalSpace: totalSpace.toFixed(2)  
    };  
    saveToLocalStorage('spaceData', spaceData);  
});  

// Переход на страницу планировщика  
function goToPlanner() {  
    // Извлекаем данные из localStorage  
    const energyData = JSON.parse(localStorage.getItem('energyProduction')) || {};  
    const paybackData = JSON.parse(localStorage.getItem('paybackData')) || {};  
    const balanceData = JSON.parse(localStorage.getItem('energyBalance')) || {};  
    const tariffData = JSON.parse(localStorage.getItem('tariffData')) || {};  
    const spaceData = JSON.parse(localStorage.getItem('spaceData')) || {};  

    // Извлекаем параметры из URL (переданные с Podbortexn.html)  
    const params = new URLSearchParams(window.location.search);  

    const equipment = params.get('equipment') || "Нічого не вибрано";  
    const solar = params.get('solar') || "Не вибрано";  
    const wind = params.get('wind') || "Не вибрано";  
    const connection = params.get('connection') || "Не вибрано";  
    const area = params.get('area') || "Не вказано";  

    // Формируем URL с учетом данных из localStorage и URL  
    const url = `project-planner.html?equipment=${encodeURIComponent(equipment)}&solar=${encodeURIComponent(solar)}&wind=${encodeURIComponent(wind)}&connection=${encodeURIComponent(connection)}&area=${encodeURIComponent(area)}&energy=${encodeURIComponent(energyData.yearly || "Не розраховано")}&payback=${encodeURIComponent(paybackData.paybackMonths || "Не розраховано")}&balance=${encodeURIComponent(balanceData.text || "Не розраховано")}&tariff=${encodeURIComponent(tariffData.yearly || "Не розраховано")}&space=${encodeURIComponent(spaceData.totalSpace || "Не розраховано")}`;  

    console.log("Переход на URL:", url); // Для отладки  
    window.location.href = url;  
}