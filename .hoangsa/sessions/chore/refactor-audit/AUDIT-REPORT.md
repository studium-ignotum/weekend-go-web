# Audit Report

**Project:** weekend-go-web
**Date:** 2026-04-12
**Target:** Toàn bộ project
**Scope:** Quick scan (Architecture, Security, Code Quality, Simplify)
**Depth:** Deep
**Tech Stack:** HTML, CSS (Tailwind compiled), Vanilla JavaScript

---

## Executive Summary

Project là một landing page tĩnh (~1500 dòng HTML, 1 file CSS compiled, JS inline). Codebase nhỏ gọn, không có vấn đề bảo mật nghiêm trọng. Các vấn đề chính tập trung vào: (1) file HTML quá lớn — toàn bộ markup + JS nằm trong 1 file, (2) code trùng lặp nhiều (SVG icons, CTA buttons, FAQ items), (3) một số magic values trong JS, và (4) thiếu accessibility features.

### Health Score

| Dimension | Score | Issues |
|-----------|-------|--------|
| Architecture & Structure | 🟡 | 4 findings |
| Security | 🟢 | 1 finding |
| Code Quality | 🟡 | 5 findings |
| Simplify Scan | 🟡 | 4 findings |

---

## Critical & High Priority Issues

_(Không có issue CRITICAL)_

### ARCH-001: God File — toàn bộ project trong 1 file HTML

- **Severity:** HIGH
- **Location:** `index.html` (1507 dòng)
- **Evidence:** HTML markup (985 dòng) + inline `<style>` (19 dòng) + inline `<script>` (155 dòng) — tất cả trong 1 file
- **Impact:** Khó maintain, khó tìm code, khó phân chia công việc khi team lớn hơn
- **Suggested Fix:** Tách JS carousel ra file riêng `assets/js/carousel.js`, tách custom CSS ra `assets/css/custom.css`. Giữ HTML markup trong `index.html`.
- **Effort:** S

### ARCH-002: SVG icons inline — trùng lặp nhiều lần

- **Severity:** HIGH
- **Location:** `index.html` — SVG xuất hiện ~30 lần
- **Evidence:**
  - Apple logo SVG: lặp 2 lần (line 234, 1206)
  - Google Play SVG: lặp 2 lần (line 257, 1229)
  - FAQ chevron SVG: lặp 5 lần (line 1044, 1076, 1100, 1130, 1156)
  - Feature icons SVG: 6 lần giống cấu trúc
- **Impact:** Tăng kích thước file, khó thay đổi icon khi cần update
- **Suggested Fix:**
  1. Tạo SVG sprite file `assets/images/icons.svg` với `<symbol>` cho mỗi icon
  2. Dùng `<use href="assets/images/icons.svg#icon-name">` thay thế
  3. Hoặc dùng CSS class + `background-image` cho icons đơn giản
- **Effort:** M

### QUAL-001: CTA Buttons — code trùng lặp hoàn toàn

- **Severity:** HIGH
- **Location:** `index.html:230-276` và `index.html:1201-1248`
- **Evidence:** 2 block CTA buttons (App Store + Google Play) gần như giống hệt nhau, chỉ khác màu background
- **Impact:** Sửa link/text phải sửa 2 chỗ, dễ quên 1 chỗ
- **Suggested Fix:** Nếu không dùng framework, chấp nhận duplicate nhưng thêm comment `<!-- SYNC: CTA buttons — keep in sync with #download section -->` để nhắc
- **Effort:** S

---

## Medium Priority Issues

### ARCH-003: FAQ items — 5 blocks HTML gần giống nhau

- **Severity:** MEDIUM
- **Location:** `index.html:1036-1173`
- **Evidence:** 5 `<details>` blocks, mỗi block ~27 dòng với cùng cấu trúc HTML + SVG chevron icon lặp lại
- **Impact:** Thêm/sửa FAQ item phải copy-paste cẩn thận
- **Suggested Fix:** Nếu tương lai cần dynamic FAQ, chuyển sang JS render từ array data. Hiện tại acceptable cho static site.
- **Effort:** S

### ARCH-004: `<style>` block inline cho carousel

- **Severity:** MEDIUM
- **Location:** `index.html:861-880`
- **Evidence:**
  ```html
  <style>
    #phone-carousel { perspective: 1200px; ... }
    .phone-item { position: absolute; ... }
  </style>
  ```
- **Impact:** Custom CSS nằm giữa HTML markup, không cùng chỗ với `styles.css`
- **Suggested Fix:** Di chuyển vào file CSS riêng hoặc append vào `assets/css/styles.css`
- **Effort:** S

### QUAL-002: Magic numbers trong carousel JS

- **Severity:** MEDIUM
- **Location:** `index.html:1414-1419`
- **Evidence:**
  ```javascript
  if (w < 480) return 0.38;
  if (w < 640) return 0.5;
  if (w < 1024) return 0.7;
  ```
  Breakpoint values 480, 640, 1024 trùng với Tailwind breakpoints nhưng hardcoded. Scale factors 0.38, 0.5, 0.7 không có tên.
- **Impact:** Khi sửa responsive, phải tìm trong JS thay vì config tập trung
- **Suggested Fix:** Đặt tên constants:
  ```javascript
  const BREAKPOINT_XS = 480;
  const BREAKPOINT_SM = 640;
  const BREAKPOINT_LG = 1024;
  const SPREAD_XS = 0.38;
  const SPREAD_SM = 0.5;
  const SPREAD_LG = 0.7;
  ```
- **Effort:** S

### QUAL-003: `company_logo.jpeg` — file reference không theo convention

- **Severity:** MEDIUM
- **Location:** `index.html:1321`
- **Evidence:**
  ```html
  <img src="company_logo.jpeg" alt="" class="w-4 h-4 ...">
  ```
  File nằm ở root thay vì `assets/images/`, tên dùng underscore thay vì kebab-case, không có alt text
- **Impact:** Inconsistent với các asset khác, có thể 404 khi deploy
- **Suggested Fix:** Di chuyển vào `assets/images/company-logo.jpeg`, thêm alt text
- **Effort:** S

### QUAL-004: Social links dùng `javascript:void(0)`

- **Severity:** MEDIUM
- **Location:** `index.html:1328, 1333`
- **Evidence:**
  ```html
  <a href="javascript:void(0)" ... aria-label="Facebook">
  <a href="javascript:void(0)" ... aria-label="Instagram">
  ```
- **Impact:** Links không dẫn đến đâu, confusing cho users
- **Suggested Fix:** Thay bằng URL thực hoặc xóa nếu chưa có social pages. Nếu giữ placeholder, dùng `href="#"` + `aria-disabled="true"`
- **Effort:** S

### SEC-001: APK download từ GitHub releases — không có checksum

- **Severity:** MEDIUM
- **Location:** `index.html:254, 1226`
- **Evidence:**
  ```
  href="https://github.com/studium-ignotum/weekend-go-android-distribution/releases/download/v1.0.32/release.apk"
  ```
- **Impact:** Users tải APK trực tiếp không qua Play Store, không có cách verify integrity
- **Suggested Fix:** Thêm SHA-256 checksum hiển thị trên page, hoặc chuyển sang Play Store link khi có
- **Effort:** S

### SIMP-001: Feature cards — cấu trúc HTML lặp

- **Severity:** MEDIUM
- **Location:** `index.html:382-860` (~480 dòng cho 6 feature cards)
- **Evidence:** 6 feature cards, mỗi card ~75 dòng với cùng cấu trúc: wrapper div > icon div > SVG > h3 > p. Chỉ khác content
- **Impact:** Chiếm ~32% file HTML cho content lặp
- **Suggested Fix:** Acceptable cho static site. Nếu refactor, render từ JS array
- **Effort:** M

---

## Low Priority Issues

| ID | Title | Location | Effort | Suggested Fix |
|----|-------|----------|--------|---------------|
| SIMP-002 | `phone-transition` CSS class không được dùng bởi JS | `styles.css` + `index.html` imgs | S | JS set transition inline, class thừa — xóa hoặc dùng thay inline styles |
| SIMP-003 | Copyright year hardcoded 2025 | `index.html:1345` | S | Đổi thành JS `new Date().getFullYear()` hoặc cập nhật thủ công |
| SIMP-004 | twitter:image dùng `.png`, og:image dùng `.webp` | `index.html:41 vs 26` | S | Thống nhất dùng `.webp` cho cả hai |
| QUAL-005 | Unused Tailwind classes trong compiled CSS | `styles.css` | M | Rebuild Tailwind với purge chỉ scan `index.html` |

---

## Refactoring Roadmap

### Phase 1: Quick wins (30 phút)
1. **[QUAL-003]** Di chuyển `company_logo.jpeg` vào `assets/images/`
2. **[QUAL-004]** Fix social links — thêm URL thực hoặc xóa
3. **[SIMP-003]** Fix copyright year
4. **[SIMP-004]** Fix twitter:image extension

### Phase 2: Tách file (1-2 giờ)
1. **[ARCH-001]** Tách JS carousel ra `assets/js/carousel.js`
2. **[ARCH-004]** Tách custom CSS ra file riêng
3. **[QUAL-002]** Đặt tên constants cho magic numbers

### Phase 3: Giảm duplication (2-4 giờ)
1. **[ARCH-002]** Tạo SVG sprite cho icons
2. **[QUAL-001]** Thêm sync comments cho CTA buttons
3. **[ARCH-003]** Cân nhắc JS-render cho FAQ (optional)

### Phase 4: Opportunistic
1. **[SIMP-001]** JS-render feature cards (chỉ khi cần dynamic content)
2. **[QUAL-005]** Rebuild Tailwind CSS
3. **[SIMP-002]** Cleanup unused CSS class

---

## Statistics

- Total files scanned: 2 (index.html, styles.css)
- Total issues found: 14
  - Critical: 0
  - High: 3
  - Medium: 7
  - Low: 4
- Estimated refactoring effort: ~4-6 giờ (all phases)
- Most problematic file: `index.html` (14/14 issues)
