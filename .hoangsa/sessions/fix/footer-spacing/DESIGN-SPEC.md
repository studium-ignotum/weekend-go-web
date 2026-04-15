---
spec_version: "1.0"
project: "Cuối Tuần Đi Đâu — Website"
component: "footer_spacing"
language: "HTML5 + Tailwind CSS"
task_type: "fix"
category: "content"
status: "draft"
---

## Overview
[fix]: Footer — spacing bugs in 4 locations

### Goal
Fix 4 specific spacing issues in the redesigned footer that make it look cramped.

### Context
Previous task `fix/footer-redesign-hierarchy` redesigned the footer with 3-col grid + new hierarchy. Visual review of the rendered result revealed 4 spacing issues that affect the breathing room between sections.

### Requirements
- [REQ-01] Brand col: visible gap between description paragraph and "Sản phẩm của" label
- [REQ-02] Brand col: visible gap between "Sản phẩm của" label and Unknown Studio logo
- [REQ-03] Right col: "Về chúng tôi" divider line balanced with surrounding spacing (not visually disconnecting)
- [REQ-04] Bottom: copyright bar has more breathing room above and below the divider line

### Out of Scope
- Layout structure (3-col grid)
- Color/typography
- Adding/removing content
- Responsive behavior

---

## Deliverables

| Deliverable | Format | Location | Description |
|------------|--------|----------|-------------|
| Spacing fixes | HTML class changes | `index.html` lines 1193–1353 | 4 targeted Tailwind class edits |

## Style & Guidelines

### Exact class changes

| # | Element | Old classes | New classes | REQ |
|---|---------|------------|------------|-----|
| 1 | Brand col `<div>` (outermost) | `space-y-5` | `space-y-6` | REQ-01 |
| 2 | Studio credit `<div>` | `pt-1` | `pt-2` | REQ-01 |
| 3 | "Sản phẩm của" `<p>` | `text-xs text-gray-600 uppercase tracking-widest mb-2` | `text-xs text-gray-600 uppercase tracking-widest mb-3` | REQ-02 |
| 4 | "Về chúng tôi" wrapper `<div>` | `pt-1 border-t border-white/10` | `pt-5 border-t border-white/10` | REQ-03 |
| 5 | "Về chúng tôi" `<a>` | `flex items-center gap-2.5 ... mt-4` | `flex items-center gap-2.5 ...` (remove `mt-4`) | REQ-03 |
| 6 | Copyright wrapper `<div>` | `border-t border-white/10 mt-12 pt-6 text-center` | `border-t border-white/10 mt-16 pt-8 text-center` | REQ-04 |

---

## Implementations

### Affected Files

| File | Action | Description | Impact |
|------|--------|-------------|--------|
| `index.html` | MODIFY | 6 class attribute edits in footer block (lines 1193–1353) | N/A — self-contained |

---

## Acceptance Criteria

### Per-Requirement

| Req | Verification | Expected Result |
|-----|-------------|----------------|
| REQ-01 | grep `class="space-y-6"` near brand col | matches |
| REQ-01 | grep `class="pt-2"` for studio credit wrapper | matches |
| REQ-02 | grep `mb-3">Sản phẩm của` | matches |
| REQ-03 | grep `pt-5 border-t border-white/10` | matches; old `pt-1 border-t border-white/10` absent |
| REQ-03 | "Về chúng tôi" anchor has no `mt-4` class | grep `Về chúng tôi` block — no `mt-4` |
| REQ-04 | grep `border-t border-white/10 mt-16 pt-8` | matches; old `mt-12 pt-6` absent |

### Overall
1. All 6 grep checks above return success
2. Visual: open `index.html` in browser, footer breathes more naturally
