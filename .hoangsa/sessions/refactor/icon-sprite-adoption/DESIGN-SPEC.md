---
spec_version: "1.0"
project: "weekend-go-web"
component: "icon_sprite"
language: "html, vanilla-js, nodejs-build"
task_type: "refactor"
category: "code"
status: "draft"
---

## Overview
[refactor]: Adopt `partials/icons.svg` sprite via `<use href>` across all source HTML

### Goal
Chấm dứt inline SVG duplication bằng cách include sprite `partials/icons.svg` vào 4 `src/*.src.html`, thay 42 inline `<svg>` rải rác bằng `<use href="#icon-...">` với visual output giữ nguyên (trừ 1 drift được chuẩn hóa về canonical).

### Context
`partials/icons.svg` đã được tạo trước đó với 10 `<symbol>` nhưng Grep `<use` toàn repo → 0 match. Icon vẫn được inline lặp đi lặp lại: star × 15 trong testimonials, chevron × 5 trong FAQ, App Store + Google Play × 2 trong index, mail/facebook/linkedin trong footer, chevron-back × 3 ở legal pages. Google Play path đã drift giữa sprite và inline. Hamburger chưa có trong sprite. Cluster A trong AUDIT-REPORT (Phase 1) xác định đây là quick-win impact cao.

### Requirements

- **[REQ-01]** Thêm `<symbol id="icon-hamburger" viewBox="0 0 24 24">` vào `partials/icons.svg` với path `M4 6h16M4 12h16M4 18h16` kèm stroke attrs (width 2, linecap round, linejoin round, stroke currentColor, fill none).
- **[REQ-02]** Thêm marker `<!-- @include partials/icons.svg -->` ngay sau `<body>` trong cả 4 file: `src/index.src.html`, `src/privacy.src.html`, `src/terms.src.html`, `src/community-standards.src.html`.
- **[REQ-03]** Thay tất cả 15 inline star SVG trong `src/index.src.html` (testimonial section, ~line 650-828) bằng `<svg class="..." aria-hidden="true"><use href="#icon-star"/></svg>` — giữ nguyên class hiện có trên wrapper.
- **[REQ-04]** Thay 5 inline chevron-down SVG trong FAQ (`src/index.src.html` ~line 1025-1145) bằng `<use href="#icon-faq-chevron"/>`.
- **[REQ-05]** Thay 2 inline App Store SVG trong `src/index.src.html` (hero CTA ~line 232 + download section ~line 1194) bằng `<use href="#icon-app-store"/>`.
- **[REQ-06]** Thay 2 inline Google Play SVG trong `src/index.src.html` (~line 255 + ~line 1217) bằng `<use href="#icon-google-play"/>`. **Chấp nhận visual change nhỏ** (path canonical từ sprite khác path inline — xem RESEARCH.md §1.3).
- **[REQ-07]** Thay 1 hamburger SVG trong `src/index.src.html:124-138` bằng `<use href="#icon-hamburger"/>`.
- **[REQ-08]** Thay 1 chevron-prev (nav-back) trong mỗi legal page (`src/privacy.src.html`, `src/terms.src.html`, `src/community-standards.src.html`) bằng `<use href="#icon-carousel-prev"/>`. Giữ class wrapper `w-4 h-4` + stroke handling.
- **[REQ-09]** Thay 1 carousel-prev, 1 carousel-next, 1 carousel-pause, 1 carousel-play trong `src/index.src.html` bằng `<use href>` tương ứng. **Phải đảm bảo pause/play state toggle logic trong `assets/js/carousel.js:166` vẫn hoạt động** (JS hiện set `btn.dataset.state` — HTML vẫn render cả 2 SVG + CSS ẩn 1; cần giữ nguyên structure HTML để CSS rule `#carousel-toggle[data-state="paused"] .carousel-toggle-pause { display:none }` vẫn chọn đúng element).
- **[REQ-10]** Thay 3 inline SVG trong `partials/footer.html` (mail-fill, facebook, linkedin) bằng `<use href>` tương ứng.
- **[REQ-11]** Sau build (`npm run build`), kiểm tra diff `git diff -- *.html assets/css/styles.css` → chỉ có file HTML output được cập nhật (do sprite + use); `styles.css` KHÔNG đổi (không thêm class Tailwind mới).
- **[REQ-12]** Setup Playwright test infrastructure (`@playwright/test` devDep, `playwright.config.js`, thư mục `tests/visual/`) và thêm 4 visual regression test (1 per page) chụp snapshot ở 4 viewport (375, 768, 1280, 1440). Commit baseline sau khi migration hoàn tất.
- **[REQ-13]** Tất cả pages phải render không lỗi console, không broken `<use>` reference (mỗi `href="#..."` phải trỏ đến symbol tồn tại trong `partials/icons.svg`).

### Out of Scope

Xem [CONTEXT.md](CONTEXT.md) — Out of Scope section. Tóm tắt: không rename symbol, không tách FAQ data-driven, không partial-hóa CTA, không đụng CSP, không viết behavior test cho carousel/menu.

---

## Types / Data Models

Dự án là vanilla HTML/JS, không có type system (TypeScript chưa adopt). Thay vào đó, **data shape** được định nghĩa qua convention:

### Icon usage contract (DOM convention)

```html
<!-- BEFORE (inline) -->
<svg class="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" viewBox="0 0 20 20">
  <path d="M9.049 2.927c.3-.921 1.603-.921 ..."/>
</svg>

<!-- AFTER (sprite reference) -->
<svg class="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true">
  <use href="#icon-star"/>
</svg>
```

**Invariant:** class + aria attributes LUÔN giữ ở wrapper; `<path>` content LUÔN chỉ định trong `<symbol>` bên trong sprite. `<use>` KHÔNG có class/style riêng.

### Sprite entry contract (icons.svg)

```xml
<symbol id="icon-<kebab-case-name>" viewBox="0 0 <w> <h>">
  <!-- paths, with stroke/fill attrs inside symbol if needed -->
</symbol>
```

**Invariant:** mỗi symbol là self-contained (viewBox + stroke/fill defined internally). Wrapper `<svg>` chỉ quyết định size + color (qua currentColor inheritance) + a11y.

---

## Interfaces / APIs

Dự án không có JS public API cho sprite — sprite là pure markup. Tuy nhiên có các **contract điểm**:

### 1. Build pipeline (`scripts/build-html.js`)

Không cần đổi code build. Contract đã tồn tại:
```
INCLUDE_RE: /<!--\s*@include\s+(\S+)\s*-->/g   → replace bằng nội dung file
```
`partials/icons.svg` là file hợp lệ (startsWith ROOT check pass), sẽ được inline nguyên văn.

### 2. Carousel pause/play CSS selector contract

[`assets/css/carousel.css:24-26`](assets/css/carousel.css#L24):
```css
#carousel-toggle[data-state="paused"] .carousel-toggle-pause { display: none; }
#carousel-toggle[data-state="playing"] .carousel-toggle-play { display: none; }
```

HTML structure hiện tại:
```html
<button id="carousel-toggle" data-state="playing">
  <svg class="carousel-toggle-pause ..."><path d="..."/></svg>
  <svg class="carousel-toggle-play ..."><path d="..."/></svg>
</button>
```

Sau migration, phải giữ nguyên 2 `<svg>` với class `carousel-toggle-pause`/`carousel-toggle-play`:
```html
<button id="carousel-toggle" data-state="playing">
  <svg class="carousel-toggle-pause ..." aria-hidden="true"><use href="#icon-carousel-pause"/></svg>
  <svg class="carousel-toggle-play ..." aria-hidden="true"><use href="#icon-carousel-play"/></svg>
</button>
```

Không được consolidate 2 SVG thành 1 với JS `href` toggle (có thể cleaner nhưng đó là SIMPL-010 — scope riêng).

---

## Implementations

### Design Decisions

| # | Decision | Reasoning | Type |
|---|----------|-----------|------|
| 1 | Sprite inline 1 lần/trang qua `<!-- @include partials/icons.svg -->` trong `<body>` | Cross-document `<use href="file.svg#icon">` không hoạt động trên file:// và chậm trên http (extra request). Inline một lần local là pattern SVG sprite phổ biến nhất. | LOCKED |
| 2 | Include marker đặt **sau `<body>` mở tag, trước mọi content** | Sprite phải parse trước khi bất kỳ `<use>` nào tham chiếu. Sprite có `style="display:none"` nên không ảnh hưởng layout. | LOCKED |
| 3 | Thay `<path d="...">` inline bằng `<use href="#...">`, giữ wrapper `<svg>` nguyên class | Refactor tối thiểu surface diff; visual không đổi (except GP drift fix). | LOCKED |
| 4 | Xóa `viewBox` và `fill="none"` khỏi wrapper khi symbol đã có trong sprite (trừ trường hợp CSS class yêu cầu fill-current → giữ) | Reduce attribute noise. `<use>` auto-inherit viewBox từ symbol. | FLEXIBLE |
| 5 | Giữ attribute `aria-hidden="true"` trên wrapper (hoặc thêm nếu chưa có) | A11y: icon thuần trang trí không nên bị screen reader đọc. | LOCKED |
| 6 | Google Play path: **dùng sprite canonical**, accept visual change nhỏ trong 2 wedge segment | Inline path đã drift (khả năng do sửa tay hoặc copy từ source khác); sprite là "spec". User sẽ xác nhận snapshot update qua Playwright approve. | LOCKED |
| 7 | Legal pages dùng chung `#icon-carousel-prev` cho nav-back (path identical) | Tránh mở rộng spec. Naming awkward nhưng scope rename không phải phần task này. | FLEXIBLE |
| 8 | Playwright test dùng `toHaveScreenshot({ maxDiffPixelRatio: 0.01 })` | 1% pixel tolerance để cover font anti-aliasing khác giữa OS — nhưng vẫn bắt regression rõ ràng. | FLEXIBLE |
| 9 | Baseline snapshot chụp trước refactor trên `main`, commit vào `tests/visual/__snapshots__/` | Pre-change baseline là một điều kiện bắt buộc để visual diff có nghĩa. | LOCKED |
| 10 | Không đổi `package.json` `"type": "commonjs"` | Playwright config có thể là CJS hoặc ESM — chọn CJS để khớp với build-html.js hiện tại. | FLEXIBLE |

### Affected Files

| File | Action | Description | Impact |
|------|--------|-------------|--------|
| `partials/icons.svg` | MODIFY | Thêm `<symbol id="icon-hamburger">` (1 entry) | N/A (sprite được include thêm vào 4 trang, không có caller cũ) |
| `src/index.src.html` | MODIFY | Thêm `<!-- @include partials/icons.svg -->`; thay 36 inline SVG bằng `<use href>` | d=1 (build output `index.html` sẽ đổi) |
| `src/privacy.src.html` | MODIFY | Thêm sprite include; thay 1 nav-back SVG | d=1 (`privacy.html`) |
| `src/terms.src.html` | MODIFY | Thêm sprite include; thay 1 nav-back SVG | d=1 (`terms.html`) |
| `src/community-standards.src.html` | MODIFY | Thêm sprite include; thay 1 nav-back SVG | d=1 (`community-standards.html`) |
| `partials/footer.html` | MODIFY | Thay 3 inline SVG (mail/facebook/linkedin) bằng `<use>` | d=1 (tất cả 4 trang reference) |
| `index.html`, `privacy.html`, `terms.html`, `community-standards.html` | REGENERATE | Output từ `npm run build:html` | d=2 (deploy target) |
| `package.json` | MODIFY | Thêm `@playwright/test` vào devDependencies; thêm `test:visual`, `test:visual:update` scripts | d=1 (CI sẽ dùng) |
| `playwright.config.js` | CREATE | Config 4 viewport, baseURL, screenshot mode | N/A (new file) |
| `tests/visual/pages.spec.js` | CREATE | 4 test case (index, privacy, terms, community-standards) × 4 viewport = 16 snapshot | N/A (new file) |
| `tests/visual/__snapshots__/` | CREATE | 16 baseline PNG | N/A (new dir) |
| `.gitignore` | MODIFY | Thêm `test-results/`, `playwright-report/` (snapshot diff output) | N/A |
| `README.md` | MODIFY | Thêm 1 dòng `npm run test:visual` vào section Scripts (nếu đang refactor) | N/A |

**Assumption:** GitNexus impact cho `partials/icons.svg` d=1 = 4 src files sau khi thêm @include; d=2 = 4 output HTML. Không có JS/CSS caller.

### Implementation Flow

Order matter — phụ thuộc baseline snapshot phải được chụp TRƯỚC khi đổi HTML.

1. **Setup Playwright** (trên current state, chưa refactor):
   - `npm i -D @playwright/test`
   - `npx playwright install chromium` (chỉ cần chromium cho visual test, giảm CI time)
   - Tạo `playwright.config.js`: 4 viewport, 1 browser, `toHaveScreenshot` config
   - Tạo `tests/visual/pages.spec.js` cover 4 pages
   - Chạy `npm run build` (ensure HTML output fresh)
   - Chạy `npx playwright test --update-snapshots` để tạo baseline
   - Commit baseline: `.hoangsa/sessions/refactor/icon-sprite-adoption/baseline-commit-ref.txt` ghi SHA.

2. **Add hamburger symbol** trong `partials/icons.svg` (non-breaking, chỉ thêm).

3. **Include sprite trong 4 src files** qua `<!-- @include partials/icons.svg -->`.

4. **Replace inline SVG bằng `<use>`** theo thứ tự:
   - 4a. Footer (partials/footer.html) — 3 SVG
   - 4b. Legal pages nav-back — 3 files × 1 SVG
   - 4c. Index hamburger + carousel controls — 5 SVG
   - 4d. Index testimonial stars — 15 SVG
   - 4e. Index FAQ chevron — 5 SVG
   - 4f. Index App Store CTA — 2 SVG
   - 4g. Index Google Play CTA — 2 SVG (expect visual diff)

5. **Rebuild** (`npm run build`) và verify không có broken `<use>` reference (grep output HTML → mọi `href="#..."` phải khớp `id="..."` đã có).

6. **Chạy visual diff** (`npx playwright test`):
   - 15/16 snapshot expected PASS
   - 1 snapshot (Google Play icon region trong index) expected DIFF
   - Manual review diff image trong `test-results/` — confirm chỉ là GP icon change, không bleed sang phần khác
   - `npx playwright test --update-snapshots` để accept GP change
   - Commit updated snapshot với note "accept GP canonical path"

7. **Run existing dev flow** (`npm run dev` + mở browser) để smoke check interactively:
   - Click hamburger → menu mở
   - Scroll tới carousel → ảnh chuyển được, nút pause/play toggle đúng
   - FAQ chevron xoay khi expand
   - Footer icons render đúng màu

8. **Cleanup:** xóa Google Play drift path khỏi `src/index.src.html` (đã thay bằng `<use>`, path cũ không còn trong source).

---

## Open Questions

- **Không có.** Sprite đã tồn tại, cơ chế build rõ, target browser xác nhận hỗ trợ SVG2 `<use href>`.

## Constraints

- **Compatibility:** Target iOS 13+, Android 8+ (Chrome 70+, Safari 13+) — tất cả hỗ trợ SVG2 `<use href>` native.
- **Performance:** Sprite thêm ~2KB vào mỗi trang. Inline SVG giảm ~4.5KB trên index. Net: -2.5KB / index (trước gzip), -1.7KB / legal.
- **Build time:** Không đổi (`scripts/build-html.js` runtime < 50ms, thêm 1 include không ảnh hưởng).
- **Playwright install:** ~150MB (chromium). Không commit `.playwright/`. CI sẽ cache giữa runs.
- **A11y:** Mọi SVG trang trí phải `aria-hidden="true"`. Nav-back SVG ở legal pages nằm trong `<a>` với text visible kề — `aria-hidden` đúng.

---

## Acceptance Criteria

### Per-Requirement

| Req | Verification | Expected Result |
|-----|-------------|----------------|
| REQ-01 | `grep -c 'id="icon-hamburger"' partials/icons.svg` | `1` |
| REQ-02 | `grep -l '<!-- @include partials/icons.svg -->' src/*.src.html \| wc -l` | `4` |
| REQ-03 | `grep -c 'M9.049 2.927' src/index.src.html` | `0` (sau refactor, không còn inline path) |
| REQ-03 | `grep -c 'href="#icon-star"' src/index.src.html` | `15` |
| REQ-04 | `grep -c 'M19 9l-7 7-7-7' src/index.src.html` | `0` |
| REQ-04 | `grep -c 'href="#icon-faq-chevron"' src/index.src.html` | `5` |
| REQ-05 | `grep -c 'href="#icon-app-store"' src/index.src.html` | `2` |
| REQ-06 | `grep -c 'href="#icon-google-play"' src/index.src.html` | `2` |
| REQ-06 | `grep -c 'zm3.199-1.4l2.533 1.467' src/index.src.html` | `0` (drift path gone) |
| REQ-07 | `grep -c 'href="#icon-hamburger"' src/index.src.html` | `1` |
| REQ-08 | `grep -c 'href="#icon-carousel-prev"' src/privacy.src.html src/terms.src.html src/community-standards.src.html` | `3` (1 per file) |
| REQ-09 | `grep -c 'href="#icon-carousel-\\(prev\\|next\\|pause\\|play\\)"' src/index.src.html` | `4` |
| REQ-10 | `grep -c '<use href="#icon-' partials/footer.html` | `3` |
| REQ-11 | `npm run build && git diff --stat \| grep -v '\\.html' \| grep -v '\\.svg' \| grep -v '\\.md' \| grep -v 'package' \| wc -l` | `0` (chỉ HTML/SVG/MD/package thay đổi; styles.css không đổi) |
| REQ-12 | `ls playwright.config.js tests/visual/pages.spec.js tests/visual/__snapshots__/` | Tất cả tồn tại |
| REQ-12 | `npx playwright test` (sau khi update GP snapshot) | 16/16 PASS |
| REQ-13 | `node -e "const h=require('fs').readFileSync('index.html','utf8'); const uses=h.match(/href=\"#icon-[a-z-]+\"/g)\|\|[]; const ids=h.match(/id=\"icon-[a-z-]+\"/g)\|\|[]; const miss=uses.filter(u=>!ids.some(i=>i.slice(4,-1)===u.slice(6,-1))); console.log(miss.length===0?'OK':'MISSING:'+miss)"` | `OK` |

### Overall

```bash
# 1. Build sạch
npm run build

# 2. Markup verification
./scripts/verify-sprite.sh   # script helper chạy tất cả grep trên

# 3. Visual regression (16 snapshot)
npx playwright test

# 4. Smoke interactive (dev server)
npm run dev   # rồi mở http://localhost:3000 manually — chỉ cần dev đã sẵn (sau khi ship script serve)
```

**Pass criteria:**
- Build không error.
- Markup grep checks (REQ-01 → REQ-13) tất cả pass.
- Playwright 16/16 pass (snapshot đã update cho GP change).
- Browser smoke: hamburger menu, carousel controls, FAQ chevron, testimonial stars đều render đúng.
- `git diff` trên `assets/css/styles.css` = empty (no Tailwind class change).
