---
tests_version: "1.0"
spec_ref: "audit_quick_wins-spec-v1.0"
component: "audit_quick_wins"
category: "code"
strategy: "smoke"
language: "HTML, CSS, JavaScript"
---

## Integration Tests

### Test: Logo link không trỏ index2.html
- **Covers**: [REQ-01]
- **Command**: `grep -c "index2.html" index.html`
- **Expected**: 0

### Test: Không còn Tailwind CDN
- **Covers**: [REQ-02]
- **Command**: `grep -c "cdn.tailwindcss" index.html`
- **Expected**: 0

### Test: Primary color đồng bộ
- **Covers**: [REQ-03]
- **Command**: `grep -c "#22c55e" tailwind.config.js`
- **Expected**: 0

### Test: APK link dùng latest
- **Covers**: [REQ-04]
- **Command**: `grep -c "releases/latest/download" index.html`
- **Expected**: >= 2 (2 buttons)

### Test: Build script tồn tại
- **Covers**: [REQ-05]
- **Command**: `grep -c '"build"' package.json`
- **Expected**: >= 1

### Test: Carousel images có lazy loading
- **Covers**: [REQ-06]
- **Command**: `grep -c 'loading="lazy"' index.html`
- **Expected**: >= 3

### Test: WebP files trong assets/images/
- **Covers**: [REQ-07]
- **Command**: `ls assets/images/venue-detail.webp assets/images/newfeed.webp assets/images/user-profile.webp`
- **Expected**: 3 files exist

### Test: Không còn PNG ở root
- **Covers**: [REQ-08]
- **Command**: `ls *.png 2>/dev/null | wc -l`
- **Expected**: 0

### Test: Magic numbers extracted
- **Covers**: [REQ-10]
- **Command**: `grep -c "AUTOPLAY_INTERVAL" index.html`
- **Expected**: >= 1

## Edge Cases
| Case | Check | Expected |
|------|-------|----------|
| CSS compiled đầy đủ | Mở index.html trong browser | Layout đúng, không bị vỡ |
| Carousel hoạt động | Đợi 3s | Auto-rotate, scale đúng |
| APK link | Click button Android | Download bắt đầu |
