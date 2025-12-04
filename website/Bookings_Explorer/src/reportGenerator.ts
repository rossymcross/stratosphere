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

import { 
  ExplorerReport, 
  BookingFlow, 
  FlowVariation, 
  AddOn, 
  ExplorerConfig,
  BookingSystemDiscovery,
  BookablePackage,
  PackageInclusion,
} from './types';
import { formatDuration } from './utils';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Generate and save all reports
 */
export async function generateReports(
  report: ExplorerReport,
  outputDir: string
): Promise<{ jsonPath: string; mdPath: string }> {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate JSON report
  const jsonPath = path.join(outputDir, 'report.json');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n📄 JSON report saved: ${jsonPath}`);
  
  // Generate Markdown report
  const mdPath = path.join(outputDir, 'report.md');
  const markdown = generateMarkdownReport(report);
  await fs.writeFile(mdPath, markdown, 'utf-8');
  console.log(`📝 Markdown report saved: ${mdPath}`);
  
  return { jsonPath, mdPath };
}

/**
 * Generate a Markdown report from the exploration results
 */
function generateMarkdownReport(report: ExplorerReport): string {
  const lines: string[] = [];
  
  // Header
  lines.push('# Booking Explorer Report');
  lines.push('');
  lines.push(`**Base URL:** ${report.baseUrl}`);
  lines.push(`**Generated:** ${report.completedAt}`);
  lines.push(`**Duration:** ${formatDuration(report.durationMs)}`);
  lines.push('');
  
  // Summary Statistics
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Pages Visited | ${report.stats.pagesVisited} |`);
  lines.push(`| Booking Triggers Found | ${report.stats.triggersFound} |`);
  lines.push(`| Booking Flows Explored | ${report.stats.flowsExplored} |`);
  lines.push(`| Unique Add-ons Found | ${report.stats.addOnsFound} |`);
  lines.push(`| Failed Pages | ${report.stats.failedPages} |`);
  lines.push('');
  
  // Quick Overview
  if (report.bookings.length > 0) {
    lines.push('## Quick Overview');
    lines.push('');
    
    for (const booking of report.bookings) {
      const hasHighRevenue = booking.flows.some(f => f.flowType === 'high_revenue');
      const hasEnquiry = booking.flows.some(f => f.flowType === 'enquiry');
      
      let icon = '📋';
      if (hasHighRevenue) icon = '💰';
      else if (hasEnquiry) icon = '📝';
      
      const groupRange = formatGroupSizeRange(booking);
      
      lines.push(`- ${icon} **${booking.name}** - ${groupRange}${hasHighRevenue ? ' ⚠️ Has separate large group path' : ''}`);
    }
    lines.push('');
  }
  
  // Detailed Bookings
  lines.push('## Discovered Bookings');
  lines.push('');
  
  if (report.bookings.length === 0) {
    lines.push('*No booking flows were discovered.*');
    lines.push('');
  } else {
    for (let i = 0; i < report.bookings.length; i++) {
      const booking = report.bookings[i];
      lines.push(...generateBookingSection(booking, i + 1));
    }
  }
  
  // All Add-ons Summary
  const allAddOns = collectAllAddOns(report.bookings);
  if (allAddOns.length > 0) {
    lines.push('## All Add-ons Summary');
    lines.push('');
    lines.push('| Add-on | Category | Price | Optional | Found In |');
    lines.push('|--------|----------|-------|----------|----------|');
    
    for (const { addon, bookingName } of allAddOns) {
      lines.push(`| ${addon.name} | ${formatCategory(addon.category)} | ${addon.price || 'N/A'} | ${addon.optional ? 'Yes' : 'No'} | ${bookingName} |`);
    }
    lines.push('');
  }
  
  // High Revenue Paths Alert
  const highRevenuePaths = report.bookings.filter(b => 
    b.flows.some(f => f.flowType === 'high_revenue')
  );
  
  if (highRevenuePaths.length > 0) {
    lines.push('## ⚠️ High Revenue Booking Paths');
    lines.push('');
    lines.push('The following bookings have separate paths for large groups or corporate bookings:');
    lines.push('');
    
    for (const booking of highRevenuePaths) {
      const hrFlows = booking.flows.filter(f => f.flowType === 'high_revenue');
      
      lines.push(`### ${booking.name}`);
      lines.push('');
      
      for (const flow of hrFlows) {
        lines.push(`**Trigger:** Group size ${flow.groupSize}`);
        lines.push('');
        
        if (flow.steps.length > 0) {
          lines.push('**Path:**');
          for (const step of flow.steps) {
            lines.push(`1. ${step.description} - \`${step.url}\``);
            
            if (step.formFields.length > 0) {
              lines.push('   - Required fields: ' + 
                step.formFields
                  .filter(f => f.required)
                  .map(f => f.name)
                  .join(', ')
              );
            }
          }
          lines.push('');
        }
      }
    }
  }
  
  // Errors
  if (report.errors.length > 0) {
    lines.push('## Errors');
    lines.push('');
    for (const error of report.errors) {
      lines.push(`- ${error}`);
    }
    lines.push('');
  }
  
  // Configuration
  lines.push('## Configuration Used');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(report.config, null, 2));
  lines.push('```');
  lines.push('');
  
  // Footer
  lines.push('---');
  lines.push('*Generated by Booking Explorer v1.0*');
  
  return lines.join('\n');
}

/**
 * Generate a section for a single booking
 */
function generateBookingSection(booking: BookingFlow, index: number): string[] {
  const lines: string[] = [];
  
  lines.push(`### ${index}. ${booking.name}`);
  lines.push('');
  
  if (booking.description) {
    lines.push(`> ${booking.description}`);
    lines.push('');
  }
  
  // Entry Points
  lines.push('**Entry Points:**');
  for (const entry of booking.entryPoints) {
    lines.push(`- "${entry.triggerText}" on \`${entry.sourceUrl}\``);
    if (entry.destinationUrl) {
      lines.push(`  → \`${entry.destinationUrl}\``);
    }
  }
  lines.push('');
  
  // Group Size Configuration
  if (booking.groupSizeConfig) {
    const gc = booking.groupSizeConfig;
    lines.push('**Group Size Configuration:**');
    lines.push(`- Minimum: ${gc.minimum ?? 'Not specified'}`);
    lines.push(`- Maximum: ${gc.maximum ?? 'Not specified'}`);
    if (gc.hasSeparatePaths) {
      lines.push(`- ⚠️ Separate paths for groups ${gc.divergencePoint}+`);
    }
    if (gc.categories.length > 0) {
      lines.push('- Categories: ' + gc.categories.map(c => c.name).join(', '));
    }
    lines.push('');
  }
  
  // Flow Variations
  lines.push('**Flow Variations:**');
  lines.push('');
  
  for (const flow of booking.flows) {
    const flowIcon = flow.flowType === 'high_revenue' ? '💰' : 
                     flow.flowType === 'enquiry' ? '📝' : '📋';
    
    lines.push(`#### ${flowIcon} ${flow.flowType.toUpperCase()} Flow (${flow.groupSizeMode} size: ${flow.groupSize ?? 'default'})`);
    lines.push('');
    
    if (flow.steps.length === 0) {
      lines.push(`*No steps captured. Reason: ${flow.terminationReason || 'Unknown'}*`);
      lines.push('');
      continue;
    }
    
    // Steps table
    lines.push('| Step | Type | Description | URL |');
    lines.push('|------|------|-------------|-----|');
    
    for (const step of flow.steps) {
      const shortUrl = step.url.length > 50 
        ? '...' + step.url.substring(step.url.length - 47)
        : step.url;
      lines.push(`| ${step.stepOrder} | ${formatStepType(step.stepType)} | ${step.description} | \`${shortUrl}\` |`);
    }
    lines.push('');
    
    // Add-ons in this flow
    const flowAddOns = flow.steps.flatMap(s => s.addOns);
    if (flowAddOns.length > 0) {
      lines.push('**Add-ons available:**');
      for (const addon of flowAddOns) {
        const optionalTag = addon.optional ? '(optional)' : '(required)';
        lines.push(`- ${addon.name} - ${addon.price || 'Price not shown'} ${optionalTag}`);
      }
      lines.push('');
    }
    
    // Available options summary
    for (const step of flow.steps) {
      if (step.availableOptions) {
        const opts = step.availableOptions;
        if (opts.dates?.length || opts.times?.length) {
          lines.push(`**Step ${step.stepOrder} Options:**`);
          if (opts.dates?.length) {
            lines.push(`- Available dates: ${opts.dates.slice(0, 5).join(', ')}${opts.dates.length > 5 ? '...' : ''}`);
          }
          if (opts.times?.length) {
            lines.push(`- Available times: ${opts.times.slice(0, 5).join(', ')}${opts.times.length > 5 ? '...' : ''}`);
          }
          lines.push('');
        }
      }
      
      // Form fields for enquiry flows
      if (step.formFields.length > 0 && 
          (step.stepType === 'enquiry_form' || step.stepType === 'details_form')) {
        lines.push(`**Required information (Step ${step.stepOrder}):**`);
        for (const field of step.formFields.filter(f => f.required)) {
          lines.push(`- ${field.name} (${field.type})`);
        }
        lines.push('');
      }
    }
    
    // Flow completion status
    if (!flow.completed) {
      lines.push(`⚠️ *Flow incomplete: ${flow.terminationReason || 'Could not proceed further'}*`);
      lines.push('');
    }
    
    lines.push(`*Exploration time: ${formatDuration(flow.explorationTimeMs)}*`);
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  
  return lines;
}

/**
 * Format step type for display
 */
function formatStepType(type: string): string {
  const mapping: Record<string, string> = {
    group_size_selection: '👥 Size',
    date_selection: '📅 Date',
    time_selection: '🕐 Time',
    datetime_selection: '📅🕐 DateTime',
    product_selection: '📦 Product',
    addon_selection: '➕ Add-ons',
    details_form: '📝 Details',
    enquiry_form: '📨 Enquiry',
    review_summary: '📋 Review',
    payment: '💳 Payment',
    confirmation: '✅ Confirm',
    unknown: '❓ Unknown',
  };
  
  return mapping[type] || type;
}

/**
 * Format add-on category for display
 */
function formatCategory(category: string): string {
  const mapping: Record<string, string> = {
    food_drink: '🍕 Food/Drink',
    decorations: '🎈 Decorations',
    extra_time: '⏱️ Extra Time',
    upgrade: '⬆️ Upgrade',
    equipment: '🎿 Equipment',
    service: '👤 Service',
    other: '📦 Other',
  };
  
  return mapping[category] || category;
}

/**
 * Format group size range for display
 */
function formatGroupSizeRange(booking: BookingFlow): string {
  if (!booking.groupSizeConfig) {
    return 'Group size not specified';
  }
  
  const { minimum, maximum } = booking.groupSizeConfig;
  
  if (minimum === null && maximum === null) {
    return 'Group size not specified';
  }
  
  if (minimum !== null && maximum !== null) {
    return `${minimum}-${maximum} people`;
  }
  
  if (minimum !== null) {
    return `Min ${minimum} people`;
  }
  
  return `Max ${maximum} people`;
}

/**
 * Collect all add-ons from all bookings
 */
function collectAllAddOns(bookings: BookingFlow[]): Array<{ addon: AddOn; bookingName: string }> {
  const result: Array<{ addon: AddOn; bookingName: string }> = [];
  const seen = new Set<string>();
  
  for (const booking of bookings) {
    for (const flow of booking.flows) {
      for (const step of flow.steps) {
        for (const addon of step.addOns) {
          const key = `${addon.name}|${addon.price}`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push({ addon, bookingName: booking.name });
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Create an empty report structure
 */
export function createEmptyReport(
  baseUrl: string,
  config: Partial<ExplorerConfig>
): ExplorerReport {
  const now = new Date().toISOString();
  
  return {
    baseUrl,
    startedAt: now,
    completedAt: now,
    durationMs: 0,
    config,
    stats: {
      pagesVisited: 0,
      triggersFound: 0,
      flowsExplored: 0,
      addOnsFound: 0,
      failedPages: 0,
    },
    bookings: [],
    errors: [],
  };
}

/**
 * Update report statistics
 */
export function updateReportStats(report: ExplorerReport): void {
  // Count unique add-ons
  const addOnNames = new Set<string>();
  for (const booking of report.bookings) {
    for (const flow of booking.flows) {
      for (const step of flow.steps) {
        for (const addon of step.addOns) {
          addOnNames.add(addon.name);
        }
      }
    }
  }
  
  report.stats.addOnsFound = addOnNames.size;
  report.stats.flowsExplored = report.bookings.length;
}

// ============================================================================
// Package Details Report Generation
// ============================================================================

/**
 * Generate and save package details reports
 */
export async function generatePackageReports(
  discoveries: BookingSystemDiscovery[],
  outputDir: string
): Promise<{ jsonPath: string; mdPath: string }> {
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate JSON report
  const jsonPath = path.join(outputDir, 'packages.json');
  await fs.writeFile(jsonPath, JSON.stringify(discoveries, null, 2), 'utf-8');
  console.log(`\n📦 Package JSON saved: ${jsonPath}`);
  
  // Generate Markdown report
  const mdPath = path.join(outputDir, 'PACKAGES.md');
  const markdown = generatePackageMarkdownReport(discoveries);
  await fs.writeFile(mdPath, markdown, 'utf-8');
  console.log(`📦 Package report saved: ${mdPath}`);
  
  return { jsonPath, mdPath };
}

/**
 * Generate a comprehensive Markdown report of all packages
 */
function generatePackageMarkdownReport(discoveries: BookingSystemDiscovery[]): string {
  const lines: string[] = [];
  
  // Header
  lines.push('# 📦 Bookable Packages Report');
  lines.push('');
  lines.push('*Complete inventory of all bookable options with pricing and inclusions*');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  
  // Summary
  const totalPackages = discoveries.reduce((sum, d) => sum + d.packages.length, 0);
  const allCategories = [...new Set(discoveries.flatMap(d => d.categories))];
  
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Booking Systems Discovered:** ${discoveries.length}`);
  lines.push(`- **Total Packages Found:** ${totalPackages}`);
  lines.push(`- **Categories:** ${allCategories.join(', ') || 'N/A'}`);
  lines.push('');
  
  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('');
  for (let i = 0; i < discoveries.length; i++) {
    const d = discoveries[i];
    lines.push(`${i + 1}. [${d.venueName}](#${slugify(d.venueName)}) - ${d.packages.length} packages`);
  }
  lines.push('');
  
  // Each booking system
  for (const discovery of discoveries) {
    lines.push('---');
    lines.push('');
    lines.push(`## ${discovery.venueName}`);
    lines.push('');
    lines.push(`**URL:** ${discovery.url}`);
    if (discovery.platform) {
      lines.push(`**Platform:** ${discovery.platform}`);
    }
    if (discovery.venueInfo?.address) {
      lines.push(`**Address:** ${discovery.venueInfo.address}`);
    }
    lines.push(`**Scrape Time:** ${formatDuration(discovery.scrapeDurationMs)}`);
    lines.push('');
    
    // Categories
    if (discovery.categories.length > 0) {
      lines.push('### Categories');
      lines.push('');
      for (const cat of discovery.categories) {
        const catPackages = discovery.packages.filter(p => p.category === cat);
        lines.push(`- **${cat}** (${catPackages.length} packages)`);
      }
      lines.push('');
    }
    
    // Packages
    lines.push('### All Packages');
    lines.push('');
    
    // Group by category
    const byCategory = new Map<string, BookablePackage[]>();
    for (const pkg of discovery.packages) {
      const cat = pkg.category || 'Other';
      if (!byCategory.has(cat)) {
        byCategory.set(cat, []);
      }
      byCategory.get(cat)!.push(pkg);
    }
    
    for (const [category, packages] of byCategory) {
      lines.push(`#### ${category}`);
      lines.push('');
      
      for (const pkg of packages) {
        lines.push(...generatePackageSection(pkg));
      }
    }
  }
  
  // Footer
  lines.push('---');
  lines.push('');
  lines.push('*Generated by Booking Explorer v1.0*');
  
  return lines.join('\n');
}

/**
 * Generate a section for a single package
 */
function generatePackageSection(pkg: BookablePackage): string[] {
  const lines: string[] = [];
  
  lines.push(`##### 📦 ${pkg.name}`);
  lines.push('');
  
  // Source URL for verification
  if (pkg.sourceUrl) {
    lines.push(`🔗 **Source:** [View on booking site](${pkg.sourceUrl})`);
    lines.push('');
  }
  
  if (pkg.description) {
    lines.push(`> ${pkg.description}`);
    lines.push('');
  }
  
  // Pricing
  lines.push('**💰 Pricing:**');
  if (pkg.pricing.dayPricing.length > 0) {
    for (const dp of pkg.pricing.dayPricing) {
      lines.push(`- ${dp.days}: **${dp.price}**`);
    }
  } else if (pkg.pricing.basePrice) {
    lines.push(`- Base Price: **${pkg.pricing.basePrice}**`);
  } else {
    lines.push('- Contact for pricing');
  }
  if (pkg.pricing.perPersonPrice) {
    lines.push(`- Per Person: ${pkg.pricing.perPersonPrice}`);
  }
  lines.push('');
  
  // Guest Configuration
  if (pkg.guestConfig.includedGuests || pkg.guestConfig.minimumGuests || pkg.guestConfig.maximumGuests) {
    lines.push('**👥 Guests:**');
    if (pkg.guestConfig.includedGuests) {
      lines.push(`- Includes: ${pkg.guestConfig.includedGuests} guests`);
    }
    if (pkg.guestConfig.minimumGuests) {
      lines.push(`- Minimum: ${pkg.guestConfig.minimumGuests}`);
    }
    if (pkg.guestConfig.maximumGuests) {
      lines.push(`- Maximum: ${pkg.guestConfig.maximumGuests}`);
    }
    if (pkg.guestConfig.additionalGuestPrice) {
      lines.push(`- Additional guests: ${pkg.guestConfig.additionalGuestPrice} each`);
    }
    lines.push('');
  }
  
  // Duration
  if (pkg.duration) {
    lines.push(`**⏱️ Duration:** ${pkg.duration}`);
    lines.push('');
  }
  
  // Inclusions
  if (pkg.inclusions.length > 0) {
    lines.push('**✅ What\'s Included:**');
    
    // Group by category
    const byCategory = groupInclusionsByCategory(pkg.inclusions);
    for (const [category, items] of byCategory) {
      const emoji = getInclusionEmoji(category);
      lines.push(`- ${emoji} **${formatInclusionCategory(category)}:**`);
      for (const item of items) {
        lines.push(`  - ${item.item}`);
      }
    }
    lines.push('');
  }
  
  // Add-ons
  if (pkg.availableAddOns.length > 0) {
    lines.push('**➕ Available Add-ons:**');
    for (const addon of pkg.availableAddOns) {
      const price = addon.price ? ` - ${addon.price}` : '';
      const perPerson = addon.perPerson ? ' (per person)' : '';
      lines.push(`- ${addon.name}${price}${perPerson}`);
    }
    lines.push('');
  }
  
  // Restrictions
  if (pkg.restrictions.length > 0) {
    lines.push('**⚠️ Restrictions:**');
    for (const restriction of pkg.restrictions) {
      lines.push(`- ${restriction}`);
    }
    lines.push('');
  }
  
  // Raw content hint
  if (pkg.rawContent && pkg.inclusions.length === 0) {
    lines.push('<details>');
    lines.push('<summary>Raw Content (for debugging)</summary>');
    lines.push('');
    lines.push('```');
    lines.push(pkg.rawContent);
    lines.push('```');
    lines.push('</details>');
    lines.push('');
  }
  
  lines.push('');
  return lines;
}

/**
 * Group inclusions by category
 */
function groupInclusionsByCategory(inclusions: PackageInclusion[]): Map<string, PackageInclusion[]> {
  const byCategory = new Map<string, PackageInclusion[]>();
  
  for (const inc of inclusions) {
    const cat = inc.category || 'other';
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(inc);
  }
  
  return byCategory;
}

/**
 * Get emoji for inclusion category
 */
function getInclusionEmoji(category: string): string {
  const emojis: Record<string, string> = {
    activity: '🎳',
    food: '🍕',
    drink: '🍺',
    equipment: '👟',
    tickets: '🎟️',
    time: '⏱️',
    service: '👤',
    other: '📦',
  };
  return emojis[category] || '📦';
}

/**
 * Format inclusion category for display
 */
function formatInclusionCategory(category: string): string {
  const names: Record<string, string> = {
    activity: 'Activities',
    food: 'Food',
    drink: 'Drinks',
    equipment: 'Equipment',
    tickets: 'Tickets/Prizes',
    time: 'Time',
    service: 'Services',
    other: 'Other',
  };
  return names[category] || category;
}

/**
 * Create URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

