"use client";

import { useEffect, useRef, type RefObject } from "react";

type PlayHandlers = {
  /** Runs once, when the element scrolls into view. May return a cleanup. */
  onPlay?: () => void | (() => void);
  /** Jumps to the finished state, e.g. when reduced motion turns on mid-play. */
  onFinish?: () => void;
};

/**
 * Plays a setup section's entrance once, when it scrolls into view.
 *
 * Once scripts run, the element gets data-reveal="ready" (the hidden start
 * state in CSS), then data-reveal="play" when its top passes 80% of the
 * viewport. Without scripts, or with reduced motion, the attribute is never
 * set, so the finished layout shows exactly as rendered.
 */
export function usePlayOnView(
  ref: RefObject<HTMLElement | null>,
  handlers: PlayHandlers = {},
) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    let cleanupPlay: void | (() => void);
    element.dataset.reveal = "ready";

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        element.dataset.reveal = "play";
        cleanupPlay = handlersRef.current.onPlay?.();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(element);

    const settle = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      cleanupPlay?.();
      cleanupPlay = undefined;
      handlersRef.current.onFinish?.();
      delete element.dataset.reveal;
    };
    reducedMotion.addEventListener("change", settle);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", settle);
      cleanupPlay?.();
      delete element.dataset.reveal;
    };
  }, [ref]);
}
