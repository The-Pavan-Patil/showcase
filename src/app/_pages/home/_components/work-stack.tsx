"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

import { Container } from "@/components/container";
import { getWorkPath, type Locale } from "@/lib/i18n";
import type { ProjectCaseStudy } from "@/lib/portfolio";
import { formatCopy, type UiCopy } from "@/lib/ui-copy";
import { useScrollSceneLive } from "@/lib/use-scroll-scene";

import {
  resolveActiveIndex,
  resolveCardStyle,
  resolveProgressForIndex,
  resolveStackPosition,
  resolveStackStyle,
} from "./work-stack-timeline";

const noSubscription = () => () => undefined;

/**
 * The stack moves on the browser's scroll timeline, so no script runs per
 * frame (on phones that made scroll-placed elements shake). Browsers without
 * scroll timelines get the plain row of cards.
 */
function useScrollTimelines() {
  return useSyncExternalStore(
    noSubscription,
    () => CSS.supports("animation-timeline: view()"),
    () => false,
  );
}

export function WorkStack({
  copy,
  heading,
  locale,
  projects,
}: {
  copy: UiCopy["projectCard"];
  heading: ReactNode;
  locale: Locale;
  projects: ProjectCaseStudy[];
}) {
  const count = projects.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Array<HTMLLIElement | null>>([]);
  const motionAllowed = useScrollSceneLive();
  const hasScrollTimelines = useScrollTimelines();
  const isLive = motionAllowed && hasScrollTimelines;

  // The same stretch as the CSS timeline: from the stage pinning to it
  // letting go.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const position = useTransform(scrollYProgress, (value) =>
    resolveStackPosition(value, count),
  );
  const counter = useTransform(position, (value) =>
    String(resolveActiveIndex(value, count) + 1).padStart(2, "0"),
  );

  // Only the front card takes the pointer: not the edges peeking out below
  // it, nor the cards that have left.
  useEffect(() => {
    if (!isLive) return;
    const slots = slotRefs.current;
    let front = -1;
    const mark = (value: number) => {
      const next = resolveActiveIndex(value, count);
      if (next === front) return;
      front = next;
      slots.forEach((slot, index) =>
        slot?.toggleAttribute("data-front", index === next),
      );
    };
    mark(position.get());
    const unsubscribe = position.on("change", mark);
    return () => {
      unsubscribe();
      slots.forEach((slot) => slot?.removeAttribute("data-front"));
    };
  }, [count, isLive, position]);

  // As the heading slides away, the deck rises by half its height, so it
  // ends in the middle of the screen. Measured on resize only.
  useEffect(() => {
    const track = trackRef.current;
    const head = headRef.current;
    const deck = deckRef.current;
    if (!isLive || !track || !head || !deck) return;

    const measure = () => {
      const gap = Number.parseFloat(getComputedStyle(deck).marginTop) || 0;
      track.style.setProperty(
        "--stack-deck-rise",
        `${((head.offsetHeight + gap) / 2).toFixed(1)}px`,
      );
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(head);
    resizeObserver.observe(deck);
    return () => {
      resizeObserver.disconnect();
      track.style.removeProperty("--stack-deck-rise");
    };
  }, [isLive]);

  // Tabbing to a card that has left, or is still in the stack, scrolls it to
  // the front.
  function bringCardForward(index: number) {
    const track = trackRef.current;
    if (!isLive || !track) return;

    const bounds = track.getBoundingClientRect();
    const scrollable = bounds.height - window.innerHeight;
    const top =
      bounds.top +
      window.scrollY +
      scrollable * resolveProgressForIndex(index, count);
    window.scrollTo({ top, behavior: "instant" });
  }

  return (
    <div
      className="work-stack"
      data-live={isLive ? "" : undefined}
      data-section-start={isLive ? "" : undefined}
      ref={trackRef}
      style={resolveStackStyle(count) as CSSProperties}
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
        {/* Live, the heading slides up and away as the stage pins, and the
            deck (the cards and their counter) rises to the middle. */}
        <div className="work-stack-head" ref={headRef}>
          <Container>{heading}</Container>
        </div>

        <div className="work-stack-deck" ref={deckRef}>
          <ol className="work-stack-lane">
            {projects.map((project, index) => (
              <li
                className="work-stack-slot"
                key={project.slug}
                ref={(element) => {
                  slotRefs.current[index] = element;
                }}
                style={resolveCardStyle(index, count) as CSSProperties}
              >
                {/* Two layers: the outer one leaves (rises and tips back), the
                    card moves up through the stack. */}
                <div className="work-stack-lift">
                  <article
                    className="work-card"
                    style={
                      project.cardPalette
                        ? ({
                            "--card-base": project.cardPalette.base,
                            "--card-glow": project.cardPalette.glow,
                            "--card-deep": project.cardPalette.deep,
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    <div className="work-card-shade" aria-hidden="true" />
                    <div className="work-card-head">
                      <h3 className="work-card-title">{project.title}</h3>
                      <p className="work-card-kicker">{project.kicker}</p>
                      {/* Only the landscape card has room for the headline. */}
                      <p className="work-card-headline">{project.cardHeadline}</p>
                    </div>
                    {/* The screenshot sits in a framed window on the card's
                        own colour. */}
                    {project.media ? (
                      <div className="work-card-media">
                        <Image
                          src={project.media.src}
                          alt={project.media.alt}
                          fill
                          sizes="(max-width: 760px) 80vw, 36vw"
                          style={
                            project.media.focus
                              ? { objectPosition: project.media.focus }
                              : undefined
                          }
                        />
                      </div>
                    ) : null}
                    <div className="work-card-foot">
                      <span className="work-card-client">{project.client}</span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="work-card-arrow"
                        size={20}
                      />
                    </div>
                    <Link
                      aria-label={formatCopy(copy.readCaseStudyAria, {
                        title: project.title,
                      })}
                      className="work-card-link"
                      href={getWorkPath(locale, project.slug)}
                      onFocus={() => bringCardForward(index)}
                    />
                  </article>
                </div>
              </li>
            ))}
          </ol>
          {isLive ? (
            <p className="work-stack-counter" aria-hidden="true">
              <motion.span>{counter}</motion.span>
              <span className="work-stack-counter-total">
                {" "}
                / {String(count).padStart(2, "0")}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
