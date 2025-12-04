#!/usr/bin/env ts-node
"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const config_1 = require("./config");
const crawler_1 = require("./crawler");
const flowExplorer_1 = require("./flowExplorer");
const reportGenerator_1 = require("./reportGenerator");
const utils_1 = require("./utils");
const promises_1 = __importDefault(require("fs/promises"));
// ============================================================================
// Main Execution
// ============================================================================
async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║           🔍 BOOKING EXPLORER v1.0                           ║');
    console.log('║     Automated Booking Flow Discovery & Exploration Tool      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    // Load configuration
    const config = (0, config_1.loadConfig)();
    (0, config_1.printConfig)(config);
    // Initialize report
    const report = (0, reportGenerator_1.createEmptyReport)(config.baseUrl, {
        maxPages: config.maxPages,
        maxDepth: config.maxDepth,
        maxFlows: config.maxFlows,
        headless: config.headless,
        takeScreenshots: config.takeScreenshots,
    });
    report.startedAt = (0, utils_1.getTimestamp)();
    // Ensure output directory exists
    await promises_1.default.mkdir(config.outputDir, { recursive: true });
    let browser = null;
    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await playwright_1.chromium.launch({
            headless: config.headless,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
            ],
        });
        // Create main page for crawling
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BookingExplorer/1.0',
            ignoreHTTPSErrors: true,
        });
        const page = await context.newPage();
        page.setDefaultTimeout(config.actionTimeout);
        page.setDefaultNavigationTimeout(config.pageTimeout);
        // ========================================================================
        // Phase 1: Site Crawling
        // ========================================================================
        console.log('\n' + '═'.repeat(60));
        console.log('📡 PHASE 1: Site Crawling');
        console.log('═'.repeat(60));
        const crawler = new crawler_1.Crawler(page, config);
        const crawlResult = await crawler.crawl();
        // Update report stats
        report.stats.pagesVisited = crawlResult.results.length;
        report.stats.triggersFound = crawlResult.triggers.length;
        report.stats.failedPages = crawlResult.results.filter(r => r.errors.length > 0).length;
        // Log crawl summary
        console.log('\n📊 Crawl Summary:');
        console.log(`   Pages visited: ${report.stats.pagesVisited}`);
        console.log(`   Booking triggers found: ${report.stats.triggersFound}`);
        console.log(`   Failed pages: ${report.stats.failedPages}`);
        // Save intermediate results
        await saveIntermediateResults(config.outputDir, 'crawl-results.json', {
            results: crawlResult.results,
            triggers: crawlResult.triggers,
        });
        // ========================================================================
        // Phase 2: Booking Flow Exploration
        // ========================================================================
        if (crawlResult.triggers.length > 0) {
            console.log('\n' + '═'.repeat(60));
            console.log('🎯 PHASE 2: Booking Flow Exploration');
            console.log('═'.repeat(60));
            // Sort triggers by confidence (highest first)
            const sortedTriggers = crawlResult.triggers.sort((a, b) => b.confidence - a.confidence);
            // Log top triggers
            console.log('\nTop booking triggers to explore:');
            for (const trigger of sortedTriggers.slice(0, 10)) {
                console.log(`   - "${trigger.text}" (${(trigger.confidence * 100).toFixed(0)}%) on ${trigger.sourceUrl}`);
            }
            // Close crawl page/context - we'll create fresh ones for exploration
            await context.close();
            // Explore booking flows
            const flowExplorer = new flowExplorer_1.FlowExplorer(browser, config);
            const bookings = await flowExplorer.exploreAll(sortedTriggers);
            report.bookings = bookings;
            // Get package discoveries
            const packageDiscoveries = flowExplorer.getBookingSystemDiscoveries();
            // Log exploration summary
            console.log('\n📊 Exploration Summary:');
            console.log(`   Booking flows explored: ${bookings.length}`);
            console.log(`   Booking systems scraped: ${packageDiscoveries.length}`);
            // Count total packages
            const totalPackages = packageDiscoveries.reduce((sum, d) => sum + d.packages.length, 0);
            console.log(`   Total packages found: ${totalPackages}`);
            for (const booking of bookings) {
                const standardFlows = booking.flows.filter(f => f.flowType === 'standard').length;
                const highRevenueFlows = booking.flows.filter(f => f.flowType === 'high_revenue').length;
                console.log(`   - ${booking.name}: ${standardFlows} standard, ${highRevenueFlows} high-revenue`);
            }
            // Save package reports if we found any
            if (packageDiscoveries.length > 0) {
                console.log('\n📦 Saving package details...');
                await (0, reportGenerator_1.generatePackageReports)(packageDiscoveries, config.outputDir);
            }
        }
        else {
            console.log('\n⚠️ No booking triggers found - skipping flow exploration');
            await context.close();
        }
        // ========================================================================
        // Phase 3: Report Generation
        // ========================================================================
        console.log('\n' + '═'.repeat(60));
        console.log('📝 PHASE 3: Report Generation');
        console.log('═'.repeat(60));
        // Finalize report
        report.completedAt = (0, utils_1.getTimestamp)();
        report.durationMs = new Date(report.completedAt).getTime() -
            new Date(report.startedAt).getTime();
        (0, reportGenerator_1.updateReportStats)(report);
        // Generate reports
        const { jsonPath, mdPath } = await (0, reportGenerator_1.generateReports)(report, config.outputDir);
        // ========================================================================
        // Final Summary
        // ========================================================================
        console.log('\n' + '═'.repeat(60));
        console.log('✅ EXPLORATION COMPLETE');
        console.log('═'.repeat(60));
        console.log(`\n📊 Final Statistics:`);
        console.log(`   Total duration: ${(0, utils_1.formatDuration)(report.durationMs)}`);
        console.log(`   Pages visited: ${report.stats.pagesVisited}`);
        console.log(`   Booking triggers found: ${report.stats.triggersFound}`);
        console.log(`   Booking flows explored: ${report.stats.flowsExplored}`);
        console.log(`   Unique add-ons found: ${report.stats.addOnsFound}`);
        console.log(`\n📁 Reports saved to:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   Markdown: ${mdPath}`);
        console.log(`   Packages: ${config.outputDir}/packages.json`);
        console.log(`   Package Report: ${config.outputDir}/PACKAGES.md`);
        // List any high-revenue paths found
        const highRevenuePaths = report.bookings.filter(b => b.flows.some(f => f.flowType === 'high_revenue'));
        if (highRevenuePaths.length > 0) {
            console.log(`\n💰 High-Revenue Paths Detected:`);
            for (const booking of highRevenuePaths) {
                const hrFlow = booking.flows.find(f => f.flowType === 'high_revenue');
                console.log(`   - ${booking.name} (group size ${hrFlow?.groupSize})`);
            }
        }
        console.log('\n');
    }
    catch (error) {
        console.error('\n❌ Fatal error:', error);
        report.errors.push(error instanceof Error ? error.message : 'Unknown error');
        // Still try to generate a partial report
        try {
            report.completedAt = (0, utils_1.getTimestamp)();
            report.durationMs = new Date(report.completedAt).getTime() -
                new Date(report.startedAt).getTime();
            await (0, reportGenerator_1.generateReports)(report, config.outputDir);
            console.log('\n📄 Partial report saved despite errors');
        }
        catch {
            // Report generation failed too
        }
        process.exit(1);
    }
    finally {
        // Cleanup
        if (browser) {
            await browser.close();
        }
    }
}
/**
 * Save intermediate results for debugging
 */
async function saveIntermediateResults(outputDir, filename, data) {
    try {
        const filepath = `${outputDir}/${filename}`;
        await promises_1.default.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`   💾 Saved: ${filepath}`);
    }
    catch {
        // Non-critical, ignore
    }
}
// ============================================================================
// Error Handling
// ============================================================================
process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('\n❌ Unhandled rejection:', reason);
    process.exit(1);
});
// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\n⚠️ Interrupted by user');
    process.exit(0);
});
// ============================================================================
// Run
// ============================================================================
main();
//# sourceMappingURL=bookingExplorer.js.map