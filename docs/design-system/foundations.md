# Foundations

## Color system

Semantic variables live in src/app/globals.css. Components must use semantic roles rather than hard-coded theme colors unless the color communicates a stable status.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| background | #F5F5F5 | #060607 | Page canvas |
| foreground | #18181B | #FAFAFA | Primary text and inverse surfaces |
| surface | #FFFFFF | #18181B | Cards, popovers, and contained regions |
| surface-secondary | #EEEEEF | #232325 | Subtle fields, tags, and diagram panels |
| surface-tertiary | #E7E7E9 | #2A2A2D | Quiet controls and diagram details |
| muted | #6B6B73 | #9F9FA9 | Secondary copy and metadata |
| border | #DEDEE0 | #28282C | Dividers and component outlines |
| accent | #0D7377 | #0D7377 | Filled actions and selected controls |
| accent-text | #0A5C5F | #5EEAD4 | Accessible teal text and small labels |
| accent-foreground | #FFFFFF | #FFFFFF | Text on accent fills |
| accent-bright | #14919B | #14919B | Decorative glow only |
| accent-soft | #E6F4F4 | #0A2E30 | Quiet selected or informative surfaces |
| inverse-accent | #5EC8CC | #0A5C5F | Teal text on the inverse contact surface |
| focus | #0D7377 | #5EEAD4 | Focus-visible outline |

Status green is a limited exception. Availability uses #22C55E, and success labels use coordinated light and dark foreground/background pairs. Do not use green as a second brand color.

### Contrast notes

Measured ratios for core pairs:

| Pair | Ratio | Result |
| --- | --- | --- |
| light foreground on light background | 16.25:1 | Pass |
| light muted on white surface | 5.28:1 | Pass for normal text |
| light muted on light background | 4.84:1 | Pass for normal text |
| light accent-text on white surface | 7.75:1 | Pass for normal text |
| light accent-text on light background | 7.11:1 | Pass for normal text |
| white on action accent | 5.62:1 | Pass for normal text |
| dark foreground on dark background | 19.40:1 | Pass |
| dark muted on dark background | 7.72:1 | Pass |
| dark accent-text on dark background | 13.69:1 | Pass |
| dark accent-text on dark surface | 11.98:1 | Pass |
| light inverse-accent on light inverse surface | 8.95:1 | Pass |
| dark inverse-accent on dark inverse surface | 7.43:1 | Pass |

Decorative accent-bright must not carry text or state by itself. See [Accessibility](./accessibility.md) before changing foreground roles.

### Do / don’t

| Do | Don’t |
| --- | --- |
| Use accent for a primary action or selected control. | Use action teal for paragraphs or small labels. |
| Use accent-text for eyebrows, code labels, and other teal text. | Use decorative accent-bright for text. |
| Use muted for supporting information on page or surface backgrounds. | Reduce muted text opacity below the verified token value. |
| Use borders and surface changes for quiet grouping. | Rely on low-opacity color alone to separate required content. |
| Keep status colors semantic and pair them with text. | Communicate status through color alone. |

## Typography

Inter is the body and UI family. Manrope is the display and brand family. Both are loaded through next/font with swap rendering and CSS variables.

| Role | Family | Current size | Weight / treatment |
| --- | --- | --- | --- |
| Hero heading | Manrope | clamp(48px, 5.25vw, 72.8px) | 560, −0.065em, 0.98 line height |
| Mobile hero heading | Manrope | clamp(44.8px, 14vw, 65.6px) | Same display treatment |
| Section heading | Manrope | clamp(36px, 4vw, 48px) | 560, −0.055em, 1.03 line height |
| Case-study heading | Manrope | clamp(56px, 7vw, 91.2px) | 560, −0.065em |
| Card heading | Manrope | 24.8px; 32px for featured desktop card | 620, compact leading |
| Body | Inter | 14.4–16.6px by context | Regular, 1.65–1.75 line height |
| UI / metadata | Inter | 10.4–14px | 600–800 |
| Eyebrow | Inter | 12px | 750, uppercase, 0.11em tracking |
| Code diagram | System monospace | 12.8px desktop | Normal with semantic syntax color |

Display headings use tight tracking and short line lengths. Body copy uses a comfortable line height and usually caps between 36rem and 42rem.

Use sentence case for headings and controls. Uppercase is reserved for short eyebrows and diagram micro-labels. Do not use Manrope for long paragraphs or Inter for a large editorial headline unless an accessibility requirement demands a fallback.

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
| container-page | 72rem | Maximum shared page width |
| radius | 8px | Base control/detail radius |
| radius-card | 20px | Standard card and metric group |
| radius-feature | 24px | Featured card and mobile major panel |
| radius-panel | 32px | Contact and contribution panels |
| radius-pill | 999px | Pill actions and circular controls |
| motion-fast | 150ms | Compact interaction feedback |
| motion-base | 220ms | Card elevation and standard transitions |
| motion-slow | 300ms | Reserved bounded overlay/layout transition |

Major containers, cards, panels, pills, and interaction transitions consume these semantic tokens. Reuse an existing role before adding another token.

## Layout

- Page container: maximum 72rem through container-page.
- Desktop page gutter: 1.25rem on each side.
- Mobile page gutter at 760px and below: 1rem on each side.
- Header shell: maximum 64rem within the page.
- Minimum supported viewport: 320px.
- Anchor offset and section scroll margin: 7rem to clear the fixed header.
- Homepage project layout: 12 columns, 1rem gap; the first card spans 12 and the remaining cards span 6.
- Homepage hero: two columns above 1024px, stacked below.
- Case-study hero: 1.45 / 0.55 columns on wide screens, then one column at 760px.

Breakpoints are component-driven rather than device-named:

| Breakpoint | Purpose |
| --- | --- |
| 1024px | Stack the hero; simplify featured card and experience layout |
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

Two semantic shadows are implemented:

- **shadow-card:** quiet separation for standard cards.
- **shadow-float:** stronger separation for the fixed header, floating hero windows, active project cards, and diagram frames.

Dark-theme shadows increase opacity because black elevation needs more separation from dark surfaces. Use borders with shadows; shadow alone is not a reliable boundary.

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
