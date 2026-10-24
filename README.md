# Pavan Patil — Portfolio

A hiring-focused software-engineering portfolio built with Next.js App Router, TypeScript, Tailwind CSS 4, and open-source HeroUI v3.

The site presents three résumé-verified case studies, professional experience, technical strengths, direct contact paths, light and dark themes, and statically generated metadata. Its visual language is original: the public HeroUI Pro showcase informed broad layout and interaction principles, but no proprietary template code or assets are included.

## Stack

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- HeroUI v3
- `next-themes`
- Vitest and Testing Library
- Playwright and Axe
- Lighthouse CI
- GitHub Spec Kit v0.13.2

## Local development

Use Node.js 24 LTS. The repository includes an `.nvmrc` and enforces the supported major through `package.json`.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`NEXT_PUBLIC_SITE_URL` must be the canonical production origin, without a trailing slash. Vercel's production URL is used automatically when that variable is absent.

`NEXT_PUBLIC_GOOGLE_CALENDAR_SCHEDULING_URL` enables the contact card's external Google Calendar booking link. Copy the appointment schedule URL from Google Calendar's sharing options. The scheduling action stays hidden when this variable is missing or invalid, leaving email as the primary contact path.

`DISCORD_WEBHOOK_URL` must be set for the anonymous keyboard message section to deliver visitor notes to Discord. The webhook stays server-only and is not exposed to the browser.

`NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` enable PostHog product analytics. Both must be present and well formed; otherwise the SDK is never imported, no requests are made, and every `trackEvent` call is a no-op. Setting them also activates the `/ingest` reverse proxy in `next.config.ts`, which serves PostHog from this origin so that ad blockers do not drop events. Leave them unset for local development unless you are specifically testing analytics: the end-to-end suite asserts a clean browser console.

`NEXT_PUBLIC_GA_MEASUREMENT_ID` enables Google Analytics 4. Google Analytics is skipped entirely when the variable is absent or is not a `G-` measurement id. Pageviews are sent manually rather than by enhanced measurement, so "Page changes based on browser history events" must be turned **off** in the GA4 data stream — the site pushes history state for in-page anchor navigation, which would otherwise be counted as extra pageviews.

Validate the local Discord webhook configuration with:

```bash
npm run verify:discord
npm run verify:discord -- --send
```

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
npm run test:lighthouse
```

Playwright browser binaries must be available in the local or CI environment before the end-to-end suite runs. Visual baselines are intentionally reviewed and generated in the target CI environment to avoid cross-platform rendering drift.

## Content model

Editable homepage content lives in `src/app/_pages/home/_data/`; individual case-study records and their translations live in `src/app/_pages/work/_data/case-studies/`. Project cards, case-study routes, metadata, and structured data consume the same typed records through `src/lib/portfolio.ts` so verified facts cannot drift between views.

Use `content/README.md` for the edit checklist and `docs/design-system/content.md` for voice, evidence, and claim rules.

The public résumé file intentionally omits the private phone number from the supplied source résumé. Replace or augment project media only with assets approved for public use.

## Documentation

- Design system: `docs/design-system/`
- Product and implementation specification: `specs/001-portfolio-foundation/`
- Governing engineering principles: `.specify/memory/constitution.md`

The Spec Kit workflow stops after `analyze` for review. In Codex, commands use the `$speckit-*` skill names, such as `$speckit-specify` and `$speckit-plan`.

## Deployment

The target is Vercel. Before production deployment:

1. Set `NEXT_PUBLIC_SITE_URL` to the canonical domain.
2. Run every quality command above against the production build.
3. Complete the manual accessibility checklist in the design-system documentation.
4. Review the generated Open Graph card at `public/og.png`.

No CMS, database, authentication, or unlicensed HeroUI Pro assets are used. The only backend contact path is an anonymous, message-only Discord webhook endpoint with no visitor registration, reply field, or stored message history.

Analytics is optional and disabled unless configured. When enabled it is privacy-conservative by default: PostHog uses local storage rather than cookies and creates no person profiles, session replay masks all inputs, and Google Analytics runs with consent-mode defaults denying advertising storage, with Google signals and ad personalisation switched off.
