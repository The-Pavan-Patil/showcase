# Portfolio Content

Most website text and repeatable content lives in `portfolio.ts`.

Edit this folder when you need to change:

- hero/profile copy;
- email and social links;
- homepage proof metrics;
- selected work and case studies;
- experience entries and client projects;
- skill groups.

The app imports this content through `src/lib/portfolio.ts`, so cards, case-study pages, metadata, and structured data stay in sync.

After editing content, run:

```bash
npm run typecheck
npm test -- tests/unit/portfolio.test.ts
```

Use `docs/design-system/content.md` as the writing guide before adding new claims, metrics, dates, links, or project details.
