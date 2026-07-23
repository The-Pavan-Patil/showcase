# Components

## Component inventory

| Component | Contract | Implemented with |
| --- | --- | --- |
| Container | Centers content, applies responsive gutters, caps width at 72rem | Portfolio-owned div |
| SectionHeading | Eyebrow, required title, optional muted phrase and description | Portfolio-owned semantic composition |
| SiteHeader | Direction-aware desktop glass shell plus persistent mobile destination and utility layers | Semantic header/nav plus HeroUI Popover |
| ThemeToggle | Toggles persisted light/dark selection in icon or labeled-menu presentation | HeroUI Button |
| Button and link variants | Primary, secondary, inverse, icon, text, social, and navigation treatments | Semantic links and HeroUI Button |
| Proof metrics | Four evidence-led facts with value/label pairing | Semantic content grid |
| ProjectGrid / ProjectCard | One featured card and two supporting cards sourced from shared records | CSS grid plus HeroUI Card and Chip |
| ProjectVisual | Honest abstract diagram with one accessible image label | Portfolio-owned composition |
| ExperienceTimeline | Chronological roles and verified highlights | Article list |
| SkillsGroup | Categorized skill chips | HeroUI Card and Chip |
| About | Biography, education evidence, and résumé download | Portfolio-owned section |
| Contact CTA | Direct email and approved social destinations | Semantic links |
| SiteFooter | Home, section, social, copyright, and stack links/text | Semantic footer/nav |
| CaseStudyHero | Title, summary, technologies, facts, and project visual | Portfolio-owned composition plus HeroUI Chip |
| Metric cards | Three verified qualitative or quantitative project facts | Definition-like content grid |
| Case narrative | Challenge, approach, and outcome sequence | Semantic articles |
| Media gallery | Approved product media with captions and useful alternative text | Deferred optional enhancement; add after approved media is supplied |
| Contribution card | Verified first-person contribution list | Semantic list |
| Next-project navigation | Cycles through the shared project collection | Next.js Link |

## Global component rules

### Container

Use Container as the first child of full-width sections. Full-width background, border, or overflow belongs to the section; alignment and gutters belong to Container. Do not place a second width-constrained wrapper inside it without a specific reading-width reason.

### SectionHeading

Provide one concise eyebrow and a sentence-case title. The optional muted phrase creates a two-tone continuation, not a separate heading. The component renders h2, so do not use it where the page needs h1 or h3.

### SiteHeader

The header is portfolio-owned because HeroUI v3 has no Navbar. It remains a semantic header containing labeled nav elements and lists. Above 760px, it uses an expanded 60px regular-glass pill capped at 64rem. After the page is below 96px and 24px of downward movement accumulates, it compresses to 48px and approximately 44rem. Sixteen pixels of upward travel, returning within 64px of the top, a route change, or keyboard focus entering the header restores the expanded state.

At 760px and below, the desktop header is absent. A safe-area-aware bottom glass pill permanently exposes Work, Experience, About, and Contact with icons above labels; the current destination receives a softly tinted inner capsule. A separate utility orb opens a HeroUI Popover for Home, labeled theme selection, and résumé download. Footer clearance prevents either surface from covering the final actions.

On the homepage, an IntersectionObserver tracks the Work, Experience, About, and Contact sections. The matching desktop and mobile link receives aria-current="location". On /work/[slug] routes, Work is current. Active destinations use the accessible blue text role plus an inner capsule; focus retains a separate visible outline.

The responsive navigation must:

- keep all four section destinations visible in expanded and compact desktop states;
- use a passive, requestAnimationFrame-coordinated scroll listener;
- expose utility-orb state through a named, keyboard-focusable trigger;
- close the Popover on Escape, outside interaction, destination choice, or theme selection;
- use one glass layer per surface, with a solid fallback when transparency is reduced or unsupported;
- never duplicate visible desktop and mobile navigation at the same breakpoint.

### ProjectCard

The card displays its project index, an abstract visual, evidence-led copy, up to four technologies, and one explicit “View case study” link. Only the link is navigational; the card is not a hidden full-surface link. All data comes from the same ProjectCaseStudy record used by the route.

The featured first card may use a larger visual and heading, but its content hierarchy must remain identical to the supporting cards.

### ProjectVisual

ProjectVisual supports sync, web, and operations variants. The outer element exposes role="img" and a meaningful project-specific label. Inner visual details are aria-hidden. Treat these compositions as explanatory illustrations, not proof of a literal product interface.

### Case-study components

Case studies use the same order:

1. Back link.
2. Hero with role, experience context, client/company, technologies, and visual.
3. Three project facts.
4. Challenge, approach, and outcome.
5. Verified contribution list.
6. Next project.

Do not add new one-off page sections unless the shared project type and all three records can represent them honestly.

## Interaction-state matrix

Every interactive component must be evaluated in all eight states below. The matrix records the current authored behavior; HeroUI primitives also supply internal interaction semantics that must be verified visually after library upgrades.

| Component | Default | Hover | Pressed | Focus-visible | Disabled | Dark theme | Mobile | Reduced motion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Brand / home link | Foreground wordmark and inverse mark | No separate visual change | No separate styling; navigation is immediate | Global 2px focus outline | Links are not disabled; remove destination rather than fake it | Tokens invert the mark | Name hides at 760px; mark remains | No moving effect |
| Desktop nav link | Muted label in a centered inner capsule; current location uses accent text and a tinted item capsule | Foreground and stronger surface | Immediate link activation; no transform | Global focus outline | Not applicable | Token-driven glass | Hidden at 760px | Density and color changes become immediate |
| Résumé download | Foreground-filled pill with icon and label | −1px lift and 0.86 opacity | Returns to baseline and lowers opacity to 0.72 | Global focus outline | Remove if unavailable | Token inversion retains contrast | Moved into utility Popover | Label compression and lift are suppressed |
| Theme toggle | Muted circular icon button or labeled menu row | Secondary surface and foreground icon | HeroUI button semantics | Global focus plus HeroUI semantics | Not used | Label/icon describe the next theme | Labeled inside utility Popover | State change is immediate |
| Utility orb | Labeled circular ellipsis control | Stronger edge highlight and surface | HeroUI press semantics | Global focus plus Popover focus restoration | Not used | Token-driven glass | Adjacent to bottom destination pill | Transition duration collapses |
| Mobile nav link | Icon above compact label; current location uses accent text and a tinted inner capsule | Stronger text/surface where hover exists | Immediate destination activation | Global focus outline | Not applicable | Token-driven glass | Persistent at 760px and below | No authored movement |
| Primary CTA | #006FEE pill with white text | −2px lift | Returns to baseline and scales to 0.98 | Global focus outline | Custom link has no disabled form; remove if unavailable | Same action blue in both themes | Shares row, then full width at 420px | Lift and transitions suppressed |
| Secondary / email CTA | Bordered or inverse pill | Lift/border feedback on hero secondary | Hero secondary returns to baseline and scales to 0.98; contact email scales to 0.98 | Global focus outline | Links have no disabled form | Semantic tokens/inverse contact surface | Wraps safely; direct email uses anywhere wrapping at 420px | Authored transitions suppressed |
| Project case-study link | Text and arrow in card footer | Arrow moves 2px up/right; parent card lifts | No separate styling; navigation is immediate | Link gets global focus and parent card receives matching focus-within elevation | Not applicable | Card/surface tokens adapt | Single-column card layout | Card and arrow motion suppressed |
| Text / back link | Compact text and arrow | Text-link arrow moves right; back link changes color | No separate styling; navigation is immediate | Global focus outline | Not applicable | Token-driven | Layout remains inline and wraps naturally | Arrow movement suppressed |
| Social / footer external link | Muted or inverse pill text with external icon | Contact pills strengthen border/text; footer links change to foreground | Contact pills scale to 0.98; plain footer links navigate immediately | Global focus outline | Remove unavailable destination | Token-driven; contact stays inverse | Contact links share width; footer wraps | Color and transform transitions are suppressed |
| Next-project link | Label, large headline, arrow | Arrow moves 5px right | No separate styling; navigation is immediate | Global focus outline | Not applicable while projects exist | Token-driven | Becomes two columns with label spanning both | Arrow movement suppressed |

## State implementation contract

### Default

The semantic element, accessible name, target size, and contrast must work without hover. A card may never depend on pointer movement to reveal its only action.

### Hover

Hover feedback is a secondary enhancement. Use color, border, arrow displacement, or at most a 4px lift. Do not reveal required text on hover.

### Pressed

Button-like links use a clear active response: résumé feedback returns to baseline, and primary, secondary, email, and contact-social pills scale to 0.98. Plain text navigation may remain visually stable because activation navigates immediately.

### Focus-visible

All focusable controls receive a 2px focus-color outline with 3px offset. Project cards add focus-within elevation equivalent to hover so keyboard users receive the same grouping cue.

### Disabled

Use the native/HeroUI disabled API for buttons. A disabled button must not fire, enter the tab order, or rely on opacity alone. Links do not have a native disabled state: omit the link, render explanatory text, or implement a documented aria-disabled pattern with event prevention only when omission is impossible.

### Dark theme

Use semantic tokens exclusively. Never implement dark mode by opacity inversion or a CSS filter. Recheck text, focus, borders, diagrams, and shadows in both themes.

### Mobile

Maintain a minimum 24px target under WCAG 2.5.8; aim for 36–48px for primary controls. Avoid hover-only state and protect 320px layouts from horizontal overflow.

### Reduced motion

All authored transitions and animations collapse to 0.01ms under prefers-reduced-motion: reduce. Meaning and state changes must remain visible without movement.

## Do / don’t

| Do | Don’t |
| --- | --- |
| Use a real Link for navigation and a Button for an action. | Add click handlers to a non-interactive div. |
| Keep one explicit CTA per project card. | Make nested links inside a clickable card surface. |
| Preserve Popover dismissal/focus semantics and persistent section links. | Hide primary mobile destinations inside an unlabelled overlay. |
| Give icon-only controls an action-oriented aria-label. | Use an icon name such as “moon” as the accessible label. |
| Verify HeroUI slot selectors after library upgrades. | Assume a visual override still applies after a package update. |
