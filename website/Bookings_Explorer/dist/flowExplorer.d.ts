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
import { Browser } from 'playwright';
import { ExplorerConfig, BookingTrigger, BookingFlow, BookingSystemDiscovery } from './types';
export declare class FlowExplorer {
    private browser;
    private config;
    private screenshotDir;
    private exploredDestinations;
    private bookingSystemDiscoveries;
    constructor(browser: Browser, config: ExplorerConfig);
    /**
     * Get all discovered booking systems with package details
     */
    getBookingSystemDiscoveries(): BookingSystemDiscovery[];
    /**
     * Filter out false positive triggers (social media, etc.)
     */
    private filterTriggers;
    /**
     * Deduplicate triggers by destination URL
     * - External booking systems (different domain) are kept separate
     * - Same-domain destinations are deduplicated by path
     */
    private deduplicateByDestination;
    /**
     * Explore all provided booking triggers
     */
    exploreAll(triggers: BookingTrigger[]): Promise<BookingFlow[]>;
    /**
     * Explore a single booking trigger
     */
    exploreSingleTrigger(trigger: BookingTrigger): Promise<BookingFlow | null>;
    /**
     * Explore flow variations (min size, max size, special paths)
     */
    private exploreFlowVariations;
    /**
     * Explore all steps of a booking flow
     */
    private exploreFlowSteps;
    /**
     * Capture details of the current step
     */
    private captureStep;
    /**
     * Detect the type of the current step
     */
    private detectStepType;
    /**
     * Generate a human-readable description of the current step
     */
    private describeStep;
    /**
     * Try to progress to the next step
     */
    private progressToNextStep;
    /**
     * Select the first available date in a calendar
     */
    private selectFirstAvailableDate;
    /**
     * Select the first available time slot
     */
    private selectFirstAvailableTime;
    /**
     * Select the first product/package
     */
    private selectFirstProduct;
    /**
     * Click the next/continue/proceed button
     */
    private clickNextButton;
    /**
     * Set the group size to a specific value
     */
    private setGroupSize;
    /**
     * Use stepper (+/-) buttons to set size
     */
    private useStepperToSetSize;
    /**
     * Determine flow type based on steps
     */
    private determineFlowType;
    /**
     * Extract the booking/product name from the page
     */
    private extractBookingName;
    /**
     * Extract description from the page
     */
    private extractDescription;
}
/**
 * Quick explore function for simple usage
 */
export declare function exploreBookingFlows(browser: Browser, triggers: BookingTrigger[], config: ExplorerConfig): Promise<BookingFlow[]>;
//# sourceMappingURL=flowExplorer.d.ts.map