"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { useScrollSceneLive } from "@/lib/use-scroll-scene";

/** Share of the page's scroll the forest keeps, so it trails behind it. */
const SCROLL_LAG = 0.4;
/** How far (CSS px) the forest leans away from a pointer at the hero's edge. */
const POINTER_LEAN = 20;
/** How quickly (1/s) the lean catches up with the pointer. */
const LEAN_RATE = 4;

/**
 * The hero's misty forest at night. While motion is allowed it scrolls slower
 * than the page and leans away from the pointer, so it reads as far behind
 * the copy and the swarm.
 */
export function HeroBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const isLive = useScrollSceneLive();

  useEffect(() => {
    const layer = layerRef.current;
    const hero = backdropRef.current?.closest<HTMLElement>(".hero-section");
    if (!isLive || !layer || !hero) return;

    const target = { x: 0, y: 0 };
    const lean = { x: 0, y: 0 };
    let frame = 0;
    let last = 0;
    let visible = true;

    const render = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      const box = hero.getBoundingClientRect();
      const scrolled = Math.min(Math.max(-box.top, 0), box.height);
      const ease = 1 - Math.exp(-dt * LEAN_RATE);
      lean.x += (target.x - lean.x) * ease;
      lean.y += (target.y - lean.y) * ease;
      const x = -lean.x * POINTER_LEAN;
      const y = scrolled * SCROLL_LAG - lean.y * POINTER_LEAN;
      layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

      // Keeps animating only while the lean is still settling.
      if (Math.abs(target.x - lean.x) + Math.abs(target.y - lean.y) > 1e-3) {
        frame = requestAnimationFrame(render);
      } else {
        last = 0;
      }
    };
    const request = () => {
      if (!frame && visible) frame = requestAnimationFrame(render);
    };

    // -1 to 1 across the hero; touch only scrolls, so it never leans.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = hero.getBoundingClientRect();
      target.x = ((event.clientX - box.left) / box.width) * 2 - 1;
      target.y = ((event.clientY - box.top) / box.height) * 2 - 1;
      request();
    };
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      request();
    };
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    const visibility = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) {
        request();
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      }
    });
    visibility.observe(hero);
    request();

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      layer.style.removeProperty("transform");
    };
  }, [isLive]);

  return (
    <div className="hero-backdrop" ref={backdropRef} aria-hidden="true">
      <div className="hero-backdrop-layer" ref={layerRef}>
        <Image
          src="/images/hero/expression-forest.webp"
          alt=""
          fill
          preload
          sizes="100vw"
        />
      </div>
    </div>
  );
}
