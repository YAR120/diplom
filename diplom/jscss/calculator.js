document.addEventListener("DOMContentLoaded", function() {  
    // Функция для валидации вводимых значений  
    function validateInputs(...inputs) {  
        for (const input of inputs) {  
            if (isNaN(input) || input < 0) {  
                return false;  
            }  
        }  
        return true;  
    }  

    // Калькулятор ROI  
    document.getElementById("roiCalculate").onclick = function() {  
        const installationCost = parseFloat(document.getElementById("installationCost").value);  
        const annualSavings = parseFloat(document.getElementById("annualSavings").value);  
        const systemLife = parseFloat(document.getElementById("systemLife").value);  
        const maintenanceCost = parseFloat(document.getElementById("maintenanceCost").value);  

        if (!validateInputs(installationCost, annualSavings, systemLife, maintenanceCost)) {  
            alert("Пожалуйста, введите все значения корректно!");  
            return;  
        }  

        const totalSavings = (annualSavings - maintenanceCost) * systemLife;  
        const roi = ((totalSavings - installationCost) / installationCost) * 100;  

        document.getElementById("roiResult").innerHTML = `<h2>Ваш ROI: ${roi.toFixed(2)}%</h2>`;  
    };  

    // Калькулятор энергетических затрат  
    document.getElementById("energyCostCalculate").onclick = function() {  
        const monthlyBill = parseFloat(document.getElementById("monthlyBill").value);  
        const averageConsumption = parseFloat(document.getElementById("averageConsumption").value);  
        const costPerKWh = parseFloat(document.getElementById("costPerKWh").value);  

        if (!validateInputs(monthlyBill, averageConsumption, costPerKWh)) {  
            alert("Пожалуйста, введите все значения корректно!");  
            return;  
        }  

        const annualCost = monthlyBill * 12;  
        const alternativeCost = averageConsumption * costPerKWh * 12;  
        const comparison = annualCost - alternativeCost;  

        document.getElementById("energyCostResult").innerHTML = `<h2>Ваші річні витрати: ${annualCost.toFixed(2)} грн, Альтернативні витрати: ${alternativeCost.toFixed(2)} грн, Різниця: ${comparison.toFixed(2)} грн</h2>`;  
    };  

    // Калькулятор размера системы  
    document.getElementById("systemSizeCalculate").onclick = function() {  
        const dailyConsumption = parseFloat(document.getElementById("dailyConsumption").value);  
        const panelOutput = parseFloat(document.getElementById("panelOutput").value);  

        if (!validateInputs(dailyConsumption, panelOutput)) {  
            alert("Пожалуйста, введите все значения корректно!");  
            return;  
        }  

        const requiredPanels = Math.ceil(dailyConsumption / panelOutput);  
        document.getElementById("systemSizeResult").innerHTML = `<h2>Необхідна кількість панелей: ${requiredPanels}</h2>`;  
    };  

    // Калькулятор квадратного числа  
    document.getElementById("calculateButton").onclick = function() {  
        const inputField = document.getElementById('inputField');  
        const resultDiv = document.getElementById('result');  
        const value = inputField.value;  

        // Проверка на ввод только чисел  
        if (!/^\d*\.?\d*$/.test(value)) {  
            alert("Пожалуйста, введите только числа!");  
            return;  
        }  

        const number = parseFloat(value);  
        const calculatedValue = number * number;  
        resultDiv.textContent = "Результат: " + calculatedValue;  
    };  
});