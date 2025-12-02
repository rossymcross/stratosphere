# UX Audit - Home Page
**URL**: https://www.stratospheresocial.com/eldersburg/

## General Observations
The homepage serves as a hub for the various attractions and offerings. It uses a visually rich layout with many images.

## UX Issues Identified
1.  **Pop-ups**: A popup for "New Years Eve" appears immediately or shortly after load. This can be intrusive for first-time visitors trying to understand what the venue is.
2.  **Text/Visual Hierarchy**:
    -   The "Hours Update" section is just a list and feels a bit tacked on visually compared to the rest of the polished design.
    -   Headings like "parties & group" and "events" appear to be split into two lines/elements. If these are coded as separate headings (H2/H3), it might be confusing for screen readers.
3.  **Accessibility**:
    -   Reliance on an overlay widget (UserWay) suggests the underlying site might not be fully accessible by default.
    -   Some text contrast over images (if any) should be checked (though most looks like dark text on light background or vice versa in dedicated sections).
4.  **Navigation**:
    -   The menu is standard but the "More" dropdown hides important information like "Hours" and "Contact Us" which are often primary user needs.
5.  **Performance**:
    -   The page loads a significant number of high-quality images. While `avif` and `webp` are used (good!), the sheer volume of image requests on load (carousel, food grid) might impact LCP (Largest Contentful Paint) on slower connections.
6.  **Carousel**:
    -   The testimonials carousel ("what our guests are saying") is a classic pattern but often has low engagement. The auto-rotation can be distracting.
7.  **Repetitive Links**:
    -   Social media links are repeated multiple times in the footer area (headings + icons).

## Recommendations
-   **Consolidate Hours**: Move the "Hours Update" into a dedicated, dismissible banner or the main "Hours" section rather than a list at the top content area.
-   **Simplify Navigation**: Bring "Hours" and "Location" to the top level navigation if space permits.
-   **Optimize Popup**: Trigger the popup only on exit intent or after a delay/scroll depth.
-   **Heading Structure**: Ensure "Parties & Group Events" is a single semantic heading.







