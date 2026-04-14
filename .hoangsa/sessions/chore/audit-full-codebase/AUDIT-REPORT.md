# AUDIT REPORT — weekend-go-web

**Date:** 2026-04-14
**Scope:** Full audit (9 dimensions, deep mode)
**Codebase:** 4 HTML pages + 2 JS + 2 CSS + Tailwind config (~2,259 LOC excluding compiled CSS)
**Stack:** HTML5 + TailwindCSS 3.4.19 (CLI) + Vanilla JS — static landing page for "Cuối Tuần Đi Đâu" app

---

## Executive summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 9 |
| 🟡 Medium | 17 |
| 🟢 Low | 12 |
| **Total** | **38** |

**Health rating:** 🟡 Solid foundation, several structural debts. No critical security issues. Codebase is small and approachable but lacks abstractions appropriate for a 4-page multi-page site (heavy duplication). No tests, no CI, no deploy config committed.

**Three biggest themes:**
1. **HTML duplication** — Same nav/footer/CTA/SVG markup copy-pasted across 4 pages. Drift already started. Time bomb for brand updates.
2. **Build/deploy gap** — README says "no build step" but Tailwind CLI is required. No CI verifies builds. No deploy config in repo. No way to confirm `assets/css/styles.css` is fresh.
3. **Accessibility blind spots** — Carousel autoplays without `prefers-reduced-motion`. Malformed `<h3>...</h4>` HTML on legal pages. Skip-link missing.

**What's already good:**
- Zero critical vulnerabilities. `npm audit` clean.
- `<picture>` + WebP fallback used throughout (good perf foundation).
- Hero LCP preloaded with `fetchpriority="high"`.
- All `<img>` have meaningful Vietnamese alt text.
- Decorative SVG icons consistently `aria-hidden="true"` (20+ occurrences).
- `<html lang="vi">` consistent across all 4 pages.
- OG/Twitter meta on all pages.
- Single `<h1>` per page.
- `defer` on all JS scripts.
- Carousel pauses on `visibilitychange`.
- `.editorconfig` present.

---

## Roadmap — 5 themes ordered by ROI

### 🎯 Theme 1 — Quick wins (cleanup, ≤ 30 min each)
**Impact:** Removes obvious bugs + fixes invalid HTML. Total: ~1 hour.

| ID | Action | Effort | Severity |
|----|--------|--------|----------|
| A11Y-001 / ARCH-002 | Fix `<h3>...</h4>` mismatched closers in `terms.html`, `privacy.html`, `community-standards.html` (6 occurrences total) | 5 min | HIGH |
| SEC-001 | Add `node_modules/`, `.env*`, `.hoangsa/`, `.claude/` to `.gitignore` | 1 min | HIGH |
| CQ-005 / SEC-003 | Delete inline `<style>` block at `index.html:70-74` (duplicates `src/input.css:5-7`) | 1 min | LOW |
| CQ-004 | Replace inline `text-[#22c55e] hover:text-[#166534]` with utility `text-primary hover:text-primary-dark` in 4 mailto links across legal pages | 5 min | MEDIUM |
| A11Y-005 | Change `text-gray-500` → `text-gray-400` at `index.html:1250` (WCAG AA contrast fail) | 2 min | MEDIUM |
| DOC-004 / SIMPLIFY-001 | Inline `totalPositions` at `carousel.js:97` (`= total`) | 1 min | LOW |
| SIMPLIFY-003 | Guard `autoTimer` in `startAutoPlay()` at `carousel.js:144` to prevent double timers | 5 min | LOW |
| A11Y-006 | Add `aria-label="Ảnh trước"`/`aria-label="Ảnh tiếp"` + `aria-hidden="true"` on inner SVGs to carousel nav buttons (`index.html:881-898, 977-1000`) | 10 min | MEDIUM |
| DOC-003 | Standardize OG image to PNG across all 4 pages (currently mixed .png/.webp) | 5 min | LOW |

### 🏗 Theme 2 — Kill HTML duplication (extract partials)
**Impact:** Highest leverage. Eliminates ~700 LOC duplication, ends brand-drift bugs, enables single-source-of-truth for nav/footer/CTA. Total: ~3-4 hours.

| ID | Action | Effort |
|----|--------|--------|
| ARCH-001, ARCH-002 | Extract `partials/header.html` + `partials/footer.html` + `partials/download-cta.html`. Use `posthtml-include`, `eleventy`, or 20-line node script. | M |
| CQ-002 | After partial extraction: lift APK URL into single JS const used by both download CTAs. | S |
| CQ-001 | Replace 15× star-rating SVG in `index.html` with single `<symbol id="icon-star">` + `<use href="#icon-star"/>`. ~500 LOC saved. | S |
| CQ-003 | Same treatment for FAQ chevron SVG (×5) at `index.html:1022-1144`. | S |
| SIMPLIFY-002 | Make carousel slides data-driven: JSON `<script type="application/json">` + render in `carousel.js`. ~75 LOC saved. | S |
| SIMPLIFY-004a | Centralize ~10 inlined icon paths in single `<defs>` block. | M |
| CQ-007 | Pick one nav variant (legal pages use design tokens — preferred) and apply via partial. | S |

### 🚦 Theme 3 — Build pipeline + CI/CD
**Impact:** Documents what already exists, prevents stale-CSS bugs. Total: ~2-3 hours.

| ID | Action | Effort |
|----|--------|--------|
| DOC-001 | Rewrite `README.md` with prerequisites (Node ≥18), install/dev/build/deploy steps | 15 min |
| DX-002 | Pick deploy platform (Vercel/Netlify/GH Pages); commit config (`vercel.json` / `netlify.toml` / `_config.yml`); add GH Action `npm ci && npm run build` | 1-2 h |
| DX-003 | After CI builds: gitignore `assets/css/styles.css` (or keep committed but document strategy) | 10 min |
| DX-001 | Add Prettier + `eslint:recommended`; `format`/`lint` scripts in `package.json` | 30 min |
| DX-004 | Clean `package.json` description (literal `**` markdown), add `.nvmrc` | 5 min |

### ♿ Theme 4 — Accessibility deep dive
**Impact:** Legal compliance + UX for 5-15% of users. Total: ~1.5 hours.

| ID | Action | Effort |
|----|--------|--------|
| A11Y-002 / PERF-004 | Carousel: respect `prefers-reduced-motion` (CSS `@media` + JS check); skip autoplay if reduced. Add visible pause/play toggle. Wrap `<section aria-roledescription="carousel">`. | 30 min |
| A11Y-003 | Add skip-to-content link as first child of `<body>` on all 4 pages | 15 min |
| A11Y-004 / CQ-006 | Replace dead `<a href="#!">` Facebook/Instagram with `<span role="img">` until accounts exist | 10 min |
| ARCH-003 | Resolve `phone-transition` CSS dead class — pick CSS or JS as source of truth for carousel timing | 10 min |

### 🚀 Theme 5 — Performance + Security headers
**Impact:** Lighthouse score lift, defense in depth. Total: ~2 hours.

| ID | Action | Effort |
|----|--------|--------|
| PERF-001 | Delete 4 unreferenced raw PNGs (`ai-review.png`, `plan-list.png`, `share-review.png`, `weekend-plan.png`) — saves ~4.76 MB | 5 min |
| PERF-002 | Create dedicated 1200×630 OG image (~80-150 KB), reference from all pages | 30 min |
| PERF-003 | Self-host Inter font (`woff2`) — eliminates render-blocking Google Fonts request, also fixes SEC-005 | 45 min |
| PERF-005 | Re-encode `company_logo.jpg` (53 KB) → 32×32 `.webp` (~2 KB), wrap in `<picture>` | 5 min |
| SEC-002 | Add CSP via hosting headers (`vercel.json` / `_headers`) — `default-src 'self'`, etc. Pair with Theme 3 deploy work | 15 min |

### 🔮 Theme 6 — Long-term (ticket later)
- DEP-001: Tailwind v3 → v4 migration (breaking, ~2-4 h, low urgency).
- DOC-002: Replace `AGENTS.md` boilerplate with project-specific guidance (Vietnamese content rules, Tailwind workflow, `<picture>` pattern). 20 min.
- SIMPLIFY-004b: Remove unused `tailwind.config.js` tokens (`bg-warm`, `accent`, `accent.light`, `primary.light` — zero usages found in HTML).

---

## All findings — full detail

Full per-dimension findings live in:
- [findings/architecture-quality.md](findings/architecture-quality.md) — 14 findings (Architecture, Code Quality, Simplify)
- [findings/security-perf-deps.md](findings/security-perf-deps.md) — 11 findings (Security, Performance, Dependencies)
- [findings/tests-docs-dx.md](findings/tests-docs-dx.md) — 14 findings (Tests, Docs, DX, Accessibility)

**Note on duplicates:** The mismatched `<h3>...</h4>` issue surfaced in both architecture (ARCH-002) and accessibility (A11Y-001) audits — same root cause. Total unique findings: 38 (counted with deduplication).

---

## Recommended cadence

| Sprint | Themes | Time investment |
|--------|--------|-----------------|
| Sprint 1 (this week) | Theme 1 (quick wins) + Theme 4 (a11y) | ~3 hours |
| Sprint 2 | Theme 2 (kill duplication) | ~4 hours |
| Sprint 3 | Theme 3 (build/CI) + Theme 5 (perf+sec headers) | ~5 hours |
| Backlog | Theme 6 (long-term) | as needed |

After Theme 2 completes, the codebase will be roughly 700 LOC lighter and brand updates will be a single-file change. After Theme 3 completes, contributors will know how to set up + deploy without reading commit history.

---

## How to use this report

1. **Pick a theme**, not individual findings. Themes group related work.
2. **Quick wins first** (Theme 1) — clears the dashboard before structural work.
3. **Theme 2 (partials)** unblocks others — easier to fix duplicated CTAs after extracting them.
4. Each finding has a unique ID — reference in commit messages / PR titles for traceability (e.g. `fix(a11y): A11Y-001 fix mismatched h3/h4 closers`).
5. To convert findings into HOANGSA tasks: run `/hoangsa:menu` per theme, then `/hoangsa:prepare` + `/hoangsa:cook`.
