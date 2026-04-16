# Research: Footer Redesign — Cuối Tuần Đi Đâu Website

## Tech Stack Detected
- HTML5 (static, no framework)
- Tailwind CSS (JIT, config at `tailwind.config.js`)
- No JavaScript in footer (mobile menu script is elsewhere)
- Assets: WebP/PNG images, SVG logos

## Project Structure

```
weekend-go-web/
├── index.html          # Single-page site — all sections including footer
├── tailwind.config.js  # Custom colors, font, border radius
├── src/input.css       # Tailwind entry
├── assets/
│   ├── images/         # app-icon-72.webp/png, hero banners
│   └── logos/          # unknownstudio-logo.svg
├── company_logo.jpeg   # Used in "Về chúng tôi" row
├── privacy.html        # Linked from footer
├── terms.html          # Linked from footer
└── community-standards.html  # Linked from footer
```

### Relevant Files

| File | Role |
|------|------|
| `index.html` lines 1193–1353 | Footer HTML — sole target of this fix |
| `tailwind.config.js` | Defines `footer-bg: #292524`, `primary: #22c55e` |
| `assets/logos/unknownstudio-logo.svg` | Studio credit logo |
| `assets/images/app-icon-72.webp` | App icon in brand col |
| `company_logo.jpeg` | "Về chúng tôi" logo |

## Patterns & Conventions
- **Utility-first**: Tailwind classes only — no custom CSS in HTML
- **Dark footer**: Background `bg-footer-bg` (#292524) — near-black warm tone
- **Text scale**: `text-sm` body, `text-xs` labels, `font-semibold` headings
- **Hover pattern**: `hover:text-white transition-colors` on all links
- **Icon pattern**: Inline SVG with `aria-label` on anchor, `aria-hidden="true"` on svg
- **Images**: `<picture>` with WebP source + PNG fallback
- **Responsive**: Tailwind breakpoints (`md:`, `lg:`) — grid stacks on mobile

## Existing Footer Problems (pre-fix)

### Layout
- `grid-cols-1 md:grid-cols-2` → Brand takes 50%, Legal+Contact share 50%
- Right half is `grid grid-cols-2` nested inside → creates 3 unequal columns
- Brand col has inner `p-6` padding that misaligns with adjacent columns

### Hierarchy
- Section headings: `font-semibold mb-4 text-white` → same weight as paragraph text
- Link text: `text-gray-400` → low contrast on #292524
- Studio credit: `---- Một sản phẩm của ---` → raw dash characters, unprofessional

### Information Architecture
- "Về chúng tôi" sits inside a `border-t border-gray-700 pt-5` divider inside the Contact col → two visual levels below the heading — effectively invisible
- Social icons have no container → small, hard to tap on mobile (no hit-target padding)

### Separator
- No separator between last content section and footer → footer blends in

## External Research

### Footer hierarchy best practices
- Source: Nielsen Norman Group — "Website Footer Design"
- Key findings: Equal-width columns create cleaner scanability; label hierarchy (small caps / muted color) for section headings prevents heading/content confusion; grouping social + email + about in one col reduces required columns
- Relevance: Validates 3-col equal grid + `text-xs uppercase` section heading approach

### Tailwind dark-bg contrast
- Source: Tailwind CSS docs — color palette
- Key findings: On #292524 bg, `text-gray-300` (#d1d5db) achieves ~7:1 contrast ratio (WCAG AA); `text-gray-400` (#9ca3af) is ~4.5:1 — borderline; `text-gray-500` (#6b7280) is suitable only for de-emphasized labels
- Relevance: Justifies upgrading link text to `text-gray-300`, keeping headings at `text-gray-500`

## Key Findings

1. **Single file** — all changes are in `index.html` lines 1193–1353. No other files need touching.
2. **No JS** — the footer is pure HTML/CSS; no interactivity to maintain.
3. **Tailwind utility-only** — the fix must use only Tailwind classes (no inline styles) to stay consistent with the rest of the file.
4. **Assets intact** — all images/SVGs remain the same; only wrapper HTML and Tailwind classes change.
5. **Mobile stack**: `grid-cols-1 md:grid-cols-3` correctly collapses to single column on mobile.

## Risks & Concerns
- `company_logo.jpeg` is a JPEG (not SVG) — `w-5 h-5 rounded-full` may look pixelated at that size; `object-cover` helps but image quality is a limitation outside this fix's scope.
- `unknownstudio-logo.svg` — `h-5 w-auto` (20px height) is smaller than before (`h-6`); confirm it's still legible at this size.
- Social icon `javascript:void(0)` hrefs on Facebook and Instagram — not live links yet; confirmed out of scope.
