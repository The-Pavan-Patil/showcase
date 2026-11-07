"use client";

import { useEffect, useRef } from "react";

import { clamp } from "@/lib/utils";

/**
 * The accent dot. It is not scrubbed along a path: as each section enters the
 * viewport the dot is handed a new target (that section's eyebrow, or an
 * Experience timeline node) and flies there on its own, on a spring with a
 * slight curve. Once landed it rides the target; if the target scrolls up
 * under the header the dot lets go and floats just below it until the next
 * section calls it down.
 *
 * Layout is read only when the page is measured (resize, fonts, toggled
 * details). Each frame does arithmetic on cached stops and writes one
 * transform; the loop stops while the dot is at rest.
 */

export type ScrollAccentStop = {
  id: string;
  phase: string;
  /** Document coordinates of the target's centre. */
  x: number;
  y: number;
  size: number;
  /** Scroll position from which this stop is the dot's target. */
  activateAt: number;
  /**
   * For a target that rides a sticky stage: the scroll range the stage is
   * pinned for, during which the target keeps its place in the viewport.
   */
  stick?: { from: number; to: number };
  /** The dot fades out where it is (on the previous stop) instead of moving. */
  hidden?: boolean;
};

export type SpringState = { x: number; y: number; vx: number; vy: number };

/** How far down the viewport a section's top must rise to call the dot. */
const SECTION_ENTER_RATIO = 0.7;
/**
 * Spring on the dot's offset from its target. Over a 700px flight this lands
 * in about 0.8s, overshooting by ~9px; the take-off kick bows the path by
 * about 7% of the distance.
 */
const STIFFNESS = 120;
const DAMPING = 2 * 0.78 * Math.sqrt(STIFFNESS);
const ARC = 2;
/** The float line sits this far under the header; the dot eases into it over FLOAT_SOFTNESS. */
const FLOAT_GAP = 14;
const FLOAT_SOFTNESS = 16;
/**
 * The dot visits stops in order: if scrolling runs ahead of it, it touches
 * each skipped stop that is still on screen (within ARRIVE_DISTANCE) before
 * moving on. Behind by n stops, its spring stiffens by 1 + 3n² (capped), so
 * a 30px hop between timeline nodes takes ~120ms one behind and ~30ms four
 * behind. Stops already gone from view, and hidden stretches, are passed
 * straight over.
 */
const ARRIVE_DISTANCE = 8;
/**
 * While catching up, the dot rests this long on each stop that looks
 * different from the last (a company ring after a project dot, say), so the
 * change reads. Stops that look the same, such as a company's project dots,
 * which share a spot on the focus line, pass at once.
 */
const TOUR_DWELL_MS = 30;
/** ω = √(120·60) ≈ 85/s, stable at the 1/120 s integration step. */
const MAX_BOOST = 60;
/** Kick for catch-up hops: none, they go straight; only the final flight curves. */
const TOUR_ARC = 0;
const REST_DISTANCE = 0.3;
const REST_SPEED = 6;
const MAX_STEP = 1 / 120;

export function getScrollAccentActivationY(viewportHeight: number) {
  return clamp(viewportHeight * 0.38, 180, 360);
}

/** The stop that is the target at `scrollY`: the last one activated. */
export function resolveScrollAccentStop(stops: ScrollAccentStop[], scrollY: number) {
  let index = 0;
  for (let next = 1; next < stops.length && stops[next].activateAt <= scrollY; next += 1) {
    index = next;
  }
  return index;
}

/** Where a stop's target is drawn in the viewport at `scrollY`. */
export function stopViewportPoint(stop: ScrollAccentStop, scrollY: number) {
  const pinned = stop.stick
    ? clamp(scrollY - stop.stick.from, 0, stop.stick.to - stop.stick.from)
    : 0;
  return { x: stop.x, y: stop.y + pinned - scrollY };
}

/**
 * Keeps `y` below the float line, easing into it rather than stopping dead.
 * At or below `line + softness` the target is followed exactly; above that it
 * decelerates (smoothly, with no kink) and comes to rest on the line.
 */
export function floatBelow(y: number, line: number, softness = FLOAT_SOFTNESS) {
  const knee = line + softness;
  return y >= knee ? y : line + softness * Math.exp((y - knee) / softness);
}

/**
 * Advances the offset spring towards zero by `dt` seconds. `boost` stiffens
 * it (at the same damping ratio) when the dot is catching up.
 */
export function stepSpring(state: SpringState, dt: number, boost = 1): SpringState {
  const stiffness = STIFFNESS * boost;
  const damping = DAMPING * Math.sqrt(boost);
  let { x, y, vx, vy } = state;
  for (let left = dt; left > 0; left -= MAX_STEP) {
    const h = Math.min(MAX_STEP, left);
    vx += (-stiffness * x - damping * vx) * h;
    vy += (-stiffness * y - damping * vy) * h;
    x += vx * h;
    y += vy * h;
  }
  return { x, y, vx, vy };
}

export function isSpringAtRest(state: SpringState) {
  return (
    Math.hypot(state.x, state.y) < REST_DISTANCE &&
    Math.hypot(state.vx, state.vy) < REST_SPEED
  );
}

/**
 * Re-aims the spring from the dot's current offset to a new target: the dot
 * keeps its place and speed, and gets a sideways kick so the flight curves.
 */
export function launchSpring(
  state: SpringState,
  offset: { x: number; y: number },
  arc = ARC,
): SpringState {
  const { x, y } = offset;
  return { x, y, vx: state.vx - y * arc, vy: state.vy + x * arc };
}

/** How much stiffer the spring is when the dot is `backlog` stops behind. */
export function catchUpBoost(backlog: number) {
  return Math.min(MAX_BOOST, 1 + 3 * backlog * backlog);
}

/**
 * The stop the dot should head for next, given the one it is heading for
 * (`visit`), the one scrolling has reached (`target`), and whether it has
 * arrived at `visit`. It steps through the stops in between one at a time,
 * so none still on screen is skipped; across a hidden stretch it goes
 * direct.
 */
export function nextVisitIndex(
  stops: ScrollAccentStop[],
  visit: number,
  target: number,
  arrived: boolean,
  isOnScreen: (stop: ScrollAccentStop) => boolean,
) {
  if (visit === target) return visit;
  const step = Math.sign(target - visit);
  const from = Math.min(visit, target);
  const to = Math.max(visit, target);
  if (stops.slice(from, to + 1).some((stop) => stop.hidden)) return target;
  if (!arrived && isOnScreen(stops[visit])) return visit;
  for (let next = visit + step; next !== target; next += step) {
    if (isOnScreen(stops[next])) return next;
  }
  return target;
}

const REST: SpringState = { x: 0, y: 0, vx: 0, vy: 0 };

/* ---------------------------------------------------------------- measuring */

function centreOf(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  return {
    x: bounds.left + window.scrollX + bounds.width / 2,
    y: bounds.top + window.scrollY + bounds.height / 2,
    size: bounds.width || 8,
  };
}

function stopFrom(element: HTMLElement, activateAt: number): ScrollAccentStop {
  return {
    id: element.dataset.scrollAccentAnchor ?? "accent-anchor",
    phase: element.dataset.scrollAccentPhase ?? "heading",
    ...centreOf(element),
    activateAt,
  };
}

/** Scroll at which `element`'s section is far enough into the viewport. */
function sectionEntry(element: HTMLElement) {
  const section = element.closest("section") ?? element;
  const top = section.getBoundingClientRect().top + window.scrollY;
  return top - window.innerHeight * SECTION_ENTER_RATIO;
}

/**
 * The scroll range a sticky stage stays pinned for, or null while it is not
 * sticky. The stage must be the first in-flow child of its track.
 */
function getPinRange(stage: HTMLElement | null) {
  const track = stage?.parentElement;
  if (!stage || !track) return null;

  const style = getComputedStyle(stage);
  if (style.position !== "sticky") return null;

  const stickyTop = Number.parseFloat(style.top) || 0;
  const bounds = track.getBoundingClientRect();
  const trackTop =
    bounds.top + window.scrollY + (Number.parseFloat(getComputedStyle(track).paddingTop) || 0);
  const from = trackTop - stickyTop;
  const to = bounds.bottom + window.scrollY - stage.offsetHeight - stickyTop;
  return { from, to: Math.max(from, to) };
}

/** A stop on an eyebrow that rides `stage` while it is pinned. */
function stickyStopFrom(
  element: HTMLElement,
  stage: HTMLElement | null,
  activateAt: number,
): ScrollAccentStop {
  const stop = stopFrom(element, activateAt);
  const range = getPinRange(stage);
  if (!stage || !range) return stop;

  // Measured mid-pin, an anchor inside the stage is shifted by the pin so far.
  const shift = stage.contains(element)
    ? clamp(window.scrollY - range.from, 0, range.to - range.from)
    : 0;
  return { ...stop, y: stop.y - shift, stick: range };
}

function isOpenProjectNode(element: HTMLElement) {
  const details = element.closest("details");
  return details instanceof HTMLDetailsElement && details.open;
}

/**
 * Timeline nodes. In the pinned scene each node publishes the scroll into
 * the track at which it reaches the focus line and where that line is; the
 * dot is drawn there while the stage is pinned. A static timeline's nodes
 * activate as they reach the activation line.
 */
function experienceNodeStops(section: HTMLElement): ScrollAccentStop[] {
  const track = section.querySelector<HTMLElement>("[data-scroll-accent-track]");
  const nodes = Array.from(
    section.querySelectorAll<HTMLElement>(
      '[data-scroll-accent-phase="experience-major"], [data-scroll-accent-phase="experience-minor"]',
    ),
  ).filter(
    (node) => node.dataset.scrollAccentPhase === "experience-major" || isOpenProjectNode(node),
  );

  const focusY = Number.parseFloat(track?.dataset.scrollAccentFocus ?? "");
  if (!track || !Number.isFinite(focusY)) {
    const activationY = getScrollAccentActivationY(window.innerHeight);
    return nodes.map((node) => {
      const stop = stopFrom(node, 0);
      return { ...stop, activateAt: stop.y - activationY };
    });
  }

  const trackTop = track.getBoundingClientRect().top + window.scrollY;
  const end = Number.parseFloat(track.dataset.scrollAccentEnd ?? "") || 0;
  const range = getPinRange(track.querySelector<HTMLElement>(".experience-stage")) ?? {
    from: trackTop,
    to: trackTop + end,
  };

  return nodes
    .filter((node) => node.dataset.scrollAccentOffset !== undefined)
    .map((node) => {
      const nodeFocus = Number.parseFloat(node.dataset.scrollAccentFocus ?? "");
      return {
        ...stopFrom(node, trackTop + Number(node.dataset.scrollAccentOffset)),
        y: range.from + (Number.isFinite(nodeFocus) ? nodeFocus : focusY),
        stick: range,
      };
    })
    .sort((first, second) => first.activateAt - second.activateAt);
}

function hiddenStop(id: string, activateAt: number): ScrollAccentStop {
  return { id, phase: "hidden", x: 0, y: 0, size: 8, activateAt, hidden: true };
}

/** Bottom end of the hero's scroll-cue hairline, where the dot starts. */
function heroStartStop() {
  const start = document.querySelector<HTMLElement>('[data-scroll-accent-anchor="hero"]');
  return start ? { ...stopFrom(start, -Infinity), size: 8 } : null;
}

/**
 * Home: from the scroll cue to Selected Work, Experience and its timeline,
 * the AI workflow, hidden through About, then the quick message.
 */
function buildHomeStops(): ScrollAccentStop[] | null {
  const anchor = (id: string) =>
    document.querySelector<HTMLElement>(`[data-scroll-accent-anchor="${id}"]`);
  const hero = heroStartStop();
  const work = anchor("work");
  const experience = anchor("experience");
  const workflow = anchor("workflow");
  const message = anchor("message");
  const experienceSection = document.querySelector<HTMLElement>("[data-scroll-accent-experience]");
  const about = document.getElementById("about");
  const main = document.getElementById("main-content");
  if (!hero || !work || !workflow || !message || !experienceSection || !main) return null;

  const stops: ScrollAccentStop[] = [hero];
  stops.push(
    stickyStopFrom(
      work,
      work.closest(".dust-track")?.querySelector<HTMLElement>(".dust-stage") ?? null,
      sectionEntry(work),
    ),
  );
  // The pinned scene has no eyebrow of its own on the timeline; the static
  // one does.
  if (experience) {
    stops.push(
      stickyStopFrom(
        experience,
        experienceSection.querySelector<HTMLElement>(".experience-stage"),
        sectionEntry(experience),
      ),
    );
  }
  stops.push(...experienceNodeStops(experienceSection));
  stops.push(stopFrom(workflow, sectionEntry(workflow)));
  if (about) stops.push(hiddenStop("about-hidden", sectionEntry(about)));
  stops.push(
    stickyStopFrom(message, message.closest<HTMLElement>(".quick-message-band"), sectionEntry(message)),
  );
  stops.push(hiddenStop("end-hidden", mainEndEntry(main)));
  return ordered(stops);
}

/** Any other page: eyebrow to eyebrow in document order. */
function buildGenericStops(): ScrollAccentStop[] | null {
  const main = document.getElementById("main-content");
  if (!main) return null;

  const anchors = Array.from(main.querySelectorAll<HTMLElement>("[data-scroll-accent-anchor]"))
    .filter((element) => element.offsetParent !== null)
    .map((element) => stopFrom(element, sectionEntry(element)))
    .sort((first, second) => first.y - second.y);
  if (!anchors.length) return null;

  anchors[0] = { ...anchors[0], activateAt: -Infinity };
  return ordered([...anchors, hiddenStop("end-hidden", mainEndEntry(main))]);
}

/** Scroll at which the page's end (the footer) comes into view. */
function mainEndEntry(main: HTMLElement) {
  const bottom = main.getBoundingClientRect().bottom + window.scrollY;
  return bottom - window.innerHeight * SECTION_ENTER_RATIO;
}

/** Activation never runs backwards, so the route always reads top to bottom. */
function ordered(stops: ScrollAccentStop[]) {
  for (let index = 1; index < stops.length; index += 1) {
    const floor = stops[index - 1].activateAt;
    if (stops[index].activateAt < floor) stops[index] = { ...stops[index], activateAt: floor };
  }
  return stops;
}

/* ---------------------------------------------------------------- component */

export function ScrollAccent() {
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const root = document.documentElement;
    const main = document.getElementById("main-content");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let stops: ScrollAccentStop[] = [];
    let floatLine = 80;
    let surfaces: Array<{ tone: string; top: number; bottom: number }> = [];
    let isActive = true;

    // The dot is drawn at target + offset; the spring takes the offset to 0.
    let spring = REST;
    let current: ScrollAccentStop | null = null;
    let lastDrawn: { x: number; y: number } | null = null;
    let frame = 0;
    let lastTime = 0;
    /** When the dot came within ARRIVE_DISTANCE of its current stop. */
    let arrivedAt: number | null = null;
    /** Whether reaching the current stop changes what is on screen. */
    let visibleHop = false;

    root.classList.add("scroll-accent-mounted");

    /** `stop`'s index, or for a stop no longer on the page, the one before it. */
    function stopIndexOf(stop: ScrollAccentStop) {
      const index = stops.indexOf(stop);
      return index >= 0 ? index : resolveScrollAccentStop(stops, stop.activateAt);
    }

    /** The last visible stop at or before `index`, which hidden stops hold. */
    function anchorStop(index: number) {
      for (let at = index; at >= 0; at -= 1) if (!stops[at].hidden) return stops[at];
      return null;
    }

    function targetPoint(stop: ScrollAccentStop, scrollY: number) {
      const point = stopViewportPoint(stop, scrollY);
      return { x: point.x - window.scrollX, y: floatBelow(point.y, floatLine) };
    }

    function setData(key: string, value: string) {
      if (dot!.dataset[key] !== value) dot!.dataset[key] = value;
    }

    function setSurface(documentY: number) {
      let tone = "page";
      let span = Infinity;
      for (const surface of surfaces) {
        const height = surface.bottom - surface.top;
        if (documentY >= surface.top && documentY <= surface.bottom && height < span) {
          tone = surface.tone;
          span = height;
        }
      }
      setData("surface", tone);
    }

    function render(now: number) {
      frame = 0;
      if (!stops.length) return;

      const scrollY = window.scrollY;
      const reached = resolveScrollAccentStop(stops, scrollY);
      const visiting = current ? stopIndexOf(current) : reached;
      if (Math.hypot(spring.x, spring.y) < ARRIVE_DISTANCE) arrivedAt ??= now;
      const arrived =
        arrivedAt !== null && (!visibleHop || now - arrivedAt >= TOUR_DWELL_MS);
      const index = reducedMotion
        ? reached
        : nextVisitIndex(stops, visiting, reached, arrived, (stop) => {
            const y = stopViewportPoint(stop, scrollY).y;
            return y >= floatLine && y <= window.innerHeight;
          });
      const backlog = Math.abs(reached - index);
      const stop = stops[index];
      const anchor = anchorStop(index);
      if (!anchor) return;
      const target = targetPoint(anchor, scrollY);

      if (stop !== current) {
        const fromHidden = !current || Boolean(current.hidden);
        setData("activeAnchor", stop.id);
        setData("phase", stop.phase);
        dot!.style.opacity = stop.hidden ? "0" : "1";
        if (!stop.hidden) {
          dot!.style.width = `${anchor.size}px`;
          dot!.style.height = `${anchor.size}px`;
        }

        // Where the dot is now, relative to its new target.
        const offset = lastDrawn
          ? { x: lastDrawn.x - target.x, y: lastDrawn.y - target.y }
          : { x: 0, y: 0 };
        visibleHop =
          Math.hypot(offset.x, offset.y) >= ARRIVE_DISTANCE ||
          current?.phase !== stop.phase ||
          current?.size !== stop.size;
        if (reducedMotion || !lastDrawn || (fromHidden && !stop.hidden)) {
          // Snap, or reappear on the target after being hidden.
          spring = REST;
        } else if (stop.hidden) {
          // Fade out where it is, drifting on with the motion it has.
          spring = { ...spring, ...offset };
        } else {
          // Fly from here, curving; hops on the way to a later stop curve less.
          spring = launchSpring(spring, offset, backlog ? TOUR_ARC : ARC);
        }
        current = stop;
        arrivedAt = null;
      }

      const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = now;
      if (!reducedMotion) spring = stepSpring(spring, dt, catchUpBoost(backlog));
      const atRest = reducedMotion || (!backlog && isSpringAtRest(spring));
      if (atRest) spring = REST;

      const x = target.x + spring.x;
      const y = target.y + spring.y;
      // The trailing translate centres the dot on the point at its live size.
      dot!.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      setData("ready", "true");
      setData("landed", atRest ? "true" : "false");
      setSurface(y + scrollY);
      lastDrawn = { x, y };

      if (!atRest) frame = window.requestAnimationFrame(render);
      else lastTime = 0;
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(render);
    }

    function measure() {
      if (!isActive) return;
      const header = document.querySelector<HTMLElement>(".site-header-shell");
      floatLine = (header?.getBoundingClientRect().bottom ?? 62) + FLOAT_GAP;
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
      const previous = current;
      stops = buildHomeStops() ?? buildGenericStops() ?? [];
      // Re-measured stops are new objects; keep the current one if it still
      // exists so a resize is not mistaken for a new flight. If it is gone
      // (its project list was closed), the old object stays and the dot
      // flies on from there.
      current = stops.find((stop) => stop.id === previous?.id) ?? previous;
      schedule();
    }

    function handleMotionPreference(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      schedule();
    }

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (main) resizeObserver?.observe(main);
    const details = Array.from(
      document.querySelectorAll<HTMLDetailsElement>("details[data-scroll-accent-details]"),
    );
    details.forEach((element) => element.addEventListener("toggle", measure));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    motionQuery.addEventListener("change", handleMotionPreference);
    void document.fonts?.ready.then(measure);
    measure();

    return () => {
      isActive = false;
      root.classList.remove("scroll-accent-mounted");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      motionQuery.removeEventListener("change", handleMotionPreference);
      details.forEach((element) => element.removeEventListener("toggle", measure));
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <span ref={dotRef} className="scroll-accent-traveler" aria-hidden="true" />;
}
