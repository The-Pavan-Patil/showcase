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

/** How far a block rises into place as it enters the window (rem). */
const RISE_REM = 2;
/** Share of the window, from its bottom edge, over which blocks rise. */
const RISE_SPAN = 0.25;

/*
 * Pin hold: tune these to change how the accent dot meets the timeline.
 *
 * When the stage pins, it holds still for HOLD_VIEWPORTS × the viewport
 * height of scroll before the timeline starts travelling, so the dot has
 * time to fly from the eyebrow to the first company. After the hold the
 * timeline moves one-to-one with the scroll and the dot steps down node by
 * node as each one reaches the focus line.
 *
 * HOLD_VIEWPORTS     length of the hold. 0 = no hold (the old behaviour);
 *                    0.5 = half a screen of scroll.
 * HOLD_MIN_PX        floor for the hold on short viewports (phones).
 * FIRST_NODE_AT      when, within the hold, the dot is sent to the first
 *                    company: 0 = the moment the stage pins, 1 = the end of
 *                    the hold (no time left to fly). Keep it low so the dot
 *                    lands before the timeline starts moving.
 */
const HOLD_VIEWPORTS = 0.45;
const HOLD_MIN_PX = 240;
const FIRST_NODE_AT = 0;

type TimelineNode = {
  anchor: string;
  /** Node centre from the top of the list. */
  y: number;
  /** Timeline travel (after the hold) at which the node reaches the focus line. */
  offset: number;
  /** Where the node is then, from the top of the pinned stage. */
  focusY: number;
};

type SceneLayout = {
  /** Scroll into the track spent pinned and still before the timeline moves. */
  hold: number;
  /** How far the timeline travels before its end is in view. */
  travel: number;
  /** Scroll into the track the stage stays pinned for, hold included. */
  range: number;
  /** Focus line, from the top of the pinned stage (the viewport). */
  focusY: number;
  windowHeight: number;
  /** RISE_REM in pixels. */
  rise: number;
  trackHeight: number;
  nodes: TimelineNode[];
  /** Timeline travel at which each company's node crosses the focus line. */
  companyOffsets: number[];
  reveals: { element: HTMLElement; top: number }[];
};

type ExperienceSceneProps = {
  copy: Pick<
    UiCopy["home"],
    | "experienceEyebrow"
    | "experienceTitle"
    | "experienceMuted"
    | "technologyStackAria"
    | "clientProjects"
  >;
  experience: ExperienceItem[];
};

/** Top of an element within the list, ignoring every transform. */
function offsetWithin(element: HTMLElement, list: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current && current !== list) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

/**
 * Experience as a pinned scroll scene: the stage holds one screen while the
 * timeline travels through its window one-to-one with the scroll, so it moves
 * at the pace of the page with no stops. Blocks rise into place as they enter,
 * and a company index tracks progress. Without `data-live` (server render, no
 * script, reduced motion) it is the plain timeline.
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

    const windowTop =
      timelineWindow.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    const windowHeight = timelineWindow.clientHeight;
    // Closed project lists render nothing, so their nodes drop out.
    const nodeElements = Array.from(
      list.querySelectorAll<HTMLElement>("[data-scroll-accent-anchor]"),
    ).filter((node) => node.getClientRects().length > 0);
    if (!nodeElements.length) return;

    const centres = nodeElements.map(
      (node) => offsetWithin(node, list) + node.offsetHeight / 2,
    );
    // The focus line is where the first node rests before the stage pins, so
    // the timeline starts travelling from exactly where layout put it. It
    // stops once its end is in view; the dot then carries on down the rail at
    // the same pace to the nodes that never reached the line.
    const firstCentre = centres[0];
    const travel = Math.max(0, Math.round(list.offsetHeight - windowHeight));
    const nodes = nodeElements.map((node, index) => {
      const offset = Math.round(centres[index] - firstCentre);
      return {
        anchor: node.dataset.scrollAccentAnchor ?? "",
        y: centres[index],
        offset,
        focusY: Math.round(windowTop + centres[index] - Math.min(offset, travel)),
      };
    });
    const hold = Math.round(Math.max(HOLD_MIN_PX, window.innerHeight * HOLD_VIEWPORTS));
    const range = hold + Math.max(travel, nodes[nodes.length - 1].offset);
    const rem =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    setLayout({
      hold,
      travel,
      range,
      focusY: Math.round(windowTop + firstCentre),
      windowHeight,
      rise: RISE_REM * rem,
      trackHeight: Math.round(stage.offsetHeight + range),
      nodes,
      companyOffsets: nodes
        .filter((node) => node.anchor.startsWith("experience-company-"))
        .map((node) => node.offset),
      reveals: Array.from(
        list.querySelectorAll<HTMLElement>("[data-experience-reveal]"),
      )
        .filter((element) => element.getClientRects().length > 0)
        .map((element) => ({ element, top: offsetWithin(element, list) })),
    });
  }, []);

  // Moves the timeline with the scroll and updates everything that follows
  // it. Writes only; positions come from the last measure.
  const place = useCallback(() => {
    const current = layoutRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!current || !track || !stage) return;

    // Nothing moves during the hold; after it, `scrolled` is timeline travel.
    const scrolled = clamp(
      -track.getBoundingClientRect().top - current.hold,
      0,
      current.range - current.hold,
    );
    const travelled = Math.min(scrolled, current.travel);
    listY.set(-travelled);

    const span = current.windowHeight * RISE_SPAN;
    for (const { element, top } of current.reveals) {
      const entered = smoothstep((current.windowHeight - (top - travelled)) / span);
      element.style.transform =
        entered >= 1
          ? ""
          : `translate3d(0, ${((1 - entered) * current.rise).toFixed(1)}px, 0)`;
    }

    const offsets = current.companyOffsets;
    let active = 0;
    offsets.forEach((offset, index) => {
      if (scrolled + 1 >= offset) active = index;
    });

    stage
      .querySelectorAll<HTMLElement>("[data-experience-index]")
      .forEach((item, index) => {
        const start = offsets[index] ?? 0;
        const end = offsets[index + 1] ?? current.range - current.hold;
        const fill = item.querySelector<HTMLElement>(".experience-index-fill");
        if (fill) {
          fill.style.transform = `scaleY(${clamp((scrolled - start) / Math.max(1, end - start))})`;
        }
        if (index === active) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });

    const counter = stage.querySelector<HTMLElement>(".experience-counter-current");
    if (counter) counter.textContent = String(active + 1).padStart(2, "0");
  }, [listY]);

  useMotionValueEvent(scrollY, "change", place);

  useLayoutEffect(() => {
    const previous = layoutRef.current;
    layoutRef.current = isLive ? layout : null;
    if (isLive) {
      place();
      return;
    }
    listY.set(0);
    previous?.reveals.forEach(({ element }) => {
      element.style.transform = "";
    });
  }, [isLive, layout, listY, place]);

  useEffect(() => {
    if (!isLive) return;

    // Measure as soon as the live layout applies, without waiting for a frame,
    // then again whenever the stage or the list resizes (viewport changes,
    // fonts, a project list opening or closing).
    const firstMeasure = window.setTimeout(measure, 0);
    const resizeObserver = new ResizeObserver(measure);
    if (stageRef.current) resizeObserver.observe(stageRef.current);
    if (listRef.current) resizeObserver.observe(listRef.current);

    return () => {
      window.clearTimeout(firstMeasure);
      resizeObserver.disconnect();
    };
  }, [isLive, measure]);

  function scrollToOffset(offset: number, behavior: ScrollBehavior) {
    const track = trackRef.current;
    if (!track) return;
    const hold = layoutRef.current?.hold ?? 0;
    const top = track.getBoundingClientRect().top + window.scrollY + hold + offset;
    window.scrollTo({ top, behavior });
  }

  // Tabbing into a part of the timeline outside the window scrolls the track
  // to the node it belongs to.
  function revealFocusedNode(event: FocusEvent<HTMLDivElement>) {
    const current = layoutRef.current;
    const timelineWindow = windowRef.current;
    const list = listRef.current;
    if (!current || !timelineWindow || !list) return;

    const target = event.target.getBoundingClientRect();
    const windowBounds = timelineWindow.getBoundingClientRect();
    if (target.top >= windowBounds.top && target.bottom <= windowBounds.bottom) {
      return;
    }

    const targetY = target.top - list.getBoundingClientRect().top;
    const node =
      [...current.nodes].reverse().find((candidate) => candidate.y <= targetY + 1) ??
      current.nodes[0];
    scrollToOffset(node.offset, "instant");
  }

  const liveLayout = isLive ? layout : null;
  const placed = new Map(liveLayout?.nodes.map((node) => [node.anchor, node]));
  // Live nodes publish when (scroll into the track) and where the accent dot
  // reaches them. The first is called during the hold; the rest as they
  // reach the focus line once the timeline moves.
  const accentOffset = (anchor: string) => {
    const node = placed.get(anchor);
    if (!node || !liveLayout) return undefined;
    return node.offset === 0
      ? Math.round(liveLayout.hold * FIRST_NODE_AT)
      : liveLayout.hold + node.offset;
  };
  const accentProps = (anchor: string) => ({
    "data-scroll-accent-offset": accentOffset(anchor),
    "data-scroll-accent-focus": placed.get(anchor)?.focusY,
  });

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
        data-scroll-accent-end={liveLayout?.range}
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
          <Container className="experience-layout">
            <div className="experience-aside">
              <div className="experience-head">
                <SectionHeading
                  id="experience-heading"
                  eyebrow={copy.experienceEyebrow}
                  accentAnchor={isLive ? undefined : "experience"}
                  accentSpacer={isLive}
                  title={copy.experienceTitle}
                  muted={copy.experienceMuted}
                />
                {isLive ? (
                  <p className="experience-counter" aria-hidden="true">
                    <span className="experience-counter-current">01</span>
                    <span className="experience-counter-total">
                      {" "}
                      / {String(experience.length).padStart(2, "0")}
                    </span>
                  </p>
                ) : null}
              </div>

              {liveLayout ? (
                <ol className="experience-index" aria-label={copy.experienceEyebrow}>
                  {experience.map((item, index) => (
                    <li key={`${item.company}-${item.role}`}>
                      <button
                        type="button"
                        className="experience-index-button"
                        data-experience-index
                        onClick={() =>
                          scrollToOffset(liveLayout.companyOffsets[index] ?? 0, "smooth")
                        }
                      >
                        <span className="experience-index-fill" aria-hidden="true" />
                        <span className="experience-index-name">{item.company}</span>
                        <span className="experience-index-period">{item.period}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>

            <div
              className="experience-window"
              ref={windowRef}
              onFocusCapture={revealFocusedNode}
            >
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
                      {...accentProps(`experience-company-${experienceIndex}`)}
                      aria-hidden="true"
                    >
                      <Briefcase size={15} />
                    </div>
                    <div className="experience-content">
                      <div className="experience-company-row" data-experience-reveal>
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

                      <div
                        className="experience-tech-list"
                        aria-label={formatCopy(copy.technologyStackAria, { name: item.company })}
                        data-experience-reveal
                      >
                        {item.technologies.map((technology) => (
                          <span className="experience-tech-chip" key={technology}>{technology}</span>
                        ))}
                      </div>

                      {item.projects?.length ? (
                        <details className="client-projects" data-scroll-accent-details open>
                          <summary data-experience-reveal>
                            <span>{copy.clientProjects}</span>
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
                                  {...accentProps(`experience-project-${experienceIndex}-${projectIndex}`)}
                                  aria-hidden="true"
                                />
                                <span className="client-project-logo" data-experience-reveal>
                                  <Image src={project.logoUrl} alt="" fill sizes="40px" />
                                </span>
                                <div className="client-project-body" data-experience-reveal>
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
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
