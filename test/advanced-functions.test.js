const {
    detectCountry, 
    calculateTotalFromHourlyData, 
    getAzimuthDirection,
    getRecommendedSystemSize,
    extractMonthlyHourlyProfile,
    getDaysInMonth
} = require('./advanced-functions.js');

// Test for detectCountry function
describe('detectCountry()', () => {
    test('returns AU for Australia coordinates', () => {
        expect(detectCountry(-25, 153)).toBe('AU');
    });

    test('returns US for unknown coordinates', () => {
        expect(detectCountry(0, 0)).toBe('US');
    });

    test('returns CN for China coordinates', () => {
        expect(detectCountry(35, 105)).toBe('CN');
    });
});

// Test for calculateTotalFromHourlyData function
describe('calculateTotalFromHourlyData()', () => {
    test('sums valid values', () => {
        expect(calculateTotalFromHourlyData([1, 2, 3])).toBe(6);
    });

    test('ignores null and NaN', () => {
    expect(calculateTotalFromHourlyData([1, null, NaN, 2])).toBe(3);
    });

    test('returns 0 if not an array', () => {
    expect(calculateTotalFromHourlyData(null)).toBe(0);
    });
});

// Test for getAzimuthDirection function
describe('getAzimuthDirection()', () => {
    test('returns North for 0°', () => {
    expect(getAzimuthDirection(0)).toBe('North (0°)');
    });

    test('returns East for 90°', () => {
    expect(getAzimuthDirection(90)).toBe('East (90°)');
    });

    test('returns custom string for odd angle', () => {
    expect(getAzimuthDirection(1000)).toBe('North (0°)');
    });
});

// Test for getRecommendedSystemSize function
describe('getRecommendedSystemSize', () => {
    test('returns correct recommended size with normal input', () => {
      expect(getRecommendedSystemSize(20, 4)).toBe(6.5); // (20 * 1.3) / 4 = 6.5
      expect(getRecommendedSystemSize(30, 5)).toBe(7.8); // (30 * 1.3) / 5 = 7.8
    });

    test('returns minimum size of 1 if calculated size is less than 1', () => {
      expect(getRecommendedSystemSize(1, 20)).toBe(1); // (1 * 1.3) / 20 = 0.065
    });

    test('handles zero or invalid dailyPvoutCsi safely', () => {
        expect(getRecommendedSystemSize(20, 0)).toBe(1);
        expect(getRecommendedSystemSize(20, -5)).toBe(1);
        expect(getRecommendedSystemSize(20, NaN)).toBe(1);
    });

    test('returns 1 if usage is 0', () => {
        expect(getRecommendedSystemSize(0, 4)).toBe(1);
    });
});

// Test for extractMonthlyHourlyProfile function
describe('extractMonthlyHourlyProfile', () => {
    const mockData = {
    PVOUT_total: [
        Array(24).fill(1), // January
        Array(24).fill(2), // February
    ]
    };

    test('returns correctly scaled hourly data for given month and system size', () => {
      const result = extractMonthlyHourlyProfile(mockData, 0, 5); // January
    expect(result).toEqual(Array(24).fill(5));
    });

    test('returns zeros if data is missing for the month', () => {
      const result = extractMonthlyHourlyProfile(mockData, 5, 1); // June missing
    expect(result).toEqual(Array(24).fill(0));
    });

    test('handles null and NaN values gracefully', () => {
    const corruptedData = {
        PVOUT_total: [
        [1, null, NaN, 2, 3, 4, 5, 6, 7, 8, 9, 10, null, 12, 13, NaN, 15, 16, 17, 18, 19, 20, 21, 22]
        ]
    };
    const result = extractMonthlyHourlyProfile(corruptedData, 0, 1);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(0);
    expect(result[12]).toBe(0);
    expect(result[15]).toBe(0);
    expect(result[0]).toBe(1);
    expect(result[3]).toBe(2);
    expect(result[23]).toBe(22);
    });

    test('defaults system size to 1 if not provided', () => {
    const result = extractMonthlyHourlyProfile(mockData, 1);
    expect(result).toEqual(Array(24).fill(2));
    });
});

// Test for getDaysInMonth function
describe('getDaysInMonth', () => {
    test('returns correct number of days for common months', () => {
      expect(getDaysInMonth(0)).toBe(31); // January
      expect(getDaysInMonth(3)).toBe(30); // April
      expect(getDaysInMonth(6)).toBe(31); // July
    });

    test('returns 28 for February in non-leap years', () => {
    expect(getDaysInMonth(1)).toBe(28);
    });

    test('INTENTIONAL FAIL: expects February to have 29 days (leap year)', () => {
      expect(getDaysInMonth(1)).toBe(29); // This will fail
    });

    test('returns 0 for invalid month index', () => {
    expect(getDaysInMonth(12)).toBe(0);
    expect(getDaysInMonth(-1)).toBe(0);
    });
});