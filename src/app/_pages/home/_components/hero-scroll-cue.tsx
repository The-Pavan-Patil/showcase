"use client";

import { motion, type MotionValue } from "motion/react";
import Image from "next/image";
import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { getSectionStart } from "@/lib/section-jump";

export type HeroScrollCueLogo = { src: string; name: string };

const CYCLE_MS = 2200;

/**
 * Scrolls down to Selected Work without following the `#work` link. A plain
 * fragment link adds a history entry the Next.js router ignores, so Back
 * from a case study opened afterwards would change the URL but leave the
 * case study on screen.
 */
function scrollToWork(event: ReactMouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const work = document.getElementById("work");
  if (!work) return;

  event.preventDefault();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: getSectionStart(work), behavior: reducedMotion ? "instant" : "smooth" });
}

/** Bottom-centre cue: one experience logo at a time, a hairline, then the label. */
export function HeroScrollCue({
  logos,
  label,
  fade,
  draw,
}: {
  logos: HeroScrollCueLogo[];
  label: string;
  /** 1 → 0 as the hero scrolls away. Applied per child via --cue-fade, so the
      hairline's fill and the accent dot keep their own opacity. */
  fade?: MotionValue<number>;
  /** 0 → 1: how far the hairline has drawn down. */
  draw?: MotionValue<number>;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (logos.length < 2) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;

    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      if (reducedMotion.matches || document.hidden) return;
      timer = window.setInterval(() => {
        setIndex((current) => (current + 1) % logos.length);
      }, CYCLE_MS);
    };

    start();
    reducedMotion.addEventListener("change", start);
    document.addEventListener("visibilitychange", start);
    return () => {
      stop();
      reducedMotion.removeEventListener("change", start);
      document.removeEventListener("visibilitychange", start);
    };
  }, [logos.length]);

  const previous = (index - 1 + logos.length) % logos.length;

  return (
    <motion.a
      className="hero-scroll-cue"
      href="#work"
      onClick={scrollToWork}
      style={fade ? ({ "--cue-fade": fade } as unknown as CSSProperties) : undefined}
    >
      <span className="hero-scroll-cue-logos" aria-hidden="true">
        {logos.map((logo, logoIndex) => (
          <span
            key={logo.src}
            className="hero-scroll-cue-logo"
            data-state={
              logoIndex === index
                ? "active"
                : logoIndex === previous && logos.length > 1
                  ? "leaving"
                  : "idle"
            }
          >
            <Image src={logo.src} alt="" fill sizes="56px" loading="eager" />
          </span>
        ))}
      </span>
      <span className="hero-scroll-cue-line" aria-hidden="true">
        {draw ? (
          <motion.span
            className="hero-scroll-cue-line-fill"
            style={{ scaleY: draw }}
          />
        ) : null}
        {/* The accent dot starts here, at the hairline's bottom end. */}
        <span
          className="scroll-accent-heading-target scroll-accent-fallback hero-scroll-cue-dot"
          data-scroll-accent-anchor="hero"
          data-scroll-accent-phase="heading"
        />
      </span>
      <span className="hero-scroll-cue-label">{label}</span>
    </motion.a>
  );
}
