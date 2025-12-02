# UX Audit - New Years Eve
**URL**: https://www.stratospheresocial.com/eldersburg/new-years-eve/

## General Observations
A seasonal event page promoting an upcoming ticketed party.

## UX Issues Identified
1.  **Year Specificity**:
    -   Text like "Say goodbye to 2025... welcome 2026" makes this page usable *only* for a few months a year. If a user lands here in February 2026 (via old link/SEO), it will look completely broken/outdated.
    -   Ideally, past events should redirect to a generic "Events" page or show a "This event has passed" banner.
2.  **Content Redundancy**:
    -   The bottom text ("Say goodbye to 2025...") repeats the intro paragraph almost verbatim.
3.  **Carousel**:
    -   The carousel of past NYE photos is fine, but auto-playing carousels are often ignored. A static grid of "Highlights from Last Year" might be more effective.

## Recommendations
-   **Event Status**: Add logic to show "Event Ended" if the date has passed.
-   **Clearer Ticket Grid**: Put the "DD/Under 21" and "Standard Ticket" side-by-side for easier comparison.
-   **Countdown**: A countdown timer to the event start creates urgency.







