# Context: Brand color sync to #22c55e + company icon trong "Về chúng tôi"

## Task Type
design (hybrid: design + fix — đồng bộ brand color + sửa link icon gãy)

## Language
vi

## Spec Language
vi

## Tech Stack
HTML5 / TailwindCSS 3 (CDN-compiled to `assets/css/styles.css`) / Vanilla JS

## User Input
> update primary color  thành màu 22c55e
> thêm icon công ty vào về chúng tôi @assets/images/company_logo.jpg

User đính kèm ảnh `assets/images/company_logo.jpg` (52KB) — logo Unknown Studio (icon `{U}` neon xanh trên nền đen).

## Discussion Log

### [Q1] GitNexus index outdated, sync lại?
- Options: Sync ngay / Bỏ qua
- Chosen: Sync ngay
- Reason: Đảm bảo design spec phản ánh đúng cấu trúc codebase (54 nodes, 82 edges, 6 flows được index lại)

### [Q2] Loại task?
- Options: design / fix / chore
- Chosen: design + fix (hybrid)
- Reason: Vừa đồng bộ brand (design) vừa fix link `company-logo.jpeg` đã gãy (image bị xóa ở commit trước nhưng reference chưa cập nhật)

## Decisions Made
| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Primary color = `#22c55e` (DEFAULT), `#16a34a` (dark) | Đã set sẵn ở `tailwind.config.js`, cần lan tỏa sang inline `bg-[#15803d]` còn sót lại trong `index.html` | LOCKED |
| 2 | CTA buttons "Tải app" (line 125) + Download section bg (line 1156) phải dùng utility `bg-primary` thay vì hex inline | Dùng theme color của Tailwind giúp brand đồng bộ, tránh drift trong tương lai | LOCKED |
| 3 | Hover state: `hover:bg-primary-dark` (`#16a34a`) thay vì `hover:bg-[#116b31]` | Đồng bộ với palette đã định nghĩa | LOCKED |
| 4 | Icon "Về chúng tôi" (line 1299) đổi `src` từ `assets/images/company-logo.jpeg` → `assets/images/company_logo.jpg` | File cũ đã xóa (commit `c38e0f1`); file mới user vừa cung cấp | LOCKED |
| 5 | Giữ nguyên kích thước icon `w-4 h-4 rounded-full object-cover border` | Đồng nhất với các item khác trong list "Liên hệ" (Khang Trương / Văn Thân SVG cũng `w-4 h-4`) | LOCKED |
| 6 | Cập nhật `alt` text từ "Cuối Tuần Đi Đâu" → "Unknown Studio" | Logo `{U}` thuộc Unknown Studio (publisher), không phải app | LOCKED |
| 7 | KHÔNG đổi màu link mailto trong `terms.html`, `privacy.html`, `community-standards.html` (đã `#22c55e` rồi) | Đã đồng bộ ở commit trước, không cần sửa | FLEXIBLE |
| 8 | KHÔNG rebuild `assets/css/styles.css` thủ công | Tailwind chỉ ảnh hưởng tới `bg-primary` utility — đã có sẵn trong build trước, không cần re-run nếu chỉ swap class | FLEXIBLE |

## Out of Scope
- Đổi màu accent / secondary
- Tối ưu image size / generate `.webp` cho `company_logo.jpg`
- Refactor toàn bộ inline `text-[#xxxxxx]` → utility classes (chỉ động đến CTA buttons)
- Sửa logo Unknown Studio ở footer studio credit (line 1259) — đã có rồi, dùng SVG riêng
