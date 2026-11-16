import { describe, expect, it } from "vitest";

import {
  resolveActiveIndex,
  resolveCardStyle,
  resolveProgressForIndex,
  resolveStackPosition,
  resolveStackScreens,
  resolveStackStyle,
  STACK_HOLD_END,
  STACK_HOLD_START,
} from "@/app/_pages/home/_components/work-stack-timeline";

describe("work stack timeline", () => {
  it("pins for one screen per card that leaves, plus the holds at each end", () => {
    expect(resolveStackScreens(3)).toBeCloseTo(2 + STACK_HOLD_START + STACK_HOLD_END);
    expect(resolveStackScreens(1)).toBeCloseTo(STACK_HOLD_START + STACK_HOLD_END);
  });

  it("holds the first card in front as the stage pins, and the last before it lets go", () => {
    expect(resolveStackPosition(0, 3)).toBe(0);
    expect(resolveStackPosition(STACK_HOLD_START / resolveStackScreens(3), 3)).toBeCloseTo(0);
    expect(resolveStackPosition(1, 3)).toBe(2);
    expect(resolveStackPosition(1 - STACK_HOLD_END / resolveStackScreens(3), 3)).toBeCloseTo(2);
  });

  it("moves at one steady pace between the holds", () => {
    const step = 1 / resolveStackScreens(3);
    const start = resolveProgressForIndex(0, 3);
    expect(resolveStackPosition(start + step * 0.5, 3)).toBeCloseTo(0.5);
    expect(resolveStackPosition(start + step * 1.25, 3)).toBeCloseTo(1.25);
  });

  it("puts each card in front at its own progress", () => {
    for (const index of [0, 1, 2]) {
      expect(resolveStackPosition(resolveProgressForIndex(index, 3), 3)).toBeCloseTo(index);
    }
  });

  it("clamps the counter to real cards", () => {
    expect(resolveActiveIndex(-0.5, 3)).toBe(0);
    expect(resolveActiveIndex(1.4, 3)).toBe(1);
    expect(resolveActiveIndex(2.6, 3)).toBe(2);
  });

  it("moves the cards up through the stack between the holds", () => {
    expect(resolveStackStyle(3)).toEqual({
      "--stack-count": 3,
      "--stack-screens": 3,
      "--stack-travel-start": "8.3333%",
      "--stack-travel-end": "75%",
    });
  });

  it("sends each card off over the stretch before the next one is in front", () => {
    expect(resolveCardStyle(0, 3)).toEqual({
      "--stack-index": 0,
      "--stack-depth-to": -2,
      "--stack-leave-start": "8.3333%",
      "--stack-leave-end": "41.6667%",
    });
    expect(resolveCardStyle(1, 3)).toMatchObject({
      "--stack-depth-to": -1,
      "--stack-leave-start": "41.6667%",
      "--stack-leave-end": "75%",
    });
    // The last card ends in front and never leaves.
    expect(resolveCardStyle(2, 3)).toMatchObject({ "--stack-depth-to": 0 });
  });
});
