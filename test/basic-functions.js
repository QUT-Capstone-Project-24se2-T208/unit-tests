// Contains functions for basic calculator only relevant for testing

// Renamed calculateSystemRequirements to GetSystemRequirements for better unit testing as it needed to be slightly modified to simulate the original function
function GetSystemRequirements(totalKW, totalKWh, simUsage, batteryDays, dailySunHours) {
    const inverterKW = totalKW * (simUsage / 100);
    const solarKW = totalKWh / dailySunHours;
    const batteryKWh = totalKWh * batteryDays;

    let inverterText = "0kVA Inverter";
    if (inverterKW < 3) inverterText = "3kVA Inverter";
    else if (inverterKW < 5) inverterText = "5kVA Inverter";
    else if (inverterKW < 8) inverterText = "8kVA Inverter";
    else if (inverterKW < 12) inverterText = "15kVA Inverter";
    else if (inverterKW < 16) inverterText = "2x10kVA Inverter";
    else if (inverterKW < 23) inverterText = "2x15kVA Inverter";
    else if (inverterKW >= 23) inverterText = "Custom Solution Required";

    let solarText = "0W";
    if (solarKW > 0 && solarKW < 2) solarText = "6 x 275W";
    else if (solarKW < 3) solarText = "9 x 275W";
    else if (solarKW < 5) solarText = "10 x 390W";
    else if (solarKW < 6) solarText = "15 x 370W";
    else if (solarKW < 8) solarText = "18 x 390W";
    else if (solarKW < 10) solarText = "25 x 390W";
    else if (solarKW < 14) solarText = "35 x 390W";
    else if (solarKW < 19) solarText = "50 x 370W";
    else if (solarKW >= 19) solarText = "50+ Panels";

    let batteryText = "0kWh";
    if (batteryKWh > 50) batteryText = "50+ kWh";
    else if (batteryKWh > 40) batteryText = "40 - 50kWh";
    else if (batteryKWh > 30) batteryText = "30 - 40kWh";
    else if (batteryKWh > 25) batteryText = "25 - 30kWh";
    else if (batteryKWh > 20) batteryText = "20 - 25kWh";
    else if (batteryKWh > 15) batteryText = "15 - 20kWh";
    else if (batteryKWh > 10) batteryText = "10 - 15kWh";
    else if (batteryKWh > 7.5) batteryText = "7.5 - 10kWh";
    else if (batteryKWh > 5) batteryText = "5 - 7.5kWh";
    else if (batteryKWh > 2.5) batteryText = "2.5 - 5kWh";
    else if (batteryKWh > 0) batteryText = "0 - 2.5kWh";

    return {
    inverterText,
    solarText,
    batteryText,
    };
}

function checkEmptyAppliances() {
    const applianceTable = document.querySelector('.appliance-table');
    const applianceRows = document.querySelectorAll('#appliance-list tr');
    const emptyMessageExists = document.querySelector('.empty-appliance-message');

    if (applianceRows.length === 0 && !emptyMessageExists) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-appliance-message';
        emptyMessage.innerHTML = `<i class="fas fa-plug"></i><p>No appliances selected yet.</p>`;
        applianceTable.parentNode.insertBefore(emptyMessage, applianceTable.nextSibling);
    } else if (applianceRows.length > 0 && emptyMessageExists) {
        emptyMessageExists.remove();
    }
}

function addAppliance(applianceItem, applianceList, calculateTotals, documentRef = document) {
    const watt = applianceItem.dataset.wattage;
    const title = applianceItem.dataset.title;
    const hour = applianceItem.dataset.hour;
    const kwh = (watt * hour) / 1000;

    const existingAppliances = documentRef.querySelectorAll('.appliance-title');
    for (let i = 0; i < existingAppliances.length; i++) {
        if (existingAppliances[i].textContent === title) {
            const quantityInput = existingAppliances[i].closest('tr').querySelector('.quantity');
            quantityInput.value = parseInt(quantityInput.value) + 1;
            calculateTotals();
            return;
        }
    }

    const row = documentRef.createElement('tr');
    row.innerHTML = `
        <td class="appliance-title">${title}</td>
        <td><input type="number" class="quantity" value="1"></td>
        <td><input type="number" class="wattage" value="${watt}"></td>
        <td><input type="number" class="hours-per-day" value="${hour}"></td>
        <td><span class="daily-kwh">${kwh.toFixed(2)}</span> kWh</td>
        <td><button class="remove-btn"><i class="fa fa-trash"></i></button></td>
    `;
    applianceList.appendChild(row);
    applianceItem.classList.add('active');
    const emptyMsg = documentRef.querySelector('.empty-appliance-message');
    if (emptyMsg) emptyMsg.remove();
    calculateTotals();
}

function filterAppliancesByCategory(category, items, documentRef = document) {
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function clearAllAppliances(applianceList, applianceItems, checkEmptyAppliances, calculateTotals, confirmFn = confirm) {
    if (applianceList.children.length > 0 && confirmFn('Are you sure you want to clear all appliances?')) {
        applianceList.innerHTML = '';
        applianceItems.forEach(item => item.classList.remove('active'));
        checkEmptyAppliances();
        calculateTotals();
    }
}

module.exports = 
{ 
    GetSystemRequirements, 
    checkEmptyAppliances, 
    addAppliance, 
    filterAppliancesByCategory,
    clearAllAppliances
};