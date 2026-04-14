# Context: HTML partials + dedupe (Theme 2)

## Task Type
refactor (kill ~700 LOC duplication; introduce build-time partial inclusion)

## Language
vi

## Spec Language
vi

## Tech Stack
HTML5 / TailwindCSS 3 / Vanilla JS / Node.js script (new)

## User Input
> "làm hết các tác vụ trên" — Theme 2 từ AUDIT-REPORT

## Source
`.hoangsa/sessions/chore/audit-full-codebase/AUDIT-REPORT.md` — Theme 2: Kill HTML duplication

## Discussion Log

### [Q1] Build approach cho HTML partials
- Options:
  - A. Custom 30-line node script `scripts/build-html.js` xử lý `<!-- @include partials/X.html -->` markers (Recommended)
  - B. `posthtml-include` npm dep + posthtml pipeline
  - C. Eleventy — full static site generator
  - D. Server-Side Includes (SSI) qua hosting
  - E. Client-side hydration với `<template>` + fetch
- Chosen: **A — custom node script** (assume — flag for user review)
- Reason: 4 HTML pages, không cần framework; node script đơn giản nhất, không thêm deps; Theme 3 (CI/CD) đã skip nên giữ build chain tối giản

⚠ **Flag for review:** Quyết định này thay đổi `npm run build` script. Nếu user muốn giữ build pipeline nguyên si → fallback option E (client-side `<template>` + JS) để zero build change, hoặc skip Theme 2.

## Decisions Made
| # | Decision | Reason | Type |
|---|----------|--------|------|
| 1 | Tạo `partials/{header,footer,download-cta}.html` | 3 block lớn nhất bị duplicate qua 4 HTML pages | LOCKED |
| 2 | Tạo `partials/icons.svg` chứa `<defs>` với `<symbol>` cho: star, faq-chevron, app-store, google-play, social-fb, social-ig, mail, hamburger, close, chevron-right | Inline 1 lần ở mỗi page (đầu body, hidden), reference qua `<use href="#icon-X"/>` | LOCKED |
| 3 | Build script: `scripts/build-html.js` xử lý markers, output đến `dist/*.html` HOẶC overwrite root HTML files | LOCKED | LOCKED |
| 4 | Output strategy: **overwrite root HTML files** (giữ index.html / terms.html / privacy.html / community-standards.html ở root) | Tránh thay đổi deploy structure; giữ relative paths cho assets | LOCKED |
| 5 | Source HTML files đổi tên thành `*.src.html` để build script process | Phân biệt source vs generated | LOCKED |
| 6 | APK URL lift vào `partials/download-cta.html` qua placeholder `{{APK_VERSION}}`, value đọc từ `package.json` `version` field hoặc env var | Single source of truth | LOCKED |
| 7 | Carousel slides → JSON `<script type="application/json" id="carousel-slides">` + render trong `carousel.js` | Render-on-load thay vì hard-coded markup | LOCKED |
| 8 | Pick legal-page nav variant làm canonical | Dùng design tokens (`bg-white/95 backdrop-blur-sm`, `border-border-default`, `h-16`) — thống nhất hơn | LOCKED |
| 9 | KHÔNG động `<head>` per-page (mỗi page có meta riêng cho SEO/OG) | Header partial chỉ là `<nav>` không phải `<head>` | LOCKED |

## Out of Scope
- Theme 3 (full CI/CD pipeline)
- Skip-link (Theme 4)
- Carousel a11y motion (Theme 4)
- Image optimization (Theme 5)
- Self-host font (Theme 5)
- Tailwind v4 migration (Theme 6)
- Removing unused tailwind config tokens (Theme 6 backlog) — sẽ làm sau khi confirmed unused trong cả `partials/*.html` mới
