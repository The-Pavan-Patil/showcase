# Web Design Guidelines Audit & Remediation Plan

Audit date: 2026-10-19

Scope: homepage, setup page, case-study pages, global navigation, theme/language utilities, launch intro, anonymous message composer, responsive behavior, accessibility, and performance.

Guideline baseline: the current Vercel Web Interface Guidelines fetched from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` on the audit date.

## Executive Summary

The portfolio has a strong visual foundation: clear hierarchy, consistent spacing and card language, restrained color use, good light/dark parity, semantic landmarks, a skip link, localized copy, visible global focus treatment, safe-area handling for the mobile bar, and comprehensive reduced-motion CSS.

Release should still be blocked on the homepage until the virtual keyboard regression is fixed. Axe reports critical unnamed-button failures across all homepage locales and the mobile utility/launch-intro states. Lighthouse confirms the same issue and also shows that the first-load intro and eagerly loaded media keep the homepage below the 0.90 performance budget.

## Verification Evidence

- `npm run typecheck`: pass.
- `npx eslint src tests --max-warnings=0`: pass.
- `npm run lint`: fail because ESLint now traverses installed files under `.agents/skills`; 3 errors and 7 warnings come from Taste Skill assets/scripts, not application source.
- Playwright axe audit on Chromium and mobile Chromium: 10 passed, 9 failed, 3 intentionally skipped. All 9 failures share the virtual keyboard's unnamed buttons as the root cause. Case-study routes pass in both themes.
- Lighthouse CI, 3 runs per route:
  - Homepage: performance 0.55–0.83, accessibility 0.95, best practices 1.00, SEO 1.00.
  - Nudge: performance 0.88–0.89, accessibility/best practices/SEO 1.00.
  - Philips Greenheart: performance 0.90, accessibility/best practices/SEO 1.00.
  - Workforce Management: performance 0.86–0.90, accessibility/best practices/SEO 1.00.
- Homepage Lighthouse details: 4.1 s LCP with 89% render delay, 4,862 KiB transferred, 1,000 DOM elements, 2,662 KiB keyboard audio, and roughly 1,727 KiB of below-fold source imagery used by the ASCII canvases.
- Existing desktop/mobile visual baselines show a consistent, polished composition. The mobile utility popover is visually dense and competes with both the fixed navigation and the hero controls when open.

## Findings

### P0 — Release Blocking

#### `src/components/ui/keyboard.tsx`

- `src/components/ui/keyboard.tsx:865` — `Key` renders a button without a guaranteed accessible name; axe reports critical `button-name` failures.
- `src/components/ui/keyboard.tsx:937` — `ModifierKey` has the same unnamed-button defect.
- `src/components/ui/keyboard.tsx:593` — decorative Touch ID key is rendered as an unnamed action button even though it has no action or `keyCode`.
- `src/components/ui/keyboard.tsx:841` — virtual keys implement mouse handlers but no activation path for Enter/Space; the native button `click` path is not wired to the virtual-key action.
- `src/components/ui/keyboard.tsx:913` — modifier keys repeat the pointer-only interaction pattern.

Recommended direction: treat the keyboard as an optional visual/pointer enhancement rather than adding roughly 80 sequential tab stops. Keep the labelled textarea and a real submit button as the primary accessible interaction. For any virtual keys that remain interactive, provide a discernible localized name, wire the native `click` event so Enter/Space works, remove decorative pseudo-buttons, and use either a documented roving-focus model or exclude duplicate controls from sequential focus without hiding focusable elements from assistive technology.

Acceptance:

- No `button-name` or keyboard-operability violations.
- A keyboard-only user can enter and submit a message without traversing the full visual keyboard.
- Touch/pointer users retain the optional key animation.
- The virtual keyboard has no decorative `<button>` elements.

### P1 — High Impact

#### `src/components/launch-terminal.tsx`

- `src/components/launch-terminal.tsx:63` — the fullscreen launch dialog is visible by default on a user's first pageview.
- `src/components/launch-terminal.tsx:100` — the scripted sequence intentionally blocks the portfolio for several seconds; Lighthouse measures the hero text as the LCP at 4.1 s with 3.6 s of render delay.
- `src/components/launch-terminal.tsx:155` — the modal does not make the background application inert or manage initial/return focus, so the underlying page remains in the accessibility tree during the intro.
- `src/components/launch-terminal.tsx:21` — loading copy uses three periods instead of the ellipsis character.

Plan:

1. Make the portfolio content the immediate first paint. Prefer an inline/non-modal intro, an opt-in replay, or a sub-1-second non-blocking flourish.
2. If the dialog is retained, focus the Skip control on open, trap focus, make background content inert, support Escape, and restore focus on close.
3. Keep the reduced-motion bypass and session-level replay suppression.
4. Update the visual/e2e tests so the genuine first-load path has an explicit performance and focus contract rather than being skipped by most baselines.

Acceptance:

- Median homepage LCP is below 2.5 s under the Lighthouse CI profile.
- First-time visitors can see and interact with the portfolio immediately.
- The intro exposes only its own controls while open and has a deterministic focus lifecycle.

#### `src/components/ui/keyboard.tsx` and `src/components/ascii-art.tsx`

- `src/components/ui/keyboard.tsx:278` — mounting the message section immediately fetches and decodes a 2.5 MiB audio sprite, before any user gesture.
- `src/components/ascii-art.tsx:25` — each below-fold ASCII canvas eagerly loads its full source image on mount.
- `src/components/ascii-art.tsx:98` — loading is not gated by viewport proximity; two source AVIF files transfer about 0.85 MiB each.
- `src/components/ui/keyboard.tsx:532` — the full key-by-key DOM contributes materially to the homepage's 1,000-element DOM.

Plan:

1. Initialize `AudioContext` and fetch the audio sprite only after the first intentional keyboard interaction; consider a smaller sprite or disabling sound by default.
2. Lazy-load ASCII inputs with `IntersectionObserver`, or replace them with precomputed low-resolution/static ASCII assets.
3. Reduce decorative keyboard DOM where it does not affect the experience.
4. Re-measure total transfer size, main-thread work, DOM size, and LCP after each change.

Acceptance:

- No keyboard audio request occurs before a user interacts with the message experience.
- Below-fold ASCII sources do not download during the initial viewport load.
- Homepage transfer and DOM size no longer trigger Lighthouse's enormous-payload and excessive-DOM warnings.
- All four configured routes meet the 0.90 Lighthouse performance threshold in three-run CI.

#### `src/components/quick-message-section.tsx`

- `src/components/quick-message-section.tsx:157` — the message textarea has a visible label but no meaningful `name` or autocomplete policy.
- `src/components/quick-message-section.tsx:143` — the form has no visible submit control even though localized `Send message` copy already exists; submission depends on Return or the custom keyboard.
- `src/components/quick-message-section.tsx:163` — placeholder copy neither uses the ellipsis character nor provides an example pattern.

Plan:

1. Add `name="message"` and an intentional `autoComplete` value.
2. Add a visible localized submit button with clear pending text and preserve inline status/error messaging.
3. Keep the submit control enabled until the request starts, then show a contained pending state.
4. Retain Enter as a shortcut without making it the only discoverable submission path.

Acceptance:

- The form is understandable and operable without the custom keyboard.
- Form submission, pending, success, rate-limit, and delivery-error states have browser tests.
- The first invalid field receives focus and errors remain adjacent to the composer.

#### `src/components/site-header.tsx`

- `src/components/site-header.tsx:560` — the trigger declares `aria-haspopup="menu"`.
- `src/components/site-header.tsx:584` — the popup uses `role="menu"`, but contains ordinary links, a language control, and theme toggle buttons without menu-item roles or menu keyboard behavior.
- `src/components/site-header.tsx:328` — Escape closes the popup but does not explicitly restore focus to the trigger after focus has moved inside.

Plan:

1. Model the utility surface as a labelled non-modal popover/dialog or plain disclosure, not an ARIA menu.
2. Move focus into the surface on open when appropriate, close on Escape/outside press, and return focus to the trigger.
3. Verify the open panel does not obscure the currently focused control and simplify the mobile layering if possible.

Acceptance:

- Semantics match the interaction pattern.
- Open, Tab/Shift+Tab, Escape, outside-click, theme selection, and language navigation are tested.
- Focus visibly returns to the utility trigger on dismissal.

### P2 — Guideline Alignment & Polish

#### `src/app/_pages/home/_components/project-card.tsx` and `src/components/site-footer.tsx`

- `src/app/_pages/home/_components/project-card.tsx:68` — CTA `aria-label` does not include the visible “View case study” wording, triggering Lighthouse `label-content-name-mismatch` and making voice activation less reliable.
- `src/components/site-footer.tsx:21` — footer brand naming also triggers the label/content mismatch audit.

Plan: make visible text a contiguous part of each accessible name. Prefer visible text plus visually hidden context over replacing visible text with an unrelated `aria-label`.

#### `src/app/globals.css`

- `src/app/globals.css:78` — `overscroll-behavior: none` is applied to all input types instead of only fine-pointer contexts, disabling native mobile pull-to-refresh/scroll chaining.
- `src/app/globals.css:86` — the body repeats the global overscroll suppression.
- `src/app/globals.css:107` — tap highlight is intentionally set, but interactive elements do not set `touch-action: manipulation`.
- `src/app/globals.css:1438` — major headings do not use `text-wrap: balance`; supporting prose does not use `text-wrap: pretty`.

Plan:

1. Keep page-level overscroll suppression only inside `@media (pointer: fine)` and test hybrid/touch hardware behavior.
2. Add `touch-action: manipulation` to appropriate links/buttons without breaking custom drag/scroll interactions.
3. Add balanced heading wrapping and pretty body wrapping selectively, then update visual baselines.

#### `src/lib/ui-copy.ts`

- `src/lib/ui-copy.ts:376` — English placeholder uses `...` instead of `…`.
- `src/lib/ui-copy.ts:380` — English pending copy uses `...` instead of `…`.
- `src/lib/ui-copy.ts:639` and `src/lib/ui-copy.ts:643` — Japanese placeholder/pending copy use `...`.
- `src/lib/ui-copy.ts:902` and `src/lib/ui-copy.ts:906` — German placeholder/pending copy use `...`.

Plan: replace three periods with the ellipsis character and keep the localized messages concise. Preserve the project's documented sentence-case voice as an explicit project convention rather than converting the entire product to generic Title Case.

### P3 — Tooling & Documentation

#### `eslint.config.mjs`

- Repository lint now includes third-party skill sources under `.agents/skills`, so `npm run lint` fails independently of product quality.

Plan: exclude `.agents/**` and other generated/tool-owned directories from application linting, or scope the lint script to owned source/test/config paths.

#### `docs/design-system/accessibility.md`

- The “Known gaps” section currently says no gaps remain, while the checked-in implementation fails critical axe rules.

Plan: update the audit status only after fixes land. Record the virtual-keyboard interaction model, popup focus behavior, first-load intro contract, and exact release commands. Avoid static “no gaps” claims unless the document records the verification date and commit.

## Delivery Sequence

1. **Accessibility stop-ship:** resolve virtual-key semantics/activation, add the real form submit path, repair popup semantics/focus, and fix label/content name mismatches.
2. **First-load performance:** remove launch-intro blocking, defer keyboard audio, lazy-load/precompute ASCII art, and reduce decorative DOM.
3. **Responsive interaction polish:** correct overscroll/touch behavior, validate safe areas and focus visibility, and refine mobile utility layering.
4. **Copy and typography:** normalize ellipses, improve wrapping, and document the sentence-case exception.
5. **Guardrails:** exclude skill sources from lint, refresh accessibility docs, expand focus/first-load tests, update visual baselines, and rerun the complete release matrix.

## Release Gate

Do not mark the remediation complete until all of the following pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npx playwright test tests/e2e/a11y.spec.ts --project=chromium --project=mobile-chromium`
- Keyboard-only desktop and mobile passes, including launch intro, utility popover, composer, and all persistent navigation.
- 320 px, 390 px, 760 px, 1024 px, and wide-desktop visual/reflow checks in both themes.
- Reduced motion, 200% zoom, text spacing, and forced-colors/high-contrast checks.
- `npm run test:lighthouse` with every route meeting the configured performance, accessibility, best-practices, and SEO thresholds.

## Implementation Status — 2026-10-20

Implemented. The complete on-screen keyboard remains rendered at every supported viewport.

- Virtual keys now have explicit accessible names and native button activation; the decorative Touch ID key is no longer exposed as an empty control.
- The textarea and visible localized submit button provide the primary sequential keyboard path, while physical and pointer key presses continue to animate the full virtual keyboard.
- Keyboard audio initializes only after a user interaction, and below-fold ASCII source images begin loading only near the viewport. Neither resource appears in the initial Lighthouse request set.
- The launch terminal is a brief, non-modal status surface, so meaningful page content is available immediately.
- The quick-message form, mobile utility dialog, accessible-name mismatches, touch behavior, wrapping, and ellipsis copy were remediated.
- Application lint excludes installed skill sources, accessibility documentation is current, and visual baselines were refreshed.
- Global HeroUI styles were removed from the critical path in favor of the three native semantic elements the site actually needs. English routes also use a platform-native Japanese fallback stack instead of shipping a Japanese webfont stylesheet globally.

Verification passed:

- `npm run lint`
- `npm run typecheck`
- `npm test` — 116 tests
- Desktop/mobile Chromium UI and axe suite — 68 passed, 8 intentionally skipped by viewport
- Visual regression suite — 10 passed, 2 intentionally skipped by viewport
- Lighthouse CI — three runs per route; performance 0.90–0.95 and accessibility, best practices, and SEO all 1.00

