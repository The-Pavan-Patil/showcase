"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Scroll scenes only run once hydrated and when motion is allowed. Server
 * render, no-script, and reduced-motion visitors get the finished composition.
 */
export function useScrollSceneLive() {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return isHydrated && !prefersReducedMotion;
}
