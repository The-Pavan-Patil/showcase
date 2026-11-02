import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  resolveScrollAccentFrame,
  ScrollAccent,
  type ScrollAccentWaypoint,
} from "@/components/scroll-accent";

const waypoints: ScrollAccentWaypoint[] = [
  {
    id: "hero",
    phase: "heading",
    x: 40,
    y: 100,
    size: 8,
    magnet: true,
  },
  {
    id: "work",
    phase: "heading",
    x: 40,
    y: 500,
    size: 8,
    magnet: true,
  },
  {
    id: "company",
    phase: "experience-major",
    x: 80,
    y: 900,
    size: 28,
    magnet: true,
  },
];

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.classList.remove("scroll-accent-mounted");
  vi.restoreAllMocks();
});

describe("resolveScrollAccentFrame", () => {
  it("holds at magnetic anchors before easing toward the next waypoint", () => {
    expect(resolveScrollAccentFrame(waypoints, 0, 100)).toEqual(waypoints[0]);
    expect(resolveScrollAccentFrame(waypoints, 20, 100)).toMatchObject({
      id: "hero",
      x: 40,
      y: 100,
      size: 8,
    });

    const midpoint = resolveScrollAccentFrame(waypoints, 200, 100);
    expect(midpoint).toMatchObject({ id: "work", phase: "heading" });
    expect(midpoint?.x).toBeCloseTo(40);
    expect(midpoint?.y).toBeCloseTo(300);
    expect(midpoint?.size).toBeCloseTo(8);
  });

  it("holds eyebrow headings for eighteen percent of each transition edge", () => {
    const departureHold = resolveScrollAccentFrame(waypoints, 64, 100);
    const arrivalHold = resolveScrollAccentFrame(waypoints, 336, 100);

    expect(departureHold).toMatchObject({ id: "hero", y: 100 });
    expect(arrivalHold).toMatchObject({ id: "work", y: 500 });
  });

  it("morphs the dot size while moving into a suitcase node", () => {
    const frame = resolveScrollAccentFrame(waypoints, 600, 100);

    expect(frame).toMatchObject({
      id: "company",
      phase: "experience-major",
    });
    expect(frame?.x).toBeGreaterThan(40);
    expect(frame?.x).toBeLessThan(80);
    expect(frame?.size).toBeGreaterThan(8);
    expect(frame?.size).toBeLessThan(28);
  });

  it("snaps between waypoints when reduced motion is enabled", () => {
    expect(resolveScrollAccentFrame(waypoints, 180, 100, true)).toBe(
      waypoints[0],
    );
    expect(resolveScrollAccentFrame(waypoints, 220, 100, true)).toBe(
      waypoints[1],
    );
  });

  it("skips non-magnetic rail waypoints when reduced motion is enabled", () => {
    const routeWithRail: ScrollAccentWaypoint[] = [
      waypoints[0],
      {
        id: "hero-global-departure",
        phase: "global-rail",
        x: 8,
        y: 180,
        size: 8,
        magnet: false,
      },
      {
        id: "work-global-approach",
        phase: "global-rail",
        x: 8,
        y: 420,
        size: 8,
        magnet: false,
      },
      waypoints[1],
    ];

    expect(resolveScrollAccentFrame(routeWithRail, 180, 100, true)).toBe(
      waypoints[0],
    );
    expect(resolveScrollAccentFrame(routeWithRail, 220, 100, true)).toBe(
      waypoints[1],
    );
  });
});

describe("resolveScrollAccentFrame with sticky stages", () => {
  // An eyebrow at document y 500 whose stage pins from scroll 400 to 1400,
  // then a plain heading further down. The activation line is at 100.
  const stick = { y: 500, from: 400, to: 1400 };
  const route: ScrollAccentWaypoint[] = [
    { id: "hero", phase: "heading", x: 300, y: 100, size: 8, magnet: true },
    { id: "work", phase: "heading", x: 40, y: 500, size: 8, magnet: true, stick },
    { id: "work", phase: "heading", x: 40, y: 1500, size: 8, magnet: true, stick },
    { id: "next", phase: "heading", x: 40, y: 2200, size: 8, magnet: true },
  ];

  it("rides an eyebrow in place while its stage is pinned", () => {
    for (const scrollY of [400, 900, 1400]) {
      const frame = resolveScrollAccentFrame(route, scrollY, 100);
      expect(frame).toMatchObject({ id: "work", x: 40 });
      expect((frame?.y ?? 0) - scrollY).toBeCloseTo(100);
    }
  });

  it("slides through the viewport to the next eyebrow without doubling back", () => {
    const viewportYs = [1400, 1550, 1750, 1950, 2100].map((scrollY) => {
      const frame = resolveScrollAccentFrame(route, scrollY, 100);
      return (frame?.y ?? 0) - scrollY;
    });

    // Pinned at 100 when the stage lets go, on the activation line on arrival.
    expect(viewportYs[0]).toBeCloseTo(100);
    expect(viewportYs[viewportYs.length - 1]).toBeCloseTo(100);
    viewportYs.forEach((viewportY) => {
      expect(viewportY).toBeGreaterThanOrEqual(99.5);
      expect(viewportY).toBeLessThanOrEqual(100.5);
    });
  });

  it("fades the dot between visible and hidden waypoints", () => {
    const fading: ScrollAccentWaypoint[] = [
      { id: "workflow", phase: "heading", x: 40, y: 500, size: 8, magnet: true },
      {
        id: "workflow-exit",
        phase: "hidden",
        x: 40,
        y: 640,
        size: 8,
        opacity: 0,
        stick: { y: 500, from: 0, to: 0 },
      },
    ];

    expect(resolveScrollAccentFrame(fading, 400, 100)?.opacity).toBeUndefined();
    const midway = resolveScrollAccentFrame(fading, 470, 100);
    expect(midway?.opacity).toBeGreaterThan(0);
    expect(midway?.opacity).toBeLessThan(1);
    // The eyebrow keeps its document place while the dot fades on it.
    expect(midway?.y).toBeCloseTo(500);
    expect(resolveScrollAccentFrame(fading, 600, 100)?.opacity).toBe(0);
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
        const x = Number(
          this.dataset.testX ??
            (this.classList.contains("scroll-accent-global-rail") ? 8 : 0),
        );
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
            data-test-x="20"
            data-test-y="100"
          />
          <span
            data-scroll-accent-anchor="work"
            data-scroll-accent-phase="heading"
            data-test-x="20"
            data-test-y="400"
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
    expect(document.querySelectorAll(".scroll-accent-traveler")).toHaveLength(1);
    expect(document.documentElement).toHaveClass("scroll-accent-mounted");

    view.unmount();

    expect(document.documentElement).not.toHaveClass("scroll-accent-mounted");
  });
});
