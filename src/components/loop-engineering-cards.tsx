"use client";

import { useEffect, useRef, useState } from "react";

type LoopEngineeringPoint = {
  label: string;
  title: string;
  text: string;
};

type LoopStackLifecycle = "static" | "idle" | "stacking" | "collapsed";

function richText(input: string) {
  return input.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

export function LoopEngineeringCards({
  points,
}: {
  points: readonly LoopEngineeringPoint[];
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const stack = stackRef.current;
    const shell = shellRef.current;
    if (!stack || !shell) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 760px)");
    let cleanupMode = () => {};

    const setStackLifecycle = (nextLifecycle: LoopStackLifecycle) => {
      stack.dataset.loopStackLifecycle = nextLifecycle;
      stack.classList.toggle("is-loop-stack-idle", nextLifecycle === "idle");
      stack.classList.toggle("is-loop-stacking", nextLifecycle === "stacking");
      stack.classList.toggle(
        "is-loop-stack-collapsed",
        nextLifecycle === "collapsed",
      );
    };

    const clearStackStyles = () => {
      setStackLifecycle("static");
      stack.classList.remove("is-loop-stack-ready");
      stack.style.removeProperty("--loop-sticky-top");
      stack.style.removeProperty("--loop-stack-height");
      stack.style.removeProperty("--loop-scroll-distance");
      stack.style.removeProperty("--loop-track-height");
      stack.style.removeProperty("--loop-collapsed-height");

      shell.querySelectorAll<HTMLElement>(".setup-orchestration-card").forEach(
        (card) => {
          card.style.removeProperty("--loop-card-top");
          card.style.removeProperty("--loop-card-translate");
          card.style.removeProperty("--loop-card-final-top");
          card.style.removeProperty("z-index");
        },
      );
    };

    if (
      reducedMotion.matches ||
      !("IntersectionObserver" in window)
    ) {
      const revealTimer = window.setTimeout(() => setIsRevealed(true), 0);
      clearStackStyles();
      return () => window.clearTimeout(revealTimer);
    }

    const enableRevealObserver = () => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || entry.intersectionRatio < 0.25) return;

          setIsRevealed(true);
          observer.disconnect();
        },
        { threshold: 0.25 },
      );

      observer.observe(stack);
      return () => observer.disconnect();
    };

    const enableMobileStack = () => {
      const cards = Array.from(
        shell.querySelectorAll<HTMLElement>(".setup-orchestration-card"),
      );
      if (cards.length < 2) return enableRevealObserver();

      let animationFrame = 0;
      let resizeFrame = 0;
      let setupFrame = 0;
      let lifecycle: LoopStackLifecycle = "idle";
      let activationScrollY = 0;
      let entryScrollY = 0;
      let furthestScrollY = window.scrollY;
      let lastScrollY = window.scrollY;
      let progress = 0;
      let scrollDistance = 0;
      let collapsedHeight = 0;
      let stickyTop = 0;

      const setLifecycle = (nextLifecycle: LoopStackLifecycle) => {
        lifecycle = nextLifecycle;
        setStackLifecycle(nextLifecycle);
      };

      const measureCardHeight = (card: HTMLElement) =>
        Math.max(card.offsetHeight, card.getBoundingClientRect().height, 224);

      const measureVisibleBand = (card: HTMLElement) => {
        const heading = card.querySelector<HTMLElement>("h3");
        if (!heading) return 84;

        return Math.max(
          76,
          heading.offsetTop + heading.offsetHeight + 14,
        );
      };

      const updateCardPositions = (nextProgress: number) => {
        cards.forEach((card) => {
          const naturalTop = Number.parseFloat(
            card.style.getPropertyValue("--loop-card-top"),
          );
          const finalTop = Number.parseFloat(
            card.style.getPropertyValue("--loop-card-final-top"),
          );
          const translateY = (finalTop - naturalTop) * nextProgress;

          card.style.setProperty("--loop-card-translate", `${translateY}px`);
        });
      };

      const configureScrollTrack = () => {
        const shellStyles = getComputedStyle(shell);
        const gap = Number.parseFloat(shellStyles.rowGap || shellStyles.gap) || 16;
        const cardHeights = cards.map(measureCardHeight);
        const visibleBands = cards.map(measureVisibleBand);
        const naturalTops: number[] = [];
        const finalTops: number[] = [];
        let naturalHeight = 0;
        let stackedOffset = 0;

        cards.forEach((card, index) => {
          naturalTops[index] = naturalHeight;
          finalTops[index] = stackedOffset;
          naturalHeight += cardHeights[index] + (index === cards.length - 1 ? 0 : gap);
          stackedOffset +=
            index === cards.length - 1 ? 0 : visibleBands[index];

          card.style.setProperty("--loop-card-top", `${naturalTops[index]}px`);
          card.style.setProperty("--loop-card-final-top", `${finalTops[index]}px`);
          card.style.setProperty("z-index", String(10 + index));
        });

        const lastIndex = cards.length - 1;
        const topClearance = 16;
        const bottomClearance = 96;
        const usableHeight = Math.max(
          240,
          window.innerHeight - topClearance - bottomClearance,
        );

        collapsedHeight = finalTops[lastIndex] + cardHeights[lastIndex];
        scrollDistance = Math.max(usableHeight * 1.4, 560);
        stickyTop = topClearance;
        entryScrollY =
          stack.getBoundingClientRect().top + window.scrollY - stickyTop;

        stack.style.setProperty("--loop-sticky-top", `${stickyTop}px`);
        stack.style.setProperty("--loop-stack-height", `${naturalHeight}px`);
        stack.style.setProperty("--loop-scroll-distance", `${scrollDistance}px`);
        stack.style.setProperty(
          "--loop-track-height",
          `${naturalHeight + scrollDistance}px`,
        );
        stack.style.setProperty(
          "--loop-collapsed-height",
          `${collapsedHeight}px`,
        );
        stack.classList.add("is-loop-stack-ready");

        if (lifecycle === "stacking") {
          activationScrollY = furthestScrollY - progress * scrollDistance;
        } else if (lifecycle === "idle") {
          entryScrollY =
            stack.getBoundingClientRect().top + window.scrollY - stickyTop;
        }

        updateCardPositions(progress);
      };

      const collapseTrack = (compensateScroll: boolean) => {
        if (lifecycle === "collapsed") return;

        const contentAnchor = stack.closest("section")?.nextElementSibling;
        const anchorTopBefore = contentAnchor?.getBoundingClientRect().top;
        progress = 1;
        updateCardPositions(progress);
        setLifecycle("collapsed");

        if (!compensateScroll) return;

        const anchorTopAfter = contentAnchor?.getBoundingClientRect().top;
        const scrollCorrection =
          anchorTopBefore !== undefined && anchorTopAfter !== undefined
            ? anchorTopAfter - anchorTopBefore
            : -scrollDistance;

        window.scrollBy({
          top: scrollCorrection,
          left: 0,
          behavior: "instant",
        });
        lastScrollY = window.scrollY;
        furthestScrollY = window.scrollY;
      };

      const updateFromScroll = () => {
        animationFrame = 0;
        const currentScrollY = window.scrollY;
        const isMovingDown = currentScrollY > lastScrollY;
        const liveEntryScrollY =
          stack.getBoundingClientRect().top + currentScrollY - stickyTop;

        if (lifecycle === "collapsed") {
          lastScrollY = currentScrollY;
          return;
        }

        if (lifecycle === "idle") {
          entryScrollY = liveEntryScrollY;
        }

        if (
          lifecycle === "idle" &&
          (currentScrollY >= entryScrollY || (isMovingDown && lastScrollY <= entryScrollY))
        ) {
          setLifecycle("stacking");
          activationScrollY = entryScrollY;
          furthestScrollY = Math.max(currentScrollY, entryScrollY);
        }

        if (lifecycle === "stacking") {
          if (currentScrollY >= liveEntryScrollY && liveEntryScrollY < activationScrollY) {
            activationScrollY = liveEntryScrollY;
          }

          furthestScrollY = Math.max(furthestScrollY, currentScrollY);
          const nextProgress = Math.min(
            1,
            Math.max(0, (furthestScrollY - activationScrollY) / scrollDistance),
          );

          if (nextProgress > progress) {
            progress = nextProgress;
            updateCardPositions(progress);
          }

          if (progress >= 1) {
            collapseTrack(true);
            return;
          }
        }

        lastScrollY = currentScrollY;
      };

      const scheduleUpdate = () => {
        if (animationFrame) return;
        animationFrame = window.requestAnimationFrame(updateFromScroll);
      };

      const handleResize = () => {
        if (resizeFrame) return;
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = 0;
          configureScrollTrack();
          updateFromScroll();
        });
      };

      setIsRevealed(true);
      setupFrame = window.requestAnimationFrame(() => {
        setupFrame = 0;
        setLifecycle("idle");
        configureScrollTrack();
        updateFromScroll();
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", handleResize);
      });

      return () => {
        if (setupFrame) window.cancelAnimationFrame(setupFrame);
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
        window.removeEventListener("scroll", scheduleUpdate);
        window.removeEventListener("resize", handleResize);
        clearStackStyles();
      };
    };

    const syncMode = () => {
      cleanupMode();
      clearStackStyles();

      if (reducedMotion.matches) {
        setIsRevealed(true);
        cleanupMode = () => {};
        return;
      }

      cleanupMode = mobileViewport.matches
        ? enableMobileStack()
        : enableRevealObserver();
    };

    syncMode();
    mobileViewport.addEventListener("change", syncMode);
    reducedMotion.addEventListener("change", syncMode);

    return () => {
      cleanupMode();
      mobileViewport.removeEventListener("change", syncMode);
      reducedMotion.removeEventListener("change", syncMode);
    };
  }, []);

  return (
    <div
      ref={stackRef}
      className={`setup-orchestration-stack${isRevealed ? " is-loop-revealed" : ""}`}
      data-loop-revealed={isRevealed}
      data-loop-stack-lifecycle="static"
    >
      <div ref={shellRef} className="setup-orchestration-sticky-shell">
        {points.map((point) => (
          <article key={point.title} className="setup-orchestration-card">
            <span>{point.label}</span>
            <h3>{point.title}</h3>
            <p>{richText(point.text)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
