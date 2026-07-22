# Data Model: Portfolio Foundation

All entities are immutable, source-controlled records. They have no server-side lifecycle or
database identity. TypeScript supplies compile-time shape checks; unit tests enforce cross-record
invariants that types alone cannot express.

## Profile

Represents the approved public identity and homepage positioning.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Exactly the approved public name, Pavan Patil |
| `role` | string | Yes | Resume-backed role; no unsupported seniority |
| `email` | email string | Yes | Approved public contact address |
| `heroEyebrow` | string | Yes | Concise, evidence-backed capability scope |
| `heroTitle` | string | Yes | Plain-language positioning, not a factual metric |
| `heroAccent` | string | Yes | Completes the title without duplicating it |
| `heroDescription` | string | Yes | Resume-backed summary with no invented duration or impact |
| `about` | string | Yes | Concise professional context |
| `education` | string | Yes | Institution, qualification, and verified result |

**Relationships**: One profile owns the public email, proof points, experience collection, skill
groups, and approved professional links.

## ProjectCaseStudy

Represents one featured project and supplies both its homepage card and detail route.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `slug` | project slug | Yes | Unique; one of `nudge`, `philips-greenheart`, `workforce-management-system` |
| `title` | string | Yes | Matches approved project name |
| `kicker` | string | Yes | Short project category |
| `cardHeadline` | string | Yes | Evidence-based card headline |
| `summary` | string | Yes | One concise, resume-backed overview |
| `role` | string | Yes | Pavan's verified role |
| `experienceContext` | string | Yes | Employment label and period; not presented as exact project dates |
| `client` | string | Yes | Approved client or company attribution |
| `technologies` | readonly string[] | Yes | Non-empty, deduplicated, resume-backed list |
| `challenge` | string | Yes | Problem inferred conservatively from documented work |
| `approach` | string | Yes | Pavan's verified technical actions |
| `outcome` | string | Yes | Verified delivery; no invented business result |
| `contributions` | readonly string[] | Yes | At least two distinct, action-led contributions |
| `metrics` | readonly ProjectFact[] | Yes | At least one fact; qualitative values are labeled as capabilities |
| `visual` | ProjectVisual | Yes | One original abstract visual key |
| `visualLabel` | string | Yes | Meaningful accessible description of the visual concept |
| `media` | readonly ProjectMedia[] | No | Rendered only for approved assets |
| `links` | readonly ProjectLink[] | No | Rendered only for verified concrete destinations |

**Relationships**: Exactly three records belong to the profile. Card, route, metadata, JSON-LD,
sitemap, and next-project navigation derive from this collection. Order is the canonical featured
and cyclic next-project order.

## ProjectFact

Represents a concise proof card within a case study.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `value` | string | Yes | Quantified resume value or explicit qualitative capability |
| `label` | string | Yes | Provides context and does not imply measurement when none exists |
| `kind` | `metric` or `capability` | Yes | Controls semantic presentation and prevents misleading labels |

## ProjectMedia

Represents an optional approved screenshot or image.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `src` | same-origin path | Yes | Existing licensed or approved asset |
| `alt` | string | Yes | Describes informative content; empty only when explicitly decorative |
| `caption` | string | No | States context without implying unverified results |
| `width` | positive integer | Yes | Intrinsic pixel width |
| `height` | positive integer | Yes | Intrinsic pixel height |

## ProjectLink

Represents an optional live project or repository destination.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `kind` | `live` or `repository` | Yes | Determines the visible label |
| `href` | HTTPS URL | Yes | Concrete, verified destination; never `#` or placeholder |
| `ariaLabel` | string | Yes | Names the project, destination, and new-tab behavior |

## ExperienceItem

Represents one reverse-chronological employment or internship entry.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `company` | string | Yes | Resume-backed organization name |
| `role` | string | Yes | Resume-backed title |
| `period` | string | Yes | Resume-backed display range |
| `location` | string | Yes | Organization location from the resume; not personal residence |
| `highlights` | readonly string[] | Yes | Non-empty, action-led, resume-backed statements |

**Relationships**: Belongs to the profile. Entries are ordered newest first: Ownpath, Sonai, DRDO.

## ProofPoint

Represents a quantified homepage evidence item.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `value` | string | Yes | Exact resume-backed value |
| `label` | string | Yes | Identifies the measured context without ambiguity |

The approved set is `1,000+` worker records, `<100 ms` LiDAR response time, `10 GB+` daily
point-cloud processing, and `30%` lower pipeline transfer latency.

## SkillGroup

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `label` | string | Yes | Unique capability-group name |
| `skills` | readonly string[] | Yes | Non-empty, deduplicated, resume-backed skills |

## ProfessionalLink

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `label` | string | Yes | Human-readable destination name |
| `href` | HTTPS URL | Yes | Approved concrete URL |
| `ariaLabel` | string | Yes | Names owner and destination; includes new-tab behavior when relevant |

## NavigationItem

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `label` | string | Yes | Unique visible label |
| `href` | same-site URL or fragment | Yes | Existing route or section target |

The approved labels and targets are Work `/#work`, Experience `/#experience`, About `/#about`,
and Contact `/#contact`.

## UI State Transitions

### Theme

```text
unresolved -> light (first visit)
light <-> dark (explicit toggle)
persisted light/dark -> same theme (navigation and reload)
```

System preference does not alter the first-visit default. Until client mounting resolves the
stored value, the toggle does not announce an incorrect state.

### Mobile Drawer

```text
closed -> open: menu trigger
open -> closed: destination, close control, Escape, or dismissible backdrop
closed -> trigger focused: after every dismissal
```

### Project Route

```text
known slug -> generated case study -> next known slug
unknown slug -> non-indexable not-found -> selected-work recovery link
```

## Cross-Entity Invariants

1. There are exactly three project records and all slugs are unique.
2. Every project route, card, sitemap entry, and next-project link derives from the same collection.
3. Every public factual claim is traceable to an approved source.
4. Every internal navigation destination exists; every external destination is a concrete approved
   URL and uses safe new-tab semantics when applicable.
5. Project media and links are optional and create no placeholder interface when absent.
6. The phone number is omitted from page copy, structured data, metadata, and the curated resume
   download until Pavan explicitly approves publishing it.
