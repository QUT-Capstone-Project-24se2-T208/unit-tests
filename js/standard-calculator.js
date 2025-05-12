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

/**
 * Calculate totals for wattage and kWh based on appliance data
 * @param {Array} appliances - Array of appliance items with quantity, wattage and hours
 * @returns {Object} totalWatt and totalKWh values
 */
function calculateTotals(appliances) {
  let totalWatt = 0;
  let totalKWh = 0;
  
  appliances.forEach(appliance => {
    const quantity = parseInt(appliance.quantity || 1);
    const wattage = parseInt(appliance.wattage || 0);
    const hours = parseFloat(appliance.hours || 0);
    
    if (!isNaN(quantity) && !isNaN(wattage) && !isNaN(hours)) {
      const kwh = (quantity * wattage * hours) / 1000;
      totalWatt += wattage * quantity;
      totalKWh += kwh;
    }
  });
  
  return {
    totalWatt,
    totalKWh,
    totalKW: totalWatt / 1000
  };
}

/**
 * Save calculator configuration
 * @param {Object} config - Configuration object with appliances and settings
 * @returns {boolean} Success status
 */
function saveConfiguration(config) {
  try {
    // In a testing environment, we just validate the data structure
    if (!config || typeof config !== 'object') {
      return false;
    }
    
    if (!Array.isArray(config.appliances)) {
      return false;
    }
    
    if (!config.settings || typeof config.settings !== 'object') {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Load calculator configuration
 * @param {string} savedConfig - JSON string of saved configuration
 * @returns {Object|null} Parsed configuration or null if invalid
 */
function loadSavedConfiguration(savedConfig) {
  try {
    if (!savedConfig) {
      return null;
    }
    
    const config = JSON.parse(savedConfig);
    
    // Validate configuration
    if (!config.appliances || !Array.isArray(config.appliances)) {
      return null;
    }
    
    if (!config.settings || typeof config.settings !== 'object') {
      return null;
    }
    
    return config;
  } catch (error) {
    return null;
  }
}

module.exports = 
{ 
    GetSystemRequirements, 
    checkEmptyAppliances, 
    addAppliance, 
    filterAppliancesByCategory,
    clearAllAppliances,
    calculateTotals,
    saveConfiguration,
    loadSavedConfiguration
};