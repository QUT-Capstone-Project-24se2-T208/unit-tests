# Solar System Calculator Tests

This project contains unit tests for a solar system calculator application.

## Project Structure

The project consists of three main calculator modules:
- `standard-calculator.js`: Basic calculation functions for solar system requirements
- `advanced-calculator.js`: Advanced calculation functions including geolocation and API integrations
- `assistive-calculator.js`: Helper functions for simplified solar system calculations

## Installation

Install dependencies with:

```bash
npm install
```

## Running Tests

Run all tests with verbose output:

```bash
npm test
```

Generate a test coverage report:

```bash
npm run test:coverage
```

The coverage report is created in the `coverage` directory. To view the detailed report, open `coverage/lcov-report/index.html` in your web browser.

## Test Structure

The tests are organized by module:
- `test/standard-calculator.test.js`: Tests for standard calculator functions
- `test/advanced-calculator.test.js`: Tests for advanced calculator functions
- `test/assistive-calculator.test.js`: Tests for assistive calculator functions
- `test/dom-functions.test.js`: Tests for DOM manipulation functions

## Detailed Test Descriptions

### Standard Calculator Tests (23 tests)
Tests basic solar system calculation functionality, including:
- System requirements calculations for various home and installation sizes
- Total energy consumption calculations from appliance data
- Configuration save and load capabilities
- Input validation and error handling

### Advanced Calculator Tests (59 tests)
Tests complex calculation features, including:
- Country detection based on coordinates
- Geographic data processing and solar calculations
- Currency conversion and savings calculations
- Azimuth direction mapping
- Solar API integration with mocked responses
- Monthly and hourly solar profile extraction
- Day count and calendar calculations

### Assistive Calculator Tests (17 tests)
Tests simplified calculation workflows, including:
- System size calculations based on energy consumption
- Battery capacity calculations for different backup requirements
- Template-based appliance recommendations for various home sizes
- Energy consumption calculations from selected appliances

### DOM Functions Tests (17 tests)
Tests user interface interactions, including:
- Appliance selection and management in the UI
- Category filtering and display functionality
- Input validation for numeric fields
- UI state management and updates
- Currency display formatting

## Test Coverage Results

Current test coverage results:

| File                    | % Statements | % Branches | % Functions | % Lines | Uncovered Lines |
|-------------------------|--------------|------------|-------------|---------|-----------------|
| All files               | 96.20        | 92.42      | 100         | 98.77   |                 |
| advanced-calculator.js  | 98.30        | 97.17      | 100         | 98.13   | 29, 90          |
| assistive-calculator.js | 100          | 90         | 100         | 100     | 39-41           |
| standard-calculator.js  | 93.18        | 85.45      | 100         | 99.01   | 165             |

## Test Summary

- Total Test Suites: 4 passed, 4 total
- Total Tests: 116 passed, 116 total
- All tests are passing with excellent coverage across the codebase

## Key Testing Features

- Mock API for testing external services
- Complete DOM testing with jsdom environment
- Comprehensive edge case handling
- High branch coverage for conditional logic
- Isolated unit tests for each function

## Viewing Detailed Test Results

To see individual test results:

1. Run the tests with verbose output (default):
   ```bash
   npm test
   ```

2. Run tests for a specific module:
   ```bash
   npm test -- test/standard-calculator.test.js
   ```

3. Examine test files directly to see test cases and assertions