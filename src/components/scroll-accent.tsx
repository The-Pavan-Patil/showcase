"use client";

import { useEffect, useRef } from "react";

import { isScrollSettling, SECTION_JUMP_END, SECTION_JUMP_START } from "@/lib/section-jump";
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
 *
 * Wherever its target moves with the page, the dot is docked, in flight as
 * much as at rest. The dock is a rail placed on the target in document
 * coordinates, with a sticky pin that pins for the same scroll range as the
 * target's stage, so the browser scrolls and pins the dot itself; script
 * only writes the flight's offset from the pin. A fixed dot placed from
 * script trails a compositor scroll, and freezes outright while the main
 * thread is busy (three.js building the dust cards on the first scroll
 * down), which on phones made it shake and jump. Floating under the header,
 * or on a target that script moves, it is fixed and placed per frame.
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
  /**
   * Until this scroll position the target is moved by script (the
   * Experience timeline travelling on its pinned stage) rather than by the
   * page, so the dot must not dock to the page there.
   */
  scriptedUntil?: number;
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
 * Whether the dot can ride its dock to a target drawn at `viewportY`: the
 * target sits below the float line's ease and is not moved by script. The
 * dock follows the page, and a pinned stage, on its own.
 */
export function ridesPage(
  stop: ScrollAccentStop,
  scrollY: number,
  viewportY: number,
  floatLine: number,
) {
  if (viewportY < floatLine + FLOAT_SOFTNESS) return false;
  return stop.scriptedUntil === undefined || scrollY >= stop.scriptedUntil;
}

/**
 * The dock for `stop`: the rail's top-left at the target's unpinned
 * document point and, for a target on a pinned stage, the rail's length
 * (the pin's run) and the viewport line the pin sticks to. Sticking at that
 * line over that run is exactly how the stage holds the target.
 */
export function dockFor(stop: ScrollAccentStop) {
  if (!stop.stick) return { x: stop.x, y: stop.y, run: 0, stickAt: null };
  return {
    x: stop.x,
    y: stop.y,
    run: Math.max(0, stop.stick.to - stop.stick.from),
    stickAt: stop.y - stop.stick.from,
  };
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
      // The node holds still on screen from `rest` to the end of the pin.
      // Called before then, the dot rides it up with the moving timeline.
      const rest = Number.parseFloat(node.dataset.scrollAccentRest ?? "");
      const from = Number.isFinite(rest) ? Math.min(trackTop + rest, range.to) : range.from;
      return {
        ...stopFrom(node, trackTop + Number(node.dataset.scrollAccentOffset)),
        y: from + (Number.isFinite(nodeFocus) ? nodeFocus : focusY),
        stick: { from, to: range.to },
        scriptedUntil: from,
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
 * the AI workflow, hidden through About, then the quick message and Contact.
 */
function buildHomeStops(floatLine: number): ScrollAccentStop[] | null {
  const anchor = (id: string) =>
    document.querySelector<HTMLElement>(`[data-scroll-accent-anchor="${id}"]`);
  const hero = heroStartStop();
  const work = anchor("work");
  const experience = anchor("experience");
  const workflow = anchor("workflow");
  const message = anchor("message");
  const contact = anchor("contact");
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
  // The workflow eyebrow rides its stage while the cards are dealt.
  stops.push(
    stickyStopFrom(
      workflow,
      workflow.closest(".workflow-scene-track")?.querySelector<HTMLElement>(".workflow-scene-stage") ??
        null,
      sectionEntry(workflow),
    ),
  );
  if (about) stops.push(hiddenStop("about-hidden", sectionEntry(about)));
  stops.push(
    stickyStopFrom(message, message.closest<HTMLElement>(".quick-message-band"), sectionEntry(message)),
  );
  if (contact) {
    // The last eyebrow: the dot stays on it to the end of the page, and
    // fades only if the eyebrow scrolls up under the header.
    const contactStop = stopFrom(contact, sectionEntry(contact));
    stops.push(contactStop, hiddenStop("end-hidden", contactStop.y - floatLine));
  } else {
    stops.push(hiddenStop("end-hidden", mainEndEntry(main)));
  }
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
  const dockRef = useRef<HTMLSpanElement>(null);
  const pinRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dock = dockRef.current;
    const pin = pinRef.current;
    const dot = dotRef.current;
    if (!dock || !pin || !dot) return;

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
    /** Where the dot was placed: its offset from the pin if docked, else viewport. */
    let drawn: { x: number; y: number; docked: boolean } | null = null;
    let drawnTransform = "";
    /** The stop the dock was last placed on, and that placement. */
    let dockStop: ScrollAccentStop | null = null;
    let dockKey = "";
    let frame = 0;
    let lastTime = 0;
    /** When the dot came within ARRIVE_DISTANCE of its current stop. */
    let arrivedAt: number | null = null;
    /** Whether reaching the current stop changes what is on screen. */
    let visibleHop = false;
    /**
     * Set by a header jump: the next frame puts the dot straight on the
     * stop the page landed on, without touring the stops in between.
     */
    let snapNext = false;

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

    /** Where the dot is on screen now; a docked dot has moved with its pin. */
    function drawnOnScreen(scrollY: number) {
      if (!drawn) return null;
      if (!drawn.docked || !dockStop) return drawn;
      const point = stopViewportPoint(dockStop, scrollY);
      return { x: point.x - window.scrollX + drawn.x, y: point.y + drawn.y };
    }

    /** Moves the dock onto `stop`; layout is touched only when it changes. */
    function placeDock(stop: ScrollAccentStop) {
      dockStop = stop;
      const { x, y, run, stickAt } = dockFor(stop);
      const key = `${x}|${y}|${run}|${stickAt}`;
      if (key === dockKey) return;
      dockKey = key;
      dock!.style.left = `${x}px`;
      dock!.style.top = `${y}px`;
      dock!.style.height = `${run}px`;
      pin!.style.top = stickAt === null ? "" : `${stickAt}px`;
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
      const snap = snapNext;
      snapNext = false;
      const reached = resolveScrollAccentStop(stops, scrollY);
      const visiting = current ? stopIndexOf(current) : reached;
      if (Math.hypot(spring.x, spring.y) < ARRIVE_DISTANCE) arrivedAt ??= now;
      const arrived =
        arrivedAt !== null && (!visibleHop || now - arrivedAt >= TOUR_DWELL_MS);
      const index = reducedMotion || snap
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
        const onScreen = drawnOnScreen(scrollY);
        const offset = onScreen
          ? { x: onScreen.x - target.x, y: onScreen.y - target.y }
          : { x: 0, y: 0 };
        visibleHop =
          Math.hypot(offset.x, offset.y) >= ARRIVE_DISTANCE ||
          current?.phase !== stop.phase ||
          current?.size !== stop.size;
        if (snap || reducedMotion || !onScreen || (fromHidden && !stop.hidden)) {
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

      // A jump also ends a flight already heading for this stop.
      if (snap) spring = REST;

      const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = now;
      if (!reducedMotion) spring = stepSpring(spring, dt, catchUpBoost(backlog));
      const atRest = reducedMotion || (!backlog && isSpringAtRest(spring));
      if (atRest) spring = REST;

      const x = target.x + spring.x;
      const y = target.y + spring.y;
      // Docked, the dot is drawn at its offset from the pin, which the
      // browser keeps on the target; fixed, at its point in the viewport.
      const docked = ridesPage(anchor, scrollY, target.y, floatLine);
      if (docked) placeDock(anchor);
      const place = docked ? { x: spring.x, y: spring.y } : { x, y };
      // The trailing translate centres the dot on the point at its live size.
      // At rest on the dock the transform holds while the page scrolls, so
      // it is written only when it changes.
      const transform = `translate3d(${place.x.toFixed(2)}px, ${place.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      const mode = docked ? "true" : "false";
      if (dock!.dataset.docked !== mode) dock!.dataset.docked = mode;
      setData("docked", mode);
      if (transform !== drawnTransform) {
        dot!.style.transform = transform;
        drawnTransform = transform;
      }
      setData("ready", "true");
      setData("landed", atRest ? "true" : "false");
      setSurface(y + scrollY);
      drawn = { ...place, docked };

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
      stops = buildHomeStops(floatLine) ?? buildGenericStops() ?? [];
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

    // While a jump or a restored position settles, the scenes may still be
    // measuring themselves (the Experience nodes publish their stops only
    // once laid out), so the dot hides, then reappears on the stop the page
    // settled on.
    let settleTimer = 0;
    function handleSectionJump() {
      snapNext = true;
      dot!.dataset.settling = "";
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(handleSectionJumpEnd, 2000);
      schedule();
    }

    function handleSectionJumpEnd() {
      window.clearTimeout(settleTimer);
      if (dot!.dataset.settling === undefined) return;
      measure();
      snapNext = true;
      delete dot!.dataset.settling;
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
    window.addEventListener(SECTION_JUMP_START, handleSectionJump);
    window.addEventListener(SECTION_JUMP_END, handleSectionJumpEnd);
    // Mounted while a restored position settles (the homepage on Back).
    if (isScrollSettling()) handleSectionJump();
    motionQuery.addEventListener("change", handleMotionPreference);
    void document.fonts?.ready.then(measure);
    measure();

    return () => {
      isActive = false;
      root.classList.remove("scroll-accent-mounted");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener(SECTION_JUMP_START, handleSectionJump);
      window.removeEventListener(SECTION_JUMP_END, handleSectionJumpEnd);
      window.clearTimeout(settleTimer);
      motionQuery.removeEventListener("change", handleMotionPreference);
      details.forEach((element) => element.removeEventListener("toggle", measure));
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={dockRef} className="scroll-accent-dock" aria-hidden="true">
      <span ref={pinRef} className="scroll-accent-pin">
        <span ref={dotRef} className="scroll-accent-traveler" aria-hidden="true" />
      </span>
    </span>
  );
}
