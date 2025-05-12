// Contains functions for assistive calculator only relevant for testing

/**
 * Calculate total energy from all selected appliances
 * @returns {number} Total energy in kWh
 */
function calculateTotalEnergy() {
  let totalEnergy = 0;
  
  // Get all selected appliances
  const selectedAppliances = document.querySelectorAll('.appliance-card.selected');
  
  // Calculate total energy
  selectedAppliances.forEach(appliance => {
    const wattage = parseInt(appliance.dataset.wattage || 0);
    const hours = parseFloat(appliance.dataset.hours || 0);
    const quantity = parseInt(appliance.dataset.quantity || 1);
    
    // Only add if both wattage and hours are valid numbers
    if (!isNaN(wattage) && !isNaN(hours)) {
      totalEnergy += (wattage * hours * quantity) / 1000; // Convert to kWh
    }
  });
  
  return totalEnergy;
}

/**
 * Get all selected appliances as an array of objects
 * @returns {Array} Array of appliance objects
 */
function getSelectedAppliances() {
  const appliances = [];
  const selectedCards = document.querySelectorAll('.appliance-card.selected');
  
  selectedCards.forEach(card => {
    appliances.push({
      title: card.dataset.title,
      wattage: parseInt(card.dataset.wattage || 0),
      hours: parseFloat(card.dataset.hours || 0),
      quantity: parseInt(card.dataset.quantity || 1)
    });
  });
  
  return appliances;
}

/**
 * Calculate system requirements based on energy usage and preferences
 * @param {number} dailyEnergyKWh - Daily energy consumption in kWh
 * @param {string} sunlightLevel - 'low', 'medium', or 'high'
 * @param {string} backupDuration - 'half', 'one', or 'two'
 * @returns {Object} System requirements
 */
function calculateAssistiveResults(dailyEnergyKWh, sunlightLevel, backupDuration) {
  // Convert sunlight level to hours
  let sunHours = 4; // Default medium
  if (sunlightLevel === 'low') sunHours = 3;
  if (sunlightLevel === 'high') sunHours = 5;
  
  // Convert backup duration to days
  let backupDays = 1; // Default one day
  if (backupDuration === 'half') backupDays = 0.5;
  if (backupDuration === 'two') backupDays = 2;
  
  // Calculate system size in kW
  let systemSize = dailyEnergyKWh / sunHours;
  systemSize = Math.max(1, Math.round(systemSize * 10) / 10); // Min 1kW, round to 1 decimal
  
  // Calculate battery size in kWh
  let batterySize = dailyEnergyKWh * backupDays;
  batterySize = Math.max(1, Math.round(batterySize * 10) / 10); // Min 1kWh, round to 1 decimal
  
  // Calculate number of panels (assume 400W panels)
  const panelWattage = 400;
  const numberOfPanels = Math.ceil((systemSize * 1000) / panelWattage);
  
  return {
    systemSize: systemSize,
    batterySize: batterySize,
    numberOfPanels: numberOfPanels,
    panelWattage: panelWattage
  };
}

/**
 * Apply a template based on number of bedrooms
 * @param {number} bedrooms - Number of bedrooms
 * @returns {Array} Array of appliance objects
 */
function applyAssistiveTemplate(bedrooms) {
  // Base templates with common appliances
  const baseTemplate = [
    { title: 'LED Lights (10x)', wattage: 50, hours: 5, quantity: 1 },
    { title: 'Fridge/Freezer - Large', wattage: 150, hours: 24, quantity: 1 },
    { title: 'TV (LED)', wattage: 80, hours: 6, quantity: 1 },
    { title: 'Laptop / Computers', wattage: 50, hours: 8, quantity: 1 },
    { title: 'Modem/Internet', wattage: 10, hours: 24, quantity: 1 },
    { title: 'Microwave', wattage: 1000, hours: 0.5, quantity: 1 },
    { title: 'Kettle', wattage: 2000, hours: 0.2, quantity: 1 }
  ];
  
  // Additional appliances based on home size
  if (bedrooms >= 2) {
    baseTemplate.push(
      { title: 'Washing Machine', wattage: 500, hours: 1, quantity: 1 },
      { title: 'Fan - Ceiling', wattage: 75, hours: 8, quantity: 1 }
    );
  }
  
  if (bedrooms >= 3) {
    baseTemplate.push(
      { title: 'Air Conditioner - Small', wattage: 900, hours: 4, quantity: 1 },
      { title: 'Dishwasher', wattage: 1200, hours: 1, quantity: 1 }
    );
  }
  
  if (bedrooms >= 4) {
    baseTemplate.push(
      { title: 'Air Conditioner - Large', wattage: 1500, hours: 6, quantity: 1 },
      { title: 'Gaming Console', wattage: 150, hours: 3, quantity: 1 },
      { title: 'Dryer', wattage: 3000, hours: 1, quantity: 1 }
    );
  }
  
  return baseTemplate;
}

module.exports = {
  calculateTotalEnergy,
  getSelectedAppliances,
  calculateAssistiveResults,
  applyAssistiveTemplate
};
