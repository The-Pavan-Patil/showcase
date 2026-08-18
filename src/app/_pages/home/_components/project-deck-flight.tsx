"use client";

import { useEffect, useRef } from "react";

import { ProjectCard } from "./project-card";
import { getScrollAccentActivationY } from "@/components/scroll-accent";
import type { Locale } from "@/lib/i18n";
import type { ProjectCaseStudy } from "@/lib/portfolio";
import type { UiCopy } from "@/lib/ui-copy";
import { clamp, smoothstep } from "@/lib/utils";

/** Geometry in document coordinates (scroll independent). */
export type DeckRect = {
  left: number;
  docTop: number;
  width: number;
  height: number;
};

export type DeckPose = {
  /** Resting centre inside the hero deck box, as a 0..1 fraction of its size. */
  centerX: number;
  centerY: number;
  /** Resting rotation in the fan, in degrees. */
  rotate: number;
  /** Card footprint in the fan, as a fraction of the deck box. */
  slotWidth: number;
  slotHeight: number;
};

export type FlightTransform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

/**
 * Fan poses in grid order, so index 0 is the featured card. The featured card
 * is the widest and sits at the front of the deck.
 */
const DECK_POSES: readonly DeckPose[] = [
  { centerX: 0.48, centerY: 0.78, rotate: 5, slotWidth: 0.92, slotHeight: 0.46 },
  { centerX: 0.6, centerY: 0.46, rotate: -1, slotWidth: 0.62, slotHeight: 0.6 },
  { centerX: 0.42, centerY: 0.32, rotate: -7, slotWidth: 0.62, slotHeight: 0.6 },
];

const COMPACT_VIEWPORT = 760;

/**
 * Back-loaded ease. The deck holds its fanned pose while the page scrolls
 * behind it, then un-fans and grows into the grid over the last stretch — so
 * the hero copy, proof strip, and section heading stay readable beside a
 * compact deck rather than behind three full-size cards.
 */
export function easeDeckRelease(progress: number) {
  const eased = smoothstep(progress);
  return eased * eased;
}

/**
 * The scroll position at which the deck must be fully landed: the moment the
 * scroll-accent dot arrives on the "Selected work" eyebrow. The dot rests on a
 * waypoint when the page has scrolled that waypoint up to the activation line,
 * so this mirrors how site-header scrolls the dot onto an anchor.
 */
export function resolveReleaseScroll(
  anchorDocY: number,
  viewportHeight: number,
) {
  // Floored so an integer scroll position that puts the dot on the eyebrow
  // reads as progress 1 exactly, rather than 0.9999 from a fractional anchor.
  return Math.max(
    1,
    Math.floor(anchorDocY - getScrollAccentActivationY(viewportHeight)),
  );
}

/**
 * A single progress for the whole deck, so all three cards lock into the grid
 * together instead of trailing each other by hundreds of pixels of scroll.
 */
export function resolveFlightProgress(scrollY: number, releaseScroll: number) {
  if (releaseScroll <= 0) return 1;

  return clamp(scrollY / releaseScroll);
}

/**
 * The card's size in the fan, fitted to the deck box on both axes. Fitting
 * width alone lets the tall half-width cards overflow the deck vertically.
 */
export function resolveRestScale(
  natural: DeckRect,
  deck: DeckRect,
  pose: DeckPose,
) {
  if (!natural.width || !natural.height) return 1;

  return Math.min(
    (deck.width * pose.slotWidth) / natural.width,
    (deck.height * pose.slotHeight) / natural.height,
  );
}

/**
 * Interpolates one card between its fan pose and its natural grid slot.
 *
 * At progress 1 every value is exactly identity, so the card lands on the slot
 * layout already gave it — pixel-perfect by construction, with no measurement
 * of the final position involved.
 */
export function resolveCardFlight(
  natural: DeckRect,
  deck: DeckRect,
  pose: DeckPose,
  scrollY: number,
  progress: number,
): FlightTransform {
  const eased = easeDeckRelease(progress);
  const remaining = 1 - eased;

  const naturalCenterX = natural.left + natural.width / 2;
  const naturalCenterY = natural.docTop + natural.height / 2 - scrollY;

  const targetCenterX = deck.left + deck.width * pose.centerX;
  const targetCenterY = deck.docTop + deck.height * pose.centerY;

  const restScale = resolveRestScale(natural, deck, pose);

  return {
    x: (targetCenterX - naturalCenterX) * remaining,
    y: (targetCenterY - naturalCenterY) * remaining,
    scale: restScale + (1 - restScale) * eased,
    rotate: pose.rotate * remaining,
  };
}

export function ProjectDeckFlight({
  copy,
  locale,
  projects,
  projectVisualCopy,
}: {
  copy: UiCopy["projectCard"];
  locale: Locale;
  projects: ProjectCaseStudy[];
  projectVisualCopy: UiCopy["projectVisual"];
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia(
      `(max-width: ${COMPACT_VIEWPORT}px)`,
    );
    let cleanupMode = () => {};

    const flights = () =>
      Array.from(grid.querySelectorAll<HTMLElement>(".project-flight"));

    const clearFlightStyles = () => {
      flights().forEach((flight) => {
        flight.style.removeProperty("--flight-x");
        flight.style.removeProperty("--flight-y");
        flight.style.removeProperty("--flight-scale");
        flight.style.removeProperty("--flight-rotate");
        flight.style.removeProperty("--flight-z");
        delete flight.dataset.flying;
      });
    };

    const enableFlight = () => {
      const deck = document.querySelector<HTMLElement>(".hero-deck");
      const cards = flights();
      if (!deck || cards.length === 0) return () => {};

      let animationFrame = 0;
      let resizeFrame = 0;
      let setupFrame = 0;
      let deckRect: DeckRect = { left: 0, docTop: 0, width: 0, height: 0 };
      let naturalRects: DeckRect[] = [];
      let anchorDocY = 0;

      const measure = () => {
        const scrollY = window.scrollY;

        // Read natural geometry with the flight transform neutralised, so
        // getBoundingClientRect reports the real grid slot.
        cards.forEach((card) => {
          card.style.setProperty("--flight-x", "0px");
          card.style.setProperty("--flight-y", "0px");
          card.style.setProperty("--flight-scale", "1");
          card.style.setProperty("--flight-rotate", "0deg");
        });

        naturalRects = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          return {
            left: rect.left,
            docTop: rect.top + scrollY,
            width: rect.width,
            height: rect.height,
          };
        });

        // The eyebrow anchor the accent dot travels to; the deck must be
        // landed by the time the dot arrives there.
        const anchor = document.querySelector<HTMLElement>(
          '[data-scroll-accent-anchor="work"]',
        );
        if (anchor) {
          const anchorRect = anchor.getBoundingClientRect();
          anchorDocY = anchorRect.top + scrollY + anchorRect.height / 2;
        } else {
          anchorDocY = grid.getBoundingClientRect().top + scrollY;
        }

        // The deck sits in the hero at the very top of the document, so its
        // document position doubles as the viewport line the fan rests on.
        const rect = deck.getBoundingClientRect();
        deckRect = {
          left: rect.left,
          docTop: rect.top + scrollY,
          width: rect.width,
          height: rect.height,
        };
      };

      const render = () => {
        animationFrame = 0;

        // A collapsed deck box (hidden by a stylesheet we did not anticipate)
        // would otherwise scale every card to nothing.
        if (!deckRect.width || !deckRect.height) {
          clearFlightStyles();
          return;
        }

        const scrollY = window.scrollY;
        const progress = resolveFlightProgress(
          scrollY,
          resolveReleaseScroll(anchorDocY, window.innerHeight),
        );
        const settled = progress >= 1;

        cards.forEach((card, index) => {
          const natural = naturalRects[index];
          const pose = DECK_POSES[index] ?? DECK_POSES[DECK_POSES.length - 1];
          if (!natural || !pose) return;

          const flight = resolveCardFlight(
            natural,
            deckRect,
            pose,
            scrollY,
            progress,
          );

          card.style.setProperty("--flight-x", `${flight.x.toFixed(2)}px`);
          card.style.setProperty("--flight-y", `${flight.y.toFixed(2)}px`);
          card.style.setProperty("--flight-scale", flight.scale.toFixed(4));
          card.style.setProperty(
            "--flight-rotate",
            `${flight.rotate.toFixed(3)}deg`,
          );
          card.style.setProperty("--flight-z", String(42 - index));

          if (settled) {
            delete card.dataset.flying;
          } else {
            card.dataset.flying = "true";
          }
        });
      };

      const remeasure = () => {
        measure();
        render();
      };

      const scheduleRender = () => {
        if (animationFrame) return;
        animationFrame = window.requestAnimationFrame(render);
      };

      const handleResize = () => {
        if (resizeFrame) return;
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = 0;
          remeasure();
        });
      };

      const resizeObserver = new ResizeObserver(handleResize);

      setupFrame = window.requestAnimationFrame(() => {
        setupFrame = 0;
        remeasure();

        window.addEventListener("scroll", scheduleRender, { passive: true });
        window.addEventListener("resize", handleResize);
        resizeObserver.observe(grid);
        resizeObserver.observe(deck);
        void document.fonts?.ready.then(remeasure);
      });

      return () => {
        if (setupFrame) window.cancelAnimationFrame(setupFrame);
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
        window.removeEventListener("scroll", scheduleRender);
        window.removeEventListener("resize", handleResize);
        resizeObserver.disconnect();
        clearFlightStyles();
      };
    };

    const syncMode = () => {
      cleanupMode();
      clearFlightStyles();

      if (reducedMotion.matches || compactViewport.matches) {
        cleanupMode = () => {};
        return;
      }

      cleanupMode = enableFlight();
    };

    syncMode();
    reducedMotion.addEventListener("change", syncMode);
    compactViewport.addEventListener("change", syncMode);

    return () => {
      cleanupMode();
      reducedMotion.removeEventListener("change", syncMode);
      compactViewport.removeEventListener("change", syncMode);
    };
  }, []);

  return (
    <div ref={gridRef} className="project-grid">
      {projects.map((project, index) => (
        <div className="project-flight" key={project.slug}>
          <ProjectCard
            copy={copy}
            locale={locale}
            project={project}
            projectVisualCopy={projectVisualCopy}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}
