import { describe, expect, it } from "vitest";

import {
  resolveCardEntry,
  resolveCoveredDepth,
  resolveLandingProgress,
} from "@/app/_pages/home/_components/project-stack";

describe("project stack timing", () => {
  it("spaces the landings evenly between the start and end of the hold", () => {
    expect(resolveLandingProgress(0, 3)).toBeCloseTo(0.06);
    expect(resolveLandingProgress(1, 3)).toBeCloseTo(0.48);
    expect(resolveLandingProgress(2, 3)).toBeCloseTo(0.9);
  });

  it("keeps the first card in place and slides later cards in one at a time", () => {
    expect(resolveCardEntry(0, 0, 3)).toBe(1);
    expect(resolveCardEntry(0.06, 1, 3)).toBe(0);
    expect(resolveCardEntry(0.27, 1, 3)).toBeCloseTo(0.5);
    expect(resolveCardEntry(0.48, 1, 3)).toBeCloseTo(1);
    expect(resolveCardEntry(0.48, 2, 3)).toBeCloseTo(0);
    expect(resolveCardEntry(1, 2, 3)).toBe(1);
  });

  it("counts how many cards cover a card as the stack builds", () => {
    expect(resolveCoveredDepth(0, 0, 3)).toBe(0);
    expect(resolveCoveredDepth(0.48, 0, 3)).toBeCloseTo(1);
    expect(resolveCoveredDepth(1, 0, 3)).toBeCloseTo(2);
    expect(resolveCoveredDepth(1, 1, 3)).toBeCloseTo(1);
    expect(resolveCoveredDepth(1, 2, 3)).toBe(0);
  });

  it("treats a single project as already landed", () => {
    expect(resolveCardEntry(0.5, 0, 1)).toBe(1);
    expect(resolveCoveredDepth(0.5, 0, 1)).toBe(0);
  });
});
