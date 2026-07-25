# Pavan Patil — Portfolio

A hiring-focused software-engineering portfolio built with Next.js App Router, TypeScript, Tailwind CSS 4, and open-source HeroUI v3.

The site presents three résumé-verified case studies, professional experience, technical strengths, direct contact paths, light and dark themes, and statically generated metadata. Its visual language is original: the public HeroUI Pro showcase informed broad layout and interaction principles, but no proprietary template code or assets are included.

## Stack

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- HeroUI v3
- `next-themes`
- Vitest and Testing Library
- Playwright and Axe
- Lighthouse CI
- GitHub Spec Kit v0.13.2

## Local development

Use Node.js 24 LTS. The repository includes an `.nvmrc` and enforces the supported major through `package.json`.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`NEXT_PUBLIC_SITE_URL` must be the canonical production origin, without a trailing slash. Vercel's production URL is used automatically when that variable is absent.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
npm run test:lighthouse
```

Playwright browser binaries must be available in the local or CI environment before the end-to-end suite runs. Visual baselines are intentionally reviewed and generated in the target CI environment to avoid cross-platform rendering drift.

## Content model

Editable portfolio content lives in `content/portfolio.ts`. Project cards, case-study routes, metadata, and structured data consume the same typed records through `src/lib/portfolio.ts` so verified facts cannot drift between views.

Use `content/README.md` for the edit checklist and `docs/design-system/content.md` for voice, evidence, and claim rules.

The public résumé file intentionally omits the private phone number from the supplied source résumé. Replace or augment project media only with assets approved for public use.

## Documentation

- Design system: `docs/design-system/`
- Product and implementation specification: `specs/001-portfolio-foundation/`
- Governing engineering principles: `.specify/memory/constitution.md`

The Spec Kit workflow stops after `analyze` for review. In Codex, commands use the `$speckit-*` skill names, such as `$speckit-specify` and `$speckit-plan`.

## Deployment

The target is Vercel. Before production deployment:

1. Set `NEXT_PUBLIC_SITE_URL` to the canonical domain.
2. Run every quality command above against the production build.
3. Complete the manual accessibility checklist in the design-system documentation.
4. Review the generated Open Graph card at `public/og.png`.

No CMS, database, backend contact form, authentication, analytics, or unlicensed HeroUI Pro assets are used in version one.
