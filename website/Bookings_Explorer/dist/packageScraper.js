"use strict";
/**
 * Package Scraper Module
 *
 * Deep extraction of booking package details including:
 * - Package names and descriptions
 * - Pricing (base, day-of-week variations, per-person)
 * - Inclusions (activities, food, drinks, equipment)
 * - Guest configurations
 * - Available add-ons
 * - Time slots and availability
 *
 * This module explores booking widgets thoroughly to capture
 * all bookable options with complete details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageScraper = void 0;
exports.scrapeBookingSystem = scrapeBookingSystem;
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// ============================================================================
// Main Package Scraper Class
// ============================================================================
class PackageScraper {
    page;
    screenshotDir;
    takeScreenshots;
    constructor(page, screenshotDir, takeScreenshots = true) {
        this.page = page;
        this.screenshotDir = screenshotDir;
        this.takeScreenshots = takeScreenshots;
    }
    /**
     * Scrape all packages from a booking system page
     */
    async scrapeBookingSystem(url) {
        const startTime = Date.now();
        console.log(`\n📦 Deep scraping booking system: ${url}`);
        // Navigate to booking page
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await (0, utils_1.waitForNetworkIdle)(this.page, 5000);
        await (0, utils_1.sleep)(2000); // Extra wait for dynamic content
        // Change date to a future weekend to see all packages
        // Saturday, January 17, 2026 - far enough to show all availability
        await this.selectTargetDate(2026, 1, 17);
        // Extract venue info
        const venueInfo = await this.extractVenueInfo();
        const venueName = venueInfo?.name || await this.page.title();
        // Detect platform
        const platform = await this.detectPlatform();
        console.log(`   Platform detected: ${platform || 'Unknown'}`);
        // Find all categories
        const categories = await this.extractCategories();
        console.log(`   Categories found: ${categories.join(', ') || 'None'}`);
        // Extract available dates
        const availableDates = await this.extractAvailableDates();
        // Take main screenshot
        let mainScreenshotPath = null;
        if (this.takeScreenshots) {
            mainScreenshotPath = await this.takeScreenshot('booking-main');
        }
        // Scrape all packages across categories
        const packages = await this.scrapeAllPackages(categories);
        console.log(`   Total packages found: ${packages.length}`);
        return {
            url,
            venueName,
            platform,
            categories,
            packages,
            availableDates,
            venueInfo,
            mainScreenshotPath,
            discoveredAt: (0, utils_1.getTimestamp)(),
            scrapeDurationMs: Date.now() - startTime,
        };
    }
    /**
     * Scrape all packages, optionally filtering by category
     */
    async scrapeAllPackages(categories) {
        const allPackages = [];
        const seenPackages = new Map(); // Dedupe by name
        // If categories exist, click through each one
        if (categories.length > 0) {
            for (const category of categories) {
                console.log(`\n   📂 Exploring category: ${category}`);
                await this.selectCategory(category);
                await (0, utils_1.sleep)(1000);
                const categoryPackages = await this.scrapeVisiblePackages(category);
                // Deduplicate: keep first occurrence, but merge categories
                for (const pkg of categoryPackages) {
                    const key = this.normalizePackageName(pkg.name);
                    if (seenPackages.has(key)) {
                        // Already seen this package - could merge categories if needed
                        const existing = seenPackages.get(key);
                        if (!existing.category.includes(category)) {
                            existing.category = `${existing.category}, ${category}`;
                        }
                    }
                    else {
                        seenPackages.set(key, pkg);
                        allPackages.push(pkg);
                    }
                }
            }
        }
        else {
            // No categories, just scrape what's visible
            const packages = await this.scrapeVisiblePackages('All');
            allPackages.push(...packages);
        }
        console.log(`   📊 Unique packages after deduplication: ${allPackages.length}`);
        return allPackages;
    }
    /**
     * Normalize package name for deduplication
     */
    normalizePackageName(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    /**
     * Scrape all visible packages on the current page
     */
    async scrapeVisiblePackages(category) {
        const packages = [];
        // Find package cards/containers
        const packageSelectors = [
            '.package-card', '.package-item', '.product-card', '.booking-card',
            '[data-package]', '[data-product]', '.experience-card',
            '.event-card', '.activity-card', '.offering-card',
            // Generic card patterns
            'article', '.card', '.item',
        ];
        let packageElements = [];
        for (const selector of packageSelectors) {
            const elements = await this.page.locator(selector).all();
            if (elements.length > 0) {
                // Verify these look like packages (have name + price typically)
                const looksLikePackages = await this.verifyPackageElements(elements);
                if (looksLikePackages) {
                    packageElements = elements;
                    console.log(`      Found ${elements.length} packages using: ${selector}`);
                    break;
                }
            }
        }
        // If no card-based packages found, try to extract from page structure
        if (packageElements.length === 0) {
            console.log(`      No card-based packages found, trying structured extraction...`);
            const structuredPackages = await this.extractStructuredPackages(category);
            return structuredPackages;
        }
        // Extract details from each package element
        for (let i = 0; i < packageElements.length; i++) {
            const element = packageElements[i];
            console.log(`      Scraping package ${i + 1}/${packageElements.length}...`);
            try {
                const pkg = await this.extractPackageFromElement(element, category, i);
                if (pkg && pkg.name) {
                    packages.push(pkg);
                    // Try to get more details by clicking into the package
                    const detailedPkg = await this.getPackageDetails(element, pkg);
                    if (detailedPkg) {
                        packages[packages.length - 1] = detailedPkg;
                    }
                }
            }
            catch (error) {
                console.log(`      ⚠️ Error extracting package ${i + 1}: ${error}`);
            }
        }
        return packages;
    }
    /**
     * Extract package info from a card/container element
     */
    async extractPackageFromElement(element, category, index) {
        try {
            // Get all text content
            const fullText = (0, utils_1.cleanText)(await element.textContent());
            if (!fullText)
                return null;
            // Extract name (usually first heading or strong text)
            const name = await this.extractPackageName(element);
            if (!name)
                return null;
            // Extract description
            const description = await this.extractDescription(element);
            // Extract pricing
            const pricing = await this.extractPricing(element, fullText);
            // Extract inclusions from the text
            const inclusions = this.parseInclusions(fullText);
            // Extract guest config
            const guestConfig = this.parseGuestConfig(fullText);
            // Extract duration
            const duration = this.parseDuration(fullText);
            // Get image if present
            const imageUrl = await this.extractImageUrl(element);
            // Take screenshot of this package
            let screenshotPath = null;
            if (this.takeScreenshots) {
                screenshotPath = await this.takeElementScreenshot(element, `package-${index}-${this.slugify(name)}`);
            }
            return {
                id: (0, utils_1.generateId)(),
                name,
                category,
                description,
                tagline: null,
                inclusions,
                pricing,
                guestConfig,
                duration,
                availableAddOns: [],
                restrictions: [],
                availableTimeSlots: [],
                imageUrl,
                bookingUrl: null,
                sourceUrl: this.page.url(), // Capture source URL for verification
                screenshotPath,
                rawContent: fullText.substring(0, 1000),
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Click into a package to get full details
     */
    async getPackageDetails(element, basePkg) {
        try {
            // Look for a "View Details", "Book Now", "Select" button
            const detailButtons = [
                element.locator('button:has-text("View")'),
                element.locator('button:has-text("Details")'),
                element.locator('button:has-text("Select")'),
                element.locator('button:has-text("Book")'),
                element.locator('a:has-text("View")'),
                element.locator('a:has-text("Details")'),
                element.locator('a:has-text("More")'),
            ];
            for (const btn of detailButtons) {
                if (await btn.first().isVisible().catch(() => false)) {
                    // Store current URL
                    const startUrl = this.page.url();
                    // Click to view details
                    await btn.first().click();
                    await (0, utils_1.sleep)(1500);
                    await (0, utils_1.waitForNetworkIdle)(this.page, 3000);
                    // Check if modal opened or page changed
                    const modalOpened = await this.page.locator('.modal:visible, [role="dialog"]:visible').first().isVisible().catch(() => false);
                    const pageChanged = this.page.url() !== startUrl;
                    if (modalOpened || pageChanged) {
                        // Extract detailed info
                        const detailedPkg = await this.extractDetailedPackageInfo(basePkg);
                        // Take screenshot of details
                        if (this.takeScreenshots) {
                            detailedPkg.screenshotPath = await this.takeScreenshot(`package-detail-${this.slugify(basePkg.name)}`);
                        }
                        // Close modal or go back
                        if (modalOpened) {
                            await this.page.locator('.modal .close, [role="dialog"] button[aria-label*="close"], .modal-close').first().click().catch(() => { });
                            await (0, utils_1.sleep)(500);
                        }
                        else if (pageChanged) {
                            await this.page.goBack();
                            await (0, utils_1.sleep)(1000);
                        }
                        return detailedPkg;
                    }
                    break;
                }
            }
        }
        catch {
            // Details extraction failed, return base package
        }
        return null;
    }
    /**
     * Extract detailed package info from a detail page/modal
     */
    async extractDetailedPackageInfo(basePkg) {
        const pkg = { ...basePkg };
        // Get full page/modal text
        const pageText = (0, utils_1.cleanText)(await this.page.locator('body').textContent());
        // Re-extract with more context available
        const inclusions = this.parseInclusions(pageText);
        if (inclusions.length > pkg.inclusions.length) {
            pkg.inclusions = inclusions;
        }
        // Look for pricing tables
        const pricingTable = await this.extractPricingTable();
        if (pricingTable.dayPricing.length > 0) {
            pkg.pricing = pricingTable;
        }
        // Extract add-ons
        pkg.availableAddOns = await this.extractAddOns();
        // Extract guest configuration
        const guestConfig = await this.extractGuestConfiguration();
        if (guestConfig.includedGuests || guestConfig.minimumGuests) {
            pkg.guestConfig = guestConfig;
        }
        // Look for restrictions/requirements
        pkg.restrictions = this.parseRestrictions(pageText);
        // Get description if not already set
        if (!pkg.description) {
            pkg.description = await this.extractDetailedDescription();
        }
        return pkg;
    }
    // ===========================================================================
    // Extraction Helpers
    // ===========================================================================
    async extractPackageName(element) {
        const nameSelectors = [
            'h1', 'h2', 'h3', 'h4',
            '.name', '.title', '.package-name', '.product-name',
            '[class*="title"]', '[class*="name"]',
            'strong', 'b',
        ];
        for (const selector of nameSelectors) {
            try {
                const nameEl = element.locator(selector).first();
                if (await nameEl.isVisible()) {
                    const text = (0, utils_1.cleanText)(await nameEl.textContent());
                    if (text && text.length > 2 && text.length < 100) {
                        return text;
                    }
                }
            }
            catch {
                continue;
            }
        }
        return null;
    }
    async extractDescription(element) {
        const descSelectors = [
            '.description', '.desc', 'p', '.summary', '.details',
            '[class*="description"]', '[class*="summary"]',
        ];
        for (const selector of descSelectors) {
            try {
                const descEl = element.locator(selector).first();
                if (await descEl.isVisible()) {
                    const text = (0, utils_1.cleanText)(await descEl.textContent());
                    if (text && text.length > 20) {
                        return text.substring(0, 500);
                    }
                }
            }
            catch {
                continue;
            }
        }
        return null;
    }
    async extractPricing(element, fullText) {
        const pricing = {
            basePrice: null,
            dayPricing: [],
            perPersonPrice: null,
            minimumSpend: null,
            depositRequired: null,
            notes: [],
            currency: '$',
        };
        // Extract all prices from text
        const priceMatches = fullText.match(/[\$£€][\d,]+(?:\.\d{2})?/g) || [];
        if (priceMatches.length === 1) {
            pricing.basePrice = priceMatches[0] || null;
        }
        else if (priceMatches.length >= 2) {
            // Multiple prices - likely day-of-week variations
            // Look for patterns like "Mon-Thu" / "Fri-Sun"
            const weekdayMatch = fullText.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[\s\-]*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)?[:\s]*[\$£€][\d,]+/gi);
            if (weekdayMatch) {
                for (const match of weekdayMatch) {
                    const price = (0, utils_1.extractPrice)(match);
                    const days = match.replace(/[\$£€][\d,]+(?:\.\d{2})?/g, '').trim();
                    if (price && days) {
                        pricing.dayPricing.push({ days, price });
                    }
                }
            }
            else {
                // Just use first price as base
                pricing.basePrice = priceMatches[0] || null;
            }
        }
        // Check for per-person pricing
        if (/per\s*(person|guest|player)/i.test(fullText)) {
            const ppMatch = fullText.match(/[\$£€][\d,]+(?:\.\d{2})?\s*(?:per|\/)\s*(?:person|guest|player)/i);
            if (ppMatch) {
                pricing.perPersonPrice = (0, utils_1.extractPrice)(ppMatch[0]);
            }
        }
        // Detect currency
        if (fullText.includes('£'))
            pricing.currency = '£';
        else if (fullText.includes('€'))
            pricing.currency = '€';
        return pricing;
    }
    async extractPricingTable() {
        const pricing = {
            basePrice: null,
            dayPricing: [],
            perPersonPrice: null,
            minimumSpend: null,
            depositRequired: null,
            notes: [],
            currency: '$',
        };
        // Look for pricing tables or grids
        const tableSelectors = [
            'table', '.pricing-table', '.price-grid', '.pricing',
            '[class*="pricing"]', '[class*="price"]',
        ];
        for (const selector of tableSelectors) {
            try {
                const table = this.page.locator(selector).first();
                if (await table.isVisible()) {
                    const text = (0, utils_1.cleanText)(await table.textContent());
                    // Parse day pricing patterns
                    const patterns = [
                        /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)[\s\-]*(to|-)?\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)?[:\s]*[\$£€][\d,]+/gi,
                        /(Weekday|Weekend|Week\s*day|Week\s*end)s?[:\s]*[\$£€][\d,]+/gi,
                    ];
                    for (const pattern of patterns) {
                        const matches = text.match(pattern);
                        if (matches) {
                            for (const match of matches) {
                                const price = (0, utils_1.extractPrice)(match);
                                const days = match.replace(/[\$£€][\d,]+(?:\.\d{2})?/g, '').replace(/[:\s]+$/, '').trim();
                                if (price && days) {
                                    pricing.dayPricing.push({ days, price });
                                }
                            }
                        }
                    }
                    if (pricing.dayPricing.length > 0)
                        break;
                }
            }
            catch {
                continue;
            }
        }
        return pricing;
    }
    parseInclusions(text) {
        const inclusions = [];
        // Common inclusion patterns
        const patterns = [
            // Activities
            { regex: /(\d+)\s*(?:hr|hour)s?\s*(bowling|bowl)/i, category: 'activity' },
            { regex: /(bowling|bowl)\s*(?:for)?\s*(\d+)\s*(?:hr|hour)/i, category: 'activity' },
            { regex: /(\d+)\s*(?:hr|hour|min|minute)s?\s*(VR|virtual reality|arcade|gaming|axe|ax)/i, category: 'activity' },
            { regex: /(unlimited|free)\s*(VR|arcade|gaming|play)/i, category: 'activity' },
            { regex: /(VR|XD|arcade)\s*(card|time|session)/i, category: 'activity' },
            // Food
            { regex: /(\d+)\s*(pizza|pie)s?/i, category: 'food' },
            { regex: /(pizza|food)\s*(platter|party|package)/i, category: 'food' },
            { regex: /(\d+)\s*(platter|tray)s?/i, category: 'food' },
            // Drinks
            { regex: /(\d+)\s*(pitcher|jug)s?/i, category: 'drink' },
            { regex: /(unlimited|free)\s*(soft drinks|soda|drinks)/i, category: 'drink' },
            // Equipment
            { regex: /(bowling\s*)?shoes?\s*(included|rental)?/i, category: 'equipment' },
            { regex: /(grip\s*)?socks?\s*(included|required)?/i, category: 'equipment' },
            // Tickets/prizes
            { regex: /(\d+[,\d]*)\s*(ticket|token)s?/i, category: 'tickets' },
            // Time
            { regex: /(\d+)\s*(hr|hour|min|minute)s?\s*(of\s*)?(play|fun|time|session)/i, category: 'time' },
            // Service
            { regex: /(party\s*)?(host|coordinator|attendant)/i, category: 'service' },
            { regex: /(dedicated|private)\s*(room|lane|area|space)/i, category: 'service' },
        ];
        for (const { regex, category } of patterns) {
            const matches = text.match(regex);
            if (matches) {
                inclusions.push({
                    item: matches[0].trim(),
                    quantity: matches[1] || null,
                    category,
                    details: null,
                });
            }
        }
        // Also look for bullet points or list items
        const listPattern = /[•\-\*]\s*([^•\-\*\n]+)/g;
        let listMatch;
        while ((listMatch = listPattern.exec(text)) !== null) {
            const item = (0, utils_1.cleanText)(listMatch[1]);
            if (item && item.length > 3 && item.length < 100) {
                // Avoid duplicates
                if (!inclusions.some(inc => inc.item.toLowerCase().includes(item.toLowerCase().substring(0, 20)))) {
                    inclusions.push({
                        item,
                        quantity: null,
                        category: this.categorizeInclusion(item),
                        details: null,
                    });
                }
            }
        }
        return inclusions;
    }
    categorizeInclusion(text) {
        const lower = text.toLowerCase();
        if (/bowl|vr|arcade|game|axe|throw|lane|play/.test(lower))
            return 'activity';
        if (/pizza|food|platter|meal|snack|wing|nacho/.test(lower))
            return 'food';
        if (/drink|pitcher|soda|beer|beverage/.test(lower))
            return 'drink';
        if (/shoe|sock|equipment|rental/.test(lower))
            return 'equipment';
        if (/ticket|token|prize|credit/.test(lower))
            return 'tickets';
        if (/hour|minute|time|duration/.test(lower))
            return 'time';
        if (/host|coordinator|attendant|server|private/.test(lower))
            return 'service';
        return 'other';
    }
    parseGuestConfig(text) {
        const config = {
            includedGuests: null,
            minimumGuests: null,
            maximumGuests: null,
            additionalGuestPrice: null,
            guestCategories: [],
        };
        // Included guests patterns
        const includedMatch = text.match(/(?:includes?|for|up to)\s*(\d+)\s*(?:guest|people|player|person)/i);
        if (includedMatch) {
            config.includedGuests = parseInt(includedMatch[1]);
        }
        // Min/max patterns
        const minMatch = text.match(/(?:minimum|min|at least)\s*(\d+)\s*(?:guest|people|player)/i);
        if (minMatch) {
            config.minimumGuests = parseInt(minMatch[1]);
        }
        const maxMatch = text.match(/(?:maximum|max|up to)\s*(\d+)\s*(?:guest|people|player)/i);
        if (maxMatch) {
            config.maximumGuests = parseInt(maxMatch[1]);
        }
        // Additional guest price
        const additionalMatch = text.match(/(?:additional|extra)\s*(?:guest|person|player)s?\s*[\$£€]?([\d,]+(?:\.\d{2})?)/i);
        if (additionalMatch) {
            config.additionalGuestPrice = additionalMatch[1].includes('$') ? additionalMatch[1] : `$${additionalMatch[1]}`;
        }
        return config;
    }
    parseDuration(text) {
        const durationMatch = text.match(/(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)s?(?:\s*(?:of|total|session))?/i);
        if (durationMatch) {
            return `${durationMatch[1]} ${durationMatch[2]}${parseInt(durationMatch[1]) > 1 ? 's' : ''}`;
        }
        return null;
    }
    parseRestrictions(text) {
        const restrictions = [];
        const patterns = [
            /(?:age|ages?)\s*(\d+)\s*(?:and\s*(?:up|over|older)|plus|\+)/i,
            /(?:minimum|min)\s*age\s*(?:of\s*)?(\d+)/i,
            /(?:must|required)\s*(?:be|have)\s*([^.]+)/i,
            /(?:not\s*(?:available|allowed))\s*([^.]+)/i,
            /(?:reservation|booking)\s*(?:required|needed)/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                restrictions.push(match[0].trim());
            }
        }
        return restrictions;
    }
    async extractAddOns() {
        const addOns = [];
        // Look for add-on sections
        const addOnSelectors = [
            '.add-ons', '.addons', '.extras', '.upgrades',
            '[class*="addon"]', '[class*="extra"]', '[class*="upgrade"]',
            '.options', '.enhancements',
        ];
        for (const selector of addOnSelectors) {
            try {
                const section = this.page.locator(selector).first();
                if (await section.isVisible()) {
                    const items = await section.locator('.item, .option, label, .addon-item').all();
                    for (const item of items) {
                        const text = (0, utils_1.cleanText)(await item.textContent());
                        const name = text.split(/[\$£€]/)[0].trim();
                        const price = (0, utils_1.extractPrice)(text);
                        if (name && name.length > 2) {
                            addOns.push({
                                name,
                                description: null,
                                price,
                                perPerson: /per\s*(person|guest)/i.test(text),
                                category: this.categorizeAddOn(name),
                                preSelected: await item.locator('input:checked').count() > 0,
                                maxQuantity: null,
                            });
                        }
                    }
                    if (addOns.length > 0)
                        break;
                }
            }
            catch {
                continue;
            }
        }
        return addOns;
    }
    categorizeAddOn(name) {
        const lower = name.toLowerCase();
        if (/pizza|food|platter|wing|nacho|cake/.test(lower))
            return 'food_drink';
        if (/drink|pitcher|soda|beer|beverage/.test(lower))
            return 'food_drink';
        if (/balloon|decoration|banner|theme/.test(lower))
            return 'decorations';
        if (/hour|minute|time|extend/.test(lower))
            return 'extra_time';
        if (/upgrade|premium|vip|deluxe/.test(lower))
            return 'upgrade';
        if (/sock|shoe|equipment/.test(lower))
            return 'equipment';
        if (/host|photo|service/.test(lower))
            return 'service';
        return 'other';
    }
    async extractGuestConfiguration() {
        const config = {
            includedGuests: null,
            minimumGuests: null,
            maximumGuests: null,
            additionalGuestPrice: null,
            guestCategories: [],
        };
        // Look for guest selectors
        const guestSelectors = [
            'input[name*="guest"]', 'input[name*="people"]',
            'select[name*="guest"]', 'select[name*="people"]',
            '.guest-count', '.people-selector',
        ];
        for (const selector of guestSelectors) {
            try {
                const el = this.page.locator(selector).first();
                if (await el.isVisible()) {
                    const min = await el.getAttribute('min');
                    const max = await el.getAttribute('max');
                    const value = await el.getAttribute('value');
                    if (min)
                        config.minimumGuests = parseInt(min);
                    if (max)
                        config.maximumGuests = parseInt(max);
                    if (value)
                        config.includedGuests = parseInt(value);
                    break;
                }
            }
            catch {
                continue;
            }
        }
        return config;
    }
    async extractDetailedDescription() {
        const descSelectors = [
            '.description', '.package-description', '.details', '.about',
            'p', '[class*="description"]',
        ];
        for (const selector of descSelectors) {
            try {
                const el = this.page.locator(selector).first();
                if (await el.isVisible()) {
                    const text = (0, utils_1.cleanText)(await el.textContent());
                    if (text && text.length > 50) {
                        return text.substring(0, 1000);
                    }
                }
            }
            catch {
                continue;
            }
        }
        return null;
    }
    async extractImageUrl(element) {
        try {
            const img = element.locator('img').first();
            if (await img.isVisible()) {
                return await img.getAttribute('src');
            }
        }
        catch {
            // No image
        }
        return null;
    }
    // ===========================================================================
    // Category & Navigation Helpers
    // ===========================================================================
    async extractCategories() {
        const categories = [];
        // Look for category tabs/buttons
        const categorySelectors = [
            '.category-tab', '.category-button', '.filter-button',
            '[role="tab"]', '.tab', '.pill',
            'button[data-category]', 'a[data-category]',
        ];
        for (const selector of categorySelectors) {
            try {
                const elements = await this.page.locator(selector).all();
                if (elements.length > 1) {
                    for (const el of elements) {
                        const text = (0, utils_1.cleanText)(await el.textContent());
                        if (text && text.length > 1 && text.length < 50 && text.toLowerCase() !== 'all') {
                            categories.push(text);
                        }
                    }
                    if (categories.length > 0)
                        break;
                }
            }
            catch {
                continue;
            }
        }
        return categories;
    }
    async selectCategory(category) {
        try {
            // Try to click a tab/button with this category name
            const categoryButton = this.page.locator(`button:has-text("${category}"), a:has-text("${category}"), [role="tab"]:has-text("${category}")`).first();
            if (await categoryButton.isVisible()) {
                await categoryButton.click();
                await (0, utils_1.sleep)(500);
                return true;
            }
        }
        catch {
            // Category selection failed
        }
        return false;
    }
    /**
     * Select a specific target date to see all available packages
     * This helps capture packages that are only available on certain days
     */
    async selectTargetDate(year, month, day) {
        const targetDate = new Date(year, month - 1, day); // month is 0-indexed
        const dateStr = targetDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        console.log(`   📅 Selecting date: ${dateStr}`);
        try {
            // Method 1: Try clicking a date dropdown/combobox
            const dateSelectors = [
                '[role="combobox"]', // Common for React dropdowns
                '.date-picker', '.datepicker',
                'select[name*="date"]',
                '[data-date]', '[data-calendar]',
                'input[type="date"]',
                'button:has-text("Select Date")',
                '.date-select', '.date-selector',
            ];
            for (const selector of dateSelectors) {
                const dateElement = this.page.locator(selector).first();
                if (await dateElement.isVisible().catch(() => false)) {
                    await dateElement.click();
                    await (0, utils_1.sleep)(1000);
                    // Wait for dropdown/calendar to appear
                    await (0, utils_1.sleep)(500);
                    // Try to find and click the target date
                    // Format varies: "17", "January 17", "17 January", "1/17/2026", etc.
                    const dateVariants = [
                        `${day}`, // Just the day number
                        `January ${day}`,
                        `${day} January`,
                        `Jan ${day}`,
                        `Saturday, January ${day}`,
                        `1/${day}/2026`,
                        `01/${day}/2026`,
                        `2026-01-${day.toString().padStart(2, '0')}`,
                    ];
                    for (const variant of dateVariants) {
                        // Try clicking an option with this text
                        const dateOption = this.page.locator(`text="${variant}"`).first();
                        if (await dateOption.isVisible().catch(() => false)) {
                            await dateOption.click();
                            await (0, utils_1.sleep)(1000);
                            await (0, utils_1.waitForNetworkIdle)(this.page, 3000);
                            console.log(`   ✅ Date selected: ${variant}`);
                            return true;
                        }
                        // Try option elements
                        const optionEl = this.page.locator(`option:has-text("${variant}")`).first();
                        if (await optionEl.isVisible().catch(() => false)) {
                            await this.page.selectOption(selector, { label: variant });
                            await (0, utils_1.sleep)(1000);
                            await (0, utils_1.waitForNetworkIdle)(this.page, 3000);
                            console.log(`   ✅ Date selected from dropdown: ${variant}`);
                            return true;
                        }
                    }
                    // Try navigating calendar months if it's a calendar picker
                    const navigated = await this.navigateCalendarToDate(year, month, day);
                    if (navigated) {
                        return true;
                    }
                    // Close any open dropdown by clicking elsewhere
                    await this.page.locator('body').click({ position: { x: 10, y: 10 } });
                    await (0, utils_1.sleep)(300);
                }
            }
            // Method 2: Try modifying URL parameters
            const currentUrl = this.page.url();
            if (currentUrl.includes('date=')) {
                const newUrl = currentUrl.replace(/date=\d{4}-\d{2}-\d{2}/, `date=${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                if (newUrl !== currentUrl) {
                    console.log(`   🔗 Navigating to URL with new date`);
                    await this.page.goto(newUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await (0, utils_1.waitForNetworkIdle)(this.page, 3000);
                    await (0, utils_1.sleep)(1000);
                    return true;
                }
            }
            // Method 3: Add date parameter if not present
            if (!currentUrl.includes('date=')) {
                const separator = currentUrl.includes('?') ? '&' : '?';
                const newUrl = `${currentUrl}${separator}date=${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                console.log(`   🔗 Adding date parameter to URL`);
                await this.page.goto(newUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await (0, utils_1.waitForNetworkIdle)(this.page, 3000);
                await (0, utils_1.sleep)(1000);
                return true;
            }
            console.log(`   ⚠️ Could not change date - continuing with current date`);
            return false;
        }
        catch (error) {
            console.log(`   ⚠️ Date selection error: ${error}`);
            return false;
        }
    }
    /**
     * Navigate a calendar picker to a specific month/year and click the day
     */
    async navigateCalendarToDate(year, month, day) {
        try {
            // Look for calendar navigation buttons
            const nextMonthBtn = this.page.locator('button[aria-label*="next"], button:has-text("›"), button:has-text(">"), .next-month, [data-action="next"]').first();
            const monthYearDisplay = this.page.locator('.month-year, .calendar-title, [class*="month"], [class*="header"]').first();
            // Navigate months until we reach the target
            let attempts = 0;
            const maxAttempts = 24; // Up to 2 years of navigation
            while (attempts < maxAttempts) {
                const displayText = await monthYearDisplay.textContent().catch(() => '') || '';
                // Check if we're at the right month/year
                if (displayText.includes('January') && displayText.includes('2026')) {
                    // Click the day
                    const dayBtn = this.page.locator(`button:has-text("${day}"), td:has-text("${day}"), [data-day="${day}"]`).first();
                    if (await dayBtn.isVisible().catch(() => false)) {
                        await dayBtn.click();
                        await (0, utils_1.sleep)(1000);
                        await (0, utils_1.waitForNetworkIdle)(this.page, 3000);
                        console.log(`   ✅ Calendar date selected: January ${day}, 2026`);
                        return true;
                    }
                }
                // Click next month
                if (await nextMonthBtn.isVisible().catch(() => false)) {
                    await nextMonthBtn.click();
                    await (0, utils_1.sleep)(300);
                    attempts++;
                }
                else {
                    break;
                }
            }
            return false;
        }
        catch {
            return false;
        }
    }
    async extractAvailableDates() {
        const dates = [];
        // Check for date dropdown
        try {
            const dateSelect = this.page.locator('select[name*="date"], .date-select, [data-date-picker]').first();
            if (await dateSelect.isVisible()) {
                const options = await dateSelect.locator('option').all();
                for (const opt of options.slice(0, 30)) {
                    const text = (0, utils_1.cleanText)(await opt.textContent());
                    if (text && !text.toLowerCase().includes('select')) {
                        dates.push(text);
                    }
                }
            }
        }
        catch {
            // No date dropdown
        }
        return dates;
    }
    async extractVenueInfo() {
        try {
            const info = {
                name: '',
                address: null,
                phone: null,
                email: null,
                hours: null,
            };
            // Look for venue name
            const nameEl = this.page.locator('h1, .venue-name, [class*="venue"]').first();
            info.name = (0, utils_1.cleanText)(await nameEl.textContent()) || '';
            // Look for address
            const addressEl = this.page.locator('.address, [class*="address"], [itemprop="address"]').first();
            if (await addressEl.isVisible().catch(() => false)) {
                info.address = (0, utils_1.cleanText)(await addressEl.textContent());
            }
            // Look for phone
            const phoneEl = this.page.locator('a[href^="tel:"], .phone, [class*="phone"]').first();
            if (await phoneEl.isVisible().catch(() => false)) {
                info.phone = (0, utils_1.cleanText)(await phoneEl.textContent());
            }
            return info.name ? info : null;
        }
        catch {
            return null;
        }
    }
    async detectPlatform() {
        const pageContent = await this.page.content();
        const url = this.page.url();
        // Check for known platforms
        if (url.includes('fareharbor'))
            return 'FareHarbor';
        if (url.includes('checkfront'))
            return 'Checkfront';
        if (url.includes('rezdy'))
            return 'Rezdy';
        if (url.includes('bookeo'))
            return 'Bookeo';
        if (pageContent.includes('runs on Rex') || pageContent.includes('rex-booking'))
            return 'Rex';
        if (pageContent.includes('FareHarbor'))
            return 'FareHarbor';
        if (pageContent.includes('powered by')) {
            const match = pageContent.match(/powered by\s*([A-Za-z]+)/i);
            if (match)
                return match[1];
        }
        return null;
    }
    async verifyPackageElements(elements) {
        // Check first element has package-like content (name + price)
        if (elements.length === 0)
            return false;
        try {
            const text = await elements[0].textContent();
            const hasPrice = /[\$£€][\d,]+/.test(text);
            const hasName = text.length > 10;
            return hasPrice && hasName;
        }
        catch {
            return false;
        }
    }
    async extractStructuredPackages(category) {
        // Fallback: Extract packages from page structure even without clear cards
        const packages = [];
        // Look for headings followed by descriptions and prices
        const headings = await this.page.locator('h2, h3, h4').all();
        for (const heading of headings) {
            try {
                const name = (0, utils_1.cleanText)(await heading.textContent());
                if (!name || name.length < 3 || name.length > 100)
                    continue;
                // Get sibling content
                const parent = heading.locator('xpath=..');
                const parentText = (0, utils_1.cleanText)(await parent.textContent());
                // Check if this looks like a package (has price)
                if (/[\$£€][\d,]+/.test(parentText)) {
                    const pricing = await this.extractPricing(parent, parentText);
                    const inclusions = this.parseInclusions(parentText);
                    const guestConfig = this.parseGuestConfig(parentText);
                    const duration = this.parseDuration(parentText);
                    packages.push({
                        id: (0, utils_1.generateId)(),
                        name,
                        category,
                        description: null,
                        tagline: null,
                        inclusions,
                        pricing,
                        guestConfig,
                        duration,
                        availableAddOns: [],
                        restrictions: [],
                        availableTimeSlots: [],
                        imageUrl: null,
                        bookingUrl: null,
                        sourceUrl: this.page.url(),
                        screenshotPath: null,
                        rawContent: parentText.substring(0, 500),
                    });
                }
            }
            catch {
                continue;
            }
        }
        return packages;
    }
    // ===========================================================================
    // Utility Methods
    // ===========================================================================
    async takeScreenshot(name) {
        try {
            await promises_1.default.mkdir(this.screenshotDir, { recursive: true });
            const filename = `${name}.png`;
            const filepath = path_1.default.join(this.screenshotDir, filename);
            await this.page.screenshot({ path: filepath, fullPage: false });
            return filepath;
        }
        catch {
            return null;
        }
    }
    async takeElementScreenshot(element, name) {
        try {
            await promises_1.default.mkdir(this.screenshotDir, { recursive: true });
            const filename = `${name}.png`;
            const filepath = path_1.default.join(this.screenshotDir, filename);
            await element.screenshot({ path: filepath });
            return filepath;
        }
        catch {
            return null;
        }
    }
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);
    }
}
exports.PackageScraper = PackageScraper;
// ============================================================================
// Convenience Function
// ============================================================================
async function scrapeBookingSystem(page, url, screenshotDir, takeScreenshots = true) {
    const scraper = new PackageScraper(page, screenshotDir, takeScreenshots);
    return scraper.scrapeBookingSystem(url);
}
//# sourceMappingURL=packageScraper.js.map