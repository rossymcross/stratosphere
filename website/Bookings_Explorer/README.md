# 🔍 Booking Explorer

A comprehensive, automated booking flow discovery and exploration tool built with Playwright and TypeScript.

## Overview

Booking Explorer crawls websites to discover and analyze all booking flows, including:

- **Product/Experience Discovery** - Finds all bookable products, experiences, and packages
- **Group Size Analysis** - Identifies party size options and detects separate paths for large groups (16+, corporate, etc.)
- **Add-ons & Extras Detection** - Captures all upsells, food packages, decorations, and optional upgrades
- **High-Revenue Path Detection** - Specifically identifies when large group bookings diverge into enquiry forms or corporate booking flows
- **Structured Reporting** - Generates both JSON and human-readable Markdown reports

## Installation

```bash
# Clone the repository (or copy the files)
cd Bookings_Explorer

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Quick Start

```bash
# Basic usage - explore a website
npm run explore -- --base-url https://example.com

# With visible browser (for debugging)
npm run explore -- -u https://example.com --no-headless

# Limit crawl scope
npm run explore -- -u https://example.com --max-pages 50 --max-depth 3
```

## Usage

### Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--base-url <url>` | `-u` | Base URL to start crawling from | `http://localhost:3000` |
| `--max-pages <n>` | `-p` | Maximum pages to visit during crawl | unlimited |
| `--max-depth <n>` | `-d` | Maximum link depth to follow | unlimited |
| `--max-flows <n>` | | Maximum booking flows to explore | unlimited |
| `--no-headless` | | Run with visible browser | `false` |
| `--no-screenshots` | | Disable screenshot capture | `false` |
| `--output-dir <path>` | `-o` | Output directory for reports | `./reports` |
| `--page-timeout <ms>` | | Timeout for page loads | `30000` |
| `--action-timeout <ms>` | | Timeout for individual actions | `15000` |
| `--action-delay <ms>` | | Delay between actions | `500` |
| `--retries <n>` | | Number of retries for failed actions | `3` |

**Note:** By default, the explorer runs without any limits - it will crawl all discoverable pages and explore all booking flows until complete.

### Environment Variables

All options can also be set via environment variables:

```bash
BASE_URL=https://example.com \
MAX_PAGES=50 \
MAX_DEPTH=3 \
HEADLESS=false \
npm run explore
```

## Output

The tool generates reports in the `reports/` directory (or your specified output directory):

### report.json

Structured JSON containing all discovered booking data:

```json
{
  "baseUrl": "https://example.com",
  "generatedAt": "2025-12-01T12:00:00Z",
  "stats": {
    "pagesVisited": 45,
    "triggersFound": 8,
    "flowsExplored": 5,
    "addOnsFound": 12
  },
  "bookings": [
    {
      "id": "abc123",
      "name": "Kids Party Package",
      "entryPoints": [...],
      "flows": [
        {
          "flowType": "standard",
          "groupSizeMode": "min",
          "groupSize": 4,
          "steps": [...]
        },
        {
          "flowType": "high_revenue",
          "groupSizeMode": "max",
          "groupSize": "16+",
          "steps": [...]
        }
      ]
    }
  ]
}
```

### report.md

Human-readable Markdown report with:
- Summary statistics
- Quick overview of all bookings
- Detailed breakdown of each booking flow
- All add-ons summary table
- ⚠️ High-revenue path alerts

### screenshots/

Directory containing screenshots of each booking flow step (if enabled).

## How It Works

### Phase 1: Site Crawling

1. Starts from the configured base URL
2. Uses a priority queue-based crawler
3. Visits internal links only (same domain)
4. Respects max page and depth limits
5. Prioritizes booking-related URLs
6. Detects booking triggers on each page

### Phase 2: Booking Detection

Identifies booking triggers by looking for:
- Buttons/links with booking keywords: "book", "reserve", "buy tickets", "check availability", "enquire", etc.
- Data attributes suggesting booking functionality
- Prominent CTAs and call-to-action elements

### Phase 3: Flow Exploration

For each detected booking trigger:

1. **Extracts product name** from page title/headings
2. **Identifies group size controls** (dropdowns, steppers, inputs)
3. **Determines min/max group sizes**
4. **Explores with minimum size** - progresses through all steps
5. **Explores with maximum size** - follows divergent paths (16+, large groups)
6. **Captures add-ons** at each step
7. **Stops before payment** - never completes actual bookings

### Phase 4: Report Generation

Compiles all findings into structured JSON and readable Markdown.

## Customization

### Adjusting Detection Heuristics

Edit `src/detectors.ts` to modify:

```typescript
// Keywords that trigger booking detection
const BOOKING_KEYWORDS = [
  'book', 'reserve', 'buy tickets', ...
];

// Data attribute patterns
const DATA_ATTRIBUTE_PATTERNS = [
  /book/i, /reserv/i, ...
];

// Confidence scoring weights
const CONFIDENCE_WEIGHTS = {
  exactKeywordMatch: 0.4,
  partialKeywordMatch: 0.2,
  ...
};
```

### Adding Custom Extractors

Edit `src/extractors.ts` to add site-specific extraction logic:

```typescript
// Add custom selectors for your site's add-ons
const containerSelectors = [
  '.add-ons', '.extras', '.your-custom-selector', ...
];
```

### Modifying Flow Navigation

Edit `src/flowExplorer.ts` to customize how the tool navigates through booking steps:

```typescript
// Add custom "next" button selectors
const buttonSelectors = [
  'button:has-text("Next")',
  'button:has-text("Continue")',
  '.your-custom-next-button',
  ...
];
```

## Architecture

```
src/
├── bookingExplorer.ts    # Main entry point
├── config.ts             # Configuration management
├── types.ts              # TypeScript interfaces
├── crawler.ts            # Queue-based site crawler
├── detectors.ts          # Booking trigger detection
├── extractors.ts         # DOM data extraction
├── flowExplorer.ts       # Booking flow exploration
├── reportGenerator.ts    # Report generation
└── utils.ts              # Helper utilities
```

## Best Practices

1. **Start with smaller limits** when testing against new sites:
   ```bash
   npm run explore -- -u https://example.com -p 20 -d 2
   ```

2. **Use visible browser** to debug issues:
   ```bash
   npm run explore -- -u https://example.com --no-headless
   ```

3. **Increase timeouts** for slow sites:
   ```bash
   npm run explore -- -u https://example.com --page-timeout 60000
   ```

4. **Review intermediate results** in `reports/crawl-results.json` if exploration fails

## Robustness Features

- **Timeout handling** with configurable retries
- **Safe clicking** with visibility and enabled checks
- **Infinite loop detection** during flow exploration
- **Payment page detection** to stop before checkout
- **Graceful error handling** with partial report generation
- **Network idle waiting** for dynamic content

## Limitations

- Does not fill in actual booking details (names, emails, etc.)
- Stops at payment pages - never processes real transactions
- May not detect all booking widgets on heavily JavaScript-rendered sites
- Custom booking systems may require heuristic adjustments

## Troubleshooting

### "No booking triggers found"

- Increase `--max-pages` and `--max-depth`
- Check if the site uses non-standard booking terminology
- Add custom keywords to `detectors.ts`

### "Click did not lead to a booking flow"

- The site may use modals or overlays - check `flowExplorer.ts` for modal detection
- Increase action timeout with `--action-timeout`

### Screenshots not appearing

- Ensure `--no-screenshots` is not set
- Check write permissions on output directory

## License

MIT

## Contributing

Contributions are welcome! Please read through the codebase structure and add appropriate tests for new features.

