# Context: Fix Audit Quick Wins

## Task Type
fix

## Language
vi

## Spec Language
vi

## Tech Stack
HTML, CSS (TailwindCSS), Vanilla JavaScript

## User Input
Fix tất cả 22 quick wins (Effort S) từ audit report — bao gồm logo 404, CDN→compiled CSS, đồng bộ màu primary, xóa dead assets, thêm build scripts, security headers, carousel image optimization, magic numbers.

## Decisions Made
| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Fix tất cả Effort S issues cùng lúc | Tất cả đều nhỏ, độc lập, có thể làm song song | LOCKED |
| 2 | Giữ Tailwind v3 | Migration v4 là task riêng (Effort L) | LOCKED |
| 3 | Chọn #34C759 làm primary color chuẩn | iOS system green, phù hợp brand | LOCKED |

## Out of Scope
- Tailwind v4 migration (DEP-001, Effort L)
- SSG migration cho header/footer sharing (SMELL-007, Effort M)
- Google Fonts self-hosting (PERF-007, Effort M)
