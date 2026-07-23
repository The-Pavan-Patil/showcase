# Feature Specification: Portfolio Foundation

**Feature Branch**: `main`

**Created**: 2026-07-22

**Status**: Approved

**Input**: User description: "Create a hiring-focused portfolio with an original HeroUI-inspired
design system, resume-backed content, three detailed case studies, responsive light and dark
themes, design documentation, and a complete Spec Kit plan."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assess Fit and Start a Conversation (Priority: P1)

A recruiter or engineering hiring manager opens the homepage and quickly understands who Pavan
is, the kind of software he builds, evidence of his impact, and how to contact him about a
full-time role.

**Why this priority**: The portfolio's primary business purpose is to turn a short hiring review
into a credible reason to explore further or make contact.

**Independent Test**: Open only the homepage at mobile and desktop widths. A reviewer can identify
Pavan's role, scan verified proof points and selected work, and start an email conversation without
visiting another page.

**Acceptance Scenarios**:

1. **Given** a first-time visitor, **When** the homepage opens, **Then** Pavan's name, software
   engineering focus, concise positioning, verified proof points, and primary contact action are
   understandable without interaction.
2. **Given** a recruiter ready to make contact, **When** they activate the email action from the
   hero, contact section, or footer, **Then** their email client is addressed to Pavan's
   approved public email.
3. **Given** a visitor scanning selected work, **When** they reach the work section, **Then** they
   see exactly three distinct projects with a summary, context, and descriptive path to more detail.

---

### User Story 2 - Inspect Project Evidence (Priority: P2)

A hiring reviewer opens a featured project to understand the problem, Pavan's role, the technical
approach, and the verified outcome before continuing to another project or returning home.

**Why this priority**: Detailed, evidence-based case studies turn a visual portfolio into proof of
engineering judgment and delivery experience.

**Independent Test**: Open each case-study URL directly. Each page stands on its own with clear
context, challenge, approach, outcome, contribution, verified facts, and recovery navigation.

**Acceptance Scenarios**:

1. **Given** a project card for Nudge, Philips Greenheart, or Workforce Management, **When** the
   reviewer activates it, **Then** the corresponding case study opens and its content matches the
   card's title, summary, and evidence.
2. **Given** a case-study page opened directly, **When** it loads, **Then** the reviewer can identify
   Pavan's role, client or company context, technologies, challenge, approach, outcome, and personal
   contribution without relying on the homepage.
3. **Given** a reviewer reaches the end of a case study, **When** they continue, **Then** they can
   open the next featured project or return to selected work without a dead end.

---

### User Story 3 - Use the Site in a Preferred Environment (Priority: P2)

A visitor uses the portfolio on a phone, tablet, or desktop with a keyboard, pointer, assistive
technology, preferred color theme, zoom level, or reduced-motion setting.

**Why this priority**: Hiring evidence loses value if navigation, contrast, motion, or responsive
layout prevents a visitor from reading it.

**Independent Test**: Navigate the homepage and one case study at 320 CSS pixels and at desktop
width, using only the keyboard, in both themes, at 200% zoom, and with reduced motion enabled.

**Acceptance Scenarios**:

1. **Given** a narrow viewport, **When** the visitor navigates the site, **Then** Work, Experience,
   About, and Contact remain available in a persistent bottom navigation while a separate named
   utility control exposes Home, theme, and résumé actions with dismissal and focus restoration.
2. **Given** a visitor changes the theme, **When** they navigate or reload, **Then** the explicit
   choice persists and the page does not expose an incorrect-theme flash.
3. **Given** keyboard-only or assistive-technology use, **When** the visitor moves through the site,
   **Then** landmarks, headings, controls, focus order, accessible names, and skip navigation make
   every core action available.
4. **Given** a desktop visitor scrolls deliberately down and then up, **When** the header changes
   density, **Then** every section destination remains available, the header expands near the page
   top or on keyboard focus, and reduced-motion users receive the same state changes immediately.

---

### User Story 4 - Review Career Breadth (Priority: P3)

A reviewer who wants more context can inspect Pavan's chronological experience, focused skill
groups, education, and working style without reading the source resume first.

**Why this priority**: This supporting context helps a reviewer map the selected case studies to
Pavan's broader experience after the primary value proposition is clear.

**Independent Test**: Review only the experience and about portions of the homepage. Employment
history, skills, education, and personal context are legible, chronologically coherent, and
traceable to the resume.

**Acceptance Scenarios**:

1. **Given** a reviewer in the experience section, **When** they scan the entries, **Then** roles,
   employers, locations, periods, and verified highlights appear in reverse chronological order.
2. **Given** a reviewer in the about section, **When** they inspect the supporting information,
   **Then** they see focused skill groups, verified education, and concise personal context without
   unsupported proficiency or seniority claims.

### Edge Cases

- An unknown `/work/[slug]` address returns a not-found outcome that is not indexed and offers a
  clear route back to selected work.
- Missing project screenshots, live URLs, repository URLs, or professional-profile URLs do not
  create empty frames, placeholder controls, `#` links, or fabricated product imagery.
- Employment periods used on projects are labeled as experience context when exact project dates
  are unavailable.
- Long headings, technology labels, translated browser chrome, 200% zoom, and a 320 CSS-pixel
  viewport do not cause horizontal page scrolling or obscure essential content.
- If custom web fonts are delayed or unavailable, the content remains legible and the layout uses
  compatible fallback fonts.
- With JavaScript unavailable, the static content and direct links remain readable; only explicit
  client-side enhancements such as theme selection, active-section indication, utility-popover
  behavior, and direction-aware header density may be unavailable.
- Reduced-motion users receive immediate state changes without smooth scrolling, parallax, or
  non-essential transition sequences.

## Clarifications

### Session 2026-07-22

- Q: Which source governs factual portfolio claims? → A: The supplied current resume overrides the
  old portfolio; explicit user-approved sources may add verified links or materials.
- Q: Which featured projects are included in version one? → A: Nudge, Philips Greenheart, and the
  Workforce Management System.
- Q: What is the initial theme behavior? → A: Light is the default; an explicit light or dark choice
  persists across navigation and reloads.
- Q: How does contact work? → A: Use direct email and an approved resume download; do not build a
  contact-form backend.
- Q: What happens when project media or URLs are unavailable? → A: Omit unavailable controls and
  media; use only original abstract visuals, approved assets, or verified links.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST present, in order, a header, hero, verified proof points, exactly
  three featured projects, experience, skills and about content, a contact call to action, and a
  footer.
- **FR-002**: The global header MUST identify Pavan, provide routes to Work, Experience, About, and
  Contact, expose the theme control, and make the approved resume available when present. On wide
  viewports it MUST compact after deliberate downward scrolling and expand after upward scrolling,
  near the page top, on route changes, or when keyboard focus enters it, without removing section
  destinations or accessible action names.
- **FR-003**: Narrow viewports MUST replace the desktop header with a persistent, safe-area-aware
  bottom navigation for Work, Experience, About, and Contact plus a separate, accessibly named
  utility control for Home, theme, and résumé. The utility surface MUST support Escape and outside
  dismissal, destination-close behavior, and focus restoration; the combined navigation MUST not
  cause horizontal overflow or obstruct final-page content at 320 CSS pixels.
- **FR-004**: The hero MUST state Pavan's name, Software Engineer role, web/mobile/backend focus, and
  evidence-based positioning, with actions for selected work and direct email.
- **FR-005**: Proof points MUST use only resume-verified values and MUST retain enough context to
  avoid misattributing a metric to the wrong role or project.
- **FR-006**: Featured work MUST consist of Nudge, Philips Greenheart, and Workforce Management,
  with the canonical paths `/work/nudge`, `/work/philips-greenheart`, and
  `/work/workforce-management-system`.
- **FR-007**: Every project card and its case study MUST use one consistent record so title,
  summary, technologies, context, facts, and navigation cannot drift.
- **FR-008**: Every case study MUST present a hero, role and organization context, technology list,
  project facts, challenge, approach, outcome, Pavan's contribution, original or approved visual,
  and next-project navigation.
- **FR-009**: Project dates MUST be omitted when unverified; an employment period MAY appear only
  with an “Experience context” label.
- **FR-010**: A project fact MUST distinguish quantitative evidence from a qualitative capability
  and MUST NOT present qualitative labels as measured outcomes.
- **FR-011**: The homepage MUST present Ownpath, Sonai Engineering & Services, and DRDO experience
  in reverse chronological order with resume-backed roles, periods, locations, and highlights.
- **FR-012**: Skills MUST be grouped by relevant capability, and education and personal copy MUST
  avoid unsupported proficiency, residence, seniority, or experience-duration claims.
- **FR-013**: Contact actions MUST use the approved public email. The phone number MUST NOT be
  surfaced in page copy; it MAY remain inside the explicitly approved downloadable resume.
- **FR-014**: External professional, live-project, and repository links MUST appear only when a
  concrete URL has been approved or verified; unavailable links MUST be omitted rather than
  disabled or pointed to placeholders.
- **FR-015**: External links that open a new tab MUST disclose that behavior accessibly and protect
  the opener context. Same-site and email links MUST preserve expected browser behavior.
- **FR-016**: The initial color theme MUST be light. An explicit user choice MUST persist across
  routes and reloads, and theme initialization MUST not expose incorrect colors before settling.
- **FR-017**: Every public page MUST reflow without horizontal page scrolling from 320 CSS pixels
  through large desktop widths and remain usable at 200% zoom.
- **FR-018**: The visual system MUST use the approved light, dark, brand, spacing, container,
  typography, radius, shadow, and timing foundations documented in the design system.
- **FR-019**: Every interactive component contract MUST cover default, hover where applicable,
  pressed, focus-visible, disabled where applicable, dark-theme, narrow-viewport, and
  reduced-motion states.
- **FR-020**: Every page MUST provide semantic landmarks, a single primary heading, logical heading
  order, visible keyboard focus, meaningful accessible names, sufficient contrast, and text
  alternatives for informative visuals. Interactive targets MUST meet WCAG 2.2 AA minimum target-
  size requirements and SHOULD reach 44 by 44 CSS pixels where layout permits.
- **FR-021**: Motion MUST be restrained to 150–300 milliseconds for ordinary interface feedback
  and MUST be removed or simplified when reduced motion is requested.
- **FR-022**: The homepage and each case study MUST provide a unique title, description, canonical
  address, social-preview metadata, and appropriate structured data.
- **FR-023**: The site MUST publish a sitemap containing the homepage and three case studies, a
  robots policy for public pages, and a non-indexable response for unknown case studies.
- **FR-024**: Project media MUST be optional. Missing media MUST collapse cleanly; original abstract
  visuals MUST describe concepts without impersonating real product screenshots.
- **FR-025**: The design system MUST be documented for foundations, component contracts, layout
  patterns, accessibility, motion, content voice, and do/don't guidance.
- **FR-026**: The public experience MUST remain usable in the current and previous major versions
  of Chrome, Safari, Firefox, and Edge, including contemporary iOS Safari and Android Chrome.
- **FR-027**: Version one MUST remain a static public portfolio without a CMS, runtime database,
  authentication, blog, analytics, cookies, contact-form backend, services funnel, or heavy 3D
  effects.
- **FR-028**: All public facts MUST be traceable to the current resume or an explicit approved
  source, and all supplied or client-owned media MUST have confirmed publication permission.

### Key Entities

- **Profile**: Pavan's approved public identity, role, contact channel, positioning, education,
  proof points, and about copy.
- **Project Case Study**: A uniquely addressed featured project with summary, role, organization,
  experience context, technologies, narrative sections, contributions, facts, optional media,
  and optional approved links.
- **Project Fact**: A value and label tied to a project, classified as a measured result or a
  qualitative capability so the presentation cannot imply unsupported measurement.
- **Experience Item**: An employer, role, location, period, verified highlights, and related skills.
- **Skill Group**: A labeled collection of resume-backed skills used to keep the homepage focused.
- **Professional Link**: An approved label, destination, accessible name, and external-link policy.
- **Navigation Item**: A stable label and destination used consistently by desktop, mobile, and
  footer navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any public page, a hiring reviewer can reach a pre-addressed email action in no
  more than two intentional interactions.
- **SC-002**: The homepage contains exactly three featured projects and all required profile,
  proof, experience, skills, about, and contact content without a dead or placeholder control.
- **SC-003**: All three case studies open successfully both from the homepage and by direct address,
  while an unknown project address produces a non-indexable not-found outcome.
- **SC-004**: One hundred percent of factual employment, education, project, technology, and impact
  claims have an identified approved source; zero unsupported numeric claims ship.
- **SC-005**: Automated accessibility evaluation reports zero violations on every public page in
  both themes, and manual keyboard, focus, zoom, reflow, and screen-reader checks pass.
- **SC-006**: No public page introduces horizontal page scrolling at 320 CSS pixels or at 200% zoom,
  and every primary action remains reachable without pointer input.
- **SC-007**: A chosen theme remains unchanged after route navigation and reload, while first-time
  visitors receive the light theme without a visible incorrect-theme state.
- **SC-008**: Production audits score at least 90 for performance and at least 95 for accessibility,
  search readiness, and implementation best practices on the homepage and all case studies.
- **SC-009**: Every indexable route has unique, valid social-preview and canonical metadata; the
  sitemap contains exactly the homepage and three canonical case-study addresses.
- **SC-010**: With reduced motion requested, no essential understanding or action depends on
  animation and all non-essential transitions and smooth scrolling are removed or simplified.
- **SC-011**: The portfolio passes its lint, type, unit, critical journey, link, metadata, visual,
  accessibility, and production-build release gates with no unresolved critical defect.

## Assumptions

- The primary audience is recruiters and engineering hiring managers evaluating Pavan for
  full-time software engineering roles.
- The site is English-only in version one; resume language names are shown without unverified
  proficiency labels if they are included.
- The supplied resume is the factual baseline. Approved URLs recovered from the former portfolio
  may be used, but its older narrative does not override the resume.
- Abstract visuals authored for this site are acceptable until Pavan supplies approved project
  screenshots; absence of screenshots does not block the case-study narrative.
- A curated text resume is the initial accessible download. It retains verified career content
  while omitting the source file's phone number until Pavan explicitly approves publishing it. A
  styled public PDF can replace it later without changing the information architecture.
- Deployment is to a public Vercel environment with a configurable canonical site address.
- No runtime user data is collected, stored, or transmitted by the portfolio itself.

## Out of Scope

- A CMS, database, authenticated administration, user accounts, blog, analytics, cookie banner,
  backend contact form, services sales funnel, or heavy 3D/continuous animation.
- Fabricating project dashboards, launch status, user counts, performance figures, testimonials,
  or client-confidential implementation detail.
- Publishing the phone number in page copy, metadata, media, or the downloadable resume without
  explicit approval. The current curated download omits it.
