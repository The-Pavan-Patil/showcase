# Site Contract: Portfolio Foundation

This contract defines the stable public routes, content invariants, interactions, and metadata that
the implementation exposes. It is a UI contract, not a network API.

## Public Route Contract

| Route | Indexable | Primary content | Recovery / onward action |
|-------|-----------|-----------------|---------------------------|
| `/` | Yes | Profile, proof, three projects, experience, skills/about, contact | Email, resume, case studies |
| `/work/nudge` | Yes | Nudge case study | Selected work and next project |
| `/work/philips-greenheart` | Yes | Philips Greenheart case study | Selected work and next project |
| `/work/workforce-management-system` | Yes | Workforce Management case study | Selected work and next project |
| `/work/[unknown]` | No | Custom not-found explanation | `/#work` |
| `/sitemap.xml` | Yes | Exactly the four canonical indexable routes | Absolute URLs |
| `/robots.txt` | Yes | Public crawl policy and sitemap reference | Sitemap URL |
| `/opengraph-image` | Yes | 1200x630 branded social image | Used by route metadata |

The homepage owns stable section targets `#work`, `#experience`, `#about`, and `#contact`.
Fixed-header offset behavior keeps the target heading visible after fragment navigation.

## Homepage Contract

- Exactly one visible `h1` identifies the primary positioning.
- `main` has the target `main-content`; a skip link is the first keyboard-reachable control.
- Selected work contains exactly three project articles in canonical project order.
- Every project link has a descriptive accessible name containing the project title.
- Experience is reverse chronological and visibly separates role, organization, period, location,
  and highlights.
- Email actions use `mailto:thepavanpatil.official@gmail.com`.
- The resume action downloads `/pavan-patil-resume.txt` until an approved PDF replaces it.
- Professional links are omitted unless a concrete approved URL exists. Links opening a new tab use
  `rel="noopener noreferrer"` and communicate the new context in their accessible name.

## Case-Study Contract

- Route data comes from the same `ProjectCaseStudy` record used by the homepage card.
- Every page has one `h1`, a selected-work back link, role, experience context, client/company,
  technologies, challenge, approach, outcome, contributions, facts, an original or approved visual,
  and next-project navigation.
- `experienceContext` is labeled exactly “Experience context” and does not assert exact project
  dates.
- A qualitative `ProjectFact` is presented as a capability, not a measured business result.
- Next-project order cycles Nudge -> Philips Greenheart -> Workforce Management -> Nudge.
- Unknown slugs call the framework not-found boundary and expose `noindex, nofollow` metadata.
- Missing optional media or project links produce no empty container or inactive control.

## Header and Responsive Navigation Contract

- The brand link returns home and has the accessible name “Pavan Patil, home”.
- Desktop navigation is a semantic `nav` list with Work, Experience, About, and Contact.
- Desktop navigation begins as a 60px-high regular-glass surface capped at 64rem. After the page is
  below 96px and 24px of downward travel accumulates, it compacts to 48px and approximately 44rem.
- Sixteen pixels of upward travel, returning within 64px of the page top, route changes, or keyboard
  focus entering the header restores the expanded state. Section destinations remain visible in
  both densities.
- At 760px and below, the desktop header is absent. A persistent safe-area-aware bottom pill exposes
  Work, Experience, About, and Contact with icons above labels and an inner active capsule.
- A separate, accessibly named utility orb opens a HeroUI Popover containing Home, theme, and résumé.
  Escape, outside interaction, a destination, or a completed theme action dismisses it and restores
  focus according to the Popover contract.
- Mobile navigation never compacts while scrolling and must not obstruct the footer or create
  horizontal overflow at 320 CSS pixels.
- Selecting any fragment from a case-study route returns to the corresponding homepage target.

## Theme Contract

- First visit: light.
- Explicit choices: light or dark, stored under one stable browser-storage key.
- Reload and route navigation: preserve the explicit choice.
- Theme attribute: root class used by both design tokens and HeroUI styles.
- Before mounted state is known, the toggle exposes no contradictory icon or accessible label.
- Toggle labels are action-oriented: “Switch to dark theme” and “Switch to light theme”.
- System preference does not override the light-first default.

## Responsive, Accessibility, and Motion Contract

- Supported reflow range begins at 320 CSS pixels; no page-level horizontal scrolling is allowed.
- Content and actions remain available at 200% zoom.
- Touch targets meet WCAG 2.2 minimum target-size rules and SHOULD reach 44x44 CSS pixels where
  layout permits.
- Focus is visible in both themes and is never indicated by color alone.
- Informative visuals have text alternatives; decorative SVG/icon content is hidden from the
  accessibility tree.
- Ordinary feedback transitions are 150–300ms. Reduced-motion mode disables smooth scrolling,
  transform travel, parallax, and non-essential transitions.

## Metadata Contract

Every indexable page supplies a unique non-empty title, description, canonical URL, Open Graph URL,
Open Graph title/description/image, and Twitter summary-large-image metadata.

- Homepage structured data: `Person` with name, job title, canonical URL, approved email,
  approved professional URLs, and skills.
- Case-study structured data: `CreativeWork` with name, description, canonical URL, creator, and
  technologies.
- JSON-LD serialization MUST escape `<` as `\u003c` before insertion.
- Canonical origin resolution order is `NEXT_PUBLIC_SITE_URL`,
  `VERCEL_PROJECT_PRODUCTION_URL`, then local development origin.
- Sitemap route count is exactly four until the specification changes.

## Error and Degradation Contract

- Unknown work path: branded not-found content with recovery; never a blank page.
- Missing optional link/media: omit the interface.
- Failed same-origin request or internal link: release-blocking defect.
- Third-party link outage: report separately; syntax and approval remain the release gate because a
  transient external outage must not make pull-request tests flaky.
- Font failure: compatible fallbacks preserve reading order and legibility.
- JavaScript failure: server-rendered content, internal routes, email, resume, and professional
  anchors remain usable; only theme, active-section, Popover, and density enhancements may degrade.
