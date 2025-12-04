"use strict";
/**
 * DOM Extraction Module
 *
 * Extracts structured data from booking pages including:
 * - Group size controls and options
 * - Date/time pickers and available slots
 * - Add-ons and extras
 * - Form fields
 * - Pricing information
 *
 * Heuristics can be adjusted by modifying the selector constants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractGroupSizeConfig = extractGroupSizeConfig;
exports.extractAvailableDates = extractAvailableDates;
exports.extractAvailableTimes = extractAvailableTimes;
exports.extractAddOns = extractAddOns;
exports.extractFormFields = extractFormFields;
exports.extractPricing = extractPricing;
exports.extractStepOptions = extractStepOptions;
const utils_1 = require("./utils");
// ============================================================================
// Group Size Extraction
// ============================================================================
/**
 * Extract group size configuration from the current page
 */
async function extractGroupSizeConfig(page) {
    const config = {
        minimum: null,
        maximum: null,
        hasSeparatePaths: false,
        divergencePoint: null,
        availableOptions: [],
        categories: [],
    };
    let foundControls = false;
    // Look for number inputs related to guests/people
    const numberInputSelectors = [
        'input[type="number"][name*="guest"]',
        'input[type="number"][name*="people"]',
        'input[type="number"][name*="party"]',
        'input[type="number"][name*="player"]',
        'input[type="number"][name*="adult"]',
        'input[type="number"][name*="child"]',
        'input[type="number"][name*="group"]',
        'input[type="number"][name*="size"]',
    ];
    for (const selector of numberInputSelectors) {
        const input = page.locator(selector).first();
        try {
            if (await input.isVisible()) {
                foundControls = true;
                const min = await input.getAttribute('min');
                const max = await input.getAttribute('max');
                const value = await input.getAttribute('value');
                if (min)
                    config.minimum = parseInt(min);
                if (max)
                    config.maximum = parseInt(max);
                // Extract category from name
                const name = await input.getAttribute('name') || '';
                const category = await extractCategoryFromLabel(input, page);
                if (category) {
                    config.categories.push({
                        name: category,
                        min: min ? parseInt(min) : null,
                        max: max ? parseInt(max) : null,
                        default: value ? parseInt(value) : null,
                    });
                }
            }
        }
        catch {
            continue;
        }
    }
    // Look for stepper controls (+/- buttons)
    const stepperSelectors = [
        '.stepper', '.counter', '.qty-selector', '.quantity-selector',
        '[data-stepper]', '[data-counter]', '[data-quantity]',
        '.guest-selector', '.people-selector', '.party-size-selector',
    ];
    for (const selector of stepperSelectors) {
        try {
            const stepper = page.locator(selector).first();
            if (await stepper.isVisible()) {
                foundControls = true;
                // Try to find min/max from the stepper
                const minusBtn = stepper.locator('button:has-text("-"), [data-action="decrease"]').first();
                const plusBtn = stepper.locator('button:has-text("+"), [data-action="increase"]').first();
                const valueDisplay = stepper.locator('input, .value, .count').first();
                if (await valueDisplay.isVisible()) {
                    const value = await valueDisplay.inputValue().catch(() => valueDisplay.textContent().then(t => t?.trim() || null));
                    if (value && !isNaN(parseInt(value))) {
                        config.availableOptions.push(parseInt(value));
                    }
                }
            }
        }
        catch {
            continue;
        }
    }
    // Look for dropdown selectors
    const selectSelectors = [
        'select[name*="guest"]', 'select[name*="people"]', 'select[name*="party"]',
        'select[name*="size"]', 'select[name*="group"]', 'select[name*="player"]',
        '.guest-dropdown select', '.party-size select',
    ];
    for (const selector of selectSelectors) {
        try {
            const select = page.locator(selector).first();
            if (await select.isVisible()) {
                foundControls = true;
                const options = await select.locator('option').all();
                for (const option of options) {
                    const value = await option.getAttribute('value');
                    const text = await option.textContent();
                    if (value || text) {
                        const parsed = parseGroupSizeValue(value || text || '');
                        if (parsed !== null) {
                            config.availableOptions.push(parsed);
                            // Check for special values like "16+"
                            if (text && /\d+\+/.test(text)) {
                                config.hasSeparatePaths = true;
                                const match = text.match(/(\d+)\+/);
                                if (match) {
                                    config.divergencePoint = parseInt(match[1]);
                                    config.maximum = text.trim();
                                }
                            }
                        }
                    }
                }
            }
        }
        catch {
            continue;
        }
    }
    // Look for radio buttons / button groups
    const radioSelectors = [
        'input[type="radio"][name*="size"]',
        'input[type="radio"][name*="guest"]',
        'input[type="radio"][name*="party"]',
        '.size-option input[type="radio"]',
        '.group-size-option input[type="radio"]',
    ];
    for (const selector of radioSelectors) {
        try {
            const radios = await page.locator(selector).all();
            if (radios.length > 0) {
                foundControls = true;
                for (const radio of radios) {
                    const value = await radio.getAttribute('value');
                    const label = await radio.locator('xpath=..').textContent();
                    const parsed = parseGroupSizeValue(value || label || '');
                    if (parsed !== null) {
                        config.availableOptions.push(parsed);
                    }
                    // Check for large group indicators
                    if ((value || label || '').match(/16\+|large|corporate|private/i)) {
                        config.hasSeparatePaths = true;
                    }
                }
            }
        }
        catch {
            continue;
        }
    }
    // Derive min/max from available options
    if (config.availableOptions.length > 0) {
        const numericOptions = config.availableOptions.filter((v) => typeof v === 'number');
        if (numericOptions.length > 0) {
            if (config.minimum === null) {
                config.minimum = Math.min(...numericOptions);
            }
            if (config.maximum === null || typeof config.maximum === 'number') {
                const maxNumeric = Math.max(...numericOptions);
                if (config.maximum === null || maxNumeric > config.maximum) {
                    config.maximum = maxNumeric;
                }
            }
        }
    }
    return foundControls ? config : null;
}
/**
 * Parse a group size value from string
 */
function parseGroupSizeValue(value) {
    const trimmed = value.trim();
    // Check for "16+" style values
    if (/^\d+\+$/.test(trimmed)) {
        return trimmed;
    }
    // Try to extract number
    const match = trimmed.match(/(\d+)/);
    if (match) {
        return parseInt(match[1]);
    }
    // Check for text-based options
    if (/private|corporate|exclusive|large/i.test(trimmed)) {
        return trimmed;
    }
    return null;
}
/**
 * Extract category name from input label
 */
async function extractCategoryFromLabel(input, page) {
    try {
        // Check for associated label
        const id = await input.getAttribute('id');
        if (id) {
            const label = page.locator(`label[for="${id}"]`);
            if (await label.isVisible()) {
                return (0, utils_1.cleanText)(await label.textContent());
            }
        }
        // Check parent for label
        const parent = input.locator('xpath=..');
        const labelText = await parent.locator('label, .label, span').first().textContent();
        if (labelText) {
            return (0, utils_1.cleanText)(labelText);
        }
        // Use name attribute
        const name = await input.getAttribute('name');
        if (name) {
            return name.replace(/[_-]/g, ' ').replace(/^\w/, c => c.toUpperCase());
        }
    }
    catch {
        // Ignore errors
    }
    return null;
}
// ============================================================================
// Date/Time Extraction
// ============================================================================
/**
 * Extract available dates from a calendar/date picker
 */
async function extractAvailableDates(page) {
    const dates = [];
    // Look for calendar elements with available dates
    const calendarSelectors = [
        '.calendar .available', '.calendar .selectable',
        '.datepicker .day:not(.disabled)', '.datepicker td:not(.disabled)',
        '[data-date]:not([disabled])', '.date-slot:not(.unavailable)',
        '.react-datepicker__day:not(.react-datepicker__day--disabled)',
        '.flatpickr-day:not(.flatpickr-disabled)',
    ];
    for (const selector of calendarSelectors) {
        try {
            const elements = await page.locator(selector).all();
            for (const elem of elements.slice(0, 30)) { // Limit to first 30
                const dateAttr = await elem.getAttribute('data-date') ||
                    await elem.getAttribute('data-day') ||
                    await elem.getAttribute('aria-label');
                if (dateAttr) {
                    dates.push(dateAttr);
                }
                else {
                    const text = await elem.textContent();
                    if (text && /^\d{1,2}$/.test(text.trim())) {
                        // Just a day number - would need month context
                        dates.push(text.trim());
                    }
                }
            }
            if (dates.length > 0)
                break;
        }
        catch {
            continue;
        }
    }
    // Also check for date input
    const dateInput = page.locator('input[type="date"]').first();
    try {
        if (await dateInput.isVisible()) {
            const value = await dateInput.inputValue();
            if (value)
                dates.push(value);
        }
    }
    catch {
        // Ignore
    }
    return [...new Set(dates)];
}
/**
 * Extract available time slots from the page
 */
async function extractAvailableTimes(page) {
    const times = [];
    // Look for time slot elements
    const timeSelectors = [
        '.time-slot:not(.unavailable)', '.time-option:not(.disabled)',
        '[data-time]:not([disabled])', '.slot:not(.booked)',
        '.time-picker option', 'select[name*="time"] option',
        'input[type="time"]', '.available-time',
    ];
    for (const selector of timeSelectors) {
        try {
            const elements = await page.locator(selector).all();
            for (const elem of elements.slice(0, 20)) { // Limit to 20 times
                const timeAttr = await elem.getAttribute('data-time') ||
                    await elem.getAttribute('value');
                if (timeAttr) {
                    times.push(timeAttr);
                }
                else {
                    const text = await elem.textContent();
                    if (text && /\d{1,2}[:.]\d{2}/.test(text)) {
                        times.push((0, utils_1.cleanText)(text));
                    }
                }
            }
            if (times.length > 0)
                break;
        }
        catch {
            continue;
        }
    }
    return [...new Set(times)];
}
// ============================================================================
// Add-on Extraction
// ============================================================================
/**
 * Extract add-ons/extras from the current page
 */
async function extractAddOns(page) {
    const addOns = [];
    // Common add-on container selectors
    const containerSelectors = [
        '.add-ons', '.addons', '.extras', '.upgrades', '.options',
        '[data-addons]', '[data-extras]', '.upsell', '.upsells',
        '.additional-options', '.optional-extras',
    ];
    // First try to find add-on containers
    for (const containerSelector of containerSelectors) {
        try {
            const container = page.locator(containerSelector).first();
            if (await container.isVisible()) {
                // Look for individual add-on items within container
                const items = await container.locator('.addon, .extra, .option, .item, [data-addon], label, .card').all();
                for (const item of items) {
                    const addon = await extractSingleAddOn(item);
                    if (addon) {
                        addOns.push(addon);
                    }
                }
            }
        }
        catch {
            continue;
        }
    }
    // Also look for standalone checkboxes/toggles that might be add-ons
    const checkboxSelectors = [
        'input[type="checkbox"][name*="addon"]',
        'input[type="checkbox"][name*="extra"]',
        'input[type="checkbox"][name*="option"]',
        'input[type="checkbox"][name*="upgrade"]',
        '.addon input[type="checkbox"]',
    ];
    for (const selector of checkboxSelectors) {
        try {
            const checkboxes = await page.locator(selector).all();
            for (const checkbox of checkboxes) {
                const addon = await extractAddOnFromCheckbox(checkbox, page);
                if (addon && !addOns.some(a => a.name === addon.name)) {
                    addOns.push(addon);
                }
            }
        }
        catch {
            continue;
        }
    }
    return addOns;
}
/**
 * Extract a single add-on from an element
 */
async function extractSingleAddOn(element) {
    try {
        // Get text content
        const fullText = (0, utils_1.cleanText)(await element.textContent());
        if (!fullText || fullText.length < 3)
            return null;
        // Extract name (usually in heading or first text)
        const nameElement = element.locator('h3, h4, .name, .title, strong').first();
        let name = '';
        try {
            name = (0, utils_1.cleanText)(await nameElement.textContent());
        }
        catch {
            // Use first part of full text
            name = fullText.split(/[£$€\d]/)[0].trim().substring(0, 50);
        }
        if (!name)
            return null;
        // Extract description
        const descElement = element.locator('.description, .desc, p, .details').first();
        let description = null;
        try {
            description = (0, utils_1.cleanText)(await descElement.textContent());
        }
        catch {
            // No description found
        }
        // Extract price
        const price = (0, utils_1.extractPrice)(fullText);
        // Check if optional (has checkbox/toggle)
        const hasCheckbox = await element.locator('input[type="checkbox"]').count() > 0;
        const hasToggle = await element.locator('[role="switch"], .toggle').count() > 0;
        const optional = hasCheckbox || hasToggle;
        // Check if pre-selected
        let preSelected = false;
        try {
            const checkbox = element.locator('input[type="checkbox"]').first();
            preSelected = await checkbox.isChecked();
        }
        catch {
            // Not a checkbox
        }
        // Determine category
        const category = categorizeAddOn(name, description || '');
        // Build selector
        let selector = null;
        try {
            const id = await element.getAttribute('id');
            if (id) {
                selector = `#${id}`;
            }
            else {
                const dataAttr = await element.getAttribute('data-addon') ||
                    await element.getAttribute('data-id');
                if (dataAttr) {
                    selector = `[data-addon="${dataAttr}"], [data-id="${dataAttr}"]`;
                }
            }
        }
        catch {
            // No selector
        }
        return {
            name,
            description,
            price,
            optional,
            preSelected,
            category,
            selector,
        };
    }
    catch {
        return null;
    }
}
/**
 * Extract add-on from a checkbox element
 */
async function extractAddOnFromCheckbox(checkbox, page) {
    try {
        // Get label
        const id = await checkbox.getAttribute('id');
        let labelText = '';
        if (id) {
            const label = page.locator(`label[for="${id}"]`);
            labelText = (0, utils_1.cleanText)(await label.textContent());
        }
        if (!labelText) {
            // Try parent
            const parent = checkbox.locator('xpath=..');
            labelText = (0, utils_1.cleanText)(await parent.textContent());
        }
        if (!labelText || labelText.length < 3)
            return null;
        // Extract price from label
        const price = (0, utils_1.extractPrice)(labelText);
        // Clean name (remove price)
        const name = labelText.replace(/[£$€][\d.,]+/g, '').trim().substring(0, 50);
        return {
            name,
            description: null,
            price,
            optional: true,
            preSelected: await checkbox.isChecked(),
            category: categorizeAddOn(name, ''),
            selector: id ? `#${id}` : null,
        };
    }
    catch {
        return null;
    }
}
/**
 * Categorize an add-on based on its name and description
 */
function categorizeAddOn(name, description) {
    const text = `${name} ${description}`.toLowerCase();
    if (/food|meal|platter|pizza|snack|catering|lunch|dinner|breakfast/.test(text)) {
        return 'food_drink';
    }
    if (/drink|beverage|beer|wine|prosecco|champagne|soft drink|juice/.test(text)) {
        return 'food_drink';
    }
    if (/decoration|balloon|banner|party bag|party pack|theme/.test(text)) {
        return 'decorations';
    }
    if (/extra time|additional.*hour|extend|extension|longer/.test(text)) {
        return 'extra_time';
    }
    if (/upgrade|premium|vip|deluxe|enhanced/.test(text)) {
        return 'upgrade';
    }
    if (/sock|equipment|gear|rental|hire/.test(text)) {
        return 'equipment';
    }
    if (/host|instructor|coach|guide|photographer|photo/.test(text)) {
        return 'service';
    }
    return 'other';
}
// ============================================================================
// Form Field Extraction
// ============================================================================
/**
 * Extract form fields from the current page
 */
async function extractFormFields(page) {
    const fields = [];
    // Find all form inputs
    const inputSelectors = [
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
        'textarea',
        'select',
    ];
    for (const selector of inputSelectors) {
        try {
            const inputs = await page.locator(selector).all();
            for (const input of inputs) {
                if (!await input.isVisible())
                    continue;
                const field = await extractSingleFormField(input, page);
                if (field) {
                    fields.push(field);
                }
            }
        }
        catch {
            continue;
        }
    }
    return fields;
}
/**
 * Extract a single form field's details
 */
async function extractSingleFormField(input, page) {
    try {
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        const inputType = await input.getAttribute('type') || 'text';
        const name = await input.getAttribute('name') || '';
        const id = await input.getAttribute('id') || '';
        const placeholder = await input.getAttribute('placeholder');
        const required = await input.getAttribute('required') !== null ||
            await input.getAttribute('aria-required') === 'true';
        // Get label
        let labelText = '';
        if (id) {
            try {
                const label = page.locator(`label[for="${id}"]`);
                labelText = (0, utils_1.cleanText)(await label.textContent());
            }
            catch {
                // No label
            }
        }
        // Determine field type
        let type = 'text';
        if (tagName === 'select')
            type = 'select';
        else if (tagName === 'textarea')
            type = 'textarea';
        else if (inputType === 'email')
            type = 'email';
        else if (inputType === 'tel')
            type = 'phone';
        else if (inputType === 'number')
            type = 'number';
        else if (inputType === 'checkbox')
            type = 'checkbox';
        else if (inputType === 'radio')
            type = 'radio';
        else if (inputType === 'date')
            type = 'date';
        else if (inputType === 'time')
            type = 'time';
        else if (inputType === 'hidden')
            type = 'hidden';
        // Get options for select
        const options = [];
        if (tagName === 'select') {
            const optionElements = await input.locator('option').all();
            for (const opt of optionElements) {
                const text = await opt.textContent();
                if (text)
                    options.push((0, utils_1.cleanText)(text));
            }
        }
        // Build selector
        let selector = '';
        if (id)
            selector = `#${id}`;
        else if (name)
            selector = `[name="${name}"]`;
        else
            selector = `${tagName}[type="${inputType}"]`;
        return {
            name: labelText || name || placeholder || 'Unknown',
            type,
            required,
            placeholder,
            options,
            selector,
        };
    }
    catch {
        return null;
    }
}
// ============================================================================
// Pricing Extraction
// ============================================================================
/**
 * Extract pricing information from the page
 */
async function extractPricing(page) {
    const pricing = {
        basePrice: null,
        pricePerPerson: null,
        total: null,
        currency: '£',
    };
    let foundPricing = false;
    // Look for price elements
    const priceSelectors = [
        '.price', '.total', '.cost', '[data-price]',
        '.booking-total', '.order-total', '.summary-total',
        '.price-per-person', '.per-person', '.pp',
    ];
    for (const selector of priceSelectors) {
        try {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
                const text = await element.textContent();
                const price = (0, utils_1.extractPrice)(text || '');
                if (price) {
                    foundPricing = true;
                    // Determine which price field
                    const lowerSelector = selector.toLowerCase();
                    const lowerText = (text || '').toLowerCase();
                    if (lowerSelector.includes('total') || lowerText.includes('total')) {
                        pricing.total = price;
                    }
                    else if (lowerSelector.includes('per-person') || lowerText.includes('per person')) {
                        pricing.pricePerPerson = price;
                    }
                    else {
                        pricing.basePrice = price;
                    }
                    // Detect currency
                    if (price.includes('$'))
                        pricing.currency = '$';
                    else if (price.includes('€'))
                        pricing.currency = '€';
                    else if (price.includes('£'))
                        pricing.currency = '£';
                }
            }
        }
        catch {
            continue;
        }
    }
    return foundPricing ? pricing : null;
}
// ============================================================================
// Combined Step Options Extraction
// ============================================================================
/**
 * Extract all available options from the current step
 */
async function extractStepOptions(page) {
    const [dates, times, pricing] = await Promise.all([
        extractAvailableDates(page),
        extractAvailableTimes(page),
        extractPricing(page),
    ]);
    const options = {};
    if (dates.length > 0)
        options.dates = dates;
    if (times.length > 0)
        options.times = times;
    if (pricing)
        options.pricing = pricing;
    return options;
}
//# sourceMappingURL=extractors.js.map