---
name: 99999999-design
description: Use this skill to generate well-branded interfaces for 99999999. Contains colors, type, fonts, assets, and UI kit for prototyping ecommerce UIs.
user-invocable: true
---

# 99999999 Design Skill

Read `README.md` first — it holds the brand context, content fundamentals, and visual foundations everything else builds on. For usage: in static HTML prototyping, copy assets and reuse markup from `preview/` and `ui_kits/ecommerce/` directly, while production code should consume tokens from `colors_and_type.css` / `css.json` instead of copying preview markup.

## Quick map

- `README.md` — brand context, content fundamentals, visual foundations (read first)
- `colors_and_type.css` — drop-in CSS variables for colors, type, radius, shadow, spacing
- `css.json` — structured token understanding source
- `components/index.json` — component index + cross-component patterns
- `components.css` — aggregated component CSS from preview pages
- `uikit-plan.json` — component whitelist and UIKit planner output
- `library-consumption.json` — recommended downstream read order
- `preview/` — small HTML cards illustrating foundations and components (6 files: button, card, product-card, cart, navigation, input)
- `ui_kits/ecommerce/` — full click-thru recreation

## Essentials at a glance

- Primary color `#A98443` (champagne gold, `--lux-gold-600`) — warm, restrained, the only saturated note on the ivory `#FAF8F4` canvas with near-black ink `#26221D` text.
- Radius: `--radius-sm: 2px`, `--radius-md: 4px` (`--radius-lg` mirrors 4px), `--radius-full: 9999px` — near-square corners keep the precision of luxury; the pill is reserved for badges and status chips.
- Control heights: buttons 36/44/52px (`--size-button-sm/md/lg`), inputs 48px (`--size-input-height`); spacing is 4px-based (`--space-1: 4px` through `--space-8: 64px`).
- Font faces: Cormorant Garamond (display/headings) + Jost (body), both imported from Google Fonts; JetBrains Mono covers `--font-mono`.
- Voice/tone: Chinese-first light-luxury copy — 新品登场 / 臻品推荐 / 加入购物袋 / 会员礼遇 / 结算 — understated and refined, never emoji.
- Shadow philosophy: whisper-soft in 5 levels (`--shadow-1` 0 1px 2px rgba(38,34,29,.04) → `--shadow-5` 0 20px 48px rgba(38,34,29,.10)) — elevation is suggested, never announced.
- Brand quirk: champagne gold is reserved for add-to-bag / checkout CTAs only; every other surface stays ink-on-ivory with hairline borders.

## Components

| Slug | Name | Key Insight |
| --- | --- | --- |
| button | Button | champagne-gold CTA is the single saturated element on the ivory canvas |
| card | Card | hairline border plus generous padding — the card breathes |
| product-card | ProductCard | price in tabular serif; hover whispers — opacity, never bounce |
| cart | Cart | hairline dividers only; subtotal in tabular serif; gold checkout at the end |
| navigation | Navigation | centered serif wordmark over letter-spaced caption menu |
| input | Input | underline fields keep the canvas clean; focus turns the hairline gold |
