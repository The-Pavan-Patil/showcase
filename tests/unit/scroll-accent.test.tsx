import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  floatBelow,
  isSpringAtRest,
  launchSpring,
  nextVisitIndex,
  resolveScrollAccentStop,
  ScrollAccent,
  stepSpring,
  stopViewportPoint,
  type ScrollAccentStop,
} from "@/components/scroll-accent";

const stops: ScrollAccentStop[] = [
  { id: "hero", phase: "heading", x: 400, y: 700, size: 8, activateAt: -Infinity },
  { id: "work", phase: "heading", x: 40, y: 1100, size: 8, activateAt: 300 },
  { id: "company", phase: "experience-major", x: 80, y: 1900, size: 28, activateAt: 1500 },
];

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.classList.remove("scroll-accent-mounted");
  vi.restoreAllMocks();
});

describe("resolveScrollAccentStop", () => {
  it("targets the last stop whose section has entered", () => {
    expect(resolveScrollAccentStop(stops, 0)).toBe(0);
    expect(resolveScrollAccentStop(stops, 299)).toBe(0);
    expect(resolveScrollAccentStop(stops, 300)).toBe(1);
    expect(resolveScrollAccentStop(stops, 1499)).toBe(1);
    expect(resolveScrollAccentStop(stops, 5000)).toBe(2);
  });
});

describe("nextVisitIndex", () => {
  const route: ScrollAccentStop[] = [
    { id: "heading", phase: "heading", x: 0, y: 0, size: 8, activateAt: -Infinity },
    ...[1, 2, 3, 4, 5, 6].map((n) => ({
      id: `node-${n}`, phase: "experience-minor", x: 0, y: 0, size: 8, activateAt: n * 100,
    })),
    { id: "about-hidden", phase: "hidden", x: 0, y: 0, size: 8, activateAt: 800, hidden: true },
    { id: "message", phase: "heading", x: 0, y: 0, size: 8, activateAt: 900 },
  ];
  const allOnScreen = () => true;

  it("visits each skipped stop on screen, one at a time, once it arrives", () => {
    expect(nextVisitIndex(route, 0, 6, false, allOnScreen)).toBe(0);
    expect(nextVisitIndex(route, 0, 6, true, allOnScreen)).toBe(1);
    expect(nextVisitIndex(route, 1, 6, true, allOnScreen)).toBe(2);
    expect(nextVisitIndex(route, 5, 6, true, allOnScreen)).toBe(6);
  });

  it("steps back through stops when scrolling up", () => {
    expect(nextVisitIndex(route, 3, 1, true, allOnScreen)).toBe(2);
  });

  it("passes over stops that have left the screen", () => {
    const onScreen = (stop: ScrollAccentStop) => stop.id === "node-4";
    expect(nextVisitIndex(route, 0, 6, true, onScreen)).toBe(4);
    expect(nextVisitIndex(route, 0, 3, true, onScreen)).toBe(3);
    // Heading for a stop that has gone, it moves on without arriving.
    expect(nextVisitIndex(route, 2, 6, false, onScreen)).toBe(4);
  });

  it("goes direct across a hidden stretch", () => {
    expect(nextVisitIndex(route, 5, 8, false, allOnScreen)).toBe(8);
  });
});

describe("stopViewportPoint", () => {
  it("moves a plain target with the page", () => {
    expect(stopViewportPoint(stops[1], 400)).toEqual({ x: 40, y: 700 });
  });

  it("holds a sticky target in place while its stage is pinned", () => {
    const pinned: ScrollAccentStop = { ...stops[1], stick: { from: 800, to: 1600 } };
    const atPin = stopViewportPoint(pinned, 800).y;

    expect(stopViewportPoint(pinned, 1200).y).toBe(atPin);
    expect(stopViewportPoint(pinned, 1600).y).toBe(atPin);
    expect(stopViewportPoint(pinned, 1700).y).toBe(atPin - 100);
  });
});

describe("floatBelow", () => {
  it("leaves targets well below the float line alone", () => {
    expect(floatBelow(600, 100)).toBeCloseTo(600, 3);
  });

  it("follows a target exactly until it nears the line", () => {
    expect(floatBelow(116, 100)).toBe(116);
  });

  it("eases a target into the line instead of stopping it dead", () => {
    expect(floatBelow(-400, 100)).toBeCloseTo(100, 3);
    const nearLine = floatBelow(100, 100);
    expect(nearLine).toBeGreaterThan(100);
    expect(nearLine).toBeLessThan(116);
    // Monotonic: scrolling further never moves the dot back down.
    expect(floatBelow(90, 100)).toBeLessThan(nearLine);
    // Smooth at the knee: the slope is 1 on both sides.
    expect(floatBelow(116, 100) - floatBelow(115.99, 100)).toBeCloseTo(0.01, 4);
  });
});

describe("spring flight", () => {
  it("lands within about a second, without a large overshoot", () => {
    let state = launchSpring({ x: 0, y: 0, vx: 0, vy: 0 }, { x: 0, y: 400 });
    let lowest = 0;
    let time = 0;
    while (!isSpringAtRest(state) && time < 3) {
      state = stepSpring(state, 1 / 60);
      lowest = Math.min(lowest, state.y);
      time += 1 / 60;
    }

    expect(time).toBeLessThan(1.2);
    expect(lowest).toBeGreaterThan(-400 * 0.08);
  });

  it("kicks sideways at take-off so the flight curves", () => {
    const state = launchSpring({ x: 0, y: 0, vx: 0, vy: 0 }, { x: 0, y: 400 });
    expect(Math.abs(state.vx)).toBeGreaterThan(0);
    expect(state.vy).toBe(0);
  });

  it("catches up faster with a boost", () => {
    const settle = (boost: number) => {
      let state = launchSpring({ x: 0, y: 0, vx: 0, vy: 0 }, { x: 0, y: 200 }, 0);
      let time = 0;
      while (Math.hypot(state.x, state.y) > 6 && time < 3) {
        state = stepSpring(state, 1 / 60, boost);
        time += 1 / 60;
      }
      return time;
    };
    expect(settle(4)).toBeLessThan(settle(1) * 0.6);
  });

  it("keeps the dot's current speed when re-aimed mid-flight", () => {
    const state = launchSpring({ x: 10, y: 10, vx: 50, vy: -20 }, { x: 0, y: 0 });
    expect(state).toEqual({ x: 0, y: 0, vx: 50, vy: -20 });
  });
});

describe("ScrollAccent", () => {
  it("mounts one decorative traveler and cleans up its document state", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBounds(this: HTMLElement) {
        const x = Number(this.dataset.testX ?? 0);
        const y = Number(this.dataset.testY ?? 0);
        const size = Number(this.dataset.testSize ?? 8);
        const height = Number(this.dataset.testHeight ?? size);

        return {
          x,
          y,
          top: y,
          right: x + size,
          bottom: y + height,
          left: x,
          width: size,
          height,
          toJSON: () => undefined,
        };
      },
    );

    const view = render(
      <>
        <main id="main-content" data-test-height="1400">
          <span
            data-scroll-accent-anchor="hero"
            data-scroll-accent-phase="heading"
            data-test-x="400"
            data-test-y="600"
          />
          <span
            data-scroll-accent-anchor="work"
            data-scroll-accent-phase="heading"
            data-test-x="20"
            data-test-y="1000"
          />
          <section
            data-scroll-accent-experience
            data-test-y="700"
            data-test-height="500"
          >
            <span
              data-scroll-accent-anchor="experience"
              data-scroll-accent-phase="heading"
              data-test-x="20"
              data-test-y="700"
            />
            <article className="experience-item" data-test-y="760" data-test-height="360">
              <span
                data-scroll-accent-anchor="experience-company-0"
                data-scroll-accent-phase="experience-major"
                data-test-x="60"
                data-test-y="780"
                data-test-size="28"
              />
              <details data-scroll-accent-details open>
                <span
                  data-scroll-accent-anchor="experience-project-0-0"
                  data-scroll-accent-phase="experience-minor"
                  data-test-x="120"
                  data-test-y="930"
                />
              </details>
            </article>
          </section>
          <span
            data-scroll-accent-anchor="workflow"
            data-scroll-accent-phase="heading"
            data-test-x="20"
            data-test-y="1250"
          />
          <span
            data-scroll-accent-anchor="about"
            data-scroll-accent-phase="heading"
            data-test-x="20"
            data-test-y="1400"
          />
          <span
            data-scroll-accent-anchor="message"
            data-scroll-accent-phase="heading"
            data-test-x="20"
            data-test-y="1500"
          />
          <section
            data-scroll-accent-contact
            data-test-y="1600"
            data-test-height="300"
          />
        </main>
        <ScrollAccent />
      </>,
    );

    act(() => {
      frames.splice(0).forEach((callback) => callback(0));
    });

    const traveler = view.container.querySelector(".scroll-accent-traveler");
    expect(traveler).toHaveAttribute("aria-hidden", "true");
    expect(traveler).toHaveAttribute("data-ready", "true");
    // It starts at rest on the hero's scroll cue.
    expect(traveler).toHaveAttribute("data-active-anchor", "hero");
    expect(traveler).toHaveAttribute("data-landed", "true");
    expect(document.querySelectorAll(".scroll-accent-global-rail")).toHaveLength(0);
    expect(document.querySelectorAll(".scroll-accent-traveler")).toHaveLength(1);
    expect(document.documentElement).toHaveClass("scroll-accent-mounted");

    view.unmount();

    expect(document.documentElement).not.toHaveClass("scroll-accent-mounted");
  });
});
