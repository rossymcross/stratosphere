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
import { Page } from 'playwright';
import { GroupSizeConfig, AddOn, FormField, StepOptions, PricingInfo } from './types';
/**
 * Extract group size configuration from the current page
 */
export declare function extractGroupSizeConfig(page: Page): Promise<GroupSizeConfig | null>;
/**
 * Extract available dates from a calendar/date picker
 */
export declare function extractAvailableDates(page: Page): Promise<string[]>;
/**
 * Extract available time slots from the page
 */
export declare function extractAvailableTimes(page: Page): Promise<string[]>;
/**
 * Extract add-ons/extras from the current page
 */
export declare function extractAddOns(page: Page): Promise<AddOn[]>;
/**
 * Extract form fields from the current page
 */
export declare function extractFormFields(page: Page): Promise<FormField[]>;
/**
 * Extract pricing information from the page
 */
export declare function extractPricing(page: Page): Promise<PricingInfo | null>;
/**
 * Extract all available options from the current step
 */
export declare function extractStepOptions(page: Page): Promise<StepOptions>;
//# sourceMappingURL=extractors.d.ts.map