document.addEventListener("DOMContentLoaded", function() {
    // Cache DOM elements
    const applianceItems = document.querySelectorAll('.appliance-item');
    const applianceList = document.getElementById('appliance-list');
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const simultaneousUsage = document.getElementById('simultaneous-usage');
    const reserveDays = document.getElementById('reserve-days');
    const sunHours = document.getElementById('sun-hours');
    const templateButtons = document.querySelectorAll('.template-btn');

    // Show loading spinner
    function showLoadingSpinner(message = 'Calculating...') {
      document.getElementById('loading-message').textContent = message;
      document.getElementById('loading-overlay').style.display = 'flex';
    }
  
    // Hide loading spinner
    function hideLoadingSpinner() {
      document.getElementById('loading-overlay').style.display = 'none';
    }
    
    // Check if appliance list is empty and show message if needed
    function checkEmptyAppliances() {
      const applianceTable = document.querySelector('.appliance-table');
      const applianceRows = document.querySelectorAll('#appliance-list tr');
      const emptyMessageExists = document.querySelector('.empty-appliance-message');
      
      // If there are no appliances and no empty message yet
      if (applianceRows.length === 0 && !emptyMessageExists) {
        // Create empty state message
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-appliance-message';
        emptyMessage.innerHTML = `
          <i class="fas fa-plug"></i>
          <p>No appliances selected yet. Click on appliances from the right panel to add them to your calculation.</p>
        `;
        
        // Insert the message after the table
        applianceTable.parentNode.insertBefore(emptyMessage, applianceTable.nextSibling);
      } 
      // If there are appliances but the empty message still exists
      else if (applianceRows.length > 0 && emptyMessageExists) {
        emptyMessageExists.remove();
      }
    }
  
    // Add appliance to table
    function addAppliance(applianceItem, quantity = 1) {
      // Get appliance data
      const watt = applianceItem.dataset.wattage;
      const title = applianceItem.dataset.title;
      const hour = applianceItem.dataset.hour;
      const kwh = (watt * hour) / 1000;
      
      // Check if appliance already exists in the list
      const existingAppliances = document.querySelectorAll('.appliance-title');
      for (let i = 0; i < existingAppliances.length; i++) {
        if (existingAppliances[i].textContent === title) {
          // Increment quantity instead of adding a new row
          const quantityInput = existingAppliances[i].closest('tr').querySelector('.quantity');
          quantityInput.value = parseInt(quantityInput.value) + quantity;
          calculateTotals();
          return;
        }
      }
      
      // Create new row for the appliance
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="appliance-title">${title}</td>
        <td><input type="number" class="quantity" name="quantity[]" value="${quantity}" min="1" max="99"></td>
        <td><input type="number" class="wattage" name="wattage[]" value="${watt}" min="1"></td>
        <td><input type="number" class="hours-per-day" name="hours-per-day[]" value="${hour}" min="0.1" max="24" step="0.1"></td>
        <td><span class="daily-kwh">${(kwh * quantity).toFixed(2)}</span> kWh</td>
        <td><button class="remove-btn"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
      `;
      
      // Add row to table
      applianceList.appendChild(row);
      
      // Mark appliance as active
      applianceItem.classList.add('active');
      
      // Remove empty state message if it exists
      const emptyMessage = document.querySelector('.empty-appliance-message');
      if (emptyMessage) {
        emptyMessage.remove();
      }
      
      // Calculate new totals
      calculateTotals();
    }
  
    // Calculate totals for wattage and kWh
    function calculateTotals() {
      showLoadingSpinner('Calculating...');
      
      // Short delay to show the spinner (for better UX)
      setTimeout(() => {
        let totalWatt = 0;
        let totalKWh = 0;
        
        // Get all quantity inputs
        const quantities = document.querySelectorAll('.quantity');
        
        // Loop through each appliance row to calculate the total wattage and kWh
        for (let i = 0; i < quantities.length; i++) {
          const quantity = parseInt(quantities[i].value);
          const wattage = parseInt(quantities[i].closest('tr').querySelector('.wattage').value);
          const hour = parseFloat(quantities[i].closest('tr').querySelector('.hours-per-day').value);
          const kwh = (quantity * wattage * hour) / 1000;
          
          // Update the kWh display for this appliance
          quantities[i].closest('tr').querySelector('.daily-kwh').textContent = kwh.toFixed(2);
          
          // Add to the totals
          totalWatt += wattage * quantity;
          totalKWh += kwh;
        }
        
        // Update the total load (kW) and total kWh per day in the UI
        const kw = totalWatt / 1000;
        document.getElementById('total-load-kw').textContent = kw.toFixed(2);
        document.getElementById('total-kwh-per-day').textContent = totalKWh.toFixed(2);
        
        // Calculate system requirements
        calculateSystemRequirements(kw, totalKWh);
        
        // Update active state for each appliance
        updateApplianceActiveState();
        
        hideLoadingSpinner();
      }, 300);
    }
    
    // Calculate system requirements based on totals and settings
    function calculateSystemRequirements(totalKW, totalKWh) {
      // Get values from inputs
      const simUsage = parseFloat(simultaneousUsage.value) / 100;
      const batteryDays = parseFloat(reserveDays.value);
      const dailySunHours = parseFloat(sunHours.value);
      
      // Calculate inverter size based on the simultaneous usage percentage
      const inverterKW = totalKW * simUsage;
      
      // Calculate solar panel size
      const solarKW = totalKWh / dailySunHours;
      
      // Calculate battery capacity
      const batteryKWh = totalKWh * batteryDays;
      
      // Determine appropriate inverter size based on inverterKW value
      let inverterText = "0kVA Inverter";
      if (inverterKW <= 0) {
        inverterText = "0kVA Inverter";
      } else if (inverterKW < 3) {
        inverterText = "3kVA Inverter";
      } else if (inverterKW < 5) {
        inverterText = "5kVA Inverter";
      } else if (inverterKW < 8) {
        inverterText = "8kVA Inverter";
      } else if (inverterKW < 12) {
        inverterText = "15kVA Inverter";
      } else if (inverterKW < 16) {
        inverterText = "2x10kVA Inverter";
      } else if (inverterKW < 23) {
        inverterText = "2x15kVA Inverter";
      } else {
        inverterText = "Custom Solution Required";
      }
      document.getElementById('inverter-size').textContent = inverterText;
      
      // Determine the appropriate solar panel size based on solarKW
      let solarText = "0W";
      if (solarKW > 0 && solarKW < 2) {
        solarText = "6 x 275W";
      } else if (solarKW < 3) {
        solarText = "9 x 275W";
      } else if (solarKW < 5) {
        solarText = "10 x 390W";
      } else if (solarKW < 6) {
        solarText = "15 x 370W";
      } else if (solarKW < 8) {
        solarText = "18 x 390W";
      } else if (solarKW < 10) {
        solarText = "25 x 390W";
      } else if (solarKW < 14) {
        solarText = "35 x 390W";
      } else if (solarKW < 19) {
        solarText = "50 x 370W";
      } else if (solarKW >= 19) {
        solarText = "50+ Panels";
      }
      document.getElementById('solar-panel-size').textContent = solarText;
      
      // Determine the appropriate battery size based on batteryKWh
      let batteryText = "0kWh";
      if (batteryKWh > 50) {
        batteryText = "50+ kWh";
      } else if (batteryKWh > 40) {
        batteryText = "40 - 50kWh";
      } else if (batteryKWh > 30) {
        batteryText = "30 - 40kWh";
      } else if (batteryKWh > 25) {
        batteryText = "25 - 30kWh";
      } else if (batteryKWh > 20) {
        batteryText = "20 - 25kWh";
      } else if (batteryKWh > 15) {
        batteryText = "15 - 20kWh";
      } else if (batteryKWh > 10) {
        batteryText = "10 - 15kWh";
      } else if (batteryKWh > 7.5) {
        batteryText = "7.5 - 10kWh";
      } else if (batteryKWh > 5) {
        batteryText = "5 - 7.5kWh";
      } else if (batteryKWh > 2.5) {
        batteryText = "2.5 - 5kWh";
      } else if (batteryKWh > 0) {
        batteryText = "0 - 2.5kWh";
      }
      document.getElementById('battery-capacity').textContent = batteryText;
    }
    
    // Update active state for appliances
    function updateApplianceActiveState() {
      // Reset all appliances to inactive
      applianceItems.forEach(item => {
        item.classList.remove('active');
      });
      
      // Mark appliances in the list as active
      document.querySelectorAll('.appliance-title').forEach(titleElement => {
        const title = titleElement.textContent;
        applianceItems.forEach(item => {
          if (item.dataset.title === title) {
            item.classList.add('active');
          }
        });
      });
    }
    
    // Filter appliances by search term
    function filterAppliancesBySearch() {
      const searchTerm = searchInput.value.toLowerCase();
      
      applianceItems.forEach(item => {
        const title = item.dataset.title.toLowerCase();
        if (title.includes(searchTerm)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
    
    // Filter appliances by category
    function filterAppliancesByCategory(category) {
      applianceItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
    
    // Clear all appliances
    function clearAllAppliances() {
      // Show confirmation dialog if there are appliances
      if (applianceList.children.length > 0 && confirm('Are you sure you want to clear all appliances?')) {
        // Clear the appliance list
        applianceList.innerHTML = '';
        
        // Reset active states
        applianceItems.forEach(item => {
          item.classList.remove('active');
        });
        
        // Add empty state message
        checkEmptyAppliances();
        
        // Recalculate totals
        calculateTotals();
      }
    }
    
    // Apply template based on number of bedrooms
    function applyTemplate(bedrooms) {
      // Clear existing appliances
      clearAllAppliances();
      
      // Show loading spinner
      showLoadingSpinner('Loading template for ' + bedrooms + ' bedroom(s)...');
      
      setTimeout(() => {
        // Common appliances for all templates
        const commonAppliances = [
          { title: "Fridge/Freezer", quantity: 1 },
          { title: "TV (LED)", quantity: 1 },
          { title: "Microwave", quantity: 1 },
          { title: "Modem/Internet", quantity: 1 },
          { title: "Washing Machine", quantity: 1 }
        ];
        
        // Apply common appliances
        commonAppliances.forEach(item => {
          applianceItems.forEach(applianceItem => {
            if (applianceItem.dataset.title === item.title) {
              addAppliance(applianceItem, item.quantity);
            }
          });
        });
        
        // Apply bedroom-specific appliances
        switch (bedrooms) {
          case 1:
            addTemplateItems([
              { title: "Fan - Ceiling", quantity: 1 },
              { title: "Lights", quantity: 3 },
              { title: "Air Conditioner - Small", quantity: 1 }
            ]);
            break;
          case 2:
            addTemplateItems([
              { title: "Fan - Ceiling", quantity: 2 },
              { title: "Lights", quantity: 5 },
              { title: "Air Conditioner - Small", quantity: 1 },
              { title: "Laptop / Computers", quantity: 1 }
            ]);
            break;
          case 3:
            addTemplateItems([
              { title: "Fan - Ceiling", quantity: 3 },
              { title: "Lights", quantity: 8 },
              { title: "Air Conditioner - Large", quantity: 1 },
              { title: "Laptop / Computers", quantity: 2 },
              { title: "Dishwasher", quantity: 1 },
              { title: "Toaster", quantity: 1 }
            ]);
            break;
          case 4:
            addTemplateItems([
              { title: "Fan - Ceiling", quantity: 4 },
              { title: "Lights", quantity: 12 },
              { title: "Air Conditioner - Large", quantity: 1 },
              { title: "Air Conditioner - Small", quantity: 1 },
              { title: "Laptop / Computers", quantity: 2 },
              { title: "Dishwasher", quantity: 1 },
              { title: "Dryer", quantity: 1 },
              { title: "Coffee Machine", quantity: 1 },
              { title: "Toaster", quantity: 1 },
              { title: "Gaming Console", quantity: 1 }
            ]);
            break;
        }
        
        hideLoadingSpinner();
      }, 1000);
    }
    
    // Helper function to add template items
    function addTemplateItems(items) {
      items.forEach(item => {
        applianceItems.forEach(applianceItem => {
          if (applianceItem.dataset.title === item.title) {
            addAppliance(applianceItem, item.quantity);
          }
        });
      });
    }
    
    // Save configuration
    function saveConfiguration() {
      showLoadingSpinner('Saving configuration...');
      
      // Create configuration object to save
      const config = {
        appliances: [],
        settings: {
          simultaneousUsage: simultaneousUsage.value,
          reserveDays: reserveDays.value,
          sunHours: sunHours.value
        }
      };
      
      // Collect appliance data
      document.querySelectorAll('#appliance-list tr').forEach(row => {
        config.appliances.push({
          title: row.querySelector('.appliance-title').textContent,
          quantity: row.querySelector('.quantity').value,
          wattage: row.querySelector('.wattage').value,
          hours: row.querySelector('.hours-per-day').value
        });
      });
      
      // In a real implementation, save to localStorage or a server
      try {
        localStorage.setItem('solarCalculatorConfig', JSON.stringify(config));
        
        setTimeout(() => {
          alert('Configuration saved successfully!');
          hideLoadingSpinner();
        }, 1000);
      } catch (error) {
        console.error('Error saving configuration:', error);
        alert('Failed to save configuration. Please try again.');
        hideLoadingSpinner();
      }
    }
    
    // Load saved configuration if available
    function loadSavedConfiguration() {
      try {
        const savedConfig = localStorage.getItem('solarCalculatorConfig');
        
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          
          // Clear existing appliances
          applianceList.innerHTML = '';
          
          // Set settings
          if (config.settings) {
            simultaneousUsage.value = config.settings.simultaneousUsage || 50;
            reserveDays.value = config.settings.reserveDays || 1;
            sunHours.value = config.settings.sunHours || 4;
          }
          
          // Add appliances
          if (config.appliances && config.appliances.length > 0) {
            config.appliances.forEach(appliance => {
              // Find matching appliance item
              applianceItems.forEach(item => {
                if (item.dataset.title === appliance.title) {
                  // Create row manually since we need to set custom values
                  const row = document.createElement('tr');
                  row.innerHTML = `
                    <td class="appliance-title">${appliance.title}</td>
                    <td><input type="number" class="quantity" name="quantity[]" value="${appliance.quantity}" min="1" max="99"></td>
                    <td><input type="number" class="wattage" name="wattage[]" value="${appliance.wattage}" min="1"></td>
                    <td><input type="number" class="hours-per-day" name="hours-per-day[]" value="${appliance.hours}" min="0.1" max="24" step="0.1"></td>
                    <td><span class="daily-kwh">0</span> kWh</td>
                    <td><button class="remove-btn"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
                  `;
                  
                  // Add row to table
                  applianceList.appendChild(row);
                  
                  // Mark appliance as active
                  item.classList.add('active');
                }
              });
            });
          }
          
          // Check for empty state
          checkEmptyAppliances();
          
          // Calculate totals
          calculateTotals();
        } else {
          // If no saved configuration, ensure empty state is shown
          checkEmptyAppliances();
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        // Ensure empty state is shown if there's an error
        checkEmptyAppliances();
      }
    }
    
    // Event Listeners
    
    // Add click event for appliance items
    applianceItems.forEach(item => {
      item.addEventListener('click', function() {
        addAppliance(this);
      });
    });
    
    // Add input event for search
    searchInput.addEventListener('input', filterAppliancesBySearch);
    
    // Add click event for category buttons
    categoryButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active state
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Filter appliances
        filterAppliancesByCategory(this.dataset.category);
      });
    });
    
    // Add click event for clear all button
    clearAllBtn.addEventListener('click', clearAllAppliances);
    
    // Add click event for save config button
    saveConfigBtn.addEventListener('click', saveConfiguration);
    
    // Add click event for template buttons
    templateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const bedrooms = parseInt(this.dataset.bedrooms);
        applyTemplate(bedrooms);
      });
    });
    
    // Add input event for appliance inputs
    applianceList.addEventListener('input', function(e) {
      if (e.target.classList.contains('quantity') || 
          e.target.classList.contains('wattage') || 
          e.target.classList.contains('hours-per-day')) {
        calculateTotals();
      }
    });
    
    // Add click event for remove buttons
    applianceList.addEventListener('click', function(e) {
      if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
        // Get the row and remove it
        const row = e.target.closest('tr');
        row.remove();
        
        // Check if appliance list is empty
        checkEmptyAppliances();
        
        // Recalculate totals
        calculateTotals();
      }
    });
    
    // Add change event for system parameter inputs
    simultaneousUsage.addEventListener('change', calculateTotals);
    reserveDays.addEventListener('change', calculateTotals);
    sunHours.addEventListener('change', calculateTotals);
    
    // Load saved configuration on page load
    loadSavedConfiguration();
    
    // Initial calculation
    calculateTotals();
    
    // Initial check for empty appliances
    checkEmptyAppliances();
  });