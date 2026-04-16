# Context: Footer Redesign — Hierarchy & Visual Clarity

## Task Type
fix

## Language
English

## Spec Language
English

## Tech Stack
HTML5 + Tailwind CSS (plain static site, no framework)
- Entry: `index.html`
- Tailwind config: `tailwind.config.js`
- Custom color: `footer-bg: #292524`

## User Input
Redesign footer of the Cuối Tuần Đi Đâu website so it is:
- Rõ – dễ nhìn – có hierarchy – không lẫn lộn với phần khác
  (Clear – easy to see – has visual hierarchy – doesn't blend with other sections)
- Kết hợp đủ: Email + Social + About company nhưng vẫn gọn
  (Combines: Email + Social + About company but stays compact)

Attachment provided: screenshot of the original footer design.

## Discussion Log

### [Q1] Root cause?
- Options: Visual hierarchy missing / Information buried / Both
- Chosen: Both (all of the above)
- Reason: Layout imbalance + poor hierarchy + buried content — full overhaul

### [Q2] Responsive?
- Options: Yes mobile+desktop / Desktop only / Mobile-first
- Chosen: Yes — mobile + desktop

## Decisions Made

| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Switch from 2-col to 3-col equal grid | Brand col was too wide; Legal+Contact nested 2-col was uneven | LOCKED |
| 2 | Section headings: `text-xs uppercase tracking-widest text-gray-500` | Establishes label hierarchy without competing with content | LOCKED |
| 3 | Link text: `text-gray-300` instead of `text-gray-400` | Improves readability on dark bg-footer-bg (#292524) | LOCKED |
| 4 | Studio credit: replace dashes with "Sản phẩm của" uppercase label | Cleaner visual treatment, matches heading style | LOCKED |
| 5 | Social icons: `w-8 h-8 rounded-full bg-white/5 hover:bg-white/15` | Larger hit target, pill button container adds affordance | LOCKED |
| 6 | "Về chúng tôi" promoted to Contact col, above footer divider | Was buried behind a nested divider — must be visible | LOCKED |
| 7 | Add `border-t border-white/10` to `<footer>` element | Separates footer from last content section visually | LOCKED |
| 8 | Copyright: `text-gray-600 text-xs` (was `text-gray-400 text-sm`) | Footer note should recede; smaller + dimmer = proper hierarchy | FLEXIBLE |

## Out of Scope
- Adding new sections or links not already in the footer
- Changing footer background color
- Animated transitions or JavaScript interactions
- Changes to the header or any other sections
- Updating privacy.html, terms.html, community-standards.html
