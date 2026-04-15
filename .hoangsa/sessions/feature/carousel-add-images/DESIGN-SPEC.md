---
title: Thêm ảnh vào carousel "Xem trước ứng dụng"
spec_version: "1.0"
project: weekend-go-web
language: html
component: index-page
task_type: feature
status: approved
---

# Thêm ảnh vào carousel "Xem trước ứng dụng"

## Bối cảnh

Section "Xem trước ứng dụng" trong `index.html` có carousel hiển thị screenshot ứng dụng. Hiện tại chỉ có 3 ảnh (venue-detail, newfeed, user-profile). Cần thêm 3 ảnh mới đã có sẵn trong `assets/images/`.

## Yêu cầu

### [REQ-01] Thêm 3 ảnh mới vào carousel

Thêm 3 phần tử `<div class="phone-item">` mới vào `#phone-carousel` trong `index.html`, sử dụng các ảnh `.webp` đã convert:

| Ảnh | Alt text | Mô tả |
|-----|----------|-------|
| `assets/images/share.webp` | Chia sẻ trải nghiệm | Màn hình đánh giá & chia sẻ |
| `assets/images/AI.webp` | Tổng hợp mẹo từ AI | Tổng hợp review bằng AI |
| `assets/images/plan.webp` | Lập kế hoạch cuối tuần | Màn hình lập kế hoạch |

### [REQ-02] Không cần thay đổi JavaScript

Carousel JS đã sử dụng `phones.length` động — không sửa JS.

## Types

Không áp dụng — task chỉ sửa HTML markup.

## Interfaces

Không áp dụng — không có API hay interface mới.

## Implementations

### Thêm HTML markup

Thêm 3 `<div class="phone-item">` vào sau 3 item hiện có trong `#phone-carousel`, mỗi item có cấu trúc:

```html
<div class="phone-item flex-shrink-0">
  <img
    src="assets/images/<filename>.webp"
    alt="<alt text>"
    width="1284"
    height="2778"
    loading="lazy"
    class="w-72 sm:w-80 lg:w-96 h-auto drop-shadow-2xl phone-transition"
  />
</div>
```

## Acceptance Criteria

- [ ] `#phone-carousel` chứa đúng 6 phần tử `.phone-item`
- [ ] 3 ảnh mới dùng file `.webp` đã convert
- [ ] Carousel prev/next/autoplay hoạt động bình thường với 6 ảnh
- [ ] Không có thay đổi JS
