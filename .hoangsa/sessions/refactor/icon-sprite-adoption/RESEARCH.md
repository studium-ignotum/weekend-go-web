# Research: Icon Sprite Adoption

## 1. Codebase inventory

### 1.1 Sprite file

[`partials/icons.svg`](partials/icons.svg) — 38 LOC, 10 `<symbol>` definitions, container `<svg style="display:none" aria-hidden="true">`:

| Symbol ID | viewBox | Has fill? | Has stroke? | Notes |
|---|---|---|---|---|
| `icon-star` | `0 0 20 20` | inherited | no | Single path, solid |
| `icon-faq-chevron` | `0 0 24 24` | `none` (attr) | `currentColor` | Requires stroke from wrapper |
| `icon-app-store` | `0 0 24 24` | inherited | no | Single path |
| `icon-google-play` | `0 0 24 24` | inherited | no | Single path — **canonical** |
| `icon-mail-fill` | `0 0 20 20` | inherited | no | 2 paths (envelope open) |
| `icon-facebook` | `0 0 24 24` | inherited | no | Single path |
| `icon-linkedin` | `0 0 24 24` | inherited | no | Single path |
| `icon-carousel-prev` | `0 0 24 24` | `none` (attr) | `currentColor` | Chevron left — path `M15 19l-7-7 7-7` |
| `icon-carousel-next` | `0 0 24 24` | `none` (attr) | `currentColor` | Chevron right |
| `icon-carousel-pause` | `0 0 24 24` | inherited | no | 2 rects as path |
| `icon-carousel-play` | `0 0 24 24` | inherited | no | Triangle |

**Grep trên toàn bộ `*.html` + `*.src.html`**: `<use` → 0 match → sprite CHƯA được include ở bất kỳ đâu. Xác nhận finding HIGH-02/SIMPL-001.

### 1.2 Inline SVG usage count (exact match via path signature)

| Icon | index.src.html | privacy | terms | community | footer.html | sprite |
|---|---:|---:|---:|---:|---:|---:|
| star | **15** | 0 | 0 | 0 | 0 | 1 |
| faq-chevron | **5** | 0 | 0 | 0 | 0 | 1 |
| app-store | **2** | 0 | 0 | 0 | 0 | 1 |
| google-play | 2 ⚠️ | 0 | 0 | 0 | 0 | 1 |
| mail-fill | 0 | 0 | 0 | 0 | **1** | 1 |
| facebook | 0 | 0 | 0 | 0 | **1** | 1 |
| linkedin | 0 | 0 | 0 | 0 | **1** | 1 |
| carousel-prev (= chevron-left, dùng cho nav-back legal) | 1 | **1** | **1** | **1** | 0 | 1 |
| carousel-next | 1 | 0 | 0 | 0 | 0 | 1 |
| carousel-pause | 1 | 0 | 0 | 0 | 0 | 1 |
| carousel-play | 1 | 0 | 0 | 0 | 0 | 1 |
| hamburger | 1 | 0 | 0 | 0 | 0 | ❌ **chưa có trong sprite** |

**Tổng inline SVG cần migrate: 36 (index) + 3 (legal nav-back) + 3 (footer) = 42 inline `<svg>` elements.**
Grep `<svg` trả tổng số `<svg>` mỗi file khớp con số này (index: 36, privacy/terms/community: 1 mỗi file, footer: 3).

### 1.3 Drift đã xác nhận — Google Play path

- **Sprite** [`partials/icons.svg:13`](partials/icons.svg#L13):
  ```
  M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.298 12l2.4-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z
  ```
- **Inline** [`src/index.src.html:255`](src/index.src.html#L255) (cả 2 lần xuất hiện ở line 255 + line 1217-ish, giống nhau):
  ```
  M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.533 1.467a1 1 0 010 1.733l-2.197 1.272-2.543-2.543 2.207-1.929zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z
  ```

**Diff ở 2 segment:**
1. `zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.298 12l2.4-2.491` (sprite)
   vs. `zm3.199-1.4l2.533 1.467a1 1 0 010 1.733l-2.197 1.272-2.543-2.543 2.207-1.929` (inline)
2. `L16.802 8.99` (sprite) vs. `L16.8 8.99` (inline — lost precision `.002`)

**Hệ quả visual:** "right play-button wedge" của icon Google Play khác hình — kích thước + hướng tam giác phụ hơi lệch. Sau migration, phải **chấp nhận visual change nhỏ này** (sprite version là canonical) — snapshot baseline sẽ detect, và cần **approve intentional change** trong TEST-SPEC.

### 1.4 Hamburger icon (CHƯA có trong sprite)

Location: [`src/index.src.html:124-138`](src/index.src.html#L124)
```html
<button id="menu-toggle" class="md:hidden p-2" aria-label="Menu">
  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
</button>
```

Cần thêm `<symbol id="icon-hamburger" viewBox="0 0 24 24">` vào `partials/icons.svg`:
```xml
<symbol id="icon-hamburger" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentColor" fill="none" d="M4 6h16M4 12h16M4 18h16"/>
</symbol>
```

Lưu ý: `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke="currentColor"`, `fill="none"` phải nằm trong `<symbol>` hoặc `<path>` (không thể để trên wrapper `<svg>` vì `<use>` không forward attribute xuống paths trong symbol). Tham khảo pattern `icon-carousel-prev` đã có sẵn trong sprite (line 26).

### 1.5 Build system context

[`scripts/build-html.js`](scripts/build-html.js) (54 LOC):
- Regex include: `<!--\s*@include\s+(\S+)\s*-->` (line 13)
- Placeholder: `{{APK_VERSION}}` (line 30)
- Path-traversal check: `abs.startsWith(ROOT + path.sep)` (line 17) — an toàn khi include icons.svg
- **Idempotent:** chạy lại trên output không re-include (sprite chỉ inline 1 lần/trang vì marker chỉ ở source)
- Include đọc raw file — SVG `<defs>` inline nguyên văn

Partial `partials/footer.html` đã được include thành công bằng cơ chế này (đã verified trong các build gần đây). Thêm `<!-- @include partials/icons.svg -->` vào 4 src files là cùng pattern.

## 2. Visual regression constraints

### 2.1 Attribute preservation rules

Khi chuyển từ inline `<svg><path d="..."/></svg>` sang `<svg><use href="#icon-..."/></svg>`, **các attribute sau phải ở lại trên wrapper `<svg>`** (không chuyển vào `<use>`):

- `class` — giữ nguyên (điều khiển size + color qua Tailwind)
- `aria-hidden` / `aria-label` / `role` — a11y
- `fill="currentColor"` — nếu symbol inherit fill từ currentColor (vd: icon-app-store, icon-google-play, icon-facebook, icon-linkedin, icon-mail-fill — KHÔNG áp dụng cho các stroke-based icons)

**Các attribute cần LOẠI BỎ khỏi wrapper** (vì đã nằm trong `<symbol>`):
- `viewBox` — `<use>` kế thừa từ symbol (có thể giữ nếu muốn explicit — không hại)
- `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `fill="none"` — đã định nghĩa trong symbol

### 2.2 Size class pattern (Tailwind)

Inline SVG hiện có các size class phổ biến:
- `w-4 h-4` (16px) — footer icons, nav-back
- `w-5 h-5` (20px) — testimonial stars, FAQ chevron
- `w-6 h-6` (24px) — hamburger, carousel prev/next
- `w-6 h-6 md:w-7 md:h-7` — carousel pause/play

Kết hợp với color class: `text-primary`, `text-yellow-400` (stars), `text-white`, `fill-current`, etc. **Không đổi class** = không đổi size/color = không đổi visual (trừ GP drift case 1.3).

### 2.3 Browser support

`<use href="#id">` (SVG2 form) hỗ trợ:
- Chrome 49+, Firefox 51+, Safari 10+, Edge 79+
- Dự án target: mobile Vietnam (Android 8+, iOS 13+) — 100% cover
- IE11 **không** hỗ trợ — nhưng IE11 đã end-of-life và CSP `default-src 'self'` đã loại IE11 ra rồi

Không cần `xlink:href` fallback (đã deprecated).

## 3. Related findings từ AUDIT-REPORT

| Finding | Severity | Location | Status trong task này |
|---|---|---|---|
| ARCH-002 (HIGH) | Sprite không include ở đâu | `partials/icons.svg:1-38` | ✅ Closed by this task |
| ARCH-013 (LOW) | Star × 15 lặp testimonial | `src/index.src.html:650-828` | ✅ Closed |
| ARCH-014 (LOW) | Hamburger không có trong sprite | `src/index.src.html:124-138` | ✅ Closed (thêm symbol) |
| SMELL-003 (HIGH) | Star × 15 lặp | `src/index.src.html:650-828` | ✅ Closed |
| PERF-012 (LOW) | ~4.5KB HTML dư thừa | `src/index.src.html:649-829` | ✅ Closed |
| SIMPL-001 (HIGH) | Sprite unused | `partials/icons.svg` | ✅ Closed |
| SIMPL-002 (HIGH) | GP icon drift | `src/index.src.html:255` vs `partials/icons.svg:13` | ✅ Closed (standardize về sprite) |
| SIMPL-009 (MEDIUM) | Footer inline SVG | `partials/footer.html:61-83` | ✅ Closed |

## 4. Estimated HTML payload reduction

- `index.src.html` hiện 1239 LOC / ~54 KB source. Inline SVG (path d="…") chiếm ước tính 4.5-5 KB.
- Sau refactor: mỗi `<svg><use href="#icon-..."/></svg>` ≈ 55 bytes × 36 elements = ~2 KB. Sprite bonus ≈ 2 KB inject 1 lần.
- **Net giảm ≈ 2.5 KB HTML source / trang index; ≈ 0.3 KB / trang legal.**
- **Sau gzip (typical 70% compression ratio):** ≈ 0.7-1 KB real wire savings. Nhỏ nhưng tích lũy; giá trị chính là **maintenance** (sửa 1 nơi).

## 5. Research không exhaustive — assumption documented

- **Giả định symbol `icon-app-store` path trùng với inline path tại `src/index.src.html:232 & 1194`** — chưa xác minh bằng diff từng ký tự. Nếu cũng drift: phát hiện trong implementation step, standardize về sprite, log trong Plan deviation.
- **Giả định footer SVG 3 icon (mail/facebook/linkedin) khớp sprite** — xác minh tương tự khi implement.
- Nếu phát hiện thêm drift: áp dụng quy tắc như Google Play (sprite là canonical, accept intentional visual change, update snapshot).
