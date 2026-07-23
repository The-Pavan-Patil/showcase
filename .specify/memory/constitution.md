<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles:
  - I. Evidence Before Promotion
  - II. Accessible by Default
  - III. Token-Driven Original Design
  - IV. Responsive and Motion-Safe
  - V. Static, Fast, and Discoverable
  - VI. Verify Before Release
  - VII. Minimal Data and Scope
- Added sections: Product and Technical Constraints; Delivery Workflow and Quality Gates
- Removed sections: placeholder sections only
- Templates reviewed:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ .specify/templates/checklist-template.md
- Runtime guidance reviewed: ✅ AGENTS.md and README.md; no updates required
- Deferred TODOs: none
-->

# Pavan Portfolio Constitution

## Core Principles

### I. Evidence Before Promotion (NON-NEGOTIABLE)

Every public factual claim about Pavan's employment, education, skills, clients, projects,
dates, or outcomes MUST be traceable to the current resume or another source explicitly
approved by Pavan. The resume is authoritative when an older portfolio conflicts with it.
Copy MAY summarize verified material, but MUST NOT invent metrics, proficiency levels,
project dates, launch status, scale, accessibility results, or business impact. Missing
optional facts and URLs MUST be omitted instead of filled with placeholders. Employment
periods used as case-study context MUST be labeled as such and MUST NOT be presented as
exact project durations. This rule keeps the portfolio credible under hiring scrutiny.

### II. Accessible by Default (NON-NEGOTIABLE)

Every shipped page and interactive control MUST target WCAG 2.2 Level AA. The product MUST
use semantic landmarks and heading order, support complete keyboard operation, expose
visible focus, provide meaningful accessible names and alternative text, maintain AA color
contrast in both themes, preserve content at 200% zoom and 320 CSS pixels, and never rely on
color alone. Automated accessibility checks MUST be supplemented by keyboard and screen
reader review because automation cannot cover every barrier.

### III. Token-Driven Original Design

Visual decisions MUST be expressed through the documented design tokens and shared
component contracts rather than scattered one-off values. Documentation and implementation
MUST remain synchronized for color, typography, spacing, radii, shadows, layout, motion, and
interactive states. HeroUI Pro MAY inform general composition and interaction principles,
but proprietary source, templates, fonts, screenshots, and assets MUST NOT be copied. All
delivered visual work MUST be original, licensed, or supplied with permission.

### IV. Responsive and Motion-Safe

Core content and actions MUST remain usable without horizontal scrolling from 320 CSS pixels
through large desktop widths. Navigation, cards, typography, and touch targets MUST adapt to
the available space without hiding essential information. Motion MUST be restrained,
non-blocking, and disabled or simplified when `prefers-reduced-motion` is enabled. Hover-only
disclosure and decorative effects that compete with the content are prohibited.

### V. Static, Fast, and Discoverable

Public pages SHOULD be statically generated and server-rendered wherever interaction does not
require client state. Client-side JavaScript MUST be limited to necessary behavior such as
theme selection, active-section navigation, desktop density, and the mobile utility menu. Images, fonts, metadata, structured data, canonical URLs,
the sitemap, and robots rules MUST be optimized and complete. Release candidates MUST meet the
portfolio's documented performance and search-audit thresholds on the production build.

### VI. Verify Before Release (NON-NEGOTIABLE)

Behavioral changes MUST be covered at the lowest useful test layer and MUST be validated before
release. Required gates are linting, generated-route type checking, strict TypeScript checking,
unit and component tests, critical end-to-end journeys, accessibility scans, link and metadata
checks, visual review in both themes and target viewports, and a production build. A gate MAY be
deferred only when the reason, owner, and follow-up are recorded; no known critical or serious
accessibility defect may be deferred.

### VII. Minimal Data and Scope

The portfolio MUST remain a public, read-only presentation site unless a later specification
explicitly expands it. Version one MUST NOT add a CMS, database, authentication, contact-form
backend, analytics, cookies, blog, services funnel, or heavy 3D effects. Contact uses direct
links. Personal data beyond the approved public email and approved professional URLs MUST NOT
be published implicitly. This constraint minimizes privacy risk, maintenance, and failure modes.

## Product and Technical Constraints

- The supported foundation is Node.js 24 LTS, npm, Next.js App Router, TypeScript, Tailwind CSS,
  open-source HeroUI, and local source-controlled content.
- Light is the default theme. A user-selected light or dark theme MUST persist without an
  incorrect-theme flash.
- The public information architecture is one homepage, three featured case studies under
  `/work/[slug]`, and generated metadata endpoints. Additional product routes require a new or
  amended specification.
- The design system uses a four-pixel spacing rhythm, a 72rem content container, Manrope for
  display text, Inter for body and interface text, and the approved light, dark, and brand tokens.
- The current resume, explicit user instructions, and approved project materials are content
  sources. The former portfolio is a secondary reference for durable links and useful facts only.

## Delivery Workflow and Quality Gates

1. Use the Spec Kit sequence constitution -> specify -> clarify -> plan -> checklist -> tasks ->
   analyze before implementation or when materially revising scope.
2. Write acceptance criteria and relevant tests before changing behavior. Each user story MUST
   remain independently demonstrable after shared foundations are complete.
3. Review content against its source evidence and review design changes against the design-system
   documentation before considering a story complete.
4. Before release, run lint, type checking, unit tests, the production build, critical end-to-end
   tests, accessibility checks, link/metadata checks, and production performance audits.
5. Any constitution exception MUST be documented in the plan's Complexity Tracking section with
   the reason and the rejected simpler alternative. Unjustified violations block implementation.

## Governance

This constitution supersedes conflicting project guidance. Amendments require a written rationale,
an updated Sync Impact Report, review of dependent specifications, plans, tasks, templates, and
runtime guidance, and explicit approval from the project owner. Versioning follows semantic
versioning: MAJOR for incompatible principle or governance changes, MINOR for a new principle or
materially expanded obligation, and PATCH for non-semantic clarification. Every plan and review
MUST include a constitution compliance check. Complexity and quality-gate exceptions MUST be
visible, time-bounded, and approved rather than silently accepted.

**Version**: 1.0.0 | **Ratified**: 2026-07-22 | **Last Amended**: 2026-07-22
