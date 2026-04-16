---
spec_version: "1.0"
project: "weekend-go-web"
component: "carousel_size_fix"
language: "HTML, CSS, JavaScript"
task_type: "fix"
category: "code"
status: "draft"
---

## Overview
[fix]: Sửa bug carousel không giữ đúng scale sau khi auto-rotate

### Goal
Đảm bảo 3 ảnh trong section "Xem trước ứng dụng" luôn giữ đúng size sau mỗi lần auto-rotate: center phone = scale(1.2), side phones = scale(0.85) + opacity 0.7.

### Context
Carousel trong `index2.html` dùng `setInterval` mỗi 5s để xoay ảnh bằng DOM reorder (`appendChild`). Sau khi xoay, `applyCarouselSizes()` được gọi để set lại scale/opacity, nhưng vì:
1. Inline styles bị clear (`style.transform = ''`) rồi set lại ngay trong cùng execution context
2. CSS `transition-all duration-500` trên `.phone-item` và `<img>` gây conflict với batch reflow

→ Browser không apply transform mới đúng cách, dẫn đến tất cả ảnh về cùng size.

### Requirements
- [REQ-01] Sau mỗi lần auto-rotate, center phone (index 1) phải có `scale(1.2)`, `opacity: 1`, `z-index: 10`
- [REQ-02] Sau mỗi lần auto-rotate, side phones (index 0, 2) phải có `scale(0.85)`, `opacity: 0.7`, `z-index: 1`
- [REQ-03] Transition giữa các lần rotate phải mượt mà (không nhấp nháy, không nhảy size)
- [REQ-04] Carousel phải hoạt động đúng sau 10+ lần rotate liên tiếp

### Out of Scope
- Không thêm swipe/click interaction
- Không thay đổi image sources hay responsive sizes
- Không sửa index.html

---

## Implementations

### Design Decisions
| # | Decision | Reasoning | Type |
|---|----------|-----------|------|
| 1 | Dùng `requestAnimationFrame` sau `appendChild` để force reflow trước khi apply sizes | Đảm bảo browser đã commit DOM change trước khi set transform mới | LOCKED |
| 2 | Tạm disable transition trước khi reset styles, re-enable sau khi apply sizes | Ngăn CSS transition conflict với style reset | LOCKED |
| 3 | Giữ nguyên logic DOM reorder (`appendChild`) | Logic tổng thể OK, chỉ cần fix timing | FLEXIBLE |

### Root Cause Fix

**Vấn đề cốt lõi:** Khi clear inline styles rồi set lại ngay, browser batch cả 2 thao tác trong 1 reflow → transform mới bị "nuốt".

**Giải pháp:**

```javascript
setTimeout(() => {
    // 1. Tạm tắt transition để tránh conflict
    const allPhones = carousel.querySelectorAll('.phone-item');
    allPhones.forEach(phone => {
        phone.style.transition = 'none';
        phone.querySelector('img').style.transition = 'none';
    });

    // 2. Move DOM node
    carousel.appendChild(firstPhone);
    
    // 3. Reset inline styles của phone vừa di chuyển
    firstImg.style.opacity = '';
    firstImg.style.transform = '';

    // 4. Force reflow để browser commit DOM change
    void carousel.offsetHeight;

    // 5. Apply sizes ngay (không transition)
    applyCarouselSizes();

    // 6. Force reflow lần nữa để commit sizes
    void carousel.offsetHeight;

    // 7. Bật lại transition
    allPhones.forEach(phone => {
        phone.style.transition = '';
        phone.querySelector('img').style.transition = '';
    });
}, 400);
```

### Affected Files

| File | Action | Description | Impact |
|------|--------|-------------|--------|
| `index2.html` | MODIFY | Sửa JS carousel trong `<script>` tag (lines 640-657) | d=1 — trực tiếp fix bug |

---

## Constraints
- Không thêm dependency mới (no libraries)
- Giữ nguyên Tailwind classes trên HTML elements
- Carousel phải hoạt động trên mobile (1 ảnh), tablet (2 ảnh), desktop (3 ảnh)

---

## Acceptance Criteria

### Per-Requirement
| Req | Verification | Expected Result |
|-----|-------------|----------------|
| REQ-01 | Mở index2.html, đợi 5s rotate, inspect center phone | `transform: scale(1.2)`, `opacity: 1`, `z-index: 10` |
| REQ-02 | Inspect side phones sau rotate | `transform: scale(0.85)`, `opacity: 0.7`, `z-index: 1` |
| REQ-03 | Quan sát transition khi rotate | Smooth, không nhấp nháy |
| REQ-04 | Đợi 60s (12 lần rotate) | Sizes vẫn đúng sau lần rotate thứ 12 |

### Overall
1. Mở `index2.html` trong browser
2. Đợi ít nhất 3 lần auto-rotate (15 giây)
3. Inspect element: center phone phải có `scale(1.2)`, side phones `scale(0.85)`
4. Đợi thêm 10 lần rotate — kết quả phải consistent
