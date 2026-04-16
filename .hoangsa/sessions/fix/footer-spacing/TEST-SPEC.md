---
tests_version: "1.0"
spec_ref: "footer_spacing-spec-v1.0"
component: "footer_spacing"
category: "content"
strategy: "checklist"
language: "N/A"
---

## Unit Tests

> Static HTML/CSS spacing fix — verification is grep-based assertion against `index.html`.

## Deliverable Checklist

### [REQ-01] Brand col gap before studio credit
- [ ] Brand col `<div>` uses `space-y-6` (was `space-y-5`)
- [ ] Studio credit wrapper `<div>` uses `pt-2` (was `pt-1`)
- [ ] No occurrence of `space-y-5` in the footer block
- [ ] No occurrence of studio credit wrapper with `pt-1`

### [REQ-02] Brand col gap inside studio credit
- [ ] "Sản phẩm của" `<p>` uses `mb-3` (was `mb-2`)
- [ ] No occurrence of `mb-2">Sản phẩm của` in file

### [REQ-03] Right col "Về chúng tôi" divider balance
- [ ] "Về chúng tôi" wrapper uses `pt-5 border-t border-white/10` (was `pt-1 border-t border-white/10`)
- [ ] "Về chúng tôi" anchor does NOT have `mt-4` class anymore

### [REQ-04] Bottom copyright divider breathing room
- [ ] Copyright wrapper uses `border-t border-white/10 mt-16 pt-8 text-center` (was `mt-12 pt-6`)
- [ ] No occurrence of `mt-12 pt-6` in file

## Review Criteria

| Criterion | How to verify | Covers |
|-----------|--------------|--------|
| Brand col vertical rhythm | Visual: gap between description and "Sản phẩm của" matches gap between description and icon row | REQ-01 |
| Studio credit pair | Visual: clear gap between label and logo | REQ-02 |
| "Về chúng tôi" affordance | Visual: divider feels like a natural section break, not a wall | REQ-03 |
| Copyright separation | Visual: clear vertical breathing above and below the bottom divider line | REQ-04 |

## Content Quality Gates

- [ ] No layout regression: still 3-col on desktop, stacks on mobile
- [ ] No typography regression: section labels, link colors unchanged
- [ ] All requirements from previous fix (`fix/footer-redesign-hierarchy`) still pass
