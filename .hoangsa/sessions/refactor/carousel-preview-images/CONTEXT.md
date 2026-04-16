# Context: Refactor carousel "Xem trước ứng dụng" sang data-driven + chuẩn hóa naming preview-*

## Task Type
refactor

## Language
vi

## Spec Language
vi

## Tech Stack
HTML / CSS / JavaScript (vanilla) / TailwindCSS — static site build qua `build-html.js` (src/*.src.html → *.html)

## User Input
"giúp tôi thay phần xem trước ứng dụng bằng hình ảnh có naming là preview-*"

## Discussion Log

### [Q1] Loại task?
- Options: fix / chore / refactor
- Chosen: **refactor**
- Reason: User muốn cả chuẩn hóa naming + đổi cấu trúc (data-driven) chứ không chỉ fix extension

### [Q2] Xử lý slide 3 (user-profile.webp)?
- Options: thay ảnh mới / xóa slide / rename
- Chosen: **thay bằng ảnh preview-* mới (preview-user-profile.png)**
- Reason: User sẽ cung cấp ảnh mới theo naming convention

### [Q3] Nơi lưu dữ liệu slide?
- Options: HTML data-* attrs / JS array / JSON file
- Chosen: **Mảng JS SLIDES trong carousel.js**
- Reason: Config tập trung, dễ thêm/xóa slide, không cần HTTP request như JSON

### [Q4] Chuẩn extension cho ảnh?
- Options: rename .jpeg → .png / chỉ sửa HTML ref / convert webp
- Chosen: **Chỉ sửa HTML ref**
- Reason: Giữ tên file thực tế, sửa src trong HTML/JS để khớp

### [Q5] Tên file slide 3?
- Options: preview-user-profile.png / custom / placeholder
- Chosen: **preview-user-profile.png** (user cung cấp sau)

### [Q6] JS render mode?
- Options: JS tự dựng DOM / HTML full markup + JS chỉ logic / Hybrid
- Chosen: **JS tự tạo DOM từ array**
- Reason: 1 source of truth, HTML gọn; a11y đảm bảo qua template có sẵn alt/width/height trong array

### [Q7] Git branch?
- Chosen: **ở lại `refactor/split-js-css-carousel`**
- Reason: Thay đổi liên quan trực tiếp (xóa ảnh cũ, sửa src) đã dirty trên branch này

## Decisions Made

| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Toàn bộ ảnh preview section dùng prefix `preview-*` | Naming convention thống nhất | LOCKED |
| 2 | Dữ liệu slide lưu thành `const SLIDES = [...]` trong `assets/js/carousel.js` | 1 source of truth, dễ maintain | LOCKED |
| 3 | JS render `<div class="phone-item"><img …></div>` từ array vào `#phone-carousel` | Không duplicate markup | LOCKED |
| 4 | Giữ tên file thực tế trên disk, chỉ sửa src trong HTML/JS cho khớp | Tránh rename binary không cần thiết | LOCKED |
| 5 | Slide `user-profile.webp` thay bằng `preview-user-profile.png` (user cung cấp file sau) | Theo convention preview-* | LOCKED |
| 6 | Giữ nguyên behavior carousel: autoplay, prev/next, pause toggle, reduced-motion, a11y roles | Không đổi UX | LOCKED |
| 7 | Thứ tự slide giữ như hiện tại (venue-detail → newsfeed → user-profile → share-review → AI-review → weekend-plan → plan-list) | Tránh thay đổi ngoài scope | FLEXIBLE |
| 8 | Stay on branch `refactor/split-js-css-carousel` | Thay đổi đang dirty đã thuộc task này | LOCKED |

## Out of Scope
- Convert ảnh sang .webp / tối ưu dung lượng
- Thay đổi layout carousel hoặc animation
- Thay đổi icon / CSS carousel
- Refactor các section khác ngoài "Xem trước ứng dụng"
- Thay đổi build script `build-html.js`
