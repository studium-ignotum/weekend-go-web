# Research: Color Palette Sync — cuoituandidau.vn → index2.html

## Tech Stack Detected
- HTML + Tailwind CSS (CDN v3 in index2.html, compiled v3.4.19 on production)
- Font: Inter (Google Fonts)
- No JS framework — static landing page

## Color Palette Comparison

### Production Site (cuoituandidau.vn) — Source of Truth

| Token | Hex | RGB | Tailwind Equivalent |
|-------|-----|-----|---------------------|
| **Primary** | `#34C759` | `rgb(52, 199, 89)` | Apple System Green |
| **Primary dark** | `#15803D` | `rgb(21, 128, 61)` | green-700 |
| **Primary darker (hover)** | `#166534` | `rgb(22, 101, 52)` | green-800 |
| **Text primary** | `#1F2937` | `rgb(31, 41, 55)` | gray-800 |
| **Text secondary** | `#374151` | `rgb(55, 65, 81)` | gray-700 |
| **Text tertiary** | `#6B7280` | `rgb(107, 114, 128)` | gray-500 |
| **Text muted** | `#9CA3AF` | `rgb(156, 163, 175)` | gray-400 |
| **Border** | `#E5E7EB` | `rgb(229, 231, 235)` | gray-200 |
| **Background warm** | `#F9FAFB` | `rgb(249, 250, 251)` | gray-50 |
| **Background hover** | `#F3F4F6` | `rgb(243, 244, 246)` | gray-100 |
| **Footer bg** | `#1F2937` | `rgb(31, 41, 55)` | gray-800 |
| **White** | `#FFFFFF` | | |
| **Black** | `#000000` | | |
| **Nav link underline** | `#34C759` | | Same as primary |

### index2.html (Current) — Needs Update

| Token | Current Hex | Production Hex | Changed? |
|-------|-------------|----------------|----------|
| primary.DEFAULT | `#22C55E` | `#34C759` | **YES** |
| primary.dark | `#16A34A` | `#15803D` | **YES** |
| primary.light | `#86EFAC` | *(removed)* | **YES** |
| accent.DEFAULT | `#FB923C` | *(removed)* | **YES** |
| accent.light | `#FED7AA` | *(removed)* | **YES** |
| text-primary | `#111827` | `#1F2937` | **YES** |
| text-secondary | `#4B5563` | `#374151` | **YES** |
| text-tertiary | `#6B7280` | `#6B7280` | No |
| footer-bg | `#292524` | `#1F2937` | **YES** |
| bg-warm | `#F9FAFB` | `#F9FAFB` | No |
| border-default | `#E5E7EB` | `#E5E7EB` | No |

## Key Findings

1. **Primary green shifted from Tailwind green-500 to Apple System Green** — `#22C55E` → `#34C759`. This is a warmer, more vibrant green.
2. **Orange accent completely removed** — Production has NO orange (`#FB923C`, `#FED7AA`). The design is now monochrome green + neutral grays.
3. **Text colors shifted lighter** — `text-primary` went from gray-900 to gray-800, `text-secondary` from gray-600 to gray-700. This creates a softer, less harsh contrast.
4. **Footer background changed** from warm stone (`#292524`) to cool gray (`#1F2937`), matching text-primary for visual consistency.
5. **Primary dark green uses green-700** (`#15803D`) for backgrounds like badges and CTAs, with **green-800** (`#166534`) for hover text states.
6. **Nav link uses accent underline** with `#34C759` on hover — a subtle brand touch.

## Changes Required in index2.html

### Tailwind Config
```js
colors: {
    primary: { DEFAULT: '#34C759', dark: '#15803D' },
    // accent: REMOVED
    'text-primary': '#1F2937',
    'text-secondary': '#374151',
    'text-tertiary': '#6B7280',
}
```

### CSS/HTML Classes to Update
- All `bg-accent`, `text-accent`, `bg-accent/10` → replace with `bg-primary/10`, `text-primary`, etc.
- `bg-footer-bg` → should map to `#1F2937` (same as gray-800)
- `hover:text-[#166534]` → add this hover green pattern
- `bg-[#15803d]` → used for dark green backgrounds

## Risks & Concerns
- Removing accent orange means any UI elements using orange (badges, highlights) need alternative styling — check if index2.html uses `accent` classes.
- The primary green change is subtle but affects brand consistency — ensure all green usages update.
