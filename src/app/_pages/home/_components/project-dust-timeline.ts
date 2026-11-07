/**
 * Scroll timeline for the Selected Work dust scene. Positions are measured in
 * cards: 0 means the first card is centred, 1 the second, and so on.
 */

/**
 * Extra scroll (in cards) at each end where the first card rests solid at
 * the centre when the stage pins, and the last one before it unpins.
 */
export const DUST_HOLD = 0.3;
/** Share of each card-to-card step spent resting at the centre. */
const DWELL = 0.36;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Travel (in cards) covered by the whole track. */
function span(count: number) {
  return Math.max(count - 1, 0) + DUST_HOLD * 2;
}

/**
 * Scroll progress (0-1) to the lane position. Each card rests at the centre
 * for part of its step and eases between neighbours for the rest.
 */
export function resolveDustPosition(progress: number, count: number) {
  const last = Math.max(count - 1, 0);
  const raw = Math.min(
    last,
    Math.max(0, -DUST_HOLD + Math.min(1, Math.max(0, progress)) * span(count)),
  );
  const step = Math.min(Math.floor(raw), Math.max(last - 1, 0));
  const half = DWELL / 2;

  return step + smoothstep(half, 1 - half, raw - step);
}

/** Scroll progress at which card `index` rests at the centre. */
export function resolveProgressForIndex(index: number, count: number) {
  return (index + DUST_HOLD) / span(count);
}

/** The card nearest the centre, for the counter. */
export function resolveActiveIndex(position: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.round(position)));
}

/** Scale of a card resting beside the centre one. */
export const NEIGHBOUR_SCALE = 0.72;
/** Offsets (in cards) over which a card turns from solid to fully dust. */
const DISSOLVE_START = 0.1;
export const DISSOLVE_END = 1.8;
/** Phones show one card at a time, so a card must be dust before it leaves. */
export const PHONE_DISSOLVE_END = 1.1;

/**
 * Pose of a card `offset` cards away from the centre (negative = left).
 * `dissolve` runs 0 (solid) to 1 (all dust); `side` is the edge the dust
 * leaves from, which is always the one facing away from the centre.
 * `presence` (0-1) is how far the neighbours have gathered: at 0 only the
 * centre card exists and everything beside it is already dust, which is how
 * the scene looks before the stage pins and after it lets go.
 */
export function resolveCardPose(
  offset: number,
  dissolveEnd = DISSOLVE_END,
  presence = 1,
) {
  const distance = Math.abs(offset);
  const toNeighbour = smoothstep(0, 1, distance);
  const resting = Math.min(
    1,
    Math.max(0, (distance - DISSOLVE_START) / (dissolveEnd - DISSOLVE_START)),
  );
  const absent = (1 - Math.min(1, Math.max(0, presence))) * toNeighbour;

  return {
    scale: 1 + (NEIGHBOUR_SCALE - 1) * toNeighbour,
    dissolve: resting + (1 - resting) * absent,
    side: offset < 0 ? -1 : 1,
  };
}

/**
 * Whether the stage is pinned. Outside the pinned stretch the neighbours are
 * dust; crossing in or out gathers or scatters them.
 */
export function isDustStagePinned(progress: number) {
  return progress > 0.001 && progress < 0.999;
}
