import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoopEngineeringCards } from "@/components/loop-engineering-cards";

const points = [
  { label: "One", title: "First", text: "First **description**." },
  { label: "Two", title: "Second", text: "Second description." },
  { label: "Three", title: "Third", text: "Third description." },
  { label: "Four", title: "Fourth", text: "Fourth description." },
] as const;

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];

  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    IntersectionObserverMock.instances.push(this);
  }

  trigger(isIntersecting: boolean, intersectionRatio = isIntersecting ? 0.25 : 0) {
    this.callback(
      [{ intersectionRatio, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe("LoopEngineeringCards", () => {
  beforeEach(() => {
    IntersectionObserverMock.instances = [];
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reveals all four cards once a quarter of the grid enters the viewport", () => {
    const { container } = render(<LoopEngineeringCards points={points} />);
    const grid = container.firstElementChild;
    const observer = IntersectionObserverMock.instances[0];

    expect(grid).toHaveAttribute("data-loop-revealed", "false");
    expect(container.querySelectorAll(".setup-orchestration-card")).toHaveLength(4);
    expect(observer.options).toEqual({ threshold: 0.25 });

    act(() => observer.trigger(true, 0.24));
    expect(grid).toHaveAttribute("data-loop-revealed", "false");

    act(() => observer.trigger(true));

    expect(grid).toHaveAttribute("data-loop-revealed", "true");
    expect(grid).toHaveClass("is-loop-revealed");
    expect(observer.disconnect).toHaveBeenCalled();

    act(() => observer.trigger(false));
    expect(grid).toHaveAttribute("data-loop-revealed", "true");
  });

  it("shows the cards immediately when reduced motion is requested", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<LoopEngineeringCards points={points} />);

    await waitFor(() => {
      expect(container.firstElementChild).toHaveAttribute(
        "data-loop-revealed",
        "true",
      );
    });
    expect(IntersectionObserverMock.instances).toHaveLength(0);
    expect(container.firstElementChild).not.toHaveClass("is-loop-stack-ready");
    expect(container.firstElementChild).toHaveAttribute(
      "data-loop-stack-lifecycle",
      "static",
    );
  });

  it("sets up the measured sticky stack on mobile", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query === "(max-width: 760px)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<LoopEngineeringCards points={points} />);
    const stack = container.firstElementChild as HTMLElement;
    const cards = container.querySelectorAll<HTMLElement>(
      ".setup-orchestration-card",
    );

    await waitFor(() => {
      expect(stack).toHaveAttribute("data-loop-revealed", "true");
      expect(stack).toHaveClass("is-loop-stack-ready");
    });

    expect(IntersectionObserverMock.instances).toHaveLength(0);
    expect(stack.style.getPropertyValue("--loop-sticky-top")).toBe("16px");
    expect(stack.style.getPropertyValue("--loop-scroll-distance")).not.toBe("");
    expect(cards).toHaveLength(4);
    expect(cards[0].style.getPropertyValue("--loop-card-top")).toBe("0px");
    expect(cards[1].style.getPropertyValue("--loop-card-final-top")).toBe("76px");
  });
});
