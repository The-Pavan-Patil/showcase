import { describe, expect, it } from "vitest";

import {
  DUST_HOLD,
  NEIGHBOUR_SCALE,
  resolveActiveIndex,
  resolveCardPose,
  resolveDustPosition,
  resolveProgressForIndex,
} from "@/app/_pages/home/_components/project-dust-timeline";

describe("project dust timeline", () => {
  it("pins with the first card centred and unpins with the last one centred", () => {
    expect(resolveDustPosition(0, 3)).toBe(0);
    expect(resolveDustPosition(resolveProgressForIndex(0, 3), 3)).toBe(0);
    expect(resolveDustPosition(1, 3)).toBe(2);
    expect(resolveDustPosition(1 - DUST_HOLD / (2 + DUST_HOLD * 2), 3)).toBe(2);
  });

  it("rests each card at the centre for part of its step", () => {
    for (const index of [0, 1, 2]) {
      const progress = resolveProgressForIndex(index, 3);
      expect(resolveDustPosition(progress, 3)).toBeCloseTo(index);
      expect(resolveDustPosition(progress + 0.02, 3)).toBeCloseTo(index);
    }
  });

  it("moves forward monotonically", () => {
    let previous = -Infinity;
    for (let progress = 0; progress <= 1; progress += 0.01) {
      const position = resolveDustPosition(progress, 3);
      expect(position).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = position;
    }
  });

  it("clamps the counter to real cards", () => {
    expect(resolveActiveIndex(-0.5, 3)).toBe(0);
    expect(resolveActiveIndex(1.4, 3)).toBe(1);
    expect(resolveActiveIndex(2.6, 3)).toBe(2);
  });

  it("keeps the centre card solid and full size", () => {
    expect(resolveCardPose(0)).toEqual({ scale: 1, dissolve: 0, side: 1 });
  });

  it("shrinks and dissolves cards towards the sides, from their outer edge", () => {
    const left = resolveCardPose(-1);
    const right = resolveCardPose(1);
    expect(left.scale).toBeCloseTo(NEIGHBOUR_SCALE);
    expect(right.scale).toBeCloseTo(NEIGHBOUR_SCALE);
    expect(left.dissolve).toBeGreaterThan(0.4);
    expect(left.dissolve).toBeLessThan(0.7);
    expect(left.side).toBe(-1);
    expect(right.side).toBe(1);
    expect(resolveCardPose(2).dissolve).toBe(1);
  });
});
