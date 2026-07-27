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
          <section
            data-scroll-accent-contact
            data-test-y="1500"
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
