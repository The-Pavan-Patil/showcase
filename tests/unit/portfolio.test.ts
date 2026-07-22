import { describe, expect, it } from "vitest";

import {
  getNextProject,
  getProjectBySlug,
  profile,
  projects,
  socialLinks,
} from "@/lib/portfolio";

describe("portfolio content", () => {
  it("contains exactly three unique case studies", () => {
    expect(projects).toHaveLength(3);
    expect(new Set(projects.map((project) => project.slug)).size).toBe(3);
    expect(projects.map((project) => project.slug)).toEqual([
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
    expect(getProjectBySlug("nudge")?.title).toBe("Nudge");
    expect(getProjectBySlug("not-a-real-project")).toBeUndefined();
  });

  it("cycles through next projects", () => {
    expect(getNextProject("nudge").slug).toBe("philips-greenheart");
    expect(getNextProject("workforce-management-system").slug).toBe("nudge");
  });

  it("publishes verified contact links without a phone number", () => {
    expect(profile.email).toMatch(/@/);
    expect(JSON.stringify(profile)).not.toContain("7350913864");
    expect(socialLinks.every((link) => link.href.startsWith("https://"))).toBe(true);
  });
});
