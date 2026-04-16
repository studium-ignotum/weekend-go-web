# Research: color-theme-footer-branding

## Files Affected

### Color Change
| File | What | Scope |
|------|------|-------|
| `tailwind.config.js` | `primary.DEFAULT: "#34C759"` → `"#22c55e"` | 1 line |
| `tailwind.config.js` | `primary.dark: "#15803D"` → `"#16a34a"` (match mobile app) | 1 line |
| `src/input.css` | `.nav-link::after { background-color: #34C759 }` → `#22c55e` | 1 line |

**Note:** All `text-primary`, `bg-primary`, `bg-primary/10`, `ring-primary/20` etc. in HTML files use the Tailwind token — they auto-update when tailwind.config.js changes and CSS is rebuilt.

### Footer Changes
| File | What | Scope |
|------|------|-------|
| `index.html:1194-1322` | Footer section | Modify |
| `index.html:1196` | `grid-cols-3` → `grid-cols-4` (add 4th column) | 1 line |
| `index.html:1216-1219` | Brand column — add studio branding below description | +5 lines |
| `index.html:1248` | After Legal column — insert new "Về chúng tôi" column | +20 lines |

## Key Observations
- Color is fully tokenized via Tailwind — single source of truth in tailwind.config.js
- One hardcoded hex in src/input.css needs manual update
- The footer currently has 3 columns: Brand, Pháp lý, Liên hệ
- Adding 4th column requires grid layout update
- **Logo found**: `logo-primary-dark.svg` from `Website Unknown` project — white text + chartreuse accents, renders perfectly on dark footer (`#292524`). Copied to `assets/logos/unknownstudio-logo.svg`
- `primary.dark` color (#15803D) is not used in HTML but should be updated for consistency with mobile app (#16a34a)

## How Other Websites Show Studio/Agency Credit
Common patterns observed across product landing pages:
1. **Footer "Made by" strip** — subtle, below copyright (e.g. Linear, Vercel)
2. **Footer brand column** — prominent, with logo and tagline (e.g. agency-built SaaS)
3. **Separate powered-by badge** — floating badge or in hero (e.g. "Powered by Stripe")

Best practice for product landing pages: keep studio credit tasteful and in the footer brand column. Use a small logo + company name as a hyperlink. Avoid making it compete with the product's own branding.
