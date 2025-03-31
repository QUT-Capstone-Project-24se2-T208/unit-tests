# Solar System Calculator

This web page provides a comprehensive tool to calculate the required solar system based on various appliances.

## Overview

Our project aims to provide a solution to the people of Papua New Guinea and Solomon Islands who require simple and accessible information regarding solar power systems. The web page will provide immediate results and educational elements to assist the user in their consideration to move to a solar-powered home. 

## Getting Started

TBA

## API

This website uses the data available from the Solargis database. 

### Example API Query

```JavaScript
// The URL to fetch solar data for a specific latitude and longitude
const url = 'https://api.globalsolaratlas.info/data/lta?loc=-6.487254,145.156558';

// Function to fetch the data
async function fetchSolarData() {
  try {
    const response = await fetch(url);
    
    // If the response is successful, convert it to JSON
    if (response.ok) {
      const data = await response.json();
      console.log('Solar Data:', data);
    } else {
      console.error('Error fetching data:', response.status);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Call the function
fetchSolarData();

```

## Usage Guide

### Add Appliance

1. Select the appliances found in your home from the Appliance Menus. After you select, confirm that the appliances you selected appear on the results tab.
2. Repeat step 1 until all the appliances in your home are selected.

### Create Custom Appliances

1. Scroll to the bottom of the appliance menu and select **Custom Appliance**
2. To configure the custom appliance, head to the results tab and enter the **Quantity**, **Running Watts** and **Hours per Day**.

### Viewing Results

Results appear in the **System & Battery Results** tab. This tab includes information regarding the amount of Solar Panels required, the inverter size and appropriate battery capacity required.

### Advanced Mode

TBA

### Uploading Roof Images

TBA

### Requesting a Quote

TBA
