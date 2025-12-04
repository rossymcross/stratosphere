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
import { ExplorerConfig } from './types';
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
declare const DEFAULT_CONFIG: ExplorerConfig;
/**
 * Parse command line arguments and merge with environment variables
 */
export declare function loadConfig(): ExplorerConfig;
/**
 * Get configuration with a subset of overrides
 */
export declare function mergeConfig(overrides: Partial<ExplorerConfig>): ExplorerConfig;
/**
 * Print current configuration to console
 */
export declare function printConfig(config: ExplorerConfig): void;
export { DEFAULT_CONFIG };
//# sourceMappingURL=config.d.ts.map