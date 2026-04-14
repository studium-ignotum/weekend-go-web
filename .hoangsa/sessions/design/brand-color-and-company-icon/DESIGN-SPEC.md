---
spec_version: "1.0"
project: "weekend-go-web"
component: "brand_color_and_company_icon"
language: "html-tailwindcss"
task_type: "design"
category: "code"
status: "draft"
---

## Overview
[design]: Đồng bộ primary color sang `#22c55e` và sửa icon "Về chúng tôi" trong footer

### Goal
CTA buttons + section background dùng đúng primary color `#22c55e` (utility `bg-primary`); footer link "Về chúng tôi" hiển thị logo công ty mới `company_logo.jpg` thay vì image gãy.

### Context
Sau khi merge `origin/main` vào branch `refactor/split-js-css-carousel`, commit `82d8845` "revert CTA color" đã khôi phục lại 2 chỗ inline `bg-[#15803d]` trong `index.html` (line 125 — CTA "Tải app" header, line 1156 — section `#download` background). Đồng thời, link `<img src="assets/images/company-logo.jpeg">` ở footer (line 1299) đang trỏ tới file đã bị xóa ở commit `c38e0f1`. User đã thêm file mới `assets/images/company_logo.jpg` cần được tham chiếu.

### Requirements
- [REQ-01] CTA button "Tải app" ở header (line 125) dùng `bg-primary hover:bg-primary-dark` thay cho `bg-[#15803d] hover:bg-[#116b31]`.
- [REQ-02] Section `#download` (line 1156) dùng `bg-primary` thay cho `bg-[#15803d]`.
- [REQ-03] Footer link "Về chúng tôi" (line 1297–1302) hiển thị icon từ `assets/images/company_logo.jpg` với `alt="Unknown Studio"`, giữ kích thước `w-4 h-4 rounded-full object-cover border border-gray-600`.
- [REQ-04] Sau khi sửa, không còn bất kỳ string `#15803d` hay `#116b31` nào trong `index.html`.
- [REQ-05] Sau khi sửa, không còn string `company-logo.jpeg` (với hyphen + đuôi `.jpeg`) trong `index.html`.

### Out of Scope
- Đổi màu accent / secondary palette
- Generate `.webp` cho `company_logo.jpg`
- Refactor inline `text-[#xxxxxx]` ở các file pháp lý (đã đúng)
- Sửa logo Studio credit (line 1259 — đã dùng SVG riêng)

---

## Implementations

### Design Decisions
| # | Decision | Reasoning | Type |
|---|----------|-----------|------|
| 1 | Dùng utility `bg-primary` / `hover:bg-primary-dark` | Tailwind theme đã định nghĩa, đảm bảo single source of truth | LOCKED |
| 2 | Giữ nguyên class `text-white text-sm font-semibold rounded-lg transition-colors` ở CTA | Chỉ thay token màu, không đụng layout/typography | LOCKED |
| 3 | Đổi `alt` text icon "Về chúng tôi" thành `"Unknown Studio"` | Logo `{U}` thuộc Unknown Studio, không phải app "Cuối Tuần Đi Đâu" — alt text phải mô tả đúng visual | LOCKED |
| 4 | Giữ classes `w-4 h-4 rounded-full object-cover border border-gray-600` cho `<img>` | Đồng bộ với SVG icon của Khang Trương / Văn Thân (cùng `w-4 h-4`) | LOCKED |
| 5 | KHÔNG rebuild `assets/css/styles.css` thủ công | `bg-primary` utility đã có sẵn trong build cũ vì `tailwind.config.js` đã define primary từ trước; chỉ swap class trong HTML | FLEXIBLE |

### Affected Files
| File | Action | Description | Impact |
|------|--------|-------------|--------|
| `index.html` | MODIFY (3 chỗ) | Line 125: CTA button class swap; Line 1156: section bg class swap; Line 1297–1302: img src + alt swap | N/A (markup only) |

### Snippet trước/sau

**Line 125 (CTA "Tải app" header):**
```diff
- class="px-5 py-2.5 bg-[#15803d] text-white text-sm font-semibold rounded-lg hover:bg-[#116b31] transition-colors"
+ class="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
```

**Line 1156 (Download section):**
```diff
- <section id="download" class="bg-[#15803d] py-16 lg:py-20">
+ <section id="download" class="bg-primary py-16 lg:py-20">
```

**Line 1299 (Footer "Về chúng tôi" icon):**
```diff
- <img src="assets/images/company-logo.jpeg" alt="Cuối Tuần Đi Đâu" class="w-4 h-4 rounded-full object-cover border border-gray-600">
+ <img src="assets/images/company_logo.jpg" alt="Unknown Studio" class="w-4 h-4 rounded-full object-cover border border-gray-600">
```

---

## Open Questions
*(none — đã chốt hết với user trong CONTEXT.md)*

## Constraints
- Browser support: same as project hiện tại (Chrome/Safari/Edge/Firefox latest)
- Không thay đổi layout/spacing — chỉ token màu + nguồn ảnh
- Không break responsive (CTA button ẩn trên mobile qua class `hidden md:flex` ở `<nav>` parent — không ảnh hưởng)

---

## Acceptance Criteria

### Per-Requirement
| Req | Verification | Expected Result |
|-----|-------------|----------------|
| REQ-01 | `grep -n "bg-primary hover:bg-primary-dark" index.html` | Match tại line 125 |
| REQ-02 | `grep -n 'id="download" class="bg-primary' index.html` | Match tại line 1156 |
| REQ-03 | `grep -n 'company_logo.jpg' index.html` + `ls assets/images/company_logo.jpg` | 1 match line ~1299 + file tồn tại |
| REQ-04 | `grep -E "#(15803d\|116b31)" index.html` | 0 match (exit code 1) |
| REQ-05 | `grep "company-logo.jpeg" index.html` | 0 match (exit code 1) |

### Overall
1. Mở `index.html` trong trình duyệt → header CTA "Tải app" có màu xanh `#22c55e`, hover ra `#16a34a`.
2. Section download (gần cuối trang) cũng có nền `#22c55e`.
3. Footer → list "Liên hệ" → link "Về chúng tôi" hiển thị icon `{U}` neon xanh tròn (kích thước 16×16px) bên trái text.
4. DevTools Network tab: không có request 404 cho `company-logo.jpeg`.
