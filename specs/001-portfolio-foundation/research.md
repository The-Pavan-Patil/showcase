# Research: Portfolio Foundation

## Decision 1: Application Foundation

**Decision**: Use Node.js 24 LTS, npm, Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4
as a single application.

**Rationale**: The approved stack supports static generation, route metadata, server-first
rendering, typed local content, and deployment to Vercel without a separate API or build system.
Pinning an LTS Node release makes local and deployment behavior reproducible.

**Alternatives considered**: A static-site generator would reduce React usage but discard the
approved HeroUI/Next.js direction. A split frontend/backend adds no value because the feature has
no runtime data or mutations.

## Decision 2: HeroUI Integration and Navigation

**Decision**: Import Tailwind before `@heroui/styles`, use HeroUI v3 primitives where they add
accessible behavior, and implement the site header as portfolio-owned semantic markup. Use the
HeroUI Drawer compound component for modal mobile navigation.

**Rationale**: HeroUI v3 is CSS-first and does not require a global HeroUI provider. Its former
Navbar abstraction is not part of the v3 component set, while the Drawer supplies modal semantics,
focus handling, and dismissal behavior. A custom `<nav>` preserves the information architecture
and keeps navigation markup explicit.

**Alternatives considered**: Copying a HeroUI Pro navbar is disallowed and unnecessary. Building a
drawer from generic divs would duplicate complex accessibility behavior. Retaining a removed v2
Navbar would couple the project to obsolete APIs.

## Decision 3: Theme Initialization

**Decision**: Use `next-themes` with the `class` attribute, `defaultTheme="light"`, system theme
disabled, storage-backed explicit selection, and hydration-warning suppression only on the root
HTML element.

**Rationale**: This matches the light-first product decision, keeps user intent stable between
routes and reloads, applies the theme before content paints, and confines the client boundary to a
small provider and toggle.

**Alternatives considered**: Following system preference would contradict the approved light
default. A hand-written storage script would repeat established initialization behavior. A
server-stored preference would require cookies or a backend, both out of scope.

## Decision 4: Typography and Visual Tokens

**Decision**: Load Inter and Manrope through the framework font integration with `display: swap`,
bind them to CSS variables, and express color, spacing, type, radii, shadows, containers, and motion
as global design tokens documented under `docs/design-system`.

**Rationale**: Font integration provides self-hosted build output and layout stability while CSS
variables make light/dark values and shared components auditable. The token layer is the contract
between documentation and code.

**Alternatives considered**: Remote CSS font imports add a render-time dependency. System fonts
alone would not meet the approved visual direction. Per-component literal values would allow
documentation and implementation to drift.

## Decision 5: Static Content and Evidence

**Decision**: Store the profile, three project case studies, proof points, experience, skill groups,
and approved professional links as typed, immutable local records in `src/lib/portfolio.ts`.
Derive project cards, case pages, static route parameters, next-project navigation, metadata, and
structured data from those same records.

**Rationale**: A single source prevents content drift and makes resume fidelity and slug uniqueness
testable. Optional arrays and links let unavailable project media or destinations disappear without
placeholder UI. No runtime editor or data service is needed.

**Alternatives considered**: JSON loses some compile-time guarantees. MDX adds parsing and content
composition that three short case studies do not need. A CMS or database violates the static scope.

## Decision 6: Project Visuals and Publication Safety

**Decision**: Use original, code-authored abstract diagrams for each case study until approved
screenshots are supplied. Keep media and external project links optional; expose the supplied text
resume as the initial approved download.

**Rationale**: Abstract visuals create useful differentiation without fabricating product screens
or publishing client-confidential material. Conditional fields keep the interface complete while
source permissions remain explicit.

**Alternatives considered**: Empty image placeholders degrade credibility. Scraping screenshots or
copying HeroUI Pro assets creates rights and accuracy risks. Blocking the entire portfolio on media
would withhold otherwise complete evidence.

## Decision 7: Static Routes and Metadata

**Decision**: Generate the three project paths from the shared project records, return a custom
not-found result for unknown slugs, and generate page metadata, Person/CreativeWork JSON-LD,
sitemap, robots rules, and a 1200x630 social-preview image in the App Router.

**Rationale**: Build-time route generation provides direct-address reliability and search
discoverability without runtime data fetching. Metadata generated from the same records remains
consistent with visible content.

**Alternatives considered**: A client-side router would weaken direct loads and metadata. Hard-coded
sitemap entries could drift from projects. A third-party SEO plugin is unnecessary for four routes.

## Decision 8: Canonical Site Address

**Decision**: Resolve the public origin from `NEXT_PUBLIC_SITE_URL`, otherwise from
`VERCEL_PROJECT_PRODUCTION_URL` for production or `VERCEL_URL` for previews, with
`http://localhost:3000` only as a local fallback.

**Rationale**: The final custom domain is not yet specified, while canonical and social metadata
must still be absolute in production and review deployments. Vercel supplies both stable
production and deployment-specific preview origins.

**Alternatives considered**: Hard-coding the old portfolio URL would give the new site incorrect
canonicals. Omitting a metadata base breaks absolute social and sitemap addresses.

## Decision 9: Layered Verification

**Decision**: Use Vitest and Testing Library for local content and interactive client components;
Playwright for App Router pages, keyboard flows, Drawer behavior, theme persistence, route and link
coverage; Axe for automated accessibility; Playwright snapshots for 390x844 and 1440x900 visual
states; and Lighthouse CI against a production server.

**Rationale**: Each layer covers what it can observe reliably. Async server components and metadata
are best covered through browser journeys, while pure content invariants and client controls remain
fast unit/component tests. Manual keyboard, zoom, reflow, contrast, and screen-reader review close
known automation gaps.

**Alternatives considered**: Unit-only testing cannot prove routing, focus, metadata, or hydration.
End-to-end-only testing is slow and obscures content-model failures. Screenshot-only review does not
establish accessibility or behavior.

## Decision 10: Deployment Boundary

**Decision**: Deploy the static/server-rendered application to Vercel with no backend services,
secrets, analytics, cookies, or runtime persistence beyond the browser theme preference.

**Rationale**: This is the smallest operational surface that meets the hiring goal and aligns with
the constitution's privacy and simplicity requirements.

**Alternatives considered**: A contact-form service introduces data handling and abuse controls.
Analytics add consent and privacy decisions that the user excluded from version one.
