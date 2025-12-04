/**
 * Configuration Module
 * 
 * Handles configuration loading from environment variables and CLI arguments.
 * Provides sensible defaults for all settings.
 * 
 * Usage:
 *   # Using environment variables:
 *   BASE_URL=https://example.com MAX_PAGES=50 npm run explore
 * 
 *   # Using CLI arguments:
 *   npm run explore -- --base-url https://example.com --max-pages 50
 */

import { Command } from 'commander';
import { ExplorerConfig } from './types';
import path from 'path';

/**
 * Extract domain from URL for organizing output folders
 * e.g., "https://www.example.com/path" -> "example.com"
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname;
    
    // Remove www. prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Sanitize for use as folder name (remove invalid characters)
    return hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  } catch {
    return 'unknown';
  }
}

/**
 * Default configuration values
 * 
 * By default, the explorer runs without limits - it will crawl all pages
 * and explore all booking flows until complete.
 * 
 * Use CLI flags to limit scope if needed:
 * - --max-pages: Limit pages to visit
 * - --max-depth: Limit link depth
 * - --max-flows: Limit booking flows to explore
 */
const DEFAULT_CONFIG: ExplorerConfig = {
  baseUrl: 'http://localhost:3000',
  maxPages: Infinity,      // No limit - explore all pages
  maxDepth: Infinity,      // No limit - follow all links
  pageTimeout: 30000,      // 30 seconds for page loads
  actionTimeout: 15000,    // 15 seconds for individual actions
  headless: true,          // Run without visible browser
  outputDir: './reports',  // Where to save reports
  takeScreenshots: true,   // Capture screenshots at each step
  maxFlows: 0,             // 0 = unlimited booking flows
  actionDelay: 500,        // Delay between actions (ms)
  retries: 3,              // Retry failed actions this many times
};

/**
 * Parse command line arguments and merge with environment variables
 */
export function loadConfig(): ExplorerConfig {
  const program = new Command();
  
  program
    .name('booking-explorer')
    .description('Automated booking flow discovery and exploration tool')
    .version('1.0.0')
    .option('-u, --base-url <url>', 'Base URL to start crawling from')
    .option('-p, --max-pages <number>', 'Maximum pages to visit', parseInt)
    .option('-d, --max-depth <number>', 'Maximum link depth to follow', parseInt)
    .option('--page-timeout <ms>', 'Timeout for page loads in ms', parseInt)
    .option('--action-timeout <ms>', 'Timeout for actions in ms', parseInt)
    .option('--no-headless', 'Run with visible browser')
    .option('-o, --output-dir <path>', 'Output directory for reports')
    .option('--no-screenshots', 'Disable screenshot capture')
    .option('--max-flows <number>', 'Maximum booking flows to explore (0=unlimited)', parseInt)
    .option('--action-delay <ms>', 'Delay between actions in ms', parseInt)
    .option('--retries <number>', 'Number of retries for failed actions', parseInt);
  
  program.parse();
  const opts = program.opts();
  
  // Helper to parse number or return default (handles Infinity)
  const parseNum = (val: number | undefined, envVar: string, defaultVal: number): number => {
    if (val !== undefined) return val;
    const envNum = parseInt(process.env[envVar] || '');
    if (!isNaN(envNum) && envNum > 0) return envNum;
    return defaultVal;
  };

  // Build config by merging: defaults < env vars < CLI args
  const config: ExplorerConfig = {
    baseUrl: opts.baseUrl || process.env.BASE_URL || DEFAULT_CONFIG.baseUrl,
    maxPages: parseNum(opts.maxPages, 'MAX_PAGES', DEFAULT_CONFIG.maxPages),
    maxDepth: parseNum(opts.maxDepth, 'MAX_DEPTH', DEFAULT_CONFIG.maxDepth),
    pageTimeout: parseNum(opts.pageTimeout, 'PAGE_TIMEOUT', DEFAULT_CONFIG.pageTimeout),
    actionTimeout: parseNum(opts.actionTimeout, 'ACTION_TIMEOUT', DEFAULT_CONFIG.actionTimeout),
    headless: opts.headless !== false && process.env.HEADLESS !== 'false',
    outputDir: opts.outputDir || process.env.OUTPUT_DIR || DEFAULT_CONFIG.outputDir,
    takeScreenshots: opts.screenshots !== false && process.env.SCREENSHOTS !== 'false',
    maxFlows: parseNum(opts.maxFlows, 'MAX_FLOWS', DEFAULT_CONFIG.maxFlows),
    actionDelay: parseNum(opts.actionDelay, 'ACTION_DELAY', DEFAULT_CONFIG.actionDelay),
    retries: parseNum(opts.retries, 'RETRIES', DEFAULT_CONFIG.retries),
  };
  
  // Normalize the output directory to an absolute path
  if (!path.isAbsolute(config.outputDir)) {
    config.outputDir = path.resolve(process.cwd(), config.outputDir);
  }
  
  // Validate URL
  try {
    new URL(config.baseUrl);
  } catch {
    console.error(`Invalid base URL: ${config.baseUrl}`);
    process.exit(1);
  }
  
  // Organize output by domain
  // e.g., ./reports/stratospheresocial.com/
  const domain = extractDomain(config.baseUrl);
  config.outputDir = path.join(config.outputDir, domain);
  
  return config;
}

/**
 * Get configuration with a subset of overrides
 */
export function mergeConfig(overrides: Partial<ExplorerConfig>): ExplorerConfig {
  const base = loadConfig();
  return { ...base, ...overrides };
}

/**
 * Print current configuration to console
 */
export function printConfig(config: ExplorerConfig): void {
  const formatLimit = (val: number): string => 
    val === Infinity || val === 0 ? 'unlimited' : String(val);
  
  console.log('\n📋 Configuration:');
  console.log('─'.repeat(50));
  console.log(`  Base URL:        ${config.baseUrl}`);
  console.log(`  Max Pages:       ${formatLimit(config.maxPages)}`);
  console.log(`  Max Depth:       ${formatLimit(config.maxDepth)}`);
  console.log(`  Page Timeout:    ${config.pageTimeout}ms`);
  console.log(`  Action Timeout:  ${config.actionTimeout}ms`);
  console.log(`  Headless:        ${config.headless}`);
  console.log(`  Output Dir:      ${config.outputDir}`);
  console.log(`  Screenshots:     ${config.takeScreenshots}`);
  console.log(`  Max Flows:       ${formatLimit(config.maxFlows)}`);
  console.log(`  Action Delay:    ${config.actionDelay}ms`);
  console.log(`  Retries:         ${config.retries}`);
  console.log('─'.repeat(50) + '\n');
}

export { DEFAULT_CONFIG };

