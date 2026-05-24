# Legacy design references

This folder holds **frozen snapshots** of earlier landing-page designs, kept for design reference only. None of these files are built, served, or referenced by the live site.

## Why

When the team rewrites a section, the old design's HTML/CSS choices can still be useful as a reference — animation timings, layout grids, copy variants — but you don't want them hanging around at the project root or in `src/` where they could be confused with active sources.

## What's here

| File | Captured | Description |
|---|---|---|
| `index-2026-05-23.html` | 2026-05-23 | Pre-WebP-refactor design. 3,295 lines. Self-contained: Tailwind CDN, inline `tailwind.config` (iOS green palette `#34C759`), inline `<style>` (~200 lines with Polaroid keyframes), ~620 lines of inline JS. Sections present that aren't in current `src/index.src.html`: Problem + Vision, Interactive Planner static demo, "How It Works · Polaroid loop", Mobile Sticky Bar. Feature names diverged: "Chi tiết địa điểm", "Lập kế hoạch cuối tuần", "Chỉ đường thông minh", "Review từ phụ huynh". |

## How to use

Open in browser directly (`open docs/legacy/index-2026-05-23.html`) — most things will render because the file is self-contained (Tailwind CDN, inline CSS). Lucide icons require internet.

Do **not** copy markup directly into `src/index.src.html` without adapting:
- Replace `<i data-lucide="...">` with SVG from `partials/icons.svg`
- Replace arbitrary hex colors (`bg-[#34C759]`) with current Tailwind tokens (`bg-primary`) — note the shades differ slightly
- Port any required CSS from inline `<style>` into `src/input.css` or `assets/css/`
