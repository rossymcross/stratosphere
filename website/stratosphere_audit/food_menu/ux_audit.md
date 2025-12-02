# UX Audit - Food Menu
**URL**: https://www.stratospheresocial.com/eldersburg/food-menu/

## General Observations
This page is the primary destination for users looking to eat. It features a brief intro text and then displays the menu.

## UX Issues Identified
1.  **Menu as Images**:
    -   **Critical Issue**: The food menu is presented as a series of large images (`Copy-of-2025-Spring-Menu.jpg`, etc.).
    -   **Accessibility**: Screen readers cannot read the menu items, prices, or descriptions. Users with visual impairments are completely excluded unless there is a hidden text alternative (which doesn't appear to be robustly implemented).
    -   **Mobile Experience**: Users on mobile devices must pinch-and-zoom to read small text on the images. This is a poor user experience compared to a responsive HTML menu.
    -   **Searchability**: Users cannot Ctrl+F to find specific items (e.g., "gluten free", "burger").
    -   **SEO**: Search engines cannot index the menu content effectively.
2.  **Content**:
    -   The intro text is a bit long and generic ("Bring Your Appetite"). Users likely just want to see the food.
3.  **Navigation**:
    -   The link to "Happy Hour & Drink Menu" is at the bottom (or near it). It might be better placed prominently at the top or as a tab toggle between Food/Drinks.

## Recommendations
-   **Convert Menu to HTML**: Rebuild the menu using HTML text/lists. This improves accessibility, mobile responsiveness, and SEO.
-   **Tabs for Categories**: Use a tabbed interface for "Starters", "Main", "Dessert", "Drinks" to reduce scrolling.
-   **Price Visibility**: Ensure prices are clear and associated with items in code.
-   **Dietary Info**: Use icons or filters for GF/V/VG options if converted to HTML.







