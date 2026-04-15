# Simplification Audit — Summary

## Coverage
- **Files sampled:** 11
  - `src/index.src.html` (1239 lines)
  - `src/terms.src.html` (182), `src/privacy.src.html` (198), `src/community-standards.src.html` (195)
  - `partials/footer.html` (114), `partials/icons.svg` (38)
  - `assets/js/carousel.js` (187), `assets/js/menu.js` (19)
  - `assets/css/carousel.css` (27), `src/input.css` (57)
  - `scripts/build-html.js` (54), `tailwind.config.js` (39), `package.json` (31)

## Standards compliance
- **Script loading:** consistent (`<script src="…" defer>` in all 4 src files) — 100%.
- **Include system:** `<!-- @include partials/footer.html -->` applied in all 4 src files — 100%.
- **Icon system:** `partials/icons.svg` exists with 11 symbols — but `<use href="#…">` usage across the 4 HTML files is **0 / 11** expected references. **Compliance: ~0%** on the project's own declared sprite convention.
- **JS module style:** classic script, top-level `const`, function declarations — consistent across both JS files.
- **Naming:** kebab-case ids (good), English symbol names, Vietnamese strings — consistent.
- **Overall compliance:** ~**70%** (icon sprite adoption is the main drag).

## Clarity score
**MEDIUM.** JS is small and readable; major clarity cost is HTML duplication (SVG paths, footer link classes, gray-700 dividers). Biggest win: adopt the already-written icon sprite.

## Balance check
**Slightly OVER-COMPLEX in one place, OK elsewhere.**
- Over-complex: `goTo()` doing orchestration + style writes + reflow hack in one function.
- Over-simplified / missing abstraction: footer anchor class-list repeated 7× (SIMPL-014); `clamp` ad-hoc via `Math.max/Math.min` (SIMPL-012).
- No "clever/obscure" bitwise or side-effect patterns found.

## Top 5 opportunities (ranked by impact/effort)

1. **SIMPL-001 / SIMPL-009 (HIGH, M effort) — Adopt `partials/icons.svg` via `<use>`.**
   Include the sprite once after `<body>` and replace 20+ inline `<svg>` blocks. Fixes duplication and eliminates drift risk SIMPL-002 in one go.

2. **SIMPL-002 (HIGH, S) — Fix the already-drifted Google Play path.**
   Choose one canonical version (sprite), delete the inline copy in `index.src.html:255`.

3. **SIMPL-004 (MEDIUM, S) — Replace `throw new Error` with silent early-return in `carousel.js`.**
   Removes fragile script-ordering dependency; makes the bundle safe to include on non-carousel pages.

4. **SIMPL-007 (MEDIUM, M) — Split `goTo()` into `setStartPositions / forceReflow / releaseLock`.**
   Unlocks easier unit tests and future easing/animation swaps.

5. **SIMPL-014 (LOW, S) — Extract `.footer-link` component class in `input.css`.**
   Cheap fix; reduces 7× class repetition and makes future theme changes 1-line.

## Notes
- No CRITICAL findings. No over-clever or bitwise tricks. Codebase is small and intentionally plain.
- `build-html.js` is clean — path traversal guard (`if (!abs.startsWith(ROOT + path.sep))`), clear error surface, idempotent. No findings.
