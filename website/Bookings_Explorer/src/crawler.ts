/**
 * Crawler Module
 * 
 * Implements a queue-based web crawler that:
 * - Maintains a set of visited URLs to avoid duplicates
 * - Respects configurable depth and page limits
 * - Extracts internal links from each page
 * - Identifies potential booking triggers during crawl
 * 
 * Usage:
 *   const crawler = new Crawler(page, config);
 *   const results = await crawler.crawl();
 */

import { Page } from 'playwright';
import { 
  ExplorerConfig, 
  CrawlQueueItem, 
  CrawlResult, 
  BookingTrigger 
} from './types';
import { 
  isInternalUrl, 
  normalizeUrl, 
  isBookingRelatedUrl,
  cleanText,
  waitForNetworkIdle,
  sleep,
  getTimestamp,
  generateId
} from './utils';
import { detectBookingTriggers } from './detectors';

export class Crawler {
  private page: Page;
  private config: ExplorerConfig;
  private visited: Set<string> = new Set();
  private queue: CrawlQueueItem[] = [];
  private results: CrawlResult[] = [];
  private allTriggers: BookingTrigger[] = [];
  
  constructor(page: Page, config: ExplorerConfig) {
    this.page = page;
    this.config = config;
  }
  
  /**
   * Main crawl method - starts from base URL and explores the site
   */
  async crawl(): Promise<{ results: CrawlResult[]; triggers: BookingTrigger[] }> {
    const formatLimit = (val: number): string => 
      val === Infinity ? 'unlimited' : String(val);
    
    console.log('\n🔍 Starting site crawl...');
    console.log(`   Base URL: ${this.config.baseUrl}`);
    console.log(`   Max pages: ${formatLimit(this.config.maxPages)}`);
    console.log(`   Max depth: ${formatLimit(this.config.maxDepth)}`);
    
    // Initialize queue with base URL
    this.enqueue({
      url: this.config.baseUrl,
      depth: 0,
      sourceUrl: null,
      priority: 0,
    });
    
    // Process queue
    while (this.queue.length > 0 && this.visited.size < this.config.maxPages) {
      // Sort by priority (lower = higher priority) and get next item
      this.queue.sort((a, b) => a.priority - b.priority);
      const item = this.queue.shift()!;
      
      // Skip if already visited
      if (this.visited.has(item.url)) {
        continue;
      }
      
      // Skip if too deep
      if (item.depth > this.config.maxDepth) {
        continue;
      }
      
      // Visit page
      const result = await this.visitPage(item);
      if (result) {
        this.results.push(result);
        
        // Enqueue new links
        for (const link of result.internalLinks) {
          this.enqueue({
            url: link,
            depth: item.depth + 1,
            sourceUrl: item.url,
            // Prioritize booking-related URLs
            priority: isBookingRelatedUrl(link) ? item.depth : item.depth + 10,
          });
        }
        
        // Collect triggers
        if (result.bookingTriggers.length > 0) {
          this.allTriggers.push(...result.bookingTriggers);
          console.log(`   📍 Found ${result.bookingTriggers.length} booking trigger(s) on ${item.url}`);
        }
      }
      
      // Delay between pages to be respectful
      await sleep(this.config.actionDelay);
    }
    
    console.log(`\n✅ Crawl complete: ${this.visited.size} pages visited`);
    console.log(`   Found ${this.allTriggers.length} potential booking triggers`);
    
    return {
      results: this.results,
      triggers: this.deduplicateTriggers(this.allTriggers),
    };
  }
  
  /**
   * Add a URL to the crawl queue
   */
  private enqueue(item: CrawlQueueItem): void {
    const normalizedUrl = normalizeUrl(item.url, this.config.baseUrl);
    
    // Skip external URLs
    if (!isInternalUrl(normalizedUrl, this.config.baseUrl)) {
      return;
    }
    
    // Skip already visited or queued
    if (this.visited.has(normalizedUrl)) {
      return;
    }
    
    // Skip non-HTML resources
    if (this.shouldSkipUrl(normalizedUrl)) {
      return;
    }
    
    this.queue.push({ ...item, url: normalizedUrl });
  }
  
  /**
   * Check if URL should be skipped (e.g., assets, downloads, blogs)
   */
  private shouldSkipUrl(url: string): boolean {
    const skipPatterns = [
      // File extensions
      /\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|doc|docx|xls|xlsx)$/i,
      /\.(css|js|json|xml|rss|atom)$/i,
      // WordPress admin
      /\/(wp-content|wp-admin|wp-includes)\//i,
      // Auth pages
      /\/?(login|logout|register|signup|signin|signout)/i,
      // Tracking parameters
      /\?(utm_|ref=|source=)/i,
      // Fragment-only links
      /#.+$/,
      // Non-HTTP protocols
      /mailto:/i,
      /tel:/i,
      /javascript:/i,
      // Blog and news content (not booking-related)
      /\/blog\b/i,
      /\/blogs\b/i,
      /\/news\b/i,
      /\/article/i,
      /\/articles/i,
      /\/posts?\b/i,
      /\/category\//i,
      /\/tag\//i,
      /\/author\//i,
      /\/archive/i,
      // Social and external
      /\/share\b/i,
      /\/feed\b/i,
      // Legal/info pages
      /\/privacy/i,
      /\/terms/i,
      /\/cookie/i,
      /\/gdpr/i,
      /\/sitemap/i,
    ];
    
    return skipPatterns.some(pattern => pattern.test(url));
  }
  
  /**
   * Visit a single page and extract information
   */
  private async visitPage(item: CrawlQueueItem): Promise<CrawlResult | null> {
    const { url, depth } = item;
    
    // Mark as visited
    this.visited.add(url);
    
    const maxPagesDisplay = this.config.maxPages === Infinity ? '∞' : this.config.maxPages;
    console.log(`\n📄 [${this.visited.size}/${maxPagesDisplay}] Visiting: ${url} (depth: ${depth})`);
    
    const result: CrawlResult = {
      url,
      title: '',
      internalLinks: [],
      bookingTriggers: [],
      visitedAt: getTimestamp(),
      errors: [],
    };
    
    try {
      // Navigate to page
      const response = await this.page.goto(url, {
        timeout: this.config.pageTimeout,
        waitUntil: 'domcontentloaded',
      });
      
      // Check response status
      if (!response || response.status() >= 400) {
        result.errors.push(`HTTP ${response?.status() || 'unknown'}`);
        return result;
      }
      
      // Wait for page to stabilize
      await waitForNetworkIdle(this.page, 5000);
      
      // Get page title
      result.title = await this.page.title();
      
      // Extract links
      result.internalLinks = await this.extractLinks();
      
      // Detect booking triggers
      result.bookingTriggers = await detectBookingTriggers(this.page, url);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(message);
      console.log(`   ❌ Error: ${message}`);
    }
    
    return result;
  }
  
  /**
   * Extract all internal links from current page
   */
  private async extractLinks(): Promise<string[]> {
    const links: string[] = [];
    
    try {
      // Get all anchor tags
      const anchors = await this.page.locator('a[href]').all();
      
      for (const anchor of anchors) {
        try {
          const href = await anchor.getAttribute('href');
          if (href) {
            const normalizedUrl = normalizeUrl(href, this.config.baseUrl);
            if (isInternalUrl(normalizedUrl, this.config.baseUrl)) {
              links.push(normalizedUrl);
            }
          }
        } catch {
          // Skip problematic links
        }
      }
      
      // Also look for clickable elements that might navigate
      const clickables = await this.page.locator(
        'button[onclick*="location"], [data-href], [data-url], [data-link]'
      ).all();
      
      for (const elem of clickables) {
        try {
          const dataHref = await elem.getAttribute('data-href') ||
                          await elem.getAttribute('data-url') ||
                          await elem.getAttribute('data-link');
          if (dataHref) {
            const normalizedUrl = normalizeUrl(dataHref, this.config.baseUrl);
            if (isInternalUrl(normalizedUrl, this.config.baseUrl)) {
              links.push(normalizedUrl);
            }
          }
        } catch {
          // Skip problematic elements
        }
      }
      
    } catch (error) {
      console.log(`   ⚠️ Error extracting links: ${error}`);
    }
    
    // Return unique links
    return [...new Set(links)];
  }
  
  /**
   * Remove duplicate triggers based on URL and text
   */
  private deduplicateTriggers(triggers: BookingTrigger[]): BookingTrigger[] {
    const seen = new Set<string>();
    return triggers.filter(trigger => {
      // Create a key from source URL and trigger text
      const key = `${trigger.sourceUrl}|${trigger.text}|${trigger.selector}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  /**
   * Get crawl statistics
   */
  getStats(): { pagesVisited: number; queueRemaining: number; triggersFound: number } {
    return {
      pagesVisited: this.visited.size,
      queueRemaining: this.queue.length,
      triggersFound: this.allTriggers.length,
    };
  }
}

/**
 * Quick crawl function for simple usage
 */
export async function quickCrawl(
  page: Page, 
  config: ExplorerConfig
): Promise<{ results: CrawlResult[]; triggers: BookingTrigger[] }> {
  const crawler = new Crawler(page, config);
  return crawler.crawl();
}

