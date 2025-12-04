# UX Specification: Brews with Bites Event Detail Page

## Document Purpose
This specification provides an exhaustive description of the "Brews with Bites" event detail page layout, visual hierarchy, interaction patterns, and component specifications. A UX designer should be able to recreate this page pixel-perfectly using only this document as reference.

---

## 1. Global Page Properties

### 1.1 Viewport & Container
- **Page Layout**: Single-page vertical scroll with full-viewport-width hero section
- **Background**: Deep navy blue (#041C2C) with subtle particle/star effect overlay
- **Max Content Width**: 1280px (7xl), horizontally centered
- **Horizontal Padding**: 16px (mobile), scales with viewport
- **Text Color Base**: White (#FFFFFF) with opacity variants
- **Accent Color**: Cyan/Aqua (#71D2EB)
- **Font Family**: Montserrat (Google Fonts) for all typography
- **Z-Index Layering**: Content sits at z-10 above background effects

---

## 2. Hero Section

### 2.1 Container Specifications
- **Height**: 40vh (mobile) / 50vh (desktop)
- **Width**: 100% viewport width (edge-to-edge)
- **Position**: Relative container with absolute-positioned children
- **Overflow**: Hidden (clips image to container bounds)

### 2.2 Hero Image Layer
- **Position**: Absolute, inset-0 (fills entire hero container)
- **Image Sizing**: `object-fit: cover` — image scales to fill while maintaining aspect ratio
- **Image Content**: Food photography showing plated dishes and beer (contextual to event theme)

### 2.3 Gradient Overlay Stack (Bottom to Top)
1. **Base Overlay**: Semi-transparent navy (#041C2C) at 40% opacity — unifies image with page theme
2. **Directional Gradient**: Three-stop vertical gradient
   - Top: Navy at 30% opacity
   - Middle: Transparent
   - Bottom: Solid navy (#041C2C) — creates seamless blend into content section

### 2.4 Hero Content Container
- **Position**: Absolute, inset-0
- **Internal Layout**: Flexbox, column direction, `justify-end` (content anchored to bottom)
- **Bottom Padding**: 48px (pb-12)
- **Max Content Width**: 768px (3xl) — constrains text block width
- **Horizontal Alignment**: Left-aligned within centered container

### 2.5 Back Navigation Button
- **Position**: Absolute, top-left corner
- **Desktop Position**: 48px from top, 16px from left
- **Mobile Position**: 32px from top, 16px from left
- **Visual Style**: Pill-shaped button with frosted glass effect
  - Background: Black at 20% opacity
  - Backdrop Filter: Blur (medium intensity ~12px)
  - Border: 1px solid white at 10% opacity
  - Border Radius: Full (rounded-full / 9999px)
  - Padding: 8px vertical, 16px horizontal
- **Content Layout**: Horizontal flex, 8px gap between icon and text
- **Icon**: Left-pointing arrow (Lucide `ArrowLeft`), 16x16px, white at 80% opacity
- **Label**: "BACK" — Montserrat Bold, 12px (xs), uppercase, letter-spacing: widest (0.1em)
- **Hover State**: 
  - Text and icon transition to accent cyan (#71D2EB)
  - Border transitions to cyan at 50% opacity
  - Transition Duration: 150-200ms ease

### 2.6 Event Type Badge
- **Position**: Above event title, with 16px bottom margin
- **Visual Style**: Pill-shaped inline badge
  - Background: Cyan at 10% opacity
  - Border: 1px solid cyan at 20% opacity
  - Border Radius: Full (pill shape)
  - Padding: 4px vertical, 12px horizontal
  - Backdrop Filter: Slight blur
- **Typography**: Montserrat Bold, 12px (xs), uppercase, letter-spacing: widest
- **Text Color**: Accent cyan (#71D2EB)
- **Content**: "TICKETED EVENT" (dynamic based on event type)

### 2.7 Event Title (H1)
- **Typography**: 
  - Font: Montserrat Black (900 weight)
  - Size: 36px mobile (4xl) / 60px desktop (6xl)
  - Letter Spacing: 0.05em (5% of font size)
  - Text Transform: Uppercase
  - Line Height: Tight (1.1-1.2)
- **Color**: Pure white (#FFFFFF)
- **Text Shadow**: Large drop shadow for depth/legibility over image
- **Bottom Margin**: 8px
- **Content**: "BREWS WITH BITES"

### 2.8 Event Subheading
- **Typography**:
  - Font: Montserrat Bold (700 weight)
  - Size: 20px mobile (xl) / 24px desktop (2xl)
  - Letter Spacing: Widest (0.1em)
  - Text Transform: Uppercase
- **Color**: Accent cyan (#71D2EB)
- **Text Shadow**: Medium drop shadow
- **Bottom Margin**: 24px
- **Content**: "GREAT FOOD. GREAT BEER. GREAT PEOPLE."

### 2.9 Event Meta Information Row
- **Layout**: Horizontal flex with wrap, 24px gap between items
- **Typography**: 14px (sm), medium weight, white at 90% opacity

#### 2.9.1 Date/Time Item
- **Layout**: Horizontal flex, 8px gap
- **Icon**: Calendar icon (Lucide `Calendar`), 20x20px, cyan (#71D2EB)
- **Text**: "Tuesday, Dec 9 • 7:00 PM"

#### 2.9.2 Location Item
- **Layout**: Horizontal flex, 8px gap
- **Icon**: Map pin icon (Lucide `MapPin`), 20x20px, cyan (#71D2EB)
- **Text**: "Stratosphere Main Hall"

---

## 3. Content Section

### 3.1 Container Specifications
- **Max Width**: 1280px (7xl), centered
- **Padding**: 16px horizontal, 48px vertical (py-12)
- **Layout**: CSS Grid
  - Mobile: Single column
  - Desktop (lg+): 12-column grid with 48px gap (gap-12)

### 3.2 Two-Column Layout

#### Left Column (Primary Content)
- **Grid Span**: 7 of 12 columns on desktop
- **Internal Layout**: Flexbox column, 32px gap between sections

#### Right Column (Booking Widget)
- **Grid Span**: 5 of 12 columns on desktop
- **Behavior**: Sticky positioning, 32px from viewport top

---

## 4. Left Column Components

### 4.1 About Section

#### 4.1.1 Section Heading
- **Typography**: Montserrat Bold, 24px (2xl), uppercase, wide letter-spacing
- **Color**: Pure white
- **Bottom Margin**: 16px
- **Content**: "ABOUT THE EVENT"

#### 4.1.2 Description Body
- **Typography**: 
  - Font: Montserrat Light (300 weight)
  - Size: 18px (lg)
  - Line Height: Relaxed (1.625)
  - White Space: Pre-line (preserves line breaks)
- **Color**: White at 80% opacity
- **Content**: Multi-paragraph event description

### 4.2 Important Information Card

#### 4.2.1 Card Container
- **Background**: White at 5% opacity
- **Border**: 1px solid white at 10% opacity
- **Border Radius**: 16px (rounded-2xl)
- **Padding**: 24px (p-6)
- **Backdrop Filter**: Slight blur for frosted glass effect

#### 4.2.2 Card Layout
- **Layout**: Horizontal flex, 16px gap
- **Icon Alignment**: Top-aligned with content (mt-1 on icon)

#### 4.2.3 Info Icon
- **Icon**: Circle-i information icon (Lucide `Info`)
- **Size**: 24x24px
- **Color**: Accent cyan (#71D2EB)
- **Flex Behavior**: Shrink-0 (maintains size)

#### 4.2.4 Card Content
- **Heading**: 
  - Typography: Bold, 14px (sm), uppercase, wide letter-spacing
  - Color: Pure white
  - Bottom Margin: 8px
  - Content: "IMPORTANT INFORMATION"
- **Body Text**:
  - Typography: 14px (sm), relaxed line height
  - Color: White at 70% opacity
  - Content: "Please arrive 15 minutes prior to the event start time. All guests must be 21+ with valid ID."

### 4.3 Photo Gallery Carousel

#### 4.3.1 Section Container
- **Top Margin**: 16px

#### 4.3.2 Header Row
- **Layout**: Horizontal flex, space-between alignment
- **Bottom Margin**: 24px

#### 4.3.3 Gallery Title
- **Typography**: Montserrat Bold, 20px (xl), uppercase, wide letter-spacing
- **Color**: Pure white
- **Content**: "CHECK OUT OUR PAST BEER DINNERS!"

#### 4.3.4 Navigation Arrows
- **Layout**: Horizontal flex, 8px gap
- **Button Style**:
  - Shape: Circular (rounded-full)
  - Size: 36x36px (p-2 with 20px icon)
  - Border: 1px solid
  - Background: Transparent
  - Transition: All properties, standard easing

##### Active State (Can Navigate)
- Border Color: Cyan (#71D2EB)
- Icon Color: Cyan (#71D2EB)
- Hover: Background fills with cyan, icon inverts to navy (#041C2C)

##### Disabled State (Boundary Reached)
- Border Color: White at 20% opacity
- Icon Color: White at 20% opacity
- Cursor: Not-allowed
- No hover effect

#### 4.3.5 Carousel Track
- **Layout**: Horizontal flex, 16px gap
- **Overflow**: Horizontal scroll with hidden scrollbar
  - `scrollbar-width: none` (Firefox)
  - `ms-overflow-style: none` (IE/Edge)
  - WebKit scrollbar hidden via CSS
- **Scroll Behavior**: Smooth (CSS scroll-behavior or JS)
- **Snap Behavior**: 
  - `scroll-snap-type: x mandatory`
  - Children: `scroll-snap-align: start`
- **Bottom Padding**: 16px (for shadow overflow)

#### 4.3.6 Gallery Image Cards
- **Dimensions**: 
  - Width: 280px mobile / 320px desktop
  - Aspect Ratio: 1:1 (square)
- **Flex Behavior**: `flex-shrink: 0` (maintains width during scroll)
- **Border Radius**: 12px (rounded-xl)
- **Overflow**: Hidden
- **Border**: 1px solid white at 10% opacity
- **Background**: White at 5% opacity (visible during image load)
- **Image Sizing**: `object-fit: cover`
- **Hover Effect**: Image scales to 110% with 500ms transition

#### 4.3.7 Photo Count Indicator
- **Position**: Below carousel, centered
- **Top Margin**: 16px
- **Typography**: 14px (sm), centered
- **Color**: White at 50% opacity
- **Content Pattern**: "{count} photos • Scroll or use arrows to browse"

---

## 5. Right Column: Booking Widget

### 5.1 Widget Container
- **Position**: Sticky, 32px from viewport top
- **Background**: Navy (#041C2C) at 80% opacity
- **Backdrop Filter**: Extra-large blur (xl ~24px)
- **Border**: 1px solid white at 10% opacity
- **Border Radius**: 32px (rounded-[32px])
- **Padding**: 32px (p-8)
- **Shadow**: 2xl (large diffuse shadow for elevation)

### 5.2 Widget Header
- **Typography**: Montserrat Bold, 20px (xl), uppercase, wide letter-spacing
- **Color**: Pure white
- **Bottom Margin**: 24px
- **Content**: "SELECT OPTIONS"

### 5.3 Ticket Option Cards

#### 5.3.1 Options Container
- **Layout**: Vertical flex, 16px gap
- **Bottom Margin**: 32px

#### 5.3.2 Option Card Base
- **Layout**: Horizontal flex, space-between, vertically centered
- **Padding**: 16px (p-4)
- **Border Radius**: 12px (rounded-xl)
- **Border**: 1px solid
- **Transition**: All properties, 300ms duration

##### Default State
- Background: White at 5% opacity
- Border Color: White at 10% opacity
- Hover: Background increases to 10%, border to 30%

##### Selected State (Quantity > 0)
- Background: Cyan at 10% opacity
- Border Color: Solid cyan (#71D2EB)
- Box Shadow: Cyan glow — `0 0 20px rgba(113,210,235,0.15)`

#### 5.3.3 Option Card Left Content
- **Layout**: Vertical flex
- **Flex Behavior**: Grows to fill, with right padding (16px)

##### Option Title
- **Typography**: Bold, 16px (base), uppercase, wide letter-spacing
- **Color**: White (default) / Cyan (when selected)
- **Bottom Margin**: 4px

##### Option Description
- **Typography**: 12px (xs), light weight, white-space: pre-line
- **Color**: White at 60% opacity

#### 5.3.4 Option Card Right Content
- **Layout**: Vertical flex, right-aligned, 12px gap
- **Flex Behavior**: Shrink-0

##### Price Display
- **Typography**: Bold, 18px (lg)
- **Color**: Pure white
- **Format**: "$XX" (dollar sign + integer)

##### Quantity Stepper
- **Container**:
  - Layout: Horizontal flex, centered, 12px gap
  - Background: Black at 20% opacity
  - Border: 1px solid white at 10% opacity
  - Border Radius: Full (pill shape)
  - Padding: 4px

###### Stepper Buttons
- **Shape**: Circular (rounded-full)
- **Size**: 24x24px (p-1 with 16px icon)
- **Background**: Transparent
- **Hover**: White at 10% opacity
- **Transition**: Background color
- **Icon**: Minus (decrement) / Plus (increment), Lucide icons, 16x16px
- **Disabled State** (decrement at 0): 30% opacity, no hover effect

###### Quantity Display
- **Typography**: Monospace font, 14px (sm), bold
- **Color**: Pure white
- **Width**: 16px, centered
- **Content**: Current quantity integer

### 5.4 Order Summary Section

#### 5.4.1 Separator
- **Top Padding**: 24px
- **Border**: 1px solid white at 10% opacity (top only)

#### 5.4.2 Total Row
- **Layout**: Horizontal flex, space-between
- **Bottom Margin**: 24px

##### Total Label
- **Typography**: 14px (sm), medium weight, uppercase, wide letter-spacing
- **Color**: White at 60% opacity
- **Content**: "TOTAL"

##### Total Amount
- **Typography**: 30px (3xl), bold
- **Color**: Accent cyan (#71D2EB)
- **Format**: "$XXX" (dynamic calculation)

### 5.5 Primary Action Button

#### 5.5.1 Button Container
- **Width**: 100%

#### 5.5.2 Button Base
- **Height**: Auto (determined by padding)
- **Padding**: 16px vertical (py-4)
- **Border Radius**: Full (9999px / rounded-full)
- **Typography**: 
  - Font: Montserrat Black (900 weight)
  - Size: 16px (base)
  - Text Transform: Uppercase
  - Letter Spacing: 0.15em (15%)
- **Shadow**: Large (lg)
- **Transition**: All properties, standard easing

#### 5.5.3 Button States

##### Enabled State (Has Items)
- Background: Cyan (#71D2EB)
- Text Color: Navy (#041C2C)
- Hover:
  - Background darkens to #5dbcd3
  - Scale: 1.02 (2% larger)
  - Shadow gains cyan tint
- Active (Pressed): Scale 0.98 (2% smaller)

##### Disabled State (No Items or Coming Soon)
- Background: White at 10% opacity
- Text Color: White at 50% opacity
- Cursor: Not-allowed
- No hover/active effects

#### 5.5.4 Button Label
- **Content**: "GET TICKETS" (or dynamic from event data)

---

## 6. Responsive Behavior Summary

### Mobile (< 1024px)
- Hero height: 40vh
- Single-column content layout
- Booking widget flows below content (not sticky)
- Gallery images: 280px width
- Back button position: 32px from top

### Desktop (≥ 1024px)
- Hero height: 50vh
- 12-column grid layout (7:5 split)
- Booking widget: Sticky positioning
- Gallery images: 320px width
- Back button position: 48px from top

---

## 7. Interaction Patterns

### 7.1 Quantity Stepper
- Increment: Always enabled, adds 1 to quantity
- Decrement: Enabled when qty > 0, subtracts 1
- Visual feedback: Card transitions to selected state when qty > 0
- Price calculation: Real-time total update

### 7.2 Gallery Carousel
- Scroll: Native horizontal scroll with momentum
- Arrow Navigation: Scrolls 80% of visible width per click
- Boundary Detection: Arrows disable at scroll limits
- Smooth scrolling: CSS `scroll-behavior: smooth`

### 7.3 Back Navigation
- Triggers parent navigation callback
- Visual hover feedback before click

### 7.4 Checkout Button
- Disabled until at least one ticket selected
- Triggers checkout flow with quantities and total

---

## 8. Color Palette Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Background | #041C2C | Page background, hero blend |
| Accent | #71D2EB | CTAs, highlights, icons, selected states |
| Accent Hover | #5dbcd3 | Button hover state |
| Text Primary | #FFFFFF | Headings, important text |
| Text Secondary | rgba(255,255,255,0.8) | Body text |
| Text Tertiary | rgba(255,255,255,0.6-0.7) | Descriptions, labels |
| Text Muted | rgba(255,255,255,0.5) | Helper text |
| Border Default | rgba(255,255,255,0.1) | Cards, dividers |
| Border Hover | rgba(255,255,255,0.3) | Interactive hover |
| Surface Elevated | rgba(255,255,255,0.05) | Card backgrounds |
| Surface Hover | rgba(255,255,255,0.1) | Hover states |

---

## 9. Typography Scale Reference

| Element | Font | Weight | Size | Transform | Spacing |
|---------|------|--------|------|-----------|---------|
| H1 (Title) | Montserrat | Black (900) | 36-60px | Uppercase | 0.05em |
| H2 (Subheading) | Montserrat | Bold (700) | 20-24px | Uppercase | 0.1em |
| H3 (Section) | Montserrat | Bold (700) | 20-24px | Uppercase | wide |
| Body | Montserrat | Light (300) | 18px | None | Normal |
| Label | Montserrat | Bold (700) | 14-16px | Uppercase | wide |
| Caption | Montserrat | Regular (400) | 12-14px | None | Normal |
| Button | Montserrat | Black (900) | 16px | Uppercase | 0.15em |

---

## 10. Iconography

All icons sourced from Lucide React library:
- `ArrowLeft` — Back navigation
- `Calendar` — Date/time indicator
- `MapPin` — Location indicator
- `Info` — Information callout
- `ChevronLeft` / `ChevronRight` — Carousel navigation
- `Minus` / `Plus` — Quantity stepper

Icon sizing: 16-24px depending on context, stroke-based rendering.

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Page: Brews with Bites Event Detail*

