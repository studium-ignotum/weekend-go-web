---
spec_version: "1.0"
project: "weekend-go-web"
component: "audit_quick_wins"
language: "HTML, CSS, JavaScript"
task_type: "fix"
category: "code"
status: "draft"
---

## Overview
[fix]: Fix 22 quick wins từ audit report

### Goal
Sửa tất cả issues Effort S từ audit — broken links, performance, security, code quality, DX.

### Requirements
- [REQ-01] Logo link phải trỏ đến "/" thay vì "index2.html" (ARCH-002)
- [REQ-02] Chuyển index.html từ Tailwind CDN sang compiled CSS (SMELL-001, PERF-001, SEC-003)
- [REQ-03] Đồng bộ primary color = #34C759 ở tailwind.config.js và src/input.css (SMELL-002)
- [REQ-04] APK link: label "Tải APK" + dùng /releases/latest/download/ (SEC-001, SEC-002)
- [REQ-05] Thêm build/dev scripts vào package.json (DX-001)
- [REQ-06] Carousel images: thêm width/height + loading="lazy" (PERF-004, PERF-005)
- [REQ-07] Di chuyển webp carousel images vào assets/images/ (ARCH-003)
- [REQ-08] Xóa dead assets: PNG gốc ở root, screenshots/, app-icon.png (ARCH-004, ARCH-005, PERF-003)
- [REQ-09] Đổi bg-[#15803d] thành bg-primary-dark (SMELL-004)
- [REQ-10] Extract magic numbers trong JS thành constants (SMELL-006)
- [REQ-11] Tạo CSS class .phone-transition thay vì inline styles (SMELL-005)
- [REQ-12] Xóa color tokens trùng trong tailwind.config.js (DX-003)
- [REQ-13] Thêm .editorconfig (DX-002)
- [REQ-14] Xóa "main" field trong package.json (SMELL-008)
- [REQ-15] TestFlight link label rõ "Tải beta (TestFlight)" (SEC-006)
- [REQ-16] Social links: ẩn hoặc điền URL thực (SEC-005)
- [REQ-17] Xóa thư mục testimonials/ rỗng (ARCH-006)
- [REQ-18] OG image đổi sang .webp (PERF-006)

### Out of Scope
- Tailwind v4 migration
- SSG cho header/footer sharing
- SVG star optimization (SMELL-003) — cần refactor lớn hơn
- Security headers (SEC-004) — cần biết deploy platform

---

## Implementations

### Design Decisions
| # | Decision | Reasoning | Type |
|---|----------|-----------|------|
| 1 | Primary = #34C759, dark = #15803D | iOS system green, đã dùng trên index.html | LOCKED |
| 2 | Compile CSS trước, rồi sửa index.html | Đảm bảo compiled CSS có đủ classes mới | LOCKED |
| 3 | Dùng /releases/latest/download/ cho APK | GitHub auto-redirect về latest release | LOCKED |

### Affected Files
| File | Action | Description |
|------|--------|-------------|
| `index.html` | MODIFY | Logo link, CDN→CSS, carousel attrs, APK links, colors, JS constants |
| `tailwind.config.js` | MODIFY | Primary color #34C759, xóa duplicate tokens |
| `src/input.css` | MODIFY | Đồng bộ color, thêm .phone-transition class |
| `package.json` | MODIFY | Build scripts, xóa "main" |
| `.editorconfig` | CREATE | Editor config chuẩn |
| `newfeed.png` | DELETE | Dead asset (đã có .webp) |
| `user-profile.png` | DELETE | Dead asset |
| `venue-detail.png` | DELETE | Dead asset |
| `comment-black.png` | DELETE | Dead asset |
| `assets/images/app-icon.png` | DELETE | Không dùng |
| `assets/images/screenshots/` | DELETE | Toàn bộ thư mục không dùng |
| `assets/images/testimonials/` | DELETE | Thư mục rỗng |

---

## Acceptance Criteria

### Per-Requirement
| Req | Verification | Expected |
|-----|-------------|----------|
| REQ-01 | Grep "index2.html" index.html | 0 matches |
| REQ-02 | Grep "cdn.tailwindcss" index.html | 0 matches |
| REQ-03 | Grep "#22c55e" tailwind.config.js | 0 matches |
| REQ-05 | cat package.json \| grep "build" | Script exists |
| REQ-07 | ls assets/images/*.webp | 3 carousel webp files |
| REQ-08 | ls *.png (root) | 0 PNG files |
| REQ-10 | Grep "setInterval(goNext, 3000)" index.html | 0 matches (should use constant) |
