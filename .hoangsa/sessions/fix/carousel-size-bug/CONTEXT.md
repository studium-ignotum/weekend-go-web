# Context: Fix Carousel Size Bug

## Task Type
fix

## Language
vi

## Spec Language
vi

## Tech Stack
HTML, CSS (TailwindCSS), Vanilla JavaScript

## User Input
Fix bug khi auto-rotate mỗi 5 giây, 3 ảnh trong section "Xem trước ứng dụng" (index2.html) không giữ đúng size: center phone phải scale 1.2x, side phones phải scale 0.85x với opacity 0.7.

## Discussion Log
### [Q1] Bug xảy ra cụ thể như thế nào?
- Options: Size bị reset / Size sai vị trí / Nhấp nháy giật / Chỉ 2 ảnh hoạt động
- Chosen: Size bị reset
- Reason: Sau khi rotate, tất cả ảnh về cùng size — không còn phân biệt giữa/bên

## Root Cause Analysis
1. `setInterval` mỗi 5s: fade out first phone → `appendChild` di chuyển DOM → clear inline styles → `applyCarouselSizes()`
2. Vấn đề: `firstImg.style.transform = ''` xóa inline transform, rồi `applyCarouselSizes()` set lại transform mới
3. Nhưng CSS `transition-all duration-500` trên `.phone-item` và `<img>` gây conflict — browser batch reflow khiến transform mới không apply đúng
4. Kết quả: sau vài lần rotate, scale bị mất hoặc reset

## Decisions Made
| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Fix trong index2.html (inline script) | Code JS carousel nằm hoàn toàn trong file này | LOCKED |
| 2 | Giữ nguyên logic carousel (DOM reorder) | Approach tổng thể OK, chỉ cần fix timing | FLEXIBLE |

## Out of Scope
- Không thêm swipe/click interaction
- Không thay đổi image sources hay sizes
- Không sửa index.html (static layout, không có bug)
