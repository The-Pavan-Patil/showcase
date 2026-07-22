# Portfolio release evidence

**Review date:** 2026-07-22

**Target:** Vercel preview, then production after the remaining browser-audit gates pass

**Runtime target:** Node.js 24 LTS

This file records evidence rather than intent. A configured test is not marked as passing until it has run in an environment with its required browser runtime.

## Completed checks

| Gate | Result | Evidence |
| --- | --- | --- |
| ESLint | Pass | `npm run lint` completed with zero warnings. |
| Generated route types and TypeScript | Pass | `npm run typecheck` completed successfully. |
| Unit/component tests | Pass | 17 tests across five files passed. |
| Coverage | Pass | 96.55% statements, 100% branches, 90.9% functions, and 100% lines against the configured thresholds. |
| Production build | Pass | Next.js statically generated `/`, three `/work/[slug]` routes, `/robots.txt`, `/sitemap.xml`, and `/icon.svg`. |
| Dependency audit | Pass | `npm audit` reported zero known vulnerabilities after scoped transitive overrides. |
| Route and asset probe | Pass | Public pages, robots, sitemap, Open Graph PNG, favicon, and résumé returned 200; an unknown project returned 404. |
| Desktop rendered review | Pass | 1440×900 light rendering had one h1, one main landmark, no horizontal overflow, valid canonical/OG metadata, and no browser console warnings or errors. |
| Narrow rendered review | Pass | 390×844 and 320×800 light layouts had no horizontal overflow and exposed only the mobile navigation trigger. |
| Dark rendered review | Pass | Theme changed to dark, retained correct semantic colors, and persisted after reload and route navigation. |
| Drawer keyboard behavior | Pass | Trigger expanded state, focus entry, Escape dismissal, focus restoration, and dialog removal were verified. |
| Case-study rendered review | Pass | Nudge rendered at mobile width with correct title, headings, canonical URL, JSON-LD, no overflow, and no console warnings or errors. |

## Configured checks awaiting a browser-enabled CI run

| Gate | Current status | Follow-up |
| --- | --- | --- |
| Playwright critical journeys | Awaiting runtime | The local runner lacks Playwright’s managed Chromium executable. Run `npx playwright install --with-deps` in CI, then `npm run test:e2e`. |
| Automated Axe scans | Awaiting runtime | Included for all four public routes; must report zero violations in the browser-enabled run. |
| Visual regression | Awaiting runtime | Generate and review light/dark mobile/desktop baselines in the same environment used by CI. |
| Firefox and WebKit compatibility | Awaiting runtime | Desktop Firefox, desktop WebKit, and mobile WebKit projects are configured; provision their binaries and run them before the production release gate. |
| Lighthouse CI | Awaiting runtime | Run three production-build passes per route; require performance ≥90 and accessibility, SEO, and best practices ≥95. Reports remain local under `.lighthouseci/`. |
| Manual 200% zoom, text spacing, forced colors, and VoiceOver | Awaiting manual review | Complete on the deployment preview and record defects before production promotion. |
| Reduced-motion emulation | Awaiting runtime | The CSS contract is present; verify with browser media emulation and visual review. |

## Release decision

The codebase is suitable for a Vercel preview. Production promotion remains gated on the browser-enabled Playwright/Axe/visual/Lighthouse run and the manual assistive-technology checks above. The implementation contains no known critical defect; the open items are verification-environment gaps with explicit follow-up.
