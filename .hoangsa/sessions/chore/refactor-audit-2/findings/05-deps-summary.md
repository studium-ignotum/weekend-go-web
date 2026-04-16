# Dependency Summary — weekend-go-web

Snapshot date: 2026-04-14
Source: `package.json`, `package-lock.json`, `npm outdated --json`, `npm audit --json`, `npm view`.

## Declared packages

| Package | Declared | Current | Latest | Status | Risk |
|---|---|---|---|---|---|
| tailwindcss | `^3.4.19` (devDependencies) | 3.4.19 | 4.2.2 | 1 major behind (3.x vẫn được maintain, nhưng v4 đã GA từ đầu 2025) | MEDIUM (nợ kỹ thuật nâng cấp; không có CVE) |

## Transitive / meta

| Metric | Value | Note |
|---|---|---|
| Total declared deps | 1 (devDependencies) | Không có dependencies production |
| Transitive total | 73 | Kéo theo từ tailwindcss (postcss, chokidar, browserslist…) |
| Vulnerabilities (npm audit) | 0 critical / 0 high / 0 moderate / 0 low | Sạch tại thời điểm audit |
| Lockfile | package-lock.json (1018 dòng) | CÓ — tốt |
| `private: true` | KHÔNG | Rủi ro publish nhầm (xem DEP-003) |
| `engines.node` | `>=18` | Có; không chốt npm/packageManager |
| Unused declared deps | Không | tailwindcss được tham chiếu ở `tailwind.config.js`, `src/input.css`, scripts `build:css`/`dev:css` |
| Dev-vs-prod mismatch | Không | tailwindcss đúng là devDependency (build-time) |

## Ghi chú về rủi ro

- **Maintainers tailwindcss**: 3 maintainer (malfaitrobin, adamwathan, reinink) — dự án active, do Tailwind Labs bảo trì, rủi ro abandonment thấp.
- **Deprecation**: gói không bị deprecated.
- **Single-maintainer risk**: không áp dụng.
- **Duplicate purpose**: không — chỉ có 1 gói build CSS.
- **scripts/build-html.js**: chỉ dùng Node built-ins (`node:fs`, `node:path`), không kéo thêm dep — tốt.

## Ưu tiên hành động

1. (LOW, quick win) Thêm `"private": true` vào package.json — DEP-003.
2. (LOW) Thêm `"packageManager"` và siết `engines.npm` — DEP-006.
3. (LOW, tùy chọn) Pin tailwindcss (`~3.4.19` hoặc `3.4.19`) để build tất định hơn — DEP-002.
4. (MEDIUM, backlog) Lên kế hoạch nâng cấp Tailwind v4 khi có thời gian — DEP-001 / DEP-005.
