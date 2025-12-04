import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Booking Explorer.
 * This config is primarily used for the browser settings.
 */
export default defineConfig({
  // Timeout for each action
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Run tests in parallel
  fullyParallel: false,

  // Reporter
  reporter: 'html',

  // Shared settings for all projects
  use: {
    // Base URL - can be overridden by CLI
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'retain-on-failure',

    // Browser options
    headless: process.env.HEADLESS !== 'false',

    // Viewport
    viewport: { width: 1280, height: 720 },

    // User agent
    userAgent: 'BookingExplorer/1.0 (Automated Booking Discovery Tool)',

    // Ignore HTTPS errors for development sites
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

