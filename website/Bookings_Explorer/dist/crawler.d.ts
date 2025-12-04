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
import { ExplorerConfig, CrawlResult, BookingTrigger } from './types';
export declare class Crawler {
    private page;
    private config;
    private visited;
    private queue;
    private results;
    private allTriggers;
    constructor(page: Page, config: ExplorerConfig);
    /**
     * Main crawl method - starts from base URL and explores the site
     */
    crawl(): Promise<{
        results: CrawlResult[];
        triggers: BookingTrigger[];
    }>;
    /**
     * Add a URL to the crawl queue
     */
    private enqueue;
    /**
     * Check if URL should be skipped (e.g., assets, downloads, blogs)
     */
    private shouldSkipUrl;
    /**
     * Visit a single page and extract information
     */
    private visitPage;
    /**
     * Extract all internal links from current page
     */
    private extractLinks;
    /**
     * Remove duplicate triggers based on URL and text
     */
    private deduplicateTriggers;
    /**
     * Get crawl statistics
     */
    getStats(): {
        pagesVisited: number;
        queueRemaining: number;
        triggersFound: number;
    };
}
/**
 * Quick crawl function for simple usage
 */
export declare function quickCrawl(page: Page, config: ExplorerConfig): Promise<{
    results: CrawlResult[];
    triggers: BookingTrigger[];
}>;
//# sourceMappingURL=crawler.d.ts.map