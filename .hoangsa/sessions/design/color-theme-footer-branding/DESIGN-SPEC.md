---
spec_version: "1.0"
project: "Cuối Tuần Đi Đâu — Landing Page"
component: "color_theme_footer_branding"
language: "HTML / TailwindCSS 3.x"
task_type: "design"
category: "content"
status: "draft"
---

## Overview
[design]: Color theme update + footer company branding

### Goal
Update primary color from `#34C759` to `#22c55e` to match the mobile app, and add company branding (Unknownstudio.dev credit + "Về chúng tôi" column) to the footer.

### Context
The mobile app uses `#22c55e` as its primary green. The web landing page currently uses `#34C759` — a slightly different shade. Syncing these creates visual consistency across platforms. Additionally, the product owner wants to credit the studio that built the app and add a company section to the footer.

### Requirements
- [REQ-01] Primary color token in `tailwind.config.js` updated to `#22c55e`
- [REQ-02] Hardcoded `#34C759` in `src/input.css` updated to `#22c55e`
- [REQ-03] TailwindCSS rebuilt so all `text-primary`, `bg-primary` etc. render the new color
- [REQ-04] Footer brand column shows "Một sản phẩm của Unknownstudio.dev" with a clickable link below the app description
- [REQ-05] Footer has a 4th column "Về chúng tôi" with at least one link
- [REQ-06] Footer grid updated from 3 to 4 columns on `md+` screens, gracefully stacked on mobile

### Out of Scope
- Changing accent, neutral, or status colors
- Redesigning header or button styles
- Creating an actual "Về chúng tôi" page
- Updating footers in terms.html / privacy.html / community-standards.html

---

## Structure / Outline

### Change 1: tailwind.config.js — Primary Color Token
```js
// Before
primary: {
  DEFAULT: "#34C759",
  dark: "#15803D",
  light: "#86efac",
}

// After
primary: {
  DEFAULT: "#22c55e",  // matches mobile app
  dark: "#16a34a",    // matches mobile app
  light: "#86efac",   // unchanged
}
```

### Change 2: src/input.css — Hardcoded Color
```css
/* Before */
.nav-link::after {
  background-color: #34C759;
}

/* After */
.nav-link::after {
  background-color: #22c55e;
}
```

### Change 3: index.html — Footer Grid (line 1196)
```html
<!-- Before -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-10">

<!-- After -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
```

### Change 4: index.html — Footer Brand Column (after line 1219)
Add studio credit below the app description paragraph:
```html
<!-- Studio credit — add after the <p> description -->
<div class="mt-5 pt-4 border-t border-gray-700">
  <p class="text-xs text-gray-500 mb-2">Một sản phẩm của</p>
  <a
    href="https://unknownstudio.dev"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-block opacity-70 hover:opacity-100 transition-opacity"
    aria-label="Unknownstudio.dev"
  >
    <img
      src="assets/logos/unknownstudio-logo.svg"
      alt="Unknown Studio"
      width="160"
      height="24"
      loading="lazy"
      class="h-5 w-auto"
    />
  </a>
</div>
```

### Change 5: index.html — New "Về chúng tôi" Column (after Legal column, ~line 1248)
```html
<!-- Về chúng tôi column -->
<div>
  <h3 class="font-semibold mb-4 text-white">Về chúng tôi</h3>
  <ul class="space-y-2.5">
    <li>
      <a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">
        Về chúng tôi
      </a>
    </li>
    <li>
      <a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">
        Liên hệ hợp tác
      </a>
    </li>
    <li>
      <a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">
        Tuyển dụng
      </a>
    </li>
  </ul>
</div>
```

---

## Deliverables
| Deliverable | Format | Location | Description |
|------------|--------|----------|-------------|
| Updated color config | .js | `tailwind.config.js` | primary.DEFAULT + primary.dark |
| Updated nav underline | .css | `src/input.css` | .nav-link::after color |
| Rebuilt stylesheet | .css | `assets/css/styles.css` | Run `npm run build` |
| Updated footer | .html | `index.html` | 4-col grid + studio credit + Về chúng tôi column |

## Style & Guidelines
- Studio credit should be **tasteful and secondary** — smaller text, muted color, below the product description
- "Về chúng tôi" links can be `href="#"` placeholders until pages are created
- External link (Unknownstudio.dev) must have `target="_blank" rel="noopener noreferrer"`
- Mobile: grid stacks to 2 cols on `md`, single col on `sm` — "Về chúng tôi" column should appear naturally in flow

---

## Implementations

### Design Decisions
| # | Decision | Reasoning | Type |
|---|----------|-----------|------|
| 1 | Update both DEFAULT and dark shades | Consistency with mobile app theme | LOCKED |
| 2 | Use `assets/logos/unknownstudio-logo.svg` (dark variant, white text) | Copied from Website Unknown project — white text renders correctly on dark footer | LOCKED |
| 3 | Grid: `md:grid-cols-2 lg:grid-cols-4` | 4 cols on large, 2×2 on medium for readability | LOCKED |
| 4 | Studio credit separated by border-t | Visually distinct from product description | LOCKED |

### Affected Files
| File | Action | Description | Impact |
|------|--------|-------------|--------|
| `tailwind.config.js` | MODIFY | primary.DEFAULT + primary.dark | N/A |
| `src/input.css` | MODIFY | .nav-link::after hardcoded color | N/A |
| `assets/css/styles.css` | REGENERATE | Run npm run build after color changes | N/A |
| `index.html` | MODIFY | Footer grid + studio credit + 4th column | N/A |

---

## Open Questions
- Does Unknownstudio.dev have a logo to use? If yes, add `<img>` inside the credit link.
- What pages should "Về chúng tôi" links actually point to? (placeholder `#` for now)

## Constraints
- TailwindCSS must be rebuilt (`npm run build`) for color changes to take effect
- All external links must use `rel="noopener noreferrer"` for security

---

## Acceptance Criteria

### Per-Requirement
| Req | Verification | Expected Result |
|-----|-------------|----------------|
| REQ-01 | `grep "22c55e" tailwind.config.js` | Matches `#22c55e` in primary.DEFAULT |
| REQ-02 | `grep "22c55e" src/input.css` | Matches `#22c55e` in .nav-link::after |
| REQ-03 | Open index.html in browser | Primary buttons/text render green #22c55e |
| REQ-04 | Inspect footer brand column | "Unknownstudio.dev" link visible below app description |
| REQ-05 | Inspect footer | 4th column "Về chúng tôi" with links present |
| REQ-06 | Resize to mobile | Footer columns stack cleanly, no overflow |

### Overall
1. `grep "#34C759" tailwind.config.js src/input.css` → 0 matches
2. `npm run build` → exits with code 0
3. Open `index.html` → primary color is visibly #22c55e (not #34C759)
4. Footer shows 4 columns on desktop with studio credit and Về chúng tôi
