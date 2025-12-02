# UX Audit - Look Inside
**URL**: https://www.stratospheresocial.com/eldersburg/look-inside/

## General Observations
A virtual tour page featuring an iframe (likely Matterport or similar) and a gallery of images.

## UX Issues Identified
1.  **Image Dump**:
    -   Below the 360 tour, there is a MASSIVE grid of images (over 30!) with no categorization or captions. It's just a wall of thumbnails.
2.  **Loading Time**:
    -   The sheer number of images will impact page load speed significantly on mobile data.
3.  **Context**:
    -   The images are just there. Grouping them into "Bowling Area," "Arcade," "Restaurant" would make them much more useful.

## Recommendations
-   **Curated Gallery**: Select the top 10-12 best images and display them in a categorized layout.
-   **Lazy Loading**: Ensure images are lazy-loaded (this might be happening, but the sheer DOM size is an issue).
-   **Captions**: Add captions so users know what they are looking at (e.g., "VIP Bowling Suite").







