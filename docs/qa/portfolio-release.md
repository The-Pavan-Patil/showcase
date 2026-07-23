# Portfolio release evidence

**Review date:** 2026-07-23

**Target:** Vercel preview, then production after the remaining browser-audit gates pass

**Runtime target:** Node.js 24 LTS

This file records evidence rather than intent. A configured test is not marked as passing until it has run in an environment with its required browser runtime.

## Completed checks

| Gate | Result | Evidence |
| --- | --- | --- |
| ESLint | Pass | `npm run lint` completed with zero warnings. |
| Generated route types and TypeScript | Pass | `npm run typecheck` completed successfully. |
| Unit/component tests | Pass | 22 tests across six files passed, including desktop density hysteresis, route/focus reset, utility actions, and labeled theme-menu behavior. |
| Coverage | Pass | 96.96% statements, 100% branches, 90.9% functions, and 100% lines against the configured thresholds. |
| Production build | Pass | Next.js statically generated `/`, three `/work/[slug]` routes, `/robots.txt`, `/sitemap.xml`, and `/icon.svg`. |
| Dependency audit | Pass | `npm audit` reported zero known vulnerabilities after scoped transitive overrides. |
| Route and asset probe | Pass | Public pages, robots, sitemap, Open Graph PNG, favicon, and résumé returned 200; an unknown project returned 404. |
| Desktop rendered review | Pass | 1440×900 light rendering had one h1, one main landmark, no horizontal overflow, valid canonical/OG metadata, and no browser console warnings or errors. |
| Narrow rendered review | Pass | 390×844 and 320×800 layouts had no horizontal overflow, hid the top header, retained four bottom destinations, and kept the utility orb within the viewport. |
| Dark rendered review | Pass | Theme changed to dark, retained correct semantic colors, and persisted after reload and route navigation. |
| Responsive navigation behavior | Pass | Desktop reduced from 60px/1024px to 48px/704px after downward scroll and restored on upward travel; section links remained available. |
| Mobile utility keyboard behavior | Pass | The named trigger opened Home/theme/résumé actions; Escape dismissed the Popover and restored focus. |
| Playwright browser matrix | Pass | 55 intended tests passed across Chromium, mobile Chromium, Firefox, WebKit, and mobile WebKit; 27 non-applicable project combinations were explicitly skipped. |
| Automated Axe scans | Pass | Zero violations across all four routes in both themes at desktop and mobile Chromium, plus compact desktop and open mobile utility states. |
| Visual regression | Pass | Light/dark desktop and mobile route baselines, compact desktop navigation, and open mobile utility baselines were generated and passed. |
| Case-study rendered review | Pass | Nudge rendered at mobile width with correct title, headings, canonical URL, JSON-LD, no overflow, and no console warnings or errors. |

## Remaining release checks

| Gate | Current status | Follow-up |
| --- | --- | --- |
| Lighthouse CI | Awaiting runtime | Run three production-build passes per route; require performance ≥90 and accessibility, SEO, and best practices ≥95. Reports remain local under `.lighthouseci/`. |
| Manual 200% zoom, text spacing, forced colors, and VoiceOver | Awaiting manual review | Complete on the deployment preview and record defects before production promotion. |
| Reduced-motion visual review | Awaiting manual review | Automated CSS contracts and unit behavior pass; complete a final visual preference review on the deployment preview. |

## Release decision

The codebase is suitable for a Vercel preview. Production promotion remains gated on Lighthouse and the manual assistive-technology checks above. The implementation contains no known critical defect.
