"use client";

import { useEffect } from "react";

/**
 * Fades `[data-reveal]` elements in as they scroll into view.
 * Content renders visible on the server; only elements still below the fold
 * when this mounts are hidden, so no-JS and reduced-motion visitors see everything.
 * Anything at or above the reveal line is shown, so jumping ahead through the
 * article map never leaves skipped sections hidden.
 */
export function CaseReveal({ selector = "[data-reveal]" }: { selector?: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const line = () => window.innerHeight * 0.88;
    let pending = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => el.getBoundingClientRect().top > line(),
    );
    if (!pending.length) return;

    for (const el of pending) el.classList.add("is-reveal-pending");

    let frame = 0;
    const sweep = () => {
      frame = 0;
      const limit = line();
      const tops = pending.map((el) => el.getBoundingClientRect().top);
      const still: HTMLElement[] = [];
      pending.forEach((el, i) => {
        if (tops[i] < limit) {
          el.classList.add("is-revealed");
          el.classList.remove("is-reveal-pending");
        } else {
          still.push(el);
        }
      });
      pending = still;
      if (!pending.length) stop();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    const stop = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      stop();
      if (frame) cancelAnimationFrame(frame);
      for (const el of pending) el.classList.remove("is-reveal-pending");
    };
  }, [selector]);

  return null;
}
