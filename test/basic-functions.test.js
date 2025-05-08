const { GetSystemRequirements } = require("./basic-functions.js");

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
        inverterText: '15kVA Inverter',
        solarText: '25 x 390W',
        batteryText: '50+ kWh'
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
});
