# Research: Behavior, Size & Animation of Images in "Xem trước ứng dụng"

## Tech Stack Detected
- HTML + Tailwind CSS (via CDN)
- Vanilla JavaScript (inline `<script>`)
- No build pipeline — static files served directly

## Project Structure

### Relevant Files
| File | Role |
|------|------|
| `index.html` | Main landing page — static fan layout, 4 images |
| `index2.html` | Experimental version — JS carousel, 3 images |
| `assets/css/styles.css` | Compiled Tailwind output (no custom carousel CSS) |
| `tailwind.config.js` | Custom theme — no animation extensions used by section |

---

## index.html — Static Fan Layout

### HTML Structure
```
<section class="py-16 lg:py-24 bg-bg-warm overflow-hidden">
  └─ <div class="flex gap-1 sm:gap-2 lg:gap-3 justify-center items-end">
       ├─ venue.png        (always visible)
       ├─ create-post.png  (hidden < 640px)
       ├─ user-profile.png (hidden < 768px)
       └─ comment.png      (hidden < 1024px)
```

### Image Sizes

| Image | Mobile | sm (≥640px) | lg (≥1024px) |
|-------|--------|-------------|--------------|
| venue.png | w-48 (12rem) | w-56 (14rem) | w-64 (16rem) |
| create-post.png | h-[340px] | h-[400px] | h-[455px] |
| user-profile.png | w-48 (12rem) | w-56 (14rem) | w-64 (16rem) |
| comment.png | w-48 (12rem) | w-56 (14rem) | w-64 (16rem) |

- `create-post.png` uses fixed height + `w-auto` + `rounded-lg`; the rest use fixed width + `h-auto`
- All have `drop-shadow-2xl`: `drop-shadow(0 25px 25px rgba(0,0,0,0.15))`
- `items-end` aligns phones to bottom edge — creates a "fan" visual

### Animation
**None.** Purely static layout. No JavaScript controls this section.

### Responsive Behavior
- Mobile: 1 image (venue)
- sm (≥640px): 2 images
- md (≥768px): 3 images
- lg (≥1024px): 4 images

---

## index2.html — Animated Carousel

### HTML Structure
```
<section class="py-16 lg:py-24 bg-green-50 overflow-hidden">
  └─ <div id="phone-carousel" class="flex justify-center items-center -space-x-6 lg:-space-x-10">
       ├─ .phone-item[data-position="0"]  venue-detail.png  (always visible)
       ├─ .phone-item[data-position="1"]  newfeed.png       (hidden < 640px)
       └─ .phone-item[data-position="2"]  user-profile.png  (hidden < 768px)
```

### Image Sizes

| Breakpoint | Width |
|------------|-------|
| Mobile | w-72 (18rem) |
| sm (≥640px) | w-80 (20rem) |
| lg (≥1024px) | w-96 (24rem) |

All images share the same sizing. Larger than index.html (18–24rem vs 12–16rem).

### Overlapping Layout
- `-space-x-6` (mobile/sm): -1.5rem horizontal overlap
- `lg:-space-x-10`: -2.5rem overlap
- `items-center`: vertically centered (vs bottom-aligned in index.html)

### CSS Transitions (on all 3 phones)
```css
/* On .phone-item wrapper */
transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);

/* On <img> */
transition: all 500ms;
```

### JavaScript Carousel Behavior

**`applyCarouselSizes()` — center/side differentiation:**

| Property | Center phone (index 1) | Side phones (index 0, 2) |
|----------|----------------------|------------------------|
| transform | `scale(1.2)` | `scale(0.85)` |
| opacity | `1` | `0.7` |
| z-index | `10` | `1` |

**Auto-rotation — every 5 seconds:**
1. First phone gets exit animation: `opacity: 0`, `translateX(-30px) scale(0.8)` — slides left + shrinks
2. After 400ms delay: DOM node is moved to end via `appendChild`
3. Inline styles are cleared (reset to CSS defaults)
4. `applyCarouselSizes()` re-applies center/side styles — CSS transition smooths the change

**No user interaction:** No click, swipe, touch, resize, or scroll handlers. Auto-play only.

### Unused Config
`tailwind.config.js` defines a `slide-in-left` keyframe (`translateX(-100px) -> 0`, 0.8s) that is **never applied** to any element.

---

## Key Differences Between Versions

| Aspect | index.html | index2.html |
|--------|-----------|-------------|
| Background | `bg-bg-warm` (#F9FAFB) | `bg-green-50` |
| Image count | 4 | 3 |
| Image sources | `assets/images/screenshots/` | Root-level files |
| Image width | 12–16rem | 18–24rem |
| Layout | Spaced (`gap-1/2/3`), bottom-aligned | Overlapping (`-space-x`), center-aligned |
| Center phone effect | None | scale(1.2), z-index 10 |
| Side phone effect | None | scale(0.85), opacity 0.7 |
| Auto-rotation | None | Every 5s, DOM reorder |
| Exit animation | None | translateX(-30px) + scale(0.8), 400ms |
| CSS transition | None | 500ms ease-in-out |
| User interaction | None | None (auto-play only) |

## Key Findings

1. **Two completely different implementations** exist across the two HTML files — index.html is static, index2.html has a JS-driven carousel
2. **All animation is CSS transitions + JS inline styles** — no `@keyframes`, no animation libraries
3. **Carousel has no user controls** — no swipe, no click, no dots/arrows. Auto-play only at 5s intervals
4. **Image sources are inconsistent** — index.html uses organized `assets/images/screenshots/` paths; index2.html references root-level files
5. **The `slide-in-left` keyframe in tailwind config is dead code** — defined but never used

## Risks & Concerns

- **No pause-on-hover or pause-on-visibility** — carousel runs even when section is off-screen, wasting CPU
- **No accessibility** — no ARIA attributes, no reduced-motion media query, no keyboard nav
- **DOM manipulation for rotation** may cause layout thrash — `appendChild` triggers reflow
- **Hardcoded 5s interval** with no cleanup — if page uses SPA navigation, interval leaks
