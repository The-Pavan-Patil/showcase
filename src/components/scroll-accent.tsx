"use client";

import { useEffect, useRef } from "react";

import { clamp, smoothstep } from "@/lib/utils";

export type ScrollAccentWaypoint = {
  id: string;
  phase: string;
  x: number;
  y: number;
  size: number;
  magnet?: boolean;
  /** 0 hides the dot on this waypoint; it fades on the way in and out. */
  opacity?: number;
  /**
   * For a point that rides a sticky stage: its document y before the stage
   * pins, and the scroll range the stage stays pinned for, during which the
   * point keeps its place in the viewport. `y` then only times the waypoint,
   * which still activates when `y` reaches the activation line.
   */
  stick?: { y: number; from: number; to: number };
};

export type ScrollAccentFrame = ScrollAccentWaypoint;

type ScrollAccentRoute = {
  waypoints: ScrollAccentWaypoint[];
  /** Where the dot leaves the route for the global rail, then fades out. */
  exit?: {
    globalX: number;
    scroll: number;
    fadeStartScroll: number;
    fadeEndScroll: number;
  };
};

const DEFAULT_DOT_SIZE = 8;
const DEFAULT_MAGNET_HOLD = 0.1;
const HEADING_MAGNET_HOLD = 0.18;
/** Scroll over which the dot fades in or out on an eyebrow. */
const FADE_TRAVEL = 140;

export function getScrollAccentActivationY(viewportHeight: number) {
  return clamp(viewportHeight * 0.38, 180, 360);
}

function magnetHold(waypoint: ScrollAccentWaypoint) {
  if (!waypoint.magnet) return 0;
  return waypoint.phase === "heading"
    ? HEADING_MAGNET_HOLD
    : DEFAULT_MAGNET_HOLD;
}

/** A sticky waypoint is drawn where its stage holds it at this scroll. */
function placeWaypoint(
  waypoint: ScrollAccentWaypoint,
  scrollY: number,
): ScrollAccentFrame {
  const { stick } = waypoint;
  return stick
    ? {
        ...waypoint,
        y: stick.y + clamp(scrollY - stick.from, 0, stick.to - stick.from),
      }
    : waypoint;
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
    return placeWaypoint(first, scrollY);
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

      return placeWaypoint(
        scrollY < (previousActivation + nextActivation) / 2
          ? previousMagnet
          : nextMagnet,
        scrollY,
      );
    }

    const startHold = magnetHold(current);
    const endHold = magnetHold(next);
    const travelRange = Math.max(0.01, 1 - startHold - endHold);
    const progress = smoothstep((rawProgress - startHold) / travelRange);
    const fromY = placeWaypoint(current, scrollY).y;
    const toY = placeWaypoint(next, scrollY).y;
    const tracksOnePlace = current.x === next.x && Math.abs(fromY - toY) < 0.5;
    // Leaving or reaching a sticky point, the dot slides through the viewport
    // from where it left the one to where it meets the other, rather than
    // following an eyebrow off screen before turning back.
    const viewportY =
      (current.stick || next.stick) && !tracksOnePlace
        ? (() => {
            const fromViewport = placeWaypoint(current, start).y - start;
            const toViewport = placeWaypoint(next, end).y - end;
            return (
              scrollY + fromViewport + (toViewport - fromViewport) * progress
            );
          })()
        : null;
    const fromOpacity = current.opacity ?? 1;
    const toOpacity = next.opacity ?? 1;

    return {
      ...active,
      x: current.x + (next.x - current.x) * progress,
      y: viewportY ?? fromY + (toY - fromY) * progress,
      size: current.size + (next.size - current.size) * progress,
      opacity: fromOpacity + (toOpacity - fromOpacity) * progress,
    };
  }

  return placeWaypoint(waypoints[waypoints.length - 1], scrollY);
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

/**
 * The scroll range a sticky stage stays pinned for, or null while it is not
 * sticky. The stage must be the first in-flow child of its track, so it rests
 * at the top of the track until it pins.
 */
function getPinRange(stage: HTMLElement | null) {
  const track = stage?.parentElement;
  if (!stage || !track) return null;

  const stageStyle = getComputedStyle(stage);
  if (stageStyle.position !== "sticky") return null;

  const stickyTop = Number.parseFloat(stageStyle.top) || 0;
  const trackBounds = track.getBoundingClientRect();
  const trackTop =
    trackBounds.top +
    window.scrollY +
    (Number.parseFloat(getComputedStyle(track).paddingTop) || 0);
  const from = trackTop - stickyTop;
  const to =
    trackBounds.bottom + window.scrollY - stage.offsetHeight - stickyTop;

  return { from, to: Math.max(from, to) };
}

/**
 * A heading anchor whose eyebrow rides `stage` while it is pinned. An anchor
 * inside the stage is measured wherever the stage holds it now; one outside
 * it sits where the eyebrow rests before the stage pins.
 */
function stickyWaypointFromElement(
  element: HTMLElement,
  stage: HTMLElement | null,
): ScrollAccentWaypoint {
  const point = waypointFromElement(element);
  const range = getPinRange(stage);
  if (!stage || !range) return point;

  const shift = stage.contains(element)
    ? clamp(window.scrollY - range.from, 0, range.to - range.from)
    : 0;
  const y = point.y - shift;

  return { ...point, y, stick: { y, ...range } };
}

/**
 * `point` timed to activate at `y`, still drawn where it is: a point without
 * a stage sticks for an empty range.
 */
function timed(point: ScrollAccentWaypoint, y: number): ScrollAccentWaypoint {
  return {
    ...point,
    y,
    stick: point.stick ?? { y: point.y, from: 0, to: 0 },
  };
}

/** Where `point`'s eyebrow ends up once any stage has let it go. */
function settledY(point: ScrollAccentWaypoint) {
  return point.stick
    ? point.stick.y + point.stick.to - point.stick.from
    : point.y;
}

/**
 * Settles the dot on an eyebrow by the time it reaches the activation line,
 * or its stage pins, and with `hold` keeps it there until the stage lets go.
 */
function pushStop(
  waypoints: ScrollAccentWaypoint[],
  point: ScrollAccentWaypoint,
  activationY: number,
  hold = true,
) {
  const arrival = point.stick
    ? Math.min(point.y, point.stick.from + activationY)
    : point.y;

  pushOrderedWaypoint(waypoints, timed(point, arrival));
  if (hold && point.stick && point.stick.to + activationY > arrival) {
    pushOrderedWaypoint(waypoints, timed(point, point.stick.to + activationY));
  }
}

/** Fades the dot in on an eyebrow as it rises towards the activation line. */
function pushFadeIn(
  waypoints: ScrollAccentWaypoint[],
  point: ScrollAccentWaypoint,
  activationY: number,
) {
  const arrival = point.stick
    ? Math.min(point.y, point.stick.from + activationY)
    : point.y;

  pushOrderedWaypoint(waypoints, {
    ...timed(point, arrival - FADE_TRAVEL),
    id: `${point.id}-entry`,
    phase: "hidden",
    opacity: 0,
  });
  pushStop(waypoints, point, activationY);
}

/** Fades the dot out on an eyebrow as it rises under the header. */
function pushFadeOut(
  waypoints: ScrollAccentWaypoint[],
  point: ScrollAccentWaypoint,
  activationY: number,
) {
  const previous = waypoints[waypoints.length - 1];
  const start = Math.max(
    previous?.y ?? point.y,
    settledY(point) + activationY * 0.4,
  );

  pushOrderedWaypoint(waypoints, timed(point, start));
  pushOrderedWaypoint(waypoints, {
    ...timed(point, start + FADE_TRAVEL),
    id: `${point.id}-exit`,
    phase: "hidden",
    opacity: 0,
  });
}

/**
 * While the Experience scene is pinned, its timeline nodes cross a focus line.
 * Each node publishes the scroll into the track at which the dot reaches it
 * and where it is then, so its waypoint activates at that scroll and is drawn
 * there until the stage releases. The track publishes where its pinned range
 * ends, so the dot rides the rail until then.
 */
function getPinnedExperienceWaypoints(
  track: HTMLElement,
  activationY: number,
): ScrollAccentWaypoint[] {
  const focusY = Number.parseFloat(track.dataset.scrollAccentFocus ?? "");
  const end = Number.parseFloat(track.dataset.scrollAccentEnd ?? "");
  if (!Number.isFinite(focusY) || !Number.isFinite(end)) return [];

  const trackTop = track.getBoundingClientRect().top + window.scrollY;
  const range = getPinRange(
    track.querySelector<HTMLElement>(".experience-stage"),
  ) ?? { from: trackTop, to: trackTop + end };
  const stickAt = (viewportY: number) => ({
    y: range.from + viewportY,
    from: range.from,
    to: range.to,
  });

  const nodes = Array.from(
    track.querySelectorAll<HTMLElement>("[data-scroll-accent-offset]"),
  )
    .filter(
      (element) =>
        element.dataset.scrollAccentPhase !== "experience-minor" ||
        isVisibleProjectNode(element),
    )
    .map((element) => {
      const nodeFocusY = Number.parseFloat(element.dataset.scrollAccentFocus ?? "");
      return {
        ...waypointFromElement(element),
        y: trackTop + Number(element.dataset.scrollAccentOffset) + activationY,
        stick: stickAt(Number.isFinite(nodeFocusY) ? nodeFocusY : focusY),
      };
    })
    .sort((first, second) => first.y - second.y);

  const lastMajor = [...nodes]
    .reverse()
    .find((node) => node.phase === "experience-major");
  if (lastMajor && trackTop + end + activationY > nodes[nodes.length - 1].y) {
    nodes.push({
      id: "experience-rail-end",
      phase: "experience-rail",
      x: lastMajor.x,
      y: trackTop + end + activationY,
      size: DEFAULT_DOT_SIZE,
      stick: stickAt(focusY),
    });
  }

  return nodes;
}

/**
 * The homepage route. The dot slides straight from eyebrow to eyebrow and
 * rides each one while its section is pinned: from the hero to Selected Work
 * until its cards finish, to Experience and down its timeline, to the AI
 * workflow. It fades out as About arrives and back in on the quick message.
 */
function buildHomeScrollAccentRoute(activationY: number): ScrollAccentRoute | null {
  const anchor = (id: string) =>
    document.querySelector<HTMLElement>(`[data-scroll-accent-anchor="${id}"]`);
  const hero = anchor("hero");
  const work = anchor("work");
  const experienceHeading = anchor("experience");
  const workflowHeading = anchor("workflow");
  const message = anchor("message");
  const experienceSection = document.querySelector<HTMLElement>(
    "[data-scroll-accent-experience]",
  );

  if (
    !hero ||
    !work ||
    !experienceHeading ||
    !workflowHeading ||
    !message ||
    !experienceSection
  ) {
    return null;
  }

  const waypoints: ScrollAccentWaypoint[] = [];

  pushOrderedWaypoint(waypoints, waypointFromElement(hero));
  pushStop(
    waypoints,
    stickyWaypointFromElement(
      work,
      work.closest(".dust-track")?.querySelector<HTMLElement>(".dust-stage") ??
        null,
    ),
    activationY,
  );

  const experienceTrack = experienceSection.querySelector<HTMLElement>(
    "[data-scroll-accent-track]",
  );
  const experienceStage =
    experienceSection.querySelector<HTMLElement>(".experience-stage");
  const pinnedExperience = experienceTrack
    ? getPinnedExperienceWaypoints(experienceTrack, activationY)
    : [];

  // The eyebrow hands the dot straight on to the first node.
  pushStop(
    waypoints,
    stickyWaypointFromElement(experienceHeading, experienceStage),
    activationY,
    !pinnedExperience.length,
  );
  pinnedExperience.forEach((point) => pushOrderedWaypoint(waypoints, point));

  // The static timeline, traced at the nodes' document positions.
  const experienceItems = (
    pinnedExperience.length
      ? []
      : Array.from(
          experienceSection.querySelectorAll<HTMLElement>(".experience-item"),
        )
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

  experienceItems.forEach((entry, index) => {
    if (!entry.major) return;

    pushOrderedWaypoint(waypoints, entry.major);

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

  // From the timeline straight to the AI workflow eyebrow, which the dot then
  // follows up and out as About arrives.
  const workflowPoint = waypointFromElement(workflowHeading);
  pushStop(waypoints, workflowPoint, activationY);
  pushFadeOut(waypoints, workflowPoint, activationY);

  // Hidden through About, back on the quick message's eyebrow.
  const messagePoint = stickyWaypointFromElement(
    message,
    message.closest<HTMLElement>(".quick-message-band"),
  );
  pushFadeIn(waypoints, messagePoint, activationY);
  pushFadeOut(waypoints, messagePoint, activationY);

  return { waypoints };
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

  const exitScroll = Math.max(0, returnY - activationY);
  const fadeStartScroll = Math.max(exitScroll, mainBottom - activationY - 160);
  const fadeEndScroll = Math.max(fadeStartScroll + 1, mainBottom - activationY);

  return {
    waypoints,
    exit: { globalX, scroll: exitScroll, fadeStartScroll, fadeEndScroll },
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
    // Document spans of surfaces that keep one tone in either theme, such as
    // the dark hero ("dark").
    let surfaces: Array<{ tone: string; top: number; bottom: number }> = [];

    root.classList.add("scroll-accent-mounted");

    function activationY() {
      return getScrollAccentActivationY(window.innerHeight);
    }

    // The dot takes the tone of the innermost surface it rests over.
    function setSurface(y: number) {
      let tone = "page";
      let span = Infinity;
      for (const surface of surfaces) {
        const height = surface.bottom - surface.top;
        if (y >= surface.top && y <= surface.bottom && height < span) {
          tone = surface.tone;
          span = height;
        }
      }
      dot.dataset.surface = tone;
    }

    function render() {
      animationFrame = 0;
      if (!hasStarted || !route) return;

      const scrollY = window.scrollY;
      const activeLine = activationY();

      const { exit } = route;
      if (exit && scrollY >= exit.scroll) {
        const fadeProgress = clamp(
          (scrollY - exit.fadeStartScroll) /
            (exit.fadeEndScroll - exit.fadeStartScroll),
        );
        const frame: ScrollAccentFrame = {
          id: fadeProgress > 0 ? "contact-exit" : "about-global-rail",
          phase: fadeProgress > 0 ? "contact-exit" : "global-rail",
          x: exit.globalX,
          y: scrollY + activeLine,
          size: DEFAULT_DOT_SIZE,
        };

        setDotFrame(dot, frame, scrollY, 1 - smoothstep(fadeProgress));
        setSurface(frame.y);
        return;
      }

      const frame = resolveScrollAccentFrame(
        route.waypoints,
        scrollY,
        activeLine,
        reducedMotion,
      );

      if (frame) {
        setDotFrame(dot, frame, scrollY, frame.opacity ?? 1);
        setSurface(frame.y);
      }
    }

    function scheduleRender() {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function measure() {
      if (!isActive) return;
      surfaces = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-accent-surface]"),
        (element) => {
          const bounds = element.getBoundingClientRect();
          return {
            tone: element.dataset.scrollAccentSurface ?? "page",
            top: bounds.top + window.scrollY,
            bottom: bounds.bottom + window.scrollY,
          };
        },
      );
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
      setSurface(first.y);
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
    start();

    return () => {
      isActive = false;
      root.classList.remove("scroll-accent-mounted");
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      motionPreference.removeEventListener("change", handleMotionPreference);
      details.forEach((element) => element.removeEventListener("toggle", measure));
      resizeObserver?.disconnect();
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
