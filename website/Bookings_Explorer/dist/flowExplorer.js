"use strict";
/**
 * Booking Flow Explorer Module
 *
 * Explores individual booking flows by:
 * - Navigating through each step of the booking process
 * - Deep scraping all bookable packages with full details
 * - Testing different group sizes (min and max)
 * - Detecting and recording add-ons at each step
 * - Identifying divergent paths for large groups
 * - Stopping before payment completion
 *
 * The explorer creates isolated browser contexts for each flow
 * to avoid state pollution between explorations.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowExplorer = void 0;
exports.exploreBookingFlows = exploreBookingFlows;
const extractors_1 = require("./extractors");
const detectors_1 = require("./detectors");
const utils_1 = require("./utils");
const packageScraper_1 = require("./packageScraper");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// ============================================================================
// Flow Explorer Class
// ============================================================================
class FlowExplorer {
    browser;
    config;
    screenshotDir;
    exploredDestinations = new Set();
    bookingSystemDiscoveries = new Map();
    constructor(browser, config) {
        this.browser = browser;
        this.config = config;
        this.screenshotDir = path_1.default.join(config.outputDir, 'screenshots');
    }
    /**
     * Get all discovered booking systems with package details
     */
    getBookingSystemDiscoveries() {
        return Array.from(this.bookingSystemDiscoveries.values());
    }
    /**
     * Filter out false positive triggers (social media, etc.)
     */
    filterTriggers(triggers) {
        const skipPatterns = [
            /^facebook/i,
            /^twitter/i,
            /^instagram/i,
            /^linkedin/i,
            /^youtube/i,
            /^pinterest/i,
            /^tiktok/i,
            /^snapchat/i,
            /^whatsapp/i,
            /^telegram/i,
            /^share/i,
            /^follow/i,
            /^like\s*us/i,
            /social.*icon/i,
            /^fa-/i, // Font Awesome icons
            /^icon-/i,
        ];
        return triggers.filter(trigger => {
            const text = trigger.text.toLowerCase().trim();
            // Skip empty or very short text
            if (text.length < 2)
                return false;
            // Skip social media patterns
            if (skipPatterns.some(pattern => pattern.test(text))) {
                console.log(`   ⏭️ Skipping social media trigger: "${trigger.text}"`);
                return false;
            }
            // Skip if selector suggests social icon
            if (/social|facebook|twitter|instagram/i.test(trigger.selector)) {
                console.log(`   ⏭️ Skipping social selector: "${trigger.text}"`);
                return false;
            }
            return true;
        });
    }
    /**
     * Deduplicate triggers by destination URL
     * - External booking systems (different domain) are kept separate
     * - Same-domain destinations are deduplicated by path
     */
    deduplicateByDestination(triggers) {
        const byDestination = new Map();
        for (const trigger of triggers) {
            const dest = trigger.href || `${trigger.sourceUrl}#${trigger.selector}`;
            // Parse the destination URL
            let normalizedDest;
            try {
                const url = new URL(dest, trigger.sourceUrl);
                // For external domains (different booking systems), keep the full domain + path
                // For same-domain, just use the path
                const baseDomain = new URL(trigger.sourceUrl).hostname;
                if (url.hostname !== baseDomain) {
                    // External booking system - keep domain + path (but not query)
                    normalizedDest = `${url.hostname}${url.pathname}`;
                }
                else {
                    // Same domain - just use path
                    normalizedDest = url.pathname;
                }
            }
            catch {
                normalizedDest = dest.split('?')[0];
            }
            if (!byDestination.has(normalizedDest)) {
                byDestination.set(normalizedDest, trigger);
            }
            else {
                // Keep the one with higher confidence
                const existing = byDestination.get(normalizedDest);
                if (trigger.confidence > existing.confidence) {
                    byDestination.set(normalizedDest, trigger);
                }
            }
        }
        console.log(`   Unique destinations: ${Array.from(byDestination.keys()).join(', ')}`);
        return Array.from(byDestination.values());
    }
    /**
     * Explore all provided booking triggers
     */
    async exploreAll(triggers) {
        console.log(`\n🎯 Starting exploration of ${triggers.length} booking triggers...`);
        // Filter out false positives
        let filteredTriggers = this.filterTriggers(triggers);
        console.log(`   After filtering: ${filteredTriggers.length} triggers`);
        // Deduplicate by destination
        filteredTriggers = this.deduplicateByDestination(filteredTriggers);
        console.log(`   After deduplication: ${filteredTriggers.length} unique destinations`);
        // Ensure screenshot directory exists
        if (this.config.takeScreenshots) {
            await promises_1.default.mkdir(this.screenshotDir, { recursive: true });
        }
        const flows = [];
        let explored = 0;
        for (const trigger of filteredTriggers) {
            // Check flow limit
            if (this.config.maxFlows > 0 && explored >= this.config.maxFlows) {
                console.log(`\n⚠️ Reached max flow limit (${this.config.maxFlows})`);
                break;
            }
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📋 Exploring trigger: "${trigger.text}" on ${trigger.sourceUrl}`);
            console.log(`   Confidence: ${(trigger.confidence * 100).toFixed(0)}%`);
            try {
                const flow = await this.exploreSingleTrigger(trigger);
                if (flow) {
                    flows.push(flow);
                    explored++;
                    console.log(`   ✅ Flow explored successfully: ${flow.name}`);
                }
            }
            catch (error) {
                console.log(`   ❌ Error exploring trigger: ${error}`);
            }
        }
        console.log(`\n✅ Explored ${flows.length} booking flows`);
        return flows;
    }
    /**
     * Explore a single booking trigger
     */
    async exploreSingleTrigger(trigger) {
        const context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'BookingExplorer/1.0',
            ignoreHTTPSErrors: true,
        });
        try {
            const page = await context.newPage();
            page.setDefaultTimeout(this.config.actionTimeout);
            // If trigger has an external href, navigate directly to it
            // This is more reliable than clicking which might not work for some buttons
            let destinationUrl;
            if (trigger.href) {
                try {
                    const hrefUrl = new URL(trigger.href, trigger.sourceUrl);
                    const sourceUrl = new URL(trigger.sourceUrl);
                    // If it's an external link (different domain), go directly to it
                    if (hrefUrl.hostname !== sourceUrl.hostname) {
                        console.log(`   🔗 Navigating directly to external booking system: ${hrefUrl.href}`);
                        await page.goto(hrefUrl.href, {
                            timeout: this.config.pageTimeout,
                            waitUntil: 'domcontentloaded',
                        });
                        await (0, utils_1.waitForNetworkIdle)(page, 3000);
                        destinationUrl = page.url();
                    }
                    else {
                        // Same domain - click the trigger normally
                        await page.goto(trigger.sourceUrl, {
                            timeout: this.config.pageTimeout,
                            waitUntil: 'domcontentloaded',
                        });
                        await (0, utils_1.waitForNetworkIdle)(page, 3000);
                        const triggerLocator = page.locator(trigger.selector).first();
                        if (!await triggerLocator.isVisible().catch(() => false)) {
                            const textLocator = page.locator(`text="${trigger.text}"`).first();
                            if (!await textLocator.isVisible().catch(() => false)) {
                                console.log(`   ⚠️ Trigger not found on page`);
                                return null;
                            }
                            await (0, utils_1.clickAndWait)(page, textLocator);
                        }
                        else {
                            await (0, utils_1.clickAndWait)(page, triggerLocator);
                        }
                        await (0, utils_1.waitForNetworkIdle)(page, 3000);
                        destinationUrl = page.url();
                    }
                }
                catch {
                    // Fallback to click method
                    await page.goto(trigger.sourceUrl, {
                        timeout: this.config.pageTimeout,
                        waitUntil: 'domcontentloaded',
                    });
                    await (0, utils_1.waitForNetworkIdle)(page, 3000);
                    const triggerLocator = page.locator(trigger.selector).first();
                    await (0, utils_1.clickAndWait)(page, triggerLocator);
                    await (0, utils_1.waitForNetworkIdle)(page, 3000);
                    destinationUrl = page.url();
                }
            }
            else {
                // No href - must click
                await page.goto(trigger.sourceUrl, {
                    timeout: this.config.pageTimeout,
                    waitUntil: 'domcontentloaded',
                });
                await (0, utils_1.waitForNetworkIdle)(page, 3000);
                const triggerLocator = page.locator(trigger.selector).first();
                if (!await triggerLocator.isVisible().catch(() => false)) {
                    const textLocator = page.locator(`text="${trigger.text}"`).first();
                    if (!await textLocator.isVisible().catch(() => false)) {
                        console.log(`   ⚠️ Trigger not found on page`);
                        return null;
                    }
                    await (0, utils_1.clickAndWait)(page, textLocator);
                }
                else {
                    await (0, utils_1.clickAndWait)(page, triggerLocator);
                }
                await (0, utils_1.waitForNetworkIdle)(page, 3000);
                destinationUrl = page.url();
            }
            const destinationBase = destinationUrl.split('?')[0];
            // Check if we've already explored this destination
            if (this.exploredDestinations.has(destinationBase)) {
                console.log(`   ⏭️ Already explored destination: ${destinationBase}`);
                return null;
            }
            this.exploredDestinations.add(destinationBase);
            // Check if we reached a booking page
            if (!await (0, detectors_1.isBookingLandingPage)(page)) {
                console.log(`   ⚠️ Click did not lead to a booking flow`);
                return null;
            }
            // Extract booking name
            const name = await this.extractBookingName(page);
            // Create booking flow structure
            const flow = {
                id: (0, utils_1.generateId)(),
                name,
                description: await this.extractDescription(page),
                entryPoints: [{
                        sourceUrl: trigger.sourceUrl,
                        triggerText: trigger.text,
                        triggerSelector: trigger.selector,
                        destinationUrl: destinationUrl,
                    }],
                flows: [],
                groupSizeConfig: await (0, extractors_1.extractGroupSizeConfig)(page),
                discoveredAt: (0, utils_1.getTimestamp)(),
            };
            // Deep scrape all packages from this booking system
            console.log(`   📦 Deep scraping packages from booking system...`);
            try {
                const packageScraper = new packageScraper_1.PackageScraper(page, this.screenshotDir, this.config.takeScreenshots);
                const discovery = await packageScraper.scrapeBookingSystem(destinationUrl);
                // Store the discovery
                this.bookingSystemDiscoveries.set(destinationBase, discovery);
                console.log(`   📦 Found ${discovery.packages.length} packages across ${discovery.categories.length} categories`);
                // Log package names
                for (const pkg of discovery.packages) {
                    console.log(`      - ${pkg.name} (${pkg.category}): ${pkg.pricing.basePrice || pkg.pricing.dayPricing.map(d => `${d.days}: ${d.price}`).join(', ') || 'Price varies'}`);
                }
            }
            catch (error) {
                console.log(`   ⚠️ Package scraping error: ${error}`);
            }
            // Explore with different group sizes (optional, for flow analysis)
            const variations = await this.exploreFlowVariations(context, trigger, flow.groupSizeConfig);
            flow.flows = variations;
            return flow;
        }
        finally {
            await context.close();
        }
    }
    /**
     * Explore flow variations (min size, max size, special paths)
     */
    async exploreFlowVariations(baseContext, trigger, groupConfig) {
        const variations = [];
        // Determine which sizes to test
        const sizesToTest = [];
        if (groupConfig) {
            // Test minimum size
            if (groupConfig.minimum !== null) {
                sizesToTest.push({ mode: 'min', value: groupConfig.minimum });
            }
            // Test maximum size
            if (groupConfig.maximum !== null) {
                sizesToTest.push({ mode: 'max', value: groupConfig.maximum });
            }
            // If there's a divergence point (e.g., 16+), test that specifically
            if (groupConfig.hasSeparatePaths && groupConfig.divergencePoint) {
                // Make sure we test the value that triggers the separate path
                const divergenceValue = groupConfig.availableOptions.find(opt => typeof opt === 'string' && opt.includes('+')) || `${groupConfig.divergencePoint}+`;
                if (!sizesToTest.some(s => s.value === divergenceValue)) {
                    sizesToTest.push({ mode: 'max', value: divergenceValue });
                }
            }
        }
        // If no size config found, do one default exploration
        if (sizesToTest.length === 0) {
            sizesToTest.push({ mode: 'default', value: null });
        }
        console.log(`   Testing ${sizesToTest.length} size variation(s): ${sizesToTest.map(s => `${s.mode}=${s.value}`).join(', ')}`);
        // Explore each size variation
        for (const { mode, value } of sizesToTest) {
            console.log(`\n   🔄 Exploring ${mode} size (${value ?? 'default'})...`);
            const startTime = Date.now();
            // Create fresh context for this variation
            const context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
                userAgent: 'BookingExplorer/1.0',
                ignoreHTTPSErrors: true,
            });
            try {
                const page = await context.newPage();
                page.setDefaultTimeout(this.config.actionTimeout);
                // Navigate and click trigger
                await page.goto(trigger.sourceUrl, {
                    timeout: this.config.pageTimeout,
                    waitUntil: 'domcontentloaded',
                });
                await (0, utils_1.waitForNetworkIdle)(page, 5000);
                // Click trigger
                const triggerLocator = page.locator(trigger.selector).first();
                const clicked = await (0, utils_1.safeClick)(triggerLocator).catch(() => false);
                if (!clicked) {
                    await (0, utils_1.safeClick)(page.locator(`text="${trigger.text}"`).first());
                }
                await (0, utils_1.waitForNetworkIdle)(page, 5000);
                // Set group size if applicable
                if (value !== null) {
                    await this.setGroupSize(page, value);
                    await (0, utils_1.waitForChange)(page);
                }
                // Explore the flow
                const steps = await this.exploreFlowSteps(page, `${trigger.text}-${mode}`);
                // Determine flow type
                const flowType = await this.determineFlowType(steps);
                variations.push({
                    flowType,
                    groupSizeMode: mode,
                    groupSize: value,
                    steps,
                    completed: steps.length > 0 &&
                        (steps[steps.length - 1].stepType === 'payment' ||
                            steps[steps.length - 1].stepType === 'confirmation' ||
                            steps[steps.length - 1].stepType === 'enquiry_form'),
                    terminationReason: steps.length === 0 ? 'No steps detected' : null,
                    explorationTimeMs: Date.now() - startTime,
                });
            }
            catch (error) {
                console.log(`      ❌ Error exploring variation: ${error}`);
                variations.push({
                    flowType: 'unknown',
                    groupSizeMode: mode,
                    groupSize: value,
                    steps: [],
                    completed: false,
                    terminationReason: error instanceof Error ? error.message : 'Unknown error',
                    explorationTimeMs: Date.now() - startTime,
                });
            }
            finally {
                await context.close();
            }
        }
        return variations;
    }
    /**
     * Explore all steps of a booking flow
     */
    async exploreFlowSteps(page, flowId) {
        const steps = [];
        let stepOrder = 0;
        const visitedUrls = new Set();
        const maxSteps = 15; // Safety limit
        while (stepOrder < maxSteps) {
            stepOrder++;
            const currentUrl = page.url();
            console.log(`      Step ${stepOrder}: ${currentUrl}`);
            // Check for infinite loop
            const urlKey = `${currentUrl}|${stepOrder}`;
            if (visitedUrls.has(currentUrl) && stepOrder > 3) {
                console.log(`      ⚠️ Detected potential loop, stopping`);
                break;
            }
            visitedUrls.add(currentUrl);
            // Check if we've reached payment
            if (await (0, utils_1.isPaymentPage)(page)) {
                console.log(`      💳 Reached payment page - stopping`);
                steps.push(await this.captureStep(page, stepOrder, flowId, 'payment'));
                break;
            }
            // Check if we've reached confirmation
            if (await (0, utils_1.isConfirmationPage)(page)) {
                console.log(`      ✅ Reached confirmation page - stopping`);
                steps.push(await this.captureStep(page, stepOrder, flowId, 'confirmation'));
                break;
            }
            // Detect step type
            const stepType = await this.detectStepType(page);
            // Capture current step
            const step = await this.captureStep(page, stepOrder, flowId, stepType);
            steps.push(step);
            // Check for enquiry form (different from standard flow)
            if (stepType === 'enquiry_form') {
                console.log(`      📝 Enquiry form detected - stopping`);
                break;
            }
            // Try to progress to next step
            const progressed = await this.progressToNextStep(page, stepType);
            if (!progressed) {
                console.log(`      ⚠️ Could not progress further`);
                break;
            }
            // Wait for page to update
            await (0, utils_1.waitForChange)(page);
            await (0, utils_1.waitForNetworkIdle)(page, 3000);
            // Small delay
            await (0, utils_1.sleep)(this.config.actionDelay);
        }
        return steps;
    }
    /**
     * Capture details of the current step
     */
    async captureStep(page, stepOrder, flowId, stepType) {
        const step = {
            stepOrder,
            url: page.url(),
            description: await this.describeStep(page, stepType),
            stepType,
            availableOptions: await (0, extractors_1.extractStepOptions)(page),
            addOns: await (0, extractors_1.extractAddOns)(page),
            formFields: stepType === 'details_form' || stepType === 'enquiry_form'
                ? await (0, extractors_1.extractFormFields)(page)
                : [],
            screenshotPath: null,
            errors: [],
        };
        // Take screenshot if enabled
        if (this.config.takeScreenshots) {
            try {
                const filename = `${flowId}-step${stepOrder}.png`;
                const filepath = path_1.default.join(this.screenshotDir, filename);
                await page.screenshot({ path: filepath, fullPage: false });
                step.screenshotPath = filepath;
            }
            catch {
                // Screenshot failed, continue anyway
            }
        }
        return step;
    }
    /**
     * Detect the type of the current step
     */
    async detectStepType(page) {
        // Check for enquiry form first
        const enquiryIndicators = await page.locator('text=/enquir/i, text=/request.*quote/i, text=/get in touch/i, form[action*="enquir"]').first().isVisible().catch(() => false);
        if (enquiryIndicators) {
            // Verify it's actually an enquiry form
            const hasBookingElements = await page.locator('.calendar, .date-picker, .time-slot').first().isVisible().catch(() => false);
            if (!hasBookingElements) {
                return 'enquiry_form';
            }
        }
        // Check for calendar/date selection
        const hasCalendar = await page.locator('.calendar, [data-calendar], .datepicker, .date-picker, input[type="date"], .flatpickr, .react-datepicker').first().isVisible().catch(() => false);
        // Check for time slots
        const hasTimeSlots = await page.locator('.time-slot, .time-picker, .timepicker, [data-time], .slot, select[name*="time"]').first().isVisible().catch(() => false);
        if (hasCalendar && hasTimeSlots) {
            return 'datetime_selection';
        }
        if (hasCalendar) {
            return 'date_selection';
        }
        if (hasTimeSlots) {
            return 'time_selection';
        }
        // Check for group size selection
        const hasGroupSize = await page.locator('.party-size, .group-size, .guest-count, [data-guests], .stepper, input[name*="guest"], input[name*="people"]').first().isVisible().catch(() => false);
        if (hasGroupSize) {
            return 'group_size_selection';
        }
        // Check for add-on selection
        const hasAddOns = await page.locator('.add-ons, .addons, .extras, .upgrades, [data-addon], .upsell').first().isVisible().catch(() => false);
        if (hasAddOns) {
            return 'addon_selection';
        }
        // Check for details form
        const hasDetailsForm = await page.locator('input[name*="name"], input[name*="email"], input[type="email"], input[type="tel"]').first().isVisible().catch(() => false);
        if (hasDetailsForm) {
            return 'details_form';
        }
        // Check for review/summary
        const hasReview = await page.locator('.summary, .review, .booking-summary, .order-summary, text=/confirm.*booking/i').first().isVisible().catch(() => false);
        if (hasReview) {
            return 'review_summary';
        }
        // Check for product selection
        const hasProducts = await page.locator('.product, .package, .experience, .activity, [data-product]').first().isVisible().catch(() => false);
        if (hasProducts) {
            return 'product_selection';
        }
        return 'unknown';
    }
    /**
     * Generate a human-readable description of the current step
     */
    async describeStep(page, stepType) {
        // Try to get heading
        let heading = '';
        try {
            heading = (0, utils_1.cleanText)(await page.locator('h1, h2, .page-title, .step-title').first().textContent());
        }
        catch {
            // No heading
        }
        const descriptions = {
            group_size_selection: 'Select party size / group size',
            date_selection: 'Select date',
            time_selection: 'Select time slot',
            datetime_selection: 'Select date and time',
            product_selection: 'Select product / package',
            addon_selection: 'Select extras / add-ons',
            details_form: 'Enter booking details',
            enquiry_form: 'Large group enquiry form',
            review_summary: 'Review booking summary',
            payment: 'Payment page',
            confirmation: 'Booking confirmation',
            unknown: 'Unknown step',
        };
        const base = descriptions[stepType];
        return heading ? `${base}: ${heading}` : base;
    }
    /**
     * Try to progress to the next step
     */
    async progressToNextStep(page, currentStepType) {
        // Different strategies based on step type
        switch (currentStepType) {
            case 'date_selection':
                return await this.selectFirstAvailableDate(page);
            case 'time_selection':
                return await this.selectFirstAvailableTime(page);
            case 'datetime_selection':
                const dateSelected = await this.selectFirstAvailableDate(page);
                if (dateSelected) {
                    await (0, utils_1.sleep)(500);
                    await this.selectFirstAvailableTime(page);
                }
                return await this.clickNextButton(page);
            case 'group_size_selection':
                // Group size should already be set, just click next
                return await this.clickNextButton(page);
            case 'product_selection':
                return await this.selectFirstProduct(page);
            case 'addon_selection':
                // Don't select any add-ons by default, just proceed
                return await this.clickNextButton(page);
            case 'details_form':
                // Don't fill in details, just try to find how far we can go
                // This prevents actual booking attempts
                return false;
            case 'review_summary':
                return await this.clickNextButton(page);
            default:
                return await this.clickNextButton(page);
        }
    }
    /**
     * Select the first available date in a calendar
     */
    async selectFirstAvailableDate(page) {
        const dateSelectors = [
            '.calendar .available',
            '.calendar .selectable:not(.disabled)',
            '.datepicker td:not(.disabled):not(.old)',
            '.react-datepicker__day:not(.react-datepicker__day--disabled)',
            '.flatpickr-day:not(.flatpickr-disabled):not(.prevMonthDay)',
            '[data-date]:not([disabled])',
            '.date-slot:not(.unavailable)',
        ];
        for (const selector of dateSelectors) {
            try {
                const date = page.locator(selector).first();
                if (await date.isVisible()) {
                    await (0, utils_1.safeClick)(date);
                    await (0, utils_1.sleep)(500);
                    return true;
                }
            }
            catch {
                continue;
            }
        }
        return false;
    }
    /**
     * Select the first available time slot
     */
    async selectFirstAvailableTime(page) {
        const timeSelectors = [
            '.time-slot:not(.unavailable):not(.disabled)',
            '.slot:not(.booked):not(.unavailable)',
            '[data-time]:not([disabled])',
            '.time-option:not(.disabled)',
            '.available-time',
        ];
        for (const selector of timeSelectors) {
            try {
                const time = page.locator(selector).first();
                if (await time.isVisible()) {
                    await (0, utils_1.safeClick)(time);
                    await (0, utils_1.sleep)(500);
                    return true;
                }
            }
            catch {
                continue;
            }
        }
        return false;
    }
    /**
     * Select the first product/package
     */
    async selectFirstProduct(page) {
        const productSelectors = [
            '.product:not(.unavailable) button',
            '.package:not(.unavailable) button',
            '.experience .book-btn',
            '[data-product] button',
            '.product-card .cta',
        ];
        for (const selector of productSelectors) {
            try {
                const btn = page.locator(selector).first();
                if (await btn.isVisible()) {
                    await (0, utils_1.safeClick)(btn);
                    return true;
                }
            }
            catch {
                continue;
            }
        }
        return await this.clickNextButton(page);
    }
    /**
     * Click the next/continue/proceed button
     */
    async clickNextButton(page) {
        const buttonSelectors = [
            'button:has-text("Next")',
            'button:has-text("Continue")',
            'button:has-text("Proceed")',
            'button:has-text("Book")',
            'button:has-text("Confirm")',
            'button[type="submit"]',
            '.next-btn',
            '.continue-btn',
            '.cta-button',
            '[data-action="next"]',
            'input[type="submit"]',
        ];
        for (const selector of buttonSelectors) {
            try {
                const btn = page.locator(selector).first();
                if (await btn.isVisible() && await btn.isEnabled()) {
                    await (0, utils_1.safeClick)(btn);
                    return true;
                }
            }
            catch {
                continue;
            }
        }
        return false;
    }
    /**
     * Set the group size to a specific value
     */
    async setGroupSize(page, value) {
        // Try dropdown first
        const selectSelectors = [
            'select[name*="guest"]', 'select[name*="people"]',
            'select[name*="party"]', 'select[name*="size"]',
            'select[name*="group"]',
        ];
        for (const selector of selectSelectors) {
            try {
                const select = page.locator(selector).first();
                if (await select.isVisible()) {
                    await select.selectOption({ value: String(value) });
                    return true;
                }
            }
            catch {
                continue;
            }
        }
        // Try number input
        const inputSelectors = [
            'input[type="number"][name*="guest"]',
            'input[type="number"][name*="people"]',
            'input[type="number"][name*="party"]',
            'input[type="number"][name*="size"]',
        ];
        for (const selector of inputSelectors) {
            try {
                const input = page.locator(selector).first();
                if (await input.isVisible()) {
                    await input.fill(String(value));
                    return true;
                }
            }
            catch {
                continue;
            }
        }
        // Try clicking a size option button/radio
        try {
            const sizeOption = page.locator(`text="${value}"`).first();
            if (await sizeOption.isVisible()) {
                await (0, utils_1.safeClick)(sizeOption);
                return true;
            }
        }
        catch {
            // Not found
        }
        // Try stepper buttons
        if (typeof value === 'number') {
            return await this.useStepperToSetSize(page, value);
        }
        return false;
    }
    /**
     * Use stepper (+/-) buttons to set size
     */
    async useStepperToSetSize(page, targetValue) {
        const stepperSelectors = [
            '.stepper', '.counter', '.qty-selector', '.guest-selector',
        ];
        for (const selector of stepperSelectors) {
            try {
                const stepper = page.locator(selector).first();
                if (!await stepper.isVisible())
                    continue;
                const plusBtn = stepper.locator('button:has-text("+"), [data-action="increase"]').first();
                const minusBtn = stepper.locator('button:has-text("-"), [data-action="decrease"]').first();
                const valueDisplay = stepper.locator('input, .value, .count').first();
                // Get current value
                let currentValue = 0;
                try {
                    const text = await valueDisplay.inputValue().catch(() => valueDisplay.textContent().then(t => t?.trim() || '0'));
                    currentValue = parseInt(text || '0');
                }
                catch {
                    currentValue = 1; // Assume 1 if can't read
                }
                // Click buttons to reach target
                const diff = targetValue - currentValue;
                const btn = diff > 0 ? plusBtn : minusBtn;
                const clicks = Math.abs(diff);
                for (let i = 0; i < clicks && i < 20; i++) {
                    await (0, utils_1.safeClick)(btn);
                    await (0, utils_1.sleep)(200);
                }
                return true;
            }
            catch {
                continue;
            }
        }
        return false;
    }
    /**
     * Determine flow type based on steps
     */
    async determineFlowType(steps) {
        if (steps.length === 0)
            return 'unknown';
        // Check for enquiry form
        if (steps.some(s => s.stepType === 'enquiry_form')) {
            return 'high_revenue';
        }
        // Check for standard flow (has date/time selection and reaches payment or confirmation)
        const hasDateTimeSelection = steps.some(s => s.stepType === 'date_selection' ||
            s.stepType === 'time_selection' ||
            s.stepType === 'datetime_selection');
        const reachesPayment = steps.some(s => s.stepType === 'payment' ||
            s.stepType === 'review_summary');
        if (hasDateTimeSelection && reachesPayment) {
            return 'standard';
        }
        // Check for enquiry-only flow
        if (steps.every(s => s.stepType === 'details_form' || s.stepType === 'enquiry_form')) {
            return 'enquiry';
        }
        return 'standard';
    }
    /**
     * Extract the booking/product name from the page
     */
    async extractBookingName(page) {
        const nameSelectors = [
            'h1', '.page-title', '.product-title', '.booking-title',
            '.experience-name', '[data-product-name]',
        ];
        for (const selector of nameSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    const text = (0, utils_1.cleanText)(await element.textContent());
                    if (text && text.length > 2 && text.length < 100) {
                        return text;
                    }
                }
            }
            catch {
                continue;
            }
        }
        // Fallback to page title
        const title = await page.title();
        return title.split('|')[0].split('-')[0].trim() || 'Unknown Booking';
    }
    /**
     * Extract description from the page
     */
    async extractDescription(page) {
        const descSelectors = [
            '.description', '.product-description', '.booking-description',
            'meta[name="description"]',
        ];
        for (const selector of descSelectors) {
            try {
                const element = page.locator(selector).first();
                if (selector.startsWith('meta')) {
                    return await element.getAttribute('content');
                }
                if (await element.isVisible()) {
                    const text = (0, utils_1.cleanText)(await element.textContent());
                    if (text && text.length > 10) {
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
}
exports.FlowExplorer = FlowExplorer;
/**
 * Quick explore function for simple usage
 */
async function exploreBookingFlows(browser, triggers, config) {
    const explorer = new FlowExplorer(browser, config);
    return explorer.exploreAll(triggers);
}
//# sourceMappingURL=flowExplorer.js.map