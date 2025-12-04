"use strict";
/**
 * Booking Trigger Detection Module
 *
 * Detects potential booking entry points on a page by analyzing:
 * - Button and link text content
 * - Data attributes suggesting booking functionality
 * - Common booking widget patterns
 *
 * Heuristics can be adjusted by modifying the BOOKING_KEYWORDS,
 * DATA_ATTRIBUTE_PATTERNS, and CONFIDENCE_WEIGHTS constants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectBookingTriggers = detectBookingTriggers;
exports.detectBookingWidget = detectBookingWidget;
exports.isBookingLandingPage = isBookingLandingPage;
exports.detectLargeGroupIndicators = detectLargeGroupIndicators;
const utils_1 = require("./utils");
// ============================================================================
// Detection Configuration
// ============================================================================
/**
 * Keywords that suggest booking functionality
 * Adjust this list for specific industries/sites
 */
const BOOKING_KEYWORDS = [
    // Direct booking terms
    'book', 'booking', 'book now', 'book online',
    'reserve', 'reservation', 'make a reservation',
    // Ticket/purchase terms
    'buy tickets', 'buy now', 'purchase', 'get tickets',
    'tickets', 'ticket', 'purchase tickets', 'purchase ticket',
    'check availability', 'view availability',
    // Event terms
    'register', 'sign up', 'rsvp', 'attend',
    'event tickets', 'event registration', 'more info & ticket',
    // Enquiry terms
    'enquire', 'enquiry', 'enquire now', 'make an enquiry',
    'request', 'request a quote', 'get a quote',
    // Group/party terms
    'party booking', 'book a party', 'party packages',
    'group booking', 'book for groups', 'group enquiry',
    'function', 'functions', 'book a function',
    'corporate', 'corporate booking', 'corporate events',
    'private hire', 'exclusive hire',
    // Action terms
    'schedule', 'schedule now', 'book appointment',
    'add to cart', 'select', 'choose',
];
/**
 * Data attribute patterns that suggest booking functionality
 */
const DATA_ATTRIBUTE_PATTERNS = [
    /book/i,
    /reserv/i,
    /checkout/i,
    /cart/i,
    /ticket/i,
    /enquir/i,
    /modal.*book/i,
    /open.*book/i,
    /toggle.*book/i,
];
/**
 * URL patterns that suggest booking destinations
 */
const BOOKING_URL_PATTERNS = [
    /\/book/i,
    /\/booking/i,
    /\/reserv/i,
    /\/checkout/i,
    /\/tickets?/i,
    /\/enquir/i,
    /\/party/i,
    /\/groups?/i,
    /\/events?/i,
    /\/functions?/i,
    /\/package/i, // Common booking path
    /\/experiences?/i, // Experience booking
    /\/activities?/i, // Activity booking
    /\/schedule/i, // Scheduling
    /\/availability/i, // Availability check
    /\/register/i, // Event registration
    /\/rsvp/i, // RSVP
    /eventbrite/i, // Third-party ticketing
    /ticketmaster/i,
    /universe\.com/i,
    /eventcreate/i,
    /splash/i,
];
/**
 * Confidence weights for different signals
 */
const CONFIDENCE_WEIGHTS = {
    exactKeywordMatch: 0.4,
    partialKeywordMatch: 0.2,
    dataAttributeMatch: 0.2,
    urlPatternMatch: 0.15,
    prominentPlacement: 0.05,
};
// ============================================================================
// Main Detection Function
// ============================================================================
/**
 * Detect all potential booking triggers on the current page
 */
async function detectBookingTriggers(page, sourceUrl) {
    const triggers = [];
    // Selectors for potential booking elements
    const selectors = [
        'a', 'button', '[role="button"]',
        'input[type="submit"]', 'input[type="button"]',
        '[data-booking]', '[data-book]', '[data-reserve]',
        '.book-btn', '.booking-btn', '.reserve-btn',
        '.cta', '.call-to-action',
    ];
    for (const selector of selectors) {
        try {
            const elements = await page.locator(selector).all();
            for (const element of elements) {
                const trigger = await analyzeElement(element, sourceUrl);
                if (trigger && trigger.confidence >= 0.3) {
                    triggers.push(trigger);
                }
            }
        }
        catch {
            // Skip selector if it fails
        }
    }
    // Sort by confidence (highest first) and deduplicate
    return deduplicateAndSort(triggers);
}
/**
 * Analyze a single element to determine if it's a booking trigger
 */
async function analyzeElement(locator, sourceUrl) {
    try {
        const info = await (0, utils_1.getElementInfo)(locator);
        if (!info || !info.isVisible) {
            return null;
        }
        const text = (0, utils_1.cleanText)(info.text);
        if (!text || text.length > 100) {
            // Skip empty or overly long text (probably not a button)
            return null;
        }
        // Calculate confidence score
        let confidence = 0;
        // Check for exact keyword matches
        const lowerText = text.toLowerCase();
        if (BOOKING_KEYWORDS.some(kw => lowerText === kw)) {
            confidence += CONFIDENCE_WEIGHTS.exactKeywordMatch;
        }
        // Check for partial keyword matches
        if (BOOKING_KEYWORDS.some(kw => lowerText.includes(kw))) {
            confidence += CONFIDENCE_WEIGHTS.partialKeywordMatch;
        }
        // Check data attributes
        const dataAttrs = Object.entries(info.attributes)
            .filter(([key]) => key.startsWith('data-'))
            .map(([key, value]) => `${key}=${value}`);
        if (dataAttrs.some(attr => DATA_ATTRIBUTE_PATTERNS.some(pattern => pattern.test(attr)))) {
            confidence += CONFIDENCE_WEIGHTS.dataAttributeMatch;
        }
        // Check href for booking URL patterns
        const href = info.attributes.href || null;
        if (href && BOOKING_URL_PATTERNS.some(pattern => pattern.test(href))) {
            confidence += CONFIDENCE_WEIGHTS.urlPatternMatch;
        }
        // Check for prominent placement (large, centered, colorful)
        if (info.boundingBox) {
            const { width, height, x } = info.boundingBox;
            const isLarge = width > 100 && height > 30;
            const isCentered = x > 200 && x < 1000; // Rough center check
            if (isLarge && isCentered) {
                confidence += CONFIDENCE_WEIGHTS.prominentPlacement;
            }
        }
        // Skip if no confidence
        if (confidence === 0) {
            return null;
        }
        // Build selector
        const selector = await (0, utils_1.buildSelector)(locator);
        // Extract data attributes into a record
        const dataAttributes = {};
        for (const [key, value] of Object.entries(info.attributes)) {
            if (key.startsWith('data-')) {
                dataAttributes[key] = value;
            }
        }
        // Determine trigger type
        let triggerType = 'unknown';
        if (info.tagName === 'a')
            triggerType = 'link';
        else if (info.tagName === 'button' || info.tagName === 'input')
            triggerType = 'button';
        else if (info.tagName === 'form')
            triggerType = 'form';
        return {
            id: (0, utils_1.generateId)(),
            text,
            selector,
            tagName: info.tagName,
            sourceUrl,
            href,
            confidence,
            dataAttributes,
            triggerType,
        };
    }
    catch {
        return null;
    }
}
/**
 * Remove duplicates and sort by confidence
 */
function deduplicateAndSort(triggers) {
    const seen = new Set();
    const unique = [];
    for (const trigger of triggers) {
        // Key based on text and general location
        const key = `${trigger.text.toLowerCase()}|${trigger.tagName}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(trigger);
        }
    }
    // Sort by confidence descending
    return unique.sort((a, b) => b.confidence - a.confidence);
}
// ============================================================================
// Specialized Detection Functions
// ============================================================================
/**
 * Detect if current page contains a booking widget/form
 */
async function detectBookingWidget(page) {
    const widgetIndicators = [
        // Calendar/date pickers
        '.calendar', '[data-calendar]', '.date-picker', '.datepicker',
        'input[type="date"]', '[role="calendar"]',
        // Time selection
        '.time-picker', '.timepicker', '.time-slots', '.time-slot',
        // Group size
        '.party-size', '.group-size', '.guest-count', '.people-selector',
        'input[name*="guest"]', 'input[name*="people"]', 'select[name*="size"]',
        // Booking forms
        'form[action*="book"]', 'form[action*="reserv"]',
        '#booking-form', '.booking-form', '[data-booking-form]',
        // Package/product selection (common in modern booking systems)
        '[class*="package"]', '[class*="Package"]',
        '[data-package]', '[data-product]',
        // Price displays
        '[class*="price"]', '[class*="Price"]',
        // Select date text indicators
        'text=/select.*date/i', 'text=/choose.*date/i',
        'text=/pick.*date/i', 'text=/select.*time/i',
        // Tab-based booking interfaces
        '[role="tablist"]', '[role="tab"]',
        // Common booking widget containers
        '.booking-widget', '.reservation-widget',
        '[class*="booking"]', '[class*="reservation"]',
    ];
    for (const selector of widgetIndicators) {
        try {
            const visible = await page.locator(selector).first().isVisible();
            if (visible) {
                return true;
            }
        }
        catch {
            continue;
        }
    }
    // Also check page content for booking-related text
    try {
        const pageText = await page.locator('body').textContent();
        if (pageText) {
            const bookingPhrases = [
                /select.*date/i,
                /choose.*package/i,
                /book.*now/i,
                /reservation/i,
                /party.*package/i,
                /event.*package/i,
                /per\s*person/i,
                /guests?.*included/i,
            ];
            if (bookingPhrases.some(phrase => phrase.test(pageText))) {
                return true;
            }
        }
    }
    catch {
        // Ignore text check errors
    }
    return false;
}
/**
 * Detect if current page is a booking landing page
 */
async function isBookingLandingPage(page) {
    // Check URL
    const url = page.url().toLowerCase();
    if (BOOKING_URL_PATTERNS.some(pattern => pattern.test(url))) {
        return true;
    }
    // Check for booking widget
    return detectBookingWidget(page);
}
/**
 * Detect large group / corporate booking indicators
 */
async function detectLargeGroupIndicators(page) {
    const indicators = [
        { selector: 'text=/16\\+/i', label: '16+' },
        { selector: 'text=/large group/i', label: 'Large group' },
        { selector: 'text=/corporate/i', label: 'Corporate' },
        { selector: 'text=/private hire/i', label: 'Private hire' },
        { selector: 'text=/exclusive/i', label: 'Exclusive' },
        { selector: 'text=/function/i', label: 'Function' },
        { selector: 'text=/20\\+ (people|guests|players)/i', label: '20+' },
        { selector: 'option:has-text("16+")', label: '16+ dropdown' },
        { selector: 'button:has-text("16+")', label: '16+ button' },
    ];
    for (const { selector, label } of indicators) {
        try {
            const visible = await page.locator(selector).first().isVisible();
            if (visible) {
                return { hasLargeGroupOption: true, indicator: label };
            }
        }
        catch {
            continue;
        }
    }
    return { hasLargeGroupOption: false, indicator: null };
}
//# sourceMappingURL=detectors.js.map