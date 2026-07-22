# Layout and Experience Patterns

## Information architecture

### Homepage

The homepage follows a recruiter-first reading order:

1. Fixed header with direct section access, theme, and résumé.
2. Hero with role, value proposition, direct work/email actions, location, and system illustration.
3. Four verified proof metrics.
4. Three featured case studies.
5. Chronological professional experience.
6. About, education, and categorized skills.
7. Direct email and approved social links.
8. Footer.

This order moves from positioning to evidence to conversion. Do not place a generic biography or skill cloud before selected work.

### Case study

Every /work/[slug] route is statically generated from the shared projects collection. A case study moves from context to evidence:

1. Identify the project and Pavan’s role.
2. State the experience context rather than implying a separate product date.
3. Show honest project facts and an abstract explanatory visual.
4. Explain challenge, approach, and outcome.
5. Name verified contributions.
6. Continue to the next project.

## Container and full-bleed sections

Section backgrounds and borders span the viewport. Content alignment uses Container. This produces continuous proof and experience bands while keeping text on the same 72rem grid.

Use a nested reading width only for long prose. The current body-copy caps of 36–45rem are intentional.

## Grid patterns

| Pattern | Wide | 1024px and below | 760px and below |
| --- | --- | --- | --- |
| Hero | Two balanced columns | One column | One column with reduced visual scale |
| Proof metrics | Four columns | Four columns | Two by two |
| Project cards | 12-column; 12 + 6 + 6 spans | Featured card loses internal split | One column |
| Experience | Index / role / meta / highlights | Highlights move below | Two-column index/content stack |
| About / skills | 0.82 / 1.18 | One column | Skills collapse to one column |
| Contact | 1.25 / 0.75 | Same | One column |
| Case hero | 1.45 / 0.55 | 1 / 0.6 | One column |
| Case facts | Three columns | Three columns | One column |
| Case narrative | 0.42 / 1 | Same | One column |
| Contribution | 0.85 / 1.15 | Same | One column |

## Responsive rules

### Above 1024px

Use the full editorial composition: split hero, floating system windows, featured project split, and multi-column experience.

### 761–1024px

Stack the hero, keep the system visual centered and capped at 44rem, simplify the featured card, and move experience highlights below the role/meta columns.

### 421–760px

Use the mobile Drawer, one-column project and content grids, a two-by-two proof grid, smaller section intervals, and stacked case-study facts.

### 320–420px

Stack both hero actions, remove the nonessential product-stack window, shrink diagram internals, and allow the email action to wrap. Decorative complexity gives way before content does.

## Visual composition

The hero and project visuals share three motifs:

- a subtle one-pixel grid;
- a restrained blue radial glow;
- white/dark semantic surfaces with thin borders and layered shadow.

Use these motifs to communicate system structure. Avoid rotating borders, animated gradients, excessive glass, “wizard” language, or multiple competing effects.

## Content-to-route pattern

Project cards and case-study routes must consume the same ProjectCaseStudy record. A title, metric, technology, role, or link must never be copied into a second page-specific object.

The current project interface contains:

- slug;
- title, kicker, and card headline;
- summary;
- role, experience context, and client/company;
- technologies;
- challenge, approach, and outcome;
- contributions and metrics;
- visual variant and accessible label.

Add a field to the shared type before displaying new project information. Live, repository, and media support is a deferred optional enhancement and may be added after approved URLs/assets exist.

## Navigation patterns

- Homepage section links use root-qualified hashes so they work from case-study routes.
- Homepage section observation marks the most relevant Work, Experience, About, or Contact link with aria-current="location" in both navigation variants.
- Every case-study route treats Work as the current location.
- html scroll-padding and section scroll-margin both clear the fixed header.
- The résumé is a direct download, not a modal.
- Email uses a direct mailto destination; no backend form is implied.
- External social links open a new tab and include noopener/noreferrer.
- The next-project pattern cycles through all three projects.

## Metadata pattern

The root layout owns shared title, description, canonical base, social card, robots, and viewport colors. Each case study generates title, description, canonical path, and article social metadata from its project record. Person and CreativeWork structured data mirror visible content.

Do not put a claim in metadata or structured data that is absent from visible, verified content.

## Do / don’t

| Do | Don’t |
| --- | --- |
| Keep evidence visible within the first two homepage sections. | Hide all outcomes behind case-study clicks. |
| Collapse columns before text becomes cramped. | Scale desktop layouts down uniformly. |
| Remove secondary decorative layers at 420px. | Remove the project title, action, or evidence to save space. |
| Use shared records for cards, routes, metadata, and structured data. | Maintain separate project copies for different views. |
| Use abstract diagrams when approved screenshots do not exist. | Present a fabricated diagram as an actual product screenshot. |
