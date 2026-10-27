"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { Container } from "@/components/container";
import { getWorkPath, type Locale } from "@/lib/i18n";
import type { ProjectCaseStudy } from "@/lib/portfolio";
import { formatCopy, type UiCopy } from "@/lib/ui-copy";
import { useScrollSceneLive } from "@/lib/use-scroll-scene";

import type { DustField, DustMotion } from "./dust-field";
import {
  DISSOLVE_END,
  PHONE_DISSOLVE_END,
  resolveActiveIndex,
  resolveCardPose,
  resolveDustPosition,
  resolveProgressForIndex,
} from "./project-dust-timeline";

const PHONE_QUERY = "(max-width: 760px)";

type Metrics = {
  laneX: number;
  laneY: number;
  spacing: number;
  dissolveEnd: number;
  motion: DustMotion;
};

/** Lane geometry in the dust canvas's coordinates, so it follows the CSS card size. */
function measure(
  field: HTMLElement,
  lane: HTMLElement,
  card: HTMLElement,
): Metrics {
  const fieldBox = field.getBoundingClientRect();
  const laneBox = lane.getBoundingClientRect();
  const isPhone = window.matchMedia(PHONE_QUERY).matches;
  const width = fieldBox.width;
  const cardWidth = card.offsetWidth;

  return {
    laneX: laneBox.left - fieldBox.left + laneBox.width / 2,
    laneY: laneBox.top - fieldBox.top + laneBox.height / 2,
    // Desktop rests the neighbours near the edges, mid-dust; phones keep them
    // just off screen so one card shows at a time.
    spacing: isPhone
      ? width / 2 + cardWidth * 0.3
      : Math.max(width * 0.42, cardWidth * 1.15),
    dissolveEnd: isPhone ? PHONE_DISSOLVE_END : DISSOLVE_END,
    motion: {
      drift: width * (isPhone ? 0.45 : 0.3),
      spread: fieldBox.height * 0.32,
      swirl: isPhone ? 10 : 16,
    },
  };
}

export function ProjectDust({
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
  const stageRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLOListElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const isLive = useScrollSceneLive();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const target = useTransform(scrollYProgress, (value) =>
    resolveDustPosition(value, count),
  );
  // A spring smooths wheel steps into one continuous glide.
  const position = useSpring(target, {
    stiffness: 110,
    damping: 24,
    mass: 0.6,
  });
  const counter = useTransform(position, (value) =>
    String(resolveActiveIndex(value, count) + 1).padStart(2, "0"),
  );

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const fieldBox = fieldRef.current;
    const lane = laneRef.current;
    const canvas = canvasRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLElement =>
      Boolean(card),
    );
    if (
      !isLive ||
      !track ||
      !stage ||
      !fieldBox ||
      !lane ||
      !canvas ||
      cards.length === 0
    )
      return;

    let metrics = measure(fieldBox, lane, cards[0]);
    let field: DustField | null = null;
    let fieldRequested = false;
    let disposed = false;
    let frame = 0;
    let resampleTimer = 0;

    const particleStep = () =>
      window.matchMedia(PHONE_QUERY).matches ? 2.5 : 2;

    // Poses every card for the current position. With WebGL the cards are
    // drawn (and dissolved) on the canvas; the DOM cards stay aligned but
    // invisible, for links, focus and screen readers.
    const apply = () => {
      const current = position.get();
      const { laneX, laneY, spacing } = metrics;
      const states = cards.map((card, index) => {
        const offset = index - current;
        const pose = resolveCardPose(offset, metrics.dissolveEnd);
        const shift = offset * spacing;

        card.style.transform = `translate3d(${shift.toFixed(2)}px, 0, 0) scale(${pose.scale.toFixed(4)})`;
        // Without WebGL the cards simply fade as they would turn to dust.
        card.style.opacity = field ? "" : String(1 - pose.dissolve);
        card.style.visibility = pose.dissolve >= 1 ? "hidden" : "";
        card.style.pointerEvents = Math.abs(offset) < 0.5 ? "" : "none";
        return { x: laneX + shift, y: laneY, ...pose };
      });

      field?.update(states, metrics.motion);
      field?.render();
    };

    // Redraws at most once per frame, and only when something moved.
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };
    const unsubscribe = position.on("change", schedule);

    const resample = () => {
      if (!field) return;
      const box = fieldBox.getBoundingClientRect();
      field.setSize(box.width, box.height);
      field.setCards(cards, particleStep());
      apply();
    };
    const scheduleResample = () => {
      window.clearTimeout(resampleTimer);
      resampleTimer = window.setTimeout(resample, 150);
    };

    // three.js and the card rasters load only once the scene is close.
    const ensureField = async () => {
      if (fieldRequested) return;
      fieldRequested = true;
      const created = await (
        await import("./dust-field")
      ).DustField.create(canvas);
      if (disposed) {
        created?.dispose();
        return;
      }
      // `data-dust` tells styles (and tests) which rendering is in use.
      if (!created) {
        track.dataset.dust = "fallback";
        return;
      }
      await document.fonts.ready;
      if (disposed) {
        created.dispose();
        return;
      }
      field = created;
      resample();
      track.dataset.dust = "ready";
    };

    const images = cards.flatMap((card) => [...card.querySelectorAll("img")]);
    images.forEach((image) => image.addEventListener("load", scheduleResample));

    const resizeObserver = new ResizeObserver(() => {
      metrics = measure(fieldBox, lane, cards[0]);
      scheduleResample();
      apply();
    });
    resizeObserver.observe(stage);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void ensureField();
      },
      { rootMargin: "100% 0px" },
    );
    visibility.observe(stage);

    apply();

    return () => {
      disposed = true;
      delete track.dataset.dust;
      unsubscribe();
      cancelAnimationFrame(frame);
      window.clearTimeout(resampleTimer);
      visibility.disconnect();
      resizeObserver.disconnect();
      images.forEach((image) =>
        image.removeEventListener("load", scheduleResample),
      );
      field?.dispose();
      for (const card of cards) {
        card.style.transform = "";
        card.style.opacity = "";
        card.style.visibility = "";
        card.style.pointerEvents = "";
      }
    };
  }, [isLive, position]);

  // Tabbing to a card that is off to the side scrolls it to the centre.
  function centreCardForFocus(index: number) {
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
      className="dust-track"
      data-live={isLive ? "" : undefined}
      ref={trackRef}
      style={{ "--dust-count": count } as CSSProperties}
    >
      {/* The accent dot's anchor sits where the pinned eyebrow rests, outside
          the sticky stage so its document position never depends on scroll. */}
      <div className="dust-anchor-layer" aria-hidden="true">
        <Container>
          <span
            className="scroll-accent-heading-target"
            data-scroll-accent-anchor="work"
            data-scroll-accent-phase="heading"
          />
        </Container>
      </div>

      <div className="dust-stage" ref={stageRef}>
        <Container className="dust-head">
          {heading}
          {isLive ? (
            <p className="dust-counter" aria-hidden="true">
              <motion.span>{counter}</motion.span>
              <span className="dust-counter-total">
                {" "}
                / {String(count).padStart(2, "0")}
              </span>
            </p>
          ) : null}
        </Container>

        {/* The dust canvas covers the card area only, so particles never
            drift over the heading. */}
        <div className="dust-field" ref={fieldRef}>
          <ol className="dust-lane" ref={laneRef}>
            {projects.map((project, index) => (
              <li className="dust-slot" key={project.slug}>
                <article
                  className="dust-card"
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
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
                  <div className="dust-card-shade" aria-hidden="true" />
                  <div className="dust-card-head">
                    <h3 className="dust-card-title" data-dust-text>
                      {project.title}
                    </h3>
                    <p className="dust-card-kicker" data-dust-text>
                      {project.kicker}
                    </p>
                  </div>
                  {/* The screenshot sits in a framed window on the card's own
                      colour, uncropped by the portrait shape. */}
                  {project.media ? (
                    <div className="dust-card-media">
                      <Image
                        src={project.media.src}
                        alt={project.media.alt}
                        fill
                        sizes="(max-width: 760px) 80vw, 28vw"
                        style={
                          project.media.focus
                            ? { objectPosition: project.media.focus }
                            : undefined
                        }
                      />
                    </div>
                  ) : null}
                  <div className="dust-card-foot">
                    <span className="dust-card-client" data-dust-text>
                      {project.client}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="dust-card-arrow"
                      size={20}
                    />
                  </div>
                  <Link
                    aria-label={formatCopy(copy.readCaseStudyAria, {
                      title: project.title,
                    })}
                    className="dust-card-link"
                    href={getWorkPath(locale, project.slug)}
                    onFocus={() => centreCardForFocus(index)}
                  />
                </article>
              </li>
            ))}
          </ol>

          {isLive ? (
            <canvas
              className="dust-canvas"
              ref={canvasRef}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
