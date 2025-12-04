/**
 * Report Generator Module
 *
 * Generates structured reports from booking exploration results:
 * - JSON report with full structured data
 * - Markdown report for human readability
 * - Package details report with all bookable options
 *
 * Reports include:
 * - Summary statistics
 * - All discovered bookings and their flows
 * - Detailed package information (inclusions, pricing, guest configs)
 * - Add-ons and extras
 * - Special notes for high-revenue paths
 */
import { ExplorerReport, ExplorerConfig, BookingSystemDiscovery } from './types';
/**
 * Generate and save all reports
 */
export declare function generateReports(report: ExplorerReport, outputDir: string): Promise<{
    jsonPath: string;
    mdPath: string;
}>;
/**
 * Create an empty report structure
 */
export declare function createEmptyReport(baseUrl: string, config: Partial<ExplorerConfig>): ExplorerReport;
/**
 * Update report statistics
 */
export declare function updateReportStats(report: ExplorerReport): void;
/**
 * Generate and save package details reports
 */
export declare function generatePackageReports(discoveries: BookingSystemDiscovery[], outputDir: string): Promise<{
    jsonPath: string;
    mdPath: string;
}>;
//# sourceMappingURL=reportGenerator.d.ts.map