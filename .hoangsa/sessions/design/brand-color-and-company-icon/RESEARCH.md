# Research: Brand color sync + company icon

## Phương pháp
- Grep `#15803d`, `#22c55e`, `#34c759`, `#16a34a` trong `*.html|*.css|*.js`
- Grep "Về chúng tôi" / "company-logo" / "Studio" để xác định vị trí icon
- GitNexus reindex (`npx gitnexus analyze --embeddings`) → 54 nodes, 82 edges, 6 flows
- Đọc `index.html` line 1240–1330 (footer block)

## Nguồn brand color hiện tại
| File | Line | Token | Status |
|------|------|-------|--------|
| `tailwind.config.js` | 11 | `primary.DEFAULT = "#22c55e"` | ✅ Correct |
| `tailwind.config.js` | 12 | `primary.dark = "#16a34a"` | ✅ Correct |
| `tailwind.config.js` | 13 | `primary.light = "#86efac"` | ✅ Correct |
| `src/input.css` | 24 | `background-color: #22c55e` | ✅ Correct |
| `index.html` | 125 | `bg-[#15803d]` (CTA "Tải app") | ❌ Cần đổi |
| `index.html` | 125 | `hover:bg-[#116b31]` (CTA hover) | ❌ Cần đổi |
| `index.html` | 1156 | `bg-[#15803d]` (`<section id="download">`) | ❌ Cần đổi |
| `community-standards.html`, `privacy.html`, `terms.html` | mailto links | `text-[#22c55e]` | ✅ Correct |

**Nhận xét:** Có 3 vị trí inline hex `#15803d` (dark green cũ) còn sót sau commit "revert CTA color" (`82d8845`) khi merge từ `origin/main`. Cần đổi sang utility `bg-primary` / `hover:bg-primary-dark` để dùng theme.

## Vị trí icon "Về chúng tôi"
- File: `index.html`
- Line 1297–1302: link `<a href="https://unknownstudio.dev/team">` trong `<ul>` "Liên hệ" của footer
- Line 1299 (current, **broken**):
  ```html
  <img src="assets/images/company-logo.jpeg" alt="Cuối Tuần Đi Đâu" class="w-4 h-4 rounded-full object-cover border border-gray-600">
  ```
- File `assets/images/company-logo.jpeg` đã bị xóa ở commit `c38e0f1` → 404 image hiện tại
- File mới: `assets/images/company_logo.jpg` (52KB, đã có sẵn trên disk)

## Pattern tham chiếu (icon trong list "Liên hệ")
Các sibling items (Khang Trương line 1304, Văn Thân line 1311) dùng SVG `w-4 h-4` inline. Item "Về chúng tôi" thay vì SVG sẽ dùng `<img>` tới `company_logo.jpg` — visual style đồng nhất qua class `w-4 h-4 rounded-full object-cover border border-gray-600`.

## Các file `.html` khác không bị ảnh hưởng
- `community-standards.html`, `privacy.html`, `terms.html`: chỉ chứa mailto links đã đúng màu, không có CTA button
- `assets/css/styles.css`: file Tailwind compiled (single-line, ~140KB). Utility `bg-primary` / `hover:bg-primary-dark` đã có sẵn (vì `tailwind.config.js` define primary và đã rebuild)
- `assets/css/carousel.css`, `assets/js/carousel.js`, `assets/js/menu.js`: không liên quan tới brand color/footer icon

## GitNexus impact analysis (manual)
- `index.html` lines 125, 1156, 1299: chỉ là HTML markup, không có symbol bị Gitnexus track → impact = N/A
- File `index.html` không export hay import vào file nào khác → blast radius = chỉ chính file này
- Risk level: **LOW** (HTML class swap + 1 attr change, không phá break execution flows)

## Verification approach
- Visual: mở `index.html` trong trình duyệt → CTA "Tải app" và section download có màu xanh `#22c55e`; footer link "Về chúng tôi" hiển thị icon Unknown Studio
- Grep: `grep "#15803d" index.html` → không match (sau khi sửa)
- Grep: `grep "company-logo.jpeg" index.html` → không match (sau khi sửa)
- File check: `ls assets/images/company_logo.jpg` → tồn tại
