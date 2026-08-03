"use client";

import { useEffect, useRef } from "react";

export type ScrollAccentWaypoint = {
  id: string;
  phase: string;
  x: number;
  y: number;
  size: number;
  magnet?: boolean;
};

export type ScrollAccentFrame = ScrollAccentWaypoint;

type ScrollAccentRoute = {
  waypoints: ScrollAccentWaypoint[];
  globalX: number;
  routeExitScroll: number;
  fadeStartScroll: number;
  fadeEndScroll: number;
};

const DEFAULT_DOT_SIZE = 8;
const DEFAULT_MAGNET_HOLD = 0.1;
const HEADING_MAGNET_HOLD = 0.18;

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(value: number) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

export function getScrollAccentActivationY(viewportHeight: number) {
  return clamp(viewportHeight * 0.38, 180, 360);
}

function magnetHold(waypoint: ScrollAccentWaypoint) {
  if (!waypoint.magnet) return 0;
  return waypoint.phase === "heading"
    ? HEADING_MAGNET_HOLD
    : DEFAULT_MAGNET_HOLD;
}

export function resolveScrollAccentFrame(
  waypoints: ScrollAccentWaypoint[],
  scrollY: number,
  activationY: number,
  reducedMotion = false,
): ScrollAccentFrame | null {
  if (!waypoints.length) return null;

  const first = waypoints[0];
  const firstActivation = Math.max(0, first.y - activationY);

  if (scrollY <= firstActivation || waypoints.length === 1) {
    return first;
  }

  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const current = waypoints[index];
    const next = waypoints[index + 1];
    const start = Math.max(0, current.y - activationY);
    const end = Math.max(start + 1, next.y - activationY);

    if (scrollY > end) continue;

    const rawProgress = clamp((scrollY - start) / (end - start));
    const active = rawProgress < 0.5 ? current : next;

    if (reducedMotion) {
      let previousMagnetIndex = index;
      let nextMagnetIndex = index + 1;

      while (
        previousMagnetIndex > 0 &&
        !waypoints[previousMagnetIndex].magnet
      ) {
        previousMagnetIndex -= 1;
      }
      while (
        nextMagnetIndex < waypoints.length - 1 &&
        !waypoints[nextMagnetIndex].magnet
      ) {
        nextMagnetIndex += 1;
      }

      const previousMagnet = waypoints[previousMagnetIndex];
      const nextMagnet = waypoints[nextMagnetIndex];
      const previousActivation = Math.max(0, previousMagnet.y - activationY);
      const nextActivation = Math.max(
        previousActivation + 1,
        nextMagnet.y - activationY,
      );

      return scrollY < (previousActivation + nextActivation) / 2
        ? previousMagnet
        : nextMagnet;
    }

    const startHold = magnetHold(current);
    const endHold = magnetHold(next);
    const travelRange = Math.max(0.01, 1 - startHold - endHold);
    const progress = smoothstep((rawProgress - startHold) / travelRange);

    return {
      ...active,
      x: current.x + (next.x - current.x) * progress,
      y: current.y + (next.y - current.y) * progress,
      size: current.size + (next.size - current.size) * progress,
    };
  }

  return waypoints[waypoints.length - 1];
}

function elementCenter(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();

  return {
    x: bounds.left + window.scrollX + bounds.width / 2,
    y: bounds.top + window.scrollY + bounds.height / 2,
    size: bounds.width || DEFAULT_DOT_SIZE,
  };
}

function waypointFromElement(element: HTMLElement): ScrollAccentWaypoint {
  const point = elementCenter(element);

  return {
    id: element.dataset.scrollAccentAnchor ?? "accent-anchor",
    phase: element.dataset.scrollAccentPhase ?? "heading",
    x: point.x,
    y: point.y,
    size: point.size,
    magnet: true,
  };
}

function isVisibleProjectNode(element: HTMLElement) {
  const details = element.closest("details");
  return details instanceof HTMLDetailsElement && details.open;
}

function pushOrderedWaypoint(
  waypoints: ScrollAccentWaypoint[],
  point: ScrollAccentWaypoint,
) {
  const previous = waypoints[waypoints.length - 1];
  const minimumY = previous ? previous.y + 1 : point.y;

  waypoints.push({
    ...point,
    y: Math.max(point.y, minimumY),
  });
}

function pushGlobalBridge(
  waypoints: ScrollAccentWaypoint[],
  globalX: number,
  current: ScrollAccentWaypoint,
  next: ScrollAccentWaypoint,
) {
  const gap = Math.max(1, next.y - current.y);
  const travel = Math.min(
    clamp(gap * 0.16, 56, 140),
    Math.max(1, gap / 2 - 1),
  );

  pushOrderedWaypoint(waypoints, {
    id: `${current.id}-global-departure`,
    phase: "global-rail",
    x: globalX,
    y: current.y + travel,
    size: DEFAULT_DOT_SIZE,
  });
  pushOrderedWaypoint(waypoints, {
    id: `${next.id}-global-approach`,
    phase: "global-rail",
    x: globalX,
    y: next.y - travel,
    size: DEFAULT_DOT_SIZE,
  });
  pushOrderedWaypoint(waypoints, next);
}

function getGlobalRailX(globalRail: HTMLElement) {
  return globalRail.getBoundingClientRect().left + window.scrollX;
}

function buildHomeScrollAccentRoute(activationY: number): ScrollAccentRoute | null {
  const globalRail = document.querySelector<HTMLElement>(
    ".scroll-accent-global-rail",
  );
  const hero = document.querySelector<HTMLElement>(
    '[data-scroll-accent-anchor="hero"]',
  );
  const work = document.querySelector<HTMLElement>(
    '[data-scroll-accent-anchor="work"]',
  );
  const experienceHeading = document.querySelector<HTMLElement>(
    '[data-scroll-accent-anchor="experience"]',
  );
  const aboutHeading = document.querySelector<HTMLElement>(
    '[data-scroll-accent-anchor="about"]',
  );
  const experienceSection = document.querySelector<HTMLElement>(
    "[data-scroll-accent-experience]",
  );
  const contactSection = document.querySelector<HTMLElement>(
    "[data-scroll-accent-contact]",
  );

  if (
    !globalRail ||
    !hero ||
    !work ||
    !experienceHeading ||
    !aboutHeading ||
    !experienceSection ||
    !contactSection
  ) {
    return null;
  }

  const globalX = getGlobalRailX(globalRail);
  const waypoints: ScrollAccentWaypoint[] = [];

  const heroPoint = waypointFromElement(hero);
  const workPoint = waypointFromElement(work);
  const experienceHeadingPoint = waypointFromElement(experienceHeading);

  pushOrderedWaypoint(waypoints, heroPoint);
  pushGlobalBridge(waypoints, globalX, heroPoint, workPoint);
  pushGlobalBridge(waypoints, globalX, workPoint, experienceHeadingPoint);

  const experienceItems = Array.from(
    experienceSection.querySelectorAll<HTMLElement>(".experience-item"),
  ).map((item) => {
    const majorElement = item.querySelector<HTMLElement>(
      '[data-scroll-accent-phase="experience-major"]',
    );
    const minorElements = Array.from(
      item.querySelectorAll<HTMLElement>(
        '[data-scroll-accent-phase="experience-minor"]',
      ),
    ).filter(isVisibleProjectNode);

    return {
      item,
      major: majorElement ? waypointFromElement(majorElement) : null,
      minors: minorElements.map(waypointFromElement),
    };
  });

  const firstExperienceMajor = experienceItems.find(
    (entry) => entry.major,
  )?.major;

  if (firstExperienceMajor) {
    pushGlobalBridge(waypoints, globalX, experienceHeadingPoint, firstExperienceMajor);
  }

  experienceItems.forEach((entry, index) => {
    if (!entry.major) return;

    if (entry.major !== firstExperienceMajor) {
      pushOrderedWaypoint(waypoints, entry.major);
    }

    if (!entry.minors.length) return;

    const firstMinor = entry.minors[0];
    const lastMinor = entry.minors[entry.minors.length - 1];
    const nextMajor = experienceItems
      .slice(index + 1)
      .find((candidate) => candidate.major)?.major;
    const enterStartY = Math.max(entry.major.y + entry.major.size, firstMinor.y - 34);
    const enterEndY = Math.max(enterStartY + 14, firstMinor.y - 16);

    pushOrderedWaypoint(waypoints, {
      id: `${entry.major.id}-project-handoff-start`,
      phase: "experience-rail",
      x: entry.major.x,
      y: enterStartY,
      size: DEFAULT_DOT_SIZE,
    });
    pushOrderedWaypoint(waypoints, {
      id: `${entry.major.id}-project-handoff-end`,
      phase: "experience-rail",
      x: firstMinor.x,
      y: enterEndY,
      size: DEFAULT_DOT_SIZE,
    });

    entry.minors.forEach((point) => pushOrderedWaypoint(waypoints, point));

    const itemBottom =
      entry.item.getBoundingClientRect().bottom + window.scrollY;
    const availableExitY = nextMajor
      ? nextMajor.y - nextMajor.size
      : itemBottom - 12;
    const exitStartY = Math.min(
      availableExitY - 14,
      Math.max(lastMinor.y + 26, lastMinor.y + lastMinor.size),
    );
    const exitEndY = Math.min(availableExitY, Math.max(exitStartY + 14, exitStartY));

    if (exitStartY > lastMinor.y) {
      pushOrderedWaypoint(waypoints, {
        id: `${entry.major.id}-project-return-start`,
        phase: "experience-rail",
        x: lastMinor.x,
        y: exitStartY,
        size: DEFAULT_DOT_SIZE,
      });
      pushOrderedWaypoint(waypoints, {
        id: `${entry.major.id}-project-return-end`,
        phase: "experience-rail",
        x: entry.major.x,
        y: exitEndY,
        size: DEFAULT_DOT_SIZE,
      });
    }
  });

  const experienceBounds = experienceSection.getBoundingClientRect();
  const experienceBottom = experienceBounds.bottom + window.scrollY;
  const lastWaypoint = waypoints[waypoints.length - 1];
  const mainRailX =
    [...waypoints]
      .reverse()
      .find((waypoint) => waypoint.phase === "experience-major")?.x ??
    lastWaypoint.x;
  const returnStartY = Math.max(lastWaypoint.y + 24, experienceBottom - 64);
  const returnEndY = Math.max(returnStartY + 18, experienceBottom - 32);

  pushOrderedWaypoint(waypoints, {
    id: "experience-global-return-start",
    phase: "experience-rail",
    x: mainRailX,
    y: returnStartY,
    size: DEFAULT_DOT_SIZE,
  });
  pushOrderedWaypoint(waypoints, {
    id: "experience-global-return-end",
    phase: "global-rail",
    x: globalX,
    y: returnEndY,
    size: DEFAULT_DOT_SIZE,
  });

  const aboutPoint = waypointFromElement(aboutHeading);
  const aboutApproachGap = Math.max(1, aboutPoint.y - returnEndY);
  const aboutApproach = clamp(aboutApproachGap * 0.18, 56, 140);

  pushOrderedWaypoint(waypoints, {
    id: "about-global-approach",
    phase: "global-rail",
    x: globalX,
    y: aboutPoint.y - aboutApproach,
    size: DEFAULT_DOT_SIZE,
  });
  pushOrderedWaypoint(waypoints, aboutPoint);

  const contactTop =
    contactSection.getBoundingClientRect().top + window.scrollY;
  const aboutReturnTravel = clamp(
    (contactTop - aboutPoint.y) * 0.16,
    56,
    140,
  );
  pushOrderedWaypoint(waypoints, {
    id: "about-global-return",
    phase: "global-rail",
    x: globalX,
    y: aboutPoint.y + aboutReturnTravel,
    size: DEFAULT_DOT_SIZE,
  });

  const routeExitScroll = Math.max(
    0,
    waypoints[waypoints.length - 1].y - activationY,
  );
  const fadeStartScroll = Math.max(
    routeExitScroll,
    contactTop - activationY - 96,
  );
  const fadeEndScroll = Math.max(fadeStartScroll + 1, contactTop - activationY + 64);

  return {
    waypoints,
    globalX,
    routeExitScroll,
    fadeStartScroll,
    fadeEndScroll,
  };
}

function buildGenericScrollAccentRoute(activationY: number): ScrollAccentRoute | null {
  const globalRail = document.querySelector<HTMLElement>(
    ".scroll-accent-global-rail",
  );
  const main = document.getElementById("main-content");

  if (!globalRail || !main) return null;

  const anchors = Array.from(
    main.querySelectorAll<HTMLElement>("[data-scroll-accent-anchor]"),
  )
    .filter((element) => element.offsetParent !== null)
    .map(waypointFromElement)
    .sort((first, second) => first.y - second.y);

  if (!anchors.length) return null;

  const globalX = getGlobalRailX(globalRail);
  const waypoints: ScrollAccentWaypoint[] = [];
  const first = anchors[0];

  pushOrderedWaypoint(waypoints, first);
  anchors.slice(1).forEach((anchor) => {
    const previous = waypoints[waypoints.length - 1];
    pushGlobalBridge(waypoints, globalX, previous, anchor);
  });

  const last = waypoints[waypoints.length - 1];
  const mainBottom = main.getBoundingClientRect().bottom + window.scrollY;
  const returnTravel = clamp((mainBottom - last.y) * 0.14, 56, 140);
  const returnY = Math.max(last.y + 24, last.y + returnTravel);

  pushOrderedWaypoint(waypoints, {
    id: `${last.id}-global-return`,
    phase: "global-rail",
    x: globalX,
    y: returnY,
    size: DEFAULT_DOT_SIZE,
  });

  const routeExitScroll = Math.max(0, returnY - activationY);
  const fadeStartScroll = Math.max(routeExitScroll, mainBottom - activationY - 160);
  const fadeEndScroll = Math.max(fadeStartScroll + 1, mainBottom - activationY);

  return {
    waypoints,
    globalX,
    routeExitScroll,
    fadeStartScroll,
    fadeEndScroll,
  };
}

function buildScrollAccentRoute(activationY: number): ScrollAccentRoute | null {
  return (
    buildHomeScrollAccentRoute(activationY) ??
    buildGenericScrollAccentRoute(activationY)
  );
}

function setDotFrame(
  dot: HTMLSpanElement,
  frame: ScrollAccentFrame,
  scrollY: number,
  opacity: number,
) {
  const viewportX = frame.x - window.scrollX;
  const viewportY = frame.y - scrollY;

  dot.style.width = `${frame.size}px`;
  dot.style.height = `${frame.size}px`;
  dot.style.opacity = `${clamp(opacity)}`;
  dot.style.transform = `translate3d(${viewportX - frame.size / 2}px, ${viewportY - frame.size / 2}px, 0)`;
  dot.dataset.activeAnchor = frame.id;
  dot.dataset.phase = frame.phase;
  dot.dataset.ready = "true";
}

export function ScrollAccent() {
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!dotRef.current) return;

    const dot = dotRef.current;
    const root = document.documentElement;
    const main = document.getElementById("main-content");
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reducedMotion = motionPreference.matches;
    let route: ScrollAccentRoute | null = null;
    let animationFrame = 0;
    let entryAnimation: Animation | null = null;
    let hasStarted = false;
    let isActive = true;
    let introObserver: MutationObserver | null = null;

    root.classList.add("scroll-accent-mounted");

    function activationY() {
      return getScrollAccentActivationY(window.innerHeight);
    }

    function render() {
      animationFrame = 0;
      if (!hasStarted || !route) return;

      const scrollY = window.scrollY;
      const activeLine = activationY();

      if (scrollY >= route.routeExitScroll) {
        const fadeProgress = clamp(
          (scrollY - route.fadeStartScroll) /
            (route.fadeEndScroll - route.fadeStartScroll),
        );
        const frame: ScrollAccentFrame = {
          id: fadeProgress > 0 ? "contact-exit" : "about-global-rail",
          phase: fadeProgress > 0 ? "contact-exit" : "global-rail",
          x: route.globalX,
          y: scrollY + activeLine,
          size: DEFAULT_DOT_SIZE,
        };

        setDotFrame(dot, frame, scrollY, 1 - smoothstep(fadeProgress));
        return;
      }

      const frame = resolveScrollAccentFrame(
        route.waypoints,
        scrollY,
        activeLine,
        reducedMotion,
      );

      if (frame) setDotFrame(dot, frame, scrollY, 1);
    }

    function scheduleRender() {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function measure() {
      if (!isActive) return;
      route = buildScrollAccentRoute(activationY());
      scheduleRender();
    }

    function start() {
      if (hasStarted) return;
      hasStarted = true;
      measure();

      const first = route?.waypoints[0];
      if (
        !first ||
        window.scrollY > 8 ||
        reducedMotion ||
        typeof dot.animate !== "function"
      ) {
        render();
        return;
      }

      const targetX = first.x - window.scrollX - first.size / 2;
      const targetY = first.y - window.scrollY - first.size / 2;
      dot.dataset.activeAnchor = "entry";
      dot.dataset.phase = "entry";
      dot.dataset.ready = "true";
      dot.style.opacity = "1";
      dot.style.width = `${first.size}px`;
      dot.style.height = `${first.size}px`;

      entryAnimation = dot.animate(
        [
          {
            transform: `translate3d(${targetX}px, ${-first.size - 12}px, 0)`,
          },
          {
            offset: 0.78,
            transform: `translate3d(${targetX}px, ${targetY + 7}px, 0)`,
          },
          {
            transform: `translate3d(${targetX}px, ${targetY}px, 0)`,
          },
        ],
        {
          duration: 680,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
      entryAnimation.addEventListener(
        "finish",
        () => {
          entryAnimation = null;
          render();
        },
        { once: true },
      );
    }

    function handleScroll() {
      if (entryAnimation) {
        entryAnimation.cancel();
        entryAnimation = null;
      }
      scheduleRender();
    }

    function handleResize() {
      measure();
    }

    function handleMotionPreference(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      if (entryAnimation) {
        entryAnimation.cancel();
        entryAnimation = null;
      }
      render();
    }

    function waitForIntro() {
      if (!document.querySelector(".launch-terminal")) {
        start();
        return;
      }

      introObserver = new MutationObserver(() => {
        if (!document.querySelector(".launch-terminal")) {
          introObserver?.disconnect();
          introObserver = null;
          start();
        }
      });
      introObserver.observe(document.body, { childList: true, subtree: true });
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    if (main) resizeObserver?.observe(main);

    const details = Array.from(
      document.querySelectorAll<HTMLDetailsElement>(
        "details[data-scroll-accent-details]",
      ),
    );
    details.forEach((element) => element.addEventListener("toggle", measure));

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    motionPreference.addEventListener("change", handleMotionPreference);
    void document.fonts?.ready.then(measure);
    waitForIntro();

    return () => {
      isActive = false;
      root.classList.remove("scroll-accent-mounted");
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      motionPreference.removeEventListener("change", handleMotionPreference);
      details.forEach((element) => element.removeEventListener("toggle", measure));
      resizeObserver?.disconnect();
      introObserver?.disconnect();
      entryAnimation?.cancel();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <span className="scroll-accent-global-rail" aria-hidden="true" />
      <span ref={dotRef} className="scroll-accent-traveler" aria-hidden="true" />
    </>
  );
}
