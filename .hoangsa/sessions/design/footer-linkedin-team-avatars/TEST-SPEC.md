---
tests_version: "1.0"
spec_ref: "footer_linkedin_team-spec-v1.0"
component: "footer_linkedin_team"
category: "content"
strategy: "checklist"
language: "N/A"
---

## Deliverable Checklist

### [REQ-01] LinkedIn công ty được thêm
- [ ] `grep -c 'linkedin.com/company/unknownstudiodev' index.html` → `1`
- [ ] `<li>` LinkedIn công ty nằm **ngay trước** `<li>` Khang Trương (xem thứ tự trong ul)
- [ ] Dùng icon SVG LinkedIn `w-4 h-4 fill="currentColor" aria-hidden="true"`
- [ ] Có `target="_blank"` và `rel="noopener noreferrer"`
- [ ] Link class đồng bộ: `text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2`
- [ ] Label hiển thị: `Unknown Studio`

### [REQ-02] Avatar ảnh thật thay icon SVG cho 2 team members
- [ ] `<img src="assets/images/team-khang-truong.webp">` xuất hiện đúng 1 lần trong footer
- [ ] `<img src="assets/images/team-van-than.webp">` xuất hiện đúng 1 lần trong footer
- [ ] Cả 2 `<img>` có class chứa: `w-5 h-5`, `object-cover`, `rounded-full`, `border border-gray-600`
- [ ] Cả 2 `<img>` có `loading="lazy"` và `width="20" height="20"`
- [ ] `alt="Khang Trương"` và `alt="Văn Thân"` (đúng dấu tiếng Việt)
- [ ] Không còn SVG LinkedIn inline nào trong 2 `<li>` của team members (chỉ giữ SVG ở LinkedIn công ty và facebook/email icons)

### [REQ-03] URL cá nhân giữ nguyên, text đúng
- [ ] `grep -c 'linkedin.com/in/khang-truong-p-5b0978b8' index.html` → `1`
- [ ] `grep -c 'linkedin.com/in/van-than-22173719b' index.html` → `1`
- [ ] Text hiển thị `Khang Trương` (có dấu "ư", "ơ")
- [ ] Text hiển thị `Văn Thân` (có dấu "ă", "â")

### [REQ-04] Thứ tự `<ul>` đúng
- [ ] Đọc từ trên xuống trong block `<ul class="space-y-2.5">`:
  1. Email (`mailto:hello@cuoituandidau.vn`)
  2. Facebook (`facebook.com/.../Cuối Tuần Đi Đâu`)
  3. LinkedIn **Unknown Studio** (`linkedin.com/company/unknownstudiodev/`)
  4. **Khang Trương** (`linkedin.com/in/khang-truong-p-5b0978b8/`) — avatar img
  5. **Văn Thân** (`linkedin.com/in/van-than-22173719b/`) — avatar img
  6. Separator (`<li role="separator">`)
  7. **Về chúng tôi** (`unknownstudio.dev/team`)

### [REQ-05] Các entry không-scope được giữ nguyên
- [ ] `<li role="separator" class="border-t border-gray-700 my-1"></li>` không bị sửa
- [ ] `<li>` "Về chúng tôi" trỏ `https://unknownstudio.dev/team` không bị sửa (URL, text, img src đều giữ)
- [ ] Mục email, facebook không bị sửa byte nào

### [REQ-06] A11y + external link attrs
- [ ] 3 `<a>` mới/sửa (company, Khang, Văn) đều có `target="_blank" rel="noopener noreferrer"`
- [ ] SVG LinkedIn công ty có `aria-hidden="true"`
- [ ] 2 `<img>` avatar có `alt` không rỗng và đúng tên

### [REQ-07] Scope edit
- [ ] `git diff --name-only HEAD` → chỉ liệt kê `index.html` (ngoài các file `.hoangsa/sessions/...` metadata)
- [ ] Không file nào trong `assets/`, `terms.html`, `privacy.html`, `community-standards.html` bị sửa

---

## Review Criteria

| Criterion | How to verify | Covers |
|-----------|--------------|--------|
| Visual hierarchy | Mở browser → LinkedIn công ty nổi bật ngang email/fb, 2 team members có avatar khác biệt rõ | REQ-01, REQ-02 |
| Alignment | Các dòng `<li>` đều căn trái thẳng, avatar 20px không phá alignment so với icon 16px nhờ `flex items-center` | REQ-02 |
| Accessibility | Tab qua từng link → focus ring hiển thị, screen reader đọc được tên đúng từ `alt` hoặc text | REQ-06 |
| Responsive | Resize xuống mobile (< 768px) → `<ul>` stacked đẹp, avatar không vỡ | REQ-02, REQ-04 |
| Không regression | Các fix a11y từ `fix/a11y-deep` (skip-link, reduced-motion, v.v.) vẫn hoạt động | ALL |

---

## Content Quality Gates
- [ ] Tiếng Việt có dấu đầy đủ ở: "Unknown Studio", "Khang Trương", "Văn Thân", "Về chúng tôi"
- [ ] 2 ảnh `team-*.webp` load được (không 404) — kiểm tra Network tab
- [ ] Console không có warning về image aspect ratio (nhờ width/height attrs)
- [ ] URL LinkedIn công ty mở đúng page Unknown Studio (không redirect lạ, không 404)
- [ ] 2 URL cá nhân vẫn mở đúng profile (không bị xóa account, không rename)

---

## Integration Tests

### Test: footer_linkedin_team_render_and_links
- **Covers**: REQ-01, REQ-02, REQ-03, REQ-04, REQ-06
- **Setup**: serve `index.html` qua HTTP (tránh CORS/file:// issues với webp)
- **Steps**:
  1. `python3 -m http.server 8000` tại repo root
  2. Mở `http://localhost:8000/index.html`, cuộn đến footer
  3. Đọc thứ tự `<li>` trong block "Liên hệ"
  4. Click từng link external, quan sát URL tab mới
- **Expected**: 7 entries theo đúng thứ tự REQ-04; 5 external link mở đúng URL với `target="_blank"`
- **Verify**: `grep -En 'linkedin\.com/(company/unknownstudiodev\|in/khang-truong-p-5b0978b8\|in/van-than-22173719b)' index.html | wc -l` → `3`

### Test: footer_linkedin_team_scope_isolation
- **Covers**: REQ-07
- **Setup**: branch sạch (sau commit)
- **Steps**:
  1. `git diff --name-only HEAD~1 HEAD | grep -v '^\.hoangsa/'`
- **Expected**: kết quả chỉ gồm `index.html`
- **Verify**: `git diff --stat HEAD~1 HEAD -- . ':!.hoangsa'` → duy nhất `index.html`

---

## Smoke Test (manual, ~2 phút)

1. Chạy local server: `python3 -m http.server 8000` tại root repo
2. Mở `http://localhost:8000/index.html`
3. Scroll xuống footer → section "Liên hệ"
4. **Visual**: đếm 6 dòng link + 1 separator → 7 entries đúng thứ tự REQ-04
5. **Hover**: mỗi link đổi từ `text-gray-400` → `text-white`
6. **Click lần lượt** 5 link bên ngoài → 5 tab mới mở đúng URL
7. **Shrink viewport** xuống 375px → layout vẫn đọc được, không overflow
8. Quay lại terminal: `git diff --stat` → chỉ `index.html`

Pass = toàn bộ checkbox trong "Deliverable Checklist" đều tick + smoke test OK.
