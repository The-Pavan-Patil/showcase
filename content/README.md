# Portfolio Content

Page content is colocated with its page implementation under `src/app/_pages/`.

Edit this folder when you need to change:

- homepage content: `src/app/_pages/home/_data/content.ts`;
- homepage localized content: `src/app/_pages/home/_data/locales.ts`;
- individual case studies: `src/app/_pages/work/_data/case-studies/`;
- case-study translations: `src/app/_pages/work/_data/case-studies/locales.ts`.

`portfolio.ts` and `portfolio-locales.ts` are lightweight compatibility entrypoints. The app imports through `src/lib/portfolio.ts`, so cards, case-study pages, metadata, and structured data stay in sync.

After editing content, run:

```bash
npm run typecheck
npm test -- tests/unit/portfolio.test.ts
```

Use `docs/design-system/content.md` as the writing guide before adding new claims, metrics, dates, links, or project details.
