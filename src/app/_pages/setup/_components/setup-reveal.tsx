"use client";

import { useRef, type HTMLAttributes } from "react";

import { usePlayOnView } from "./use-play-on-view";

/**
 * A block whose children animate in with CSS once it scrolls into view.
 * The CSS keys off `.setup-reveal[data-reveal="ready" | "play"]`.
 */
export function SetupReveal({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  usePlayOnView(ref);

  return (
    <div ref={ref} className={className ? `setup-reveal ${className}` : "setup-reveal"} {...rest}>
      {children}
    </div>
  );
}
