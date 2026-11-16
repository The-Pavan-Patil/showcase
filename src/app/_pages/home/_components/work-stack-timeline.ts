/**
 * Scroll timeline for the Selected Work card stack. While the stage is
 * pinned, the cards leave one after another: the front card rises off the
 * top, tipping back, while every card behind it moves up a place. Positions
 * are counted in cards: 0 is the first card in front and flat, 1 the second,
 * and so on. Each card takes one screen of scroll to leave, so it rises at
 * about the speed of the page, and the motion never pauses between cards.
 *
 * The browser plays the motion itself (scroll-driven CSS animations in
 * globals.css); this module only sets where each animation starts and ends.
 */

/**
 * Screens of scroll, once pinned, before the first card starts to leave, and
 * that the last card rests in front before the stage unpins. Together they
 * make one screen, so the track stays a whole number of screens tall and
 * the sections after it start on the same pixel rows as before. Over the
 * first hold the heading slides up and away at the page's speed.
 */
export const STACK_HOLD_START = 0.3;
export const STACK_HOLD_END = 0.7;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Screens of scroll the stage stays pinned for. */
export function resolveStackScreens(count: number) {
  return Math.max(count - 1, 0) + STACK_HOLD_START + STACK_HOLD_END;
}

/** Share (0-1) of the pinned scroll at which the stack reaches `position`. */
export function resolveProgressForPosition(position: number, count: number) {
  return (STACK_HOLD_START + position) / resolveStackScreens(count);
}

/** Scroll progress at which card `index` is in front, flat and full size. */
export function resolveProgressForIndex(index: number, count: number) {
  return resolveProgressForPosition(index, count);
}

/** Pinned-scroll progress (0-1) to the stack position. */
export function resolveStackPosition(progress: number, count: number) {
  const travelled =
    clamp(progress, 0, 1) * resolveStackScreens(count) - STACK_HOLD_START;
  return clamp(travelled, 0, Math.max(count - 1, 0));
}

/** The card most in front, for the counter and the pointer. */
export function resolveActiveIndex(position: number, count: number) {
  return clamp(Math.round(position), 0, Math.max(count - 1, 0));
}

function percent(share: number) {
  return `${Number((share * 100).toFixed(4))}%`;
}

/**
 * Custom properties for the track: how long the stage pins, how far the
 * heading slides away as it pins (as far as the page scrolls meanwhile, so
 * at its speed), and the part of the pin over which the cards move up
 * through the stack.
 */
export function resolveStackStyle(count: number) {
  return {
    "--stack-count": count,
    "--stack-screens": resolveStackScreens(count),
    "--stack-head-slide": `${Number((STACK_HOLD_START * 100).toFixed(4))}svh`,
    "--stack-travel-start": percent(resolveProgressForPosition(0, count)),
    "--stack-travel-end": percent(
      resolveProgressForPosition(Math.max(count - 1, 0), count),
    ),
  };
}

/**
 * Custom properties for card `index`: its place in the stack when the
 * stage pins (`--stack-index`) and when the last card is in front
 * (`--stack-depth-to`, negative once it has left), and the stretch of the
 * pinned scroll over which it leaves. The last card never leaves.
 */
export function resolveCardStyle(index: number, count: number) {
  return {
    "--stack-index": index,
    "--stack-depth-to": index - Math.max(count - 1, 0),
    "--stack-leave-start": percent(resolveProgressForPosition(index, count)),
    "--stack-leave-end": percent(
      resolveProgressForPosition(Math.min(index + 1, count - 1), count),
    ),
  };
}
