# Pavan Portfolio Design System

This design system supports a hiring-focused software-engineering portfolio. It is an original system informed by HeroUI Pro’s public presentation principles—clean hierarchy, disciplined spacing, restrained surfaces, and direct interaction feedback—without copying proprietary source, templates, fonts, screenshots, or assets.

The system is light-first, supports an optional dark theme, and uses verified professional evidence as the basis for every claim.

## Principles

1. **Make the work legible.** Recruiters should understand the role, evidence, and outcome before encountering decorative detail.
2. **Show systems thinking.** Grids, diagrams, metrics, and case-study structure should reinforce a dependable engineering narrative.
3. **Use one visual language.** Components consume the same color, type, spacing, radius, and motion decisions.
4. **Design accessibly by default.** Semantics, keyboard operation, visible focus, responsive layouts, and reduced motion are release requirements.
5. **Prefer evidence to spectacle.** Motion and illustration support comprehension; they never replace content or invent product proof.

## Documentation map

- [Foundations](./foundations.md): colors, typography, spacing, layout, radius, elevation, icons, and themes.
- [Components](./components.md): component contracts and the complete interaction-state matrix.
- [Patterns](./patterns.md): page composition, responsive behavior, grids, and case-study structure.
- [Accessibility](./accessibility.md): WCAG 2.2 AA requirements, implementation guidance, and the current audit.
- [Motion](./motion.md): durations, easing, transformations, and reduced-motion behavior.
- [Content](./content.md): voice, résumé evidence rules, typed content contracts, and do/don’t examples.
- [Examples](./examples.md): implementation-ready token, component, and content do/don’t comparisons.

## Sources of truth

| Concern | Implemented source |
| --- | --- |
| Global tokens and component styling | src/app/globals.css |
| Inter and Manrope loading | src/app/layout.tsx |
| Theme behavior | src/components/providers.tsx |
| Shared content and project records | src/lib/portfolio.ts |
| Page width | src/components/container.tsx |
| Section heading composition | src/components/section-heading.tsx |
| Direction-aware header and mobile bottom navigation | src/components/site-header.tsx |
| Project cards and diagrams | src/components/project-card.tsx and src/components/project-visual.tsx |
| Homepage composition | src/app/page.tsx |
| Case-study composition | src/app/work/[slug]/page.tsx |

The CSS variables are the runtime token source. This documentation records both the current implementation and the contract future work must preserve.

## Status language

- **Implemented** means the behavior exists in the current code.
- **Required** means new or changed components must provide the behavior.
- **Gap** means the current implementation needs follow-up before claiming full conformance.

## Library boundary

HeroUI v3 supplies accessible primitives such as Button, Card, Chip, and Popover. Portfolio-owned components supply the semantic structure, content model, visual hierarchy, and styling. The header is deliberately owned by the portfolio because HeroUI v3 does not provide a Navbar component.

Do not introduce HeroUI Pro source, licensed templates, copied screenshots, or unverified product imagery. When a real screenshot is unavailable, use an honest system diagram like the current ProjectVisual compositions.
