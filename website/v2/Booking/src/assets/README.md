# Assets Organization

This folder contains all images used in the booking application, organized by their usage context.

## Folder Structure

```
assets/
├── activities/      # Activity/party type card images
├── packages/        # Bowling package tier images  
├── events/          # Special events main images
├── galleries/       # Event gallery/carousel images
│   ├── brews/       # Brews & Bites event gallery
│   └── nye/         # New Year's Eve event gallery
├── intent/          # Group size → intent selection card images
└── checkout/        # Checkout summary images
```

## Usage by Component

### `activities/` → `partyData.ts`
| File | Variable | Used In |
|------|----------|---------|
| `bowling.png` | `bowlingImg` | Party type cards |
| `arcade.png` | `arcadeImg` | Party type cards |
| `karaoke.png` | `karaokeImg` | Party type cards, Checkout |
| `nerf.png` | `nerfImg` | Party type cards |
| `arcade-racing.png` | `arcadeRacingImg` | Arcade packages |
| `arcade-vr.png` | `arcadeVrImg` | Arcade packages |
| `axe-bowl.png` | `axeBowlImg` | Axe & Bowl combo |
| `themed-karaoke.png` | `themedKaraokeImg` | Themed karaoke package, Checkout |
| `nerf-war.png` | `nerfWarImg` | Nerf war package |

### `packages/` → `partyData.ts`
| File | Variable | Used In |
|------|----------|---------|
| `strike.png` | `strikeImg` | Strike bowling package |
| `spare.png` | `spareImg` | Spare bowling package |
| `split.png` | `splitImg` | Split bowling package |

### `events/` → `eventsData.tsx`
| File | Variable | Used In |
|------|----------|---------|
| `dueling-pianos.png` | `duelingPianosImg` | Dueling Pianos event |
| `brews.png` | `brewsImg` | Brews & Bites event |
| `nye.png` | `nyeImg` | New Year's Eve event |
| `trivia.png` | `triviaImg` | Trivia night event |
| `pints-punts.png` | `pintsPuntsImg` | Pints & Punts event |
| `axes-ales.png` | `axesAlesImg` | Axes & Ales event |

### `galleries/` → `eventsData.tsx`

#### `galleries/brews/` - Brews & Bites Event
| File | Variable | Used In |
|------|----------|---------|
| `brews-1.png` | `brewsGallery1` | Brews event carousel |
| `brews-2.png` | `brewsGallery2` | Brews event carousel |
| `brews-3.png` | `brewsGallery3` | Brews event carousel |

#### `galleries/nye/` - New Year's Eve Event
| File | Variable | Used In |
|------|----------|---------|
| `nye-1.png` | `nyeGallery1` | NYE event carousel |
| `nye-2.png` | `nyeGallery2` | NYE event carousel |
| `nye-3.png` | `nyeGallery3` | NYE event carousel |

### `intent/` → `IntentSelection.tsx`
| File | Variable | Used In |
|------|----------|---------|
| `events.png` | `eventsImg` | "Special Events" selection card |
| `party.png` | `partyImg` | "Party Packages" selection card |
| `axe.png` | `axeImg` | "Axe Throwing" selection card |

### `checkout/` → `CheckoutSummary.tsx`
| File | Variable | Used In |
|------|----------|---------|
| `bowling-summary.png` | `bowlingSummaryImage` | Checkout summary header |

## Import Pattern

```typescript
// From components folder
import bowlingImg from "../assets/activities/bowling.png";

// From nested components folder (e.g., checkout/, events/)
import bowlingImg from "../../assets/activities/bowling.png";
```

## Adding New Images

1. Place the image in the appropriate folder based on where it will be used
2. Use a descriptive, kebab-case filename (e.g., `new-activity.png`)
3. Import using the relative path pattern shown above
4. Update this README with the new file's usage information

