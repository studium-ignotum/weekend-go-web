# Audit Report — weekend-go-web

**Project:** Cuối Tuần Đi Đâu — Landing page (`weekend-go-web`)
**Date:** 2026-05-24
**Target:** `weekend-go-web` (source files only — generated `*.html` and `assets/css/styles.css` excluded)
**Scope:** Custom — Clean code & Refactor focus (Architecture, Code Smells, Simplify & Maintainability)
**Depth:** Deep (read code, traced DOM/JS contracts, cross-referenced, grep-validated)
**Tech Stack:** HTML + Tailwind CSS v3 + vanilla JavaScript (CommonJS), build via `scripts/build-html.js`

---

## Executive Summary

Codebase nhỏ, gọn và nhìn chung **lành mạnh** — 8 file JS nguồn (~1.000 dòng), 4 trang HTML nguồn, pipeline build có template. **Không có lỗ hổng bảo mật đang hoạt động, không có lỗi đang gây crash** (severity cao nhất là HIGH). Tuy nhiên có 3 nhóm nợ kỹ thuật xuyên suốt đáng xử lý trước khi codebase lớn thêm:

1. **Trùng lặp do hệ thống build chưa được tận dụng** — `build-html.js` đã hỗ trợ `@include` partial và placeholder `{{APK_VERSION}}`, nhưng nav + `<head>` của 3 trang legal vẫn copy-paste nguyên khối, và phần "khung điện thoại" trong carousel bị lặp lại **8 lần** (~520–640 dòng). URL App Store / APK / GA ID cũng hardcode ở nhiều nơi → rủi ro link chết khi bump version.

2. **Tính nhất quán JS** — `app-links.js` và `menu.js` là bare script (không IIFE, không guard DOM-ready) trong khi các file còn lại đều bọc IIFE; tạo rò rỉ global và phụ thuộc thứ tự load ngầm. Compliance ~62%.

3. **Render bằng chuỗi `innerHTML`** trong `planner.js` và `hero-map.js` — nội suy dữ liệu trực tiếp vào HTML string (XSS-adjacent nếu dữ liệu sau này đến từ API) và nhúng class Tailwind trong JS (lệ thuộc `tailwind.config.js content`).

Ngoài ra còn một lượng nhỏ **dead code** (nhánh JS/CSS trỏ tới element không tồn tại), **magic values** rải rác, và **file tạm** ở repo root. File nặng nhất: `src/index.src.html` (1.992 dòng) và `assets/js/planner.js`.

> **Lưu ý quan trọng:** Mọi finding đều trỏ về **file nguồn** (`src/*.src.html`, `assets/js/*.js`, `assets/css/{carousel,notes,polaroid}.css`, `src/input.css`). Các file `index.html`/`terms.html`/`privacy.html`/`community-standards.html` ở root và `assets/css/styles.css` là **sản phẩm build** — sửa ở nguồn rồi chạy `npm run build`.

### Health Score

| Dimension | Score | Issues |
|-----------|-------|--------|
| Architecture & Structure | 🔴 | 7 (3 high) |
| ↳ Bloated Files | 🔴 | 2 high (monolith + carousel dup) |
| ↳ Dead Code | 🟡 | 3 medium |
| ↳ Overengineering | 🟢 | 0 (xu hướng ngược lại) |
| Code Quality (Smells) | 🟡 | 9 |
| ↳ Magic Values | 🟡 | nhiều (gộp M4) |
| Simplify Scan | 🟡 | 8 |
| ↳ Standards Compliance | 🟡 | 62% compliant |
| ↳ Clarity | 🟡 | MEDIUM |
| ↳ Balance | 🟡 | 2 file over-complex, 1 over-simplified |
| Maintainability | 🟡 | URL/ID/magic duplication |

🔴 = có issue high · 🟡 = chủ yếu medium · 🟢 = low/none

---

## Critical & High Priority Issues

> Không có finding CRITICAL. 7 finding HIGH dưới đây gây ma sát lớn nhất khi bảo trì/mở rộng.

### H1: Nav + `<head>` của 3 trang legal copy-paste thay vì dùng partial
- **Severity:** HIGH · **Dimension:** Architecture / Duplication
- **Location:** `src/terms.src.html:64-92`, `src/privacy.src.html:64-92`, `src/community-standards.src.html:64-92` (nav + head boilerplate)
- **Evidence:** `diff` khối nav (dòng 64–92) giữa `terms` và `privacy` cho thấy **giống hệt nhau**, chỉ khác dòng "Cập nhật lần cuối" (là nội dung, không phải nav). Khối `<head>` (~63 dòng: GA script, CSP, font preload, favicon) cũng gần như y hệt — chỉ khác title/description/canonical/OG. Footer thì đã đúng (`@include partials/footer.html`).
- **Impact:** Thêm 1 link nav, đổi GA ID, hay đổi font preload phải sửa **3 file**. Hệ thống build đã có sẵn cơ chế `@include` → đây là cơ hội bị bỏ lỡ.
- **Suggested Fix:**
  1. Tách `partials/nav-legal.html` và thay 3 khối nav bằng `<!-- @include partials/nav-legal.html -->`.
  2. Tách `partials/head-legal.html` với placeholder `{{PAGE_TITLE}}`, `{{PAGE_DESCRIPTION}}`, `{{CANONICAL_URL}}`; mở rộng `build-html.js` để thay biến theo từng file (xem H7 — cùng một cải tiến).
- **Effort:** M
- **Related:** H7 (placeholder system), H3

### H2: Khung điện thoại trong carousel copy-paste 8 lần (~520–640 dòng)
- **Severity:** HIGH · **Dimension:** Architecture / Duplication
- **Location:** `src/index.src.html:837-1404` (8 `<article class="phone-slide">`)
- **Evidence:** Mỗi slide chứa 5 `<span aria-hidden>` (side-rail nút) + các `<div>` gradient device-chrome **giống hệt nhau từng ký tự**; chỉ `<picture>/<img>` và `data-*` khác. Đã có drift: slide 1 dùng `loading="eager" fetchpriority="high"`, slide 2–8 dùng `loading="lazy"` — phần chrome còn lại y hệt nên drift khó phát hiện.
- **Impact:** Đổi bo góc / màu / ring của khung phải sửa 8 chỗ; thêm slide thứ 9 = copy ~65 dòng. Đây là nguyên nhân chính khiến `index.src.html` phình to.
- **Suggested Fix:** Tách `partials/phone-slide.html` (hoặc macro trong `build-html.js`) nhận data per-slide, hoặc render slide từ một mảng JS như `planner.js` đã làm với venue card. Giảm ~520 dòng còn ~30.
- **Effort:** L
- **Related:** H3

### H3: `src/index.src.html` là monolith 1.992 dòng, không tách section
- **Severity:** HIGH · **Dimension:** Architecture / Bloated File
- **Location:** `src/index.src.html` (toàn file)
- **Evidence:** `wc -l` = 1992. 10 section (header, hero, problem, planner, feature-grid, carousel, how-it-works, testimonials, FAQ, download CTA) nằm phẳng trong 1 file.
- **Impact:** Không ai giữ nổi cả file trong đầu; merge conflict thường xuyên; tìm 1 section phải cuộn hàng trăm dòng.
- **Suggested Fix:** Tách dần ít nhất các section lớn ra `partials/sections/{planner,carousel,features}.html`, dùng `@include`. Làm tăng dần từng section một (kết hợp H2).
- **Effort:** L
- **Related:** H1, H2

### H4: `app-links.js` & `menu.js` là bare script — rò rỉ global + phụ thuộc thứ tự load ngầm
- **Severity:** HIGH · **Dimension:** Simplify / Consistency
- **Location:** `assets/js/app-links.js:1,13`, `assets/js/menu.js:1-18` (so với `ga.js` global `gtag`)
- **Evidence:** `app-links.js` khai báo `const APP_LINKS` ở top-level và gọi `document.querySelectorAll('a[data-app-link]')` ngay khi parse; `menu.js:2` `const menuToggle = document.getElementById('mobile-menu-btn')` không guard. Trong khi `micro.js`, `planner.js`, `hero-map.js`, `carousel.js` đều `(function(){…})()` + `readyState`, `sticky.js` dùng `DOMContentLoaded`. Compliance matrix: 5/8 file theo pattern chuẩn, 3 file lệch (`app-links`, `menu`, `ga`).
- **Impact:** Hoạt động được **chỉ nhờ** thuộc tính `defer`. Nếu bỏ `defer` hoặc thêm bước bundle/concat, global (`APP_LINKS`, `trackEvent`) bị bleed và href app-link âm thầm giữ giá trị fallback. Sự bất nhất cũng gây bối rối "project dùng pattern nào".
- **Suggested Fix:** Bọc `app-links.js` và `menu.js` trong IIFE + guard `document.readyState === 'loading'` (giống `planner.js`). `ga.js` giữ `gtag` global là cố ý (hợp đồng API của GA) nhưng nên thêm JSDoc ghi rõ và `/* global gtag */` ở nơi gọi.
- **Effort:** S
- **Related:** —

### H5: Render bằng chuỗi `innerHTML` nội suy dữ liệu + class Tailwind trong JS
- **Severity:** HIGH · **Dimension:** Code Smell / Simplify (XSS-adjacent + Tailwind coupling)
- **Location:** `assets/js/hero-map.js:53` (`pinHTML`), `assets/js/planner.js:337-365` (`renderPlanner`)
- **Evidence:** `pinHTML()` nội suy `${v.name}`, `${v.addr}`, `${v.img}` thẳng vào `innerHTML`; `renderPlanner()` nội suy `${v.name}`, `${v.district}`, `${v.tip}`, và nhánh `<a href="${v.url}">`. Cả hai nhúng arbitrary-value Tailwind class (vd `text-[#34C759]/40`) bên trong chuỗi JS.
- **Impact:** (1) Hiện an toàn vì data hardcode, nhưng nếu venue data sau này đến từ API → **stored XSS**; `href="${v.url}"` có thể bị `javascript:` nếu không validate. (2) Class Tailwind chôn trong JS string chỉ được build nếu `assets/js/` nằm trong `tailwind.config.js content` — đúng MEMORY "Tailwind content paths gotcha", rất dễ vỡ thầm lặng.
- **Suggested Fix:** Thay `innerHTML` bằng dựng DOM (`createElement` + `textContent` + `setAttribute`) trong `buildVenueCard(v)` / `buildPin(v)`. Loại bỏ XSS surface và phụ thuộc Tailwind-scan. Validate `v.url.startsWith('https://')` trước khi gán.
- **Effort:** M
- **Related:** M9 (planner data)

### H6: `planner.js` truy vấn lại DOM mỗi lần tương tác; hợp đồng ID rải rác
- **Severity:** HIGH · **Dimension:** Code Smell / Performance-of-interaction
- **Location:** `assets/js/planner.js:13,39,340` (`applyMobileView`, `handleSubmit`, `renderPlanner`)
- **Evidence:** ~12 lời gọi `getElementById` rải khắp 6 hàm; `planner-loading` và `planner-results-content` bị query 2 lần; mỗi click filter chạy tới ~13 `getElementById`. 12 ID (`planner-panel-filters`, `planner-results`, `planner-empty`, `planner-fallback`, `planner-count`, …) tồn tại cả ở JS lẫn HTML mà không có chỗ duy nhất để rename/audit; sai chính tả ở 1 phía sẽ fail âm thầm (đã có null-guard nên degrade lặng lẽ, không cảnh báo).
- **Impact:** Lặp công vô ích mỗi tương tác; hợp đồng DOM mong manh, khó refactor an toàn.
- **Suggested Fix:** Gom toàn bộ truy vấn vào một `queryDOM()` chạy 1 lần trong `boot()`, trả object `els` rồi closure lại. Thêm `console.warn` khi thiếu element trong dev. Ghi chú khối "DOM contract" ở đầu `planner.js`.
- **Effort:** S
- **Related:** M5

### H7: URL App Store / APK / GA ID hardcode & trùng lặp giữa HTML và JS (rủi ro link chết)
- **Severity:** HIGH · **Dimension:** Maintainability / Magic Strings
- **Location:** `src/index.src.html:225,238,1886,1902` (iOS + APK href ×2), `assets/js/app-links.js:2-3` (source of truth), `src/index.src.html:7` + 3 trang legal `:7` (GA `G-5BJB8F6W1D`)
- **Evidence:** `grep "v1.0.3"` → 3 lần trong `src/` + `app-links.js`. URL iOS xuất hiện ở `index.src.html` (×2) và `app-links.js`. GA ID xuất hiện ở 4 file src + `ga.js`. `build-html.js` đã inject `{{APK_VERSION}}` từ `package.json` nhưng chỉ cho version trong path, không cho full URL.
- **Impact:** Bump APK/iOS version hoặc xoay GA property phải sửa nhiều chỗ; bỏ sót 1 chỗ → link tải chết hoặc analytics sai trong production. `app-links.js` chỉ override href khi JS bật → fallback HTML phải đúng.
- **Suggested Fix:** Đưa `gaId`, `iosUrl`, `androidApkUrl` vào `package.json` (cạnh `appVersion`); thêm placeholder `{{GA_ID}}`, `{{IOS_URL}}`, `{{ANDROID_URL}}` và thay trong `build-html.js`. `app-links.js` đọc cùng nguồn (hoặc inline qua `<script type="application/json">`).
- **Effort:** M
- **Related:** H1 (cùng nâng cấp build placeholder)

---

## Medium Priority Issues

### M1: Dead code — `micro.js` chạy nhánh hero-rotate & count-up trỏ tới element không tồn tại
- **Severity:** MEDIUM · **Location:** `assets/js/micro.js:37-62` (count-up), `:65-93` (rotate)
- **Evidence (validated):** `grep "hero-rotate-suggestion"` và `grep "data-count-target"` trong `src/` + `partials/` → **0 match**. Code có null-guard nên không crash nhưng chạy check thừa mỗi lần load.
- **Impact:** ~30 dòng logic chết; gây nhầm tưởng feature còn sống.
- **Fix:** Xoá 2 nhánh (sau khi xác nhận không khôi phục); nếu còn dự định, ghi chú element HTML cần có. **Effort:** S

### M2: Dead CSS — `.venue-card.is-hidden` và `[data-group='city']` không bao giờ được dùng
- **Severity:** MEDIUM · **Location:** `src/input.css:95` (`.is-hidden`), `src/input.css:70` (`[data-group='city']`)
- **Evidence (validated):** `grep "is-hidden"` ngoài CSS → 0 (planner xoá card bằng `innerHTML=''`, không toggle class). `grep "data-group"` trong HTML chỉ có `age`/`vibe`/`weather`, **không có `city`** → rule city là chết; `!important` còn làm tăng specificity vô ích.
- **Fix:** Xoá cả 2 block khỏi `src/input.css`. **Effort:** S

### M3: `skip-link` được dùng trong HTML nhưng không có CSS định nghĩa (accessibility hỏng)
- **Severity:** MEDIUM · **Location:** `src/index.src.html:80`
- **Evidence (validated):** `<a href="#main" class="skip-link">` nhưng `grep "skip-link"` trong mọi CSS nguồn → chỉ thấy ở HTML; class không tồn tại (cũng không phải class Tailwind nên không có trong `styles.css`). 3 trang legal lại dùng đúng pattern `sr-only focus:not-sr-only …` inline.
- **Impact:** Skip-link hiện không ẩn/không hoạt động đúng; bất nhất với trang legal.
- **Fix:** Thay `class="skip-link"` bằng đúng chuỗi Tailwind các trang legal đang dùng (`sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded`). **Effort:** S

### M4: Magic values rải rác, không có module hằng số
- **Severity:** MEDIUM · **Location:** `micro.js:47,91,92` (1400/250/5000ms), `sticky.js:18` (400px), `carousel.js:103` (swipe 40px), `:113` (4500ms), `planner.js:8` (`max-width:1023px`), `hero-map.js:54` (pin 78/30px), `:98` (SVG 600×440)
- **Evidence:** Duration/threshold/breakpoint/kích thước SVG là literal trần; `prefers-reduced-motion` query 2 lần với tên khác nhau (`reduceMotion` vs `reducedMotion`). Breakpoint `1023px` ngầm "mirror" Tailwind `lg` (1024px) không có nguồn chung.
- **Impact:** Chỉnh "cảm giác" animation/scroll phải truy lùng số; breakpoint dễ lệch khỏi `tailwind.config.js`.
- **Fix:** Đặt hằng số có tên ở đầu mỗi module (`ROTATE_INTERVAL_MS`, `STICKY_SCROLL_THRESHOLD`, `SWIPE_THRESHOLD_PX`, `SVG_W/SVG_H`, `PIN_SIZES`); cân nhắc `assets/js/constants.js` dùng chung, ghi chú breakpoint mirror Tailwind `lg`. **Effort:** M

### M5: `onGroupChange` — tham số `value` chết + if-chain nên là Set
- **Severity:** MEDIUM · **Location:** `assets/js/planner.js:62` (def), `:79` (call `onGroupChange(group, value)`)
- **Evidence:** Hàm nhận `group` nhưng caller truyền 2 đối số; `value` bị bỏ thầm lặng. Thân hàm: `if (group === 'age' || group === 'vibe' || group === 'weather') renderPlanner()`.
- **Fix:** Bỏ `value` ở call-site; thay if-chain bằng `const LIVE_GROUPS = new Set(['age','vibe','weather']); if (LIVE_GROUPS.has(group)) renderPlanner();` (nguồn chân lý duy nhất cho group hợp lệ). **Effort:** S

### M6: `carousel.js` — `autoOn = false` lặp 9 lần + `&&` dùng làm control-flow
- **Severity:** MEDIUM · **Location:** `assets/js/carousel.js:42-44,…` (9 chỗ)
- **Evidence:** Pattern `autoOn = false; go(…)` lặp 9 lần qua 5 handler; `prevBtn && prevBtn.addEventListener(...)` (×4) dùng short-circuit như câu lệnh.
- **Fix:** Tách `function navigateTo(i){ autoOn = false; go(i); }` dùng cho cả 9 chỗ; đổi `btn && btn.addEventListener(...)` thành `if (btn) btn.addEventListener(...)`. **Effort:** S

### M7: Khởi tạo Lucide — guard bất nhất + inline `<script>` retry trong HTML
- **Severity:** MEDIUM · **Location:** `src/index.src.html:1974-1990` (inline retry), `planner.js:51` (guard yếu `if (window.lucide)`), `planner.js:371` (guard đủ)
- **Evidence:** Inline `(function initLucide(){ … if(++tries<20) setTimeout(go,150); })()` (magic 20/150 không ghi chú). `planner.js:51` chỉ kiểm `window.lucide` còn `:371` kiểm cả `typeof …createIcons === 'function'` → nếu CDN trả object lỗi, dòng 51 ném `TypeError` cuối spinner.
- **Fix:** Chuyển `initLucide` ra `assets/js/icons.js` (defer, sau CDN tag); tạo helper `callLucide()` kiểm đầy đủ dùng cho mọi call-site. **Effort:** S

### M8: `baseline-capture.js` hardcode đường dẫn tuyệt đối của máy cá nhân
- **Severity:** MEDIUM · **Location:** `scripts/baseline-capture.js:7`
- **Evidence:** `const OUT_DIR = '/Users/thuylenguyenmai/Desktop/01_Work/Unknown Studio/Cutadida/.hoangsa/sessions/.../baseline'` — committed vào repo, không gitignore.
- **Impact:** Thành viên khác / CI không chạy được nếu không sửa tay.
- **Fix:** `const OUT_DIR = process.env.BASELINE_OUT_DIR || path.join(__dirname, '../test-results/baseline')` (`test-results/` đã gitignore). **Effort:** S

### M9: `PLANNER_VENUES` — mảng dữ liệu 200 dòng hardcode trong code
- **Severity:** MEDIUM · **Location:** `assets/js/planner.js:106-307`
- **Evidence:** 10 object venue (tên, quận, URL ảnh CDN, rating, tags, tip tiếng Việt) — content chứ không phải logic — nằm trong module JS.
- **Impact:** Thêm/sửa venue phải đổi code & redeploy; phình payload JS.
- **Fix:** Tách ra `data/planner-venues.json` (fetch khi init — chấp nhận được vì là widget demo) hoặc inline qua build vào `<script type="application/json" id="planner-data">`. **Effort:** M
- **Related:** H5

### M10: Tổ chức CSS bất nhất — component CSS tách file tuỳ tiện vs gộp trong `input.css`
- **Severity:** MEDIUM · **Location:** `assets/css/{carousel,polaroid,notes}.css` vs `src/input.css`
- **Evidence:** carousel/polaroid/notes tách riêng, nhưng style component khác (FAQ accordion, hero-map pin, planner toggle, scroll progress, sticky) lại trộn trong `input.css`. Không đoán được nên tìm/thêm style section ở đâu.
- **Fix:** Hoặc gộp tất cả component CSS vào `input.css` thành các `@layer components` có nhãn (đơn giản nhất cho site cỡ này), hoặc tách nốt thành `faq.css`/`hero-map.css`/`planner.css`; ghi convention ở đầu `input.css`. **Effort:** M

---

## Low Priority Issues

| ID | Title | Location | Effort | Suggested Fix |
|----|-------|----------|--------|---------------|
| L1 | `setInterval` không lưu handle → không thể `clearInterval` | `carousel.js:113`, `hero-map.js:112`, `micro.js:84` | S | Lưu `const t = setInterval(...)`; tear down qua IntersectionObserver khi off-screen (hoặc ghi chú fire-and-forget có chủ ý) |
| L2 | Đánh số section trong comment bị nhảy (thiếu 5 và 9) | `src/index.src.html:83…1707` | S | Đánh số lại 1–10 theo nội dung thực |
| L3 | File tạm/stray ở repo root | `_faq-shot.js`, `_c.png`, `_dark.png`, `_flat.png`, `_light.png`, `hero-options-demo.html`, `docs/legacy/…` | S | Xoá file tạm; thêm `.vercelignore` / xác nhận `vercel.json` loại trừ `docs/legacy/` |
| L4 | Dùng `==` (loose) trong khi ESLint bật `eqeqeq` | `carousel.js:101` (`touchStartX == null`) | S | Đổi `=== null` |
| L5 | Inline `style` thay vì class | `src/index.src.html:820,830` (font Caveat), `partials/footer.html:5` (multi-gradient bg) | S | Thêm `fontFamily.caveat` vào `tailwind.config.js` → `class="font-caveat"`; tách `.footer-bg` vào `@layer components` |
| L6 | Modular arithmetic một dòng khó hiểu | `carousel.js:37` (`((i%total)+total)%total`) | S | Thêm comment hoặc tách `const wrap=(i,n)=>((i%n)+n)%n` |
| L7 | `VENUES`/`FIXED.spots` ghép theo index mong manh | `hero-map.js:40-49` (`targetIndex:4`) | S | Tính `targetIndex` động qua `findIndex(p=>p.id==='vietopia')`, hoặc inline x/y vào từng venue |
| L8 | `prefers-reduced-motion` query 2 lần, tên khác nhau, không reactive | `micro.js:5`, `carousel.js:111` | S | Hằng số dùng chung là `MediaQueryList` + `addEventListener('change')` (gộp M4) |
| L9 | Side-effect `createIcons()` sau mỗi submit không ghi chú | `planner.js:51,71` | S | Thêm comment "re-run vì renderPlanner inject `<i data-lucide>` mới" |

---

## Refactoring Roadmap

### Phase 1 — Quick wins (S, làm ngay, ít rủi ro)
Gom thành 1 PR "cleanup":
- **M1** xoá nhánh dead trong `micro.js` · **M2** xoá dead CSS · **M3** sửa `skip-link` (a11y) · **L3** xoá file tạm root · **L4** `==`→`===` · **L2** đánh số lại section
- **H4** bọc IIFE/guard cho `app-links.js` & `menu.js` · **H6** cache DOM refs trong `planner.js` · **M5** `onGroupChange` (bỏ arg chết + Set) · **M6** `carousel.js` `navigateTo()` + bỏ `&&`-control-flow · **M8** bỏ absolute path trong `baseline-capture.js`

### Phase 2 — Build system & magic values (next sprint)
- **H7 + H1** nâng `build-html.js`: placeholder `{{GA_ID}}/{{IOS_URL}}/{{ANDROID_URL}}` + per-file vars, tách `partials/nav-legal.html` & `partials/head-legal.html` (một cải tiến giải quyết cả 2)
- **M4 + L8** module `constants.js` cho magic durations/thresholds/breakpoints/SVG dims
- **M7** đưa Lucide init ra `assets/js/icons.js` + helper `callLucide()`

### Phase 3 — Structural (planned, L)
- **H2** tách `partials/phone-slide.html` (hoặc render từ data) → bỏ 8× duplication
- **H3** tách section lớn của `index.src.html` thành `partials/sections/*` (làm tăng dần)
- **H5 + M9** chuyển `planner`/`hero-map` render sang DOM-building + tách `PLANNER_VENUES` ra data file (loại XSS surface + Tailwind-in-JS coupling)
- **M10** thống nhất tổ chức CSS

### Phase 4 — Opportunistic (khi đụng vào code lân cận)
- **L1** lưu handle `setInterval` + teardown · **L5** inline style → class · **L6** comment modular wrap · **L7** `hero-map` index coupling · **L9** comment side-effect

---

## Statistics

- **Source files scanned:** ~20 (8 JS + 2 build scripts + 4 src HTML + 4 CSS + 2 partials). Generated `*.html` & `assets/css/styles.css` excluded.
- **Total issues (sau dedup):** 26
  - Critical: 0
  - High: 7
  - Medium: 10
  - Low: 9
- **Standards compliance (JS):** ~62% (5/8 file theo pattern IIFE+DOM-ready)
- **Estimated effort:** Phase 1 ≈ S×11 (~1 ngày) · Phase 2 ≈ M×3 · Phase 3 ≈ L×3 + M×1 · Phase 4 ≈ S×5
- **Most problematic files:**
  1. `src/index.src.html` — monolith, carousel ×8, skip-link, URL hardcode, inline scripts, section numbering
  2. `assets/js/planner.js` — DOM re-query, innerHTML, data array, onGroupChange
  3. `assets/js/hero-map.js` — innerHTML, magic values, index coupling
  4. `assets/js/carousel.js` — autoOn ×9, `&&`-control-flow, magic, interval handle
  5. `src/{terms,privacy,community-standards}.src.html` — nav/head duplication

---

*Generated by `/hoangsa:audit` (clean code & refactor scope, deep). Mọi finding đã grep-validate; severity theo rubric CRITICAL/HIGH/MEDIUM/LOW. Sửa ở file nguồn rồi `npm run build`.*
