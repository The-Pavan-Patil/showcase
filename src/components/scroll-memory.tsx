"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

import { getSectionStart, settleScenes, snapScroll } from "@/lib/section-jump";

/**
 * Where a page opens:
 * - A page load (a first visit, a reload, a link from elsewhere) opens at
 *   the top. On the homepage that is the hero, even if the URL names a
 *   section.
 * - Back and Forward return to exactly where the visitor was on the page.
 * - A link from another page to a homepage section opens that section where
 *   its scene starts, as the header does on the homepage itself.
 *
 * The browser's own restoration is off (`history.scrollRestoration` is
 * "manual", set before first paint by `scrollStartScript` in
 * lib/scroll-start.ts): it restores
 * before the scroll scenes have laid out, so it lands short and then drifts.
 */

const STORAGE_KEY = "scroll-memory";
/** Longest a position is held while the page lays out around it. */
const SETTLE_MAX_MS = 1500;
/** The page counts as laid out once its height holds for this many frames. */
const SETTLE_FRAMES = 6;
const SAVE_DELAY_MS = 120;
/** Any of these means the visitor has taken over the scroll. */
const TAKEOVER_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/** The page Back or Forward is heading to, set as the history entry changes. */
let pendingTraversal: string | null = null;
let hasMounted = false;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    pendingTraversal = window.location.pathname;
  });
}

function readPositions(): Record<string, number> {
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}");
    return value && typeof value === "object" ? (value as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function savePosition(path: string, top: number) {
  try {
    const positions = readPositions();
    positions[path] = Math.round(top);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Storage can be unavailable (private windows, blocked site data).
  }
}

/**
 * Puts the page at `target` and keeps it there while the scenes measure
 * themselves and the page's height settles, then lets the scenes catch up.
 * Returns a function that ends the hold early.
 */
function holdScroll(target: () => number) {
  const started = performance.now();
  let frame = 0;
  let lastHeight = -1;
  let stableFrames = 0;
  let done = false;

  // Scroll anchoring would shift the page whenever a scene above the target
  // resizes; the target is already measured against the settled layout.
  const root = document.documentElement;
  const anchoring = root.style.overflowAnchor;
  root.style.overflowAnchor = "none";

  const stop = () => {
    if (done) return;
    done = true;
    window.cancelAnimationFrame(frame);
    TAKEOVER_EVENTS.forEach((type) => window.removeEventListener(type, stop));
    root.style.overflowAnchor = anchoring;
    void settleScenes();
  };

  const tick = () => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const top = Math.round(Math.min(maxScroll, Math.max(0, target())));
    if (Math.abs(window.scrollY - top) >= 1) snapScroll(top);

    const height = document.documentElement.scrollHeight;
    stableFrames = height === lastHeight ? stableFrames + 1 : 0;
    lastHeight = height;
    if (stableFrames >= SETTLE_FRAMES || performance.now() - started > SETTLE_MAX_MS) {
      stop();
      return;
    }
    frame = window.requestAnimationFrame(tick);
  };

  TAKEOVER_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));
  tick();
  return stop;
}

export function ScrollMemory({ homePath }: { homePath: string }) {
  const pathname = usePathname();

  // Where the page opens. A layout effect, so a restored page paints in place.
  useLayoutEffect(() => {
    const isPageLoad = !hasMounted;
    hasMounted = true;
    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isTraversal = isPageLoad
      ? navigation?.type === "back_forward"
      : pendingTraversal === pathname;
    pendingTraversal = null;

    if (isTraversal) {
      // A page with nothing remembered opens at the top, not wherever the
      // previous page was.
      const saved = readPositions()[pathname] ?? 0;
      return holdScroll(() => saved);
    }

    if (pathname !== homePath) return;

    if (isPageLoad) {
      // Opens on the hero. Only steps in if something already moved it.
      return window.scrollY ? holdScroll(() => 0) : undefined;
    }

    const section = window.location.hash
      ? document.getElementById(window.location.hash.slice(1))
      : null;
    return section ? holdScroll(() => getSectionStart(section)) : undefined;
  }, [homePath, pathname]);

  // Remembers where the visitor is on this page.
  useEffect(() => {
    let lastTop: number | null = null;
    let timer = 0;

    const flush = () => {
      window.clearTimeout(timer);
      timer = 0;
      if (lastTop !== null) savePosition(pathname, lastTop);
    };

    const handleScroll = () => {
      // A navigation changes the URL before this effect is replaced; the old
      // page's last position is already recorded by then.
      if (window.location.pathname !== pathname) return;
      lastTop = window.scrollY;
      if (!timer) timer = window.setTimeout(flush, SAVE_DELAY_MS);
    };

    const handlePageHide = () => {
      handleScroll();
      flush();
    };

    // The page is already where it opens (the router scrolls in its layout
    // phase), so record that now: a page left without scrolling still has a
    // place to come back to.
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      flush();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [pathname]);

  return null;
}
