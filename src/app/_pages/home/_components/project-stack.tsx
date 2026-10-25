"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { Container } from "@/components/container";
import type { Locale } from "@/lib/i18n";
import type { ProjectCaseStudy } from "@/lib/portfolio";
import type { UiCopy } from "@/lib/ui-copy";
import { useScrollSceneLive } from "@/lib/use-scroll-scene";
import { clamp } from "@/lib/utils";

import { ProjectCard } from "./project-card";

/** Scroll progress where the first hand-off starts and the last one lands. */
const STACK_START = 0.06;
const STACK_END = 0.9;
/** How much a card shrinks for each card stacked on top of it. */
const COVERED_SCALE_STEP = 0.045;

/** Progress at which card `index` has fully landed on the stack. */
export function resolveLandingProgress(index: number, count: number) {
  if (count <= 1 || index <= 0) return STACK_START;

  return STACK_START + (index / (count - 1)) * (STACK_END - STACK_START);
}

/** 0 before card `index` starts sliding in, 1 once it has landed. */
export function resolveCardEntry(progress: number, index: number, count: number) {
  if (index === 0) return 1;

  const start = resolveLandingProgress(index - 1, count);
  const end = resolveLandingProgress(index, count);

  return clamp((progress - start) / (end - start));
}

/** How many cards (fractionally) currently cover card `index`. */
export function resolveCoveredDepth(progress: number, index: number, count: number) {
  let depth = 0;

  for (let later = index + 1; later < count; later += 1) {
    depth += resolveCardEntry(progress, later, count);
  }

  return depth;
}

function StackCard({
  children,
  count,
  index,
  isLive,
  progress,
}: {
  children: ReactNode;
  count: number;
  index: number;
  isLive: boolean;
  progress: MotionValue<number>;
}) {
  const y = useTransform(
    progress,
    (value) => `${(1 - resolveCardEntry(value, index, count)) * 110}%`,
  );
  const scale = useTransform(
    progress,
    (value) => 1 - resolveCoveredDepth(value, index, count) * COVERED_SCALE_STEP,
  );

  return (
    <motion.li
      className="work-stack-card"
      style={
        {
          "--stack-index": index,
          ...(isLive ? { y, scale } : {}),
        } as CSSProperties
      }
    >
      {children}
    </motion.li>
  );
}

export function ProjectStack({
  copy,
  heading,
  locale,
  projects,
  projectVisualCopy,
}: {
  copy: UiCopy["projectCard"];
  heading: ReactNode;
  locale: Locale;
  projects: ProjectCaseStudy[];
  projectVisualCopy: UiCopy["projectVisual"];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isLive = useScrollSceneLive();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      className="work-stack-track"
      data-live={isLive ? "" : undefined}
      ref={trackRef}
      style={{ "--stack-count": projects.length } as CSSProperties}
    >
      {/* The accent dot's anchor sits where the pinned eyebrow rests, outside
          the sticky stage so its document position never depends on scroll. */}
      <div className="work-stack-anchor-layer" aria-hidden="true">
        <Container>
          <span
            className="scroll-accent-heading-target"
            data-scroll-accent-anchor="work"
            data-scroll-accent-phase="heading"
          />
        </Container>
      </div>

      <div className="work-stack-stage">
        <Container className="work-stack-inner">
          {heading}
          <ol className="work-stack-deck">
            {projects.map((project, index) => (
              <StackCard
                count={projects.length}
                index={index}
                isLive={isLive}
                key={project.slug}
                progress={scrollYProgress}
              >
                <ProjectCard
                  copy={copy}
                  index={index}
                  locale={locale}
                  project={project}
                  projectVisualCopy={projectVisualCopy}
                />
              </StackCard>
            ))}
          </ol>
        </Container>
      </div>
    </div>
  );
}
