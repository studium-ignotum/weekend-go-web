# Context: Footer — LinkedIn công ty + avatar team

## Task Type
design (UI/UX update — footer Liên hệ list)

## Category
content + code (chỉnh HTML + dùng Tailwind utility class có sẵn)

## Language
Tiếng Việt

## Spec Language
Tiếng Việt

## Tech Stack
HTML, Tailwind CSS (utility), không build step

## User Input (verbatim)
> thay linked in = linked in công ty https://www.linkedin.com/company/unknownstudiodev/
> sử dụng hình ảnh @assets/images/team-khang-truong.webp và @assets/images/team-van-than.webp
> gắn link linked in của Khang trương và Thế văn đặt phía dưới linked của côngty

## Discussion Log

### [Q1] Tên hiển thị là "Văn Thân" (khớp code + ảnh + URL LinkedIn cá nhân) hay "Thế Văn"?
- Options: A (Văn Thân) / B (Thế Văn)
- Chosen: **A — "Văn Thân"**
- Reason: khớp 3 nguồn dữ liệu hiện có — text cũ trong `index.html`, filename `team-van-than.webp`, slug URL LinkedIn `van-than-22173719b`. User xác nhận.

### [Q2] Giữ hay xóa mục "Về chúng tôi" → unknownstudio.dev/team?
- Options: A (Giữ) / B (Xóa) / C (Di chuyển vị trí)
- Chosen: **A — Giữ nguyên**
- Reason: LinkedIn công ty và trang `/team` khác mục tiêu (social vs website). User xác nhận.

## Decisions Made

| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Thay 2 LinkedIn cá nhân (cũ) bằng **1 LinkedIn công ty** ở vị trí đầu của "team block" | Yêu cầu trực tiếp từ user | LOCKED |
| 2 | **Giữ lại 2 LinkedIn cá nhân** (Khang Trương, Văn Thân) nhưng dời xuống dưới LinkedIn công ty, **thay icon SVG bằng avatar ảnh thật** | Yêu cầu: "sử dụng hình ảnh team-khang-truong.webp và team-van-than.webp" | LOCKED |
| 3 | Tên hiển thị giữ **"Văn Thân"** | Khớp code + ảnh + URL hiện hữu; user typo "Thế văn" trong đề bài | LOCKED |
| 4 | **Giữ "Về chúng tôi"** → `unknownstudio.dev/team` | Không trùng mục tiêu với LinkedIn công ty | LOCKED |
| 5 | Avatar size `w-5 h-5 rounded-full object-cover border border-gray-600` | Ảnh mặt 16px quá nhỏ; 20px tròn vừa phải, cân bằng với icon SVG 16px khác | FLEXIBLE (có thể đổi xuống w-4 h-4 nếu user muốn đồng đều tuyệt đối) |
| 6 | Thứ tự ul cuối cùng: email → facebook → LinkedIn công ty → Khang Trương → Văn Thân → separator → Về chúng tôi | Nhóm ngữ nghĩa rõ: đại diện công ty ở trên → team members → link nội bộ | LOCKED |
| 7 | LinkedIn công ty dùng icon SVG LinkedIn có sẵn (`w-4 h-4 fill=currentColor`) | Giữ consistency với icon email/facebook | LOCKED |
| 8 | 2 avatar team dùng `loading="lazy"` + `alt="Khang Trương"` / `alt="Văn Thân"` | Convention a11y + performance đã áp dụng trong codebase | LOCKED |

## Out of Scope
- Không sửa footer ở `terms.html`, `privacy.html`, `community-standards.html` (không có mục Liên hệ).
- Không partial hóa footer (để dành cho session `refactor/html-partials-and-dedupe`).
- Không đổi layout grid footer, không thay màu, không đụng các section khác của `index.html`.
- Không thêm LinkedIn cho người thứ 3.
- Không đổi URL "Về chúng tôi" hay ảnh `company_logo.webp`.
