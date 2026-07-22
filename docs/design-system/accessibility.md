# Accessibility

WCAG 2.2 AA is the release baseline. Accessibility applies to content accuracy, semantics, keyboard interaction, contrast, motion, responsive reflow, and testing—not only automated audit scores.

## Semantic structure

- Keep one h1 per page: the homepage hero title or the case-study title.
- SectionHeading renders h2; experience items use h3.
- Use header, nav, main, section, article, aside, footer, ul/ol, and dl according to meaning.
- Every section referenced by aria-labelledby must point to an existing heading id.
- Navigation groups require distinct accessible labels: Primary navigation, Mobile navigation, and Footer navigation.
- Keep the “Skip to main content” link as the first body focus target.
- Use links for destinations and buttons for state changes.

## Names and descriptions

- Icon-only controls need a verb-led accessible name: “Switch to dark theme,” “Open navigation menu,” and “Close navigation menu.”
- Decorative Lucide icons use aria-hidden.
- ProjectVisual exposes one role="img" label describing the system relationship; its internal pseudo-interface is aria-hidden.
- External-link icons are decorative. Link text or aria-label names the destination.
- Technology collections expose a project-specific aria-label.

## Keyboard behavior

Required test path:

1. Tab from the skip link into the header.
2. Reach every desktop control without pointer input.
3. Open, traverse, and close the mobile Drawer by keyboard.
4. Confirm focus is trapped while the Drawer is open and restored to its trigger on close.
5. Reach every project CTA, résumé/email/social destination, and next-project link.
6. Confirm Enter activates links and Enter/Space activates buttons.
7. Confirm focus remains visible against every surface in both themes.

The global focus-visible treatment is a 2px focus-token outline with a 3px offset. Do not remove it. Elevated components should also use focus-within when their pointer hover changes the entire surface.

## Contrast

Text below 24px regular or 18.66px bold needs at least 4.5:1. Large text needs at least 3:1. UI boundaries and focus indicators need at least 3:1 against adjacent colors.

Current measured audit:

| Usage | Ratio | Status |
| --- | --- | --- |
| #18181B on #F5F5F5 | 16.25:1 | Pass |
| #6B6B73 on #FFFFFF | 5.28:1 | Pass |
| #6B6B73 on #F5F5F5 | 4.84:1 | Pass |
| #005FC5 on #FFFFFF | 6.10:1 | Pass |
| #005FC5 on #F5F5F5 | 5.59:1 | Pass |
| #FFFFFF on #006FEE | 4.66:1 | Pass |
| #9F9FA9 on #060607 | 7.72:1 | Pass |
| #9F9FA9 on #18181B | 6.75:1 | Pass |
| #FAFAFA on #060607 | 19.40:1 | Pass |
| #4BA8FF on #060607 | 8.05:1 | Pass |
| #4BA8FF on #18181B | 7.04:1 | Pass |
| #66B5FF on #18181B | 8.11:1 | Pass |
| #005FC5 on #FAFAFA | 5.84:1 | Pass |

Action fill, text accent, decorative accent, and inverse-surface accent are separate roles. Preserve that split when adding components. Re-test color-mix results, status colors, contact-card copy, focus rings, and diagram microcopy with rendered styles.

## Target size and reflow

- WCAG 2.5.8 requires at least 24 by 24 CSS pixels or sufficient spacing; primary targets should aim for 36–48px.
- Current icon controls are 36px square and primary hero actions are 48px tall.
- Support 320px without horizontal page scrolling.
- Text must remain usable at 200% zoom and with browser text spacing overrides.
- Email text may wrap at the narrow breakpoint.
- Content order must remain meaningful when grids collapse.

## Motion

No comprehension depends on motion. Under prefers-reduced-motion: reduce, smooth scrolling is disabled and all authored transition/animation durations collapse to 0.01ms. Hero diagrams remain static and fully understandable.

The reduced-motion stylesheet disables smooth scrolling and collapses authored transition and animation durations. Browser emulation of the preference remains part of the release suite; the interface contract must remain complete without movement.

## Themes

- Light is the deterministic default; there is no automatic system-theme switch.
- The selected theme is persisted.
- The initial server/client render must not flash the incorrect theme.
- Theme selection cannot be the only way to reach adequate contrast; both themes must independently pass.
- The ThemeToggle label always describes the action that will happen next.

## Current implementation audit

### Implemented

- Skip link, html language, semantic page landmarks, and labeled navigation.
- One primary page heading and ordered section headings.
- Labeled icon buttons and aria-hidden decorative icons.
- HeroUI Drawer and Button primitives for mobile navigation and theme state.
- Browser-verified Drawer keyboard behavior: focus enters the dialog, Escape closes it, and focus returns to the trigger.
- Homepage section observation and case-study routing expose the current destination with aria-current="location" in desktop and mobile navigation.
- Global focus-visible outline.
- Matching project-card hover and focus-within elevation.
- Meaningful labels for abstract project visuals.
- Minimum 320px layout, responsive grid collapse, and reduced-motion CSS.
- Direct visible text for email, résumé, GitHub, and LinkedIn actions.
- AA-passing core muted, accent-text, action, and inverse-accent color pairs.
- Explicit pressed feedback for button-like links and hover feedback for contact social pills.

### Known gaps

No open accessibility gaps remain in the current foundation audit. Continue to run the release checks below as the implementation changes.

New-tab destinations are correctly named by destination and secured with noopener/noreferrer. A visible “opens in a new tab” convention is optional usability enhancement rather than a current WCAG failure.

## Release checks

- Run semantic/unit tests and automated axe checks.
- Complete keyboard-only desktop and mobile navigation passes.
- Test both themes at 320px, 760px, 1024px, and a wide desktop.
- Test reduced motion, 200% zoom, text spacing, and high-contrast/forced-color behavior.
- Run Lighthouse accessibility and manually validate anything automation cannot judge.
- Do not release with a serious or critical automated accessibility finding.
