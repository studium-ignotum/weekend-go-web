---
title: Test — Thêm ảnh vào carousel
tests_version: "1.0"
spec_ref: index-page-spec-v1.0
component: index-page
---

## Unit Tests

### [TC-01] Ảnh mới xuất hiện trong DOM (covers REQ-01)

- Kiểm tra `index.html` có đúng 6 phần tử `.phone-item` trong `#phone-carousel`
- Mỗi ảnh mới có đúng src: `assets/images/share.webp`, `assets/images/AI.webp`, `assets/images/plan.webp`
- Mỗi ảnh có `loading="lazy"`, `width="1284"`, `height="2778"`

**Acceptance:** `grep -c "phone-item" index.html` trả về 6

### [TC-02] File ảnh WebP tồn tại (covers REQ-01)

- `assets/images/share.webp` tồn tại
- `assets/images/AI.webp` tồn tại
- `assets/images/plan.webp` tồn tại

**Acceptance:** `ls assets/images/share.webp assets/images/AI.webp assets/images/plan.webp`

### [TC-03] Carousel JS không bị sửa (covers REQ-02)

- Không có thay đổi nào trong phần `<script>` liên quan đến carousel

**Acceptance:** Kiểm tra visual — carousel vẫn autoplay, prev/next hoạt động với 6 ảnh
