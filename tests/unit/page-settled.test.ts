import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { whenVisitorEngages, whenVisitorPauses } from "@/lib/page-settled";

describe("page-settled", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves on the visitor's first engagement", async () => {
    const done = vi.fn();
    void whenVisitorEngages().then(done);

    await vi.advanceTimersByTimeAsync(5_000);
    expect(done).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("wheel"));
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toHaveBeenCalledOnce();
  });

  it("waits for a quiet spell after engagement, restarting on each scroll", async () => {
    const done = vi.fn();
    void whenVisitorPauses({ quiet: 700 }).then(done);

    window.dispatchEvent(new Event("scroll"));
    await vi.advanceTimersByTimeAsync(500);
    window.dispatchEvent(new Event("scroll"));
    await vi.advanceTimersByTimeAsync(500);
    expect(done).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(250);
    expect(done).toHaveBeenCalledOnce();
  });

  it("gives up waiting for a pause after maxWait of constant scrolling", async () => {
    const done = vi.fn();
    void whenVisitorPauses({ quiet: 250, maxWait: 1000 }).then(done);

    window.dispatchEvent(new Event("scroll"));
    for (let elapsed = 0; elapsed < 900; elapsed += 100) {
      await vi.advanceTimersByTimeAsync(100);
      window.dispatchEvent(new Event("scroll"));
    }
    expect(done).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(150);
    expect(done).toHaveBeenCalledOnce();
  });
});
