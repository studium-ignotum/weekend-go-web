---
spec_version: "1.0"
project: "Cuối Tuần Đi Đâu — Website"
component: "footer_redesign_hierarchy"
language: "HTML5 + Tailwind CSS"
task_type: "fix"
category: "content"
status: "done"
---

## Overview
[fix]: Footer — Hierarchy, Clarity & Visual Separation

### Goal
Redesign the footer of `index.html` so it has clear visual hierarchy, separates cleanly from the page above, and surfaces all key contact/about information without clutter.

### Context
The original footer used an uneven 2-col + nested-2-col layout. Section headings matched content weight, links were too dim, "Về chúng tôi" was buried, social icons had no hit-target, and there was no visual separator from the last content section. A screenshot of the original was provided as reference.

### Requirements
- [REQ-01] Layout uses an equal 3-column grid (Brand | Pháp lý | Liên hệ) on desktop, stacking to single column on mobile
- [REQ-02] Section headings are visually de-emphasized labels, distinct from link/body text
- [REQ-03] Link text has sufficient contrast on the dark footer background
- [REQ-04] Studio credit ("Sản phẩm của") is a clean typographic label, not raw dashes
- [REQ-05] Social icons are wrapped in pill-button containers with adequate hit target
- [REQ-06] "Về chúng tôi" is a visible first-class link, not buried behind nested dividers
- [REQ-07] Footer has a top border that separates it from the content section above
- [REQ-08] Copyright bar is subtler (smaller, dimmer) than the footer body content

### Out of Scope
- Adding new sections or links
- Changing footer background color
- Animated transitions or JavaScript interactions
- Changes to any other section of the page
- Updating linked HTML files (privacy.html, terms.html, community-standards.html)

---

## Structure / Outline

```
<footer id="contact">              ← border-t border-white/10 separates from page
  <div max-w-7xl>
    <div grid-cols-1 md:grid-cols-3>

      <!-- Col 1: Brand -->
      App icon (w-12 h-12 rounded-xl)
      App name (text-base font-bold)
      Description (text-gray-400 text-sm)
      "Sản phẩm của" label (text-xs uppercase tracking-widest text-gray-600)
      Unknown Studio SVG logo (h-5, opacity-60 → opacity-100 on hover)

      <!-- Col 2: Pháp lý -->
      Section label (text-xs uppercase tracking-widest text-gray-500)
      3 links: Điều khoản / Chính sách / Tiêu chuẩn (text-gray-300 hover:text-white)

      <!-- Col 3: Liên hệ -->
      Section label (text-xs uppercase tracking-widest text-gray-500)
      Email link (icon + text, text-gray-300, icon dims on default)
      Social row: 3 × (w-8 h-8 rounded-full bg-white/5 hover:bg-white/15)
      border-t border-white/10
      "Về chúng tôi" (company logo + text, text-gray-300 hover:text-white)

    </div>

    <!-- Bottom bar -->
    border-t border-white/10
    Copyright (text-gray-600 text-xs text-center)
  </div>
</footer>
```

## Deliverables

| Deliverable | Format | Location | Description |
|------------|--------|----------|-------------|
| Footer HTML | HTML (Tailwind) | `index.html` lines 1193–1353 | Full footer block, replaced in-place |

## Style & Guidelines
- **Tailwind only** — no inline styles, no custom CSS
- **Dark palette** on `footer-bg: #292524`:
  - Body links: `text-gray-300` (high contrast, ~7:1)
  - Section labels: `text-gray-500` (de-emphasized, label role)
  - Copyright: `text-gray-600` (background-level, recedes)
- **Section headings**: `text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5`
- **Social icons**: `w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center` — consistent pill buttons
- **Hover pattern**: `hover:text-white transition-colors` on all text links; `transition-all` on pill buttons; `hover:opacity-100 transition-opacity` on logo
- **Spacing**: `space-y-4` between Contact items; `gap-2` between social pills; `mt-4` on "Về chúng tôi" after its divider
- **Responsive**: `grid-cols-1 md:grid-cols-3 gap-10 md:gap-12` — stacks correctly on mobile

---

## Implementations

### Design Decisions

| # | Decision | Reasoning | Type |
|---|----------|-----------|------|
| 1 | 3-col equal grid replaces 2-col + nested 2-col | Removes layout imbalance; equal columns improve scannability | LOCKED |
| 2 | Section heading style: `text-xs uppercase tracking-widest text-gray-500` | Visually subordinate to content — clearly a "label", not a heading competing with links | LOCKED |
| 3 | Link text `text-gray-300` (was `text-gray-400`) | WCAG contrast ~7:1 vs ~4.5:1 on #292524 — noticeable readability gain | LOCKED |
| 4 | "Sản phẩm của" label replaces `---- Một sản phẩm của ---` | Consistent with section-label style; no raw ASCII decoration | LOCKED |
| 5 | Social icons in `w-8 h-8 rounded-full bg-white/5` containers | Minimum 32px tap target; pill shape adds clear affordance | LOCKED |
| 6 | "Về chúng tôi" promoted to top level in Contact col with `border-t` separator | Was 2 levels deep (inside a nested divider) — now at same visual level as email | LOCKED |
| 7 | `border-t border-white/10` on `<footer>` element | Low-contrast separator that marks footer boundary without heavy visual weight | LOCKED |
| 8 | Copyright `text-gray-600 text-xs` (was `text-gray-400 text-sm`) | Footer legal note should visually recede — smaller and dimmer than body content | FLEXIBLE |

### Affected Files

| File | Action | Description | Impact |
|------|--------|-------------|--------|
| `index.html` | MODIFY | Replace footer block lines 1193–1353 entirely | N/A — self-contained section |

---

## Open Questions
- Facebook and Instagram social links are currently `javascript:void(0)` — real URLs TBD by team (out of scope for this fix)
- `unknownstudio-logo.svg` at `h-5` (20px) — verify legibility; was `h-6` before

## Constraints
- Must use only Tailwind utility classes already in the project (no new plugins or custom CSS)
- Must not break existing `id="contact"` anchor (used for navbar scroll link)

---

## Acceptance Criteria

### Per-Requirement

| Req | Verification | Expected Result |
|-----|-------------|----------------|
| REQ-01 | Inspect element: `<div class="grid ...">` | `grid-cols-1 md:grid-cols-3` present; 3 direct children |
| REQ-02 | Visual check: section headings | `text-xs uppercase tracking-widest text-gray-500` — clearly smaller/dimmer than links |
| REQ-03 | DevTools computed color on links | `color: rgb(209 213 219)` = `text-gray-300` |
| REQ-04 | Inspect `p.text-xs.text-gray-600` | Contains "Sản phẩm của" — no dashes present |
| REQ-05 | Inspect social anchors | Each has `w-8 h-8 rounded-full bg-white/5` wrapper |
| REQ-06 | Find "Về chúng tôi" anchor | Direct child of `space-y-4` contact container, NOT inside a nested `div.border-t` wrapper |
| REQ-07 | Inspect `<footer>` element | `border-t border-white/10` class present |
| REQ-08 | Inspect copyright `<p>` | `text-gray-600 text-xs` — not `text-gray-400 text-sm` |

### Overall
Open `index.html` in browser → scroll to footer → verify:
1. Footer has a visible separator line from section above
2. Three equal columns on desktop (≥768px viewport)
3. Single column stack on mobile (<768px)
4. All links reachable and not clipped
5. Hover states work: links turn white, social pills lighten, studio logo reaches full opacity
