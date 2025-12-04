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
import { Page } from 'playwright';
import { BookingTrigger } from './types';
/**
 * Detect all potential booking triggers on the current page
 */
export declare function detectBookingTriggers(page: Page, sourceUrl: string): Promise<BookingTrigger[]>;
/**
 * Detect if current page contains a booking widget/form
 */
export declare function detectBookingWidget(page: Page): Promise<boolean>;
/**
 * Detect if current page is a booking landing page
 */
export declare function isBookingLandingPage(page: Page): Promise<boolean>;
/**
 * Detect large group / corporate booking indicators
 */
export declare function detectLargeGroupIndicators(page: Page): Promise<{
    hasLargeGroupOption: boolean;
    indicator: string | null;
}>;
//# sourceMappingURL=detectors.d.ts.map