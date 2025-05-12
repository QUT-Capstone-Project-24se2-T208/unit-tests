// Contains functions for advanced calculator only relevant for testing

function detectCountry(lat, lng) {
    // Simple country detection based on coordinates
    // This is a simplified version - in a real app, you'd use a more accurate geolocation service
    
    // Australia
    if (lat < -10 && lat > -45 && lng > 110 && lng < 155) {
      return "AU";
    }
    // Papua New Guinea
    else if (lng > 140 && lng < 155 && lat > -12 && lat < 1) {
      return "PG";
    }
    // Japan
    else if (lat > 30 && lat < 46 && lng > 129 && lng < 146) {
      return "JP";
    }
    // South Korea
    else if (lat > 33 && lat < 39 && lng > 124 && lng < 132) {
      return "KR";
    }
    // China
    else if (lat > 18 && lat < 54 && lng > 73 && lng < 135) {
      return "CN";
    }
    // India
    else if (lat > 6 && lat < 36 && lng > 68 && lng < 98) {
      return "IN";
    }
    // UK
    else if (lat > 49 && lat < 59 && lng > -8 && lng < 2) {
      return "GB";
    }
    // Germany
    else if (lat > 47 && lat < 55 && lng > 5 && lng < 16) {
      return "DE";
    }
    // France
    else if (lat > 41 && lat < 51 && lng > -5 && lng < 10) {
      return "FR";
    }
    // Italy
    else if (lat > 36 && lat < 48 && lng > 6 && lng < 19) {
      return "IT";
    }
    // Spain
    else if (lat > 36 && lat < 44 && lng > -10 && lng < 4) {
      return "ES";
    }
    // Canada
    else if (lat > 41 && lat < 84 && lng > -141 && lng < -52) {
      return "CA";
    }
    // Brazil
    else if (lat > -34 && lat < 6 && lng > -74 && lng < -34) {
      return "BR";
    }
    // South Africa
    else if (lat > -35 && lat < -22 && lng > 16 && lng < 33) {
      return "ZA";
    }
    // Default to US for any other location
    else {
      return "US";
    }
}

function calculateTotalFromHourlyData(hourlyData) {
  if (!Array.isArray(hourlyData)) return 0;
  
  return hourlyData.reduce((sum, value) => {
    if (value !== null && !isNaN(value)) {
      return sum + value;
    }
    return sum;
  }, 0);
}

function getAzimuthDirection(azimuth) {
  // Convert azimuth angle to direction text
  if (azimuth >= 337.5 || azimuth < 22.5) return "North (0°)";
  if (azimuth >= 22.5 && azimuth < 67.5) return "Northeast (45°)";
  if (azimuth >= 67.5 && azimuth < 112.5) return "East (90°)";
  if (azimuth >= 112.5 && azimuth < 157.5) return "Southeast (135°)";
  if (azimuth >= 157.5 && azimuth < 202.5) return "South (180°)";
  if (azimuth >= 202.5 && azimuth < 247.5) return "Southwest (225°)";
  if (azimuth >= 247.5 && azimuth < 292.5) return "West (270°)";
  if (azimuth >= 292.5 && azimuth < 337.5) return "Northwest (315°)";
  return `Custom (${azimuth}°)`;
}

function getRecommendedSystemSize(dailyUsage, dailyPvoutCsi) {
  if (!dailyPvoutCsi || isNaN(dailyPvoutCsi) || dailyPvoutCsi <= 0) return 1;

  const rawSize = (dailyUsage * 1.3) / dailyPvoutCsi;
  const roundedSize = Math.round(rawSize * 10) / 10;
  return Math.max(1, roundedSize);
}

function extractMonthlyHourlyProfile(monthlyHourlyData, month, systemSize = 1) {
  if (
    !monthlyHourlyData ||
    !Array.isArray(monthlyHourlyData.PVOUT_total) ||
    !Array.isArray(monthlyHourlyData.PVOUT_total[month])
  ) {
    return Array(24).fill(0); // fallback: blank profile
  }

  const hourlyValues = monthlyHourlyData.PVOUT_total[month];
  return hourlyValues.map(value => {
    if (value === null || isNaN(value)) return 0;
    return value * systemSize;
  });
}

function getDaysInMonth(monthIndex) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[monthIndex] ?? 0;
}


const countryData = {
  AU: { 
    name: "Australia", 
    rate: 0.28, 
    currency: "AUD", 
    symbol: "$", 
    avgMonthlyBill: 120,
    flag: "🇦🇺",
    exchangeRate: 1.0 // Base currency (1 AUD = 1 AUD)
  },
  US: { 
    name: "United States", 
    rate: 0.15, 
    currency: "USD", 
    symbol: "$", 
    avgMonthlyBill: 115,
    flag: "🇺🇸",
    exchangeRate: 0.66 // 1 USD = 0.66 AUD
  },
  GB: { 
    name: "United Kingdom", 
    rate: 0.21, 
    currency: "GBP", 
    symbol: "£", 
    avgMonthlyBill: 85,
    flag: "🇬🇧",
    exchangeRate: 0.51 // 1 GBP = 0.51 AUD
  },
  JP: { 
    name: "Japan", 
    rate: 0.26, 
    currency: "JPY", 
    symbol: "¥", 
    avgMonthlyBill: 8000,
    flag: "🇯🇵",
    exchangeRate: 100.52 // 1 JPY = 100.52 AUD (inverse rate)
  },
  KR: { 
    name: "South Korea", 
    rate: 0.11, 
    currency: "KRW", 
    symbol: "₩", 
    avgMonthlyBill: 60000,
    flag: "🇰🇷",
    exchangeRate: 880.41 // 1 KRW = 880.41 AUD (inverse rate)
  },
  DE: { 
    name: "Germany", 
    rate: 0.37, 
    currency: "EUR", 
    symbol: "€", 
    avgMonthlyBill: 95,
    flag: "🇩🇪",
    exchangeRate: 0.60 // 1 EUR = 0.60 AUD
  },
  FR: { 
    name: "France", 
    rate: 0.20, 
    currency: "EUR", 
    symbol: "€", 
    avgMonthlyBill: 75,
    flag: "🇫🇷",
    exchangeRate: 0.60 // 1 EUR = 0.60 AUD
  },
  IT: { 
    name: "Italy", 
    rate: 0.25, 
    currency: "EUR", 
    symbol: "€", 
    avgMonthlyBill: 80,
    flag: "🇮🇹",
    exchangeRate: 0.60 // 1 EUR = 0.60 AUD
  },
  ES: { 
    name: "Spain", 
    rate: 0.28, 
    currency: "EUR", 
    symbol: "€", 
    avgMonthlyBill: 85,
    flag: "🇪🇸",
    exchangeRate: 0.60 // 1 EUR = 0.60 AUD
  },
  CA: { 
    name: "Canada", 
    rate: 0.13, 
    currency: "CAD", 
    symbol: "$", 
    avgMonthlyBill: 100,
    flag: "🇨🇦",
    exchangeRate: 0.89 // 1 CAD = 0.89 AUD
  },
  CN: { 
    name: "China", 
    rate: 0.08, 
    currency: "CNY", 
    symbol: "¥", 
    avgMonthlyBill: 300,
    flag: "🇨🇳",
    exchangeRate: 4.71 // 1 CNY = 4.71 AUD (inverse rate)
  },
  IN: { 
    name: "India", 
    rate: 0.08, 
    currency: "INR", 
    symbol: "₹", 
    avgMonthlyBill: 1000,
    flag: "🇮🇳",
    exchangeRate: 54.85 // 1 INR = 54.85 AUD (inverse rate)
  },
  BR: { 
    name: "Brazil", 
    rate: 0.17, 
    currency: "BRL", 
    symbol: "R$", 
    avgMonthlyBill: 200,
    flag: "🇧🇷",
    exchangeRate: 3.35 // 1 BRL = 3.35 AUD (inverse rate)
  },
  ZA: { 
    name: "South Africa", 
    rate: 0.15, 
    currency: "ZAR", 
    symbol: "R", 
    avgMonthlyBill: 1500,
    flag: "🇿🇦",
    exchangeRate: 12.17 // 1 ZAR = 12.17 AUD (inverse rate)
  },
  PG: { 
    name: "Papua New Guinea", 
    rate: 0.39, 
    currency: "PGK", 
    symbol: "K", 
    avgMonthlyBill: 300,
    flag: "🇵🇬",
    exchangeRate: 2.35 // 1 PGK = 2.35 AUD (inverse rate)
  }
};

function updateCurrencyDisplay(code, data = countryData) {
  const country = data[code] || data["US"];
  
  if (!country) {
    document.getElementById("currency-symbol").textContent = "";
    document.getElementById("currency-symbol-bill").textContent = "";
    return;
  }

  document.getElementById("currency-symbol").textContent = country.currency;
  document.getElementById("currency-symbol-bill").textContent = country.symbol;
}

/**
 * Calculate monthly savings based on annual output and country
 * @param {number} annualOutput - Total annual energy output in kWh
 * @param {string} countryCode - Country code
 * @param {Object} data - Country data with electricity rates
 * @returns {Object} Monthly and annual savings
 */
function calculateMonthlySavings(annualOutput, countryCode, data = countryData) {
  if (!annualOutput || isNaN(annualOutput) || annualOutput <= 0) {
    return { monthlySavings: 0, annualSavings: 0 };
  }
  
  const country = data[countryCode] || data["US"];
  const electricityRate = country.rate;
  
  let monthlySavings, annualSavings;
  
  // Currency exchange rate calculation
  if (["KR", "JP", "CN", "IN", "ZA", "BR"].includes(countryCode)) {
    // Currencies with larger denominations (KRW, JPY, INR, etc.)
    monthlySavings = (annualOutput / 12) * electricityRate * country.exchangeRate;
    annualSavings = annualOutput * electricityRate * country.exchangeRate;
  } else {
    // Other currencies (USD, EUR, AUD, etc.)
    monthlySavings = (annualOutput / 12) * electricityRate;
    annualSavings = annualOutput * electricityRate;
  }
  
  return { monthlySavings, annualSavings };
}

/**
 * Convert savings amount to AUD
 * @param {number} amount - Amount to convert
 * @param {string} countryCode - Source country code
 * @param {Object} data - Country data with exchange rates
 * @returns {number} Converted amount in AUD
 */
function convertCurrency(amount, countryCode, data = countryData) {
  if (!amount || isNaN(amount)) {
    return 0;
  }
  
  const country = data[countryCode] || data["US"];
  
  if (countryCode === "AU") {
    return amount; // No conversion needed for AUD
  } else if (["KR", "JP", "CN", "IN", "ZA", "BR"].includes(countryCode)) {
    // Convert large denomination currencies to AUD
    return amount / country.exchangeRate;
  } else {
    // Convert other currencies to AUD
    return amount / country.exchangeRate;
  }
}

/**
 * Fetch optimal tilt angle (OPTA) and solar irradiation data from Solargis API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Solar data including OPTA and PVOUT_CSI
 */
async function fetchOpta(lat, lng) {
  try {
    const response = await fetch(`https://api.globalsolaratlas.info/data/lta?loc=${lat},${lng}`);
    const data = await response.json();
    
    const result = {
      opta: 20, // Default value
      pvoutCsi: 4.5 / 365 // Default daily value (4.5 kWh/kWp/year divided by 365)
    };
    
    // Extract OPTA (Optimal Tilt Angle)
    if (data?.annual?.data?.OPTA) {
      result.opta = data.annual.data.OPTA;
    }
    
    // Extract PVOUT_CSI (Clear-Sky Irradiation) - daily value
    if (data?.annual?.data?.PVOUT_CSI) {
      // Convert annual value to daily average (divide by 365)
      result.pvoutCsi = data.annual.data.PVOUT_CSI / 365;
    }
    // If PVOUT_CSI is not available, try to use GTI as fallback
    else if (data?.annual?.data?.GTI) {
      // GTI is typically in kWh/m²/year, convert to daily and apply efficiency factor
      const dailyGti = data.annual.data.GTI / 365;
      // Apply approximate 17% conversion efficiency
      result.pvoutCsi = dailyGti * 0.17;
    }
    
    return result;
  } catch (error) {
    return {
      opta: 20, // Default value
      pvoutCsi: 4.5 / 365 // Default daily value
    };
  }
}

/**
 * Fetch detailed solar system calculation from Solargis API
 * @param {Object} params - Parameters for the calculation
 * @param {number} params.lat - Latitude
 * @param {number} params.lng - Longitude
 * @param {string} params.systemType - Type of system (e.g., "roofMounted")
 * @param {number} params.azimuth - Azimuth angle in degrees
 * @param {number} params.tilt - Tilt angle in degrees
 * @param {number} params.size - System size in kWp
 * @returns {Promise<Object>} Detailed solar calculation results
 */
async function fetchSolargisData(params) {
  try {
    const { lat, lng, systemType, azimuth, tilt, size } = params;
    
    const apiUrl = `https://api.globalsolaratlas.info/data/pvcalc?loc=${lat},${lng}`;
    
    const payload = {
      type: systemType,
      orientation: {
        azimuth: azimuth,
        tilt: tilt
      },
      systemSize: {
        type: "capacity",
        value: size
      },
      hourlyOutputs: true // Request hourly data for better accuracy
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data?.annual?.data || !data?.monthly?.data) {
      throw new Error("Invalid response data");
    }
    
    return {
      annualOutput: data.annual.data.PVOUT_total,
      monthlyOutput: data.monthly.data.PVOUT_total,
      gti: data.annual.data.GTI,
      monthlyHourlyData: data['monthly-hourly']?.data
    };
  } catch (error) {
    throw error;
  }
}

module.exports = 
{ 
  detectCountry, 
  calculateTotalFromHourlyData, 
  getAzimuthDirection, 
  getRecommendedSystemSize,
  extractMonthlyHourlyProfile,
  getDaysInMonth,
  updateCurrencyDisplay,
  calculateMonthlySavings,
  convertCurrency,
  fetchOpta,
  fetchSolargisData,
  countryData
};



