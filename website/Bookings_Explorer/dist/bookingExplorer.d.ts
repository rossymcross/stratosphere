#!/usr/bin/env ts-node
/**
 * Booking Explorer - Main Entry Point
 *
 * Automated booking flow discovery and exploration tool.
 *
 * This tool crawls a website to discover all booking flows, explores each flow
 * to understand the booking process, and generates comprehensive reports.
 *
 * Usage:
 *   # Basic usage:
 *   npm run explore -- --base-url https://example.com
 *
 *   # With options:
 *   npm run explore -- -u https://example.com -p 50 -d 3 --no-headless
 *
 *   # Using environment variables:
 *   BASE_URL=https://example.com MAX_PAGES=50 npm run explore
 *
 * Output:
 *   - reports/report.json  - Structured JSON data
 *   - reports/report.md    - Human-readable Markdown report
 *   - reports/screenshots/ - Screenshots from each flow step (if enabled)
 *
 * Configuration:
 *   See config.ts for all available options and their defaults.
 *   Key options:
 *   - maxPages: Maximum pages to crawl (default: 100)
 *   - maxDepth: Maximum link depth to follow (default: 5)
 *   - maxFlows: Maximum booking flows to explore, 0=unlimited (default: 0)
 *   - headless: Run browser without GUI (default: true)
 *   - takeScreenshots: Capture screenshots at each step (default: true)
 */
export {};
//# sourceMappingURL=bookingExplorer.d.ts.map