# Architecture, Code Quality & Simplify findings

## Summary
- Total findings: 14
- Critical: 0 | High: 4 | Medium: 7 | Low: 3
- Lines scanned: 2,025 HTML + 184 JS + 50 CSS = ~2,259 LOC (excluding compiled `styles.css`)

## Top 3
1. ARCH-002 [HIGH] — Nav + footer duplicated across 4 HTML pages with structural drift; legal pages contain malformed HTML (`<h3>...</h4>`).
2. CQ-001 [HIGH] — Star-rating SVG repeated 15 times in `index.html` (~500 lines pure duplication).
3. CQ-002 [HIGH] — App Store / Play CTA blocks duplicated; APK URL `v1.0.35` hard-coded twice — version bump bug magnet.

## Findings

### ARCH-001 — `index.html` is a 1,348-line monolith with no partials [HIGH]
- Location: `index.html:1-1348`
- Evidence: 12 sections; header (78-170) + footer (1232-1343) + download CTA (228-273 / 1180-1226) all duplicated downstream.
- Impact: Hard to scan; nav/footer changes touch 4 files in lockstep.
- Fix: Extract `partials/{header,footer,download-cta}.html` via `posthtml-include`, `eleventy`, or a 20-line node script.
- Effort: M.

### ARCH-002 — Nav + footer duplicated across 4 HTML pages with structural drift [HIGH]
- Location: `terms.html:65-84,178-214`; `privacy.html:65-84,194-230`; `community-standards.html:65-84,194-227`; `index.html:78-170,1232-1343`
- Evidence: Legal pages have a stripped nav (no mobile menu) and a stripped footer (no studio credit, no contact, no social, hard-coded `&copy; 2025` instead of dynamic `<span id="copyright-year">`). Malformed HTML: `<h3 …>Pháp lý</h4>` and `<h3 …>Liên hệ</h4>` on all 3 legal pages.
- Impact: Brand drift; copyright stale every Jan 1 on legal pages; invalid HTML triggers browser fix-up.
- Fix: Partials (per ARCH-001). Immediately fix `</h4>` typos → `</h3>`.
- Effort: M.

### ARCH-003 — `phone-transition` CSS class is dead [MEDIUM]
- Location: `src/input.css:32-34`; `index.html:911,921,931,941,951,961,971`
- Evidence: CSS sets `transition: ... 0.5s ...`, but `carousel.js:76-79` overrides `phone.style.transition` inline (`600ms`) on every animation tick — class never wins.
- Impact: Dead CSS + two competing timing constants confuse maintainers.
- Fix: Either delete the class or remove the inline override and let CSS own timing.
- Effort: S.

### CQ-001 — Star-rating SVG duplicated 15× in one file [HIGH]
- Location: `index.html:657-702, 724-768, 791-835` (and 12 more)
- Evidence: 33-line `<svg>...</svg>` block with path `M9.049 2.927c.3-.921 1.603-.921 1.902 0...` repeated 15 times.
- Impact: ~500 lines of duplication; styling tweaks must hit 15 spots.
- Fix: Define one `<symbol id="icon-star">` in `<defs>`, reference with `<use href="#icon-star"/>`.
- Effort: S.

### CQ-002 — App Store + Google Play CTAs duplicated; APK URL hard-coded twice [HIGH]
- Location: `index.html:228-273`, `:1180-1226`
- Evidence: Identical 14-line SVG paths; APK URL `.../v1.0.35/release.apk` hard-coded in both `<a href="...">`.
- Impact: Version-bump regressions when only one URL is updated.
- Fix: Extract `partials/download-cta.html`, or lift version into a JS constant and write both URLs from it.
- Effort: S.

### CQ-003 — FAQ chevron SVG duplicated 5× [MEDIUM]
- Location: `index.html:1022-1034, 1050-1062, 1077-1089, 1105-1117, 1132-1144`
- Evidence: Identical 13-line chevron `<svg>` × 5, plus full `<details>` wrapper repeated.
- Impact: Adding a 6th FAQ requires copying ~30 lines.
- Fix: `<symbol>` + JSON-driven render.
- Effort: S.

### CQ-004 — Hard-coded brand colors leak past Tailwind tokens [MEDIUM]
- Location: `terms.html:172`; `privacy.html:188`; `community-standards.html:162,185`
- Evidence: `class="text-[#22c55e] hover:text-[#166534] font-medium underline"` instead of `text-primary hover:text-primary-dark`. `#166534` is a third green not in `tailwind.config.js`.
- Impact: Palette changes don't propagate; `#166534` desyncs from `primary-dark` (`#16a34a`).
- Fix: Switch to `text-primary hover:text-primary-dark`.
- Effort: S.

### CQ-005 — Duplicated body font-family rule [LOW]
- Location: `src/input.css:5-7`; `index.html:70-74`
- Evidence: Both declare `body { font-family: "Inter", system-ui, sans-serif; }`. Inline `<style>` only on `index.html` — inconsistent with other pages.
- Fix: Delete `index.html:70-74`.
- Effort: S.

### CQ-006 — Dead `href="#!"` social links [MEDIUM]
- Location: `index.html:1322,1327`
- Evidence: `<a href="#!" aria-disabled="true" aria-label="Facebook">` and same for Instagram. `aria-disabled` on `<a>` is not respected by browsers; clicking scrolls to top.
- Fix: Remove icons until accounts exist, or use `<button disabled>` with tooltip.
- Effort: S.

### CQ-007 — Header inconsistency: home vs legal pages [MEDIUM]
- Location: `index.html:78` vs `terms.html:66`, `privacy.html:66`, `community-standards.html:66`
- Evidence: Home uses `bg-white border-b border-gray-200` h-`72px`; legal use `bg-white/95 backdrop-blur-sm border-b border-border-default` h-16. Different token, different blur, different height.
- Fix: Pick one (legal-pages variant uses the design token — preferred). Apply via partial.
- Effort: S.

### SIMPLIFY-001 — `goTo()` over-computes a meaningless `totalPositions` [LOW]
- Location: `assets/js/carousel.js:97-101`
- Evidence: `const totalPositions = VISIBLE_POSITIONS.length + (total - VISIBLE_POSITIONS.length);` simplifies to `total`.
- Fix: Inline or rename.
- Effort: S.

### SIMPLIFY-002 — Carousel slides should be data-driven [MEDIUM]
- Location: `index.html:899-974`
- Evidence: 7 nearly-identical `.phone-item` blocks (~75 lines), differing only in `src` and `alt`.
- Fix: JSON `<script type="application/json" id="carousel-slides">` + render in `carousel.js`.
- Effort: S.

### SIMPLIFY-003 — Autoplay timer can double up on rapid visibility flips [LOW]
- Location: `assets/js/carousel.js:144-163`
- Evidence: `startAutoPlay()` doesn't guard `autoTimer` before assigning `setInterval`.
- Fix: Add `if (autoTimer) clearInterval(autoTimer);` at top of `startAutoPlay()`.
- Effort: S.

### SIMPLIFY-004 — Inline SVG paths + sprawling/unused color tokens [MEDIUM]
- Location: All HTML files; `tailwind.config.js`
- Evidence: 10 distinct icon paths inlined (often >1×). Tailwind tokens `primary.light` (`#86efac`), `accent` (`#fb923c`), `accent.light`, `bg-warm` defined but grep finds **zero** uses of `bg-bg-warm`, `bg-accent`, `text-accent`, `bg-primary-light` in HTML.
- Fix: (a) Centralize icons in `<symbol>` `<defs>` block. (b) Remove unused `tailwind.config.js` tokens. (c) Replace `text-[#22c55e]` with `text-primary`.
- Effort: M.
