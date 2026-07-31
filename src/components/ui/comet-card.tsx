"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

type CometCardProps = {
  children: ReactNode;
  className?: string;
  rotateDepth?: number;
  translateDepth?: number;
};

/** A cursor-responsive perspective card with a soft reflective glare. */
export function CometCard({
  children,
  className,
  rotateDepth = 17.5,
  translateDepth = 20,
}: CometCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 22 });
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`],
  );
  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`],
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`],
  );
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;

    const { height, left, top, width } = card.getBoundingClientRect();
    x.set((event.clientX - left) / width - 0.5);
    y.set((event.clientY - top) / height - 0.5);
  };

  return (
    <div className={cn("comet-card", className)}>
      <motion.div
        ref={ref}
        className="comet-card-surface"
        initial={{ scale: 1, z: 0 }}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        onMouseMove={handleMouseMove}
        style={{ rotateX, rotateY, translateX, translateY }}
        whileHover={{ scale: 1.012, z: 8, transition: { duration: 0.2 } }}
      >
        {children}
      </motion.div>
    </div>
  );
}
