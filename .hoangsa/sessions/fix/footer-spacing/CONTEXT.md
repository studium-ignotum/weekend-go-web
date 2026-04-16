# Context: Footer Spacing Bug Fix

## Task Type
fix

## Language
English

## Spec Language
English

## Tech Stack
HTML5 + Tailwind CSS — `index.html` lines 1193–1353

## User Input
Fix spacing bugs in the previously redesigned footer, as shown in screenshot. 4 specific issues identified and confirmed by user.

## Discussion Log

### [Q1] Which spacing issues to fix?
- Chosen: ALL 4 issues
  1. Brand col: "Sản phẩm của" too tight to description paragraph above
  2. Brand col: {Unknown} Studio logo too close to "Sản phẩm của" label
  3. Right col: "Về chúng tôi" divider line feels disconnecting (too prominent)
  4. Bottom: copyright divider feels cramped (insufficient breathing room)

## Decisions Made

| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Brand col: change `space-y-5` to `space-y-6`, add `pt-2` to studio credit block | Needs more visual gap between description and "Sản phẩm của" label | LOCKED |
| 2 | Brand col: change `mb-2` to `mb-3` between "Sản phẩm của" and logo | 8px → 12px provides more breathing room for the credit pair | LOCKED |
| 3 | Right col: keep border, but increase its top spacing from `pt-1` to `pt-5` and remove `mt-4` from "Về chúng tôi" link | Border stays subtle, but the gap before/after balances the divider visually | LOCKED |
| 4 | Bottom: change `mt-12` → `mt-16` and `pt-6` → `pt-8` on copyright divider | Adds breathing room above the divider (+16px) and below it (+8px) | LOCKED |

## Out of Scope
- Layout structure (3-col grid stays)
- Colors, typography sizes
- Section headings, link text
- Responsive breakpoints
