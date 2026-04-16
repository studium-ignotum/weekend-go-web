---
tests_version: "1.0"
spec_ref: "carousel_size_fix-spec-v1.0"
component: "carousel_size_fix"
category: "code"
strategy: "manual"
language: "HTML, CSS, JavaScript"
---

## Integration Tests

### Test: Center phone giữ scale(1.2) sau rotate
- **Covers**: [REQ-01]
- **Setup**: Mở `index2.html` trong browser, mở DevTools (F12)
- **Steps**:
  1. Đợi 5s cho lần rotate đầu tiên
  2. Inspect element `.phone-item` ở vị trí giữa (index 1)
  3. Kiểm tra `<img>` bên trong
- **Expected**: `transform: scale(1.2)`, `opacity: 1`, `z-index: 10`
- **Verify**: DevTools → Elements → Computed styles

### Test: Side phones giữ scale(0.85) sau rotate
- **Covers**: [REQ-02]
- **Setup**: Tiếp tục từ test trên
- **Steps**:
  1. Inspect `.phone-item` ở vị trí 0 và 2
  2. Kiểm tra `<img>` bên trong mỗi phone
- **Expected**: `transform: scale(0.85)`, `opacity: 0.7`, `z-index: 1`
- **Verify**: DevTools → Elements → Computed styles

### Test: Transition mượt mà
- **Covers**: [REQ-03]
- **Setup**: Mở `index2.html`, quan sát section "Xem trước ứng dụng"
- **Steps**:
  1. Đợi 3 lần rotate (15s)
  2. Quan sát kỹ moment chuyển đổi
- **Expected**: Ảnh fade out mượt, ảnh mới scale lên/xuống smooth, không nhấp nháy hay nhảy size đột ngột
- **Verify**: Visual inspection

### Test: Stability sau 10+ rotate
- **Covers**: [REQ-04]
- **Setup**: Mở `index2.html`, mở DevTools Console
- **Steps**:
  1. Đợi 60s (12 lần rotate)
  2. Sau mỗi lần rotate, kiểm tra Console có error không
  3. Inspect center phone ở lần rotate thứ 12
- **Expected**: Không có JS errors, center phone vẫn `scale(1.2)`, side phones vẫn `scale(0.85)`
- **Verify**: Console không có errors + Computed styles đúng

## Edge Cases
| Case | Steps | Expected | Covers |
|------|-------|----------|--------|
| Mobile (1 ảnh) | Resize browser < 640px, đợi rotate | Carousel vẫn hoạt động, không crash | REQ-01, REQ-04 |
| Tablet (2 ảnh) | Resize 640-767px, đợi rotate | 2 ảnh rotate đúng scale | REQ-01, REQ-02 |
| Tab switch | Chuyển tab khác 30s, quay lại | Carousel vẫn chạy đúng | REQ-04 |

## Console Verification Script
Chạy trong DevTools Console để kiểm tra nhanh:
```javascript
// Chạy sau mỗi lần rotate để verify
const phones = document.querySelectorAll('#phone-carousel .phone-item');
phones.forEach((p, i) => {
  const img = p.querySelector('img');
  const transform = img.style.transform;
  const opacity = img.style.opacity;
  console.log(`Phone ${i}: transform=${transform}, opacity=${opacity}`);
});
// Expected: Phone 0: scale(0.85), 0.7 | Phone 1: scale(1.2), 1 | Phone 2: scale(0.85), 0.7
```
