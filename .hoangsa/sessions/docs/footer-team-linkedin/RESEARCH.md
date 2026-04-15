# Research: Thay LinkedIn cá nhân bằng LinkedIn công ty + thêm avatar team

> Session: `docs/footer-team-linkedin`
> Ngày: 2026-04-14
> Scope: codebase only (theo preference đã lưu)
> Mode: auto

---

## Tech Stack Detected

- Static HTML (multi-page: `index.html`, `terms.html`, `privacy.html`, `community-standards.html`)
- Tailwind CSS utility-first (không có build step — dùng Tailwind Play CDN hoặc prebuilt stylesheet)
- Vanilla JavaScript (modular: `assets/js/menu.js`, `assets/js/carousel.js`, …)
- Tiếng Việt UI, `lang="vi"`

---

## Project Structure (phần footer)

Footer nằm inline trong từng page HTML (chưa partial hóa — xem session `refactor/html-partials-and-dedupe` cho plan tương lai). File liên quan duy nhất cho task này:

| File | Vai trò |
|------|---------|
| [index.html](index.html) | Chứa footer cần sửa (dòng 1238–1347) |
| [assets/images/team-khang-truong.webp](assets/images/team-khang-truong.webp) | Ảnh chân dung Khang Trương — 6.5 KB, portrait-style, nền tối |
| [assets/images/team-van-than.webp](assets/images/team-van-than.webp) | Ảnh chân dung Văn Thân — 14 KB, portrait-style, nền tối |

> Lưu ý: footer chỉ xuất hiện trong `index.html`. Các trang khác (`terms.html`, `privacy.html`, `community-standards.html`) có footer riêng đơn giản hơn, không có mục "Liên hệ" với LinkedIn — **không cần sửa**.

---

## Current State — Footer `Liên hệ` list

Vị trí: [index.html:1292-1337](index.html#L1292-L1337)

Cấu trúc hiện tại (simplified):

```
<ul class="space-y-2.5">
  <li> email       →  mailto:hello@cuoituandidau.vn
  <li> facebook    →  facebook.com/.../Cuối Tuần Đi Đâu
  <li> LinkedIn    →  linkedin.com/in/khang-truong-p-5b0978b8/     ← cá nhân
  <li> LinkedIn    →  linkedin.com/in/van-than-22173719b/          ← cá nhân
  <li role="separator">
  <li> "Về chúng tôi" (img company_logo.webp) → unknownstudio.dev/team
</ul>
```

Mỗi `<a>` dùng class chuẩn:
```
text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2
```
Icon bên trái là **inline SVG 24×24** (LinkedIn glyph), render ở `w-4 h-4 fill="currentColor"`. External links có `target="_blank" rel="noopener noreferrer"`.

Mục "Về chúng tôi" (dòng 1331–1335) đã dùng pattern **avatar `<img>` thay icon**:
```html
<img src="assets/images/company_logo.webp" alt="Unknown Studio"
     class="w-4 h-4 object-cover rounded-sm border border-gray-600">
```
→ Đây là **pattern sẵn có** để tái dùng cho avatar team.

---

## Target State (theo yêu cầu user)

```
<ul class="space-y-2.5">
  <li> email       →  hello@cuoituandidau.vn
  <li> facebook    →  Cuối Tuần Đi Đâu
  <li> LinkedIn    →  linkedin.com/company/unknownstudiodev/       ← CÔNG TY (mới)
  <li>   ↳ Khang Trương  (avatar team-khang-truong.webp)   → personal LinkedIn
  <li>   ↳ Văn Thân      (avatar team-van-than.webp)        → personal LinkedIn
  <li role="separator">          (giữ hoặc bỏ — xem Risks)
  <li> "Về chúng tôi"   →  unknownstudio.dev/team           (giữ nguyên)
</ul>
```

### URL mapping

| Mục | URL mới |
|-----|---------|
| LinkedIn công ty (thay 2 LinkedIn cũ) | `https://www.linkedin.com/company/unknownstudiodev/` |
| Khang Trương (giữ URL cũ) | `https://www.linkedin.com/in/khang-truong-p-5b0978b8/` |
| Văn Thân (giữ URL cũ) | `https://www.linkedin.com/in/van-than-22173719b/` |

### Asset mapping

| Mục | Ảnh | Kích thước hiển thị đề xuất |
|-----|-----|-----|
| Khang Trương | `assets/images/team-khang-truong.webp` | `w-5 h-5 object-cover rounded-full border border-gray-600` |
| Văn Thân | `assets/images/team-van-than.webp` | `w-5 h-5 object-cover rounded-full border border-gray-600` |

> **Vì sao `w-5 h-5` (20px) thay vì `w-4 h-4` (16px)?** Ảnh chân dung thật ở 16px quá nhỏ — mặt khó nhận diện. `w-5 h-5 rounded-full` cho avatar tròn vừa phải, vẫn giữ alignment với các dòng khác nhờ `flex items-center`. Nếu muốn đồng bộ tuyệt đối với icon 16px khác, dùng `w-4 h-4` + `rounded-full` — chấp nhận ảnh nhỏ.

---

## Patterns & Conventions (đã detect trong codebase)

- **Link style**: `text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2`
- **External link**: luôn có `target="_blank" rel="noopener noreferrer"`
- **Icon SVG inline**: 24×24 viewBox, render `w-4 h-4`, `fill="currentColor"`, `aria-hidden="true"` (a11y-compliant — đã qua đợt [fix/a11y-deep](.hoangsa/sessions/fix/a11y-deep/))
- **Avatar `<img>`**: `w-4 h-4 object-cover rounded-sm border border-gray-600` + `alt="..."` (pattern từ "Về chúng tôi")
- **Separator**: `<li role="separator" class="border-t border-gray-700 my-1"></li>`
- **Loading**: ảnh lazy-load (`loading="lazy"`) đã dùng ở nơi khác — nên áp dụng cho 2 avatar mới
- **Ngôn ngữ**: label tiếng Việt có dấu đầy đủ, giữ đúng "Văn Thân" (không phải "Thế Văn" — xem Risks)

---

## Relevant Dependencies

Không có dependency nào thay đổi. Đây là edit thuần HTML + CSS utility class có sẵn.

| Package | Version | Used for |
|---------|---------|----------|
| Tailwind CSS | (CDN hoặc prebuilt) | Utility classes — `w-5 h-5`, `rounded-full`, `object-cover`, v.v. đều có sẵn |

---

## Key Findings

1. **Footer chỉ nằm trong `index.html`** — không ảnh hưởng các trang legal.
2. **Pattern avatar đã tồn tại** (mục "Về chúng tôi" dùng `<img class="w-4 h-4 object-cover rounded-sm …">`) → copy-paste điều chỉnh cho team, không phải phát minh style mới.
3. **URL cá nhân cần giữ lại** cho 2 dòng Khang Trương & Văn Thân — user chỉ muốn **replace URL LinkedIn đang hiển thị dưới tên công ty bằng URL công ty**, còn 2 link cá nhân di chuyển xuống **dưới** nó và gắn avatar thật.
4. **Thứ tự đề xuất cuối cùng** trong `<ul>`:
   email → facebook → LinkedIn công ty → Khang Trương (avatar) → Văn Thân (avatar) → separator → Về chúng tôi.
5. **A11y**: avatar `<img>` MUST có `alt` mô tả (ví dụ `alt="Khang Trương"`). Icon SVG decorative giữ `aria-hidden="true"`. Link external giữ `rel="noopener noreferrer"`.
6. **Performance**: 2 ảnh nhỏ (6.5 KB + 14 KB = 20.5 KB) — không cần `loading="lazy"` bắt buộc vì footer thường xuất hiện dưới fold, nhưng **nên** thêm để nhất quán với convention đã có.

---

## Risks & Concerns

| Risk | Mức độ | Giải thích |
|------|--------|-----------|
| **Tên "Thế Văn" vs "Văn Thân"** | ⚠️ Medium | User viết "Thế văn" trong yêu cầu, nhưng code hiện tại + filename ảnh (`team-van-than.webp`) đều là **"Văn Thân"**. Khả năng cao là **cùng một người, user typo/viết tắt**. **Khuyến nghị giữ "Văn Thân"** để khớp ảnh và URL LinkedIn (`van-than-22173719b`). Cần confirm với user trước khi đổi text. |
| **"Về chúng tôi" có trùng với LinkedIn công ty không?** | Low | 2 link khác mục tiêu: LinkedIn = social, "Về chúng tôi" = trang `/team` trên website Unknown Studio. Khuyến nghị **giữ nguyên cả hai** — user chỉ yêu cầu thêm/thay LinkedIn, không nói xóa "Về chúng tôi". |
| **Separator (`<li role="separator">`) có còn hợp lý?** | Low | Hiện tại separator tách block cá nhân (LinkedIn x2) khỏi block "Về chúng tôi". Sau refactor: separator nằm giữa team members và "Về chúng tôi" — vẫn hợp lý về nhóm ngữ nghĩa. **Giữ nguyên**. |
| **Avatar size 20px vs 16px** | Low | Khuyến nghị `w-5 h-5` để mặt nhận diện được. Nếu user muốn đồng đều tuyệt đối với icon SVG khác → dùng `w-4 h-4` — flag trong DESIGN-SPEC. |
| **GitNexus impact analysis** | N/A | Edit là HTML markup thuần, không đụng function/class symbol. `gitnexus_impact` không áp dụng. `gitnexus_detect_changes` vẫn nên chạy trước commit. |
| **Tác động đến các session khác** | None | Các session `fix/footer-spacing`, `fix/footer-redesign-hierarchy`, `design/company-logo-square` đã được commit, không conflict. Nhánh hiện tại (`refactor/split-js-css-carousel`) không động vào footer. |

---

## Recommendations

1. **Trước khi sửa code**, hỏi user xác nhận 2 điểm:
   - Tên hiển thị là **"Văn Thân"** (khớp code + ảnh) hay đổi thành **"Thế Văn"**?
   - Giữ hay xóa mục **"Về chúng tôi"** → `unknownstudio.dev/team`?
2. **Cách sửa**: edit 1 block trong `index.html` (dòng 1313–1328), thêm `<li>` LinkedIn công ty ở trước, giữ 2 `<li>` team ở dưới nhưng thay SVG bằng `<img>` avatar.
3. **Sizing**: dùng `w-5 h-5 rounded-full object-cover border border-gray-600` cho avatar team. SVG LinkedIn của công ty vẫn giữ `w-4 h-4`.
4. **Thứ tự ul** (xem Key Findings #4).
5. **Sau khi edit**: chạy `gitnexus_detect_changes({scope: "staged"})` để xác nhận chỉ `index.html` đổi.
6. **Test thủ công**:
   - Mở `index.html` trong trình duyệt, scroll xuống footer
   - Click từng link → URL đúng, mở tab mới
   - Kiểm tra avatar hiển thị tròn, không méo
   - Responsive: mobile (`< md`) vẫn xếp đẹp

---

## Next Steps

- `/hoangsa:menu` — tạo DESIGN-SPEC + TEST-SPEC từ research này
- `/hoangsa:fix` — nếu muốn đi thẳng từ research sang implement (task nhỏ, quick win)

---

*Được tạo bởi `/hoangsa:research` — không có external research (scope="codebase" trong prefs).*
