---
tests_version: "1.0"
spec_ref: "color_theme_footer_branding-spec-v1.0"
component: "color_theme_footer_branding"
category: "content"
strategy: "checklist"
language: "N/A"
---

## Unit Tests
<!-- content/design task — verification is the manual checklist below, not automated tests -->

## Deliverable Checklist

### [REQ-01] Primary color token updated in tailwind.config.js
- [ ] `primary.DEFAULT` equals `#22c55e`
- [ ] `primary.dark` equals `#16a34a`
- [ ] No occurrence of `#34C759` remains in tailwind.config.js

### [REQ-02] Hardcoded color updated in src/input.css
- [ ] `.nav-link::after background-color` equals `#22c55e`
- [ ] No occurrence of `#34C759` remains in src/input.css

### [REQ-03] CSS rebuilt
- [ ] `npm run build` exits with code 0
- [ ] `assets/css/styles.css` timestamp is newer than tailwind.config.js

### [REQ-04] Studio credit in footer brand column
- [ ] "Một sản phẩm của" label text appears above the logo link
- [ ] `assets/logos/unknownstudio-logo.svg` renders in footer
- [ ] Logo link points to `https://unknownstudio.dev`
- [ ] Link has `target="_blank"` and `rel="noopener noreferrer"`
- [ ] Logo has `aria-label="Unknownstudio.dev"`
- [ ] Logo has hover opacity effect (opacity-70 → opacity-100)

### [REQ-05] New "Về chúng tôi" column
- [ ] 4th column with heading "Về chúng tôi" exists in footer
- [ ] Column contains at least 1 link (placeholder `#` is acceptable)
- [ ] Column follows same style as other footer columns (font-semibold heading, text-gray-400 links)

### [REQ-06] Responsive footer layout
- [ ] On desktop (≥1024px): 4 columns side by side
- [ ] On tablet (768-1023px): 2×2 grid (md:grid-cols-2)
- [ ] On mobile (<768px): single column stack
- [ ] No horizontal overflow at any breakpoint

## Review Criteria
| Criterion | How to verify | Covers |
|-----------|--------------|--------|
| Color accuracy | Inspect rendered `text-primary` in browser DevTools — computed color matches `rgb(34, 197, 94)` | REQ-01, REQ-03 |
| No old color | `grep -r "#34C759" tailwind.config.js src/input.css` → 0 results | REQ-01, REQ-02 |
| Studio logo renders | Open index.html, scroll to footer, confirm SVG logo visible | REQ-04 |
| External link safe | Click Unknownstudio.dev link — opens new tab without referrer leak | REQ-04 |
| Mobile layout | Chrome DevTools → iPhone 12 viewport → footer stacks cleanly | REQ-06 |

## Content Quality Gates
- [ ] No broken image paths (all `src=""` attributes resolve)
- [ ] All links use correct href (external link opens new tab, internal links valid)
- [ ] Footer visually consistent — studio credit is clearly secondary to product branding
