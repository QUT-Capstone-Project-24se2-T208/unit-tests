const { GetSystemRequirements, calculateTotals, saveConfiguration, loadSavedConfiguration } = require("../js/standard-calculator.js");

describe('getSystemRequirements', () => {
    test('small home setup', () => {
    const result = GetSystemRequirements(1.5, 4, 60, 1, 4);
    expect(result).toEqual({
        inverterText: '3kVA Inverter',
        solarText: '6 x 275W',
        batteryText: '2.5 - 5kWh'
    });
    });

    test('medium setup', () => {
    const result = GetSystemRequirements(4, 20, 75, 2, 5);
    expect(result).toEqual({
        inverterText: '5kVA Inverter',
        solarText: '10 x 390W',
        batteryText: '30 - 40kWh'
    });
    });

    test('high consumption household', () => {
    const result = GetSystemRequirements(8, 25, 90, 1.5, 6);
    expect(result).toEqual({
        inverterText: '8kVA Inverter',
        solarText: '10 x 390W',
        batteryText: '30 - 40kWh'
    });
    });

    test('very large house', () => {
    const result = GetSystemRequirements(15, 50, 80, 1, 5);
    expect(result).toEqual({
        inverterText: '2x10kVA Inverter',
        solarText: '35 x 390W',
        batteryText: '40 - 50kWh'
    });
    });

    test('industrial or large rural property', () => {
    const result = GetSystemRequirements(22, 75, 90, 2, 7);
    expect(result).toEqual({
        inverterText: '2x15kVA Inverter',
        solarText: '35 x 390W',
        batteryText: '50+ kWh'
    });
    });

    // 추가 테스트 케이스
    test('minimal consumption setup', () => {
        const result = GetSystemRequirements(0.5, 1, 50, 0.5, 4);
        expect(result).toEqual({
            inverterText: '3kVA Inverter',
            solarText: '6 x 275W',
            batteryText: '0 - 2.5kWh'
        });
    });

    test('very small solar requirement', () => {
        const result = GetSystemRequirements(2, 1, 60, 1, 8);
        expect(result).toEqual({
            inverterText: '3kVA Inverter',
            solarText: '6 x 275W',
            batteryText: '0 - 2.5kWh'
        });
    });

    test('medium solar with small battery', () => {
        const result = GetSystemRequirements(5, 8, 70, 0.8, 4);
        expect(result).toEqual({
            inverterText: '5kVA Inverter',
            solarText: '9 x 275W',
            batteryText: '5 - 7.5kWh'
        });
    });

    test('large inverter with medium solar', () => {
        const result = GetSystemRequirements(10, 6, 100, 1, 3);
        expect(result).toEqual({
            inverterText: '15kVA Inverter',
            solarText: '9 x 275W',
            batteryText: '5 - 7.5kWh'
        });
    });

    test('custom sized solution for very large system', () => {
        const result = GetSystemRequirements(25, 80, 95, 2, 5);
        expect(result).toEqual({
            inverterText: 'Custom Solution Required',
            solarText: '50 x 370W',
            batteryText: '50+ kWh'
        });
    });

    test('maximum size solar panels', () => {
        const result = GetSystemRequirements(12, 20, 85, 1, 1);
        expect(result).toEqual({
            inverterText: '15kVA Inverter',
            solarText: '50+ Panels',
            batteryText: '15 - 20kWh'
        });
    });
});

describe('calculateTotals', () => {
  test('correctly calculates totals for valid appliances', () => {
    const appliances = [
      { quantity: 2, wattage: 100, hours: 5 },
      { quantity: 1, wattage: 1500, hours: 2 },
      { quantity: 3, wattage: 25, hours: 12 }
    ];
    
    const result = calculateTotals(appliances);
    
    // (2 * 100 * 5)/1000 + (1 * 1500 * 2)/1000 + (3 * 25 * 12)/1000 = 1 + 3 + 0.9 = 4.9 kWh
    // Total wattage = 2*100 + 1*1500 + 3*25 = 1775 W = 1.775 kW
    expect(result.totalKWh).toBeCloseTo(4.9);
    expect(result.totalWatt).toBe(1775);
    expect(result.totalKW).toBeCloseTo(1.775);
  });
  
  test('handles invalid or missing data', () => {
    const appliances = [
      { quantity: 'abc', wattage: 100, hours: 5 },
      { quantity: 1, wattage: null, hours: 2 },
      { quantity: 3, wattage: 25, hours: 'invalid' }
    ];
    
    const result = calculateTotals(appliances);
    
    // All invalid items should be ignored
    expect(result.totalKWh).toBe(0);
    expect(result.totalWatt).toBe(0);
    expect(result.totalKW).toBe(0);
  });
  
  test('handles empty appliance array', () => {
    const result = calculateTotals([]);
    
    expect(result.totalKWh).toBe(0);
    expect(result.totalWatt).toBe(0);
    expect(result.totalKW).toBe(0);
  });
});

describe('saveConfiguration', () => {
  test('returns true for valid configuration', () => {
    const config = {
      appliances: [
        { title: 'TV', quantity: 1, wattage: 150, hours: 5 },
        { title: 'Fridge', quantity: 1, wattage: 200, hours: 24 }
      ],
      settings: {
        simultaneousUsage: 50,
        reserveDays: 1,
        sunHours: 4
      }
    };
    
    expect(saveConfiguration(config)).toBe(true);
  });
  
  test('returns false for invalid configuration - missing appliances', () => {
    const config = {
      settings: {
        simultaneousUsage: 50,
        reserveDays: 1,
        sunHours: 4
      }
    };
    
    expect(saveConfiguration(config)).toBe(false);
  });
  
  test('returns false for invalid configuration - missing settings', () => {
    const config = {
      appliances: [
        { title: 'TV', quantity: 1, wattage: 150, hours: 5 }
      ]
    };
    
    expect(saveConfiguration(config)).toBe(false);
  });
  
  test('returns false for non-object input', () => {
    expect(saveConfiguration('invalid')).toBe(false);
    expect(saveConfiguration(null)).toBe(false);
  });
});

describe('loadSavedConfiguration', () => {
  test('correctly loads valid configuration', () => {
    const config = {
      appliances: [
        { title: 'TV', quantity: 1, wattage: 150, hours: 5 },
        { title: 'Fridge', quantity: 1, wattage: 200, hours: 24 }
      ],
      settings: {
        simultaneousUsage: 50,
        reserveDays: 1,
        sunHours: 4
      }
    };
    
    const savedJson = JSON.stringify(config);
    const loadedConfig = loadSavedConfiguration(savedJson);
    
    expect(loadedConfig).toEqual(config);
  });
  
  test('returns null for invalid JSON', () => {
    expect(loadSavedConfiguration('{invalid json}')).toBeNull();
  });
  
  test('returns null for missing appliances', () => {
    const config = {
      settings: {
        simultaneousUsage: 50,
        reserveDays: 1,
        sunHours: 4
      }
    };
    
    expect(loadSavedConfiguration(JSON.stringify(config))).toBeNull();
  });
  
  test('returns null for missing settings', () => {
    const config = {
      appliances: [
        { title: 'TV', quantity: 1, wattage: 150, hours: 5 }
      ]
    };
    
    expect(loadSavedConfiguration(JSON.stringify(config))).toBeNull();
  });
  
  test('returns null for empty input', () => {
    expect(loadSavedConfiguration('')).toBeNull();
    expect(loadSavedConfiguration(null)).toBeNull();
  });
});
