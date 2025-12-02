# Stratosphere Social Website Audit

This folder contains a comprehensive UX audit of the Stratosphere Social website (Eldersburg location).

## Scope
The following pages were audited to capture the current state of the site's structure, content, and user experience:

### Core Pages
1.  **Home**: `stratosphere_audit/home/` - The main landing page.
2.  **Hours**: `stratosphere_audit/hours/` - Operating hours and holiday schedule.
3.  **Contact Us**: `stratosphere_audit/contact_us/` - Contact form and location info.
4.  **Look Inside**: `stratosphere_audit/look_inside/` - Virtual tour and image gallery.

### Food & Drink
5.  **Food Menu**: `stratosphere_audit/food_menu/` - Main restaurant menu.
6.  **Drink Menu**: `stratosphere_audit/drink_menu/` - Cocktails and beer list.
7.  **Brews with Bites**: `stratosphere_audit/brews_bites/` - Special dining event page.

### Attractions
8.  **Attractions & Specials**: `stratosphere_audit/attractions/` - Hub page for activities.
9.  **Bowling**: `stratosphere_audit/bowling/` - Pricing and info for bowling.
10. **Arcade**: `stratosphere_audit/arcade/` - Card system and info.
11. **XD Theater**: `stratosphere_audit/xd_theater/` - 7D ride info.
12. **Axe Throwing**: `stratosphere_audit/axe_throwing/` - Pricing and waiver info.

### Events
13. **Parties & Events**: `stratosphere_audit/parties_events/` - Main booking page for groups.
14. **Dueling Pianos**: `stratosphere_audit/dueling_pianos/` - Ticketed event page.
15. **Trivia Night**: `stratosphere_audit/trivia_night/` - Weekly event info.
16. **New Years Eve**: `stratosphere_audit/new_years_eve/` - Seasonal event template.

## Structure
For each page, a corresponding folder exists containing:
-   `screenshot.png`: Full-page screenshot.
-   `content.txt`: Raw text content of the page.
-   `ux_audit.md`: A report detailing UX observations, issues, and recommendations.
-   `images/`: (Or directly in the folder) Downloaded image assets found on the page.

## Key Findings Summary

### 1. Accessibility & SEO Critical Failures
-   **Menus as Images**: Both Food and Drink menus rely on large image files for their content. This is a major accessibility barrier (screen readers can't read it) and prevents SEO indexing of menu items.
-   **Missing Alt Text**: Many images are used as content (e.g., pricing tables, event flyers) without proper text alternatives.

### 2. Navigation & Hierarchy
-   **Deep Nesting**: Some key info (like specific event pricing) is buried deep in text blocks.
-   **Inconsistent CTAs**: Buttons vary in label ("Click here", "Book Now", "coming soon") and destination (some go to external booking sites, some are dead ends).
-   **Redundancy**: Contact info and hours are often repeated in the body content immediately above the footer where they also appear.

### 3. Content & Layout
-   **Visual Overload**: Pages like "Look Inside" and "Brews with Bites" dump dozens of images into the DOM, likely hurting load times and overwhelming users.
-   **Pricing Clarity**: Pricing is often hidden in text paragraphs or low-contrast lists. It should be tabular and scannable.
-   **Dated Content**: Seasonal pages (NYE) and event text ("2025") risk looking abandoned if not updated dynamically.

## Recommendations for v2
1.  **Digitize Menus**: Build HTML/CSS menus for Food & Drink.
2.  **Component Library**: Create standard components for:
    -   **Pricing Tables**: Clean, responsive grids for Bowling/Axe Throwing.
    -   **Event Cards**: Consistent layout for upcoming events (Image + Title + Date + CTA).
    -   **Image Galleries**: Curated, lazy-loaded grids with captions.
3.  **Booking Flow**: Streamline the path to "Book Now" (external link) and "Sign Waiver".
4.  **Dynamic Data**: Use a CMS or structured data for Hours and Events to prevent stale content.
