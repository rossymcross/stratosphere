# UX Audit - Donation Requests
**URL**: https://www.stratospheresocial.com/eldersburg/donation-requests/

## General Observations
A form-based page for community engagement.

## UX Issues Identified
1.  **Form Length**:
    -   The embedded Tripleseat form is quite long and visually disjointed from the rest of the site's styling.
2.  **Mobile Experience**:
    -   Embedded forms often have scrolling issues on mobile (iframe within a scrollable page).
3.  **Clarity**:
    -   The text block explaining the two types of requests ("In Kind" vs "Restaurant Night") is dense. Bullet points would help distinguish the requirements for each.

## Recommendations
-   **Split Paths**: Use two separate buttons ("Request Donation" vs "Host Fundraiser") that open specific forms or modal windows, rather than one giant form for everything.
-   **Style Integration**: Apply custom CSS to the iframe if allowed, or build a native form that posts to their API to ensure brand consistency.







