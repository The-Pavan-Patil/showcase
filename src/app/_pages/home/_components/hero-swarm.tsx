"use client";

import { useEffect, useRef } from "react";

import { useScrollSceneLive } from "@/lib/use-scroll-scene";

import type { SwarmField } from "./hero-swarm-field";
import { swarmSize, SwarmSimulation, type SwarmPoint } from "./hero-swarm-sim";
import { rasterizeSolids } from "./hero-swarm-solids";

/** Mice and trackpads get the cursor dot; touch only steers the swarm. */
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
/** How long (ms) a tap holds the swarm before it scatters to roam again. */
const TOUCH_HOLD = 2500;
/** Longest simulated step (s), so a dropped frame cannot fling particles. */
const MAX_STEP = 1 / 30;

/** Grid cell (CSS px) of the text's distance field; coarser on big screens. */
function solidCell(width: number, height: number) {
  return Math.max(2, Math.ceil(Math.sqrt((width * height) / 360_000)));
}

/**
 * The hero's cursor swarm: glowing dots that roam the hero, gather to revolve
 * around a cursor dot when there is one, and bounce off the hero copy as if
 * it were solid. Lives inside `.hero-section`
 * and treats every `[data-hero-solid]` in it as an obstacle.
 */
export function HeroSwarm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const isLive = useScrollSceneLive();

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero-section");
    if (!isLive || !canvas || !cursor || !hero) return;

    const solids = [...hero.querySelectorAll<HTMLElement>("[data-hero-solid]")];
    const finePointer = window.matchMedia(FINE_POINTER_QUERY);
    let width = hero.clientWidth;
    let height = hero.clientHeight;
    const simulation = new SwarmSimulation(
      swarmSize(width, height),
      width,
      height,
    );
    let field: SwarmField | null = null;
    let disposed = false;
    let visible = true;
    let frame = 0;
    let last = 0;
    let resampleTimer = 0;
    let showingCursor = false;
    let wasTracking = false;

    const pointer = { clientX: 0, clientY: 0, mouse: false, touchUntil: 0 };
    const attractor: SwarmPoint = { x: 0, y: 0 };

    // Re-measures the hero and redraws the copy as a solid.
    const resample = () => {
      const box = hero.getBoundingClientRect();
      width = box.width;
      height = box.height;
      simulation.setBounds(width, height);
      simulation.setSolids(
        rasterizeSolids(box, solids, solidCell(width, height)),
      );
      field?.setSize(width, height);
    };
    const scheduleResample = () => {
      window.clearTimeout(resampleTimer);
      resampleTimer = window.setTimeout(() => {
        if (field) resample();
      }, 150);
    };

    const setCursor = (show: boolean) => {
      if (show === showingCursor) return;
      showingCursor = show;
      hero.toggleAttribute("data-cursor", show);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, MAX_STEP) : 1 / 60;
      last = now;

      // Read every frame, so scrolling under a still mouse stays in step.
      const box = hero.getBoundingClientRect();
      const x = pointer.clientX - box.left;
      const y = pointer.clientY - box.top;
      const inside = x >= 0 && y >= 0 && x <= box.width && y <= box.height;
      const tracking = inside && (pointer.mouse || now < pointer.touchUntil);

      if (tracking) {
        // Starts where the pointer comes in, then smooths its jitter.
        const ease = wasTracking ? 1 - Math.exp(-dt * 40) : 1;
        attractor.x += (x - attractor.x) * ease;
        attractor.y += (y - attractor.y) * ease;
      }
      wasTracking = tracking;

      simulation.step(dt, tracking ? attractor : null);
      field?.update(simulation);
      field?.render();

      const showCursor = tracking && pointer.mouse && finePointer.matches;
      if (showCursor) {
        cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
      setCursor(showCursor);
    };

    const start = () => {
      if (frame || !field || !visible) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      setCursor(false);
    };

    const onPointer = (event: PointerEvent) => {
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      if (event.pointerType === "mouse") pointer.mouse = true;
      else pointer.touchUntil = performance.now() + TOUCH_HOLD;
    };
    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") pointer.mouse = false;
    };
    hero.addEventListener("pointermove", onPointer, { passive: true });
    hero.addEventListener("pointerdown", onPointer, { passive: true });
    hero.addEventListener("pointerup", onPointer, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });

    // three.js loads once the page is idle, so it never competes with the
    // first paint of the hero itself.
    const load = async () => {
      if (disposed) return;
      const created = await (
        await import("./hero-swarm-field")
      ).SwarmField.create(canvas);
      if (disposed) {
        created?.dispose();
        return;
      }
      // `data-swarm` tells styles (and tests) which rendering is in use.
      if (!created) {
        hero.dataset.swarm = "fallback";
        return;
      }
      await document.fonts.ready;
      if (disposed) {
        created.dispose();
        return;
      }
      field = created;
      field.setSwarm(simulation, readLook());
      resample();
      hero.dataset.swarm = "ready";
      start();
    };
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => void load(), { timeout: 1500 });
    } else {
      window.setTimeout(() => void load(), 200);
    }

    // The swarm's colours and blending follow the theme.
    const readLook = () => {
      const style = getComputedStyle(hero);
      return {
        warm: style.getPropertyValue("--hero-swarm-warm").trim(),
        cool: style.getPropertyValue("--hero-swarm-cool").trim(),
        additive: style.getPropertyValue("--hero-swarm-blend").trim() !== "normal",
      };
    };
    const themeObserver = new MutationObserver(() => field?.setLook(readLook()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const resizeObserver = new ResizeObserver(scheduleResample);
    resizeObserver.observe(hero);
    solids.forEach((element) => resizeObserver.observe(element));
    document.fonts.addEventListener("loadingdone", scheduleResample);

    const visibility = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    visibility.observe(hero);

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(resampleTimer);
      visibility.disconnect();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      document.fonts.removeEventListener("loadingdone", scheduleResample);
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("pointerdown", onPointer);
      hero.removeEventListener("pointerup", onPointer);
      hero.removeEventListener("pointerleave", onPointerLeave);
      delete hero.dataset.swarm;
      field?.dispose();
    };
  }, [isLive]);

  if (!isLive) return null;

  return (
    <>
      <canvas className="hero-swarm-canvas" ref={canvasRef} aria-hidden="true" />
      <span className="hero-cursor" ref={cursorRef} aria-hidden="true" />
    </>
  );
}
