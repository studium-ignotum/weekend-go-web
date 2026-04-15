---
spec_version: "1.0"
project: "weekend-go-web"
component: "footer_linkedin_team"
language: "HTML + TailwindCSS"
task_type: "design"
category: "content"
status: "draft"
---

## Overview

[design]: Footer — thay LinkedIn cá nhân bằng LinkedIn công ty + avatar ảnh thật cho team

### Goal
Chuyển LinkedIn hiển thị trong footer từ 2 link cá nhân rời rạc → 1 link công ty (Unknown Studio) làm đại diện, kèm 2 link cá nhân của team members bên dưới có avatar ảnh thật.

### Context
Footer hiện tại ở [index.html:1313-1328](index.html#L1313-L1328) đang liệt kê 2 LinkedIn cá nhân (Khang Trương, Văn Thân) ngang hàng với email & facebook — không thể hiện được brand công ty. User muốn nâng LinkedIn công ty lên làm entry chính, giữ 2 cá nhân phía dưới với avatar ảnh thật để dễ nhận diện.

### Requirements
- [REQ-01] Trong `<ul>` của block "Liên hệ" (index.html), **thêm 1 `<li>` LinkedIn công ty** trỏ tới `https://www.linkedin.com/company/unknownstudiodev/`, dùng **icon SVG LinkedIn** có sẵn.
- [REQ-02] **Thay icon SVG LinkedIn** của 2 `<li>` Khang Trương và Văn Thân bằng **`<img>` avatar**: `team-khang-truong.webp` và `team-van-than.webp` (`w-5 h-5 object-cover rounded-full border border-gray-600`, `loading="lazy"`, `alt` đúng tên người).
- [REQ-03] **Giữ nguyên URL LinkedIn cá nhân** hiện tại cho 2 người, **giữ text hiển thị "Khang Trương" và "Văn Thân"**.
- [REQ-04] Thứ tự cuối cùng của `<ul>`: email → facebook → LinkedIn công ty → Khang Trương → Văn Thân → separator → Về chúng tôi.
- [REQ-05] **Giữ nguyên** mục `<li>` "Về chúng tôi" (dòng 1330–1335) và `<li role="separator">` (dòng 1329) — không đụng.
- [REQ-06] Mọi external link mới giữ `target="_blank" rel="noopener noreferrer"`; icon SVG giữ `aria-hidden="true"`; `<img>` có `alt` không rỗng.
- [REQ-07] Không thay đổi file nào khác ngoài `index.html`.

### Out of Scope
- Xem `CONTEXT.md` — không partial hóa footer, không đổi trang khác, không đụng layout.

---

## Structure / Outline

### HTML block đích — sau khi sửa (minh hoạ, spec không phải code nguyên văn)

```html
<!-- Liên hệ list — index.html, trong footer -->
<ul class="space-y-2.5">
  <!-- 1. Email (GIỮ NGUYÊN — không đụng) -->
  <li>...mailto:hello@cuoituandidau.vn...</li>

  <!-- 2. Facebook (GIỮ NGUYÊN — không đụng) -->
  <li>...Cuối Tuần Đi Đâu facebook...</li>

  <!-- 3. LinkedIn công ty (MỚI — thêm ngay trước 2 link cá nhân) -->
  <li>
    <a href="https://www.linkedin.com/company/unknownstudiodev/"
       target="_blank" rel="noopener noreferrer"
       class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
      <svg aria-hidden="true" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="..."/> <!-- LinkedIn glyph giống SVG hiện tại -->
      </svg>
      Unknown Studio
    </a>
  </li>

  <!-- 4. Khang Trương (SỬA — đổi <svg> thành <img> avatar) -->
  <li>
    <a href="https://www.linkedin.com/in/khang-truong-p-5b0978b8/"
       target="_blank" rel="noopener noreferrer"
       class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
      <img src="assets/images/team-khang-truong.webp"
           alt="Khang Trương"
           width="20" height="20" loading="lazy"
           class="w-5 h-5 object-cover rounded-full border border-gray-600">
      Khang Trương
    </a>
  </li>

  <!-- 5. Văn Thân (SỬA — đổi <svg> thành <img> avatar) -->
  <li>
    <a href="https://www.linkedin.com/in/van-than-22173719b/"
       target="_blank" rel="noopener noreferrer"
       class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
      <img src="assets/images/team-van-than.webp"
           alt="Văn Thân"
           width="20" height="20" loading="lazy"
           class="w-5 h-5 object-cover rounded-full border border-gray-600">
      Văn Thân
    </a>
  </li>

  <!-- 6. Separator (GIỮ NGUYÊN) -->
  <li role="separator" class="border-t border-gray-700 my-1"></li>

  <!-- 7. Về chúng tôi (GIỮ NGUYÊN) -->
  <li>...unknownstudio.dev/team — img company_logo.webp...</li>
</ul>
```

---

## Deliverables

| Deliverable | Format | Location | Description |
|-------------|--------|----------|-------------|
| Block `<ul>` footer Liên hệ đã cập nhật | HTML | [index.html](index.html) dòng ~1313–1328 | Thêm 1 `<li>` LinkedIn công ty; sửa 2 `<li>` team (svg→img) |

Không tạo file mới. Không xóa file. Ảnh `team-*.webp` đã tồn tại trong repo.

---

## Style & Guidelines

- **Link class (bắt buộc đồng bộ)**: `text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2`
- **Icon SVG size**: `w-4 h-4` (16px) — chỉ áp dụng cho LinkedIn công ty
- **Avatar `<img>` size**: `w-5 h-5` (20px) tròn — áp dụng cho 2 team members
- **Avatar class đầy đủ**: `w-5 h-5 object-cover rounded-full border border-gray-600`
- **Image attrs**: `width="20" height="20"` (tránh CLS), `loading="lazy"`, `alt` có giá trị
- **A11y**: icon SVG decorative → `aria-hidden="true"`; link external → `rel="noopener noreferrer"`
- **Text tiếng Việt có dấu đầy đủ**: "Unknown Studio", "Khang Trương", "Văn Thân"

---

## Implementations

### Design Decisions

| # | Decision | Reasoning | Type |
|---|----------|-----------|------|
| 1 | Thêm 1 `<li>` LinkedIn công ty, KHÔNG xóa 2 `<li>` cá nhân | User muốn giữ cả team member LinkedIn, chỉ thêm company làm đại diện | LOCKED |
| 2 | Avatar `w-5 h-5` tròn thay vì `w-4 h-4` | Ảnh mặt 16px khó nhận, 20px vẫn căn với flex items-center | FLEXIBLE |
| 3 | LinkedIn công ty label = "Unknown Studio" | Khớp brand name ở phần Brand của footer (dòng 1258 dùng `unknownstudio.dev`) | LOCKED |
| 4 | Dùng inline SVG LinkedIn (copy từ block cũ) thay vì external file | Consistency 100% với email/facebook icon pattern | LOCKED |
| 5 | Không áp dụng DRY cho SVG LinkedIn (chỉ còn 1 chỗ dùng sau refactor) | Inline SVG vẫn nhỏ & không có build step để component hóa | LOCKED |
| 6 | Thứ tự: company trên, cá nhân dưới, separator, "Về chúng tôi" | Hierarchy: broadest → specific; internal link (company website) đứng riêng | LOCKED |

### Affected Files

| File | Action | Description | Impact |
|------|--------|-------------|--------|
| [index.html](index.html) | MODIFY | Block `<ul>` footer Liên hệ: thêm 1 `<li>`, sửa 2 `<li>` | N/A (HTML markup, không phải symbol function) |
| [assets/images/team-khang-truong.webp](assets/images/team-khang-truong.webp) | USE (đã tồn tại) | Avatar mới dùng | N/A |
| [assets/images/team-van-than.webp](assets/images/team-van-than.webp) | USE (đã tồn tại) | Avatar mới dùng | N/A |

> GitNexus impact: N/A — edit là HTML markup thuần, không đụng function/class symbol. `gitnexus_detect_changes({scope: "staged"})` vẫn sẽ chạy trước commit để xác nhận chỉ `index.html` thay đổi.

---

## Open Questions
Không còn — user đã confirm cả 2 điểm mở (tên "Văn Thân", giữ "Về chúng tôi").

## Constraints
- Không thêm dependency.
- Không đổi layout grid hoặc màu footer.
- Không break a11y đã fix ở session `fix/a11y-deep`.
- Không tạo CLS khi avatar load chậm (đã đặt width/height).

---

## Acceptance Criteria

### Per-Requirement

| Req | Verification | Expected Result |
|-----|-------------|----------------|
| REQ-01 | `grep -n 'linkedin.com/company/unknownstudiodev' index.html` | Xuất hiện đúng 1 lần, trong block footer Liên hệ, có `target="_blank" rel="noopener noreferrer"` |
| REQ-02 | `grep -nE 'team-(khang-truong\|van-than)\.webp' index.html` | 2 dòng khớp, đều nằm trong `<img>` có class chứa `rounded-full object-cover` và `alt` không rỗng |
| REQ-03 | `grep -n 'linkedin.com/in/khang-truong-p-5b0978b8' index.html` và `grep -n 'linkedin.com/in/van-than-22173719b' index.html` | Mỗi URL xuất hiện đúng 1 lần; text hiển thị "Khang Trương" và "Văn Thân" có dấu đầy đủ |
| REQ-04 | Mắt thường đọc thứ tự `<li>` trong `<ul>` block Liên hệ | email → facebook → Unknown Studio → Khang Trương → Văn Thân → separator → Về chúng tôi |
| REQ-05 | `grep -n 'unknownstudio.dev/team\|role="separator"' index.html` | Không mất entry nào; line count block giảm ~14 dòng (bỏ 1 svg) hoặc tăng ~8 dòng (thêm company) so với baseline |
| REQ-06 | `grep -nE 'target="_blank"[^>]*rel="noopener noreferrer"' index.html` phần footer | 3 external link mới/sửa đều có đủ 2 attribute |
| REQ-07 | `git diff --stat` sau khi sửa | Chỉ `index.html` thay đổi; 0 file khác |

### Overall

Visual smoke test (sau khi implement):

1. Mở `index.html` trong trình duyệt (hoặc live server).
2. Scroll xuống footer block "Liên hệ".
3. **Xác nhận visual**:
   - 7 mục hiển thị theo đúng thứ tự REQ-04.
   - Avatar Khang Trương & Văn Thân hiển thị tròn, không méo, viền xám mảnh.
   - LinkedIn công ty dùng icon SVG (không phải img), label "Unknown Studio".
4. **Xác nhận click**:
   - Click LinkedIn công ty → mở tab mới, URL `linkedin.com/company/unknownstudiodev`.
   - Click Khang Trương → mở tab mới, URL `linkedin.com/in/khang-truong-p-5b0978b8/`.
   - Click Văn Thân → mở tab mới, URL `linkedin.com/in/van-than-22173719b/`.
   - Click "Về chúng tôi" → `unknownstudio.dev/team` (giữ hoạt động).
5. **Responsive**: resize < md breakpoint, các `<li>` vẫn align đẹp, avatar không vỡ.
6. **A11y sanity**: hover outline rõ, tab-order vẫn đúng (email→fb→company→Khang→Văn→Về chúng tôi).
7. `git diff --stat` → chỉ 1 file `index.html` thay đổi.
