---
tests_version: "1.0"
spec_ref: "footer_redesign_hierarchy-spec-v1.0"
component: "footer_redesign_hierarchy"
category: "content"
strategy: "checklist"
language: "N/A"
---

## Unit Tests

> Static HTML/CSS component — no runnable unit tests. Verification is browser-based inspection.
> Each assertion below maps to a specific REQ and can be checked in DevTools.

## Deliverable Checklist

### [REQ-01] 3-column equal grid layout

- [ ] `<footer>` contains a `<div>` with `grid grid-cols-1 md:grid-cols-3`
- [ ] That grid has exactly 3 direct children (Brand col, Pháp lý col, Liên hệ col)
- [ ] No nested `grid grid-cols-2` exists inside the footer grid
- [ ] On desktop (≥768px): all 3 columns display side by side with equal width
- [ ] On mobile (<768px): all 3 columns stack vertically in order

### [REQ-02] Section headings are de-emphasized labels

- [ ] "Pháp lý" heading has classes: `text-xs font-semibold uppercase tracking-widest text-gray-500`
- [ ] "Liên hệ" heading has classes: `text-xs font-semibold uppercase tracking-widest text-gray-500`
- [ ] Headings are visually smaller and dimmer than link text — confirmed by eye
- [ ] Brand col has NO section heading (intentional — brand block is self-contained)

### [REQ-03] Link contrast on dark background

- [ ] All nav links in Pháp lý col use `text-gray-300`
- [ ] Email link uses `text-gray-300`
- [ ] "Về chúng tôi" link uses `text-gray-300`
- [ ] All links have `hover:text-white transition-colors`
- [ ] On hover: links visually turn to white — confirmed by eye

### [REQ-04] Studio credit is a clean typographic label

- [ ] Contains `<p>` with text "Sản phẩm của" (no dashes)
- [ ] That `<p>` has classes: `text-xs text-gray-600 uppercase tracking-widest mb-2`
- [ ] Unknown Studio logo link has `opacity-60` default and `hover:opacity-100 transition-opacity`
- [ ] No `----` or `---` characters exist anywhere in the footer

### [REQ-05] Social icons in pill-button containers

- [ ] LinkedIn anchor has `w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center`
- [ ] Facebook anchor has same pill-button classes
- [ ] Instagram anchor has same pill-button classes
- [ ] SVG icons inside each pill use `w-4 h-4` (not `w-5 h-5`)
- [ ] On hover: pill background visibly lightens — confirmed by eye

### [REQ-06] "Về chúng tôi" is a first-class visible link

- [ ] "Về chúng tôi" anchor is a direct descendant of the `space-y-4` contact container
- [ ] It is separated by a `border-t border-white/10` line (inline, NOT a wrapper div around it)
- [ ] Company logo image has `rounded-full object-cover` and `opacity-60 group-hover:opacity-100`
- [ ] Link is visible without scrolling within the footer (not hidden/clipped)

### [REQ-07] Footer top separator

- [ ] `<footer>` element has `border-t border-white/10` in its class list
- [ ] A faint horizontal line is visible between the last content section and the footer — confirmed by eye
- [ ] The line does not overpower the footer — subtle, not a heavy border

### [REQ-08] Copyright bar is subtler than body content

- [ ] Copyright `<p>` has `text-gray-600 text-xs` (NOT `text-gray-400 text-sm`)
- [ ] Copyright `<div>` has `border-t border-white/10 mt-12 pt-6 text-center`
- [ ] Copyright text is visibly smaller and dimmer than the link text above — confirmed by eye

---

## Review Criteria

| Criterion | How to verify | Covers |
|-----------|--------------|--------|
| Layout balance | Resize viewport from 1280px → 375px, check columns respond | REQ-01 |
| Heading vs content contrast | Side-by-side comparison of heading vs link text color | REQ-02 |
| Link readability | WCAG contrast check on gray-300 (#d1d5db) vs footer-bg (#292524) | REQ-03 |
| No ASCII decoration | Ctrl+F "----" and "---" in index.html — zero results | REQ-04 |
| Social tap targets | Mobile DevTools: tap each social icon, check 32px minimum | REQ-05 |
| "Về chúng tôi" visibility | First visual pass of footer — link is immediately findable | REQ-06 |
| Footer boundary | Scroll past last section — clear visual break before footer | REQ-07 |
| Copyright hierarchy | Copyright noticeably lighter/smaller than body links | REQ-08 |

## Content Quality Gates

- [ ] All existing links still point to correct targets: `terms.html`, `privacy.html`, `community-standards.html`
- [ ] `id="contact"` preserved on `<footer>` — navbar scroll-to-footer still works
- [ ] `aria-label` attributes present on all social icon anchors (accessibility)
- [ ] `aria-hidden="true"` present on all decorative SVGs inside anchors
- [ ] No Tailwind classes used that require plugins not in `tailwind.config.js`
- [ ] Image `alt` attributes intact for app icon and Unknown Studio logo
