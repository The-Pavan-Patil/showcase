---
description: "Actionable implementation tasks for the portfolio foundation"
---

# Tasks: Portfolio Foundation

**Input**: Design documents from `/specs/001-portfolio-foundation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [site-contract.md](./contracts/site-contract.md),
[quickstart.md](./quickstart.md)

**Tests**: Tests are mandatory under the approved feature specification and project constitution.
Write each story's tests before its implementation and establish the expected failure before coding.

**Organization**: Tasks are grouped by user story so each story can be demonstrated and validated
after the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it uses different files and has no unfinished dependency.
- **[Story]**: Maps the task to US1, US2, US3, or US4 from `spec.md`.
- Every task names the exact repository path it creates or changes.

## Path Conventions

- Application routes: `src/app/`
- Shared components: `src/components/`
- Content and utilities: `src/lib/`
- Public approved assets: `public/`
- Automated checks: `tests/` and root test configuration files
- Design documentation: `docs/design-system/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Make the approved runtime and verification toolchain reproducible.

- [ ] T001 Pin Node.js 24, npm scripts, runtime/UI dependencies, testing dependencies, and the lockfile in `.nvmrc`, `package.json`, and `package-lock.json`
- [ ] T002 [P] Configure jsdom, React, aliases, setup hooks, and coverage thresholds in `vitest.config.mts` and `tests/setup.ts`
- [ ] T003 [P] Configure Chromium/Firefox/WebKit projects, production-server startup, mobile/desktop viewports, trace retention, and snapshot policy in `playwright.config.ts`
- [ ] T004 [P] Configure four-route, three-run Lighthouse assertions at 0.90/0.95/0.95/0.95 in `lighthouserc.cjs`
- [ ] T005 [P] Add the curated accessible resume with verified career content and the private phone number redacted in `public/pavan-patil-resume.txt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the evidence-backed content, site-origin rules, design tokens, and shared
primitives required by every story.

**⚠️ CRITICAL**: No user-story composition begins until this phase passes its unit checks.

- [ ] T006 [P] Write failing invariants for exact project count/slugs, evidence values, optional links/media, experience order, contextual dates, navigation targets, and phone-number exposure in `tests/unit/portfolio.test.ts`
- [ ] T007 [P] Write failing origin-precedence and safe JSON-LD serialization tests in `tests/unit/site.test.ts` and `tests/components/json-ld.test.tsx`
- [ ] T008 Implement immutable Profile, ProjectCaseStudy, ProjectFact, ExperienceItem, SkillGroup, ProfessionalLink, navigation, lookup, and cyclic-next records in `src/lib/portfolio.ts`
- [ ] T009 Implement canonical-origin precedence and `<`-safe JSON-LD output in `src/lib/site.ts` and `src/components/json-ld.tsx`
- [ ] T010 [P] Define light/dark color tokens, four-pixel spacing, 72rem container, typography, radii, shadows, focus, interaction timing, base reflow, and reduced-motion overrides in `src/app/globals.css`
- [ ] T011 [P] Create the root client-provider boundary with light-first theme configuration in `src/components/providers.tsx`
- [ ] T012 [P] Implement the width, gutter, and class-name contract in `src/components/container.tsx` and `src/lib/utils.ts`
- [ ] T013 [P] Implement reusable eyebrow, heading, muted phrase, and description semantics in `src/components/section-heading.tsx`
- [ ] T014 [P] Document source hierarchy, approved tokens, spacing, typography, radii, shadows, and breakpoint philosophy in `docs/design-system/README.md` and `docs/design-system/foundations.md`

**Checkpoint**: Content invariants pass, token foundations are documented, and shared primitives can
be consumed without a backend or runtime data service.

---

## Phase 3: User Story 1 - Assess Fit and Start a Conversation (Priority: P1) 🎯 MVP

**Goal**: Deliver a homepage that communicates Pavan's engineering profile, proof, selected work,
and direct contact path.

**Independent Test**: At mobile and desktop widths, `/` exposes Pavan's identity, verified evidence,
three project summaries, direct email, resume, and footer without requiring a case-study route.

### Tests for User Story 1

- [ ] T015 [P] [US1] Write failing component coverage for descriptive project links, optional destinations, footer navigation, and accessible external-link names in `tests/components/project-card.test.tsx` and `tests/components/site-footer.test.tsx`
- [ ] T016 [P] [US1] Write a failing homepage journey for one h1, landmarks, proof values, three cards, section targets, email, resume, and footer in `tests/e2e/home.spec.ts`
- [ ] T017 [P] [US1] Write failing internal-fragment, mailto, resume-download, and approved external-link contract checks in `tests/e2e/links.spec.ts`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement the shared-record project card with descriptive internal navigation, technology tags, and original visual slot in `src/components/project-card.tsx`
- [ ] T019 [P] [US1] Implement footer identity, canonical homepage navigation, approved professional links, and current-year content in `src/components/site-footer.tsx`
- [ ] T020 [US1] Configure Inter/Manrope, root metadata, viewport colors, the skip link, provider boundary, and main-content contract in `src/app/layout.tsx`
- [ ] T021 [US1] Compose hero, evidence strip, selected-work grid, direct contact call to action, and Person structured data in `src/app/page.tsx`
- [ ] T022 [US1] Align hero, proof, cards, contact, and footer responsive/interactive styles with the approved tokens in `src/app/globals.css`

**Checkpoint**: US1 is a viable hiring MVP with direct contact and three evidence-backed project
summaries even before detail-route, theme-menu, and career-detail stories are added.

---

## Phase 4: User Story 2 - Inspect Project Evidence (Priority: P2)

**Goal**: Deliver three directly addressable case studies with consistent evidence, recovery, and
next-project navigation.

**Independent Test**: Each canonical `/work/...` path opens independently with distinguishing
content; next-project order cycles correctly; an unknown slug is non-indexable and recovers to work.

### Tests for User Story 2

- [ ] T023 [P] [US2] Write failing lookup, canonical slug, static-parameter, qualitative/quantitative fact, and cyclic-next-order tests in `tests/unit/project-routing.test.ts`
- [ ] T024 [P] [US2] Write failing direct-route and card-to-case consistency journeys for all three projects in `tests/e2e/work.spec.ts`
- [ ] T025 [P] [US2] Write a failing unknown-slug status, noindex, recovery-link, and no-console-error journey in `tests/e2e/not-found.spec.ts`

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implement original accessible sync, multilingual-web, and workforce-operations diagrams in `src/components/project-visual.tsx`
- [ ] T027 [US2] Implement static parameters, case hero, experience context, technology tags, facts, challenge/approach/outcome, contributions, CreativeWork JSON-LD, and next-project navigation in `src/app/work/[slug]/page.tsx`
- [ ] T028 [P] [US2] Implement the branded non-indexable unknown-route recovery state in `src/app/not-found.tsx`
- [ ] T029 [P] [US2] Generate exactly four absolute canonical entries from shared records in `src/app/sitemap.ts`
- [ ] T030 [P] [US2] Publish the public crawl policy and absolute sitemap reference in `src/app/robots.ts`
- [ ] T031 [US2] Complete case-study, metric, narrative, contribution, visual, and recovery responsive styles in `src/app/globals.css`

**Checkpoint**: US2 is independently demonstrable by direct URLs and provides a complete evidence
journey without relying on client-side routing.

---

## Phase 5: User Story 3 - Use the Site in a Preferred Environment (Priority: P2)

**Goal**: Make navigation, theme, focus, reflow, zoom, and reduced-motion behavior inclusive across
target devices and input methods.

**Independent Test**: Use only the keyboard at 320px, 200% zoom, in both themes, with reduced motion;
all content and actions remain available, the bottom navigation stays unobstructed, and utility
Popover focus/dismissal behavior is correct.

### Tests for User Story 3

- [ ] T032 [P] [US3] Write failing mounted-state, icon/menu presentations, callback, action-label, and light/dark selection coverage in `tests/unit/theme-toggle.test.tsx`
- [ ] T033 [P] [US3] Write failing desktop scroll thresholds, direction hysteresis, top/focus/route reset, active-section, and compact-link coverage in `tests/unit/site-header.test.tsx`
- [ ] T034 [P] [US3] Write failing first-visit light, explicit persistence, reload, route-change, and no-hydration-error journeys in `tests/e2e/theme.spec.ts`
- [ ] T035 [P] [US3] Write failing bottom-navigation presence, utility Popover actions, Escape/outside dismissal, focus restoration, safe-area, 320px overflow, and content-clearance journeys in `tests/e2e/site.spec.ts`

### Implementation for User Story 3

- [ ] T036 [US3] Implement the persisted light-first theme provider contract in `src/components/providers.tsx`
- [ ] T037 [P] [US3] Implement mounted-safe icon state and action-oriented accessible labels in `src/components/theme-toggle.tsx`
- [ ] T038 [US3] Implement the semantic direction-aware desktop nav, persistent mobile bottom nav, HeroUI utility Popover, resume action, contact target, and theme control in `src/components/site-header.tsx`
- [ ] T039 [US3] Implement regular-glass and solid-fallback surfaces, compact/expanded geometry, safe-area bottom positioning, footer clearance, 320px reflow, touch targets, visible focus, 200% zoom resilience, and reduced-motion behavior in `src/app/globals.css`
- [ ] T040 [US3] Wire root theme classes, hydration boundary, theme-color metadata, and skip-navigation placement in `src/app/layout.tsx`

**Checkpoint**: US3 passes keyboard, theme, narrow-layout, zoom, and reduced-motion acceptance without
changing the content contract.

---

## Phase 6: User Story 4 - Review Career Breadth (Priority: P3)

**Goal**: Add resume-backed experience, focused skills, education, and personal context to the
homepage after the core hiring journey is established.

**Independent Test**: The experience/about portion alone communicates reverse-chronological roles,
verified highlights, grouped skills, education, and concise context with no unsupported claims.

### Tests for User Story 4

- [ ] T041 [P] [US4] Write failing career-content coverage for employer order, role/period/location values, education, skill grouping, and excluded unsupported claims in `tests/unit/career-content.test.ts`
- [ ] T042 [P] [US4] Write a failing experience/about journey for headings, list semantics, resume access, and mobile reflow in `tests/e2e/career.spec.ts`

### Implementation for User Story 4

- [ ] T043 [US4] Compose the reverse-chronological experience timeline, skills groups, education, about copy, and resume action in `src/app/page.tsx`

**Checkpoint**: All four user stories are independently testable and the complete homepage matches
the approved information architecture.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Complete documentation, metadata assets, accessibility, visual coverage, and release
evidence spanning all stories.

- [ ] T044 [P] Add Axe scans for all four routes in both themes and viewports, plus compact desktop navigation and the open mobile utility Popover, in `tests/e2e/a11y.spec.ts`
- [ ] T045 [P] Add deterministic visual comparisons for full pages, compact desktop navigation, mobile bottom navigation, and the open utility Popover in both themes in `tests/e2e/visual.spec.ts`
- [ ] T046 [P] Add title, description, canonical, Open Graph, Twitter, JSON-LD, sitemap, robots, favicon, and same-origin link coverage in `tests/e2e/metadata.spec.ts`
- [ ] T047 [P] Add the original 1200x630 branded social-preview asset in `public/og.png`
- [ ] T048 [P] Document component states, responsive patterns, and composition rules in `docs/design-system/components.md` and `docs/design-system/patterns.md`
- [ ] T049 [P] Document WCAG obligations, manual review, motion timing/reduction, and content/source voice in `docs/design-system/accessibility.md`, `docs/design-system/motion.md`, and `docs/design-system/content.md`
- [ ] T050 [P] Document concrete token/component do-and-don't examples without copied reference assets in `docs/design-system/examples.md`
- [ ] T051 Run lint, generated-route type checking, TypeScript, unit/component tests, coverage, and production build using scripts in `package.json`, fixing only failures in `src/` and `tests/`
- [ ] T052 Run Chromium, Firefox, and WebKit functional suites plus Axe and Chromium visual suites using `playwright.config.ts`, then record current/previous-browser compatibility and manual keyboard/zoom/reflow/screen-reader results in `docs/qa/portfolio-release.md`
- [ ] T053 Run three production Lighthouse passes for all four routes using `lighthouserc.cjs` and record threshold results in `docs/qa/portfolio-release.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks every user story.
- **US1 (Phase 3)**: Depends only on Foundational; this is the recommended MVP.
- **US2 (Phase 4)**: Depends only on Foundational project records and can proceed in parallel with
  US1 after T008; homepage-to-case integration is validated when both are complete.
- **US3 (Phase 5)**: Depends only on Foundational providers/tokens and can proceed in parallel with
  US1/US2; T038 integrates navigation into completed pages when available.
- **US4 (Phase 6)**: Depends on Foundational content and can proceed in parallel with US2/US3; its
  final page composition follows US1 T021 to avoid concurrent edits to `src/app/page.tsx`.
- **Polish (Phase 7)**: Depends on all selected stories. Documentation tasks T048–T050 can begin as
  soon as their relevant contracts stabilize; release runs T051–T053 are last.

### User Story Dependencies

- **US1**: No other story dependency; provides the hiring MVP.
- **US2**: No functional dependency on US1 because every case opens directly.
- **US3**: No content dependency; its shared header enhances whichever pages are present.
- **US4**: No functional dependency on US2 or US3; composition follows US1 only because both edit
  the homepage file.

### Within Each User Story

1. Write story tests and establish the expected failures.
2. Implement the smallest shared records/components needed by the story.
3. Compose routes and integrations.
4. Complete responsive and interaction states.
5. Run the independent-test checkpoint before moving on.

### Parallel Opportunities

- T002–T005 use separate setup files.
- T006–T007 establish independent unit/component contracts.
- T010–T014 use separate token, provider, primitive, and documentation files.
- Story test files marked `[P]` can be written concurrently after Foundational.
- US2, US3, and US4 can be staffed in parallel after T008/T010/T011, respecting same-file edits.
- T044–T050 cover independent accessibility, visual, metadata, asset, and documentation outputs.

---

## Parallel Examples

### User Story 1

```text
T015: component contracts in tests/components/
T016: homepage journey in tests/e2e/home.spec.ts
T017: link contracts in tests/e2e/links.spec.ts
```

### User Story 2

```text
T023: project routing unit tests
T024: canonical case-study journeys
T025: unknown-route journey
T026: original project visual component
T028–T030: not-found, sitemap, and robots routes
```

### User Story 3

```text
T032–T035: theme, desktop density, persistent mobile navigation, utility Popover, and persistence tests
T037: mounted-safe theme toggle after provider contract is fixed
```

### User Story 4

```text
T041: career content invariants
T042: career browser journey
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete US1 tests, project card, footer, root layout, and homepage composition.
3. Run the US1 checkpoint and static release gates.
4. Demonstrate a credible homepage with direct contact before adding deeper routes and enhancements.

### Incremental Delivery

1. **Foundation**: Reproducible stack, evidence model, tokens, and primitives.
2. **US1**: Hiring homepage and contact MVP.
3. **US2**: Three directly addressable evidence pages.
4. **US3**: Inclusive navigation, persisted themes, responsive and motion-safe behavior.
5. **US4**: Complete career context.
6. **Polish**: Documentation and full release matrix.

### Parallel Team Strategy

After Foundation:

- Developer A owns US1 and the homepage file.
- Developer B owns US2 routes and project visuals.
- Developer C owns US3 client interactions and shared header.
- US4 content tests may run in parallel, but its homepage composition waits for US1 T021.
- Cross-cutting tests and design-system documents split by distinct files during Polish.

## Notes

- `[P]` never implies safe concurrent edits to the same file.
- Every factual content change must identify its approved source during review.
- The curated resume download is approved; the source phone number remains redacted until explicit publication approval.
- Case-study qualitative facts are capabilities, not measured outcomes.
- Keep missing optional assets and destinations absent rather than inventing placeholders.
- Stop at each checkpoint for independent validation; do not defer all testing to Phase 7.
