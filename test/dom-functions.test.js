/**
 * @jest-environment jsdom
 */

const { checkEmptyAppliances,
    addAppliance, 
    filterAppliancesByCategory, 
    clearAllAppliances,
} = require("./basic-functions.js");

beforeEach(() => {
    document.body.innerHTML = `
    <div>
        <table class="appliance-table">
        <tbody id="appliance-list"></tbody>
        </table>
    </div>
    `;
});

// Test for empty appliance message
test('adds empty message if appliance list is empty', () => {
    checkEmptyAppliances();

    const msg = document.querySelector('.empty-appliance-message');
    expect(msg).not.toBeNull();
    expect(msg.textContent).toMatch(/No appliances selected yet/i);
});

test('removes empty message when appliances exist', () => {
    // add fake row to simulate appliance
    document.getElementById('appliance-list').innerHTML = '<tr><td>Item</td></tr>';

    // add message to correct position in DOM before checking removal
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-appliance-message';
    const applianceTable = document.querySelector('.appliance-table');
    applianceTable.parentNode.insertBefore(emptyMessage, applianceTable.nextSibling);

    checkEmptyAppliances();

    const msgAfter = document.querySelector('.empty-appliance-message');
    expect(msgAfter).toBeNull(); 
});

// Add Appliance Test
test('adds appliance row to table and marks item as active', () => {
    document.body.innerHTML = `
        <div>
            <table class="appliance-table"><tbody id="appliance-list"></tbody></table>
            <div class="appliance-item" data-title="TV" data-wattage="100" data-hour="2"></div>
        </div>
    `;

    const item = document.querySelector('.appliance-item');
    const list = document.getElementById('appliance-list');
    const mockCalc = jest.fn();

    addAppliance(item, list, mockCalc);

    expect(list.querySelector('tr')).not.toBeNull();
    expect(item.classList.contains('active')).toBe(true);
    expect(mockCalc).toHaveBeenCalled();
});

// Filter Appliances Test
test('filters appliances by category', () => {
    document.body.innerHTML = `
        <div>
            <div class="appliance-item" data-category="kitchen"></div>
            <div class="appliance-item" data-category="bedroom"></div>
        </div>
    `;
    const items = document.querySelectorAll('.appliance-item');

    filterAppliancesByCategory('kitchen', items);
    expect(items[0].style.display).toBe('');
    expect(items[1].style.display).toBe('none');
});

// Clear All Appliances Test
test('clears appliance list and resets states if confirmed', () => {
    document.body.innerHTML = `
        <table>
            <tbody id="appliance-list">
                <tr><td>Item</td></tr>
            </tbody>
        </table>
        <div class="appliance-item active"></div>
    `;

    const list = document.getElementById('appliance-list');
    const items = document.querySelectorAll('.appliance-item');
    const checkEmpty = jest.fn();
    const calcTotals = jest.fn();

    clearAllAppliances(list, items, checkEmpty, calcTotals, () => true);

    expect(list.innerHTML).toBe('');
    expect(items[0].classList.contains('active')).toBe(false);
    expect(checkEmpty).toHaveBeenCalled();
    expect(calcTotals).toHaveBeenCalled();
});


// Test for Currency Display Update
const { updateCurrencyDisplay, countryData } = require("./advanced-functions.js");

describe('updateCurrencyDisplay', () => {
    beforeEach(() => {
    document.body.innerHTML = `
        <span id="currency-symbol"></span>
        <span id="currency-symbol-bill"></span>
    `;
    });

    test('correctly displays PG currency', () => {
    updateCurrencyDisplay("PG", countryData);

    expect(document.getElementById("currency-symbol").textContent).toBe("PGK");
    expect(document.getElementById("currency-symbol-bill").textContent).toBe("K");
    });

    test('clears DOM for unsupported country like SB', () => {
    updateCurrencyDisplay("SB", countryData);

    expect(document.getElementById("currency-symbol").textContent).toBe("SBD");
    expect(document.getElementById("currency-symbol-bill").textContent).toBe("$");
    });
});

// Tests for Input Validation
const { fireEvent } = require('@testing-library/dom');

// Utility to set up the DOM which replicates the input fields from basic-calculator.js and basic.html
function setupDom() {
document.body.innerHTML = `
    <input type="number" id="reserve-days" value="1" min="0.5" max="10" step="0.5" />
    <input type="number" id="sun-hours" value="4" min="1" max="10" step="0.5" />
    <table><tbody id="appliance-list">
    <tr>
        <td><input class="quantity" type="number" value="1" min="1" max="99" /></td>
        <td><input class="wattage" type="number" value="100" min="1" /></td>
        <td><input class="hours-per-day" type="number" value="4" min="0.1" max="24" step="0.1" /></td>
    </tr>
    </tbody></table>
`;
}

describe('User Input Field Tests', () => {
beforeEach(() => {
    setupDom();
});

test('Reserve Days should accept numbers within 0.5 - 10', () => { // Reserve Days Test
    const input = document.getElementById('reserve-days');
    fireEvent.change(input, { target: { value: '5' } });
    expect(parseFloat(input.value)).toBe(5);
});

test('Reserve Days should reject numbers outside 0.5 - 10', () => { // Reserve Days Test for rejection
    const input = document.getElementById('reserve-days');
    fireEvent.change(input, { target: { value: '15' } });
    expect(parseFloat(input.value)).toBe(10);
});

test('Sun Hours should reject values above 10', () => { // Sun Hours Test
    const input = document.getElementById('sun-hours');
    fireEvent.change(input, { target: { value: '15' } });
    expect(parseFloat(input.value)).toBe(10); 
});

test('INTENTIONAL FAIL: Quantity should reject excessive values', () => { // Quantity Test
    const quantity = document.querySelector('.quantity');
    fireEvent.change(quantity, { target: { value: '99999' } });
    expect(parseInt(quantity.value)).toBeLessThanOrEqual(99); // This will fail currently
});

test('INTENTIONAL FAIL: Wattage should reject excessive values', () => { // Wattage Test
    const wattage = document.querySelector('.wattage');
    fireEvent.change(wattage, { target: { value: '99999' } });
    expect(parseInt(wattage.value)).toBeLessThanOrEqual(8000); // This will fail currently
});

test('Only numeric input is accepted for quantity', () => {
    const quantity = document.querySelector('.quantity');
    fireEvent.change(quantity, { target: { value: 'abc' } });
    expect(quantity.value).toBe(''); 
});
});