"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import {
  motion,
  type MotionStyle,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";

import { Container } from "@/components/container";
import { useMediaQuery, useScrollSceneLive } from "@/lib/use-scroll-scene";

import { AboutBeyond, type AboutBeyondNote } from "./about-beyond";

const PHONE_QUERY = "(max-width: 760px)";
/** Phones and short screens show the paragraph after the card, so they skip
 * the Beyond-code beat and show it as a strip instead. */
const COMPACT_QUERY = "(max-width: 760px), (max-height: 660px)";

/**
 * With the Beyond-code beat, the About timeline runs in the first part of the
 * track (the track grows to match, so its pace is unchanged).
 */
const ABOUT_SHARE_WITH_BEAT = 0.76;
/** About-timeline progress at which the card copy is fully readable. */
const CONTENT_READY_PROGRESS = 0.8;
/** Track progress where the About copy hands over to Beyond code. */
const BEAT_HANDOFF = [0.82, 0.87] as const;
const BEAT_IN = [0.87, 0.95] as const;

type AboutSceneProps = {
  displayWords: readonly [string, string];
  title: string;
  muted: string;
  description: string;
  resumeHref: string;
  resumeLabel: string;
  portraitAlt: string;
  beyondEyebrow: string;
  beyondHeading: string;
  beyondAria: string;
  notes: readonly AboutBeyondNote[];
};

export function AboutScene({
  displayWords,
  title,
  muted,
  description,
  resumeHref,
  resumeLabel,
  portraitAlt,
  beyondEyebrow,
  beyondHeading,
  beyondAria,
  notes,
}: AboutSceneProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isLive = useScrollSceneLive();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const isCompact = useMediaQuery(COMPACT_QUERY);
  const hasBeat = isLive && !isCompact;
  // Maps the About timeline below onto the track.
  const share = hasBeat ? ABOUT_SHARE_WITH_BEAT : 1;
  const at = (value: number) => value * share;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 32,
    mass: 0.2,
  });

  // ABOUT leaves to the left and ME to the right, uncovering the card.
  const leftX = useTransform(progress, [at(0.06), at(0.46)], ["0vw", "-78vw"]);
  const rightX = useTransform(progress, [at(0.06), at(0.46)], ["0vw", "78vw"]);
  const wordsOpacity = useTransform(progress, [at(0.36), at(0.46)], [1, 0]);

  // The card is laid out at its final size and opened with clip-path, so its
  // growth never triggers layout.
  const startInsetX = isPhone ? 28 : 34;
  const startInsetY = isPhone ? 24 : 16;
  const insetX = useTransform(progress, [at(0.08), at(0.46)], [startInsetX, 0]);
  const insetY = useTransform(progress, [at(0.08), at(0.46)], [startInsetY, 0]);
  const cardClip = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round 1.25rem)`;

  // Blurred -> sharp while the words part, then blurred again under the copy.
  // The blurred backdrop is static; only the sharp photo's opacity animates.
  const sharpOpacity = useTransform(
    progress,
    [at(0.1), at(0.42), at(0.54), at(0.66)],
    [0, 1, 1, 0],
  );
  const photoScale = useTransform(progress, [at(0.08), at(0.5)], [1.18, 1]);
  const scrimOpacity = useTransform(progress, [at(0.54), at(0.68)], [0, 1]);

  const headingOpacity = useTransform(progress, [at(0.6), at(0.72)], [0, 1]);
  const headingY = useTransform(progress, [at(0.6), at(0.74)], [36, 0]);
  const bodyOpacity = useTransform(progress, [at(0.66), at(0.78)], [0, 1]);
  const bodyY = useTransform(progress, [at(0.66), at(0.8)], [36, 0]);
  const contentPointerEvents = useTransform(progress, (value) =>
    value > at(0.72) && (!hasBeat || value < BEAT_HANDOFF[0]) ? "auto" : "none",
  );

  // Final beat: the About copy steps aside for Beyond code on the same card.
  const contentOpacity = useTransform(progress, [...BEAT_HANDOFF], [1, hasBeat ? 0 : 1]);
  const contentY = useTransform(progress, [...BEAT_HANDOFF], [0, hasBeat ? -24 : 0]);
  const beyondOpacity = useTransform(progress, [...BEAT_IN], [0, 1]);
  const beyondY = useTransform(progress, [...BEAT_IN], [28, 0]);

  function renderBody(style?: MotionStyle) {
    return (
      <motion.div className="about-scene-body" style={style}>
        <p>{description}</p>
        <a
          className="resume-capsule about-scene-resume"
          href={resumeHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {resumeLabel} <ArrowRight aria-hidden="true" size={16} />
        </a>
      </motion.div>
    );
  }

  // Tabbing to the résumé link while the copy is hidden (not yet revealed, or
  // handed over to Beyond code) scrolls the scene to where it is readable.
  function revealContentForFocus() {
    const track = trackRef.current;
    if (!isLive || !track) return;

    const ready = at(CONTENT_READY_PROGRESS);
    const current = scrollYProgress.get();
    if (current >= ready && (!hasBeat || current < BEAT_HANDOFF[0])) return;

    const bounds = track.getBoundingClientRect();
    const scrollable = bounds.height - window.innerHeight;
    const top = bounds.top + window.scrollY + scrollable * ready;

    window.scrollTo({ top, behavior: "instant" });
  }

  return (
    <section
      className="about-scene"
      id="about"
      aria-labelledby="about-heading"
      data-live={isLive ? "" : undefined}
      data-beat={hasBeat ? "" : undefined}
      data-scroll-accent-pass
    >
      <Container className="about-scene-anchor-row">
        <span
          className="scroll-accent-heading-target"
          data-scroll-accent-anchor="about"
          data-scroll-accent-phase="heading"
          aria-hidden="true"
        />
      </Container>

      <div className="about-scene-track" ref={trackRef}>
        <div className="about-scene-stage">
          <h2 className="about-scene-title" id="about-heading">
            <motion.span
              className="about-scene-word about-scene-word-left"
              style={isLive ? { x: leftX, opacity: wordsOpacity } : undefined}
            >
              {displayWords[0]}
            </motion.span>{" "}
            <motion.span
              className="about-scene-word about-scene-word-right"
              style={isLive ? { x: rightX, opacity: wordsOpacity } : undefined}
            >
              {displayWords[1]}
            </motion.span>
          </h2>

          <motion.div
            className="about-scene-card"
            style={isLive ? { clipPath: cardClip } : undefined}
          >
            {/* The card has the portrait's own proportions, so both layers show
                the whole photo. The sharp layer fades over the blurred one. */}
            <motion.div
              className="about-scene-photo about-scene-photo-blur"
              style={isLive ? { scale: photoScale } : undefined}
              aria-hidden="true"
            >
              <Image src="/pavan-profile-wide.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 75vw" />
            </motion.div>
            <motion.div
              className="about-scene-photo about-scene-photo-sharp"
              style={isLive ? { scale: photoScale, opacity: sharpOpacity } : undefined}
            >
              <Image
                src="/pavan-profile-wide.jpg"
                alt={portraitAlt}
                fill
                sizes="(max-width: 760px) 100vw, 75vw"
              />
            </motion.div>
            <motion.div
              className="about-scene-scrim"
              style={isLive ? { opacity: scrimOpacity } : undefined}
              aria-hidden="true"
            />

            <motion.div
              className="about-scene-content"
              style={
                isLive
                  ? { pointerEvents: contentPointerEvents, opacity: contentOpacity, y: contentY }
                  : undefined
              }
              onFocusCapture={revealContentForFocus}
            >
              <motion.div
                className="about-scene-heading"
                style={isLive ? { opacity: headingOpacity, y: headingY } : undefined}
              >
                <h3>
                  {title}
                  <span className="about-scene-heading-muted"> {muted}</span>
                </h3>
              </motion.div>
              {renderBody(isLive ? { opacity: bodyOpacity, y: bodyY } : undefined)}
            </motion.div>

            {/* Shown only with the beat (CSS); otherwise the strip below is. */}
            <motion.div
              className="about-scene-beyond"
              style={hasBeat ? { opacity: beyondOpacity, y: beyondY } : undefined}
            >
              <AboutBeyond
                ariaLabel={beyondAria}
                eyebrow={beyondEyebrow}
                heading={beyondHeading}
                notes={notes}
                variant="card"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Phones and short screens cannot fit the paragraph inside the pinned
          portrait card, so while the scene is live it follows the scene
          instead. CSS displays exactly one of the two bodies; the other is
          display: none. */}
      <Container className="about-scene-after">{renderBody()}</Container>

      <AboutBeyond
        ariaLabel={beyondAria}
        eyebrow={beyondEyebrow}
        heading={beyondHeading}
        notes={notes}
      />
    </section>
  );
}
