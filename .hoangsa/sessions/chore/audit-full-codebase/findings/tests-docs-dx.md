# Tests, Docs, DX & Accessibility findings

## Summary
- Total findings: 14
- Critical/High/Medium/Low: 0 / 4 / 6 / 4
- Test coverage: 0% — no test files, no visual regression, no Lighthouse/Pa11y CI detected. Acceptable for a 4-page static landing page, but no automated smoke check either.
- Stack verified: static HTML + TailwindCSS 3 CLI (build step exists despite README claim). No framework. No Vercel/Netlify/GitHub Pages config found.

## Findings

### A11Y-001 — Mismatched heading tags `<h3>...</h4>` in all 3 legal pages [HIGH]
- Location: `privacy.html:209,217`; `terms.html:193,201`; `community-standards.html:206,214`
- Evidence: `<h3 class="font-semibold mb-4">Pháp lý</h4>` — opens `<h3>`, closes `</h4>`.
- Impact: Invalid HTML; assistive tech outline algorithms may misreport; fails validators.
- Fix: Change closing tags to `</h3>` on all 6 occurrences.
- Effort: 5 min.

### A11Y-002 — Carousel ignores `prefers-reduced-motion` [HIGH]
- Location: `assets/js/carousel.js`, `assets/css/carousel.css`
- Evidence: `carousel.js:144-154` unconditionally `setInterval(goNext, 3000)` with 600ms cubic-bezier 3D rotations. Grep for `prefers-reduced-motion` / `matchMedia` returned zero across JS+CSS.
- Impact: Vestibular-disorder users forced through autoplay 3D rotation. WCAG 2.3.3 (AAA), 2.2.2 (A) concerns. No visible pause button (only tab-hidden pause + nav buttons reset timer).
- Fix: CSS `@media (prefers-reduced-motion: reduce)` disable transitions; JS check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip autoplay; add visible pause/play toggle.
- Effort: 30 min.

### A11Y-003 — No skip-to-content link [MEDIUM]
- Location: all 4 HTML pages
- Evidence: grep for "skip" returned zero. `<main>` exists but no skip link.
- Impact: Keyboard users tab through 5+ nav links on every page load.
- Fix: Add `<a href="#main" class="sr-only focus:not-sr-only ...">Bỏ qua đến nội dung</a>` as first child of `<body>`; add `id="main"` to `<main>`.
- Effort: 15 min.

### A11Y-004 — Dead social links use `href="#!"` with `aria-disabled` [MEDIUM]
- Location: `index.html:1322` (Facebook), `index.html:1327` (Instagram)
- Evidence: `<a href="#!" aria-disabled="true" ... aria-label="Facebook">`. `aria-disabled` on `<a>` is advisory — link is still focusable/clickable.
- Impact: Keyboard/SR users get actionable controls that do nothing; `#!` is a legacy anti-pattern.
- Fix: Remove icons until accounts exist, or render as non-interactive `<span role="img" aria-label="Facebook (sắp ra mắt)">`.
- Effort: 10 min.

### A11Y-005 — Footer small-text uses `text-gray-500` on dark footer bg [MEDIUM]
- Location: `index.html:1250` ("Một sản phẩm của")
- Evidence: `text-gray-500` (`#6B7280`) on `bg-footer-bg` (`#292524`) ≈ 3.1:1 contrast — FAILS WCAG AA for 12px text. (Note: `text-gray-400` elsewhere at ~5.6:1 passes.)
- Impact: Readability failure (WCAG 1.4.3 AA).
- Fix: Change to `text-gray-400` or `text-gray-300`.
- Effort: 2 min.

### A11Y-006 — Carousel region + nav buttons lack accessible labels [MEDIUM]
- Location: `index.html:881-898` (prev), `index.html:977-1000` (next), `index.html:900-974` (container)
- Evidence: Prev/next buttons contain only SVG icons with no `aria-label` or visible text. Those two SVGs also lack `aria-hidden="true"` (inconsistent with the site's other 20+ icons). `#phone-carousel` container has no role/label.
- Impact: SR users hear "button" with no context.
- Fix: Add `aria-label="Ảnh trước"` / `aria-label="Ảnh tiếp"` on buttons; add `aria-hidden="true"` to inner SVGs; wrap in `<section aria-roledescription="carousel" aria-label="Xem trước giao diện ứng dụng">`.
- Effort: 10 min.

### DOC-001 — README contradicts actual build pipeline [MEDIUM]
- Location: `README.md:16`
- Evidence: README states "No build step — static files only" but `package.json:5-7` defines build/dev Tailwind CLI scripts, and HTML links to the compiled `assets/css/styles.css` (17 KB). Quick-start `npx serve .` only works because compiled output is committed.
- Impact: Contributors editing `src/input.css` without running the dev script won't see changes. No deploy docs.
- Fix: Rewrite README with prerequisites (Node ≥18), install/build/dev steps, and deploy target (currently unknown — see DX-002).
- Effort: 15 min.

### DOC-002 — `AGENTS.md` and `CLAUDE.md` are byte-identical GitNexus boilerplate [LOW]
- Location: `AGENTS.md` (5507 B, tracked), `CLAUDE.md` (5507 B, gitignored)
- Evidence: `.gitignore:1` has `CLAUDE.md`; `AGENTS.md` tracked; content identical and generic GitNexus reference — no project-specific guidance.
- Impact: Agents/new contributors get zero project-specific guidance; duplication drifts.
- Fix: Delete `AGENTS.md` or replace with short project conventions (Vietnamese content, Tailwind CLI workflow, WebP+PNG `<picture>` pattern) + link to GitNexus section.
- Effort: 20 min.

### DOC-003 — OG image inconsistent: `.png` on legal pages vs `.webp` on index [LOW]
- Location: `privacy.html:16,22`; `terms.html:16,22`; `community-standards.html:16,22` (all `.png`) vs `index.html:26,39` (`.webp`)
- Evidence: Both files exist. Inconsistency suggests partial edit.
- Impact: Social crawlers (Facebook historically) have had spotty WebP OG support; previews may render inconsistently.
- Fix: Standardize on `hero-banner-desktop.png` for OG/Twitter across all 4 pages.
- Effort: 5 min.

### DOC-004 — Dead algebra in carousel.js [LOW]
- Location: `assets/js/carousel.js:97`
- Evidence: `const totalPositions = VISIBLE_POSITIONS.length + (total - VISIBLE_POSITIONS.length);` = `total`. Misleading name.
- Impact: Minor maintainer confusion.
- Fix: `const totalPositions = total;` or inline.
- Effort: 1 min.

### DX-001 — No linter, formatter, or pre-commit hooks [MEDIUM]
- Location: project root
- Evidence: No `.eslintrc*`, `.prettierrc*`, `.husky/`, no `lint-staged`. Only `.editorconfig`.
- Impact: Style drift. Observed: `carousel.js` mixes `"double"` + `'single'` quotes.
- Fix: Add Prettier + `eslint:recommended`; `format`/`lint` scripts.
- Effort: 30 min.

### DX-002 — No CI/CD, no deploy config committed [MEDIUM]
- Location: n/a (no `.github/workflows/`, `vercel.json`, `netlify.toml`, GH Pages `_config.yml`)
- Evidence: `ls .github` empty; no platform configs found.
- Impact: No build verification on PRs; no guarantee committed `styles.css` is fresh; deploy manual + undocumented.
- Fix: Pick platform; commit config + GH Action running `npm ci && npm run build`. Minimum: a build-check Action.
- Effort: 1–2 h.

### DX-003 — `.gitignore` narrow; compiled CSS committed [LOW]
- Location: `.gitignore:1-3` (only `CLAUDE.md`, `*.DS_Store`, `.gitnexus`); `assets/css/styles.css` tracked (17 KB)
- Evidence: No `node_modules/` entry. Tailwind build output committed.
- Impact: Noisy diffs, merge conflicts, risk of committing stale CSS.
- Fix: Add `node_modules/`; decide committed-vs-built CSS strategy (pair with DX-002); if CI builds, gitignore `assets/css/styles.css`.
- Effort: 10 min.

### DX-004 — `package.json` metadata rough; no `.nvmrc`; minimal scripts [LOW]
- Location: `package.json:4-11`
- Evidence: `description` contains literal `**` markdown. `engines.node: ">=18"` present but no `.nvmrc`. Only `build`+`dev` scripts.
- Impact: Minor DX papercuts; ugly npm registry rendering.
- Fix: Clean description, add `.nvmrc` (e.g. `20`), add stub `test`/`lint`/`format` scripts.
- Effort: 5 min.

## Positives worth noting
- All `<img>` on all 4 pages have meaningful Vietnamese `alt` — no `alt=""`, no `alt="image"`.
- Decorative SVG icons consistently `aria-hidden="true"` (20+ occurrences) — except the two carousel nav SVGs (A11Y-006).
- `<html lang="vi">` consistent across all 4 pages.
- Open Graph + Twitter Card on all 4 pages (apart from DOC-003).
- `<picture>` + WebP fallback used throughout.
- `fetchpriority="high"` + `rel="preload"` on hero LCP images.
- Carousel pauses on `visibilitychange` (`carousel.js:157-163`).
- `loading="lazy"` on below-the-fold images.
- JSON-LD BreadcrumbList + WebPage schema on legal pages.
- Mobile menu button `aria-label="Menu"`.
- `.editorconfig` present and sensible.
- `engines.node: ">=18"` declared.
- Single `<h1>` per page (verified on all 4).
