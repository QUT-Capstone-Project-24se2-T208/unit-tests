/**
 * @jest-environment jsdom
 */

const { calculateAssistiveResults, applyAssistiveTemplate, getSelectedAppliances, calculateTotalEnergy } = require('../js/assistive-calculator.js');

// Test for calculateAssistiveResults function
describe('calculateAssistiveResults', () => {
  test('calculates correct system size for medium sunlight and one day backup', () => {
    const results = calculateAssistiveResults(10, 'medium', 'one');
    expect(results.systemSize).toBe(2.5); // 10kWh / 4 sun hours
    expect(results.batterySize).toBe(10); // 10kWh * 1 day
    expect(results.numberOfPanels).toBe(7); // (2.5 * 1000) / 400 = 6.25, rounded up to 7
    expect(results.panelWattage).toBe(400);
  });

  test('calculates correct system size for low sunlight', () => {
    const results = calculateAssistiveResults(9, 'low', 'one');
    expect(results.systemSize).toBe(3); // 9kWh / 3 sun hours
    expect(results.batterySize).toBe(9); // 9kWh * 1 day
    expect(results.numberOfPanels).toBe(8); // (3 * 1000) / 400 = 7.5, rounded up to 8
  });

  test('calculates correct system size for high sunlight', () => {
    const results = calculateAssistiveResults(15, 'high', 'one');
    expect(results.systemSize).toBe(3); // 15kWh / 5 sun hours
    expect(results.batterySize).toBe(15); // 15kWh * 1 day
    expect(results.numberOfPanels).toBe(8); // (3 * 1000) / 400 = 7.5, rounded up to 8
  });

  test('calculates correct battery size for half day backup', () => {
    const results = calculateAssistiveResults(12, 'medium', 'half');
    expect(results.systemSize).toBe(3); // 12kWh / 4 sun hours
    expect(results.batterySize).toBe(6); // 12kWh * 0.5 day
    expect(results.numberOfPanels).toBe(8); // (3 * 1000) / 400 = 7.5, rounded up to 8
  });

  test('calculates correct battery size for two days backup', () => {
    const results = calculateAssistiveResults(8, 'medium', 'two');
    expect(results.systemSize).toBe(2); // 8kWh / 4 sun hours
    expect(results.batterySize).toBe(16); // 8kWh * 2 days
    expect(results.numberOfPanels).toBe(5); // (2 * 1000) / 400 = 5
  });

  test('enforces minimum system size of 1kW', () => {
    const results = calculateAssistiveResults(2, 'high', 'one');
    expect(results.systemSize).toBe(1); // 2kWh / 5 sun hours = 0.4, but minimum is 1
    expect(results.batterySize).toBe(2); // 2kWh * 1 day
    expect(results.numberOfPanels).toBe(3); // (1 * 1000) / 400 = 2.5, rounded up to 3
  });

  test('enforces minimum battery size of 1kWh', () => {
    const results = calculateAssistiveResults(1, 'medium', 'half');
    expect(results.systemSize).toBe(1); // 1kWh / 4 sun hours = 0.25, but minimum is 1
    expect(results.batterySize).toBe(1); // 1kWh * 0.5 day = 0.5, but minimum is 1
    expect(results.numberOfPanels).toBe(3); // (1 * 1000) / 400 = 2.5, rounded up to 3
  });
});

// Test for applyAssistiveTemplate function
describe('applyAssistiveTemplate', () => {
  test('returns base template for 1 bedroom home', () => {
    const template = applyAssistiveTemplate(1);
    expect(template.length).toBe(7); // 7 basic appliances
    expect(template.some(item => item.title === 'LED Lights (10x)')).toBe(true);
    expect(template.some(item => item.title === 'Fridge/Freezer - Large')).toBe(true);
    expect(template.some(item => item.title === 'Washing Machine')).toBe(false);
  });

  test('adds washing machine and fan for 2 bedroom home', () => {
    const template = applyAssistiveTemplate(2);
    expect(template.length).toBe(9); // 7 basic + 2 additional appliances
    expect(template.some(item => item.title === 'Washing Machine')).toBe(true);
    expect(template.some(item => item.title === 'Fan - Ceiling')).toBe(true);
    expect(template.some(item => item.title === 'Air Conditioner - Small')).toBe(false);
  });

  test('adds air conditioner and dishwasher for 3 bedroom home', () => {
    const template = applyAssistiveTemplate(3);
    expect(template.length).toBe(11); // 9 + 2 additional appliances
    expect(template.some(item => item.title === 'Washing Machine')).toBe(true);
    expect(template.some(item => item.title === 'Air Conditioner - Small')).toBe(true);
    expect(template.some(item => item.title === 'Dishwasher')).toBe(true);
    expect(template.some(item => item.title === 'Dryer')).toBe(false);
  });

  test('adds large AC, gaming and dryer for 4+ bedroom home', () => {
    const template = applyAssistiveTemplate(4);
    expect(template.length).toBe(14); // 11 + 3 additional appliances
    expect(template.some(item => item.title === 'Air Conditioner - Large')).toBe(true);
    expect(template.some(item => item.title === 'Gaming Console')).toBe(true);
    expect(template.some(item => item.title === 'Dryer')).toBe(true);
  });

  test('calculates correct wattage for each appliance', () => {
    const template = applyAssistiveTemplate(1);
    const fridge = template.find(item => item.title === 'Fridge/Freezer - Large');
    expect(fridge.wattage).toBe(150);
    expect(fridge.hours).toBe(24);
    expect(fridge.quantity).toBe(1);
  });
});

// Test for DOM related functions
describe('DOM functions', () => {
  // Setup DOM for testing
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="appliance-list">
        <div class="appliance-card selected" data-title="TV" data-wattage="100" data-hours="4" data-quantity="1"></div>
        <div class="appliance-card selected" data-title="Fridge" data-wattage="150" data-hours="24" data-quantity="1"></div>
        <div class="appliance-card" data-title="Lamp" data-wattage="40" data-hours="5" data-quantity="2"></div>
      </div>
    `;
  });

  test('getSelectedAppliances returns array of selected appliances', () => {
    const appliances = getSelectedAppliances();
    expect(appliances.length).toBe(2);
    expect(appliances[0].title).toBe('TV');
    expect(appliances[0].wattage).toBe(100);
    expect(appliances[0].hours).toBe(4);
    expect(appliances[0].quantity).toBe(1);
    
    expect(appliances[1].title).toBe('Fridge');
    expect(appliances[1].wattage).toBe(150);
    expect(appliances[1].hours).toBe(24);
    expect(appliances[1].quantity).toBe(1);
  });

  test('getSelectedAppliances returns empty array if no appliances selected', () => {
    document.body.innerHTML = '<div class="appliance-list"></div>';
    const appliances = getSelectedAppliances();
    expect(appliances.length).toBe(0);
  });

  test('calculateTotalEnergy calculates total energy consumption correctly', () => {
    const totalEnergy = calculateTotalEnergy();
    // TV: 100W * 4h * 1 = 400Wh = 0.4kWh
    // Fridge: 150W * 24h * 1 = 3600Wh = 3.6kWh
    // Total: 4kWh
    expect(totalEnergy).toBe(4);
  });

  test('calculateTotalEnergy returns 0 if no appliances selected', () => {
    document.body.innerHTML = '<div class="appliance-list"></div>';
    const totalEnergy = calculateTotalEnergy();
    expect(totalEnergy).toBe(0);
  });

  test('calculateTotalEnergy handles missing or invalid data', () => {
    document.body.innerHTML = `
      <div class="appliance-list">
        <div class="appliance-card selected" data-title="TV"></div>
        <div class="appliance-card selected" data-title="Fridge" data-wattage="invalid" data-hours="24"></div>
        <div class="appliance-card selected" data-title="Lamp" data-wattage="40" data-hours="invalid"></div>
      </div>
    `;
    const totalEnergy = calculateTotalEnergy();
    expect(totalEnergy).toBe(0); // All should be 0 due to invalid or missing data
  });
});
