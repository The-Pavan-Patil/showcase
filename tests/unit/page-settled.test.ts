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
});
