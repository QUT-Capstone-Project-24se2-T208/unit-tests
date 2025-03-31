document.addEventListener("DOMContentLoaded", () => {
  // Step navigation elements
  const stepItems = document.querySelectorAll('.step-item');
  const stepContents = document.querySelectorAll('.step-content');
  const nextButtons = document.querySelectorAll('.next-btn');
  const prevButtons = document.querySelectorAll('.prev-btn');
  const calculateButton = document.getElementById('calculate-btn');
  const resetDefaultsButton = document.getElementById('reset-defaults');
  
  // Current step tracker
  let currentStep = 1;
  
  // Initialize step indicator
  updateStepIndicator();
  
  // Disable step navigation (click events removed)
  stepItems.forEach(item => {
    item.style.cursor = 'default'; // Change cursor style
    // No click event is added
  });
  
  // Add click event for next buttons
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      const currentStepElement = this.closest('.step-content');
      const currentStepId = currentStepElement ? currentStepElement.id : '';
      
      // Handle Location to Energy Usage transition
      if (currentStepId === 'step-1') {
        const { lat, lng } = marker.getLatLng();
        showLoadingSpinner('Loading solar data for your location...');
        
        // Fetch solar data before proceeding
        fetchOpta(lat, lng)
          .then(() => {
            updatePanelDefaults(lat, lng);
            saveOriginalPanelSettings();
            hideLoadingSpinner();
            navigateToStep(currentStep + 1);
          })
          .catch(error => {
            console.error("Error loading location data:", error);
            hideLoadingSpinner();
            alert("Failed to load solar data for this location. Please try again.");
          });
      } else if (currentStepId === 'step-4') {
        // For Panel Settings step, trigger calculate button instead
        document.getElementById('panel-calculate-btn').click();
      } else {
        // Regular navigation for other steps
        navigateToStep(currentStep + 1);
      }
    });
  });
  
  // Add click event for previous buttons
  prevButtons.forEach(button => {
    button.addEventListener('click', function() {
      navigateToStep(currentStep - 1);
    });
  });
  
  // Function to navigate between steps
  function navigateToStep(stepNumber) {
    // Validate step number
    if (stepNumber < 1 || stepNumber > stepItems.length) {
      return;
    }
    
    // Hide all step contents
    stepContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // Show current step content
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    
    // Update current step
    currentStep = stepNumber;
    
    // Update step indicator
    updateStepIndicator();
    
    // Smooth scroll to the top of the calculator container
    document.querySelector('.calculator-container').scrollIntoView({
      behavior: 'smooth'
    });
  }
  
  // Function to update step indicator
  function updateStepIndicator() {
    stepItems.forEach(item => {
      const itemStep = parseInt(item.getAttribute('data-step'));
      
      // Remove all states
      item.classList.remove('active', 'completed');
      
      // Add appropriate state
      if (itemStep === currentStep) {
        item.classList.add('active');
      } else if (itemStep < currentStep) {
        item.classList.add('completed');
      }
    });
  }
  
  // Loading spinner functions
  function showLoadingSpinner(message = 'Loading...') {
    document.getElementById('loading-message').textContent = message;
    document.getElementById('loading-overlay').style.display = 'flex';
  }

  function hideLoadingSpinner() {
    document.getElementById('loading-overlay').style.display = 'none';
  }
  
  // Store original panel settings for reset functionality
  let originalPanelSettings = {
    tilt: 0,
    azimuth: 0
  };

  function saveOriginalPanelSettings() {
    originalPanelSettings.tilt = document.getElementById("tilt").value;
    originalPanelSettings.azimuth = document.getElementById("azimuth").value;
  }
  
  // Optional: Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      navigateToStep(currentStep + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      navigateToStep(currentStep - 1);
    }
  });
  
  // Optional: Add swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.querySelector('.steps-content').addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  document.querySelector('.steps-content').addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX + swipeThreshold < touchStartX) {
      // Swipe left - go next
      navigateToStep(currentStep + 1);
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - go back
      navigateToStep(currentStep - 1);
    }
  }

  // ----- Solar Calculator Functionality -----

  // Initialize map
  const map = L.map("map").setView([-6.487254, 145.156558], 5);

  const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  const satelliteLayer = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={y}&y={y}&z={z}", {
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 19,
  });

  let marker = L.marker([-6.487254, 145.156558], { draggable: true }).addTo(map);

  let latestOpta = 20;
  let latestPvoutCsi = 4.5; // Default value for PVOUT_CSI in kWh/kWp
  let latestAnnualOutput = 0;
  
  // Country data with electricity rates and currency symbols
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
  
  // Default country
  let currentCountry = "US";

  async function fetchOpta(lat, lng) {
    try {
      const response = await fetch(`https://api.globalsolaratlas.info/data/lta?loc=${lat},${lng}`);
      const data = await response.json();
      
      // Extract OPTA (Optimal Tilt Angle)
      latestOpta = data?.annual?.data?.OPTA || 20;
      
      // Extract PVOUT_CSI (Clear-Sky Irradiation) - daily value
      if (data?.annual?.data?.PVOUT_CSI) {
        // Convert annual value to daily average (divide by 365)
        latestPvoutCsi = data.annual.data.PVOUT_CSI / 365;
        console.log("Daily PVOUT_CSI: ", latestPvoutCsi, "kWh/kWp/day");
      }
      
      // If PVOUT_CSI is not available, try to use GTI as fallback
      else if (data?.annual?.data?.GTI) {
        // GTI is typically in kWh/m²/year, convert to daily and apply efficiency factor
        const dailyGti = data.annual.data.GTI / 365;
        // Apply approximate 17% conversion efficiency
        latestPvoutCsi = dailyGti * 0.17;
        console.log("Estimated Daily PVOUT_CSI from GTI: ", latestPvoutCsi, "kWh/kWp/day");
      }
      
    } catch (error) {
      console.error("Failed to fetch solar data:", error);
    }
  }
  
  // Function to detect country based on lat/lng
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
  
  // Function to update currency display
  function updateCurrencyDisplay() {
    document.getElementById("currency-symbol").textContent = countryData[currentCountry].currency;
    document.getElementById("currency-symbol-bill").textContent = countryData[currentCountry].symbol;
  }
  
  function updatePanelDefaults(lat, lng) {
    const systemType = document.getElementById("system-type").value;
    const tiltInput = document.getElementById("tilt");
    const azimuthInput = document.getElementById("azimuth");
    const sizeInput = document.getElementById("system-size");
    const billInput = document.getElementById("electric-bill");
    const dailyUsageInput = document.getElementById("daily-usage");
    
    // Detect country
    currentCountry = detectCountry(lat, lng);
    
    // Update currency display
    updateCurrencyDisplay();

    // Set panel orientation based on hemisphere
    if (systemType === "hydroMountedLargeScale") {
      tiltInput.value = 10;
    } else {
      tiltInput.value = latestOpta.toFixed(1);
    }

    if (lat > 1) azimuthInput.value = 180;
    else if (lat < -1) azimuthInput.value = 0;
    else azimuthInput.value = 90;

    // Set system size based on daily usage (this will be updated later)
    updateRecommendedSize();

    // Set electricity bill to average for the country
    billInput.value = countryData[currentCountry].avgMonthlyBill;
    
    // Update electricity rate used in calculations
    updateDailyUsage();

    // Update the sliders
    updateSliders();
    
    // Update the 3D panel model
    updatePanelModel();

    console.log("Updated Tilt:", tiltInput.value, "Azimuth:", azimuthInput.value);
  }
  
  // Function to calculate recommended system size based on daily usage and solar irradiation
  function updateRecommendedSize() {
    const dailyUsage = parseFloat(document.getElementById("daily-usage").value) || 0;
    const sizeInput = document.getElementById("system-size");
    const recommendedNote = document.getElementById("recommended-size-note");
    
    // Calculate recommended size using PVOUT_CSI: 
    // Daily usage / daily production per kWp
    // We also add a 1.3 factor to account for system losses and provide buffer
    let recommendedSize = (dailyUsage * 1.3) / latestPvoutCsi;
    
    // Round to one decimal place
    recommendedSize = Math.round(recommendedSize * 10) / 10;
    
    // Set minimum size
    if (recommendedSize < 1) recommendedSize = 1;
    
    // Update system size input
    sizeInput.value = recommendedSize;
    
    // Update recommendation note
    if (dailyUsage > 0) {
      // Keep it simple and clear
      recommendedNote.textContent = `(Recommended size: ${recommendedSize} kWp)`;
    } else {
      recommendedNote.textContent = "";
    }
  }

  async function handleLocationChange(lat, lng) {
    // Only update location without fetching data
    console.log(`Location set to: ${lat}, ${lng}`);
  }

  // Modified map click event - only set marker position without fetching
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng]);
    console.log(`Pin set to Lat: ${lat}, Lng: ${lng}`);
    // No immediate fetch call here
  });

  marker.on("dragend", () => {
    const { lat, lng } = marker.getLatLng();
    console.log(`Marker moved to Lat: ${lat}, Lng: ${lng}`);
    // No immediate fetch call here
  });

  // Create and add satellite toggle button
  const satelliteToggleContainer = document.getElementById("satellite-toggle-container");
  const satelliteToggleButton = document.createElement("button");
  satelliteToggleButton.innerHTML = '<i class="fas fa-satellite"></i> Toggle Satellite View';
  satelliteToggleButton.classList.add("prev-btn");
  satelliteToggleContainer.appendChild(satelliteToggleButton);

  let isSatellite = false;
  satelliteToggleButton.addEventListener("click", () => {
    if (!isSatellite) {
      map.removeLayer(osmLayer);
      satelliteLayer.addTo(map);
    } else {
      map.removeLayer(satelliteLayer);
      osmLayer.addTo(map);
    }
    isSatellite = !isSatellite;
  });

  map.on("mousemove", (e) => {
    const coords = `Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}`;
    document.getElementById("cursor-coordinates").textContent = coords;
  });

  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("searchResults");

  const debounce = (func, delay = 300) => {
    let debounceTimer;
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const performSearch = async () => {
    const query = searchInput.value.trim();
    if (query.length < 3) {
      searchResults.innerHTML = "";
      return;
    }

    searchResults.innerHTML = `<div class="loading-spinner">Searching...</div>`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=en`;

    try {
      const response = await fetch(url);
      const results = await response.json();
      searchResults.innerHTML = "";

      if (!results.length) {
        searchResults.innerHTML = `<div class="no-results">No results found</div>`;
        return;
      }

      results.forEach((result) => {
        const item = document.createElement("div");
        item.classList.add("search-item");
        item.textContent = result.display_name;

        item.addEventListener("click", () => {
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);

          map.setView([lat, lon], 13);
          marker.setLatLng([lat, lon]);
          searchInput.value = result.display_name;
          searchResults.innerHTML = "";

          // Just update marker position without fetching
          console.log(`Location set: ${lat}, ${lon}`);
        });

        searchResults.appendChild(item);
      });
    } catch (error) {
      console.error("Search failed:", error);
      searchResults.innerHTML = `<div class="no-results">Search failed. Try again.</div>`;
    }
  };

  const debouncedSearch = debounce(performSearch, 200);
  searchInput.addEventListener("input", debouncedSearch);

  // Energy Usage and Appliances Section
  
  // Toggle show/hide appliance calculator
  const showApplianceCalculatorBtn = document.getElementById('show-appliance-calculator');
  const applianceSection = document.querySelector('.appliance-section');
  const applyApplianceUsageBtn = document.getElementById('apply-appliance-usage');
  
  showApplianceCalculatorBtn.addEventListener('click', function() {
    if (applianceSection.style.display === 'none' || !applianceSection.style.display) {
      applianceSection.style.display = 'block';
      this.innerHTML = '<i class="fas fa-times"></i> Hide Appliance Calculator';
    } else {
      applianceSection.style.display = 'none';
      this.innerHTML = '<i class="fas fa-calculator"></i> Calculate with Appliances';
    }
  });
  
  // Apply appliance usage to daily usage input
  applyApplianceUsageBtn.addEventListener('click', function() {
    const totalUsage = document.getElementById('total-daily-usage').textContent;
    document.getElementById('daily-usage').value = totalUsage;
    
    // Update recommended system size
    updateRecommendedSize();
    
    // Hide appliance section
    applianceSection.style.display = 'none';
    showApplianceCalculatorBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate with Appliances';
  });
  
  // Initialize empty array for selected appliances
  let selectedAppliances = [];
  
  // Populate appliance grid
  const applianceGrid = document.getElementById('appliance-grid');
  const selectedAppliancesList = document.getElementById('selected-appliances-list');
  const dailyUsageInput = document.getElementById('daily-usage');
  
  // Appliance data from the provided information
  const applianceData = [
    {
      title: "LED Lights (10x)",
      wattage: 100,
      hour: 5,
      category: "lighting",
      image: "assets/lightbulb.png"
    },
    {
      title: "Fridge (Large)",
      wattage: 150,
      hour: 12,
      category: "kitchen",
      image: "assets/fridge-large.png"
    },
    {
      title: "Ceiling Fans (2-3)",
      wattage: 150,
      hour: 5,
      category: "cooling",
      image: "assets/ceiling-fan.png"
    },
    {
      title: "TV (LED)",
      wattage: 120,
      hour: 4,
      category: "entertainment",
      image: "assets/tv.png"
    },
    {
      title: "Laptop / Computers",
      wattage: 200,
      hour: 4,
      category: "work-leisure",
      image: "assets/computer.png"
    },
    {
      title: "Washing Machine",
      wattage: 500,
      hour: 1,
      category: "laundry",
      image: "assets/washing-machine.png"
    },
    {
      title: "Air Conditioner",
      wattage: 1200,
      hour: 6,
      category: "cooling",
      image: "assets/air-conditioner-large.png"
    },
    {
      title: "Microwave",
      wattage: 1800,
      hour: 0.5,
      category: "kitchen",
      image: "assets/microwave.png"
    },
    {
      title: "Air Conditioner - Large",
      wattage: 1800,
      hour: 4,
      category: "cooling",
      image: "assets/air-conditioner-large.png"
    },
    {
      title: "Air Conditioner - Small",
      wattage: 850,
      hour: 4,
      category: "cooling",
      image: "assets/air-conditioner-small.png"
    },
    {
      title: "Dishwasher",
      wattage: 1800,
      hour: 1,
      category: "kitchen",
      image: "assets/dishwasher.png"
    },
    {
      title: "Electric Oven",
      wattage: 3400,
      hour: 1,
      category: "kitchen",
      image: "assets/oven.png"
    },
    {
      title: "Dryer",
      wattage: 2500,
      hour: 1,
      category: "laundry",
      image: "assets/dryer.png"
    },
    {
      title: "Coffee Machine",
      wattage: 1350,
      hour: 0.2,
      category: "work-leisure",
      image: "assets/coffee-machine.png"
    },
    {
      title: "Desktop Computer",
      wattage: 135,
      hour: 3,
      category: "work-leisure",
      image: "assets/computer.png"
    },
    {
      title: "Custom Appliance",
      wattage: 1,
      hour: 1,
      category: "other",
      image: "assets/custom.png"
    }
  ];
  
  // Generate appliance items
  applianceData.forEach(appliance => {
    const applianceItem = document.createElement('div');
    applianceItem.classList.add('appliance-item');
    applianceItem.dataset.category = appliance.category;
    applianceItem.dataset.title = appliance.title;
    applianceItem.dataset.wattage = appliance.wattage;
    applianceItem.dataset.hour = appliance.hour;
    
    applianceItem.innerHTML = `
      <img src="${appliance.image}" alt="${appliance.title}">
      <div class="appliance-label">${appliance.title}</div>
    `;
    
    applianceItem.addEventListener('click', function() {
      const isSelected = this.classList.contains('selected');
      
      if (isSelected) {
        // Remove from selection
        this.classList.remove('selected');
        removeSelectedAppliance(appliance.title);
      } else {
        // Add to selection
        this.classList.add('selected');
        addSelectedAppliance({
          title: appliance.title,
          wattage: appliance.wattage,
          hour: appliance.hour,
          quantity: 1
        });
      }
    });
    
    applianceGrid.appendChild(applianceItem);
  });
  
  // Category filter functionality
  const categoryButtons = document.querySelectorAll('.category-btn');
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Update active button
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Filter appliances
      const applianceItems = document.querySelectorAll('.appliance-item');
      
      applianceItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
  
  // Appliance search functionality
  const applianceSearch = document.getElementById('appliance-search');
  
  applianceSearch.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    const applianceItems = document.querySelectorAll('.appliance-item');
    
    applianceItems.forEach(item => {
      const title = item.dataset.title.toLowerCase();
      
      if (title.includes(searchTerm)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
  
  // Add selected appliance to list
  function addSelectedAppliance(appliance) {
    // Check if already in list
    const existingIndex = selectedAppliances.findIndex(a => a.title === appliance.title);
    
    if (existingIndex !== -1) {
      return; // Already in list
    }
    
    // Add to array
    selectedAppliances.push(appliance);
    
    // Update UI
    updateSelectedAppliancesList();
    updateDailyUsage();
  }
  
  // Remove selected appliance from list
  function removeSelectedAppliance(title) {
    // Remove from array
    selectedAppliances = selectedAppliances.filter(a => a.title !== title);
    
    // Update UI
    updateSelectedAppliancesList();
    updateDailyUsage();
  }
  
  // Update the selected appliances list UI
  function updateSelectedAppliancesList() {
    selectedAppliancesList.innerHTML = '';
    
    if (selectedAppliances.length === 0) {
      selectedAppliancesList.innerHTML = '<div class="no-results">No appliances selected</div>';
      return;
    }
    
    selectedAppliances.forEach(appliance => {
      const dailyUsage = ((appliance.wattage * appliance.hour * appliance.quantity) / 1000).toFixed(2);
      
      const item = document.createElement('div');
      item.classList.add('selected-appliance-item');
      item.innerHTML = `
        <span class="selected-appliance-name">${appliance.title}</span>
        <div class="selected-appliance-controls">
          <label>Qty: <input type="number" min="1" value="${appliance.quantity}" class="appliance-quantity" data-title="${appliance.title}"></label>
          <label>W: <input type="number" min="1" value="${appliance.wattage}" class="appliance-wattage" data-title="${appliance.title}"></label>
          <label>Hrs: <input type="number" min="0.1" max="24" step="0.1" value="${appliance.hour}" class="appliance-hours" data-title="${appliance.title}"></label>
        </div>
        <span class="selected-appliance-usage">${dailyUsage} kWh/day</span>
        <span class="remove-appliance" data-title="${appliance.title}">
          <i class="fas fa-times"></i>
        </span>
      `;
      
      selectedAppliancesList.appendChild(item);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-appliance').forEach(button => {
      button.addEventListener('click', function() {
        const title = this.getAttribute('data-title');
        
        // Deselect the corresponding grid item
        const gridItem = Array.from(document.querySelectorAll('.appliance-item'))
          .find(item => item.dataset.title === title);
          
        if (gridItem) {
          gridItem.classList.remove('selected');
        }
        
        removeSelectedAppliance(title);
      });
    });
    
    // Add event listeners to quantity inputs
    document.querySelectorAll('.appliance-quantity').forEach(input => {
      input.addEventListener('change', function() {
        const title = this.getAttribute('data-title');
        const quantity = parseInt(this.value) || 1;
        
        // Update appliance quantity
        const applianceIndex = selectedAppliances.findIndex(a => a.title === title);
        if (applianceIndex !== -1) {
          selectedAppliances[applianceIndex].quantity = quantity;
          updateDailyUsage();
          
          // Update usage display without rebuilding the whole list
          const usageElement = this.closest('.selected-appliance-item').querySelector('.selected-appliance-usage');
          const appliance = selectedAppliances[applianceIndex];
          const dailyUsage = ((appliance.wattage * appliance.hour * appliance.quantity) / 1000).toFixed(2);
          usageElement.textContent = `${dailyUsage} kWh/day`;
        }
      });
    });
    
    // Add event listeners to wattage inputs
    document.querySelectorAll('.appliance-wattage').forEach(input => {
      input.addEventListener('change', function() {
        const title = this.getAttribute('data-title');
        const wattage = parseInt(this.value) || 1;
        
        // Update appliance wattage
        const applianceIndex = selectedAppliances.findIndex(a => a.title === title);
        if (applianceIndex !== -1) {
          selectedAppliances[applianceIndex].wattage = wattage;
          updateDailyUsage();
          
          // Update usage display
          const usageElement = this.closest('.selected-appliance-item').querySelector('.selected-appliance-usage');
          const appliance = selectedAppliances[applianceIndex];
          const dailyUsage = ((appliance.wattage * appliance.hour * appliance.quantity) / 1000).toFixed(2);
          usageElement.textContent = `${dailyUsage} kWh/day`;
        }
      });
    });
    
    // Add event listeners to hours inputs
    document.querySelectorAll('.appliance-hours').forEach(input => {
      input.addEventListener('change', function() {
        const title = this.getAttribute('data-title');
        const hours = parseFloat(this.value) || 0.1;
        
        // Update appliance hours
        const applianceIndex = selectedAppliances.findIndex(a => a.title === title);
        if (applianceIndex !== -1) {
          selectedAppliances[applianceIndex].hour = hours;
          updateDailyUsage();
          
          // Update usage display
          const usageElement = this.closest('.selected-appliance-item').querySelector('.selected-appliance-usage');
          const appliance = selectedAppliances[applianceIndex];
          const dailyUsage = ((appliance.wattage * appliance.hour * appliance.quantity) / 1000).toFixed(2);
          usageElement.textContent = `${dailyUsage} kWh/day`;
        }
      });
    });
  }
  
  // Calculate and update total daily usage
  function updateDailyUsage() {
    let totalDailyUsage = 0;
    
    selectedAppliances.forEach(appliance => {
      const dailyUsage = appliance.wattage * appliance.hour * appliance.quantity / 1000;
      totalDailyUsage += dailyUsage;
    });
    
    // Update total display
    document.getElementById('total-daily-usage').textContent = totalDailyUsage.toFixed(2);
    
    // Update estimated bill
    const electricityRate = countryData[currentCountry].rate;
    const monthlyBill = totalDailyUsage * 30 * electricityRate;
    document.getElementById('estimated-monthly-bill').textContent = monthlyBill.toFixed(2);
  }
  
  // Update daily usage when input changes
  dailyUsageInput.addEventListener('input', function() {
    const dailyUsage = parseFloat(this.value) || 0;
    
    // Update recommended system size
    updateRecommendedSize();
    
    // Update estimated bill
    const electricityRate = countryData[currentCountry].rate;
    const monthlyBill = dailyUsage * 30 * electricityRate;
    document.getElementById('estimated-monthly-bill').textContent = monthlyBill.toFixed(2);
  });
  
  // Update estimated bill when electric bill rate changes
  document.getElementById('electric-bill').addEventListener('input', function() {
    const dailyUsage = parseFloat(dailyUsageInput.value) || 0;
    const customRate = parseFloat(this.value) / (dailyUsage * 30); // Calculate custom rate
    const monthlyBill = parseFloat(this.value);
    document.getElementById('estimated-monthly-bill').textContent = monthlyBill.toFixed(2);
  });
  
  // Initialize UI elements
  updateSelectedAppliancesList();
  
  // Connect energy usage to system sizing
  dailyUsageInput.addEventListener('change', updateRecommendedSize);
  
  // ----- Panel Settings Visualization -----
  
  // Initialize noUiSlider for azimuth
  const azimuthSlider = document.getElementById('azimuth-slider');
  const azimuthInput = document.getElementById('azimuth');
  
  noUiSlider.create(azimuthSlider, {
    start: [0],
    connect: 'lower',
    step: 1,
    range: {
      'min': 0,
      'max': 359
    },
    format: {
      to: function (value) {
        return Math.round(value);
      },
      from: function (value) {
        return parseInt(value);
      }
    }
  });
  
  // Initialize noUiSlider for tilt
  const tiltSlider = document.getElementById('tilt-slider');
  const tiltInput = document.getElementById('tilt');
  
  noUiSlider.create(tiltSlider, {
    start: [10],
    connect: 'lower',
    step: 1,
    range: {
      'min': 0,
      'max': 90
    },
    format: {
      to: function (value) {
        return Math.round(value);
      },
      from: function (value) {
        return parseInt(value);
      }
    }
  });
  
  // Connect sliders to inputs
  azimuthSlider.noUiSlider.on('update', (values, handle) => {
    azimuthInput.value = values[handle];
    updatePanelModel();
    updateSunPosition(); // Update sun position when slider changes
  });
  
  tiltSlider.noUiSlider.on('update', (values, handle) => {
    tiltInput.value = values[handle];
    updatePanelModel();
    updateSunPosition(); // Update sun position when slider changes
  });
  
  // Connect inputs to sliders
  azimuthInput.addEventListener('change', function() {
    let value = parseInt(this.value);
    // Ensure value is within range
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 359) value = 359;
    
    azimuthSlider.noUiSlider.set(value);
    updatePanelModel();
    updateSunPosition(); // Update sun position when input changes
  });
  
  tiltInput.addEventListener('change', function() {
    let value = parseInt(this.value);
    // Ensure value is within range
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 90) value = 90;
    
    tiltSlider.noUiSlider.set(value);
    updatePanelModel();
    updateSunPosition(); // Update sun position when input changes
  });
  
  // Function to update sliders when values change programmatically
  function updateSliders() {
    azimuthSlider.noUiSlider.set(azimuthInput.value);
    tiltSlider.noUiSlider.set(tiltInput.value);
  }

  // Enhanced panel visualization with column and shadow
  function enhancePanelVisualization() {
    const panelVisualization = document.querySelector('.panel-visualization');
    
    // Don't modify if already enhanced
    if (document.querySelector('.panel-column')) return;
    
    // Remove old stand if exists
    const oldStand = document.querySelector('.panel-stand');
    if (oldStand) {
      oldStand.parentNode.removeChild(oldStand);
    }
    
    // Add panel column (replaces stand)
    const panelColumn = document.createElement('div');
    panelColumn.classList.add('panel-column');
    panelVisualization.appendChild(panelColumn);
    
    // Add panel shadow
    const panelShadow = document.createElement('div');
    panelShadow.classList.add('panel-shadow');
    panelVisualization.appendChild(panelShadow);
    
    // Add panel base/ground if not exists
    if (!document.querySelector('.panel-base')) {
      const panelBase = document.createElement('div');
      panelBase.classList.add('panel-base');
      panelVisualization.appendChild(panelBase);
    }
    
    // Enhance panel surface with grid cells
    const panelSurface = document.querySelector('.panel-surface');
    
    // Create solar panel grid pattern if not already done
    if (!document.querySelector('.panel-grid')) {
      const panelGrid = document.createElement('div');
      panelGrid.classList.add('panel-grid');
      
      // Create 3x4 grid of cells
      for (let i = 0; i < 12; i++) {
        const cell = document.createElement('div');
        cell.classList.add('panel-cell');
        panelGrid.appendChild(cell);
      }
      
      // Replace original panel surface with enhanced version
      panelSurface.innerHTML = '';
      panelSurface.appendChild(panelGrid);
    }
    
    // Add tilt angle indicator (but no axis labels)
    if (!document.querySelector('.tilt-indicator')) {
      const tiltIndicator = document.createElement('div');
      tiltIndicator.classList.add('tilt-indicator');
      
      const tiltArc = document.createElement('div');
      tiltArc.classList.add('tilt-arc');
      
      const tiltLine = document.createElement('div');
      tiltLine.classList.add('tilt-line');
      tiltArc.appendChild(tiltLine);
      
      const tiltValue = document.createElement('div');
      tiltValue.classList.add('tilt-value');
      tiltValue.textContent = '0°';
      
      tiltIndicator.appendChild(tiltArc);
      tiltIndicator.appendChild(tiltValue);
      
      panelVisualization.appendChild(tiltIndicator);
    }
    
    // Update initial positions
    updatePanelModel();
    updateSunPosition();
  }

  // Updated function to update 3D panel model with column and shadow
  function updatePanelModel() {
    const azimuth = parseInt(document.getElementById('azimuth').value);
    const tilt = parseInt(document.getElementById('tilt').value);
    
    const panelModel = document.getElementById('panel-model');
    const panelColumn = document.querySelector('.panel-column');
    const panelShadow = document.querySelector('.panel-shadow');
    const tiltLine = document.querySelector('.tilt-line');
    const tiltValue = document.querySelector('.tilt-value');
    
    // Update panel model rotation
    panelModel.style.transform = `translate(-50%, -80%) rotateX(${tilt * (60 / 90)}deg) rotateZ(${azimuth}deg)`;
    
    // Update panel column position based on azimuth
    if (panelColumn) {
      // Only rotate around Z-axis (vertical) based on azimuth
      panelColumn.style.transform = `translateX(-50%) rotateZ(${azimuth}deg)`;
    }
    
    // Update shadow based on tilt
    if (panelShadow) {
      // Scale shadow size based on tilt (more vertical = smaller shadow)
      const shadowWidth = 160 - (tilt / 90) * 60; // Decrease width as tilt increases
      const shadowOpacity = 0.7 - (tilt / 90) * 0.4; // Decrease opacity as tilt increases
      
      // Move shadow closer to the base as tilt increases
      const shadowBottom = 85 - (tilt / 90) * 30;
      
      panelShadow.style.width = `${shadowWidth}px`;
      panelShadow.style.opacity = shadowOpacity;
      panelShadow.style.bottom = `${shadowBottom}px`;
      panelShadow.style.transform = `translateX(-50%) rotateZ(${azimuth}deg)`;
    }
    
    // Update tilt indicator
    if (tiltLine) {
      tiltLine.style.transform = `rotate(${tilt}deg)`;
    }
    
    if (tiltValue) {
      tiltValue.textContent = `${tilt}°`;
    }
  }

  // Update sun position based on panel angles - Fixed position to avoid overlapping
  function updateSunPosition() {
    const sunIndicator = document.getElementById('sun-indicator');
    if (!sunIndicator) return;
    
    // Fixed position to avoid overlapping with base
    sunIndicator.style.left = '75%';
    sunIndicator.style.top = '25%';
  }

  // Add reset button to panel settings
  function addResetButton() {
    const panelControls = document.querySelector('.panel-controls');
    
    // Create reset button if it doesn't exist
    if (!document.getElementById('reset-panel-settings')) {
      const resetButton = document.createElement('button');
      resetButton.id = 'reset-panel-settings';
      resetButton.classList.add('prev-btn');
      resetButton.innerHTML = '<i class="fas fa-undo"></i> Reset to Optimal Settings';
      
      resetButton.addEventListener('click', function() {
        // Reset to original values
        document.getElementById("tilt").value = originalPanelSettings.tilt;
        document.getElementById("azimuth").value = originalPanelSettings.azimuth;
        
        // Update sliders
        updateSliders();
        
        // Update panel model and sun position
        updatePanelModel();
        updateSunPosition();
      });
      
      // Add to panel controls
      panelControls.appendChild(resetButton);
    }
  }
  
  // System Type Selection with default sizing
  const systemTypeCards = document.querySelectorAll('.system-type-card');
  const systemTypeSelect = document.getElementById('system-type');

  systemTypeCards.forEach(card => {
    card.addEventListener('click', function() {
      const value = this.getAttribute('data-value');
      
      // Update hidden select value
      systemTypeSelect.value = value;
      
      // Update visual selection
      systemTypeCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      
      // Update panel defaults based on new system type
      const { lat, lng } = marker.getLatLng();
      updatePanelDefaults(lat, lng);
      
      // Trigger change event for compatibility with existing code
      const event = new Event('change');
      systemTypeSelect.dispatchEvent(event);
    });
  });

  // Set initial selected system type
  systemTypeCards[0].classList.add('selected');
  
  // Variables for charts
  let monthlyProductionChart;
  
  // Panel Settings Calculate Button functionality
  const panelCalculateBtn = document.getElementById('panel-calculate-btn');
  if (panelCalculateBtn) {
    panelCalculateBtn.addEventListener("click", () => {
      showLoadingSpinner('Calculating solar system results...');
      
      const latlng = marker.getLatLng();
      const systemType = document.getElementById("system-type").value;
      const azimuth = parseFloat(document.getElementById("azimuth").value);
      const tilt = parseFloat(document.getElementById("tilt").value);
      const size = parseFloat(document.getElementById("system-size").value);
      const dailyUsage = parseFloat(document.getElementById("daily-usage").value);
      const electricBill = parseFloat(document.getElementById("electric-bill").value);
      const electricityRate = countryData[currentCountry].rate;

      const apiUrl = `https://api.globalsolaratlas.info/data/pvcalc?loc=${latlng.lat},${latlng.lng}`;

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
        // Request hourly data to get more accurate results
        hourlyOutputs: true
      };

      console.log("Requesting Solargis Data:", payload);

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          const annualData = data?.annual?.data;
          const monthlyData = data?.monthly?.data;
          const monthlyHourlyData = data?.['monthly-hourly']?.data; // Get monthly-hourly data

          console.log(monthlyHourlyData);

          if (!annualData || !monthlyData) throw new Error("Invalid response data");

          const annualOutput = annualData.PVOUT_total;
          const electricityRate = countryData[currentCountry].rate;
          const monthlySavings = (annualOutput / 12) * electricityRate;
          const annualSavings = annualOutput * electricityRate;
          const co2Saving20Years = annualOutput * 0.0007 * 20;
          const monthlyPVOUT = monthlyData.PVOUT_total;
          const GTI = annualData.GTI;
          
          // Calculate more accurate daily average using monthly-hourly data if available
          let dailyAverageOutput = (annualOutput / 365).toFixed(1);
          
          if (monthlyHourlyData && monthlyHourlyData.PVOUT_total) {
            // Get more accurate daily average from hourly data
            const hourlyTotal = calculateTotalFromHourlyData(monthlyHourlyData.PVOUT_total);
            if (hourlyTotal > 0) {
              dailyAverageOutput = (hourlyTotal / 365).toFixed(1);
              console.log("Using monthly-hourly data for daily average:", dailyAverageOutput);
            }
          }
          
          // Calculate currency conversion to AUD
          let convertedMonthlySavings = monthlySavings;
          // For currencies that have inverse exchange rates (like JPY, KRW)
          if (countryData[currentCountry].exchangeRate > 1) {
            convertedMonthlySavings = monthlySavings / countryData[currentCountry].exchangeRate;
          } else {
            convertedMonthlySavings = monthlySavings / countryData[currentCountry].exchangeRate;
          }
          
          // Set currency symbol and flag based on current country
          const currencySymbol = countryData[currentCountry].symbol;
          const countryFlag = countryData[currentCountry].flag;
          
          // Update basic results
          document.getElementById("annual-output").textContent = annualOutput.toFixed(1);
          document.getElementById("monthly-savings").textContent = monthlySavings.toFixed(0);
          document.getElementById("co2-saving").textContent = co2Saving20Years.toFixed(1);
          document.getElementById("gti").textContent = GTI ? `${GTI.toFixed(1)} kWh/m²` : "-";
          
          // Update country flag and display converted savings
          document.getElementById("country-flag").textContent = countryFlag;
          document.getElementById("currency-symbol-result").textContent = currencySymbol;
          document.getElementById("converted-savings").textContent = convertedMonthlySavings.toFixed(0);
          
          // Show/hide converted savings based on currency
          const convertedSavingsContainer = document.getElementById("converted-savings-container");
          if (currentCountry === "AU") {
            convertedSavingsContainer.style.display = "none";
          } else {
            convertedSavingsContainer.style.display = "block";
          }
          
          // Calculate and update additional results
          const annualSavingsFormatted = (annualSavings).toFixed(0);
          const co2EquivalentTrees = Math.round(co2Saving20Years * 45); // 1 ton CO2 ≈ 45 trees
          
          // Calculate system efficiency
          const systemEfficiency = ((annualOutput / (GTI * size)) * 100).toFixed(1);
          const performanceRatio = (systemEfficiency / 100 * 1.2).toFixed(2); // Performance ratio
          
          // Calculate energy self-sufficiency
          const dailyUsageValue = parseFloat(document.getElementById("daily-usage").value) || 0;
          const selfSufficiency = dailyUsageValue > 0 
            ? Math.min(100, ((dailyAverageOutput / dailyUsageValue) * 100).toFixed(0)) 
            : 0;
          
          // Update additional result displays
          document.getElementById("daily-average-output").textContent = `${dailyAverageOutput} kWh/day`;
          document.getElementById("annual-savings").textContent = `${currencySymbol}${annualSavingsFormatted} per year`;
          document.getElementById("co2-equivalent").textContent = `Equivalent to ${co2EquivalentTrees} trees planted`;
          document.getElementById("system-efficiency").textContent = systemEfficiency;
          document.getElementById("performance-ratio").textContent = `Performance ratio: ${performanceRatio}`;
          
          // Update technical details
          const systemTypeText = document.getElementById("system-type").options[document.getElementById("system-type").selectedIndex].text;
          document.getElementById("result-system-type").textContent = systemTypeText;
          document.getElementById("result-system-size").textContent = `${size} kWp`;
          document.getElementById("result-orientation").textContent = getAzimuthDirection(azimuth);
          document.getElementById("result-tilt").textContent = `${tilt}°`;
          document.getElementById("self-sufficiency").textContent = `${selfSufficiency}%`;
          document.getElementById("location-value").textContent = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
          document.getElementById("bill-savings-value").textContent = `${currencySymbol}${monthlySavings.toFixed(0)}`;
          
          // Update self-sufficiency meter
          const sufficiencyFill = document.getElementById("sufficiency-fill");
          const sufficiencyText = document.getElementById("sufficiency-text");
          const selfSufficiencyText = document.getElementById("self-sufficiency-text");
          
          if (sufficiencyFill && sufficiencyText && selfSufficiencyText) {
            sufficiencyFill.style.width = `${selfSufficiency}%`;
            sufficiencyText.textContent = `${selfSufficiency}%`;
            selfSufficiencyText.textContent = `${selfSufficiency}%`;
            
            // Adjust meter color based on sufficiency level
            if (selfSufficiency < 30) {
              sufficiencyFill.style.background = '#3498db';
            } else if (selfSufficiency < 70) {
              sufficiencyFill.style.background = 'linear-gradient(90deg, #3498db, #2ecc71)';
            } else {
              sufficiencyFill.style.background = '#2ecc71';
            }
          }
          
          // Update monthly production chart
          updateMonthlyProductionChart(monthlyPVOUT);
          
          // Update hourly profile charts using monthly-hourly data
          if (monthlyHourlyData) {
            updateHourlyProfileChartsWithMonthlyHourly(monthlyHourlyData, size);
          } else if (data?.hourly?.data?.PVOUT_hourly) {
            // Fallback to hourly data if monthly-hourly isn't available
            updateHourlyProfileCharts(data.hourly.data.PVOUT_hourly, size);
          } else {
            // Use sample data if no real hourly data is available
            generateSampleHourlyData(monthlyPVOUT, size);
          }
          
          // Initialize tooltips
          initializeTooltips();
          
          hideLoadingSpinner();
          // Navigate to results step
          navigateToStep(5);
        })
        .catch((error) => {
          console.error("Calculation failed:", error);
          hideLoadingSpinner();
          alert("Calculation failed. Please try again.");
        });
    });
  }

  // Initialize tooltips function
  function initializeTooltips() {
    // Initialize tooltips using tippy.js
    if (typeof tippy !== 'undefined') {
      tippy('.tooltip-container', {
        content: (reference) => reference.getAttribute('data-tooltip'),
        arrow: true,
        placement: 'top',
        theme: 'light',
        maxWidth: 300
      });
    }
  }

  // Helper function to calculate total from hourly data
  function calculateTotalFromHourlyData(hourlyData) {
    if (!Array.isArray(hourlyData)) return 0;
    
    return hourlyData.reduce((sum, value) => {
      if (value !== null && !isNaN(value)) {
        return sum + value;
      }
      return sum;
    }, 0);
  }

  // Function to convert azimuth angle to direction text
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

  // Enhanced function to update monthly production chart
  function updateMonthlyProductionChart(monthlyPVOUT) {
    const ctx = document.getElementById('monthly-production-chart');
    
    if (!ctx) return;
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Destroy existing chart if it exists
    if (monthlyProductionChart) {
      monthlyProductionChart.destroy();
    }
    
    // Create new chart with enhanced visuals
    monthlyProductionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Energy Production (kWh)',
          data: monthlyPVOUT,
          backgroundColor: function(context) {
            const value = context.dataset.data[context.dataIndex];
            const max = Math.max(...context.dataset.data);
            const alpha = 0.6 + (value / max) * 0.4;
            return `rgba(52, 152, 219, ${alpha})`;
          },
          borderColor: '#2980b9',
          borderWidth: 1,
          borderRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y.toFixed(1)} kWh`;
              },
              afterLabel: function(context) {
                const daysInMonth = getDaysInMonth(context.dataIndex);
                const dailyAvg = (context.parsed.y / daysInMonth).toFixed(1);
                return `Daily Average: ${dailyAvg} kWh/day`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Energy Production (kWh)'
            }
          }
        }
      }
    });
  }

  // Helper function to get days in month
  function getDaysInMonth(monthIndex) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[monthIndex];
  }

  // New function to update hourly profile charts using monthly-hourly data
  function updateHourlyProfileChartsWithMonthlyHourly(monthlyHourlyData, systemSize) {
    const hourlyCharts = document.querySelectorAll('.hourly-chart');
    
    hourlyCharts.forEach(canvas => {
      const month = parseInt(canvas.dataset.month);
      const ctx = canvas.getContext('2d');
      
      // Extract hourly profile data for this month from monthly-hourly data
      const hourlyValues = extractMonthlyHourlyProfile(monthlyHourlyData, month, systemSize);
      
      // Destroy existing chart if any
      if (canvas._chart) {
        canvas._chart.destroy();
      }
      
      // Create new chart with the data
      canvas._chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({length: 24}, (_, i) => i),
          datasets: [{
            label: 'Power Output',
            data: hourlyValues,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y.toFixed(1)} Wh`;
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: false
              },
              ticks: {
                callback: function(value, index, values) {
                  return index % 6 === 0 ? value : '';
                },
                font: {
                  size: 10
                }
              },
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              beginAtZero: true,
              ticks: {
                callback: function(value, index, values) {
                  return index === 0 ? '0' : '';
                },
                font: {
                  size: 10
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            }
          },
          hover: {
            mode: 'nearest',
            intersect: false
          },
          animation: {
            duration: 1000
          }
        }
      });
    });
  }

  // Function to extract hourly profile data from monthly-hourly data
  function extractMonthlyHourlyProfile(monthlyHourlyData, month, systemSize) {
    // Check if we have PVOUT_total data available
    if (monthlyHourlyData && monthlyHourlyData.PVOUT_total && Array.isArray(monthlyHourlyData.PVOUT_total)) {
      // monthlyHourlyData.PVOUT_total is a 2D array where each entry is an array of 24 hourly values for a month
      // We can directly access the month's hourly data if available
      if (monthlyHourlyData.PVOUT_total[month] && Array.isArray(monthlyHourlyData.PVOUT_total[month])) {
        // Get the hourly data for this specific month
        const monthHourlyData = monthlyHourlyData.PVOUT_total[month];
        
        // Process the hourly values
        return monthHourlyData.map(value => {
          // Handle null values
          if (value === null || value === undefined || isNaN(value)) {
            return 0;
          }
          
          // If the value already seems to be scaled to system size, return as is
          // Otherwise scale it
          return value;
        });
      }
    }
    
    console.warn("Could not find valid hourly data for month", month);
    
    // Fallback to sample data if extraction fails
    return generateSampleHourlyDataForMonth(month, systemSize);
  }

  // Helper function to calculate total days before a month
  function getDaysBeforeMonth(month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let totalDays = 0;
    
    for (let i = 0; i < month; i++) {
      totalDays += daysInMonth[i];
    }
    
    return totalDays;
  }

  // Function to update hourly profile charts (original, kept for backward compatibility)
  function updateHourlyProfileCharts(hourlyData, systemSize) {
    const hourlyCharts = document.querySelectorAll('.hourly-chart');
    const chartInstances = [];
    
    hourlyCharts.forEach(canvas => {
      const month = parseInt(canvas.dataset.month);
      const ctx = canvas.getContext('2d');
      
      // Extract hourly data for this month
      const hourlyValues = generateHourlyProfileForMonth(hourlyData, month, systemSize);
      
      // Destroy existing chart if any
      if (canvas._chart) {
        canvas._chart.destroy();
      }
      
      // Create new chart
      canvas._chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({length: 24}, (_, i) => i),
          datasets: [{
            label: 'Power Output',
            data: hourlyValues,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y.toFixed(1)} Wh`;
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: false
              },
              ticks: {
                callback: function(value, index, values) {
                  return index % 6 === 0 ? value : '';
                },
                font: {
                  size: 10
                }
              },
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              beginAtZero: true,
              ticks: {
                callback: function(value, index, values) {
                  return index === 0 ? '0' : '';
                },
                font: {
                  size: 10
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.2)'
              }
            }
          },
          hover: {
            mode: 'nearest',
            intersect: false
          },
          animation: {
            duration: 1000
          }
        }
      });
      
      chartInstances.push(canvas._chart);
    });
  }

  // Function to generate hourly profile for a month (original)
  function generateHourlyProfileForMonth(hourlyData, month, systemSize) {
    // If hourly data is provided by API
    if (Array.isArray(hourlyData) && hourlyData.length > 0) {
      // Filter data for the current month
      const monthStart = new Date(new Date().getFullYear(), month, 1).getTime();
      const monthEnd = new Date(new Date().getFullYear(), month + 1, 0).getTime();
      
      const monthData = hourlyData.filter(point => {
        const time = new Date(point.time).getTime();
        return time >= monthStart && time <= monthEnd;
      });
      
      // Aggregate data by hour
      const hourlyAvg = Array(24).fill(0);
      const hourlyCount = Array(24).fill(0);
      
      monthData.forEach(point => {
        const hour = new Date(point.time).getHours();
        hourlyAvg[hour] += point.value;
        hourlyCount[hour]++;
      });
      
      // Calculate averages and scale by system size
      return hourlyAvg.map((sum, i) => {
        return hourlyCount[i] > 0 ? (sum / hourlyCount[i]) * systemSize : 0;
      });
    } else {
      // Generate sample data if API doesn't provide hourly data
      return generateSampleHourlyDataForMonth(month, systemSize);
    }
  }
  // Sample hourly data generation (kept for fallback)
  function generateSampleHourlyDataForMonth(month, systemSize) {
    // Adjust sunrise/sunset times based on season
    const isSummerHalf = month >= 3 && month <= 8;
    const sunriseHour = isSummerHalf ? 5 : 7;
    const sunsetHour = isSummerHalf ? 19 : 17;
    const peakHour = isSummerHalf ? 12 : 11;
    
    // Seasonal factor adjustment (higher in summer, lower in winter)
    const seasonalFactor = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5];
    const factor = seasonalFactor[month];
    
    // Generate hourly data
    return Array.from({length: 24}, (_, hour) => {
      if (hour < sunriseHour || hour > sunsetHour) {
        return 0; // No output before sunrise or after sunset
      }
      
      // Generate a normal distribution curve based on sun height
      const dist = Math.exp(-Math.pow(hour - peakHour, 2) / 8);
      
      // Scale output based on system size and seasonal factor
      return dist * factor * systemSize * 200;
    });
  }

  // Function to generate sample hourly data for all months
  function generateSampleHourlyData(monthlyOutput, systemSize) {
    const hourlyCharts = document.querySelectorAll('.hourly-chart');
    
    hourlyCharts.forEach(canvas => {
      const month = parseInt(canvas.dataset.month);
      
      // Generate hourly data for this month
      const hourlyValues = generateSampleHourlyDataForMonth(month, systemSize);
      
      // Scale to match monthly output
      const totalMonthlyOutput = monthlyOutput[month];
      const currentTotal = hourlyValues.reduce((sum, val) => sum + val, 0) * 30; // Based on 30 days
      
      // Calculate scaling factor
      const scaleFactor = totalMonthlyOutput / (currentTotal || 1);
      
      // Apply scaling
      const scaledHourlyValues = hourlyValues.map(val => val * scaleFactor);
      
      // Update chart
      updateHourlyProfileChart(canvas, scaledHourlyValues);
    });
  }

  // Function to update individual hourly profile chart
  function updateHourlyProfileChart(canvas, hourlyValues) {
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (canvas._chart) {
      canvas._chart.destroy();
    }
    
    // Create new chart
    canvas._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({length: 24}, (_, i) => i),
        datasets: [{
          label: 'Power Output',
          data: hourlyValues,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y.toFixed(1)} Wh`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: false
            },
            ticks: {
              callback: function(value, index, values) {
                return index % 6 === 0 ? value : '';
              },
              font: {
                size: 10
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            ticks: {
              callback: function(value, index, values) {
                return index === 0 ? '0' : '';
              },
              font: {
                size: 10
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: false
        },
        animation: {
          duration: 1000
        }
      }
    });
  }

  // Event listeners for PDF export and share buttons
  document.addEventListener("DOMContentLoaded", function() {
    const exportPdfBtn = document.getElementById('export-pdf');
    const shareResultsBtn = document.getElementById('share-results');
    
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', function() {
        alert('PDF export functionality will be added soon.');
        // Actual implementation could use html2pdf.js or jsPDF library
      });
    }
    
    if (shareResultsBtn) {
      shareResultsBtn.addEventListener('click', function() {
        if (navigator.share) {
          // Use Web Share API (mobile browsers)
          navigator.share({
            title: 'My Solar Calculation Results',
            text: 'Check out my solar energy calculation results!',
            url: window.location.href
          }).catch((error) => console.log('Sharing failed', error));
        } else {
          // Copy link to clipboard
          alert('Result link copied to clipboard. (Demo functionality)');
        }
      });
    }
  });

  // Initialize the appliance grid with default items
  document.getElementById('selected-appliances-list').innerHTML = '<div class="no-results">No appliances selected</div>';
  
  // Set default state for system type cards
  document.querySelector(`.system-type-card[data-value="${systemTypeSelect.value}"]`).classList.add('selected');
  
  // Initialize with hidden appliance calculator
  applianceSection.style.display = 'none';
  
  // Set initial currency display
  updateCurrencyDisplay();
  
  // Initial recommended size update
  updateRecommendedSize();
  
  // Enhance panel visualization and add reset button
  enhancePanelVisualization();
  addResetButton();
  
  // Hide any axis labels that might be in the HTML
  setTimeout(() => {
    // Remove axis lines and labels
    const panelAxes = document.querySelectorAll('.panel-axis');
    panelAxes.forEach(axis => {
      if (axis) axis.style.display = 'none';
    });
    
    const axisLabels = document.querySelectorAll('.axis-label');
    axisLabels.forEach(label => {
      if (label) label.style.display = 'none';
    });
    
    // Fix the sun position to avoid overlap
    const sunIndicator = document.getElementById('sun-indicator');
    if (sunIndicator) {
      sunIndicator.style.left = '75%';
      sunIndicator.style.top = '25%';
    }
    
    // Remove Results Calculate button if it exists
    const resultsCalculateBtn = document.querySelector('#step-5 .calculate-btn');
    if (resultsCalculateBtn && resultsCalculateBtn.id !== 'panel-calculate-btn') {
      if (resultsCalculateBtn.parentNode) {
        resultsCalculateBtn.parentNode.removeChild(resultsCalculateBtn);
      }
    }

    // Initialize tooltips on page load
    initializeTooltips();
  }, 500);
  
  // Initial panel model update
  updatePanelModel();
  updateSunPosition();
});