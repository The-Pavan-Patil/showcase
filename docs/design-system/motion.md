# Motion

Motion is restrained and functional. It confirms an interaction or clarifies layering; it does not create a second visual narrative.

## Timing

| Token / duration | Use |
| --- | --- |
| motion-fast · 150ms | Navigation color, skip-link reveal, résumé feedback |
| 160–180ms optical range | CTA, text-arrow, underline, and next-project feedback |
| motion-base · 220ms | Project-card lift and elevation |
| motion-slow · 300ms | Reserved for future bounded overlays or layout transitions |

The semantic range is 150–300ms, with current visible interactions concentrated between 150ms and 220ms.

## Easing

- Use ease for color, border, opacity, and simple icon displacement.
- Use cubic-bezier(0.2, 0.8, 0.2, 1) for card elevation.
- Avoid spring or elastic easing for hiring-critical navigation and reading flows.

## Implemented transformations

| Interaction | Transformation |
| --- | --- |
| Skip link focus | Slides into view from above |
| Résumé hover | Translates up 1px |
| Primary/secondary CTA hover | Translates up 2px |
| Résumé press | Returns to baseline and reduces opacity |
| Primary/secondary CTA press | Returns to baseline and scales to 0.98 |
| Project card hover or focus-within | Translates up 4px and increases shadow |
| Project CTA icon hover | Moves 2px right and 2px up |
| About résumé arrow hover | Moves 3px right |
| Contact email/social press | Scales to 0.98 |
| Next-project arrow hover | Moves 5px right |
| Hero composition | Static rotations only; no animation |

Static rotations on hero windows communicate layered workspaces. They are not animated and are removed from the main window at the mobile breakpoint.

## Reduced motion

The global prefers-reduced-motion: reduce rule:

- disables smooth scrolling;
- reduces transition and animation durations to 0.01ms;
- limits animation iteration to one.

No state may rely only on transform. Color, border, text, or shadow must continue to communicate the result when movement is removed.

CSS inspection verifies the reduced-motion contract: smooth scrolling is removed and transition/animation durations collapse. The automated browser suite must emulate the preference before production release. Drawer keyboard QA confirmed focus enters the dialog, Escape closes it, and focus returns to the menu trigger.

## Motion contract

- Trigger motion only after direct user interaction.
- Keep movement within the component’s local area.
- Pause or avoid any future auto-running animation.
- Never animate résumé evidence, metric values, or body copy into delayed visibility.
- Do not use parallax, scroll-jacking, cursor-following effects, looping glows, rotating borders, or heavy 3D.

## Do / don’t

| Do | Don’t |
| --- | --- |
| Move an arrow a few pixels to confirm direction. | Animate an entire section to explain that a link is clickable. |
| Pair card elevation with a persistent visible CTA. | Reveal the CTA only during hover. |
| Make the reduced-motion view complete and immediate. | Replace an animation with a long opacity fade. |
| Use static system diagrams for product architecture. | Run looping pipeline or orbit animations behind text. |
