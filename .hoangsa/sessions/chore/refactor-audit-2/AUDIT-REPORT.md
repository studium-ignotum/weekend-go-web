# Audit Report — weekend-go-web (refactor scope)

**Project:** weekend-go-web (Cuối Tuần Đi Đâu landing page)
**Date:** 2026-04-14
**Target:** Toàn bộ project (trừ `node_modules/`, `.git/`, `.gitnexus/`, `.hoangsa/`, `assets/images/*`, file output `*.html` ở root, `package-lock.json`)
**Scope:** Full audit (9 dimensions)
**Depth:** Deep (đọc code, trace flows, cross-reference)
**Tech Stack:** HTML tĩnh + Vanilla JS + Tailwind CSS 3.4.19 (devDep) + custom `scripts/build-html.js` partial system
**Branch tại thời điểm audit:** `refactor/split-js-css-carousel`

---

## Executive Summary

`weekend-go-web` là landing page marketing tĩnh cho app "Cuối Tuần Đi Đâu" (phục vụ phụ huynh Hà Nội/HCM tìm hoạt động cuối tuần). Dự án nhỏ (≈2.2k LOC source HTML, 206 LOC JS, 82 LOC CSS), vận hành tốt về mặt **bảo mật** (0 lỗ hổng npm audit, không có XSS vector rõ ràng, không tracking, CSP đã bật qua meta) và **dependency health** (1 devDep duy nhất, lockfile present), nhưng đang tích tụ **nợ kỹ thuật tổ chức** đáng kể ngay khi chuyển từ giai đoạn MVP sang duy trì có cấu trúc.

**Ba chủ đề nổi bật nhất** (mỗi chủ đề trải dài 4-7 dimension, dồn ở mức HIGH):

1. **Trùng lặp và drift HTML/SVG.** `partials/icons.svg` đã được tạo với 10 biểu tượng nhưng **chưa include ở bất kỳ đâu** — toàn bộ icon (star × 15, chevron × 5, Apple/Play/Facebook/LinkedIn/Mail) vẫn inline lặp đi lặp lại khắp `src/index.src.html` (1239 LOC) và `partials/footer.html`. Đã bắt đầu xuất hiện **drift**: path Google Play trong `src/index.src.html:255` đã khác path trong `partials/icons.svg:13`. Cùng pattern ở cấp cao hơn: `<head>`+`<nav>` của 3 trang legal (privacy/terms/community-standards) trùng ~85 dòng mỗi trang, CSP đã drift (index dùng `'unsafe-inline'`, legal pages thì không). Đây là chi phí maintain đắt nhất hiện tại.

2. **Không có lưới an toàn tự động.** 0 test, 0 CI workflow, 0 linter/formatter, 0 pre-commit hook. Bảy session `fix/a11y-deep/` gần đây cho thấy a11y đã regression nhiều lần nhưng không có axe-core/Lighthouse CI để chặn. Branch `refactor/split-js-css-carousel` hiện tại đang refactor `carousel.js` (187 LOC logic auto-rotate + reduced-motion + visibility + pause/play) — đúng phần cần test nhất nhưng không có một assertion nào. README còn khẳng định sai "No build step" trong khi đã có `npm run build` với Tailwind CLI + `scripts/build-html.js`.

3. **Hot-path performance trên thiết bị yếu.** Hero PNG fallback 532KB desktop / 296KB mobile (WebP cùng cảnh chỉ 30KB/17KB) là điểm nhức lớn cho thị trường Việt Nam. Carousel dùng `setTimeout` (600ms cứng) thay vì `transitionend` và forced-reflow mỗi 3 giây tạo jank trên Android Go. `will-change: transform, opacity` áp dụng vĩnh viễn cho tất cả 7 `.phone-item` (kể cả phần tử ẩn) tạo 7 compositor layer trên GPU mobile cấp thấp.

**Priority recommendation:** Phase 1 nên tập trung vào **cluster icon sprite + partial hóa header/nav + Hero image optimization** (7 HIGH findings, tất cả effort S–M) vì (a) khóa được drift đang hình thành, (b) giảm ngay HTML payload + LCP, (c) đặt nền cho Phase 2 (test framework + CI) vận hành trên code base đã sạch hơn.

### Health Score

| Dimension | Score | Issues |
|-----------|-------|--------|
| Architecture & Structure | 🟡 | 15 findings (2 H, 7 M, 6 L) |
| ↳ Overengineering | 🟢 | 0 specific findings (project không over-architected) |
| ↳ Dead Code | 🟡 | Sprite chưa dùng, `.nav-link` CSS dead, font latin-ext inconsistent |
| ↳ Bloated Files | 🔴 | `src/index.src.html` 1239 LOC cần tách |
| Code Quality | 🔴 | 15 findings (4 H, 7 M, 4 L) |
| ↳ Magic Values | 🟡 | Carousel positions/breakpoints/timer hard-coded |
| Security | 🟢 | 15 findings (0 H, 1 M, 14 L) — baseline tốt |
| Performance | 🔴 | 15 findings (4 H, 7 M, 4 L) — hero image + carousel hot path |
| Dependencies | 🟢 | 6 findings (0 H, 1 M, 5 L) — 0 vuln, lockfile OK |
| Tests | 🔴 | 10 findings (2 H, 6 M, 2 L) — zero tests, zero CI |
| Documentation | 🔴 | 10 findings (2 H, 5 M, 3 L) — README sai tech stack |
| Developer Experience | 🔴 | 12 findings (5 H, 4 M, 3 L) — no lint/CI/hot-reload |
| Simplify Scan | 🟡 | 15 findings (2 H, 6 M, 7 L) |
| ↳ Standards Compliance | 🟡 | ~70% (sprite adoption 0%, module boundary inconsistent) |
| ↳ Clarity | 🟡 | Carousel state machine phân mảnh 3 nơi |
| ↳ Balance | 🟢 | Không có over-clever code; thiếu một vài helpful abstractions |

🔴 = critical/high issues found, 🟡 = medium issues only, 🟢 = low or no issues

**Tổng: 113 findings (0 CRITICAL / 21 HIGH / 44 MEDIUM / 48 LOW).**

---

## Cross-cutting Clusters (đọc trước khi vào chi tiết)

Nhiều finding thuộc cùng một nhóm nguyên nhân gốc. Fix ở cấp cluster sẽ giải quyết đồng thời nhiều finding — priority tốt hơn là fix từng cái rời rạc.

### Cluster A — Icon sprite chưa được dùng + drift

**Findings:** ARCH-002, ARCH-013, ARCH-014, SMELL-003, PERF-012, SIMPL-001, SIMPL-002, SIMPL-009 (8 findings, trong đó 2 HIGH).
**Triệu chứng:** `partials/icons.svg` đã có 10 symbol (star, chevron, app-store, google-play, mail-fill, facebook, linkedin, carousel-prev/next/pause/play) nhưng Grep `<use` trên toàn bộ `*.html` → 0 match. Icon được inline lặp — star × 15 trong testimonials, chevron × 5 trong FAQ, Apple/Play path × 2 trong index, mail/facebook/linkedin inline trong footer. Google Play path đã **drift** giữa [`src/index.src.html:255`](src/index.src.html#L255) và [`partials/icons.svg:13`](partials/icons.svg#L13).
**Root cause fix:** Thêm `<!-- @include partials/icons.svg -->` ngay sau `<body>` của 4 `src/*.src.html`, rồi thay mọi inline SVG bằng `<svg><use href="#icon-…"/></svg>`. Thêm `icon-hamburger` vào sprite. Xóa Google Play path drift, chọn icons.svg làm single source of truth.
**Effort:** M. **Reduces payload:** ~4-5KB HTML/trang.

### Cluster B — Header/nav/head trùng 4 file HTML, CSP đã drift

**Findings:** ARCH-001, ARCH-003, SMELL-001, SMELL-002, SMELL-007, SMELL-009, SMELL-015, DOC-002, SEC-002 (9 findings, 4 HIGH).
**Triệu chứng:** `src/index.src.html` dài 1239 LOC chưa tách partial; 3 trang legal lặp `<head>` + `<nav>` 85 dòng mỗi file. Hệ quả: CSP `style-src` index có `'unsafe-inline'` nhưng 3 legal thì không (drift), preload font ở 4 nơi, script include lặp 4 lần, JSON-LD có ở legal nhưng không có ở index.
**Root cause fix:** Tách `partials/header.html`, `partials/hero.html`, `partials/features.html`, `partials/how-it-works.html`, `partials/testimonials.html`, `partials/carousel.html`, `partials/faq.html`, `partials/cta-download.html`, `partials/head-common.html`, `partials/nav-legal.html`, `partials/download-buttons.html`, `partials/scripts-common.html`. Mở rộng `scripts/build-html.js` hỗ trợ placeholder `{{PAGE_TITLE}}`, `{{PAGE_URL}}`, `{{PAGE_DESC}}`, `{{SITE_URL}}`, `{{SUPPORT_EMAIL}}` (đã có `{{APK_VERSION}}` pattern sẵn).
**Effort:** L (nhiều partial) nhưng mỗi partial là S. **Reduces shotgun surgery** từ "sửa 4 file" về "sửa 1 file".

### Cluster C — Carousel.js: magic values, DOM coupling, state machine phân mảnh, không test

**Findings:** ARCH-009, ARCH-010, ARCH-012, SMELL-004, SMELL-005, SMELL-006, SMELL-011, SMELL-012, SMELL-014, PERF-003, PERF-004, PERF-005, PERF-006, PERF-015, SIMPL-003, SIMPL-004, SIMPL-005, SIMPL-006, SIMPL-007, SIMPL-008, SIMPL-010, SIMPL-011, SIMPL-012, SIMPL-013, TEST-002 (**25 findings** — lớn nhất repo).
**Triệu chứng:** File 187 LOC ở top-level scope, biến global (`carousel`, `phones`, `centerIndex`, `animating`, `autoTimer`, …); `throw` cứng nếu không thấy `#phone-carousel`; `VISIBLE_POSITIONS` hard-code số (rotateY 55°, translateX 420px, opacity 0.4…); breakpoint duplicate với `carousel.css` + tailwind config; `setTimeout` 600ms thay vì `transitionend`; không listen resize; forced reflow mỗi 3s; `will-change` áp dụng cho cả 7 phần tử (kể cả ẩn); `goTo()` 34 dòng làm 4 việc; `reorderDOM` mutation qua reference NodeList; `shift = direction === 1 ? 1 : -1` redundant; `clamp` Math.max/min inline; `resetAutoPlay`/`startAutoPlay` double-clearInterval; Vietnamese UI string hard-coded; **0 test** cover nhánh reduced-motion/visibility/hover/pause.
**Root cause fix:** Rewrite thành module ES hoặc IIFE: `function initCarousel(root, config) { … }`; tách `carouselConfig` ra file riêng (`assets/js/carousel.config.js`); thay `setTimeout` bằng `transitionend`; thêm `ResizeObserver`; chuyển CSS transition từ JS inline sang class `.is-animating`; đổi `will-change` chỉ cho 5 visible; viết Playwright test cho 5 scenario (auto-rotate, hover pause, button pause, visibilitychange, reduced-motion).
**Effort:** XL tổng thể (nhưng chia đc thành 8-10 task S/M độc lập). **Unlocks** test + perf + type safety.

### Cluster D — Zero automated validation

**Findings:** TEST-001 đến TEST-010, DX-003, DX-004, DX-005, DX-007 (14 findings, 4 HIGH).
**Triệu chứng:** Không test, không CI workflow (`.github/workflows/` không tồn tại), không linter (Prettier/ESLint/htmlhint/stylelint), không pre-commit hook, không a11y/html validator, không link checker, không visual regression, không performance budget.
**Root cause fix:** Thiết lập cổng chất lượng tối thiểu: Prettier + `prettier-plugin-tailwindcss` → htmlhint → Playwright (smoke test + axe-core) → lychee link checker → Lighthouse CI → GitHub Actions workflow chạy `npm ci && npm run build && (check git diff --exit-code) && npm test && npx playwright test && lhci autorun`.
**Effort:** M-L. **Unlocks** mọi refactor tương lai có lưới an toàn.

### Cluster E — README/docs đã lệch với thực tế

**Findings:** DOC-001, DOC-002, DOC-003, DOC-004, DOC-005, DOC-006, DOC-007, DX-006, DX-008, DX-011, DX-012 (11 findings, 3 HIGH).
**Triệu chứng:** README dòng 16 ghi "No build step" + dòng 14-15 ghi "Tailwind via CDN / Inter via Google Fonts" — **cả ba đều sai** (đã có npm build pipeline, Tailwind compile local, font self-host). Hệ thống partial `<!-- @include -->` và placeholder `{{APK_VERSION}}` không được document ở đâu. `CLAUDE.md` và `AGENTS.md` size giống hệt 5508 bytes (GitNexus boilerplate, 0 project-specific guidance). Không có DEPLOY.md, CONTRIBUTING.md. `.gitignore` còn ignore `CLAUDE.md` nhưng file đã được track. `appVersion` vs `version` không có comment phân biệt.
**Root cause fix:** Rewrite README (setup, dev, build, project structure, partial syntax, APK version bump, deployment). Tạo ARCHITECTURE.md (giải thích build-html.js). Tạo CONTRIBUTING.md (conventional commits, branch naming, pre-commit flow). Viết lại AGENTS.md với project-specific guidance; `CLAUDE.md` → symlink hoặc stub `> See AGENTS.md`.
**Effort:** M.

### Cluster F — CSS pipeline phân đôi

**Findings:** ARCH-004, ARCH-005, ARCH-006, ARCH-007, ARCH-008, PERF-007, PERF-008, PERF-011, PERF-015, SMELL-011 (10 findings, 0 HIGH).
**Triệu chứng:** 2 CSS file ở 2 thư mục (`src/input.css` qua Tailwind build vs `assets/css/carousel.css` raw). Chỉ index load carousel.css, 3 legal thì không. Font latin-ext declared nhưng không preload. `.nav-link` CSS dead. Build artifact `assets/css/styles.css` committed lẫn source. Breakpoint duplicate JS/CSS/config.
**Root cause fix:** Gộp carousel.css vào `src/input.css` dưới `@layer components`. Quyết định commit-build-output policy (commit vs gitignore). Xóa `.nav-link` dead code. Hoặc preload hoặc xóa font latin-ext.
**Effort:** S-M.

### Cluster G — Hero image weight + responsive

**Findings:** PERF-001, PERF-002, PERF-009, PERF-010 (4 findings, 2 HIGH).
**Triệu chứng:** `hero-banner-desktop.png` 532KB, `hero-banner-mobile.png` 296KB (WebP cùng cảnh 30KB/17KB). `<source srcset>` chỉ có 1 URL (không `srcset` DPR hay `sizes`). Carousel 7 ảnh đều `loading="lazy"` kể cả center. Không có `decoding="async"` trên bất kỳ `<img>`.
**Root cause fix:** (a) Optimize PNG fallback xuống <100KB (pngquant) hoặc bỏ PNG (WebP support >96%). (b) Thêm srcset 360w/720w/1080w + sizes. (c) Bỏ `loading="lazy"` cho carousel center, thêm `decoding="async"`.
**Effort:** S-M. **Reduces LCP + mobile data** đáng kể.

### Cluster H — Hardcoded constants (URL/email/version)

**Findings:** SMELL-008, SMELL-009 (2 findings, 1 HIGH).
**Triệu chứng:** `https://cuoituandidau.vn` lặp 62 lần; `hello@cuoituandidau.vn` 6 lần; TestFlight + GitHub APK URL lặp 2-4 lần trong index; App Store/Play CTA block copy-paste nguyên trong index (2 lần).
**Root cause fix:** Mở rộng build-html.js với `{{SITE_URL}}`, `{{SUPPORT_EMAIL}}`, `{{APP_STORE_URL}}`, `{{GOOGLE_PLAY_URL}}`, `{{TESTFLIGHT_URL}}` — đọc từ `src/config.json` hoặc section mới trong `package.json`. Tách `partials/download-buttons.html`.
**Effort:** M. **Enables** đổi domain/email/link không cần touch 60+ chỗ.

### Cluster I — Security headers qua HTTP

**Findings:** SEC-001, SEC-003, SEC-004, SEC-005, SEC-010, SEC-014 (6 findings, 1 MEDIUM, others LOW).
**Triệu chứng:** CSP chỉ qua `<meta>` → `frame-ancestors`, `report-uri` không có hiệu lực. Thiếu `X-Frame-Options`, `Referrer-Policy`, `HSTS`, `Permissions-Policy`, `X-Content-Type-Options`. Link external (TestFlight, GitHub APK) thiếu `rel="noreferrer"`. CSP thiếu `form-action`, `frame-src`. `.gitignore` thiếu `*.pem`, `credentials.json`, `.npmrc`.
**Root cause fix:** Thêm `_headers` / `vercel.json` / `netlify.toml` (tùy host) với tất cả header. Chuyển CSP sang HTTP response header. Thêm report-to endpoint. Cập nhật .gitignore.
**Effort:** S.

### Cluster J — DX friction (no dev server, no preview)

**Findings:** DX-001, DX-002, DX-009, ARCH-015 (4 findings, 2 HIGH).
**Triệu chứng:** `npm run dev` chỉ watch CSS, không HTTP server, không auto-rebuild HTML khi sửa partial. Không có `npm run serve`/`preview`. `.DS_Store` tracked trong repo.
**Root cause fix:** Thêm `browser-sync` + `chokidar-cli` watch `src/**` + `partials/**`. Thêm `npm run serve` / `preview`. `git rm --cached **/.DS_Store`.
**Effort:** S.

---

## Critical & High Priority Issues

**0 CRITICAL. 21 HIGH.** Nhóm theo cluster để tiện tracking.

### HIGH-01 (ARCH-001) — `src/index.src.html` phình 1239 LOC

- **Dimension:** Architecture
- **Location:** [`src/index.src.html:1-1239`](src/index.src.html)
- **Evidence:** 8 section liên tiếp (Hero line 167, Social Proof line 315, Features line 353, How-it-Works line 558, Testimonials line 628, Phone Carousel line 853, FAQ line 1003, Download CTA line 1159) — chỉ có footer đã là partial.
- **Impact:** Review PR, diff, merge conflict rất tốn. Sửa một section đụng file khổng lồ.
- **Suggested Fix:** Tách 7-8 partial; `index.src.html` còn ~80 LOC shell. Cluster B đi kèm.
- **Effort:** L
- **Related:** Cluster B, SMELL-002, DOC-002.

### HIGH-02 (ARCH-002 + SMELL-003 + SIMPL-001) — Icon sprite partials/icons.svg không được include

- **Dimension:** Architecture / Code Smell / Simplify
- **Location:** [`partials/icons.svg:1-38`](partials/icons.svg), [`src/index.src.html:650-828`](src/index.src.html#L650), [`src/index.src.html:1025-1145`](src/index.src.html#L1025), [`partials/footer.html:61-83`](partials/footer.html#L61)
- **Evidence:** Grep `<use` trên `src/**/*.html` và `partials/*.html` → 0 match. Icon-star path `M9.049 2.927c.3-.921…` inline 15 lần (3 testimonial × 5). Chevron FAQ 5 lần. Mail/Facebook/LinkedIn trong footer vẫn inline.
- **Impact:** ~4-5KB HTML dư thừa mỗi trang; sửa style icon phải đụng 15-20 chỗ; sprite đã được tạo nhưng dead code.
- **Suggested Fix:** `<!-- @include partials/icons.svg -->` đầu `<body>` 4 src; thay inline SVG bằng `<svg class="…"><use href="#icon-star"/></svg>`. Thêm `icon-hamburger`.
- **Effort:** M
- **Related:** Cluster A, ARCH-013, ARCH-014, PERF-012, SIMPL-002, SIMPL-009.

### HIGH-03 (SIMPL-002) — Google Play icon path đã drift giữa inline và sprite

- **Dimension:** Simplify (preserve)
- **Location:** [`src/index.src.html:255`](src/index.src.html#L255) vs [`partials/icons.svg:13`](partials/icons.svg#L13)
- **Evidence:** icons.svg:13 dùng path `M3.609 1.814L13.792 12 3.61 22.186 … m10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626 …`. index.src.html:255 dùng path khác ở phần cuối `… zm3.199-1.4l2.533 1.467 a1 1 0 010 1.733l-2.197 1.272-2.543-2.543 2.207-1.929 …`.
- **Impact:** Source of truth không rõ; cập nhật icon dễ sót một bên. Triệu chứng mutation qua duplicated reference.
- **Suggested Fix:** Chọn bản icons.svg làm chuẩn, xóa inline, dùng `<use href="#icon-google-play"/>`.
- **Effort:** S
- **Related:** Cluster A, HIGH-02.

### HIGH-04 (SMELL-001) — 3 trang legal trùng `<head>` + nav + JSON-LD ~85 LOC mỗi trang

- **Dimension:** Code Smell
- **Location:** [`src/privacy.src.html:1-84`](src/privacy.src.html), [`src/terms.src.html:1-84`](src/terms.src.html), [`src/community-standards.src.html:1-84`](src/community-standards.src.html)
- **Evidence:** Cả 3 file lặp: CSP meta, OG/Twitter tags, preload fonts, link stylesheet, JSON-LD BreadcrumbList, nav header (dòng 62-84). Khác duy nhất title/description/url.
- **Impact:** Đổi CSP, sửa logo, thêm font, update nav → sửa 3 chỗ. **CSP đã drift** (xem HIGH-06).
- **Suggested Fix:** Tách `partials/head-common.html` + `partials/nav-legal.html`; mở rộng build-html.js hỗ trợ `{{PAGE_TITLE}}`, `{{PAGE_URL}}`, `{{PAGE_DESC}}` (pattern tương tự `{{APK_VERSION}}`).
- **Effort:** M
- **Related:** Cluster B, ARCH-003, DOC-002.

### HIGH-05 (SMELL-002) — `<header>` + mobile menu của index chưa tách partial

- **Dimension:** Code Smell
- **Location:** [`src/index.src.html:70-163`](src/index.src.html#L70)
- **Evidence:** 94 dòng `<header>` + nav desktop + mobile menu inline. Footer đã là partial (pattern có sẵn) nhưng header chưa áp dụng.
- **Impact:** Thêm link nav (vd: Blog) phải sửa 4 file; dễ drift giữa landing nav (full) và legal nav (đơn giản).
- **Suggested Fix:** Tách `partials/header.html` cho landing, `partials/nav-legal.html` cho legal pages.
- **Effort:** S
- **Related:** Cluster B, HIGH-04.

### HIGH-06 (SMELL-007) — CSP `style-src` drift: index cho 'unsafe-inline', legal thì không

- **Dimension:** Code Smell (hệ quả của duplication)
- **Location:** [`src/index.src.html:6`](src/index.src.html#L6) vs `src/privacy.src.html:6`, `src/terms.src.html:6`, `src/community-standards.src.html:6`
- **Evidence:** index: `style-src 'self' 'unsafe-inline';`. 3 legal: `style-src 'self';`.
- **Impact:** Chính sách bảo mật không đồng nhất giữa các trang cùng site; nếu legal thêm style inline sẽ bị chặn; 'unsafe-inline' của index có thể đang bị quên (carousel.js set `.style.transform` qua JS, **không** cần 'unsafe-inline' cho element.style — chỉ cần cho `<style>` block).
- **Suggested Fix:** Kiểm tra kỹ index có thực sự cần 'unsafe-inline' không (nhiều khả năng không). Gộp CSP vào `partials/head-common.html`.
- **Effort:** S
- **Related:** Cluster B, HIGH-04, SEC-002.

### HIGH-07 (SMELL-004) — Magic numbers rải khắp carousel.js không có tên

- **Dimension:** Code Smell
- **Location:** [`assets/js/carousel.js:25-37`](assets/js/carousel.js#L25), [`assets/js/carousel.js:98`](assets/js/carousel.js#L98)
- **Evidence:** `VISIBLE_POSITIONS` hard-code scale/rotateY/translateX/opacity/zIndex (rotateY 55°, translateX 420px, opacity 0.4, …). `getPosition(domIndex)` giả định ngầm domIndex 0..4 ↔ (-2,-1,0,+1,+2). `shift = direction === 1 ? 1 : -1`.
- **Impact:** Tinh chỉnh visual (cover flow phẳng hơn) phải dò từng số; đổi `VISIBLE_COUNT` ≠ 5 sẽ vỡ mapping.
- **Suggested Fix:** Khai báo `VISIBLE_COUNT=5`, `HALF_VISIBLE=2`, `OFFSETS=[-2,-1,0,1,2]`, `POSITIONS[-2]={scale:.55,…}`. Tách `carousel.config.js` hoặc block config đầu file.
- **Effort:** M
- **Related:** Cluster C, SMELL-011, SIMPL-005.

### HIGH-08 (PERF-001) — Hero PNG fallback quá nặng (532KB desktop / 296KB mobile)

- **Dimension:** Performance
- **Location:** `assets/images/hero-banner-desktop.png`, `assets/images/hero-banner-mobile.png`
- **Evidence:** 532KB + 296KB PNG. WebP cùng cảnh chỉ 30KB + 17KB (17-18× nhẹ hơn).
- **Impact:** Nếu user trên browser không hỗ trợ WebP (hoặc WebP fail), tải 500KB cho 1 ảnh hero — LCP chậm, data cost trên 3G Việt Nam cao.
- **Suggested Fix:** Optimize PNG xuống <100KB (pngquant/oxipng), hoặc bỏ PNG (WebP hỗ trợ >96%) và thêm AVIF `<source type="image/avif">` trước WebP.
- **Effort:** S
- **Related:** Cluster G, PERF-002.

### HIGH-09 (PERF-002) — Hero không có srcset/sizes theo DPR/viewport

- **Dimension:** Performance
- **Location:** [`src/index.src.html:172-185`](src/index.src.html#L172), [`src/index.src.html:295-308`](src/index.src.html#L295)
- **Evidence:** `<source srcset="assets/images/hero-banner-mobile.webp" type="image/webp" />` — chỉ 1 URL, không 1x/2x/3x, không `sizes`. Intrinsic mobile 385×481, desktop 801×480 nhưng render full-width trên nhiều màn.
- **Impact:** Mobile DPR thấp vẫn tải ảnh như iPhone Pro Max; tablet tải ảnh mobile bị vỡ.
- **Suggested Fix:** srcset `360w, 720w, 1080w` + `sizes="(max-width: 1023px) 100vw, 50vw"`.
- **Effort:** M
- **Related:** Cluster G.

### HIGH-10 (PERF-003) — Carousel dùng setTimeout thay vì transitionend

- **Dimension:** Performance
- **Location:** [`assets/js/carousel.js:116-118`](assets/js/carousel.js#L116)
- **Evidence:** `setTimeout(() => { animating = false; }, ANIMATION_DURATION_MS);` với `ANIMATION_DURATION_MS = 600`.
- **Impact:** Tab background bị throttle → timer drift; click liên tiếp bị chặn mất khoảng. Reduced-motion user: CSS tắt transition nhưng code vẫn chờ 600ms.
- **Suggested Fix:** `phone.addEventListener('transitionend', onEnd, { once: true })` trên center item; fallback setTimeout dài hơn làm safety net.
- **Effort:** S
- **Related:** Cluster C, SMELL-005.

### HIGH-11 (PERF-004) — Carousel không listen resize

- **Dimension:** Performance
- **Location:** [`assets/js/carousel.js:61-67`](assets/js/carousel.js#L61), [`assets/js/carousel.js:69-84`](assets/js/carousel.js#L69)
- **Evidence:** `getSpreadScale()` đọc `window.innerWidth` mỗi lần `applyPositions`, nhưng `applyPositions` chỉ chạy lúc navigate/autoplay. Xoay thiết bị giữa 2 autoplay tick → phone-item lệch.
- **Impact:** Layout lệch khi xoay mobile; ảnh hưởng CLS cảm nhận.
- **Suggested Fix:** `window.addEventListener('resize', debouncedApply, { passive: true })` gọi `applyPositions(false)`, hoặc `ResizeObserver` trên container.
- **Effort:** S
- **Related:** Cluster C.

### HIGH-12 (TEST-001) — Hoàn toàn không có bài test tự động nào

- **Dimension:** Tests
- **Location:** [`package.json:6`](package.json#L6)
- **Evidence:** Không có script `test`, không devDep test runner, Glob `**/*.test.*`/`**/*.spec.*` → 0 kết quả.
- **Impact:** Mọi regression (carousel, menu, nav, CTA) chỉ phát hiện bằng mắt. Branch refactor hiện tại chạy không có lưới an toàn.
- **Suggested Fix:** Playwright: `npm i -D @playwright/test`, smoke test 4 scenario (page load, carousel auto-rotate, menu toggle, link check).
- **Effort:** M
- **Related:** Cluster D.

### HIGH-13 (TEST-002) — Carousel có logic phức tạp nhưng 0 test hành vi

- **Dimension:** Tests
- **Location:** [`assets/js/carousel.js:1`](assets/js/carousel.js)
- **Evidence:** 187 LOC với nhiều nhánh: auto-rotate, pause on hover, `prefers-reduced-motion`, `document.visibilityState`, pause/play button. 0 test.
- **Impact:** Task history `fix/a11y-deep` cho thấy carousel đã regress nhiều lần. Branch refactor hiện tại có risk cao.
- **Suggested Fix:** 5 Playwright scenario: auto-rotate interval, hover pause, button pause, `document.hidden` pause, reduced-motion disable.
- **Effort:** M
- **Related:** Cluster C, Cluster D.

### HIGH-14 (DOC-001 + DX-006) — README khẳng định sai "No build step"

- **Dimension:** Documentation / DX
- **Location:** [`README.md`](README.md)
- **Evidence:** README:16 "No build step — static files only"; README:20-24 "Open index.html in a browser, or serve with any static server". Thực tế `package.json` có `build:css` (Tailwind compile), `build:html` (`scripts/build-html.js`). HTML ở root là output; source là `src/*.src.html`.
- **Impact:** Contributor mới sẽ sửa HTML root và bị ghi đè khi build. Rào cản onboarding nghiêm trọng.
- **Suggested Fix:** Rewrite phần Local Development: prerequisites (Node >=18), `npm install`, `npm run dev`, `npm run build`, **cảnh báo** không sửa root `*.html`. Xóa câu "No build step".
- **Effort:** S
- **Related:** Cluster E.

### HIGH-15 (DOC-002) — Hệ thống partial `<!-- @include -->` + `{{APK_VERSION}}` không được document

- **Dimension:** Documentation
- **Location:** [`README.md`](README.md), [`scripts/build-html.js:1-54`](scripts/build-html.js)
- **Evidence:** `scripts/build-html.js` có regex `<!--\\s*@include\\s+(\\S+)\\s*-->` + `{{APK_VERSION}}` thay thế. `index.src.html:245, 1207` dùng `{{APK_VERSION}}`. README/AGENTS.md không nhắc một chữ nào.
- **Impact:** Không ai biết cách thêm partial, cập nhật APK version; cơ chế custom không phải chuẩn, không thể tự suy luận.
- **Suggested Fix:** Thêm section "Architecture" vào README: src/*.src.html → root *.html, `<!-- @include partials/xxx.html -->`, `{{APK_VERSION}}` từ `package.json.appVersion`.
- **Effort:** S
- **Related:** Cluster E, HIGH-14.

### HIGH-16 (DX-001) — Không có dev server với hot reload

- **Dimension:** DX
- **Location:** [`package.json:11`](package.json#L11)
- **Evidence:** `dev` chạy `build:html` 1 lần rồi `tailwindcss --watch`. Không có HTTP server, không live-reload; sửa partial/src HTML phải `npm run build:html` + Cmd+R thủ công.
- **Impact:** Vòng lặp sửa—xem chậm, dễ quên rebuild.
- **Suggested Fix:** `browser-sync` + `chokidar-cli` watch `src/**` + `partials/**` → auto-rebuild + auto-reload. Ví dụ: `"dev": "npm-run-all -p dev:css dev:html dev:serve"`.
- **Effort:** S
- **Related:** Cluster J.

### HIGH-17 (DX-002) — Không có script `serve`/`preview`

- **Dimension:** DX
- **Location:** [`package.json:6-11`](package.json#L6)
- **Evidence:** README nói `npx serve .` nhưng không có trong package.json. Dev mới vào dễ dùng file:// và gặp lỗi đường dẫn absolute `/assets/fonts/…`.
- **Suggested Fix:** `"serve": "npx serve ."`, `"preview": "npm run build && npm run serve"`.
- **Effort:** S
- **Related:** Cluster J.

### HIGH-18 (DX-003) — Không có linter/formatter

- **Dimension:** DX
- **Location:** [`package.json`](package.json)
- **Evidence:** devDeps chỉ có `tailwindcss`. Không có ESLint, Prettier, stylelint, htmlhint. `.editorconfig` chỉ set 2-space + LF.
- **Impact:** Style drift, thứ tự class Tailwind không nhất quán, review tốn thời gian format.
- **Suggested Fix:** Prettier + `prettier-plugin-tailwindcss` (tự sort class), htmlhint, stylelint. Scripts `format`, `lint`. Chạy trong CI.
- **Effort:** M
- **Related:** Cluster D.

### HIGH-19 (DX-004) — Không có CI/CD

- **Dimension:** DX
- **Location:** `.github/workflows/` (không tồn tại)
- **Evidence:** `ls .github` → No such file or directory.
- **Impact:** PR có thể merge với build:html fail; không validate output. Deploy thủ công → dễ quên rebuild.
- **Suggested Fix:** `.github/workflows/build.yml` chạy `npm ci && npm run build && git diff --exit-code` trên PR; có thể thêm Playwright + lychee + lhci sau.
- **Effort:** M
- **Related:** Cluster D.

### HIGH-20 (DX-005) — Không có pre-commit hook; build output dễ drift khỏi source

- **Dimension:** DX
- **Location:** [`package.json`](package.json)
- **Evidence:** Không có husky/lint-staged. Output `*.html` ở root commit cùng source `src/*.src.html` nhưng không có guard.
- **Impact:** Sửa src nhưng quên build → HTML stale; hoặc sửa root HTML → build lần sau ghi đè.
- **Suggested Fix:** husky + lint-staged pre-commit chạy `npm run build` và `git add *.html assets/css/styles.css`. Hoặc chỉ dựa vào CI `git diff --exit-code`.
- **Effort:** M
- **Related:** Cluster D, Cluster E.

### HIGH-21 (SMELL-008) — URL/email/version hard-code rải rác 4 file

- **Dimension:** Code Smell
- **Location:** [`src/index.src.html:24,27,42,222,245,1184,1207`](src/index.src.html) và footer
- **Evidence:** `https://cuoituandidau.vn` lặp **62 lần** toàn repo; `hello@cuoituandidau.vn` 6 lần; TestFlight `https://testflight.apple.com/join/abfrzXm7` 2 lần; GitHub APK URL 2 lần.
- **Impact:** Đổi domain → sửa 60+ chỗ. Đổi TestFlight code → dễ quên 1 nơi.
- **Suggested Fix:** Mở rộng `build-html.js` với `{{SITE_URL}}`, `{{SUPPORT_EMAIL}}`, `{{APP_STORE_URL}}`, `{{GOOGLE_PLAY_URL}}`, `{{TESTFLIGHT_URL}}` — đọc từ `src/config.json` (tách khỏi package.json metadata).
- **Effort:** M
- **Related:** Cluster H.

---

## Medium Priority Issues (44)

Grouped theo dimension + cluster. Mỗi cluster fix xong giải quyết đồng thời nhiều finding.

### Architecture (7 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| ARCH-003 | 3 trang legal trùng nav + head ~85 LOC mỗi trang | `src/privacy.src.html:1-84` + 2 file | M | B |
| ARCH-004 | 2 CSS file ở 2 pipeline khác nhau (src/input.css vs assets/css/carousel.css) | `src/input.css`, `assets/css/carousel.css` | S | F |
| ARCH-005 | Chỉ index load carousel.css; 3 legal thì không — inconsistent | `src/index.src.html:65-66` vs legal pages | S | F |
| ARCH-006 | Font `inter-latin-ext.woff2` declared nhưng không preload | `src/input.css:14-21` | S | F |
| ARCH-007 | Dead CSS: `.nav-link` không được dùng ở bất kỳ HTML nào | `src/input.css:39-56` | S | F |
| ARCH-008 | `assets/css/styles.css` commit ở root là output — lẫn source/build | `assets/css/styles.css` | S | F |
| ARCH-009 | 7 ảnh phone hard-coded inline, class Tailwind lặp 7 lần | `src/index.src.html:895-969` | M | (data-driven) |

### Code Smells (7 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| SMELL-005 | setTimeout 600ms cứng thay vì transitionend | `assets/js/carousel.js:116-118` | S | C |
| SMELL-006 | Coupling chặt giữa carousel.js và DOM IDs/classes (5+ selector cứng) | `assets/js/carousel.js:16-18,134-174` | M | C |
| SMELL-009 | App Store/Google Play CTA block copy-paste 2 lần trong index | `src/index.src.html:218-267, 1182-1229` | S | H |
| SMELL-010 | FAQ `<details>` lặp 5 lần với cùng chevron SVG | `src/index.src.html:1018-1153` | M | A (+ data-driven) |
| SMELL-011 | Breakpoint duplicate giữa carousel.css và carousel.js (640, 1024) | `assets/css/carousel.css:6-11` vs `assets/js/carousel.js:2-4` | M | C, F |

### Performance (7 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| PERF-005 | querySelectorAll gọi lặp mỗi applyPositions/goTo | `assets/js/carousel.js:70,95` | S | C |
| PERF-006 | Forced reflow cố ý mỗi 3s khi autoplay | `assets/js/carousel.js:110-114` | M | C |
| PERF-007 | Font latin-ext 85KB không preload | `src/input.css:14-21`, `src/index.src.html:62-63` | S | F |
| PERF-008 | 2 CSS render-blocking ở `<head>` (styles.css + carousel.css) | `src/index.src.html:65-66` | M | F |
| PERF-009 | 7 ảnh carousel đều `loading="lazy"` kể cả center | `src/index.src.html:899-968` | S | G |
| PERF-010 | Không `decoding="async"` trên bất kỳ `<img>` nào | `src/index.src.html` (all img) | S | G |
| PERF-011 | `scroll-behavior: smooth` global có thể làm INP dài trên Android Go | `src/input.css:35-37` | S | — |

### Security (1 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| SEC-001 | Thiếu HTTP security headers (X-Frame-Options, HSTS, Permissions-Policy, …) | `_headers`/`vercel.json` không tồn tại | S | I |

### Dependencies (1 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| DEP-001 | Tailwind 3.4.19 trễ 1 major (v4 stable) | `package.json:29` | M | (tech-debt) |

### Tests (6 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| TEST-003 | Menu mobile toggle không có test | `assets/js/menu.js` | S | D |
| TEST-004 | Không có CI/CD (dup DX-004) | `.github/workflows/` | S | D |
| TEST-005 | Không có a11y test mặc dù vừa làm deep a11y fix | `assets/js/carousel.js` | S | D |
| TEST-006 | Không có link checker → rủi ro 404 asset/anchor | `index.html` | S | D |
| TEST-007 | Không có HTML validation | `src/index.src.html` | S | D |
| TEST-008 | `build-html.js` không có test | `scripts/build-html.js` | S | D |

### Documentation (5 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| DOC-003 | README sai tech stack ("Tailwind via CDN", "Google Fonts") | `README.md:14-15` | S | E |
| DOC-004 | AGENTS.md ≡ CLAUDE.md (100% duplicate, GitNexus boilerplate) | `AGENTS.md`, `CLAUDE.md` | M | E |
| DOC-005 | Không có tài liệu deployment/release | `README.md` | M | E |
| DOC-006 | `build-html.js` thiếu JSDoc + README cho public API | `scripts/build-html.js` | S | E |
| DOC-007 | `carousel.js` thiếu file-level docblock + public contract | `assets/js/carousel.js` | S | E |

### Developer Experience (4 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| DX-006 | README lỗi thời (dup DOC-001) | `README.md:14-16` | S | E |
| DX-007 | Không có htmlhint/a11y check tự động | `package.json` | M | D |
| DX-008 | Nhầm lẫn `version` vs `appVersion` trong package.json | `package.json` | S | E |
| DX-009 | `.DS_Store` lọt vào repo ở 3 vị trí | `.DS_Store`, `src/.DS_Store`, `assets/.DS_Store` | S | J |

### Simplify (6 MEDIUM)

| ID | Title | Location | Effort | Cluster |
|---|---|---|---|---|
| SIMPL-003 | JS biến module global; phụ thuộc ngầm thứ tự `<script defer>` | `assets/js/carousel.js:16-22`, `menu.js:2-18` | S | C |
| SIMPL-004 | `throw` top-level làm crash bundle nếu dùng chung | `assets/js/carousel.js:16-17` | S | C |
| SIMPL-005 | `getSpreadScale` if-ladder — nên dùng lookup table | `assets/js/carousel.js:61-67` | S | C |
| SIMPL-006 | `reorderDOM` mutation qua NodeList reference — dễ vỡ | `assets/js/carousel.js:43-58` | M | C |
| SIMPL-007 | `goTo` làm 4 việc (34 LOC) — over-compressed | `assets/js/carousel.js:86-119` | M | C |
| SIMPL-009 | Footer vẫn inline SVG mail/facebook/linkedin | `partials/footer.html:61-83` | S | A |

---

## Low Priority Issues (48)

Format table (concise).

### Architecture (6 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| ARCH-010 | carousel.js `throw` cứng nếu không thấy #phone-carousel | `assets/js/carousel.js:16-17` | S | Early-return thay vì throw |
| ARCH-011 | Tailwind color token trộn nested object + flat kebab-case | `tailwind.config.js:14-30` | M | Chuyển hết về nested |
| ARCH-012 | carousel.js module global scope, không IIFE/export | `assets/js/carousel.js:16-187` | S | `<script type="module">` hoặc IIFE |
| ARCH-013 | Inline SVG star lặp 15 lần testimonial, chevron 5 lần FAQ | `src/index.src.html:650-828,1025-1145` | S | Dùng sprite (HIGH-02) |
| ARCH-014 | Hamburger SVG không có trong sprite spec | `src/index.src.html:124-138` | S | Thêm `icon-hamburger` |
| ARCH-015 | Không có `serve`/`preview` script (dup DX-002) | `package.json:6-12` | S | Thêm scripts |

### Code Smells (4 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| SMELL-012 | Global mutable state + top-level side effects carousel.js | `assets/js/carousel.js:20-22,129-131,160` | S | IIFE wrap |
| SMELL-013 | Vietnamese a11y string hardcoded | `assets/js/carousel.js:165` | S | data-attributes hoặc i18n sau này |
| SMELL-014 | `goTo` state machine ẩn, force-reflow trick không self-documenting | `assets/js/carousel.js:86-119` | S | Tách `FORCE_REFLOW` helper, early-return khi total<5 |
| SMELL-015 | Script include pattern lặp 4 file + thiếu JSON-LD ở index | `src/index.src.html:1236-1237` | S | `partials/scripts-common.html` + JSON-LD Organization |

### Security (14 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| SEC-002 | CSP `style-src` không đồng nhất (index có unsafe-inline) | `src/index.src.html:6` | M | Thống nhất CSP, kiểm tra có thực cần inline không |
| SEC-003 | CSP thiếu `form-action`, `frame-src`, `connect-src` explicit | 4 src HTML | S | Thêm defense-in-depth directives |
| SEC-004 | Link ngoài thiếu `rel="noreferrer"` (TestFlight, GitHub APK) | `src/index.src.html:222,245,1180` | S | Thêm rel hoặc set Referrer-Policy HTTP |
| SEC-005 | CSP meta tag không support frame-ancestors/reporting | 4 src HTML | S | Chuyển CSP sang HTTP response header |
| SEC-006 | Không có SRI cho self-hosted asset | `src/index.src.html:65-66,1236-1237` | M | Tự động gen sha384 trong build pipeline |
| SEC-007 | `{{APK_VERSION}}` không HTML-escape khi inject | `scripts/build-html.js:11,30` | S | Validate regex `^\d+\.\d+\.\d+(…)?$` hoặc escape |
| SEC-008 | JSON-LD inline script có thể bị CSP `script-src 'self'` chặn (tùy browser) | 3 legal src | S | Hash trong CSP hoặc chuyển sang `.jsonld` |
| SEC-009 | Inline SVG — note cho tương lai nếu nhận SVG user | `src/index.src.html`, `partials/icons.svg` | S | Thêm quy ước sanitize |
| SEC-010 | Không có CSP reporting (report-to) | 4 src HTML | M | Thêm report-uri khi chuyển sang HTTP header |
| SEC-011 | robots.txt/sitemap — note không phải bảo mật | `robots.txt`, `sitemap.xml` | — | Không cần thay đổi |
| SEC-012 | npm audit: 0 lỗ hổng — baseline tốt | `package.json` | — | Giữ + `npm audit` trong CI |
| SEC-013 | Không tracking script — không cần GDPR banner | (toàn repo) | — | Note khi thêm analytics |
| SEC-014 | .gitignore thiếu `*.pem`, `credentials.json`, `.npmrc`, `.vercel/` | `.gitignore` | S | Bổ sung ignore rules + cân nhắc gitleaks |
| SEC-015 | `build-html.js` đã check path traversal — tốt | `scripts/build-html.js:15-20` | — | Giữ nguyên |

### Performance (4 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| PERF-012 | SVG star inline 15 lần — ~4.5KB HTML dư (dup ARCH-013) | `src/index.src.html:649-829` | S | Dùng sprite (HIGH-02) |
| PERF-013 | Thiếu preconnect/dns-prefetch cho testflight.apple.com, github.com | `src/index.src.html:222,245,1184,1207` | S | `<link rel="dns-prefetch">` |
| PERF-014 | Không cache-busting filename, không service worker | toàn project | M | Hash filename trong build |
| PERF-015 | `will-change` áp dụng vĩnh viễn cho 7 phone-item | `assets/css/carousel.css:12-18` | S | Chỉ áp dụng cho 5 visible qua class |

### Dependencies (5 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| DEP-002 | Version caret `^` cho Tailwind (build có thể drift) | `package.json:29` | S | Pin exact `"3.4.19"` hoặc dùng `~` |
| DEP-003 | Thiếu `"private": true` — risk publish nhầm | `package.json:1` | S | Thêm `"private": true` |
| DEP-004 | Không có `prepare`/`postinstall` → build output dễ drift | `package.json:6-11` | S | Thêm `prepare` hoặc husky |
| DEP-005 | 73 transitive deps từ Tailwind 3 — supply-chain surface | `package-lock.json` | M | Cân nhắc Tailwind v4 (Oxide) hoặc standalone CLI |
| DEP-006 | Thiếu `packageManager` + engines.npm | `package.json:12-14` | S | Thêm `"packageManager": "npm@10.x.x"`, `.nvmrc` |

### Tests (2 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| TEST-009 | Không có visual regression test | `src/input.css` | M | Playwright toHaveScreenshot cho desktop + mobile |
| TEST-010 | Không có performance budget | `package.json:7` | M | Lighthouse CI `budget.json` |

### Documentation (3 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| DOC-008 | Không có CONTRIBUTING.md | `README.md` | S | Tạo CONTRIBUTING.md (conventional commits, branch) |
| DOC-009 | Không có tài liệu env vars | `README.md` | S | Ghi rõ "no env vars" hoặc tạo `.env.example` |
| DOC-010 | `.gitignore` ignore CLAUDE.md nhưng file đã track — stale rule | `.gitignore` | S | Xóa dòng hoặc `git rm --cached` |

### DX (3 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| DX-010 | Tailwind caret-pinned + bản v3 cũ | `package.json` | S | Pin exact hoặc migrate v4 |
| DX-011 | CLAUDE.md ≡ AGENTS.md (dup DOC-004) | `CLAUDE.md` | S | Symlink hoặc prepend `> See AGENTS.md` |
| DX-012 | Thiếu CONTRIBUTING.md (dup DOC-008) | `CONTRIBUTING.md` | S | Tạo file |

### Simplify (7 LOW)

| ID | Title | Location | Effort | Fix |
|---|---|---|---|---|
| SIMPL-008 | Transition string inline dài + cubic-bezier lặp | `assets/js/carousel.js:76` | S | `const EASE = '…'`; tốt hơn chuyển vào CSS class |
| SIMPL-010 | Pause/play state chia 3 nơi (HTML + CSS + JS dataset) | `src/index.src.html:994-996`, `assets/css/carousel.css:24-26` | S | 1 SVG + toggle `<use href>` hoặc `aria-pressed` |
| SIMPL-011 | `shift = direction === 1 ? 1 : -1` redundant | `assets/js/carousel.js:98` | S | Dùng thẳng `direction` |
| SIMPL-012 | `fromIdx` clamp Math.max/min + `totalPositions` alias thừa | `assets/js/carousel.js:101` | S | helper `clamp()` + xóa alias |
| SIMPL-013 | `startAutoPlay`/`resetAutoPlay` double-clearInterval | `assets/js/carousel.js:147-159` | S | resetAutoPlay alias startAutoPlay |
| SIMPL-014 | Footer class string lặp 5-7 lần | `partials/footer.html:44,47,50,60,69,77,98` | S | `@layer components` `.footer-link` |
| SIMPL-015 | menu.js xử lý luôn copyright-year — sai responsibility | `assets/js/menu.js:17-19` | S | Đổi tên thành `layout.js` hoặc tách file |

---

## Refactoring Roadmap

Dựa trên cluster + effort + dependency thứ tự, đề xuất 4 phase. Mỗi phase là một PR hoặc feature branch ngắn.

### Phase 1 — Foundation hygiene (do ngay, ~1 ngày)

Mục tiêu: chặn drift đang hình thành, chuẩn hóa nền tảng cho Phase 2-3.

- **Cluster A — Icon sprite + SVG duplication** (HIGH-02, HIGH-03, SIMPL-009, ARCH-013/14, PERF-012): include `partials/icons.svg`, thay tất cả inline SVG bằng `<use>`, thêm `icon-hamburger`, fix drift Google Play. **Effort: M.**
- **Cluster G — Hero image** (HIGH-08, HIGH-09): optimize PNG fallback hoặc bỏ; thêm srcset/sizes; bỏ `loading="lazy"` cho carousel center; thêm `decoding="async"`. **Effort: M.**
- **Cluster F quick wins** (ARCH-007 dead `.nav-link`, ARCH-006 font latin-ext preload-or-remove, PERF-015 will-change only-visible, PERF-011 scroll-behavior reduced-motion guard). **Effort: S.**
- **Cluster J quick wins** (HIGH-17 `npm run serve`/`preview`, DX-009 xóa `.DS_Store` khỏi repo + fix `.gitignore` pattern `**/.DS_Store`). **Effort: S.**
- **Security quick wins** (SEC-014 bổ sung .gitignore, SEC-004 thêm `rel="noreferrer"` link external, SEC-007 validate APK_VERSION regex). **Effort: S.**

### Phase 2 — Documentation & DX foundation (1 ngày)

Mục tiêu: có lưới an toàn và docs đúng trước khi đụng carousel.

- **Cluster E — Documentation rewrite** (HIGH-14, HIGH-15, DOC-003/4/5/6/7, DX-008/11/12, DOC-010): rewrite README (prerequisites, npm scripts, project structure, partial syntax, {{APK_VERSION}}, deployment). Tạo ARCHITECTURE.md, CONTRIBUTING.md. Rewrite AGENTS.md, sym/stub CLAUDE.md. **Effort: M.**
- **Cluster D foundation** (HIGH-18 Prettier+tailwind-plugin, HIGH-19 GitHub Actions build workflow, HIGH-20 husky+lint-staged pre-commit `npm run build && git add`). **Effort: M.**
- **Cluster J completion** (HIGH-16 browser-sync + chokidar dev server). **Effort: S.**

### Phase 3 — Partial-hóa và source-of-truth config (2-3 ngày)

Mục tiêu: chấm dứt shotgun surgery khi đổi nav/URL/email/version.

- **Cluster B — Header/nav partials** (HIGH-01, HIGH-04, HIGH-05, HIGH-06, SMELL-009/10/15, ARCH-003): tách 8-10 partial (`header.html`, `hero.html`, `features.html`, `how-it-works.html`, `testimonials.html`, `carousel.html`, `faq.html`, `cta-download.html`, `head-common.html`, `nav-legal.html`, `download-buttons.html`, `scripts-common.html`). Rút `src/index.src.html` còn ~80 LOC. **Effort: L.**
- **Cluster H — Config source-of-truth** (HIGH-21): mở rộng build-html.js hỗ trợ `{{SITE_URL}}`, `{{SUPPORT_EMAIL}}`, `{{APP_STORE_URL}}`, `{{GOOGLE_PLAY_URL}}`, `{{TESTFLIGHT_URL}}`, `{{PAGE_TITLE/URL/DESC}}`. Tạo `src/config.json`. **Effort: M.**
- **Cluster F remainder** (ARCH-004 gộp carousel.css vào input.css `@layer components`, ARCH-005 thống nhất CSS loading, ARCH-008 quyết định commit-build policy, PERF-008 inline critical CSS). **Effort: M.**
- **Cluster I — Security headers HTTP** (SEC-001, SEC-003, SEC-005, SEC-010): thêm `_headers`/`vercel.json` với full security header set; chuyển CSP sang HTTP response (enable frame-ancestors + report-to). **Effort: S.**

### Phase 4 — Carousel refactor + test coverage (3-4 ngày)

Mục tiêu: rewrite carousel.js thành module có test + sửa hết hot-path perf.

- **Cluster C — Carousel refactor** (HIGH-07, HIGH-10, HIGH-11, + 22 findings MEDIUM/LOW từ SMELL/PERF/SIMPL/ARCH): rewrite thành `function initCarousel(root, config)` pattern; tách `carousel.config.js`; chuyển transition từ JS inline sang CSS class; thay setTimeout → transitionend; thêm ResizeObserver; tách `goTo` thành 4 hàm; bỏ `throw` top-level thành early-return; chuyển sang `<script type="module">`; thống nhất breakpoint qua CSS custom properties. **Effort: L-XL.**
- **Cluster D completion** (HIGH-12, HIGH-13, TEST-003 đến TEST-010): Playwright smoke + carousel scenario (5 case); axe-core a11y check; htmlhint + html-validate; lychee link check; Lighthouse CI budget. **Effort: M-L.**
- **Dep chore** (DEP-002 pin Tailwind exact, DEP-003 `private: true`, DEP-006 packageManager/.nvmrc). **Effort: S.**

### Phase 5 (opportunistic) — Tailwind v4 + niceties

- **DEP-001** Tailwind 3 → 4 migration (config-in-CSS, Oxide engine). **Effort: M** (breaking change, schedule riêng).
- **SIMPL niceties** (SIMPL-005/7/8/10/11/12/13/14/15): code golf + helpful abstractions sau khi rewrite carousel.
- **TEST-009/10** Visual regression + Lighthouse budget.

---

## Dependency Audit Summary

| Package | Type | Declared | Installed | Latest | Status | Risk |
|---|---|---|---|---|---|---|
| tailwindcss | devDependency | ^3.4.19 | 3.4.19 | 4.2.2 | 1 major behind | MEDIUM (tech-debt) |

- **npm audit:** 0 vulnerabilities (all severity)
- **Lockfile:** `package-lock.json` present (1018 lines)
- **Transitive deps:** 73 (all from tailwindcss)
- **Unused deps:** None detected
- **Dev/Prod mismatch:** None — tailwindcss correctly devDep (build-time only)
- **Private flag:** ❌ missing (DEP-003 — risk publish nhầm)
- **packageManager:** ❌ missing (DEP-006)

## Statistics

- **Total files scanned:** ~20 source files (4 src/*.src.html, 2 partials, 2 JS, 2 CSS, 1 build script, config files, docs)
- **Total LOC scanned (source):** ~2.4k (source HTML 2156 + JS 206 + CSS 82 + build 54)
- **Total issues found:** **113**
  - Critical: **0**
  - High: **21**
  - Medium: **44**
  - Low: **48**
- **Estimated refactoring effort:**
  - Phase 1: ~1 day (quick wins)
  - Phase 2: ~1 day (docs + DX foundation)
  - Phase 3: ~2-3 days (partial-hóa + config SoT)
  - Phase 4: ~3-4 days (carousel + tests)
  - **Total ~7-9 day-person** để hoàn thành Phase 1-4.
- **Most problematic files (by findings referenced):**
  1. `assets/js/carousel.js` — **25 findings** (Cluster C dominant)
  2. `src/index.src.html` — **~20 findings** (size + SVG duplication + CTA copy-paste)
  3. `README.md` — **5 findings** (Cluster E)
  4. `package.json` — **~8 findings** (Cluster D + Cluster J + Cluster E)
  5. `partials/icons.svg` — **2 findings HIGH** (unused + drift)
- **Files with 0 findings (clean):** `robots.txt`, `sitemap.xml`, `tailwind.config.js` (minor naming only), `.editorconfig`.

---

## Notes

- Branch hiện tại `refactor/split-js-css-carousel` đã làm được phần split CSS riêng (`carousel.css`) và split JS (`menu.js` + `carousel.js`) — **khớp hướng với Phase 1/F** của report này. Khuyến nghị tiếp tục nhưng **gộp `carousel.css` vào `src/input.css` dưới `@layer components`** (ARCH-004) thay vì giữ ở `assets/css/` raw, để có 1 CSS pipeline thống nhất.
- Cluster C (carousel refactor) nên chờ Phase 4 khi đã có Playwright test — refactor carousel không có test là rủi ro cao (đã có history `fix/carousel-size-bug/`).
- `partials/icons.svg` là "công cụ đúng, chưa dùng" — Phase 1 Cluster A là quick win lớn nhất.
- Security baseline của dự án tốt hơn nhiều dự án cùng quy mô (0 vuln, 0 tracking, CSP đã bật). Cluster I chỉ là defense-in-depth hardening — không urgent.
