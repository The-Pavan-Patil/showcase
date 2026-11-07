/**
 * Deferral points for work that should never compete with the first render:
 * hydration, the hero's paint and the first interaction come first.
 */

const ENGAGEMENT_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
const LISTENER_OPTIONS = { capture: true, passive: true } as const;

/** Resolves on the visitor's first scroll, touch, click or key press. */
export function whenVisitorEngages(): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      ENGAGEMENT_EVENTS.forEach((type) =>
        window.removeEventListener(type, done, LISTENER_OPTIONS),
      );
      resolve();
    };

    ENGAGEMENT_EVENTS.forEach((type) =>
      window.addEventListener(type, done, LISTENER_OPTIONS),
    );
  });
}

/** Resolves once the page has loaded and the main thread is idle. */
export function whenPageIdle({ timeout = 3000 }: { timeout?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    const afterLoad = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => resolve(), { timeout });
      } else {
        window.setTimeout(resolve, 1);
      }
    };

    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
  });
}

/** Whichever comes first: the visitor engages, or the loaded page goes idle. */
export function whenPageSettled(): Promise<void> {
  return Promise.race([whenVisitorEngages(), whenPageIdle()]);
}
