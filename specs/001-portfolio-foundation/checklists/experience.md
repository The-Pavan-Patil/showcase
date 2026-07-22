# Experience Requirements Checklist: Portfolio Foundation

**Purpose**: Review the completeness, clarity, consistency, and measurability of hiring-content,
responsive UX, accessibility, theme, metadata, and publication-safety requirements
**Created**: 2026-07-22
**Feature**: [spec.md](../spec.md)

**Note**: This is a standard-depth requirements-quality checklist for PR reviewers. It evaluates
the specification, not the finished website.

## Evidence and Content Integrity

- [ ] CHK001 Are the authoritative source hierarchy and conflict rule explicit for every factual
  portfolio claim? [Completeness, Spec §Clarifications, §FR-028]
- [ ] CHK002 Are unsupported claim classes—metrics, project dates, proficiency, seniority, launch
  status, and client impact—excluded with sufficiently precise language? [Clarity, Spec §FR-009,
  §FR-010, §FR-012, §FR-028]
- [ ] CHK003 Are the exact three featured projects and their canonical slugs defined consistently
  across scenarios, requirements, and success criteria? [Consistency, Spec §US2, §FR-006, §SC-003]
- [ ] CHK004 Is the distinction between a project metric and a qualitative capability defined well
  enough to prevent misleading presentation? [Clarity, Spec §FR-010, §Key Entities]
- [ ] CHK005 Are requirements for approved, unavailable, and confidential media or destinations
  complete for both cards and detail pages? [Coverage, Spec §Edge Cases, §FR-014, §FR-024, §FR-028]
- [ ] CHK006 Is public phone-number handling consistent between page copy and the curated resume
  exception? [Consistency, Spec §FR-013, §Assumptions, §Out of Scope]

## Information Architecture and Interaction

- [ ] CHK007 Is homepage section order explicit enough to produce one unambiguous information
  hierarchy? [Completeness, Spec §FR-001]
- [ ] CHK008 Are desktop, mobile, and footer navigation destinations specified with one canonical
  set of labels and targets? [Consistency, Spec §FR-002, §FR-003, §Key Entities]
- [ ] CHK009 Are mobile-menu requirements complete for focus containment, dismissal paths, focus
  restoration, background interaction, and scroll containment? [Coverage, Spec §US3, §FR-003]
- [ ] CHK010 Are case-study recovery and next-project requirements defined for known, terminal, and
  unknown routes? [Scenario Coverage, Spec §US2, §Edge Cases, §FR-008, §FR-023]
- [ ] CHK011 Are link-context requirements clear for email, downloads, same-site destinations, and
  external new-tab destinations? [Clarity, Spec §FR-013, §FR-014, §FR-015]

## Accessibility and Responsive Coverage

- [ ] CHK012 Are semantic landmark, primary-heading, heading-order, accessible-name, and alternative-
  text requirements defined across homepage and case-study patterns? [Completeness, Spec §FR-020]
- [ ] CHK013 Are keyboard requirements complete for skip navigation, menu operation, all primary
  actions, focus visibility, and logical focus order? [Coverage, Spec §US3, §FR-003, §FR-020]
- [ ] CHK014 Are both-theme contrast and non-color state requirements stated as measurable AA
  obligations rather than subjective guidance? [Measurability, Spec §FR-020, §SC-005]
- [ ] CHK015 Are 320 CSS-pixel and 200% zoom requirements consistent between scenarios, functional
  requirements, edge cases, and outcomes? [Consistency, Spec §US3, §Edge Cases, §FR-017, §SC-006]
- [ ] CHK016 Are touch-target requirements intentionally governed by WCAG 2.2 AA, or is an explicit
  preferred target size still missing from product requirements? [Assumption, Spec §FR-020]
- [ ] CHK017 Are automated and manual accessibility completion signals both specified, including the
  known boundary of automated scanning? [Completeness, Spec §SC-005, §SC-011]

## Theme, Motion, and Visual System

- [ ] CHK018 Is light-first behavior unambiguous for first visit, explicit selection, route changes,
  reloads, and initial paint? [Clarity, Spec §US3, §FR-016, §SC-007]
- [ ] CHK019 Are reduced-motion requirements complete for scrolling, transitions, decorative travel,
  and preservation of essential understanding? [Coverage, Spec §Edge Cases, §FR-021, §SC-010]
- [ ] CHK020 Are all required interaction states named consistently for every applicable interactive
  component? [Consistency, Spec §FR-019]
- [ ] CHK021 Are the design-system foundation and documentation topics sufficiently bounded to keep
  implementation and documentation synchronized? [Completeness, Spec §FR-018, §FR-025]
- [ ] CHK022 Is the requirement for an original HeroUI-inspired visual language distinct from copying
  proprietary source, assets, screenshots, or typography? [Clarity, Spec §FR-024, §FR-028]

## Failure, Discoverability, and Scope

- [ ] CHK023 Are degradation requirements complete for missing fonts, JavaScript, optional media,
  optional links, and unknown routes? [Edge Case Coverage, Spec §Edge Cases]
- [ ] CHK024 Are metadata requirements complete and consistent for titles, descriptions, canonical
  addresses, social previews, structured data, sitemap, robots, and unknown routes? [Coverage,
  Spec §FR-022, §FR-023, §SC-009]
- [ ] CHK025 Are the performance and quality targets quantified for every indexable route rather than
  only the homepage? [Measurability, Spec §SC-008, §SC-011]
- [ ] CHK026 Are version-one exclusions explicit enough to prevent accidental CMS, backend, form,
  analytics, cookie, blog, sales-funnel, or heavy-motion scope? [Completeness, Spec §FR-027,
  §Out of Scope]

## Notes

- Check an item after reviewing the cited requirements and resolving any gap in the specification.
- If a requirement changes, re-run cross-artifact analysis so plan and tasks remain aligned.
