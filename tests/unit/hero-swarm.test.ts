import { describe, expect, it } from "vitest";

import {
  particleFade,
  swarmSize,
  SwarmSimulation,
} from "@/app/_pages/home/_components/hero-swarm-sim";
import {
  buildSolidField,
  sampleDistance,
} from "@/app/_pages/home/_components/hero-swarm-solids";

/** Seeded PRNG (mulberry32), so every run sees the same swarm. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A mask with each [x0, y0, x1, y1) cell rectangle set to `value`. */
function paint(
  mask: Uint8Array,
  columns: number,
  rects: Array<[number, number, number, number, number?]>,
) {
  for (const [x0, y0, x1, y1, value = 1] of rects) {
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) mask[y * columns + x] = value;
    }
  }
  return mask;
}

describe("hero swarm solids", () => {
  // Cells 10-29 at 2 px: ink from 20 to 60 px, surface padded 4 px out.
  const square = buildSolidField(
    paint(new Uint8Array(40 * 40), 40, [[10, 10, 30, 30]]),
    40,
    40,
    2,
    4,
  );

  it("measures signed distance to the padded surface", () => {
    expect(sampleDistance(square, 40, 40)).toBeLessThan(-20);
    expect(sampleDistance(square, 10, 40)).toBeCloseTo(6, 1);
    // Inside the padding, short of the ink: already solid.
    expect(sampleDistance(square, 17, 40)).toBeLessThan(0);
  });

  it("fills letter counters so nothing can hide inside an O", () => {
    const ring = buildSolidField(
      paint(new Uint8Array(40 * 40), 40, [
        [10, 10, 30, 30],
        [15, 15, 25, 25, 0],
      ]),
      40,
      40,
      2,
      4,
    );
    expect(sampleDistance(ring, 40, 40)).toBeLessThan(0);
  });
});

describe("hero swarm simulation", () => {
  it("sizes the swarm by the hero's area", () => {
    expect(swarmSize(1440, 900)).toBe(1620);
    expect(swarmSize(390, 844)).toBe(411);
    expect(swarmSize(200, 200)).toBe(400);
    expect(swarmSize(5000, 3000)).toBe(2000);
  });

  it("fades each particle in and out over its life", () => {
    expect(particleFade(0, 6)).toBe(0);
    expect(particleFade(3, 6)).toBe(1);
    expect(particleFade(6, 6)).toBe(0);
  });

  it("gathers into orbits around the attractor instead of landing on it", () => {
    const swarm = new SwarmSimulation(600, 1200, 800, createRandom(7));
    const attractor = { x: 600, y: 400 };
    for (let frame = 0; frame < 240; frame++) swarm.step(1 / 60, attractor);

    const before = Array.from({ length: swarm.count }, (_, i) => ({
      x: swarm.x[i],
      y: swarm.y[i],
      age: swarm.age[i],
    }));
    swarm.step(1 / 60, attractor);

    const distances: number[] = [];
    let clockwise = 0;
    let anticlockwise = 0;
    before.forEach((start, i) => {
      // Skip particles that were just reborn elsewhere.
      if (swarm.age[i] < start.age) return;
      const rx = start.x - attractor.x;
      const ry = start.y - attractor.y;
      const distance = Math.hypot(rx, ry);
      distances.push(distance);
      if (distance > 250) return;
      const turn = rx * (swarm.y[i] - start.y) - ry * (swarm.x[i] - start.x);
      if (turn < 0) clockwise++;
      else anticlockwise++;
    });

    distances.sort((a, b) => a - b);
    const median = distances[Math.floor(distances.length / 2)];
    expect(median).toBeLessThan(220);
    // Particles keep a ring around the dot rather than piling onto it.
    expect(distances.filter((distance) => distance < 8).length).toBeLessThan(
      distances.length * 0.05,
    );
    // Most of the swarm wheels one way round.
    expect(clockwise).toBeGreaterThan(anticlockwise * 2);
  });

  it("roams the whole hero, inside its edges, when there is no cursor", () => {
    const width = 1200;
    const height = 800;
    const swarm = new SwarmSimulation(800, width, height, createRandom(5));
    // Gathers first, so roaming has to scatter the swarm again.
    for (let frame = 0; frame < 180; frame++) swarm.step(1 / 60, { x: 300, y: 200 });
    for (let frame = 0; frame < 600; frame++) swarm.step(1 / 60, null);

    const quadrants = [0, 0, 0, 0];
    let moving = 0;
    const before = Array.from(swarm.x);
    swarm.step(1 / 60, null);
    for (let i = 0; i < swarm.count; i++) {
      const x = swarm.x[i];
      const y = swarm.y[i];
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(height);
      quadrants[(x < width / 2 ? 0 : 1) + (y < height / 2 ? 0 : 2)]++;
      if (Math.abs(x - before[i]) > 0.05) moving++;
    }
    // Spread out, not still parked where the cursor left.
    for (const share of quadrants) expect(share).toBeGreaterThan(swarm.count * 0.15);
    expect(moving).toBeGreaterThan(swarm.count * 0.8);
  });

  it("never lets a particle into the text, even when the cursor is on it", () => {
    // A 400 x 160 px block in the middle of a 1200 x 800 px hero.
    const columns = 300;
    const rows = 200;
    const solids = buildSolidField(
      paint(new Uint8Array(columns * rows), columns, [[100, 80, 200, 120]]),
      columns,
      rows,
      4,
    );
    const swarm = new SwarmSimulation(800, 1200, 800, createRandom(3));
    swarm.setSolids(solids);

    let deepest = Infinity;
    for (let frame = 0; frame < 360; frame++) {
      // Sweeps the cursor across the block and parks it in the middle.
      const t = Math.min(frame / 240, 1);
      swarm.step(1 / 60, { x: 200 + 400 * t, y: 400 + 200 * Math.sin(t * 6) * (1 - t) });
      for (let i = 0; i < swarm.count; i++) {
        deepest = Math.min(deepest, sampleDistance(solids, swarm.x[i], swarm.y[i]));
      }
    }
    expect(deepest).toBeGreaterThan(-1);
  });

  it("moves particles out from under a new layout", () => {
    const swarm = new SwarmSimulation(500, 400, 400, createRandom(11));
    const solids = buildSolidField(
      paint(new Uint8Array(100 * 100), 100, [[20, 20, 80, 80]]),
      100,
      100,
      4,
    );
    swarm.setSolids(solids);
    for (let i = 0; i < swarm.count; i++) {
      expect(sampleDistance(solids, swarm.x[i], swarm.y[i])).toBeGreaterThan(0);
    }
  });
});
