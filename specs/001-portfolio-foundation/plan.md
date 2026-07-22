# Implementation Plan: Portfolio Foundation

**Branch**: `main` | **Date**: 2026-07-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-portfolio-foundation/spec.md`

**Note**: This plan covers the public portfolio, its design-system documentation, and the
verification required before release.

## Summary

Deliver a hiring-focused, statically generated portfolio whose homepage establishes Pavan's
engineering profile and whose three case-study routes provide resume-backed evidence. Use a
server-first Next.js App Router application with typed local content, Tailwind CSS design tokens,
open-source HeroUI primitives, a portfolio-owned semantic navigation shell, persisted light-first
theming, and original abstract project visuals. Validate content, navigation, theming,
accessibility, metadata, responsive behavior, visual states, and production performance through
unit, component, end-to-end, accessibility, visual-regression, and Lighthouse checks.

## Technical Context

**Language/Version**: Node.js 24 LTS; TypeScript 5.x; React 19.2.4

**Primary Dependencies**: Next.js 16.2.11 App Router, Tailwind CSS 4.x, `@heroui/react` 3.2.2,
`@heroui/styles` 3.2.2, `next-themes` 0.4.6, Lucide React 1.25.0

**Storage**: Source-controlled TypeScript content and static public assets; browser storage is
limited to the explicit theme preference; no runtime database or CMS

**Testing**: ESLint 9, generated Next.js route types, TypeScript, Vitest 4 with Testing Library and
jsdom, Playwright 1.61 with Chromium/WebKit, Axe, visual snapshots, Lighthouse CI, and production
build verification

**Target Platform**: Vercel-hosted public web application; current and previous major Chrome,
Safari, Firefox, and Edge releases; contemporary iOS Safari and Android Chrome

**Project Type**: Single Next.js web application with static public routes

**Performance Goals**: Lighthouse performance score >=90 and accessibility, best-practices, and
SEO scores >=95 on the homepage and all three case studies; cumulative layout shift <=0.1; no
visible incorrect-theme flash

**Constraints**: WCAG 2.2 AA; 320 CSS-pixel reflow and 200% zoom; light-first persisted theming;
reduced-motion support; no backend, CMS, authentication, analytics, cookies, contact form, copied
HeroUI Pro assets, or unverified portfolio claims

**Scale/Scope**: One homepage, three generated case-study routes, one custom not-found state,
sitemap and robots endpoints, one shared header/footer, original project visuals, seven
design-system documentation topics, and a small static content model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Gate | Before Research | After Design | Evidence |
|------------------|-----------------|--------------|----------|
| Evidence Before Promotion | PASS | PASS | Resume-backed content model, explicit source precedence, optional unverified fields, and content-invariant tests |
| Accessible by Default | PASS | PASS | Semantic contracts, keyboard/focus requirements, Axe coverage, manual WCAG review, and reduced-motion behavior |
| Token-Driven Original Design | PASS | PASS | CSS token foundation, documented component states, and original abstract project visuals |
| Responsive and Motion-Safe | PASS | PASS | 320px/200% requirements, mobile drawer contract, reduced-motion CSS, and responsive/visual tests |
| Static, Fast, and Discoverable | PASS | PASS | Static parameters, server-first pages, canonical metadata, JSON-LD, sitemap, robots, and Lighthouse gates |
| Verify Before Release | PASS | PASS | Unit, component, E2E, accessibility, link, metadata, visual, build, and performance tasks |
| Minimal Data and Scope | PASS | PASS | Local content only; no backend, CMS, auth, analytics, cookies, or runtime collection |

No gate violations require justification. Phase 0 resolves implementation choices without changing
the approved product scope. Phase 1 preserves all seven gates.

## Project Structure

### Documentation (this feature)

```text
specs/001-portfolio-foundation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── site-contract.md
├── checklists/
│   ├── requirements.md
│   └── experience.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── not-found.tsx
│   └── work/[slug]/page.tsx
├── components/
│   ├── container.tsx
│   ├── json-ld.tsx
│   ├── project-card.tsx
│   ├── project-visual.tsx
│   ├── providers.tsx
│   ├── section-heading.tsx
│   ├── site-footer.tsx
│   ├── site-header.tsx
│   └── theme-toggle.tsx
└── lib/
    ├── portfolio.ts
    ├── site.ts
    └── utils.ts

public/
├── og.png
└── pavan-patil-resume.txt

docs/
├── design-system/
│   ├── README.md
│   ├── foundations.md
│   ├── components.md
│   ├── patterns.md
│   ├── accessibility.md
│   ├── motion.md
│   ├── content.md
│   └── examples.md
└── qa/
    └── portfolio-release.md

tests/
├── setup.ts
├── unit/
├── components/
├── e2e/
├── a11y/
└── visual/

vitest.config.mts
playwright.config.ts
lighthouserc.cjs
```

**Structure Decision**: Keep one App Router application because every public page consumes the
same local content and design foundation. Server components own static content and metadata;
client boundaries are limited to theme and drawer state. Shared portfolio records live in
`src/lib/portfolio.ts`, reusable visual behavior lives in `src/components`, and all route-owned
composition remains under `src/app`.

## Complexity Tracking

No constitution violations or exceptional complexity are required.
