import { sampleDistance, sampleNormal, type SolidField } from "./hero-swarm-solids";

/**
 * Physics for the hero's cursor swarm, free of the DOM and WebGL. Distances
 * are CSS px in the hero's box (top-left origin), times are seconds.
 *
 * Without a cursor every particle roams the hero on its own slowly turning
 * heading. Once there is one, each steers towards a velocity that brings it
 * to its own orbit radius around the cursor and carries it round, so the dots
 * revolve around the cursor rather than land on it; when it leaves they
 * scatter back to roaming. Steering, not a hard spring, keeps the overshoot
 * soft when the cursor jumps. Curl noise keeps the paths organic, a share of
 * "ambient" particles never gathers, the hero's edges are walls and its text
 * is a solid the particles bounce off.
 */

export type SwarmPoint = { x: number; y: number };

/** Particles per hero, from its area. */
export function swarmSize(width: number, height: number) {
  return Math.round(Math.min(Math.max((width * height) / 800, 400), 2000));
}

/** Share of particles that drift instead of joining the swarm. */
const AMBIENT_SHARE = 0.22;
/** Orbit radius before the per-particle spread, at a 900 px tall hero. */
const ORBIT = 70;
/** Top speed of the approach to the orbit, and how gently it eases in. */
const APPROACH = 420;
const SOFTNESS = 120;
/** Speed round the attractor at the orbit radius. */
const ORBIT_SPEED = 180;
/** Share of the attractor's own velocity the swarm follows with. */
const FOLLOW = 0.5;
const MAX_FOLLOW = 1600;
const DRAG = 0.35;
const MAX_SPEED = 1400;
const CURL = 110;
const CURL_FREQUENCY = 1 / 240;
const CURL_DRIFT = 0.12;
/** Soft push just outside the text, so contact reads as a bounce. */
const CUSHION = 10;
const CUSHION_PUSH = 900;
const MAX_SUBSTEPS = 6;
const SPAWN_CLEARANCE = 6;
const LIFE_MIN = 5;
const LIFE_MAX = 11;
/** Cruising speed while roaming, and how hard the heading swings (rad/s). */
const ROAM_SPEED = 46;
const ROAM_TURN = 1.1;
const ROAM_RESPONSE = 0.9;
/** How fast (1/s) the swarm gathers on a cursor, and scatters after it. */
const GATHER_RATE = 2.4;
const RELEASE_RATE = 1.1;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** 0-1 brightness over a particle's life: fades in, holds, fades out. */
export function particleFade(age: number, life: number) {
  const t = age / life;
  return smoothstep(0, 0.12, t) * (1 - smoothstep(0.72, 1, t));
}

function hash(ix: number, iy: number) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Value noise's gradient at (x, y), written into `out`. */
function noiseGradient(x: number, y: number, out: SwarmPoint) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const k = a - b - c + d;
  out.x = 30 * fx * fx * (fx * (fx - 2) + 1) * (b - a + k * uy);
  out.y = 30 * fy * fy * (fy * (fy - 2) + 1) * (c - a + k * ux);
  return out;
}

export class SwarmSimulation {
  readonly count: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly age: Float32Array;
  readonly life: Float32Array;
  /** Per-particle looks for the renderer, 0-1. */
  readonly size: Float32Array;
  readonly tint: Float32Array;

  private readonly vx: Float32Array;
  private readonly vy: Float32Array;
  private readonly orbit: Float32Array;
  private readonly spin: Float32Array;
  private readonly pull: Float32Array;
  private readonly response: Float32Array;
  private readonly flutter: Float32Array;
  private readonly bounce: Float32Array;
  private readonly heading: Float32Array;
  private readonly cruise: Float32Array;
  private readonly sway: Float32Array;
  private readonly swayRate: Float32Array;
  private readonly random: () => number;
  /** Where the swarm last gathered, so it can scatter from there. */
  private readonly anchor: SwarmPoint = { x: 0, y: 0 };
  private readonly previous: SwarmPoint = { x: Number.NaN, y: Number.NaN };
  private readonly gradient: SwarmPoint = { x: 0, y: 0 };
  private readonly gradientFine: SwarmPoint = { x: 0, y: 0 };
  private readonly normal: SwarmPoint = { x: 0, y: 0 };
  private solids: SolidField | null = null;
  private width = 1;
  private height = 1;
  private scale = 1;
  private time = 0;
  /** 0 while roaming, 1 once gathered on the cursor. */
  private gather = 0;

  constructor(
    count: number,
    width: number,
    height: number,
    random: () => number = Math.random,
  ) {
    this.count = count;
    this.random = random;
    this.x = new Float32Array(count);
    this.y = new Float32Array(count);
    this.vx = new Float32Array(count);
    this.vy = new Float32Array(count);
    this.age = new Float32Array(count);
    this.life = new Float32Array(count);
    this.size = new Float32Array(count);
    this.tint = new Float32Array(count);
    this.orbit = new Float32Array(count);
    this.spin = new Float32Array(count);
    this.pull = new Float32Array(count);
    this.response = new Float32Array(count);
    this.flutter = new Float32Array(count);
    this.bounce = new Float32Array(count);
    this.heading = new Float32Array(count);
    this.cruise = new Float32Array(count);
    this.sway = new Float32Array(count);
    this.swayRate = new Float32Array(count);
    this.setBounds(width, height);
    this.anchor.x = width / 2;
    this.anchor.y = height / 2;

    for (let i = 0; i < count; i++) {
      const ambient = random() < AMBIENT_SHARE;
      // Drifters stay small, so the field reads as depth behind the swarm.
      this.size[i] = random() ** 2 * (ambient ? 0.45 : 1);
      this.tint[i] = random();
      // Most orbits are tight, a few wide, so the swarm has a dense core.
      this.orbit[i] = ORBIT * (0.3 + 1.4 * random() ** 1.6);
      // A quarter turn the other way, so paths cross instead of all wheeling.
      this.spin[i] = (random() < 0.78 ? 1 : -1) * (0.7 + 0.6 * random());
      this.pull[i] = ambient ? 0.05 : 1;
      this.response[i] = ambient ? 0.9 : 1.6 + 1.8 * random();
      this.flutter[i] = ambient ? 0.35 + 0.25 * random() : 0.6 + 0.8 * random();
      this.bounce[i] = 0.5 + 0.3 * random();
      this.cruise[i] = ROAM_SPEED * (0.45 + 1.1 * random()) * (ambient ? 0.6 : 1);
      this.sway[i] = random() * Math.PI * 2;
      this.swayRate[i] = 0.3 + 0.6 * random();
      this.spawn(i);
      // Stagger lives so the field never fades in or out at once.
      this.age[i] = random() * this.life[i];
    }
  }

  setBounds(width: number, height: number) {
    this.width = Math.max(width, 1);
    this.height = Math.max(height, 1);
    this.scale = Math.min(Math.max(Math.min(width, height) / 900, 0.5), 1.3);
  }

  setSolids(field: SolidField | null) {
    this.solids = field;
    if (!field) return;
    // Anything the new layout buried is reborn in the open.
    for (let i = 0; i < this.count; i++) {
      if (sampleDistance(field, this.x[i], this.y[i]) < 0) this.spawn(i);
    }
  }

  private spawn(i: number) {
    let x = 0;
    let y = 0;
    for (let attempt = 0; attempt < 12; attempt++) {
      x = this.random() * this.width;
      y = this.random() * this.height;
      if (!this.solids || sampleDistance(this.solids, x, y) > SPAWN_CLEARANCE) break;
    }
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = 0;
    this.vy[i] = 0;
    this.heading[i] = this.random() * Math.PI * 2;
    this.age[i] = 0;
    this.life[i] = LIFE_MIN + this.random() * (LIFE_MAX - LIFE_MIN);
  }

  /** Advances the swarm; `attractor` is the cursor, or null to roam. */
  step(dt: number, attractor: SwarmPoint | null) {
    if (dt <= 0) return;
    this.time += dt;
    const { anchor, solids, scale, width, height, time } = this;

    // The swarm travels with the cursor as well as towards it.
    let followX = 0;
    let followY = 0;
    if (attractor) {
      if (Number.isFinite(this.previous.x)) {
        followX = (attractor.x - this.previous.x) / dt;
        followY = (attractor.y - this.previous.y) / dt;
        const speed = Math.hypot(followX, followY);
        const limit = MAX_FOLLOW * scale;
        if (speed > limit) {
          followX *= limit / speed;
          followY *= limit / speed;
        }
      }
      anchor.x = attractor.x;
      anchor.y = attractor.y;
    }
    this.previous.x = attractor ? attractor.x : Number.NaN;
    this.previous.y = attractor ? attractor.y : Number.NaN;
    this.gather +=
      ((attractor ? 1 : 0) - this.gather) *
      (1 - Math.exp(-(attractor ? GATHER_RATE : RELEASE_RATE) * dt));

    const drag = Math.exp(-DRAG * dt);
    const approach = APPROACH * scale;
    const softness = SOFTNESS * scale;
    const orbitSpeed = ORBIT_SPEED * scale;
    const curl = CURL * scale;
    const maxSpeed = MAX_SPEED * scale;
    const cushion = CUSHION * scale;
    const cushionPush = CUSHION_PUSH * scale;
    const margin = 60 * scale;
    const frequency = CURL_FREQUENCY / scale;
    const shift = time * CURL_DRIFT;

    for (let i = 0; i < this.count; i++) {
      this.age[i] += dt;
      let x = this.x[i];
      let y = this.y[i];
      if (
        this.age[i] >= this.life[i] ||
        x < -margin ||
        y < -margin ||
        x > width + margin ||
        y > height + margin
      ) {
        this.spawn(i);
        continue;
      }
      let vx = this.vx[i];
      let vy = this.vy[i];

      // Roaming: cruise along a heading that swings back and forth.
      const sway = this.sway[i];
      const swayRate = this.swayRate[i];
      let heading =
        this.heading[i] +
        ROAM_TURN *
          (Math.sin(time * swayRate + sway) +
            0.5 * Math.sin(time * swayRate * 2.3 + sway * 1.7)) *
          dt;
      const cruise = this.cruise[i] * scale;
      let desiredX = Math.cos(heading) * cruise;
      let desiredY = Math.sin(heading) * cruise;
      let response = ROAM_RESPONSE;

      const gather = this.gather * this.pull[i];
      if (gather > 1e-3) {
        const dx = anchor.x - x;
        const dy = anchor.y - y;
        const r = Math.hypot(dx, dy) + 1e-3;
        const nx = dx / r;
        const ny = dy / r;
        const orbit = this.orbit[i] * scale;
        // Inwards when outside the orbit, outwards inside it.
        const radial = approach * Math.tanh((r - orbit) / softness);
        // Peaks at the orbit radius; falls off towards the centre and far out.
        const ratio = r / orbit;
        const around = (this.spin[i] * orbitSpeed * 2 * ratio) / (1 + ratio * ratio);
        const orbitX = nx * radial - ny * around + followX * FOLLOW;
        const orbitY = ny * radial + nx * around + followY * FOLLOW;
        desiredX += (orbitX - desiredX) * gather;
        desiredY += (orbitY - desiredY) * gather;
        response += (this.response[i] - response) * gather;
      }
      let ax = (desiredX - vx) * response;
      let ay = (desiredY - vy) * response;

      // Curl of two octaves of noise: swirling, divergence-free drift.
      noiseGradient(x * frequency + shift, y * frequency - shift * 0.6, this.gradient);
      noiseGradient(
        x * frequency * 2.03 + 17.1,
        y * frequency * 2.03 - 9.4 + shift,
        this.gradientFine,
      );
      const flutter = curl * this.flutter[i];
      ax += (this.gradient.y + this.gradientFine.y) * flutter;
      ay -= (this.gradient.x + this.gradientFine.x) * flutter;

      if (solids) {
        const gap = sampleDistance(solids, x, y);
        if (gap < cushion) {
          const normal = sampleNormal(solids, x, y, this.normal);
          const push = cushionPush * (1 - Math.max(gap, 0) / cushion) ** 2;
          ax += normal.x * push;
          ay += normal.y * push;
        }
      }

      vx = (vx + ax * dt) * drag;
      vy = (vy + ay * dt) * drag;
      const speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        vx *= maxSpeed / speed;
        vy *= maxSpeed / speed;
      }

      // Short enough steps that a fast particle cannot skip over a stroke.
      const steps = solids
        ? Math.min(MAX_SUBSTEPS, Math.max(1, Math.ceil((speed * dt) / (solids.cell * 1.5))))
        : 1;
      const substep = dt / steps;
      for (let s = 0; s < steps; s++) {
        x += vx * substep;
        y += vy * substep;
        if (!solids) continue;
        const depth = sampleDistance(solids, x, y);
        if (depth >= 0) continue;
        const normal = sampleNormal(solids, x, y, this.normal);
        x -= normal.x * depth;
        y -= normal.y * depth;
        const into = vx * normal.x + vy * normal.y;
        if (into < 0) {
          const kick = (1 + this.bounce[i]) * into;
          vx -= normal.x * kick;
          vy -= normal.y * kick;
        }
      }

      // The hero's edges are walls; a roamer turns back along with its path.
      if (x < 0 || x > width) {
        x = x < 0 ? -x : 2 * width - x;
        vx = x < width / 2 ? Math.abs(vx) : -Math.abs(vx);
        if (Math.cos(heading) * vx < 0) heading = Math.PI - heading;
      }
      if (y < 0 || y > height) {
        y = y < 0 ? -y : 2 * height - y;
        vy = y < height / 2 ? Math.abs(vy) : -Math.abs(vy);
        if (Math.sin(heading) * vy < 0) heading = -heading;
      }

      this.x[i] = x;
      this.y[i] = y;
      this.vx[i] = vx;
      this.vy[i] = vy;
      this.heading[i] = heading;
    }
  }
}
