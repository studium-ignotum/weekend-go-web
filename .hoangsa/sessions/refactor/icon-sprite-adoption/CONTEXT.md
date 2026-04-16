# Context: Icon Sprite Adoption (Cluster A refactor)

## Task Type
refactor

## Language
vi (giao tiếp) / vi (specs)

## Spec Language
vi

## Tech Stack
HTML5, CSS (Tailwind 3.4.19 + custom), Vanilla JS (ES5/6), custom `scripts/build-html.js` partial system (Node ≥18)

## User Input
Pick từ AUDIT-REPORT.md — Phase 1, Cluster A: "Icon sprite + fix SVG drift". Bao gồm các finding: HIGH-02 (ARCH-002), HIGH-03 (SIMPL-002), ARCH-013, ARCH-014, SMELL-003, PERF-012, SIMPL-001, SIMPL-009.

## Discussion Log

### [Q1] Task type xác nhận là refactor?
- Options: refactor / chore
- Chosen: **refactor**
- Reason: Thay đổi structural — include sprite + `<use>` references thay cho inline SVG — nhưng visual output phải giống hệt. Đây đúng nghĩa refactor (không đổi behavior).

### [Q2] Scope: một PR hay nhiều PR?
- Options: Một PR full / Chia 3 PR theo nhóm / Incremental 1 icon/PR
- Chosen: **Một PR full**
- Reason: Cluster này về bản chất là một thay đổi đơn (adopt sprite). Chia PR sẽ tạo trạng thái trung gian khó hiểu ("nửa dùng sprite, nửa inline"). Review một lượt dễ hơn.

### [Q3] Hamburger icon (hiện inline, chưa có trong sprite) xử lý sao?
- Options: Thêm vào sprite / Để inline
- Chosen: **Thêm vào sprite**
- Reason: ARCH-014 đã flag hamburger là hole trong sprite spec. Thêm nó hoàn thiện sprite 100% và đảm bảo nhất quán cho future pages.

### [Q4] Verify invariant (visual parity) bằng cách nào?
- Options: Playwright visual diff 4 viewports × 4 pages / Manual visual review / DOM diff
- Chosen: **Playwright visual diff 4 viewports × 4 trang (16 snapshot)**
- Reason: Refactor icon = rủi ro cao về pixel shift (viewBox khác, size class mismatch, fill/stroke attribute). Pixel-diff là cách duy nhất catch được regression nhỏ. Đồng thời task này là phase đầu của việc adopt Playwright trong repo (HIGH-12) — setup infrastructure có giá trị lâu dài.

## Decisions Made

| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Include `partials/icons.svg` ngay sau `<body>` trong 4 `src/*.src.html` qua `<!-- @include partials/icons.svg -->` | Dùng cơ chế partial có sẵn (build-html.js line 13). Sprite inline duy nhất 1 lần/trang, `<use>` tham chiếu hoạt động local (không cross-document) | LOCKED |
| 2 | Thay tất cả inline SVG hiện có bằng `<svg aria-hidden="true" class="..."><use href="#icon-..."/></svg>` | Chuẩn SVG2, hỗ trợ mọi trình duyệt > IE11 (IE11 đã end-of-life). `aria-hidden` duy trì a11y hiện tại | LOCKED |
| 3 | Thêm `<symbol id="icon-hamburger">` vào `partials/icons.svg` | Hoàn thiện sprite, đóng ARCH-014 | LOCKED |
| 4 | Chọn path SVG Google Play từ `partials/icons.svg:13` làm chuẩn (xóa drift ở `src/index.src.html:255`) | Sprite là source-of-truth sau refactor; path trong sprite là bản gốc trước khi drift | LOCKED |
| 5 | **Giữ tên `icon-carousel-prev`** và dùng chung cho nav-back ở legal pages (path `M15 19l-7-7 7-7` giống hệt) | Tránh rename 2 lần, giữ scope tối thiểu. Note trong DESIGN-SPEC rằng naming có thể improve trong task follow-up | FLEXIBLE |
| 6 | **Không** inline critical SVG (e.g., hero logo ngoài sprite) — chỉ migrate icon có trong `partials/icons.svg` | Tránh mở rộng scope; logo/illustration lớn không phải icon | LOCKED |
| 7 | Visual verification = Playwright (`@playwright/test` + `toHaveScreenshot`) trên 4 trang × 4 viewport = 16 snapshot | Setup Playwright infrastructure đồng thời (đóng 1 phần HIGH-12) | LOCKED |
| 8 | Baseline snapshot sẽ chụp TRƯỚC khi refactor (branch main) và commit vào `tests/visual/__snapshots__/` để diff | Có pre-change baseline để diff — không thể "test sau khi đã đổi" | LOCKED |
| 9 | CSS class hiện tại trên mỗi inline `<svg>` (e.g., `w-5 h-5 text-primary fill-current`) phải **giữ nguyên** trên `<svg>` wrapper sau migration; chỉ nội dung `<path>` bị thay bằng `<use>` | Class quyết định size + color; đổi class = đổi visual | LOCKED |
| 10 | Rollback plan: revert toàn bộ PR trong 1 commit | Task là 1 PR, rollback đơn giản — xem TEST-SPEC | LOCKED |

## Out of Scope

- **Rename sprite symbols** (ví dụ `icon-carousel-prev` → `icon-chevron-left`): để lại cho refactor sau.
- **FAQ data-driven** (SMELL-010 nói tách FAQ thành `src/data/faq.json`): scope riêng; task này chỉ thay chevron SVG, giữ nguyên 5 `<details>` hardcoded.
- **App Store/Google Play CTA partial hóa** (SMELL-009): scope của Cluster B/H, không thuộc task này.
- **Footer refactor tổng thể** (SIMPL-014 class repetition): chỉ thay SVG inline trong footer, không đụng `<a>` class structure.
- **Thêm Playwright test cho carousel/menu behavior** (TEST-002, TEST-003): task này CHỈ setup visual diff infrastructure + 16 snapshot; behavior tests nằm ở Phase 4.
- **Content Security Policy changes** (SEC-002 `unsafe-inline`): không đụng; sprite inject SVG một lần qua build, không ảnh hưởng CSP.
- **Thêm icon mới chưa có trong sprite** (ngoài hamburger): nếu phát hiện inline SVG không khớp symbol nào → note trong DESIGN-SPEC, xử lý trong task sau.

## Branch Plan

- Current: `refactor/split-js-css-carousel`
- Target: `refactor/icon-sprite-adoption` (task branch từ `main`)
- Session files (`.hoangsa/sessions/refactor/icon-sprite-adoption/`) đã tạo ở current branch — sẽ carry sang khi checkout.
- Git context handling: dời sang `/hoangsa:prepare` hoặc `/hoangsa:cook` khi bắt đầu implement (không checkout branch trong menu phase).
