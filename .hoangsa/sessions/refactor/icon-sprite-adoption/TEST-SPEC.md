---
tests_version: "1.0"
spec_ref: "icon_sprite-spec-v1.0"
component: "icon_sprite"
category: "code"
strategy: "mixed"
language: "html, bash-grep, playwright"
---

## Strategy note

Refactor này thuần HTML markup — không có JS logic để unit-test. "Unit tests" thực chất là **grep-based markup assertions** (kiểm tra sprite được include đúng chỗ, `<use>` trỏ đến symbol tồn tại, inline path cũ biến mất). "Integration tests" là **Playwright visual diff** chụp 4 trang × 4 viewport để xác nhận visual parity. Cộng lại = strategy `mixed`.

---

## Unit Tests (markup assertions)

### Test: sprite_symbol_hamburger_added
- **Covers**: [REQ-01]
- **Input**: `partials/icons.svg` sau refactor
- **Verify**:
  ```bash
  grep -c 'id="icon-hamburger"' partials/icons.svg
  ```
- **Expected**: `1`

### Test: sprite_included_in_all_4_sources
- **Covers**: [REQ-02]
- **Input**: 4 `src/*.src.html`
- **Verify**:
  ```bash
  grep -l '<!-- @include partials/icons.svg -->' src/*.src.html | wc -l | tr -d ' '
  ```
- **Expected**: `4`

### Test: star_inline_removed_use_added
- **Covers**: [REQ-03]
- **Verify**:
  ```bash
  echo "inline=$(grep -c 'M9.049 2.927' src/index.src.html)"
  echo "use=$(grep -c 'href="#icon-star"' src/index.src.html)"
  ```
- **Expected**: `inline=0` và `use=15`

### Test: faq_chevron_inline_removed_use_added
- **Covers**: [REQ-04]
- **Verify**:
  ```bash
  grep -c 'href="#icon-faq-chevron"' src/index.src.html
  grep -cE '"M19 9l-7 7-7-7"' src/index.src.html
  ```
- **Expected**: `5` (use) và `0` (inline path — chú ý path này cũng xuất hiện trong sprite symbol, grep CHỈ trong src index sau refactor)

### Test: app_store_use_replaced
- **Covers**: [REQ-05]
- **Verify**:
  ```bash
  grep -c 'href="#icon-app-store"' src/index.src.html
  grep -c 'M18.71 19.5' src/index.src.html
  ```
- **Expected**: `2` (use) và `0` (inline)

### Test: google_play_use_replaced_and_drift_gone
- **Covers**: [REQ-06]
- **Verify**:
  ```bash
  grep -c 'href="#icon-google-play"' src/index.src.html
  grep -c 'zm3.199-1.4l2.533 1.467' src/index.src.html
  ```
- **Expected**: `2` (use) và `0` (drift path loại bỏ hoàn toàn)

### Test: hamburger_use_replaced
- **Covers**: [REQ-07]
- **Verify**:
  ```bash
  grep -c 'href="#icon-hamburger"' src/index.src.html
  grep -c '"M4 6h16M4 12h16M4 18h16"' src/index.src.html
  ```
- **Expected**: `1` (use) và `0` (inline — chú ý path này nằm trong sprite `<symbol>` nhưng đó là `partials/icons.svg`, không phải `src/index.src.html`)

### Test: legal_pages_nav_back_use_replaced
- **Covers**: [REQ-08]
- **Verify**:
  ```bash
  for f in src/privacy.src.html src/terms.src.html src/community-standards.src.html; do
    uses=$(grep -c 'href="#icon-carousel-prev"' "$f")
    inline=$(grep -c '"M15 19l-7-7 7-7"' "$f")
    echo "$f: use=$uses inline=$inline"
  done
  ```
- **Expected**: mỗi file: `use=1 inline=0`

### Test: carousel_controls_use_replaced
- **Covers**: [REQ-09]
- **Verify**:
  ```bash
  grep -cE 'href="#icon-carousel-(prev|next|pause|play)"' src/index.src.html
  ```
- **Expected**: `4`

### Test: carousel_pause_play_classes_preserved
- **Covers**: [REQ-09]
- **Setup**: Đảm bảo CSS selector `.carousel-toggle-pause` / `.carousel-toggle-play` vẫn chọn đúng element sau refactor.
- **Verify**:
  ```bash
  grep -c 'class="carousel-toggle-pause' src/index.src.html
  grep -c 'class="carousel-toggle-play' src/index.src.html
  ```
- **Expected**: mỗi cái `1`. (Class nằm trên wrapper `<svg>`, không phải `<use>`.)

### Test: footer_socials_use_replaced
- **Covers**: [REQ-10]
- **Verify**:
  ```bash
  grep -cE '<use href="#icon-(mail-fill|facebook|linkedin)"' partials/footer.html
  grep -c '<svg ' partials/footer.html
  ```
- **Expected**: `3` (use) và footer chỉ còn 3 `<svg>` wrapper (không tăng, không giảm).

### Test: styles_css_unchanged
- **Covers**: [REQ-11]
- **Verify**:
  ```bash
  git diff --exit-code -- assets/css/styles.css
  echo $?
  ```
- **Expected**: exit code `0` (file identical — refactor không thêm/xóa class Tailwind).

### Test: no_broken_use_references
- **Covers**: [REQ-13]
- **Setup**: Chạy sau `npm run build` trên output HTML.
- **Verify**:
  ```bash
  node -e "
    const fs = require('fs');
    const files = ['index.html','privacy.html','terms.html','community-standards.html'];
    let bad = [];
    for (const f of files) {
      const h = fs.readFileSync(f, 'utf8');
      const uses = (h.match(/href=\"#icon-[a-z-]+\"/g) || []).map(u => u.slice(7, -1));
      const ids  = (h.match(/id=\"icon-[a-z-]+\"/g)  || []).map(i => i.slice(4, -1));
      const idset = new Set(ids);
      for (const u of uses) if (!idset.has(u)) bad.push(f + ': #' + u);
    }
    if (bad.length) { console.error('BROKEN:', bad); process.exit(1); }
    console.log('OK');
  "
  ```
- **Expected**: stdout `OK`, exit code 0.

---

## Integration Tests (Playwright visual regression)

### Setup

**Config file `playwright.config.js`** (CJS to match `package.json` `"type": "commonjs"`):

```js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx serve -l 5173 .',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'mobile',  use: { viewport: { width: 375,  height: 812  } } },
    { name: 'tablet',  use: { viewport: { width: 768,  height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800  } } },
    { name: 'wide',    use: { viewport: { width: 1440, height: 900  } } },
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,   // tolerance 1% để cover font anti-aliasing OS
      animations: 'disabled',
    },
  },
});
```

**Test file `tests/visual/pages.spec.js`**:

```js
const { test, expect } = require('@playwright/test');

const PAGES = [
  { path: '/',                        name: 'index' },
  { path: '/privacy.html',            name: 'privacy' },
  { path: '/terms.html',              name: 'terms' },
  { path: '/community-standards.html',name: 'community-standards' },
];

for (const page of PAGES) {
  test(`${page.name} visual`, async ({ page: p }) => {
    await p.goto(page.path);
    // Wait for fonts + images
    await p.evaluate(() => document.fonts.ready);
    await p.waitForLoadState('networkidle');
    // Disable carousel autoplay by setting data-state on toggle to freeze
    await p.evaluate(() => {
      const toggle = document.getElementById('carousel-toggle');
      if (toggle && toggle.dataset.state === 'playing') toggle.click();
    });
    await expect(p).toHaveScreenshot(`${page.name}.png`, { fullPage: true });
  });
}
```

**Scripts in `package.json`:**

```json
"scripts": {
  "test:visual": "playwright test",
  "test:visual:update": "playwright test --update-snapshots",
  "test:visual:baseline": "git checkout main && npm run build && npm run test:visual:update && git stash -u"
}
```

### Test: baseline_snapshot_captured_before_refactor
- **Covers**: [REQ-12] (infrastructure)
- **Setup**:
  1. Ensure branch `main` is clean
  2. `npm run build && npx playwright test --update-snapshots`
  3. 16 PNG files tạo ra trong `tests/visual/__snapshots__/pages.spec.js-snapshots/`
  4. Commit baseline ngay trong cùng PR (hoặc tag baseline SHA): `git add tests/visual/__snapshots__ && git commit -m "test(visual): baseline before icon sprite refactor"`
- **Expected**: 16 file PNG tồn tại (4 pages × 4 viewports); commit log có message baseline.

### Test: visual_parity_after_refactor (15/16 expected to pass)
- **Covers**: [REQ-12]
- **Setup**: Sau khi hoàn thành REQ-01 → REQ-11, chạy `npm run build`
- **Steps**:
  1. `npx playwright test`
  2. Kỳ vọng 15 test PASS, 1 test FAIL (index với GP icon region)
  3. Review diff image trong `test-results/` — xác nhận diff giới hạn trong vùng CTA App Store/Play (icon GP canonical vs drift)
  4. `npx playwright test --update-snapshots` để accept change
  5. Chạy lại: 16/16 PASS
- **Expected**: Sau update-snapshots và rerun → `16 passed`.

### Test: no_console_errors_during_render
- **Covers**: [REQ-13]
- **Setup**: Thêm vào `tests/visual/pages.spec.js`:
  ```js
  test(`${page.name} has no console errors`, async ({ page: p }) => {
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await p.goto(page.path);
    await p.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
  ```
- **Expected**: 4 trang × 4 viewport = 16 runs, không lỗi console nào (đặc biệt không có "XML parsing error" hay "Invalid href reference" từ SVG).

---

## Edge Cases

| Case | How to simulate | Expected behavior | Covers |
|------|----------------|-------------------|--------|
| Sprite include missing từ 1 trang | Xóa `<!-- @include partials/icons.svg -->` khỏi `src/terms.src.html`, build | Tất cả `<use href="#icon-carousel-prev">` trong `terms.html` render icon trống (không path) | REQ-02 |
| Broken use reference | Thêm `<use href="#icon-doesnotexist">` tay | `no_broken_use_references` test fail với output `BROKEN: index.html: #icon-doesnotexist` | REQ-13 |
| Carousel play/pause state | Click `#carousel-toggle` → data-state="paused" | CSS ẩn icon `.carousel-toggle-play` wrapper (chứa `<use href="#icon-carousel-play">`); icon `.carousel-toggle-pause` hiện | REQ-09 |
| Hamburger menu click | Click button hamburger ở viewport < md (768px) | Menu mở; SVG icon vẫn render (không broken) | REQ-07 |
| Reduced-motion user | `page.emulateMedia({ reducedMotion: 'reduce' })` trong 1 test thêm | Carousel không auto-rotate; visual snapshot vẫn khớp (vì screenshot chụp static) | REQ-12 |
| GitHub APK link placeholder | `{{APK_VERSION}}` vẫn được replace đúng sau khi sprite được inline | Build output có URL `v1.0.35/release.apk`, không còn placeholder literal | REQ-11 |

---

## Test Data / Fixtures

Không cần fixture đặc biệt. Input là chính HTML source sau build. Baseline snapshot là "fixture" duy nhất, được commit vào repo.

**Snapshot directory layout:**
```
tests/visual/
  pages.spec.js
  __snapshots__/
    pages.spec.js-snapshots/
      index-mobile-linux.png        # hoặc -darwin tùy OS dev
      index-tablet-linux.png
      index-desktop-linux.png
      index-wide-linux.png
      privacy-mobile-linux.png
      ... (16 files total)
```

**Chú ý OS suffix:** Playwright tự động append `-linux` / `-darwin` / `-win32` vào snapshot filename. Trong CI (GitHub Actions ubuntu-latest) sẽ là `-linux`. Khi dev trên macOS sinh `-darwin`. **Quyết định**: commit cả 2 suffix hoặc pin CI image — trong scope task này, pin CI = ubuntu-latest và commit `-linux` baseline only. Dev macOS chạy local có thể fail do AA font differences — document trong CONTRIBUTING.md.

## Coverage Target

- **Markup assertions (grep):** 100% của 13 REQ có test tự động.
- **Visual parity:** 4 pages × 4 viewports = 16 snapshots (100% pages covered).
- **Browser support coverage:** Chỉ chromium (trong scope task này). Firefox/Safari không chạy visual diff — accept rủi ro vì sprite `<use href>` là standard SVG2.
- **Critical paths 100%:**
  - Carousel pause/play toggle (REQ-09) — covered by `carousel_pause_play_classes_preserved` + visual snapshot ở desktop viewport (carousel chỉ hiển thị ≥ mobile-wide).
  - Hamburger menu (REQ-07) — covered by visual snapshot ở mobile viewport (< 768px).
  - FAQ chevron visible state (REQ-04) — snapshot không mở FAQ → test chỉ cover static state; **gap**: chevron rotation state khi `<details>` open chưa cover. Chấp nhận LOW risk.

---

## Rollback Verification

Task là 1 PR. Rollback = `git revert <merge-commit>`. Verify:

| Step | Command | Expected |
|------|---------|----------|
| 1. Revert PR | `git revert <merge-sha> -m 1` | Clean revert commit |
| 2. Build | `npm run build` | Success |
| 3. Re-snapshot | `npx playwright test --update-snapshots` | 16/16 regenerate |
| 4. Compare với pre-refactor baseline | `git diff tests/visual/__snapshots__` | Không có diff vs baseline (revert về trạng thái pre-refactor) |

**Không cần rollback partial** — atomic per PR là đủ.
