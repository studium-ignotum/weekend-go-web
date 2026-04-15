# Audit Report — weekend-go-web

**Project:** Cuối Tuần Đi Đâu? (landing page)
**Date:** 2026-04-09
**Scope:** Full audit, Deep scan
**Stack:** HTML + TailwindCSS (CDN + compiled) + Vanilla JS

---

## Critical & High Priority

| ID | Severity | Effort | Issue |
|---|---|---|---|
| ARCH-002 | HIGH | S | Logo trỏ đến `index2.html` không tồn tại → 404 |
| SEC-001 | HIGH | S | "Google Play" button thực ra là link tải APK từ GitHub |
| SEC-002 | HIGH | S | APK version hardcoded `v1.0.17` — không tự update |
| SMELL-001 | HIGH | S | index.html dùng Tailwind CDN, các trang khác dùng compiled CSS |
| PERF-001 | HIGH | S | Tailwind CDN ~343 KB vs compiled CSS 15 KB |
| SMELL-002 | HIGH | S | Màu primary 3 giá trị khác nhau (#34C759 vs #22c55e vs #16a34a) |
| DX-001 | HIGH | S | Không có build/dev script trong package.json |
| SMELL-003 | HIGH | S | SVG ngôi sao copy-paste 15 lần |
| ARCH-001 | HIGH | M | index.html 729 dòng — JS carousel nên tách ra file riêng |

## Medium Priority

| ID | Severity | Effort | Issue |
|---|---|---|---|
| SEC-003 | MEDIUM | S | Tailwind CDN không có SRI hash |
| SEC-004 | MEDIUM | S | Thiếu security headers (CSP, X-Frame-Options) |
| PERF-004 | MEDIUM | S | Carousel images thiếu width/height → layout shift |
| PERF-005 | MEDIUM | S | Carousel images không có loading="lazy" |
| ARCH-003 | MEDIUM | S | Ảnh carousel nằm ở root thay vì assets/images/ |
| ARCH-004 | MEDIUM | S | File PNG gốc ~8 MB ở root — không được dùng (đã có WebP) |
| ARCH-005 | MEDIUM | S | assets/images/screenshots/ (~8.5 MB) không được dùng |
| SMELL-004 | MEDIUM | S | Màu hardcoded `bg-[#15803d]` thay vì dùng token |
| SMELL-005 | MEDIUM | S | Inline transition string lặp 4 lần |
| SMELL-006 | MEDIUM | S | Magic numbers trong JS (50, 500, 3000) |
| DX-002 | MEDIUM | S | Không có linting/prettier config |
| DX-003 | MEDIUM | S | Color tokens trùng giá trị (bg-warm = bg-secondary) |
| PERF-006 | MEDIUM | S | OG image vẫn dùng PNG 531 KB |
| DEP-001 | MEDIUM | L | Tailwind v3 — cân nhắc migration v4 |

## Low Priority

| ID | Severity | Effort | Issue |
|---|---|---|---|
| SEC-005 | LOW | S | Social links href="#" — placeholder |
| SEC-006 | LOW | S | "App Store" link là TestFlight beta |
| ARCH-006 | LOW | S | Thư mục testimonials/ rỗng |
| ARCH-007 | LOW | S | src/input.css có custom CSS nhưng không có build script |
| SMELL-007 | LOW | M | Header/footer duplicate giữa 3 trang legal |
| SMELL-008 | LOW | S | package.json main: "tailwind.config.js" vô nghĩa |
| DEP-002 | LOW | S | Thiếu field "engines" trong package.json |
| PERF-003 | LOW | S | app-icon.png (1 MB) không được dùng |
| PERF-007 | LOW | M | Google Fonts external dependency |

---

## Quick Wins (làm trong 1 buổi)

1. **ARCH-002**: Đổi `href="index2.html"` → `href="/"` 
2. **SEC-001 + SEC-002**: Đổi label "Google Play" → "Tải APK", dùng `/releases/latest/download/`
3. **SMELL-001 + PERF-001 + SEC-003**: Chuyển index.html sang compiled CSS, xóa CDN script
4. **SMELL-002**: Đồng bộ primary color → `#34C759` ở cả 3 nơi
5. **PERF-004 + PERF-005**: Thêm width/height + loading="lazy" cho carousel images
6. **ARCH-003**: Move webp files → assets/images/
7. **ARCH-004 + ARCH-005 + PERF-003**: Xóa PNG gốc, screenshots/, app-icon.png không dùng
8. **DX-001**: Thêm build/dev scripts vào package.json
9. **SMELL-006**: Extract magic numbers thành constants

---

## Stats

- Findings: 27 total
- Critical/High: 9
- Medium: 14  
- Low: 9
- Quick wins (Effort S): 22/27
