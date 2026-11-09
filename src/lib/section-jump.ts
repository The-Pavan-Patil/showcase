"use client";

import { clamp } from "@/lib/utils";

/**
 * Header jumps between homepage sections. Scrolling smoothly to a section
 * would play every scroll scene on the way (the dust gathers, the accent dot
 * tours the timeline), so instead the page dips out, moves in one step to
 * where the section's scene starts, and fades back in. Scenes that smooth
 * the scroll with a spring snap it on landing, so nothing animates until the
 * visitor scrolls again.
 */

/** Fired on window just before the page moves. */
export const SECTION_JUMP_START = "section-jump:start";
/** Fired once scroll-linked values have caught up with the new position. */
export const SECTION_JUMP_END = "section-jump:end";

const FADE_OUT_ID = "section-jump-out";
const FADE_IN_ID = "section-jump-in";
const FADE_OUT: KeyframeAnimationOptions = {
  duration: 150,
  easing: "cubic-bezier(0.4, 0, 1, 1)",
  fill: "forwards",
  id: FADE_OUT_ID,
};
const FADE_IN: KeyframeAnimationOptions = {
  duration: 340,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  id: FADE_IN_ID,
};

let latestJump = 0;

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

/** What dips out: everything under the header, including the accent dot. */
function fadeLayers() {
  return [
    document.getElementById("main-content"),
    document.querySelector<HTMLElement>(".site-footer"),
    document.querySelector<HTMLElement>(".scroll-accent-traveler"),
  ].filter((element): element is HTMLElement => Boolean(element));
}

function jumpAnimations(element: HTMLElement, id: string) {
  return element.getAnimations().filter((animation) => animation.id === id);
}

/**
 * Scroll position at which `section` opens. A section with a pinned scene
 * marks its track with `data-section-start`, and opens with that track's top
 * at the top of the viewport: the stage fills the screen and its scroll
 * timeline has not started. Any other section opens at its top less its
 * `scroll-margin-top`, as a hash link would.
 */
export function getSectionStart(section: HTMLElement) {
  const start = section.querySelector<HTMLElement>("[data-section-start]");
  const margin = start
    ? 0
    : Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
  const top = (start ?? section).getBoundingClientRect().top + window.scrollY - margin;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return Math.round(clamp(top, 0, Math.max(0, maxScroll)));
}

/** Calls `handler` each time a section jump lands. Returns the unsubscribe. */
export function onSectionJumpEnd(handler: () => void) {
  window.addEventListener(SECTION_JUMP_END, handler);
  return () => window.removeEventListener(SECTION_JUMP_END, handler);
}

let settling = false;

/**
 * Whether the page has been moved by a jump or a restore and the scenes have
 * not been told it has landed. A scene mounting mid-way (the homepage on
 * Back) has missed SECTION_JUMP_START and checks this instead.
 */
export function isScrollSettling() {
  return settling;
}

/**
 * Moves the page to `top` in one step. The accent dot lands with it instead
 * of flying there; call `settleScenes` once the page has stopped moving.
 */
export function snapScroll(top: number) {
  settling = true;
  window.dispatchEvent(new Event(SECTION_JUMP_START));
  // "instant", not "auto": the page sets `scroll-behavior: smooth`.
  window.scrollTo({ top, behavior: "instant" });
}

/**
 * Tells the scenes the page has landed, so their scroll-smoothing springs
 * show where the page is instead of playing towards it. Scroll-linked values
 * update on the frame after the scroll event, hence the two frames.
 */
export async function settleScenes() {
  await nextFrame();
  await nextFrame();
  settling = false;
  window.dispatchEvent(new Event(SECTION_JUMP_END));
}

export async function jumpToSection(section: HTMLElement) {
  const jump = ++latestJump;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layers = reducedMotion ? [] : fadeLayers();

  // A jump that starts while the page is already dipped out (a quick second
  // click) moves straight on from there.
  const fadingOut = layers.flatMap((layer) => jumpAnimations(layer, FADE_OUT_ID));
  const fadeOut = fadingOut.length
    ? fadingOut
    : layers.map((layer) => {
        jumpAnimations(layer, FADE_IN_ID).forEach((animation) => animation.cancel());
        return layer.animate([{ opacity: 0 }], FADE_OUT);
      });

  try {
    await Promise.all(fadeOut.map((animation) => animation.finished));
  } catch {
    return;
  }
  if (jump !== latestJump) return;

  snapScroll(getSectionStart(section));
  await settleScenes();
  if (jump !== latestJump) return;

  for (const layer of layers) {
    jumpAnimations(layer, FADE_OUT_ID).forEach((animation) => animation.cancel());
    // A single keyframe at offset 0 fades back to the layer's own opacity,
    // so a hidden accent dot stays hidden.
    layer.animate([{ opacity: 0, offset: 0 }], FADE_IN);
  }
}
