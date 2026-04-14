---
tests_version: "1.0"
spec_ref: "html_partials_and_dedupe-spec-v1.0"
component: "html_partials_and_dedupe"
category: "code"
strategy: "smoke"
language: "html-tailwindcss-nodejs"
---

## Pre-flight Checks
- [ ] Node 18+ available (`node --version`)
- [ ] `npm install` chạy clean
- [ ] Theme 1 đã merge (avoid conflicts trong h4/inline style/etc)
- [ ] Backup current 4 HTML files (git history is enough, but tag commit before refactor)

## Integration Tests

### REQ-01..04 — Partials exist & well-formed
- **Command**:
  ```bash
  test -f partials/header.html && grep -q '<nav' partials/header.html && \
  test -f partials/footer.html && grep -q 'copyright-year' partials/footer.html && \
  test -f partials/download-cta.html && grep -q '{{APK_VERSION}}' partials/download-cta.html && \
  test -f partials/icons.svg && [ "$(grep -c '<symbol id=' partials/icons.svg)" -ge 10 ]
  ```
- **Expected**: exit 0

### REQ-05 — `<use>` references replace inline SVGs
- **Command**: `grep -c '<use href="#icon-' index.html`
- **Expected**: ≥ 25 (was 0 before — proves icons centralized)
- **Bonus**: `grep -c 'M9.049 2.927' index.html` → `0` (star path no longer inline)

### REQ-06 — Source files exist
- **Command**: `for f in index terms privacy community-standards; do test -f src/$f.src.html || exit 1; done`
- **Expected**: exit 0

### REQ-07 — Build script idempotent
- **Command**:
  ```bash
  npm run build > /dev/null
  cp index.html /tmp/idx-1
  npm run build > /dev/null
  diff /tmp/idx-1 index.html
  ```
- **Expected**: empty diff (idempotent)

### REQ-07 — Build script fails on missing partial
- **Command**: `printf "<!-- @include partials/nonexistent.html -->\n" > src/test.src.html && node scripts/build-html.js; rm -f src/test.src.html test.html`
- **Expected**: exit ≠ 0, stderr mentions "Missing partial"

### REQ-08 — npm run build pipeline
- **Command**: `rm -f assets/css/styles.css index.html && npm run build && test -s assets/css/styles.css && test -s index.html`
- **Expected**: both files regenerated, non-empty

### REQ-10 — APK URL single source
- **Command**:
  ```bash
  V=$(node -p "require('./package.json').appVersion")
  [ "$(grep -c "release/v$V/release.apk" index.html)" = "2" ]
  ```
- **Expected**: 2 occurrences (header CTA + section CTA), both using version from package.json

### REQ-11 — Carousel data-driven
- **Command**: `grep -q 'id="carousel-slides"' index.html && grep -q 'JSON.parse' assets/js/carousel.js && [ "$(grep -c 'phone-item' src/index.src.html)" -le 1 ]`
- **Expected**: exit 0 (slides hardcoded markup gone from source)

### REQ-12 — Visual diff sanity
- **Command**: `wc -l index.html terms.html privacy.html community-standards.html | tail -1`
- **Expected**: total ≤ ~1500 (was ~2025 — saved ~500+ LOC after removing inline duplications, even though includes are re-expanded in output)

## Visual Checklist (manual in browser)
- [ ] Index page header sticky, mobile menu opens/closes
- [ ] Index page footer: studio credit, legal links, contact, social — all present
- [ ] Legal pages footer: same as index (no longer stripped)
- [ ] Legal pages copyright shows current year (not hardcoded 2025)
- [ ] Star ratings hiển thị đúng (3 testimonials × 5 stars vẫn render)
- [ ] FAQ accordion: chevron rotate khi click `<details>`
- [ ] App Store + Google Play CTA: cả 2 vị trí đều link tới APK
- [ ] Carousel autoplay 3s loop, all 7 slides accessible

## Edge Cases
| Scenario | How | Expected |
|----------|-----|----------|
| Modify partial only, rebuild | Edit `partials/footer.html`, run `npm run build` | All 4 HTML pages reflect change |
| APK version bump | Change `appVersion` in `package.json`, rebuild | Both CTAs in index.html link to new version |
| Add new page | Create `src/new.src.html` with includes, rebuild | `new.html` generated at root |
| Remove a partial reference | Delete `<!-- @include … -->` from one page | That page re-renders without that block; others unaffected |
| Delete a partial | Remove `partials/header.html` then build | Build fails loudly; no silent half-rendered output |

## Regression
- [ ] Tailwind utilities used in partials (vd `bg-primary` trong CTA) đều có trong final compiled `assets/css/styles.css` (vì `tailwind.config.js` content nay include partials)
- [ ] No `npm audit` regressions (no new deps added — only node built-in `fs`/`path`)
- [ ] `npm run dev` (Tailwind watch) vẫn hoạt động (build-html.js có thể không chạy trong dev mode — document hoặc add concurrent watcher)
- [ ] All tests trong Theme 1 vẫn pass (h4 fix carried over qua regeneration)
- [ ] Carousel keyboard nav (prev/next buttons) functional sau khi switch sang JSON-driven
