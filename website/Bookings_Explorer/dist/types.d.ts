/**
 * Type definitions for the Booking Explorer
 *
 * This file contains all the interfaces and types used throughout the application
 * for structured data representation.
 */
export interface ExplorerConfig {
    /** Base URL to start crawling from */
    baseUrl: string;
    /** Maximum number of pages to visit during crawl */
    maxPages: number;
    /** Maximum depth for link following */
    maxDepth: number;
    /** Timeout in milliseconds for page loads */
    pageTimeout: number;
    /** Timeout in milliseconds for individual actions */
    actionTimeout: number;
    /** Whether to run in headless mode */
    headless: boolean;
    /** Output directory for reports */
    outputDir: string;
    /** Whether to take screenshots during exploration */
    takeScreenshots: boolean;
    /** Maximum number of booking flows to explore (0 = unlimited) */
    maxFlows: number;
    /** Delay between actions in milliseconds */
    actionDelay: number;
    /** Number of retries for failed actions */
    retries: number;
}
export interface CrawlQueueItem {
    /** URL to visit */
    url: string;
    /** Depth from the starting page */
    depth: number;
    /** Source URL that linked to this page */
    sourceUrl: string | null;
    /** Priority for visiting (lower = higher priority) */
    priority: number;
}
export interface CrawlResult {
    /** URL that was visited */
    url: string;
    /** Page title */
    title: string;
    /** All internal links found on the page */
    internalLinks: string[];
    /** Potential booking triggers found */
    bookingTriggers: BookingTrigger[];
    /** Timestamp of visit */
    visitedAt: string;
    /** Any errors encountered */
    errors: string[];
}
export interface BookingTrigger {
    /** Unique identifier for this trigger */
    id: string;
    /** Text content of the trigger element */
    text: string;
    /** CSS selector to locate the element */
    selector: string;
    /** HTML tag name */
    tagName: string;
    /** URL of the page where this trigger was found */
    sourceUrl: string;
    /** Any href attribute if present */
    href: string | null;
    /** Confidence score (0-1) that this is a booking trigger */
    confidence: number;
    /** Data attributes on the element */
    dataAttributes: Record<string, string>;
    /** Type of trigger detected */
    triggerType: 'button' | 'link' | 'form' | 'widget' | 'unknown';
}
export interface BookingFlow {
    /** Unique identifier for this booking */
    id: string;
    /** Name/title of the booking product */
    name: string;
    /** Description if found */
    description: string | null;
    /** Entry points that lead to this booking */
    entryPoints: BookingEntryPoint[];
    /** All explored flow variations */
    flows: FlowVariation[];
    /** Group size configuration */
    groupSizeConfig: GroupSizeConfig | null;
    /** Timestamp when this flow was discovered */
    discoveredAt: string;
}
export interface BookingEntryPoint {
    /** URL where the entry point was found */
    sourceUrl: string;
    /** Text on the trigger element */
    triggerText: string;
    /** Selector for the trigger */
    triggerSelector: string;
    /** Initial URL after clicking the trigger */
    destinationUrl: string | null;
}
export interface FlowVariation {
    /** Type of flow (standard, high_revenue, enquiry) */
    flowType: 'standard' | 'high_revenue' | 'enquiry' | 'unknown';
    /** Whether this used min or max group size */
    groupSizeMode: 'min' | 'max' | 'default' | null;
    /** The group size value used */
    groupSize: number | string | null;
    /** Sequential steps in this flow */
    steps: FlowStep[];
    /** Whether the flow completed successfully */
    completed: boolean;
    /** Reason for incompletion if applicable */
    terminationReason: string | null;
    /** Total time taken to explore this flow in ms */
    explorationTimeMs: number;
}
export interface FlowStep {
    /** Order of this step (1-indexed) */
    stepOrder: number;
    /** URL at this step */
    url: string;
    /** Human-readable description of this step */
    description: string;
    /** Type of step */
    stepType: StepType;
    /** Available options at this step */
    availableOptions: StepOptions | null;
    /** Add-ons available at this step */
    addOns: AddOn[];
    /** Form fields detected at this step */
    formFields: FormField[];
    /** Screenshot path if taken */
    screenshotPath: string | null;
    /** Any errors at this step */
    errors: string[];
}
export type StepType = 'group_size_selection' | 'date_selection' | 'time_selection' | 'datetime_selection' | 'product_selection' | 'addon_selection' | 'details_form' | 'enquiry_form' | 'review_summary' | 'payment' | 'confirmation' | 'unknown';
export interface StepOptions {
    /** Available dates */
    dates?: string[];
    /** Available times */
    times?: string[];
    /** Available products */
    products?: ProductOption[];
    /** Available group sizes */
    groupSizes?: (number | string)[];
    /** Price information */
    pricing?: PricingInfo;
    /** Any other options */
    other?: Record<string, unknown>;
}
export interface ProductOption {
    /** Product name */
    name: string;
    /** Product description */
    description: string | null;
    /** Price */
    price: string | null;
    /** Whether currently selected */
    selected: boolean;
}
export interface PricingInfo {
    /** Base price */
    basePrice: string | null;
    /** Price per person */
    pricePerPerson: string | null;
    /** Total displayed */
    total: string | null;
    /** Currency symbol */
    currency: string;
}
export interface AddOn {
    /** Name of the add-on */
    name: string;
    /** Description */
    description: string | null;
    /** Price (as displayed) */
    price: string | null;
    /** Whether this is optional */
    optional: boolean;
    /** Whether it was pre-selected */
    preSelected: boolean;
    /** Category of add-on */
    category: AddOnCategory;
    /** Selector for this add-on element */
    selector: string | null;
}
export type AddOnCategory = 'food_drink' | 'decorations' | 'extra_time' | 'upgrade' | 'equipment' | 'service' | 'other';
export interface FormField {
    /** Field name/label */
    name: string;
    /** Input type */
    type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'hidden' | 'unknown';
    /** Whether the field is required */
    required: boolean;
    /** Placeholder text */
    placeholder: string | null;
    /** Available options for select/radio */
    options: string[];
    /** Selector for this field */
    selector: string;
}
export interface GroupSizeConfig {
    /** Minimum group size */
    minimum: number | null;
    /** Maximum group size (can be string like "16+") */
    maximum: number | string | null;
    /** Whether there are separate paths for different sizes */
    hasSeparatePaths: boolean;
    /** Size at which flow diverges (e.g., 16) */
    divergencePoint: number | null;
    /** All available size options */
    availableOptions: (number | string)[];
    /** Size categories (e.g., "Adults", "Children") */
    categories: GroupSizeCategory[];
}
export interface GroupSizeCategory {
    /** Category name */
    name: string;
    /** Minimum for this category */
    min: number | null;
    /** Maximum for this category */
    max: number | string | null;
    /** Default value */
    default: number | null;
}
export interface ExplorerReport {
    /** Base URL that was explored */
    baseUrl: string;
    /** Timestamp when exploration started */
    startedAt: string;
    /** Timestamp when exploration completed */
    completedAt: string;
    /** Total duration in milliseconds */
    durationMs: number;
    /** Configuration used */
    config: Partial<ExplorerConfig>;
    /** Statistics about the crawl */
    stats: CrawlStats;
    /** All discovered bookings */
    bookings: BookingFlow[];
    /** Any global errors */
    errors: string[];
}
export interface CrawlStats {
    /** Total pages visited */
    pagesVisited: number;
    /** Total booking triggers found */
    triggersFound: number;
    /** Total booking flows explored */
    flowsExplored: number;
    /** Total unique add-ons found */
    addOnsFound: number;
    /** Pages that failed to load */
    failedPages: number;
}
export interface ElementInfo {
    /** Text content */
    text: string;
    /** Tag name */
    tagName: string;
    /** All attributes */
    attributes: Record<string, string>;
    /** Bounding box */
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    /** Whether visible */
    isVisible: boolean;
    /** Whether enabled */
    isEnabled: boolean;
}
export interface NavigationResult {
    /** Whether navigation succeeded */
    success: boolean;
    /** Final URL after navigation */
    finalUrl: string;
    /** Whether a new page/tab was opened */
    newPageOpened: boolean;
    /** Whether a modal appeared */
    modalAppeared: boolean;
    /** Error message if failed */
    error: string | null;
}
/**
 * Comprehensive package information extracted from booking systems
 */
export interface BookablePackage {
    /** Unique identifier */
    id: string;
    /** Package/product name (e.g., "Strike Package") */
    name: string;
    /** Category (e.g., "Party Packages", "Axe Reservations") */
    category: string;
    /** Full description */
    description: string | null;
    /** Short tagline or subtitle */
    tagline: string | null;
    /** What's included in the package */
    inclusions: PackageInclusion[];
    /** Pricing information */
    pricing: PackagePricing;
    /** Guest/group size configuration */
    guestConfig: GuestConfiguration;
    /** Duration of the experience */
    duration: string | null;
    /** Available add-ons specific to this package */
    availableAddOns: PackageAddOn[];
    /** Any restrictions or requirements */
    restrictions: string[];
    /** Available time slots if applicable */
    availableTimeSlots: string[];
    /** Image URL if found */
    imageUrl: string | null;
    /** Direct booking URL for this package */
    bookingUrl: string | null;
    /** Source URL where this package was found (for verification) */
    sourceUrl: string;
    /** Screenshot of the package details */
    screenshotPath: string | null;
    /** Raw text content for debugging */
    rawContent: string | null;
}
/**
 * Individual inclusion item in a package
 */
export interface PackageInclusion {
    /** Item name (e.g., "1 hr bowling") */
    item: string;
    /** Quantity if specified */
    quantity: string | null;
    /** Category of inclusion */
    category: InclusionCategory;
    /** Additional details */
    details: string | null;
}
export type InclusionCategory = 'activity' | 'food' | 'drink' | 'equipment' | 'tickets' | 'time' | 'service' | 'other';
/**
 * Detailed pricing information for a package
 */
export interface PackagePricing {
    /** Base price (without day variations) */
    basePrice: string | null;
    /** Price by day of week */
    dayPricing: DayPricing[];
    /** Per-person pricing if applicable */
    perPersonPrice: string | null;
    /** Minimum spend if applicable */
    minimumSpend: string | null;
    /** Deposit required */
    depositRequired: string | null;
    /** Any pricing notes */
    notes: string[];
    /** Currency */
    currency: string;
}
/**
 * Price variation by day of week
 */
export interface DayPricing {
    /** Days this price applies to (e.g., "Mon-Thu", "Fri-Sun") */
    days: string;
    /** Price for these days */
    price: string;
}
/**
 * Guest/group configuration for a package
 */
export interface GuestConfiguration {
    /** Included number of guests */
    includedGuests: number | null;
    /** Minimum guests required */
    minimumGuests: number | null;
    /** Maximum guests allowed */
    maximumGuests: number | null;
    /** Price per additional guest */
    additionalGuestPrice: string | null;
    /** Guest categories (adults, children, etc.) */
    guestCategories: GuestCategory[];
}
/**
 * Guest category configuration
 */
export interface GuestCategory {
    /** Category name (e.g., "Adults", "Children") */
    name: string;
    /** Age range if specified */
    ageRange: string | null;
    /** Minimum count */
    min: number | null;
    /** Maximum count */
    max: number | null;
    /** Price for this category */
    price: string | null;
}
/**
 * Add-on available for a specific package
 */
export interface PackageAddOn {
    /** Add-on name */
    name: string;
    /** Description */
    description: string | null;
    /** Price */
    price: string | null;
    /** Whether this is per-person pricing */
    perPerson: boolean;
    /** Category */
    category: AddOnCategory;
    /** Whether pre-selected */
    preSelected: boolean;
    /** Maximum quantity */
    maxQuantity: number | null;
}
/**
 * Complete booking system discovery result
 */
export interface BookingSystemDiscovery {
    /** URL of the booking system */
    url: string;
    /** Name of the venue/business */
    venueName: string;
    /** Booking platform (e.g., "Rex", "FareHarbor", "Custom") */
    platform: string | null;
    /** All package categories found */
    categories: string[];
    /** All packages discovered */
    packages: BookablePackage[];
    /** Available dates found */
    availableDates: string[];
    /** Venue information */
    venueInfo: VenueInfo | null;
    /** Screenshot of main booking page */
    mainScreenshotPath: string | null;
    /** Timestamp of discovery */
    discoveredAt: string;
    /** Time taken to scrape */
    scrapeDurationMs: number;
}
/**
 * Venue information extracted from booking system
 */
export interface VenueInfo {
    /** Venue name */
    name: string;
    /** Address */
    address: string | null;
    /** Phone number */
    phone: string | null;
    /** Email */
    email: string | null;
    /** Operating hours */
    hours: string | null;
}
//# sourceMappingURL=types.d.ts.map