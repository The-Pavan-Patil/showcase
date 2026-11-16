import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { whenVisitorEngages } from "@/lib/page-settled";

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
});
