# Context: Color Theme Update & Footer Company Branding

## Task Type
design

## Language
en

## Spec Language
en

## Tech Stack
HTML / TailwindCSS 3.x / Vanilla JavaScript

## User Input
1. Change the main color of weekend-go-web from #34C759 to #22c55e (to match the mobile app's primary color)
2. Add company info in the footer:
   - "Một sản phẩm của Unknownstudio.dev" with a clickable logo placed in the brand column (left column, under app description)
   - Add a new 4th footer column "Về chúng tôi" with relevant links

## Discussion Log
### [Q1] Language
- Options: Tiếng Việt / English
- Chosen: English

### [Q2] Company info placement
- Options: Footer bottom bar / Footer brand column / Separate footer row
- Chosen: Footer brand column — "Built by [logo] Unknownstudio.dev" under app description

### [Q3] Về chúng tôi
- Options: Add to Contact column / New footer column / Skip
- Chosen: Yes — new footer column

## Decisions Made
| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Change primary color #34C759 → #22c55e in tailwind.config.js | Sync with mobile app | LOCKED |
| 2 | Update hardcoded #34C759 in src/input.css | One occurrence in .nav-link::after | LOCKED |
| 3 | Add studio branding in footer left column | User chose brand column placement | LOCKED |
| 4 | Add 4th footer column for Về chúng tôi | User wants new column, not merged with existing | LOCKED |
| 5 | No Unknownstudio.dev logo asset available yet — use text link initially | No studio logo in assets | FLEXIBLE |

## Out of Scope
- Changing any other colors (accent, neutral, status)
- Redesigning the entire footer layout
- Creating an about page (just the link for now)
- Updating terms.html / privacy.html / community-standards.html footer (separate scope)
