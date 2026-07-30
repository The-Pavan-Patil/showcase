# Content System

## Voice

The portfolio voice is direct, specific, calm, and technically literate. It should sound like an engineer explaining real work to a recruiter or engineering hiring manager.

Use:

- first person for Pavan’s decisions and contribution;
- active verbs such as built, implemented, deployed, reduced, processed, and delivered;
- concrete constraints, technologies, and verified outcomes;
- short sentence-case headings;
- plain language before implementation detail.

Avoid:

- “wizard,” “ninja,” “rockstar,” “10x,” and generic visionary claims;
- unsupported superlatives such as “world-class” or “industry-leading”;
- claims that convert team or product outcomes into individual ownership without evidence;
- dense acronym lists with no product context;
- sales-funnel language for services, since the main goal is full-time employment.

## Evidence hierarchy

When sources disagree, use this order:

1. Current résumé supplied for this project.
2. User-approved corrections or project materials.
3. Public old portfolio only for non-conflicting context and approved destination discovery.

Never publish a metric, date, employer, client, technology, live link, repository link, or screenshot because it appears in an old site if the current résumé contradicts it.

## Typed content contracts

### ProjectCaseStudy

Required fields:

- slug;
- title;
- summary;
- role;
- experienceContext;
- client;
- technologies;
- challenge;
- approach;
- outcome;
- contributions;
- metrics;
- visual and visualLabel.

The current implementation also uses kicker and cardHeadline for concise card hierarchy.

The approved planning interface also anticipated dates, media, and optional live/repository links. The current type uses experienceContext instead of claiming product dates. Media and live/repository fields are deferred optional enhancements because approved assets and URLs have not been supplied; add them only when those inputs exist.

Dates on projects are labeled **Experience context** because the résumé verifies employment periods, not necessarily standalone product start/end dates.

Use quantitative metrics only when the résumé or approved evidence supports the number. Qualitative facts such as “Offline-first” and “Multilingual” are acceptable when the underlying work verifies them.

### ExperienceItem

Required fields:

- company;
- role;
- period;
- location;
- verified highlights.

Highlights should lead with delivered work, then architecture or technology, then a verified scale or outcome. Keep each highlight independently defensible.

### SocialLink

Required fields:

- visible label;
- approved URL;
- accessible destination label.

Only GitHub and LinkedIn are currently approved. Phone is deliberately not public. Email is displayed through the profile record.

## Page copy patterns

### Hero

Use:

- a role/category eyebrow;
- a two-part value proposition;
- one short paragraph naming domains and representative work;
- a primary selected-work action and direct email action;
- a factual location/availability note.

The current headline, “I build dependable software for complex, real-world workflows,” is the tonal model: confident, specific, and free of exaggerated claims.

### Project card

Use this sequence:

1. Project category.
2. Outcome- or constraint-led headline.
3. Two-sentence maximum summary.
4. Up to four technologies.
5. Explicit case-study action.

### Case study

- **Challenge:** describe the product or operational constraint, not a vague aspiration.
- **Approach:** state what Pavan implemented and the architecture or workflow used.
- **Outcome:** state the delivered capability or verified improvement.
- **Contribution:** use discrete, résumé-supported actions.

Do not imply access to confidential client data, internal screenshots, or business results that are not approved. Abstract diagram labels must use verified values or clearly qualitative capabilities; the current operations visual therefore uses “1,000+,” “Multi-site,” and “Automated” rather than invented dashboard percentages or site names.

### Contact

Keep the conversion direct: open role context, anonymous one-way message, email address, résumé, GitHub, and LinkedIn. The quick message path may send message-only text to a private Discord webhook, but do not imply registration, a reply field, stored history, guaranteed response time, availability calendar, consultancy offer, or newsletter.

## Capitalization and terminology

- Use sentence case for headings and buttons.
- Preserve official names: Next.js, TypeScript, React Native, PowerSync, Supabase, PostgreSQL, MongoDB, AWS, WebGL, Three.js, LiDAR, and DRDO.
- Use “résumé” in visible copy; the download filename may use ASCII.
- Use an en dash for ranges and a middle dot for compact metadata.
- Write “1,000+” and “<100 ms” exactly when supported by evidence.

## Do / don’t examples

| Do | Don’t |
| --- | --- |
| “Built a workforce platform supporting 1,000+ worker records.” | “Revolutionized workforce management at massive scale.” |
| “Used PowerSync with Supabase PostgreSQL for offline-first synchronization.” | “Created a flawless offline experience.” |
| “Reduced transfer latency between Python and Node.js services by 30%.” | “Made the pipeline dramatically faster.” |
| “Experience context: Ownpath · Nov 2025–Present.” | “Project duration: Nov 2025–Present” when only employment dates are known. |
| “Abstract operations dashboard showing worker, attendance, and payroll workflows.” | “Screenshot of the production dashboard” for a constructed visual. |
| Omit a repository field until an approved URL exists. | Invent, guess, or scrape a repository link. |

## Content review checklist

- Every claim maps to a résumé line or approved source.
- Metrics retain their original scope and unit.
- Individual contribution is distinguished from team/product outcome.
- Dates are labeled accurately.
- Cards and routes render the same record.
- Metadata and structured data do not exceed visible claims.
- All external links are current and approved.
- Every visual label describes what the illustration communicates.
- No confidential, licensed, or fabricated asset is presented as product proof.
