---
version: alpha
name: Garal-cartera
description: >-
  Tu Cartera, the personal investment portfolio app of the Garal brand. A calm, warm data workspace:
  a solid green sidebar, a cream canvas and white bordered cards. Headlines and money figures are set
  in Playfair Display, notes in Lora italic, and the interface in DM Sans. Green means gain and brand,
  plum means loss; amber and the rest of the earthy palette exist for data series only.

colors:
  primary: "#2D6A5A"
  moss: "#4a7a5a"
  plum: "#8a3a6a"
  plum-light: "#c47aab"
  amber: "#c4956a"
  amber-light: "#e8c890"
  umber: "#6a5a4a"
  jade: "#5aaa8a"
  bg: "#f7f3ee"
  surface: "#ffffff"
  surface-sunken: "#faf7f3"
  surface-open: "#fdfbf8"
  segmented-track: "#efe9e2"
  border: "#ece7e1"
  border-2: "#f5f0eb"
  ink: "#221e1a"
  ink-2: "#6a5a4a"
  muted: "#a09080"
  positive-bg: "#eaf2ee"
  negative-bg: "#f6ebf1"
  sell-bg: "#fdeef5"
  notice-bg: "#fdf6ee"
  sidebar: "#2D6A5A"
  sidebar-active: "rgba(255,255,255,.16)"
  sidebar-hover: "rgba(255,255,255,.08)"
  sidebar-border: "rgba(255,255,255,.15)"

typography:
  figure-hero:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: 60px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.02em
  title-card:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: 20px
    fontWeight: 700
  title-brand:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: 19px
    fontWeight: 700
  title-selector:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: 17px
    fontWeight: 700
  figure-tile:
    fontFamily: Playfair Display, Georgia, serif
    fontSize: "34px / 22px / 15px (by tile size)"
    fontWeight: 700
  note:
    fontFamily: Lora, Georgia, serif
    fontSize: 14px
    fontStyle: italic
  note-sm:
    fontFamily: Lora, Georgia, serif
    fontSize: 12px
    fontStyle: italic
  gain-lg:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 20px
    fontWeight: 700
  body:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
  ui:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 13px
    fontWeight: 400
  meta:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 400
  eyebrow:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 700
    letterSpacing: 0.1em
    textTransform: uppercase
  table-head:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 11px
    fontWeight: 700
    letterSpacing: 0.1em
    textTransform: uppercase
  badge:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 9px
    fontWeight: 700

rounded:
  bar: 3px
  badge: 4px
  pill: 6px
  segment: 7px
  control: 8px
  segmented-track: 9px
  panel: 10px
  card: 14px

spacing:
  page-x: 40px
  page-top: 36px
  page-bottom: 56px
  page-max: 1240px
  section-gap: 28px
  card-padding: 24px
  row-comfortable: 16px
  row-compact: 10px
  sidebar: 200px
  sidebar-collapsed: 64px

components:
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "#ffffff"
    width: "{spacing.sidebar} (collapsible to {spacing.sidebar-collapsed} from lg)"
  sidebar-item:
    textColor: "rgba(255,255,255,.7)"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: 10px 12px
  sidebar-item-active:
    backgroundColor: "{colors.sidebar-active}"
    textColor: "#ffffff"
  topbar:
    backgroundColor: "{colors.surface}"
    border: "1px bottom, {colors.border}"
    padding: 14px 40px
  card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  detail-panel:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.panel}"
    padding: 16px 20px
  button-primary:
    backgroundColor: "{colors.primary}"
    hoverBackgroundColor: "{colors.moss}"
    textColor: "#ffffff"
    typography: "{typography.ui} at weight 500"
    rounded: "{rounded.control}"
    padding: 8px 16px
  button-ghost:
    backgroundColor: transparent
    border: "1px solid {colors.border}"
    hoverBorderColor: "{colors.primary}"
    textColor: "{colors.ink-2}"
    typography: "{typography.ui} at weight 500"
    rounded: "{rounded.control}"
    padding: 8px 16px
  input:
    backgroundColor: "{colors.bg}"
    border: "1px solid {colors.border}"
    focusBorderColor: "{colors.primary}"
    focusRing: "0 0 0 2px rgba(45,106,90,.12)"
    rounded: "{rounded.control}"
    padding: 8px 12px
  segmented-control:
    backgroundColor: "{colors.segmented-track}"
    rounded: "{rounded.segmented-track}"
    padding: 3px
  segmented-option:
    textColor: "{colors.ink-2}"
    typography: "12px, weight 500"
    rounded: "{rounded.segment}"
    padding: 6px 12px
  segmented-option-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    shadow: "0 1px 2px rgba(34,30,26,.12)"
  change-pill-positive:
    backgroundColor: "{colors.positive-bg}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 3px 9px
  change-pill-negative:
    backgroundColor: "{colors.negative-bg}"
    textColor: "{colors.plum}"
    rounded: "{rounded.pill}"
    padding: 3px 9px
  asset-badge:
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: 2px 7px
---

## Overview

Tu Cartera is a tool the owner opens to answer three questions, in this order: how much the portfolio is worth and how much it has gained or lost, how it is split, and how each position is doing. Every screen should answer its questions in that kind of order, biggest first.

The atmosphere is **calm, warm and precise**. A solid **green sidebar** (`{colors.sidebar}`) holds the brand and navigation. The working area sits on a **cream canvas** (`{colors.bg}`) with **white cards** outlined by a warm hairline (`{colors.border}`). Money is set in **Playfair Display**, so the important numbers read like a printed statement, and the interface is quiet **DM Sans**.

**Key Characteristics:**
- Green is both the brand and "gain". Plum is "loss". This pairing is the core semantic of the app; never swap it for red/green.
- Earthy data palette (green, amber, plum, moss, sand, umber, jade, pink, taupe) used for charts and composition tiles, in a fixed order.
- Bordered, nearly flat surfaces. Depth comes from cream vs white and from hairline borders, not from shadows.
- Numbers first: tabular figures, Spanish formats, U+2212 minus sign.
- UI copy is in Spanish (`lang="es"`); code, tokens and this document are in English.
- Tailwind CSS v4 with tokens declared in `app/globals.css` (`:root` and `@theme`).

## Colors

### Brand & Semantic
- **Primary** (`{colors.primary}` — #2D6A5A): Sidebar, primary buttons, focus rings, links, scrollbar thumb, and every positive figure (`.rent-pos`).
- **Moss** (`{colors.moss}` — #4a7a5a): Hover state of the primary button. Fourth data series.
- **Plum** (`{colors.plum}` — #8a3a6a): Negative figures (`.rent-neg`), "Vender" actions, the "current portfolio" series in charts.
- **Amber** (`{colors.amber}` — #c4956a): Second data series, the minimum-variance point, and zero returns (`.rent-zero`). Fill or large text only (see contrast).

### Surface
- **Bg** (`{colors.bg}` — #f7f3ee): Page canvas, input background, scrollbar track.
- **Surface** (`{colors.surface}` — #ffffff): Cards, topbar, dropdowns, active segmented option.
- **Surface Sunken** (`{colors.surface-sunken}` — #faf7f3): Detail panels inside cards, hovered table row, move cards.
- **Surface Open** (`{colors.surface-open}` — #fdfbf8): The expanded table row.
- **Segmented Track** (`{colors.segmented-track}` — #efe9e2): Background of every segmented control.

### Text
- **Ink** (`{colors.ink}` — #221e1a): Headlines, figures and primary text. A warm near-black, never pure black.
- **Ink 2** (`{colors.ink-2}` — #6a5a4a): Secondary text, ghost buttons, inactive segmented options, chart legends.
- **Muted** (`{colors.muted}` — #a09080): Metadata, eyebrows, table headers, axis ticks. Large or non-essential text only (see contrast).

### Lines & tints
- **Border** (`{colors.border}` — #ece7e1): Card outlines, table header rules, inputs, chart axes.
- **Border 2** (`{colors.border-2}` — #f5f0eb): Row separators and chart grid lines.
- **Positive Bg / Negative Bg** (#eaf2ee / #f6ebf1): Fills of the change pills.
- **Sell Bg** (#fdeef5) and **Notice Bg** (#fdf6ee): "Vender" chips and the exclusions notice.

### Data palette (fixed order)

Used for composition tiles, position color bars and any multi-series chart. Assign by weight, largest first; restart after the ninth.

| # | Fill | Text on fill |
|---|---|---|
| 1 | `#2D6A5A` primary | `#ffffff` |
| 2 | `#c4956a` amber | `#221e1a` |
| 3 | `#8a3a6a` plum | `#ffffff` |
| 4 | `#4a7a5a` moss | `#ffffff` |
| 5 | `#e8c890` amber-light | `#221e1a` |
| 6 | `#6a5a4a` umber | `#ffffff` |
| 7 | `#5aaa8a` jade | `#10231d` |
| 8 | `#c47aab` plum-light | `#221e1a` |
| 9 | `#a09080` muted | `#221e1a` |

The efficient-frontier chart uses named roles instead: frontier = primary, minimum variance = amber, current portfolio = plum, chosen point = ink.

### Asset badges

| Class | Background | Text | Use |
|---|---|---|---|
| `.badge-accion` | #eaf3de | #27500a | Stock |
| `.badge-etf` | #e6f1fb | #0c447c | ETF |
| `.badge-fondo` | #f0eaf8 | #5b2d8a | Fund |
| `.badge-otro` | #f5f2ee | #6a5a4a | Other |
| `.badge-sector` | #eef5f2 | primary | Sector |
| `.badge-pais` | #fdf3ea | amber | Country |
| `.badge-moneda` | #f5f2ee | ink-2 | Currency |

These are the only cool hues (blue, violet) in the system, and they stay inside badges.

### Measured contrast (WCAG 2.1)

| Pair | Ratio | Use |
|---|---|---|
| ink on white | 16.6 | Default text on cards |
| ink on bg | 15.0 | Default text on canvas |
| plum on white | 7.3 | Negative figures |
| ink-2 on white | 6.6 | Secondary text |
| white on primary | 6.3 | Sidebar, primary button, tile 1 |
| primary on white | 6.3 | Positive figures, links |
| plum on negative-bg | 6.2 | Negative pill |
| ink on amber | 6.2 | Tile 2 |
| primary on positive-bg | 5.6 | Positive pill |
| ink-2 on segmented-track | 5.5 | Inactive segmented option |
| white on moss | 5.0 | Primary button hover, tile 4 |
| asset badges (stock/ETF/fund) | 8.2–8.6 | Asset type badges |
| muted on white | 3.1 | Metadata (fails AA for small text) |
| muted on bg | 2.8 | Metadata on canvas (fails AA) |
| amber on white | 2.7 | `.rent-zero` (fails AA) |
| amber on #fdf3ea | 2.4 | `.badge-pais` (fails AA) |

## Typography

### Font Family
- **Display / figures:** Playfair Display 700/800 (`font-serif`). Card titles, the portfolio selector, the brand name and every headline amount.
- **Notes:** Lora italic (`font-lora italic`). Period descriptions ("en lo que va de año"), the sidebar subtitle, short asides.
- **Interface:** DM Sans 400/500/700 (`font-sans`, the body default). Everything else.
- Fonts load from Google Fonts in `app/globals.css`.

### Hierarchy

| Token | Size | Weight | Family | Use |
|---|---|---|---|---|
| `figure-hero` | 60px, lh 1, -0.02em | 700 | Playfair | Total portfolio value |
| `title-card` | 20px | 700 | Playfair | Card titles ("Composición", "Posiciones") |
| `title-brand` | 19px | 700 | Playfair | Sidebar name |
| `title-selector` | 17px | 700 | Playfair | Portfolio selector in the topbar |
| `figure-tile` | 34 / 22 / 15px | 700 | Playfair | Weight inside composition tiles, by tile size |
| `gain-lg` | 20px | 700 | DM Sans | Absolute gain next to the total |
| `note` | 14px italic | 400 | Lora | Period description |
| `body` | 14px | 500 | DM Sans | Table cells, instrument names, detail values |
| `ui` | 13px | 400–500 | DM Sans | Buttons, inputs, nav items, card subtitles |
| `meta` | 12px | 400 | DM Sans | Ticker · type, "n títulos", metric labels |
| `eyebrow` | 12px, 0.1em, uppercase | 700 | DM Sans | Block labels ("Valor de la cartera") |
| `table-head` | 11px, 0.1em, uppercase | 700 | DM Sans | Column headers |
| `badge` | 9px | 700 | DM Sans | Asset and metadata badges, `.section-label` |

### Principles
- Money and headings are Playfair; anything you click or scan is DM Sans.
- Lora italic is for a short human aside, never for data.
- Uppercase is reserved for eyebrows, table headers and the sidebar footer, always with tracking.
- Use `tabular-nums` on any column or value that changes.

### Number formats (es-ES)
- Currency: `Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 2, useGrouping: 'always' })` → "15.852,00 €", "436,20 US$".
- Signs: "+" or "−" (U+2212, never a hyphen). Percentages carry a space: "+34,25 %".
- Weights: one decimal, "18,4 %".
- Prices stay in the quote currency; portfolio values are in EUR.
- **Privacy mode** replaces portfolio amounts with "••••• €". Unit prices and percentages stay visible.

## Layout

### App shell
- Two columns: sidebar (`{spacing.sidebar}`, collapsible to a `{spacing.sidebar-collapsed}` rail from `lg`) + content. The sidebar is sticky full height on desktop and a drawer below `lg`.
- Topbar: white, bottom border, 14px 40px padding. Portfolio selector and freshness on the left; actions on the right (ghost buttons, then one primary "+ Añadir movimiento").
- Content: padding 36px 40px 56px, max width 1240px, 28px between blocks.

### Spacing
Tailwind's 4px scale. Recurring values: 2–3px (segmented track), 8–12px (inner gaps), 16px (row padding, comfortable), 10px (row padding, compact), 24px (card padding and table gutters), 28px (between blocks), 40px (page gutter).

### Density
A user setting switches table rows between comfortable (16px vertical padding) and compact (10px). New tables must honor it.

## Elevation & Depth

Nearly flat. Depth comes from:
1. **Canvas vs card:** white bordered cards on cream.
2. **Sunken panels:** `{colors.surface-sunken}` inside a card for details.
3. **Hairlines:** `{colors.border}` outlines, `{colors.border-2}` separators.

Shadows are allowed only for things that float or are "pressed up": the active segmented option (`0 1px 2px rgba(34,30,26,.12)`), dropdowns (`shadow-sm`), chart tooltips (`0 2px 8px rgba(0,0,0,.06)`), and the input focus ring.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.bar}` | 3px | Position color bars (8×32px) |
| `{rounded.badge}` | 4px | Badges |
| `{rounded.pill}` | 6px | Change pills |
| `{rounded.segment}` | 7px | Segmented option |
| `{rounded.control}` | 8px | Buttons, inputs, nav items, treemap tiles |
| `{rounded.segmented-track}` | 9px | Segmented track |
| `{rounded.panel}` | 10px | Detail panels, nested tables, heatmaps, `.card` utility |
| `{rounded.card}` | 14px | Top-level content cards |

Rule: the bigger the surface, the larger the radius. No full pills.

## Components

### Sidebar
Solid primary background, white text. Header: name in `title-brand`, "mi cartera" in Lora italic 12px at 65% white. Nav items at 70% white; hover adds `{colors.sidebar-hover}`; active uses `{colors.sidebar-active}` and weight 500. Icon-only collapse toggle in the header's top-right.

### Value block
Eyebrow, `figure-hero` total, then a row with `gain-lg` absolute gain, the change pill and the Lora period note. Period segmented control (1M, 3M, 6M, YTD, 1A, Total; default YTD) on the right, with "Invertido" and "Plusvalía realizada" under it.

### Card
`{component.card}`: white, 1px border, 14px radius, 24px padding. Header: `title-card` title, a 13px muted subtitle, controls on the right. The `.card` utility in `globals.css` (10px radius) is used for small cards, forms, dropdowns and the auth card.

### Composition treemap
Squarified treemap, 340px tall (240px on mobile), tiles with 2px gap and 8px radius in the data palette order. Name shows when the tile is wider than 60px and taller than 56px; weight shows when wider than 50px and taller than 34px. Hover is linked with the positions table: non-matching tiles drop to 0.3 opacity, rows to 0.45, over 0.15s.

### Positions table
Columns Instrumento · Precio · Cantidad · Valor · Rentabilidad. Instrument cell: 8×32px color bar, name in `body`, "ticker · type" in `meta`. Return: % in 14px/700 with the gain below at 12px and 0.8 opacity, green or plum. One expanded row at a time, on `{colors.surface-open}`, with a `{component.detail-panel}` grid of label/value pairs and a "Ver movimientos de {ticker} →" link.

### Buttons
- **Primary** (`.btn-primary`): primary fill, white text, hover to moss. One per area at most.
- **Ghost** (`.btn-ghost`): border only, ink-2 text; hover turns the border primary and the text ink.
- Disabled: 0.4 opacity.

### Segmented control
`{component.segmented-control}` with `{component.segmented-option}` buttons. The active option is white with ink text and the small shadow. Used for periods, grouping, sorting and chart tabs.

### Inputs
`.input-dark`: canvas fill, border, 8px radius, primary border and soft ring on focus. Autofilled (read-only) values use `.input-autofill`: dashed primary border on a 6% primary tint.

### Charts (Recharts)
Grid lines `{colors.border-2}`, axes `{colors.border}`, ticks `{colors.muted}` at 11px. Tooltips are white cards with a border and the tooltip shadow. Legends are 12px ink-2. Heatmaps sit in a 10px bordered frame with ink values.

## Motion

- Interaction transitions are 150ms (buttons, inputs, linked hover opacity); the sidebar width and drawer animate over 200ms ease-in-out.
- No entrance animations, no parallax, no decorative motion inside the app. This is a tool; numbers must be readable immediately.
- The public landing is the exception (see Landing).
- Any new animation must respect `prefers-reduced-motion`.

## Landing

The public page at `/` (`app/page.tsx`, `components/landing/`). Visitors with a session cookie go straight to `/dashboard`; everyone else sees the landing. Styles live in `components/landing/landing.css` (`lp-` prefix) and reuse the tokens above.

- **Idea:** the composition treemap, the app's own picture of a portfolio, sits inside the headline as if it were a word: "Tu cartera, [treemap] de un vistazo".
- **Ground:** `#f4f1ea` (`--lp-bg` in `landing.css`), the paper tone of the Garal personal site, slightly deeper than the app's `{colors.bg}`. Only the landing uses it.
- **Type:** Playfair Display for headings at display scale (hero up to 120px, 7.5vw; tracking -0.04em), DM Sans for everything else. Lora appears only inside app fragments.
- **Sections:** nav (wordmark, "Qué hace", primary "Entrar") → hero (headline top-left and one sentence bottom-right, no buttons: each action appears once on the first screen; below `lg` the hero sizes to its content and the sentence returns to the left edge) → "Lo que ves al entrar" (one row per feature, a statement beside a live fragment of the app; rows alternate between split, wide and flipped so neighbours never share a layout, and stack below `lg`) → green close ("¿Ya tenés cuenta?" with "Entrar" or "Crear cuenta") → a quiet footer row on the same green ("Garal · Cartera" and "Seguimiento de tu cartera de inversión"). No oversized wordmark.
- **App fragments:** built from the real components (`Treemap`, `SegmentedControl`, `PositionRow`, `FronteraChart`) and fed by `components/landing/sample-portfolio.ts` through the dashboard's own calculations, so the figures add up. They are labelled as a sample portfolio.
- **Motion:** the hero treemap opens with a clip-path shutter; headings, text and fragments rise 24px with opacity as they enter. Content stays visible without JavaScript, and `prefers-reduced-motion` removes all of it.

## Do's and Don'ts

### Do
- Answer the screen's main question first, in the largest type.
- Use green for gain and plum for loss, everywhere, including charts.
- Use the data palette in its fixed order.
- Keep white cards on the cream canvas with hairline borders.
- Format numbers with es-ES rules and the U+2212 minus sign.
- Honor privacy mode and the density setting in every new view.
- Write UI copy in Spanish from Spain, plainly, addressing the user as tú ("tienes", "elige", "regístrate"). Never voseo ("tenés", "elegí").
- Present the app as a tool to follow your own investments. Never call it or its owner a "gestor de carteras" or anything that sounds like managing other people's money or giving advice.

### Don't
- Don't use red for losses or a generic blue for links or actions.
- Don't introduce new hues outside the data palette and the asset badges.
- Don't add gradients, glassmorphism or decorative shadows.
- Don't set data in Lora or interface labels in Playfair.
- Don't use `{colors.muted}` or amber for small essential text; they fail contrast.
- Don't use pure black or neutral grey; text colors are warm.
- Don't hardcode hex values in new code; use the tokens (`bg-primary`, `text-ink-2`, `var(--color-border)`).

## Responsive Behavior

| Width | Key changes |
|---|---|
| < 768px | Table shows only Instrumento and Rentabilidad; the rest moves to the expanded row. Treemap 240px tall. |
| < 1024px | Sidebar becomes a drawer; the period control drops under the total. |
| ≥ 1024px | Sticky sidebar, collapsible to a 64px rail. |
| ≥ 1280px | Reference desktop width the screens were designed for. |

Grids drop columns instead of shrinking cards. Keep touch targets at least 40px tall on mobile.

## Iteration Guide

1. Reference tokens, never raw hex. In code use the Tailwind theme names from `app/globals.css` (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `bg-primary`, `font-serif`, `font-lora`).
2. When a new token is needed, add it to both `:root` and `@theme` in `app/globals.css` and to this file in the same change.
3. Reuse the shared components in `components/ui` (`SegmentedControl`, `KpiCard`, `Treemap`, `PositionsTable`) before creating new ones.
4. One primary button per area; group secondary actions as ghost buttons.
5. This file is the source of truth for the visual identity of this app. When an installed design skill (such as `design-taste-frontend`) proposes a different palette, font or radius system, this file wins.
6. The original screen spec lives in `design_handoff_tu_cartera/`. This file supersedes it where they differ.

## Known Gaps

- `{colors.muted}` fails WCAG AA for small text on white (3.1) and on the canvas (2.8), yet it is the most used text color for metadata. Darken it before adding more text that uses it.
- `.rent-zero` (amber on white, 2.7) and `.badge-pais` (2.4) fail contrast.
- `.section-label` and badges use 9px text, below a comfortable reading size.
- Two card radii coexist: the `.card` utility is 10px and top-level cards use 14px inline. Unify them into a token.
- Many components still hardcode hex values (`#ece7e1`, `#a09080`, `#2D6A5A`) and inline styles instead of tokens.
- Tokens are declared twice (`:root` and `@theme`); they can drift.
- One-off tints (`#fdeef5`, `#fdf6ee`, `#faf8f5`, `#eef5f2`, `#fdf3ea`) have no named token.
- No dark theme. The sidebar is the only dark surface.
- The Garal personal site (`/Users/javi/workspace/portfolio/DESIGN.md`) uses a different identity (forest #123a2f, gold accent, Bricolage Grotesque). The two brands are not unified yet.
