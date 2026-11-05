"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type CSSProperties } from "react";

import { Container } from "@/components/container";
import { useMediaQuery, useScrollSceneLive } from "@/lib/use-scroll-scene";

import { HeroScrollCue, type HeroScrollCueLogo } from "./hero-scroll-cue";

/**
 * Clamped linear map. The function form keeps Motion from handing opacity to
 * a native scroll timeline, which mis-mapped this range and let the faded
 * layers come back before the hero had left the screen.
 */
function useScrollRange(
  progress: MotionValue<number>,
  [start, end]: [number, number],
  [from, to]: [number, number],
) {
  return useTransform(progress, (value) => {
    const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
    return from + (to - from) * t;
  });
}

/**
 * The hero leaves in layers as the first screen scrolls away: the cue goes
 * first (its line drawing down on the way), the corner lines part outward,
 * the faded title line dissolves, and the title drifts slower than the page
 * while its stretched glyphs relax. Reduced motion gets the static hero.
 */
export function HeroSection({
  title,
  accent,
  lead,
  trail,
  logos,
  scrollLabel,
}: {
  title: string;
  accent: string;
  lead: string;
  trail: string;
  logos: HeroScrollCueLogo[];
  scrollLabel: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isLive = useScrollSceneLive();
  // On phones the corner lines stack under the title, so they ride along
  // with it instead of parting sideways.
  const isStacked = useMediaQuery("(max-width: 760px)");
  const { scrollYProgress: progress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const titleShift = useScrollRange(progress, [0, 1], [0, 32]);
  const titleY = useTransform(titleShift, (value) => `${value}svh`);
  const stretch = useScrollRange(progress, [0, 0.6], [1.2, 1]);
  const upperOpacity = useScrollRange(progress, [0.25, 0.75], [1, 0]);
  const lowerOpacity = useScrollRange(progress, [0, 0.45], [1, 0]);
  const cornerOpacity = useScrollRange(progress, [0, 0.4], [1, 0]);
  const cornerShift = useScrollRange(progress, [0, 0.5], [0, 40]);
  const startX = useTransform(cornerShift, (value) => `${-value}%`);
  const endX = useTransform(cornerShift, (value) => `${value}%`);
  const cueFade = useScrollRange(progress, [0.1, 0.3], [1, 0]);
  const cueDraw = useScrollRange(progress, [0, 0.2], [0, 1]);

  const cornerStyle = (x: MotionValue<string>) =>
    !isLive
      ? undefined
      : isStacked
        ? { y: titleY, opacity: cornerOpacity }
        : { x, opacity: cornerOpacity };

  return (
    <section
      className="hero-section"
      aria-labelledby="hero-title"
      ref={sectionRef}
    >
      <Container className="hero-container">
        <div className="hero-copy">
          <span
            className="scroll-accent-heading-target scroll-accent-fallback"
            data-scroll-accent-anchor="hero"
            data-scroll-accent-phase="heading"
            aria-hidden="true"
          />
          <motion.h1
            id="hero-title"
            style={
              isLive
                ? ({ y: titleY, "--hero-stretch": stretch } as unknown as CSSProperties)
                : undefined
            }
          >
            <motion.span
              className="hero-title-upper"
              style={isLive ? { opacity: upperOpacity } : undefined}
            >
              {title}
            </motion.span>{" "}
            <motion.span
              className="hero-title-lower"
              style={isLive ? { opacity: lowerOpacity } : undefined}
            >
              {accent}
            </motion.span>
          </motion.h1>
        </div>
      </Container>
      <div className="hero-corners">
        <motion.p
          className="hero-description hero-corner-start"
          style={cornerStyle(startX)}
        >
          {lead}
        </motion.p>
        <motion.p
          className="hero-description hero-corner-end"
          style={cornerStyle(endX)}
        >
          {trail}
        </motion.p>
      </div>
      <HeroScrollCue
        logos={logos}
        label={scrollLabel}
        fade={isLive ? cueFade : undefined}
        draw={isLive ? cueDraw : undefined}
      />
    </section>
  );
}
