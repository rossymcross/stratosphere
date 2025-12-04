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
import { Page } from 'playwright';
import { BookablePackage, BookingSystemDiscovery, PackageInclusion, PackagePricing, GuestConfiguration, PackageAddOn, VenueInfo, InclusionCategory, AddOnCategory } from './types';
export declare class PackageScraper {
    private page;
    private screenshotDir;
    private takeScreenshots;
    constructor(page: Page, screenshotDir: string, takeScreenshots?: boolean);
    /**
     * Scrape all packages from a booking system page
     */
    scrapeBookingSystem(url: string): Promise<BookingSystemDiscovery>;
    /**
     * Scrape all packages, optionally filtering by category
     */
    scrapeAllPackages(categories: string[]): Promise<BookablePackage[]>;
    /**
     * Normalize package name for deduplication
     */
    normalizePackageName(name: string): string;
    /**
     * Scrape all visible packages on the current page
     */
    scrapeVisiblePackages(category: string): Promise<BookablePackage[]>;
    /**
     * Extract package info from a card/container element
     */
    extractPackageFromElement(element: any, category: string, index: number): Promise<BookablePackage | null>;
    /**
     * Click into a package to get full details
     */
    getPackageDetails(element: any, basePkg: BookablePackage): Promise<BookablePackage | null>;
    /**
     * Extract detailed package info from a detail page/modal
     */
    extractDetailedPackageInfo(basePkg: BookablePackage): Promise<BookablePackage>;
    extractPackageName(element: any): Promise<string | null>;
    extractDescription(element: any): Promise<string | null>;
    extractPricing(element: any, fullText: string): Promise<PackagePricing>;
    extractPricingTable(): Promise<PackagePricing>;
    parseInclusions(text: string): PackageInclusion[];
    categorizeInclusion(text: string): InclusionCategory;
    parseGuestConfig(text: string): GuestConfiguration;
    parseDuration(text: string): string | null;
    parseRestrictions(text: string): string[];
    extractAddOns(): Promise<PackageAddOn[]>;
    categorizeAddOn(name: string): AddOnCategory;
    extractGuestConfiguration(): Promise<GuestConfiguration>;
    extractDetailedDescription(): Promise<string | null>;
    extractImageUrl(element: any): Promise<string | null>;
    extractCategories(): Promise<string[]>;
    selectCategory(category: string): Promise<boolean>;
    /**
     * Select a specific target date to see all available packages
     * This helps capture packages that are only available on certain days
     */
    selectTargetDate(year: number, month: number, day: number): Promise<boolean>;
    /**
     * Navigate a calendar picker to a specific month/year and click the day
     */
    navigateCalendarToDate(year: number, month: number, day: number): Promise<boolean>;
    extractAvailableDates(): Promise<string[]>;
    extractVenueInfo(): Promise<VenueInfo | null>;
    detectPlatform(): Promise<string | null>;
    verifyPackageElements(elements: any[]): Promise<boolean>;
    extractStructuredPackages(category: string): Promise<BookablePackage[]>;
    takeScreenshot(name: string): Promise<string | null>;
    takeElementScreenshot(element: any, name: string): Promise<string | null>;
    slugify(text: string): string;
}
export declare function scrapeBookingSystem(page: Page, url: string, screenshotDir: string, takeScreenshots?: boolean): Promise<BookingSystemDiscovery>;
//# sourceMappingURL=packageScraper.d.ts.map