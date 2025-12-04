/**
 * Utility Functions
 * 
 * Common helper functions used throughout the booking explorer.
 */

import { Page, Locator, BrowserContext } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { ElementInfo, NavigationResult } from './types';

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Check if a URL is internal (same domain) relative to a base URL
 */
export function isInternalUrl(url: string, baseUrl: string): boolean {
  try {
    const base = new URL(baseUrl);
    const target = new URL(url, baseUrl);
    return target.hostname === base.hostname;
  } catch {
    return false;
  }
}

/**
 * Normalize a URL by removing fragments and standardizing trailing slashes
 */
export function normalizeUrl(url: string, baseUrl: string): string {
  try {
    const parsed = new URL(url, baseUrl);
    // Remove fragment
    parsed.hash = '';
    // Normalize pathname (remove trailing slash except for root)
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.href;
  } catch {
    return url;
  }
}

/**
 * Extract domain from URL
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Check if URL looks like a booking-related path
 */
export function isBookingRelatedUrl(url: string): boolean {
  const bookingPatterns = [
    /\/book/i,
    /\/booking/i,
    /\/reserve/i,
    /\/reservation/i,
    /\/checkout/i,
    /\/cart/i,
    /\/tickets/i,
    /\/enquir/i,
    /\/party/i,
    /\/group/i,
    /\/event/i,
    /\/function/i,
    /\/corporate/i,
    /\/private-hire/i,
  ];
  
  return bookingPatterns.some(pattern => pattern.test(url));
}

// ============================================================================
// Text Utilities
// ============================================================================

/**
 * Clean and normalize text content
 */
export function cleanText(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract price from text (handles various formats)
 */
export function extractPrice(text: string): string | null {
  // Match various price formats: £10, $10.99, €10,00, 10 GBP, etc.
  const pricePatterns = [
    /[£$€]\s*[\d,]+(?:\.\d{2})?/,
    /[\d,]+(?:\.\d{2})?\s*(?:GBP|USD|EUR|pounds?|dollars?)/i,
    /(?:GBP|USD|EUR)\s*[\d,]+(?:\.\d{2})?/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return null;
}

/**
 * Generate a slug from text for IDs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return uuidv4();
}

// ============================================================================
// Element Utilities
// ============================================================================

/**
 * Get comprehensive information about an element
 */
export async function getElementInfo(locator: Locator): Promise<ElementInfo | null> {
  try {
    const element = locator.first();
    
    const [text, tagName, isVisible, isEnabled, boundingBox] = await Promise.all([
      element.textContent().then(t => cleanText(t)).catch(() => ''),
      element.evaluate(el => el.tagName.toLowerCase()).catch(() => 'unknown'),
      element.isVisible().catch(() => false),
      element.isEnabled().catch(() => false),
      element.boundingBox().catch(() => null),
    ]);
    
    // Get all attributes
    const attributes = await element.evaluate(el => {
      const attrs: Record<string, string> = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    }).catch(() => ({}));
    
    return { text, tagName, attributes, boundingBox, isVisible, isEnabled };
  } catch {
    return null;
  }
}

/**
 * Build a robust selector for an element
 */
export async function buildSelector(locator: Locator): Promise<string> {
  try {
    return await locator.evaluate(el => {
      const parts: string[] = [];
      
      // Try ID first
      if (el.id) {
        return `#${el.id}`;
      }
      
      // Try data-testid or similar
      const testId = el.getAttribute('data-testid') || 
                     el.getAttribute('data-test') || 
                     el.getAttribute('data-cy');
      if (testId) {
        return `[data-testid="${testId}"], [data-test="${testId}"], [data-cy="${testId}"]`;
      }
      
      // Build path from tag + classes + attributes
      parts.push(el.tagName.toLowerCase());
      
      // Add unique classes
      const classes = (Array.from(el.classList) as string[])
        .filter(c => !c.match(/^(active|selected|hover|focus|disabled)/))
        .slice(0, 3);
      if (classes.length) {
        parts.push(`.${classes.join('.')}`);
      }
      
      // Add text content hint for buttons/links
      if (['button', 'a'].includes(el.tagName.toLowerCase())) {
        const text = el.textContent?.trim().substring(0, 30);
        if (text) {
          return `${parts.join('')}:has-text("${text}")`;
        }
      }
      
      return parts.join('');
    });
  } catch {
    return 'unknown';
  }
}

// ============================================================================
// Wait Utilities
// ============================================================================

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Network idle timeout is acceptable
  }
}

/**
 * Wait for any navigation or significant DOM change
 */
export async function waitForChange(page: Page, timeout = 5000): Promise<void> {
  const startUrl = page.url();
  
  try {
    await Promise.race([
      page.waitForNavigation({ timeout, waitUntil: 'domcontentloaded' }),
      page.waitForSelector('.modal, [role="dialog"], .popup, .overlay', { timeout, state: 'visible' }),
      page.waitForURL(url => url.toString() !== startUrl, { timeout }),
      new Promise(resolve => setTimeout(resolve, timeout)),
    ]);
  } catch {
    // Expected - at least one should resolve
  }
  
  // Small extra delay for any JS to settle
  await sleep(300);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Click Utilities
// ============================================================================

/**
 * Safely click an element with retries and checks
 */
export async function safeClick(
  locator: Locator,
  options: { timeout?: number; retries?: number; force?: boolean } = {}
): Promise<boolean> {
  const { timeout = 10000, retries = 3, force = false } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Wait for element to be visible and enabled
      await locator.waitFor({ state: 'visible', timeout });
      
      // Check if enabled
      const isDisabled = await locator.isDisabled().catch(() => false);
      if (isDisabled && !force) {
        console.log(`  ⚠️ Element is disabled, skipping click`);
        return false;
      }
      
      // Scroll into view
      await locator.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
      
      // Click
      await locator.click({ timeout, force });
      
      return true;
    } catch (error) {
      if (attempt === retries) {
        console.log(`  ❌ Click failed after ${retries} attempts`);
        return false;
      }
      await sleep(500 * attempt);
    }
  }
  
  return false;
}

/**
 * Click and wait for navigation or modal
 */
export async function clickAndWait(
  page: Page,
  locator: Locator,
  timeout = 10000
): Promise<NavigationResult> {
  const startUrl = page.url();
  
  try {
    // Set up navigation listener before clicking
    const navigationPromise = page.waitForNavigation({ 
      timeout, 
      waitUntil: 'domcontentloaded' 
    }).catch(() => null);
    
    // Click the element
    const clicked = await safeClick(locator, { timeout });
    if (!clicked) {
      return {
        success: false,
        finalUrl: startUrl,
        newPageOpened: false,
        modalAppeared: false,
        error: 'Click failed',
      };
    }
    
    // Wait for navigation or timeout
    await navigationPromise;
    
    // Check for modal
    const modalAppeared = await page.locator('.modal:visible, [role="dialog"]:visible, .popup:visible')
      .first()
      .isVisible()
      .catch(() => false);
    
    await waitForNetworkIdle(page, 3000);
    
    return {
      success: true,
      finalUrl: page.url(),
      newPageOpened: page.url() !== startUrl,
      modalAppeared,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      finalUrl: page.url(),
      newPageOpened: false,
      modalAppeared: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Page State Utilities
// ============================================================================

/**
 * Check if we've reached a payment page
 */
export async function isPaymentPage(page: Page): Promise<boolean> {
  const paymentIndicators = [
    // Payment form fields
    'input[name*="card"]',
    'input[name*="credit"]',
    'input[autocomplete="cc-number"]',
    '[data-stripe]',
    '[data-braintree]',
    'iframe[src*="stripe"]',
    'iframe[src*="paypal"]',
    'iframe[src*="checkout"]',
    // Payment text
    'text=/payment details/i',
    'text=/card number/i',
    'text=/pay now/i',
    'text=/complete payment/i',
    'text=/secure checkout/i',
  ];
  
  for (const selector of paymentIndicators) {
    try {
      const visible = await page.locator(selector).first().isVisible().catch(() => false);
      if (visible) return true;
    } catch {
      continue;
    }
  }
  
  // Check URL patterns
  const url = page.url().toLowerCase();
  return /\/(payment|checkout|pay|stripe|paypal)/i.test(url);
}

/**
 * Check if we've reached a confirmation/thank you page
 */
export async function isConfirmationPage(page: Page): Promise<boolean> {
  const confirmationIndicators = [
    'text=/thank you/i',
    'text=/booking confirmed/i',
    'text=/reservation confirmed/i',
    'text=/order confirmed/i',
    'text=/confirmation number/i',
    'text=/booking reference/i',
  ];
  
  for (const selector of confirmationIndicators) {
    try {
      const visible = await page.locator(selector).first().isVisible().catch(() => false);
      if (visible) return true;
    } catch {
      continue;
    }
  }
  
  const url = page.url().toLowerCase();
  return /\/(confirm|thanks|thank-you|success|complete)/i.test(url);
}

// ============================================================================
// Context Utilities
// ============================================================================

/**
 * Create a fresh browser context for isolated exploration
 */
export async function createFreshContext(
  baseContext: BrowserContext
): Promise<BrowserContext> {
  const browser = baseContext.browser();
  if (!browser) {
    throw new Error('No browser available');
  }
  
  return browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'BookingExplorer/1.0 (Automated Booking Discovery Tool)',
    ignoreHTTPSErrors: true,
  });
}

// ============================================================================
// Date/Time Utilities
// ============================================================================

/**
 * Get ISO timestamp
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format duration in human-readable form
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

