"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroScrollCueLogo = { src: string; name: string };

const CYCLE_MS = 2200;

/** Bottom-centre cue: one experience logo at a time, a hairline, then the label. */
export function HeroScrollCue({
  logos,
  label,
}: {
  logos: HeroScrollCueLogo[];
  label: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (logos.length < 2) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;

    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      if (motion.matches || document.hidden) return;
      timer = window.setInterval(() => {
        setIndex((current) => (current + 1) % logos.length);
      }, CYCLE_MS);
    };

    start();
    motion.addEventListener("change", start);
    document.addEventListener("visibilitychange", start);
    return () => {
      stop();
      motion.removeEventListener("change", start);
      document.removeEventListener("visibilitychange", start);
    };
  }, [logos.length]);

  const previous = (index - 1 + logos.length) % logos.length;

  return (
    <a className="hero-scroll-cue" href="#work">
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
            <Image src={logo.src} alt="" fill sizes="28px" />
          </span>
        ))}
      </span>
      <span className="hero-scroll-cue-line" aria-hidden="true" />
      <span className="hero-scroll-cue-label">{label}</span>
    </a>
  );
}
