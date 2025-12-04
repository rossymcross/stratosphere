/**
 * Utility Functions
 *
 * Common helper functions used throughout the booking explorer.
 */
import { Page, Locator, BrowserContext } from 'playwright';
import { ElementInfo, NavigationResult } from './types';
/**
 * Check if a URL is internal (same domain) relative to a base URL
 */
export declare function isInternalUrl(url: string, baseUrl: string): boolean;
/**
 * Normalize a URL by removing fragments and standardizing trailing slashes
 */
export declare function normalizeUrl(url: string, baseUrl: string): string;
/**
 * Extract domain from URL
 */
export declare function getDomain(url: string): string;
/**
 * Check if URL looks like a booking-related path
 */
export declare function isBookingRelatedUrl(url: string): boolean;
/**
 * Clean and normalize text content
 */
export declare function cleanText(text: string | null): string;
/**
 * Extract price from text (handles various formats)
 */
export declare function extractPrice(text: string): string | null;
/**
 * Generate a slug from text for IDs
 */
export declare function slugify(text: string): string;
/**
 * Generate a unique ID
 */
export declare function generateId(): string;
/**
 * Get comprehensive information about an element
 */
export declare function getElementInfo(locator: Locator): Promise<ElementInfo | null>;
/**
 * Build a robust selector for an element
 */
export declare function buildSelector(locator: Locator): Promise<string>;
/**
 * Wait for network to be idle
 */
export declare function waitForNetworkIdle(page: Page, timeout?: number): Promise<void>;
/**
 * Wait for any navigation or significant DOM change
 */
export declare function waitForChange(page: Page, timeout?: number): Promise<void>;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Safely click an element with retries and checks
 */
export declare function safeClick(locator: Locator, options?: {
    timeout?: number;
    retries?: number;
    force?: boolean;
}): Promise<boolean>;
/**
 * Click and wait for navigation or modal
 */
export declare function clickAndWait(page: Page, locator: Locator, timeout?: number): Promise<NavigationResult>;
/**
 * Check if we've reached a payment page
 */
export declare function isPaymentPage(page: Page): Promise<boolean>;
/**
 * Check if we've reached a confirmation/thank you page
 */
export declare function isConfirmationPage(page: Page): Promise<boolean>;
/**
 * Create a fresh browser context for isolated exploration
 */
export declare function createFreshContext(baseContext: BrowserContext): Promise<BrowserContext>;
/**
 * Get ISO timestamp
 */
export declare function getTimestamp(): string;
/**
 * Format duration in human-readable form
 */
export declare function formatDuration(ms: number): string;
//# sourceMappingURL=utils.d.ts.map