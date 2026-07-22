# Design-system examples

These comparisons turn the portfolio system into implementation rules. They supplement the state matrix in [Components](./components.md) and the evidence rules in [Content](./content.md).

## Tokens

| Do | Don’t |
| --- | --- |
| Use `var(--surface)` for a card in both themes. | Add a component-only white background and a separate dark override. |
| Use `var(--accent)` for a filled action and `var(--accent-text)` for blue text. | Put `#0485F7` on small text; it is decorative only. |
| Use `var(--radius-card)`, `var(--radius-feature)`, or `var(--radius-panel)` according to surface hierarchy. | Introduce another large radius because one card looks slightly different. |
| Use `var(--motion-fast)` or `var(--motion-base)` for feedback. | Add an unbounded or looping decorative animation. |

## Navigation and actions

| Do | Don’t |
| --- | --- |
| Use a semantic `nav` with a list and `aria-current="location"` for the observed section. | Use positioned text spans with click handlers. |
| Name icon controls by their action: “Switch to dark theme.” | Name a control after its icon: “Moon.” |
| Keep one explicit, descriptive case-study link in each project card. | Hide required navigation behind hover or make nested links inside a clickable card. |
| Omit an unavailable live or repository link. | Render `#`, “coming soon,” or a disabled-looking fake link. |

## Project evidence

| Do | Don’t |
| --- | --- |
| Say “1,000+ worker records” because the résumé supports it. | Invent a precise dashboard count or attendance percentage. |
| Label Ownpath or Sonai dates as “Experience context.” | Present employment dates as an exact project schedule. |
| Describe an abstract diagram as a system concept. | Present an invented interface as a literal client screenshot. |
| State a delivered capability when no outcome metric is verified. | Turn qualitative words such as “real-time” into an implied measured result. |

## Responsive composition

| Do | Don’t |
| --- | --- |
| Collapse layouts at the point their content needs space. | Choose breakpoints only because a device name is familiar. |
| Let email text wrap and keep actions reachable at 320px. | Reduce readable text or allow horizontal page scrolling. |
| Preserve headings, content order, and explicit actions without motion. | Depend on animation, parallax, or hover to explain hierarchy. |
