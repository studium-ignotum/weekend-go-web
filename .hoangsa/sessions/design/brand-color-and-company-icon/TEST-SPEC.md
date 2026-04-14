---
tests_version: "1.0"
spec_ref: "brand_color_and_company_icon-spec-v1.0"
component: "brand_color_and_company_icon"
category: "code"
strategy: "smoke"
language: "html-tailwindcss"
---

## Pre-flight Checks
- [ ] File `assets/images/company_logo.jpg` tồn tại (52KB, image/jpeg)
- [ ] `tailwind.config.js` define `primary.DEFAULT = "#22c55e"` và `primary.dark = "#16a34a"`
- [ ] `assets/css/styles.css` chứa utility class `.bg-primary` và `.hover\:bg-primary-dark` (đã có sẵn từ build trước)

## Integration Tests (grep + file checks)

### Check: REQ-01 — CTA "Tải app" header dùng bg-primary
- **Command**: `grep -n 'bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark' index.html`
- **Expected**: 1 match tại line ~125, exit code 0
- **Covers**: REQ-01

### Check: REQ-02 — Section #download dùng bg-primary
- **Command**: `grep -n 'id="download" class="bg-primary py-16 lg:py-20"' index.html`
- **Expected**: 1 match tại line ~1156, exit code 0
- **Covers**: REQ-02

### Check: REQ-03 — Footer icon "Về chúng tôi" dùng company_logo.jpg
- **Command**: `grep -n 'src="assets/images/company_logo.jpg" alt="Unknown Studio"' index.html`
- **Expected**: 1 match tại line ~1299, exit code 0
- **Covers**: REQ-03

### Check: REQ-03 (file) — Asset tồn tại
- **Command**: `test -f assets/images/company_logo.jpg && file assets/images/company_logo.jpg`
- **Expected**: file exists, output chứa "JPEG image data"
- **Covers**: REQ-03

### Check: REQ-04 — Không còn hex màu cũ
- **Command**: `grep -E "#(15803d|116b31)" index.html`
- **Expected**: 0 match, exit code 1
- **Covers**: REQ-04

### Check: REQ-05 — Không còn reference company-logo.jpeg
- **Command**: `grep "company-logo.jpeg" index.html`
- **Expected**: 0 match, exit code 1
- **Covers**: REQ-05

## Visual Checklist (manual trong trình duyệt)

### [REQ-01] CTA "Tải app" trên header
- [ ] Background màu `#22c55e` (green-500)
- [ ] Hover → màu `#16a34a` (green-600)
- [ ] Text trắng, padding/font không thay đổi
- [ ] Trên mobile: button ẩn (vì class `hidden md:flex` ở parent), không gây overflow

### [REQ-02] Section Download (gần cuối trang)
- [ ] Background full-width màu `#22c55e`
- [ ] Padding `py-16 lg:py-20` giữ nguyên
- [ ] Text/CTA bên trong vẫn đọc được (contrast trên nền xanh)

### [REQ-03] Footer → Liên hệ → "Về chúng tôi"
- [ ] Icon hiển thị logo `{U}` Unknown Studio (nền đen, `{}` xanh, chữ U trắng)
- [ ] Kích thước 16×16px, bo tròn, có border xám mảnh
- [ ] Nằm cạnh trái text "Về chúng tôi", gap 8px (gap-2)
- [ ] Hover link → text trắng (như Khang Trương / Văn Thân)

## Edge Cases
| Scenario | How to simulate | Expected | Covers |
|----------|----------------|----------|--------|
| Image load fail | DevTools → Network → block `company_logo.jpg` | Alt text "Unknown Studio" hiển thị thay icon, layout không vỡ | REQ-03 |
| User dùng dark theme browser | DevTools → Rendering → emulate `prefers-color-scheme: dark` | Footer (đã là `bg-gray-900`) hiển thị bình thường, icon vẫn rõ trên nền tối | REQ-03 |
| Offline mode | DevTools → Network → Offline | CTA button vẫn render màu xanh (CSS đã cached) | REQ-01, REQ-02 |

## Regression Checks
- [ ] CTA "Tải app" vẫn link đúng tới `#download` anchor
- [ ] Section `#download` scroll-to vẫn hoạt động (anchor ID không đổi)
- [ ] Link "Về chúng tôi" vẫn trỏ `https://unknownstudio.dev/team` với `target="_blank" rel="noopener noreferrer"`
- [ ] Các mailto links trong `terms.html`, `privacy.html`, `community-standards.html` không bị động vào (vẫn `text-[#22c55e]`)
- [ ] Branch hiện tại không có file modified nào ngoài `index.html` sau khi áp dụng changes
