# Foundations

## Color system

The palette follows v6.usestate.org: a monochrome set of greys with one violet (`--brand-main`, #B45EFF) kept for focus rings and decorative highlights. Brand values are declared once as `--brand-*` and `--gray-*` in src/app/globals.css; components consume the semantic roles below, never the brand values directly.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| background | #EFEFEF | #111111 | Page canvas |
| foreground | #1B1B1B | #EFEFEF | Primary text and inverse surfaces |
| surface | #E6E6E6 | #1B1B1B | Cards, tiles, and contained regions (one tone step from the canvas) |
| surface-secondary | #DEDEDE | #272727 | Secondary buttons, chips, selection capsules |
| surface-tertiary | #CFCFCF | #393939 | Hover and pressed tone for quiet controls |
| muted | #5A5A5A | #A3A3A3 | Secondary copy and metadata |
| border | #C1C1C1 | #393939 | Form fields, timelines, and list rows only |
| accent | #1B1B1B | #EFEFEF | Filled actions and selected controls (ink) |
| accent-text | #1B1B1B | #EFEFEF | Selected text |
| accent-foreground | #EFEFEF | #1B1B1B | Text on accent fills |
| accent-bright | #B45EFF | #B45EFF | Decorative only |
| accent-soft | #DEDEDE | #272727 | Quiet selected or informative surfaces |
| inverse-accent | #C1C1C1 | #515151 | Secondary text on the inverse contact surface |
| focus | #B45EFF | #B45EFF | Focus-visible outline |
| selection | #383838 / #FFFFFF | same | Text selection |

Status green is a limited exception. Availability uses #22C55E, and success labels use coordinated light and dark foreground/background pairs. Project cards keep each project's own colours.

### Contrast notes

| Pair | Ratio | Result |
| --- | --- | --- |
| light foreground on light background | 14.98:1 | Pass |
| light muted on light background | 6.0:1 | Pass for normal text |
| light muted on light surface | 5.4:1 | Pass for normal text |
| dark foreground on dark background | 16.42:1 | Pass |
| dark muted on dark surface | 6.83:1 | Pass |
| inverse-accent on light inverse surface | 9.57:1 | Pass |
| focus violet on light background | 3.05:1 | Pass for non-text (focus ring) |
| focus violet on dark background | 5.38:1 | Pass |

The violet must not carry text on the light theme. See [Accessibility](./accessibility.md) before changing foreground roles.

### Do / don’t

| Do | Don’t |
| --- | --- |
| Use accent (ink) for the primary action or a selected control. | Introduce a second hue for actions. |
| Separate surfaces with a tone step (background → surface). | Separate sections with hairlines or shadows. |
| Use muted for supporting information. | Set running text in muted grey. |
| Keep status colors semantic and pair them with text. | Communicate status through color alone. |

## Typography

Lato is the body and UI family (300, 400, 700). Figtree (variable 300–900) is the display family. Noto Sans JP covers Japanese. All load through next/font with swap rendering and CSS variables (`--font-sans`, `--font-display`; `--font-mono` maps to Figtree for keyboard keycaps). Michroma (`--font-michroma`) is kept only for the footer PAVAN watermark. Montserrat (variable, `--font-hero`) sets only the homepage hero copy.

| Role | Family | Size | Treatment |
| --- | --- | --- | --- |
| Hero heading | Montserrat | clamp(44px, min(6.3vw, 12svh), 108px); clamp(24px, 7.4vw, 40px) at 760px and below | 800, −0.035em, line height 0.95, uppercase, centred; two parts on two lines at every width, both in solid ink. The hero description is Montserrat too; Montserrat is used nowhere else |
| Page heading | Figtree | clamp(48px, 5.25vw, 72.8px) | Case-study and Setup heroes; 500, −0.04em, line height 1, uppercase |
| Section heading | Figtree | `--title-section`: clamp(32px, min(4vw, 7svh), 48px) | 500, −0.04em, line height 1, uppercase |
| Stage heading | Figtree | `--title-stage`: clamp(24px, min(2.6vw, 4.6svh), 36.8px) | Section headings inside a pinned one-screen scene (Work, Experience) |
| Article heading | Figtree | clamp(27.5px, 3.1vw, 40.8px) | 500, −0.04em, sentence case |
| Stat figure | Figtree | 24px | 500, −0.04em, uppercase |
| Section intro | Lato | `--text-intro`: 17px | The paragraph under a section heading; 1.6 line height |
| Body | Lato | 15–18px by context | 400, 1.6 line height, full ink |
| Nav, buttons, labels | Lato | 13–14px | 400–700, uppercase, no tracking; desktop nav wrapped in ( ) |
| Code | System monospace | 12.8px | Real code only |

### Heading rules

- Centre a heading only when it stands alone on the screen with nothing beside it to read along: the homepage hero, the About display word, and the Setup closing quote. Left-align every heading that introduces content to read or scan, on the same left edge as that content.
- A section heading uses the section size; inside a pinned scene it uses the stage size. Do not give a section its own heading size.
- A heading is one colour. The `.heading-muted` span inherits the heading ink.
- Every h1 and h2 uses balanced line breaks, so no line ends on a single word. Section intros use `text-wrap: pretty`.

Nothing meant to be read is set below 13px; the drawn interface mock-ups inside project visuals are the exception. Uppercase never carries letter-spacing. Project card titles stay in their written case because the WebGL dust scene redraws them on canvas without text-transform.

## Spacing

The intended rhythm is based on 4px. Use multiples from the following core scale for new work:

| Step | Value | Typical use |
| --- | --- | --- |
| 1 | 4px | Icon/text micro-gap |
| 2 | 8px | Compact control padding |
| 3 | 12px | Tag and control gaps |
| 4 | 16px | Standard inset and grid gap |
| 6 | 24px | Card and content grouping |
| 8 | 32px | Section subgroups |
| 12 | 48px | Large composition gap |
| 16 | 64px | Desktop group separation |
| 20 | 80px | Major vertical interval |
| 22 | 88px | Mobile section block |
| 32 | 128px | Desktop section block |

The current CSS includes optical exceptions such as 10.4px, 14.4px, and 20.8px. These are component refinements, not new spacing tokens. Core layout, radius, and motion decisions are semantic CSS tokens; local diagram details may retain optical one-off values.

## Core structural tokens

| Token | Value | Contract |
| --- | --- | --- |
| container-page | 2700px | Maximum shared page width (full bleed below it) |
| page-gutter | 40px; 20px at 767px and below | Outer page margin on both sides |
| grid-gap | 10px | Gap between tiles in stat and card grids |
| radius | 8px | Base control/detail radius |
| radius-card | 20px | Standard card and metric group |
| radius-feature | 24px | Featured card and mobile major panel |
| radius-panel | 32px | Contact and contribution panels |
| radius-pill | 999px | Pill actions and circular controls |
| pill-height | 48px | Minimum height of every pill action |
| title-section | clamp(32px, min(4vw, 7svh), 48px) | Section heading size |
| title-stage | clamp(24px, min(2.6vw, 4.6svh), 36.8px) | Section heading size inside a pinned scene |
| text-intro | 17px | Paragraph under a section heading |
| motion-fast | 150ms | Compact interaction feedback |
| motion-base | 220ms | Card elevation and standard transitions |
| motion-slow | 300ms | Reserved bounded overlay/layout transition |

Major containers, cards, panels, pills, and interaction transitions consume these semantic tokens. Reuse an existing role before adding another token.

## Layout

- Page container: full width minus page-gutter on each side, capped at container-page.
- Page gutter: 40px on desktop, 20px at 767px and below.
- Header shell: spans the page container; compact state narrows to 48rem.
- Minimum supported viewport: 320px.
- Anchor offset and section scroll margin: 7rem to clear the fixed header.
- Homepage project layout: 12 columns, 1rem gap; the first card spans 12 and the remaining cards span 6.
- Homepage hero: one centred column that fills the first screen.
- Case-study hero: 1.45 / 0.55 columns on wide screens, then one column at 760px.

Breakpoints are component-driven rather than device-named:

| Breakpoint | Purpose |
| --- | --- |
| 1024px | Stack the case-study hero; simplify featured card and experience layout |
| 760px | Switch to mobile navigation; collapse major grids |
| 420px | Protect narrow visuals, CTAs, and email wrapping |

## Radius

| Role | Token / current value |
| --- | --- |
| Base | radius · 8px |
| Small icon tile | approximately 10px optical exception |
| Diagram controls | 8–16px local values |
| Standard card | radius-card · 20px |
| Featured card / mobile major panel | radius-feature · 24px |
| Major panel | radius-panel · 32px |
| Buttons and circular controls | radius-pill · 999px |

Use larger radii for major surfaces and pills for actions. Avoid mixing several radii inside one small component.

## Elevation

- **shadow-card:** none. Resting surfaces separate by tone, not shadow.
- **shadow-float:** only for things that genuinely float: the fixed header, the mobile tab bar and utility orb, popovers, and the article-map preview.

No glass: floating bars use an opaque background instead of backdrop blur.

## Iconography

Lucide icons are used consistently. Typical UI sizes are 13–19px, with 26px reserved for next-project navigation. Decorative icons use aria-hidden. Icons never replace an accessible name; icon-only buttons carry an aria-label.

## Theme behavior

The site uses next-themes with a class on the html element:

- Default theme is light.
- User selection is persisted by next-themes.
- System theme selection is deliberately disabled.
- suppressHydrationWarning protects the server-rendered html class.
- Theme-change transitions are disabled to avoid a full-page color sweep.
- CSS color-scheme is light or dark to align browser-native rendering.

Components must consume semantic tokens so theme switching does not require component-specific logic. The only theme-aware UI logic is the toggle icon and accessible label.
