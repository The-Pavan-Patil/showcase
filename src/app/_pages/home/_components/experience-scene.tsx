"use client";

import { ArrowRight, Briefcase, ChevronUp, Trophy } from "lucide-react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import {
  type CSSProperties,
  type FocusEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import type { ExperienceItem } from "@/lib/portfolio-types";
import { formatCopy, type UiCopy } from "@/lib/ui-copy";
import { useScrollSceneLive } from "@/lib/use-scroll-scene";
import { clamp, smoothstep } from "@/lib/utils";

/** Scroll distance from one timeline node to the next, as a share of the stage. */
const STEP_SHARE = 0.6;
/** Share of each step the timeline rests on a node before gliding on. */
const STEP_HOLD = 0.2;
/** Extra rest on the last node before the stage releases, in steps. */
const TAIL_STEPS = 0.5;
/** Where nodes come to rest, below the top edge of the timeline window. */
const FOCUS_INSET_REM = 3.5;

type TimelineNode = {
  anchor: string;
  /** Node centre from the top of the untransformed list. */
  y: number;
  /** Scroll into the track at which the node is in focus. */
  offset: number;
};

type SceneLayout = {
  step: number;
  /** Focus line, from the top of the timeline window. */
  focusInWindow: number;
  /** Focus line, from the top of the pinned stage (the viewport). */
  focusY: number;
  trackHeight: number;
  nodes: TimelineNode[];
};

type ExperienceSceneProps = {
  copy: Pick<
    UiCopy["home"],
    | "experienceEyebrow"
    | "experienceTitle"
    | "experienceMuted"
    | "experienceDescription"
    | "technologyStackAria"
    | "collapseProjects"
    | "showProjects"
  >;
  experience: ExperienceItem[];
};

/**
 * Experience as a pinned scroll scene: the stage holds one screen while the
 * timeline steps from node to node under a fixed focus line. Without
 * `data-live` (server render, no script, reduced motion) it is the plain list.
 */
export function ExperienceScene({ copy, experience }: ExperienceSceneProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<SceneLayout | null>(null);
  const [layout, setLayout] = useState<SceneLayout | null>(null);
  const isLive = useScrollSceneLive();
  const listY = useMotionValue(0);
  const { scrollY } = useScroll();

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const timelineWindow = windowRef.current;
    const list = listRef.current;
    if (!stage || !timelineWindow || !list) return;

    const stageBounds = stage.getBoundingClientRect();
    const windowTop = timelineWindow.getBoundingClientRect().top;
    // Both rects carry the list's transform, so their difference does not.
    const listTop = list.getBoundingClientRect().top;
    const rem =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const focusInWindow = FOCUS_INSET_REM * rem;
    const step = Math.round(stageBounds.height * STEP_SHARE);
    // Closed project lists render nothing, so their nodes drop out.
    const nodes = Array.from(
      list.querySelectorAll<HTMLElement>("[data-scroll-accent-anchor]"),
    )
      .filter((node) => node.getClientRects().length > 0)
      .map((node, index) => {
        const bounds = node.getBoundingClientRect();
        return {
          anchor: node.dataset.scrollAccentAnchor ?? "",
          y: bounds.top + bounds.height / 2 - listTop,
          offset: index * step,
        };
      });

    setLayout({
      step,
      focusInWindow,
      focusY: Math.round(windowTop - stageBounds.top + focusInWindow),
      trackHeight: Math.round(
        Math.max(0, nodes.length - 1 + TAIL_STEPS) * step + stageBounds.height,
      ),
      nodes,
    });
  }, []);

  // Rests the focused node on the focus line, gliding between nodes.
  const place = useCallback(() => {
    const current = layoutRef.current;
    const track = trackRef.current;
    if (!current || !track || !current.nodes.length) return;

    const last = current.nodes.length - 1;
    const progress = clamp(-track.getBoundingClientRect().top / current.step, 0, last);
    const index = Math.min(Math.floor(progress), Math.max(0, last - 1));
    const from = current.nodes[index];
    const to = current.nodes[Math.min(index + 1, last)];
    const glide = smoothstep(
      (progress - index - STEP_HOLD) / (1 - 2 * STEP_HOLD),
    );

    listY.set(current.focusInWindow - (from.y + (to.y - from.y) * glide));
  }, [listY]);

  useMotionValueEvent(scrollY, "change", place);

  useLayoutEffect(() => {
    layoutRef.current = isLive ? layout : null;
    if (isLive) place();
    else listY.set(0);
  }, [isLive, layout, listY, place]);

  useEffect(() => {
    if (!isLive) return;

    // Fires once on observe, then whenever the stage or the list resizes
    // (viewport changes, fonts, a project list opening or closing).
    const resizeObserver = new ResizeObserver(measure);
    if (stageRef.current) resizeObserver.observe(stageRef.current);
    if (listRef.current) resizeObserver.observe(listRef.current);

    return () => resizeObserver.disconnect();
  }, [isLive, measure]);

  // Tabbing into a part of the timeline outside the window scrolls the track
  // to the node it belongs to.
  function revealFocusedNode(event: FocusEvent<HTMLDivElement>) {
    const current = layoutRef.current;
    const track = trackRef.current;
    const timelineWindow = windowRef.current;
    const list = listRef.current;
    if (!current || !track || !timelineWindow || !list || !current.nodes.length) return;

    const target = event.target.getBoundingClientRect();
    const windowBounds = timelineWindow.getBoundingClientRect();
    if (target.top >= windowBounds.top && target.bottom <= windowBounds.bottom) {
      return;
    }

    const targetY = target.top - list.getBoundingClientRect().top;
    const node =
      [...current.nodes].reverse().find((candidate) => candidate.y <= targetY + 1) ??
      current.nodes[0];
    const trackTop = track.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({ top: trackTop + node.offset, behavior: "instant" });
  }

  const liveLayout = isLive ? layout : null;
  const offsets = new Map(liveLayout?.nodes.map((node) => [node.anchor, node.offset]));
  // Live nodes publish where they come into focus, for the accent dot.
  const nodeOffset = (anchor: string) => offsets.get(anchor);

  return (
    <section
      className="section-block experience-section experience-scene"
      id="experience"
      aria-labelledby="experience-heading"
      data-scroll-accent-experience
      data-live={isLive ? "" : undefined}
    >
      <div
        className="experience-track"
        ref={trackRef}
        data-scroll-accent-track={liveLayout ? "" : undefined}
        data-scroll-accent-focus={liveLayout?.focusY}
        style={
          liveLayout
            ? ({ height: `${liveLayout.trackHeight}px` } as CSSProperties)
            : undefined
        }
      >
        {/* While pinned, the accent dot's anchor sits where the eyebrow rests,
            outside the sticky stage so its document position never depends
            on scroll. */}
        {isLive ? (
          <div className="experience-anchor-layer" aria-hidden="true">
            <Container>
              <span
                className="scroll-accent-heading-target"
                data-scroll-accent-anchor="experience"
                data-scroll-accent-phase="heading"
              />
            </Container>
          </div>
        ) : null}

        <div className="experience-stage" ref={stageRef}>
          <Container className="experience-head">
            <SectionHeading
              id="experience-heading"
              eyebrow={copy.experienceEyebrow}
              accentAnchor={isLive ? undefined : "experience"}
              accentSpacer={isLive}
              title={copy.experienceTitle}
              muted={copy.experienceMuted}
              description={copy.experienceDescription}
            />
          </Container>

          <div
            className="experience-window"
            ref={windowRef}
            onFocusCapture={revealFocusedNode}
          >
            <Container>
              <motion.div
                className="experience-list"
                ref={listRef}
                style={isLive ? { y: listY } : undefined}
              >
                {experience.map((item, experienceIndex) => (
                  <article className="experience-item" key={`${item.company}-${item.role}`}>
                    <div
                      className="experience-node"
                      data-scroll-accent-anchor={`experience-company-${experienceIndex}`}
                      data-scroll-accent-phase="experience-major"
                      data-scroll-accent-offset={nodeOffset(`experience-company-${experienceIndex}`)}
                      aria-hidden="true"
                    >
                      <Briefcase size={15} />
                    </div>
                    <div className="experience-content">
                      <div className="experience-company-row">
                        <div className="experience-company-lockup">
                          <span className="experience-logo">
                            <Image src={item.logoUrl} alt="" fill sizes="48px" />
                          </span>
                          <div className="experience-role">
                            <h3>{item.company}</h3>
                            <p>
                              <span>{item.role}</span>
                              <span aria-hidden="true" className="experience-meta-dot" />
                              <span>{item.location}</span>
                            </p>
                          </div>
                        </div>
                        <div className="experience-card-meta">
                          {item.status ? (
                            <span className="experience-status">
                              <Trophy aria-hidden="true" size={13} />
                              {item.status}
                            </span>
                          ) : null}
                          <span className="experience-period">{item.period}</span>
                        </div>
                      </div>

                      <p className="experience-description">{item.description}</p>

                      <div
                        className="experience-tech-list"
                        aria-label={formatCopy(copy.technologyStackAria, { name: item.company })}
                      >
                        {item.technologies.map((technology) => (
                          <span className="experience-tech-chip" key={technology}>{technology}</span>
                        ))}
                      </div>

                      {item.projects?.length ? (
                        <details className="client-projects" data-scroll-accent-details open>
                          <summary>
                            <span className="client-project-summary-open">{copy.collapseProjects}</span>
                            <span className="client-project-summary-closed">{copy.showProjects}</span>
                            <span className="client-project-count">{item.projects.length}</span>
                            <span className="client-project-toggle-icon" aria-hidden="true">
                              <ChevronUp size={13} />
                            </span>
                          </summary>
                          <div className="client-project-list">
                            {item.projects.map((project, projectIndex) => (
                              <article className="client-project-item" key={`${item.company}-${project.client}-${project.project}`}>
                                <span
                                  className="client-project-node"
                                  data-scroll-accent-anchor={`experience-project-${experienceIndex}-${projectIndex}`}
                                  data-scroll-accent-phase="experience-minor"
                                  data-scroll-accent-offset={nodeOffset(
                                    `experience-project-${experienceIndex}-${projectIndex}`,
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="client-project-logo">
                                  <Image src={project.logoUrl} alt="" fill sizes="40px" />
                                </span>
                                <div className="client-project-body">
                                  <h4>
                                    <span>{project.client}</span>
                                    <ArrowRight aria-hidden="true" size={16} />
                                    <span>{project.project}</span>
                                  </h4>
                                  <p>{project.description}</p>
                                  <div
                                    className="client-project-tech"
                                    aria-label={formatCopy(copy.technologyStackAria, { name: project.client })}
                                  >
                                    {project.technologies.map((technology) => (
                                      <span key={technology}>{technology}</span>
                                    ))}
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </article>
                ))}
              </motion.div>
            </Container>
          </div>
        </div>
      </div>
    </section>
  );
}
