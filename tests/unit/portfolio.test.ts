import { describe, expect, it } from "vitest";

import {
  experience,
  getPortfolioContent,
  getNextProject,
  getProjectBySlug,
  profile,
  projects,
  socialLinks,
} from "@/lib/portfolio";
import { supportedLocales } from "@/lib/i18n";

describe("portfolio content", () => {
  it("contains exactly four unique case studies", () => {
    expect(projects).toHaveLength(4);
    expect(new Set(projects.map((project) => project.slug)).size).toBe(4);
    expect(projects.map((project) => project.slug)).toEqual([
      "mainichi-koto",
      "nudge",
      "philips-greenheart",
      "workforce-management-system",
    ]);
  });

  it.each(projects)("provides complete content for $slug", (project) => {
    expect(project.title).toBeTruthy();
    expect(project.summary.length).toBeGreaterThan(80);
    expect(project.challenge).toBeTruthy();
    expect(project.approach).toBeTruthy();
    expect(project.outcome).toBeTruthy();
    expect(project.technologies.length).toBeGreaterThanOrEqual(4);
    expect(project.metrics).toHaveLength(3);
    expect(project.visualLabel).toBeTruthy();
  });

  it("resolves valid slugs and rejects unknown slugs", () => {
    expect(getProjectBySlug("mainichi-koto")?.title).toBe("Mainichi koto");
    expect(getProjectBySlug("nudge")?.title).toBe("Nudge");
    expect(getProjectBySlug("not-a-real-project")).toBeUndefined();
  });

  it("cycles through next projects", () => {
    expect(getNextProject("mainichi-koto").slug).toBe("nudge");
    expect(getNextProject("nudge").slug).toBe("philips-greenheart");
    expect(getNextProject("workforce-management-system").slug).toBe("mainichi-koto");
  });

  it("publishes a public Mainichi koto product case study", () => {
    const mainichiKoto = getProjectBySlug("mainichi-koto");
    expect(mainichiKoto?.media?.src).toBe("/images/projects/mainichi-koto-kanji.png");
    expect(mainichiKoto?.visual).toBe("learning");
    expect(mainichiKoto?.caseStudy?.sections.map((section) => section.id)).toEqual([
      "context",
      "challenge",
      "approach",
      "word-first-learning",
      "separate-memories",
      "honest-grading",
      "preserve-progress",
      "method",
      "outcomes",
      "closing",
    ]);
    expect(JSON.stringify(mainichiKoto?.caseStudy)).toContain("Smart Kanji");
    expect(JSON.stringify(mainichiKoto?.caseStudy)).toContain("72 tests");
    expect(JSON.stringify(mainichiKoto?.caseStudy)).not.toContain("Internal Editor Notes");
    expect(JSON.stringify(mainichiKoto?.caseStudy)).not.toContain("Internal Evidence Notes");
  });

  it("publishes a concise, evidence-led Nudge case study", () => {
    const nudge = getProjectBySlug("nudge");
    expect(nudge?.media?.src).toBe("/nudge-iphone-trio.png");
    expect(nudge?.caseStudy?.sections.map((section) => section.id)).toEqual([
      "overview",
      "problem",
      "local-first-sync",
      "relationship-boundary",
      "access-control",
      "collaboration-model",
      "role-aware-gestures",
      "debugging-and-delivery",
      "principle",
    ]);
    expect(nudge?.caseStudy?.sections.every((section) => section.blocks.length > 0)).toBe(true);
    expect(JSON.stringify(nudge?.caseStudy)).not.toContain('"type":"list"');
    expect(JSON.stringify(nudge?.caseStudy)).toContain("Row Level Security");
    expect(JSON.stringify(nudge?.caseStudy)).toContain("PowerSync handled local task data and replication");
  });

  it("models experience as company-scoped project journeys", () => {
    expect(experience).toHaveLength(3);
    expect(experience.every((item) => item.logoUrl && item.description && item.technologies.length)).toBe(true);
    expect(experience.flatMap((item) => item.projects ?? [])).toHaveLength(5);
    expect(experience.map((item) => item.company)).toEqual([
      "Ownpath Pvt. Ltd.",
      "Sonai Engineering & Services",
      "Defence Research and Development Organization",
    ]);
    expect(experience[0].projects?.map((project) => project.client)).toEqual([
      "Hero Vida",
      "Philips",
      "Vendaka Pvt. Ltd.",
    ]);
  });

  it("publishes verified contact links without a phone number", () => {
    expect(profile.email).toMatch(/@/);
    expect(JSON.stringify(profile)).not.toContain("7350913864");
    expect(socialLinks.every((link) => link.href.startsWith("https://"))).toBe(true);
  });

  it("keeps localized portfolio content aligned by project slug", () => {
    const englishSlugs = getPortfolioContent("en").projects.map((project) => project.slug);

    for (const locale of supportedLocales) {
      const content = getPortfolioContent(locale);

      expect(content.projects.map((project) => project.slug)).toEqual(englishSlugs);
      expect(content.projects.every((project) => project.summary && project.metrics.length === 3)).toBe(true);
      expect(content.experience).toHaveLength(3);
      expect(content.socialLinks).toHaveLength(2);
    }
  });
});
