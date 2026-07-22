# Quickstart: Portfolio Foundation

## Prerequisites

- Node.js 24 LTS (the `.nvmrc` and package engine range are authoritative)
- npm with access to the committed lockfile
- A current Chromium browser for local smoke testing
- Playwright Chromium, Firefox, and WebKit browsers for the full end-to-end suite
- Optional `NEXT_PUBLIC_SITE_URL` when validating absolute production metadata locally

No database, API key, authentication credential, or backend service is required.

## Install and Run

```bash
nvm use
npm ci
npm run dev
```

Open `http://localhost:3000`. Expected result: the homepage uses the light theme on a first visit,
contains exactly three featured projects, and exposes working email, resume, navigation, and
case-study links.

## Static Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected result: all commands exit successfully with no lint warnings, type errors, failing tests,
or route-generation errors. The production build generates the homepage and three known project
parameters.

## Browser Validation

Install browsers once if required, start from a production build, then run:

```bash
npx playwright install chromium firefox webkit
npm run test:e2e
```

Expected critical scenarios:

1. `/` has one `h1`, a skip link, four proof points, three project cards, reverse-chronological
   experience, skills/about content, contact, and footer.
2. Each canonical project path opens directly, exposes distinguishing content, and links onward.
3. `/work/not-a-real-project` produces a non-indexable not-found page with selected-work recovery.
4. Desktop and mobile navigation reach every real section; the Drawer supports focus containment,
   Escape, dismissal, focus restoration, and destination-close behavior.
5. The explicit theme survives navigation and reload without a hydration error or incorrect-theme
   flash.
6. Internal and fragment links resolve, approved external links have safe semantics, and no same-
   origin request fails unexpectedly.

See [site-contract.md](./contracts/site-contract.md) for exact route and behavior contracts.

## Accessibility and Visual Validation

```bash
npm run test:e2e
npm run test:e2e:update
```

The automated matrix covers all four indexable routes at 390x844 and 1440x900 in light and dark,
plus the open mobile Drawer in both themes. Axe must return zero violations without broad rule
exclusions. Visual baselines are generated and reviewed in the same operating-system/browser
environment used for comparison.

Complete these manual checks before release:

- Keyboard-only navigation and visible focus
- Skip-link behavior and logical focus/heading order
- Drawer containment, dismissal, and focus restoration
- 200% zoom and 320 CSS-pixel reflow without horizontal page scrolling
- VoiceOver landmark and control names
- Both-theme contrast and non-color state cues
- Reduced-motion behavior with smooth scrolling and travel effects removed
- Content claims and visuals against approved sources

## Metadata and Performance Validation

Set the production origin when not running on Vercel, serve the production build, and run:

```bash
NEXT_PUBLIC_SITE_URL=https://portfolio.example npm run build
npm run start
npm run test:lighthouse
```

Replace the example origin with the actual deployment URL. Expected result:

- Performance >=90 on every indexable route
- Accessibility, best practices, and SEO >=95 on every indexable route
- Unique canonical and social metadata on all four routes
- Valid Person and CreativeWork JSON-LD
- `/robots.txt`, `/sitemap.xml`, favicon, and social image return successfully
- Sitemap contains exactly the homepage and three canonical case-study URLs

## Content Update Validation

When changing `src/lib/portfolio.ts`:

1. Trace each changed factual claim to the current resume or an explicitly approved source.
2. Keep exactly three unique project slugs unless the specification changes.
3. Do not label experience context as project dates.
4. Omit unapproved links and media instead of using placeholders.
5. Re-run unit, end-to-end, metadata, sitemap, and visual checks because one record feeds multiple
   surfaces.
