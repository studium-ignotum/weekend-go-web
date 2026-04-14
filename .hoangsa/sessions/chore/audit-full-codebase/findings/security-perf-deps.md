# Security, Performance & Dependency findings

Scope: static site (index.html, privacy.html, terms.html, community-standards.html), assets/js/*, assets/css/*, src/input.css, tailwind.config.js, package.json. node_modules, .git, .gitnexus, .hoangsa, .claude, package-lock.json excluded.

## Summary
- Total findings: 11
- Critical/High/Medium/Low: 0 / 1 / 5 / 5
- No vulnerable deps (`npm audit` = 0 vulnerabilities). No inline event handlers, no `eval`, no `innerHTML`, no `document.write`, no hardcoded secrets. All `target="_blank"` links already carry `rel="noopener noreferrer"`.

## Image inventory (assets/images)
| File | Size | WebP variant | Used lazy | Notes |
|---|---|---|---|---|
| hero-banner-desktop.png | 544 KB | yes (30.9 KB) | n/a (LCP, preloaded, fetchpriority=high) | PNG fallback never served because picture/source webp wins on all evergreen browsers; could be dropped |
| hero-banner-mobile.png | 300 KB | yes (17.6 KB) | n/a (LCP) | same as above |
| hero-banner-desktop.webp | 30.9 KB | — | preloaded | OK |
| hero-banner-mobile.webp | 17.6 KB | — | preloaded | OK |
| ai-review.png | 836 KB | yes (110 KB) | lazy (webp used) | raw PNG unreferenced |
| ai-review.webp | 110 KB | — | lazy | OK |
| plan-list.png | 1.07 MB | yes (120 KB) | lazy (webp used) | raw PNG unreferenced |
| plan-list.webp | 120 KB | — | lazy | OK |
| share-review.png | 1.47 MB | yes (99.7 KB) | lazy (webp used) | raw PNG unreferenced |
| share-review.webp | 99.7 KB | — | lazy | OK |
| weekend-plan.png | 1.38 MB | yes (99.5 KB) | lazy (webp used) | raw PNG unreferenced |
| weekend-plan.webp | 99.5 KB | — | lazy | OK |
| news-feed.webp | 178 KB | — | lazy | OK |
| user-profile.webp | 177 KB | — | lazy | OK |
| venue-detail.webp | 258 KB | — | lazy | OK |
| app-icon-160.png/webp | 38 KB / 3.6 KB | yes | — | OK |
| app-icon-72.png/webp | 9.7 KB / 1.3 KB | yes | n/a (header logo) | OK |
| favicon.png | 4.8 KB | — | — | OK |
| company_logo.jpg | 52.9 KB | no | no (small 16x16 render) | small render but 52 KB payload; convert to .webp |

Raw PNGs never referenced by any HTML: ai-review.png, plan-list.png, share-review.png, weekend-plan.png (≈4.76 MB repo weight, 0 bytes served). hero-banner PNGs are referenced only as `<img src>` fallbacks behind `<picture><source webp>` and in og:image/twitter:image (privacy/terms/community still point at hero-banner-desktop.png — social crawlers will pull 544 KB).

## Dependency snapshot
| Package | Current | Latest | Status |
|---|---|---|---|
| tailwindcss (devDep) | 3.4.19 | 4.2.2 | Major version behind. v3 still receives security patches; upgrade is discretionary for a static site. v4 rewrites the config model (CSS-first, no `tailwind.config.js`), so not a drop-in. |

`npm audit`: **0 vulnerabilities**. Lockfile present (`package-lock.json`). Build script `npm run build` correctly compiles `src/input.css` → `assets/css/styles.css` with `--minify` (verified: output is 17 KB single line starting with `*,:after,:before{--tw-border-spacing-x:0…}`).

## Findings

### SEC-001 — node_modules/ not in .gitignore [HIGH]
- Location: `.gitignore` (only ignores `CLAUDE.md`, `*.DS_Store`, `.gitnexus`)
- Evidence: `node_modules/` is an untracked dir in `git status`; nothing prevents a future `git add .` from committing ~60 packages (tailwindcss + transitive), which would bloat the repo and expose license/supply-chain drift in the source of truth.
- Impact: accidental commit of vendor tree; PR noise; larger clone size. Also risks leaking dev-only files if any future dep ships `.env.sample` etc.
- Suggested fix: add `node_modules/` and `.env*` to `.gitignore`. Also consider adding `.hoangsa/` and `.claude/` if those are local-only.
- Effort: 1 min.

### SEC-002 — No Content-Security-Policy meta tag [MEDIUM]
- Location: all four HTML files `<head>`
- Evidence: no `<meta http-equiv="Content-Security-Policy" …>` present; relies solely on hosting layer headers which aren't configured in repo.
- Impact: any future XSS (e.g. a 3rd-party script injection) would run unconstrained. Even for a static site, CSP is cheap defence in depth against dependency-confusion and DNS hijack scenarios.
- Suggested fix: add a minimal CSP meta (or, preferred, ship a `_headers` / `vercel.json` / `netlify.toml` with response headers) such as `default-src 'self'; img-src 'self' data: https://cuoituandidau.vn; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`.
- Effort: 15 min + test.
- Related: no `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy` either.

### SEC-003 — Inline `<style>` block in index.html breaks stricter CSP [LOW]
- Location: `index.html:70-74`
- Evidence: `<style>body { font-family: "Inter", system-ui, sans-serif; }</style>` inline. Duplicates a rule already in `src/input.css`.
- Impact: forces `'unsafe-inline'` in any future `style-src` CSP.
- Suggested fix: remove the inline block — rule already exists in `assets/css/styles.css` via `src/input.css`.
- Effort: 1 min.

### SEC-004 — Plaintext mailto exposes `hello@cuoituandidau.vn` to scrapers [LOW / informational]
- Location: index.html:1290, privacy.html:188,218, terms.html:172,202, community-standards.html:162,185,215
- Evidence: email appears as plain text in HTML.
- Impact: spam harvesting. Acceptable for a contact address; note only.
- Suggested fix: optional — use a contact form, Cloudflare email obfuscation, or split/encode the address in the rendered text while keeping `href="mailto:"`.
- Effort: n/a unless spam becomes a problem.

### SEC-005 — Third-party hosts loaded at runtime [LOW / informational]
- Location: all four HTML files, `<link>` in `<head>`
- Evidence: only two external origins: `fonts.googleapis.com` (Google Fonts CSS) and `fonts.gstatic.com` (font files). No analytics, no trackers, no tag managers, no CDNs for JS.
- Impact: minimal. Both are well-known Google hosts; privacy policy should mention Google Fonts data collection (IP logging) for GDPR-style compliance. Consider self-hosting Inter if privacy is a concern (Germany has ruled runtime Google Fonts = GDPR violation).
- Suggested fix: either self-host Inter woff2 files (saves one preconnect + decouples from Google), or reference Google Fonts usage in privacy.html.
- Effort: 30 min to self-host.

### PERF-001 — Raw PNG duplicates waste ~4.76 MB of repo storage [MEDIUM]
- Location: `assets/images/ai-review.png`, `plan-list.png`, `share-review.png`, `weekend-plan.png`
- Evidence: these `.png` files are not referenced anywhere in HTML; only their `.webp` variants are used (index.html:946,966,936,956). No `<picture><source>` fallback wrapper is used for these carousel images.
- Impact: bloated clone/deploy. At 836 KB–1.47 MB each they were originally intended as `<picture>` fallbacks but the `<img>` tags reference `.webp` directly with no `<picture>` fallback.
- Suggested fix: either (a) delete the unused PNGs, or (b) wrap each carousel `<img>` in `<picture><source type="image/webp" srcset="…webp"><img src="…png"></picture>` for Safari <14 / legacy fallback. Given target audience (mobile-first Vietnam, modern browsers) option (a) is fine.
- Effort: 5 min (delete) or 15 min (wrap).

### PERF-002 — og:image / twitter:image on legal pages point at 544 KB PNG [MEDIUM]
- Location: privacy.html:16,22; terms.html:16,22; community-standards.html:16,22
- Evidence: `og:image` and `twitter:image` = `https://cuoituandidau.vn/assets/images/hero-banner-desktop.png` (544 KB). index.html correctly uses the `.webp` variant (30.9 KB).
- Impact: social crawlers (Facebook, LinkedIn, iMessage, Slack) fetch 544 KB per share of a legal page. Slow preview generation, wasted bandwidth. Note: some platforms historically don't accept webp for og:image; PNG is safer but a smaller, resized (1200×630) dedicated OG image would be ideal.
- Suggested fix: create a 1200×630 JPEG or PNG around 80–150 KB dedicated for OG (e.g. `og-cover.jpg`) and reference it from all pages including index.html.
- Effort: 30 min (design + export + swap meta).

### PERF-003 — Google Fonts stylesheet is render-blocking [MEDIUM]
- Location: index.html:63-66; privacy.html:27-28; terms.html:27-28; community-standards.html:27-28
- Evidence: `<link href="https://fonts.googleapis.com/css2?family=Inter:…&display=swap" rel="stylesheet">` is synchronous. Even with `display=swap`, the CSS request blocks render. Legal pages do a `<link rel="preload" as="style" …>` but don't use the `onload` swap trick, so the preload is redundant.
- Impact: one extra round-trip (~100–300 ms) to fonts.googleapis.com before first paint. Not catastrophic but measurable in FCP.
- Suggested fix: self-host Inter (preferred — also solves SEC-005 and eliminates two DNS lookups) or convert to the async pattern: `<link rel="preload" as="style" href="…" onload="this.rel='stylesheet'">` with a `<noscript>` fallback. Be aware the `onload` pattern needs `'unsafe-inline'` relief in CSP.
- Effort: 45 min (self-host).

### PERF-004 — Carousel autoplay starts eagerly, no reduced-motion check [LOW]
- Location: `assets/js/carousel.js:154` (`startAutoPlay();` runs unconditionally on load)
- Evidence: `setInterval(goNext, 3000)` runs regardless of `prefers-reduced-motion: reduce` and regardless of whether carousel is in the viewport.
- Impact: needless main-thread work when user hasn't scrolled to carousel; accessibility issue for users with motion sensitivity. Also slightly worse INP on low-end devices.
- Suggested fix: (a) wrap `startAutoPlay()` in `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)`; (b) start only when carousel enters viewport via `IntersectionObserver`.
- Effort: 15 min.

### PERF-005 — `company_logo.jpg` is 53 KB for a 16×16 render [LOW]
- Location: `index.html:1299` — `class="w-4 h-4"` (= 16×16 px)
- Evidence: original JPG is likely much larger resolution; re-encoded to WebP at 32×32 would be <2 KB.
- Impact: 50+ KB extra for a tiny icon.
- Suggested fix: export a 32×32 `.webp` (2x for retina) and reference via `<picture>`. Add `width="16" height="16" loading="lazy"` to prevent CLS.
- Effort: 5 min.

### DEP-001 — tailwindcss major version lag (3.x → 4.x) [LOW]
- Location: `package.json:25`
- Evidence: `"tailwindcss": "^3.4.19"`. v4 is current. v3 line still patched.
- Impact: none immediate — 0 vulns, build works. But v3 will eventually stop getting updates, and tailwind v4 ships better build performance, native CSS variable export, and improved dev server. v4 is **not** a drop-in: removes `tailwind.config.js` in favour of CSS-first `@theme` directive, changes utility names, requires PostCSS plugin change.
- Suggested fix: pin `^3.4.19` for now; plan a dedicated migration ticket when/if v3 patch line slows. Follow the official v4 upgrade guide.
- Effort: 2–4 h when done (only 4 HTML files to sweep for renamed utilities).
