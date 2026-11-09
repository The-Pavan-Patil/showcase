"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  motion,
  type MotionStyle,
  type MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  createRef,
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Container } from "@/components/container";
import { richText } from "@/lib/rich-text";
import type { UiCopy } from "@/lib/ui-copy";
import { useMediaQuery, useScrollSceneLive } from "@/lib/use-scroll-scene";

type WorkflowCopy = UiCopy["home"]["aiWorkflow"];
type WorkflowStep = WorkflowCopy["steps"][number];
/**
 * pinned: one held screen, every beat on the pin's progress.
 * flow: stacked cards, each revealed as it scrolls in.
 * static: the finished composition (server render, reduced motion).
 */
type DiagramMode = "pinned" | "flow" | "static";
type Beat = readonly [number, number];

/** Same breakpoint as the CSS that scatters the cards over one screen. */
const SCATTER_QUERY = "(min-width: 1024px) and (min-height: 700px)";
const SPRING = { stiffness: 170, damping: 32, mass: 0.2 };

/** Pin progress (0 → 1 over the held runway) for each beat. */
const CARDS_BEAT: Beat = [0.02, 0.58];
const ARROWS_BEAT: Beat = [0.6, 0.84];
const CTA_BEAT: Beat = [0.86, 0.94];
/** Where focusing the hidden CTA jumps to, so it is never focused unseen. */
const FINISHED_PROGRESS = 0.96;
/** Each card swings in from its own tilt and settles square, so the arrows meet its edges. */
const CARD_TILTS = [-5, 4, -3, 5];

/** Splits `beat` into `count` back-to-back slots. */
function slots([from, to]: Beat, count: number): Beat[] {
  const size = (to - from) / Math.max(count, 1);
  return Array.from({ length: count }, (_, index) => [from + index * size, from + (index + 1) * size] as const);
}

/* ------------------------------------------------------------------ title */

type TitleToken =
  | { kind: "space" }
  | { kind: "word"; chars: Array<{ char: string; index: number }> };

const CJK = "\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}ー";
/** A CJK character, a run of anything else that is not a space, or a space. */
const TITLE_SEGMENT = new RegExp(`[${CJK}]|[^\\s${CJK}]+|\\s+`, "gu");
const PUNCTUATION = /^\p{P}+$/u;
const CJK_EDGE = new RegExp(`[${CJK}]`, "u");

/** Joins the title's two halves; CJK runs straight on, without a space. */
function joinTitle(first: string, second: string) {
  const isCjkSeam = CJK_EDGE.test(first.at(-1) ?? "") && CJK_EDGE.test(second.at(0) ?? "");
  return isCjkSeam ? `${first}${second}` : `${first} ${second}`;
}

/**
 * Words wrap as units (CJK breaks between characters, as it would anyway);
 * punctuation stays on the line of the word before it. Deterministic, so the
 * server and browser agree on the markup.
 */
function splitTitle(text: string) {
  const tokens: TitleToken[] = [];
  let count = 0;
  for (const segment of text.match(TITLE_SEGMENT) ?? []) {
    if (/^\s+$/.test(segment)) {
      tokens.push({ kind: "space" });
      continue;
    }
    const chars = Array.from(segment, (char) => ({ char, index: count++ }));
    const previous = tokens.at(-1);
    if (previous?.kind === "word" && PUNCTUATION.test(segment)) previous.chars.push(...chars);
    else tokens.push({ kind: "word", chars });
  }
  return { tokens, count };
}

/* ----------------------------------------------------------------- arrows */

type Box = { x: number; y: number; w: number; h: number };
type Connector = { d: string; head: string };
type Geometry = { width: number; height: number; connectors: Connector[] };

/** Space left between a card's edge and an arrow's ends. */
const ARROW_GAP = 10;
const ARROW_HEAD = 6;
/** How far an arrow drifts across the gap, so it reads as a flow, not a rule. */
const ARROW_DRIFT = 18;

/** Layout box relative to the diagram; ignores the cards' entry transforms. */
function boxOf(element: HTMLElement): Box {
  return { x: element.offsetLeft, y: element.offsetTop, w: element.offsetWidth, h: element.offsetHeight };
}

/** Picks a point in the shared span of two ranges, nudged apart by the drift. */
function sharedSpan(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  if (end <= start) return { from: (aStart + aEnd) / 2, to: (bStart + bEnd) / 2 };
  const middle = (start + end) / 2;
  const drift = Math.min(ARROW_DRIFT, (end - start) / 4) * Math.sign(bStart + bEnd - aStart - aEnd);
  return { from: middle - drift, to: middle + drift };
}

/**
 * The arrow from one card to the next: across the gap when the next card is
 * below (the stacked flow), otherwise from side to side (the scatter).
 */
function connect(a: Box, b: Box): Connector {
  if (b.y >= a.y + a.h) {
    const { from: sx, to: ex } = sharedSpan(a.x, a.x + a.w, b.x, b.x + b.w);
    const sy = a.y + a.h + ARROW_GAP;
    const ey = b.y - ARROW_GAP;
    const bend = (ey - sy) * 0.55;
    return {
      d: `M ${sx} ${sy} C ${sx} ${sy + bend}, ${ex} ${ey - bend}, ${ex} ${ey}`,
      head: `M ${ex - ARROW_HEAD} ${ey - ARROW_HEAD} L ${ex} ${ey} L ${ex + ARROW_HEAD} ${ey - ARROW_HEAD}`,
    };
  }

  const { from: sy, to: ey } = sharedSpan(a.y, a.y + a.h, b.y, b.y + b.h);
  const sx = a.x + a.w + ARROW_GAP;
  const ex = b.x - ARROW_GAP;
  const bend = Math.max(12, (ex - sx) * 0.55);
  return {
    d: `M ${sx} ${sy} C ${sx + bend} ${sy}, ${ex - bend} ${ey}, ${ex} ${ey}`,
    head: `M ${ex - ARROW_HEAD} ${ey - ARROW_HEAD} L ${ex} ${ey} L ${ex - ARROW_HEAD} ${ey + ARROW_HEAD}`,
  };
}

function isSameGeometry(previous: Geometry | null, next: Geometry) {
  return (
    previous !== null &&
    previous.width === next.width &&
    previous.height === next.height &&
    previous.connectors.length === next.connectors.length &&
    previous.connectors.every((connector, index) => connector.d === next.connectors[index].d)
  );
}

/* ------------------------------------------------------------------ scene */

export function WorkflowScene({
  copy,
  setupHref,
}: {
  copy: WorkflowCopy;
  setupHref: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isLive = useScrollSceneLive();
  const isScatter = useMediaQuery(SCATTER_QUERY);
  const isPinned = isLive && isScatter;
  const mode: DiagramMode = isPinned ? "pinned" : isLive ? "flow" : "static";

  // The title types in as the section rises and is whole when the stage pins.
  const { scrollYProgress: entryProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.75", "start start"],
  });
  const { scrollYProgress: pinProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const entry = useSpring(entryProgress, SPRING);
  const pin = useSpring(pinProgress, SPRING);

  const fullTitle = joinTitle(copy.title, copy.titleMuted);
  const title = useMemo(() => splitTitle(fullTitle), [fullTitle]);

  const ctaOpacity = useTransform(pin, [...CTA_BEAT], [0, 1]);
  const ctaY = useTransform(pin, [...CTA_BEAT], [16, 0]);
  const ctaPointerEvents = useTransform(pin, (value) => (value > CTA_BEAT[0] ? "auto" : "none"));

  function revealCtaForFocus() {
    const track = trackRef.current;
    if (!isPinned || !track || pinProgress.get() >= CTA_BEAT[1]) return;

    const bounds = track.getBoundingClientRect();
    const top = bounds.top + window.scrollY + (bounds.height - window.innerHeight) * FINISHED_PROGRESS;
    window.scrollTo({ top, behavior: "instant" });
  }

  return (
    <section
      className="workflow-scene"
      aria-labelledby="ai-workflow-heading"
      data-live={isLive ? "" : undefined}
      data-pinned={isPinned ? "" : undefined}
    >
      <div className="workflow-scene-track" ref={trackRef}>
        <div className="workflow-scene-stage">
          <Container className="workflow-scene-frame">
            <p className="eyebrow scroll-accent-eyebrow workflow-scene-eyebrow">
              <span
                className="scroll-accent-heading-target"
                data-scroll-accent-anchor="workflow"
                data-scroll-accent-phase="heading"
                aria-hidden="true"
              />
              {copy.eyebrow}
            </p>

            <motion.h2
              className="workflow-scene-title"
              id="ai-workflow-heading"
              style={isLive ? ({ "--title-progress": entry } as MotionStyle) : undefined}
            >
              <span className="sr-only">{fullTitle}</span>
              <span
                className="workflow-scene-title-text"
                aria-hidden="true"
                style={{ "--char-count": title.count } as CSSProperties}
              >
                {title.tokens.map((token, tokenIndex) =>
                  token.kind === "space" ? (
                    " "
                  ) : (
                    <span className="workflow-scene-title-word" key={tokenIndex}>
                      {token.chars.map(({ char, index }) => (
                        <span
                          className="workflow-scene-title-char"
                          key={index}
                          style={{ "--i": index } as CSSProperties}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  ),
                )}
              </span>
            </motion.h2>

            <WorkflowDiagram
              key={mode}
              ariaLabel={copy.stepsAria}
              mode={mode}
              pin={pin}
              steps={copy.steps}
            />

            {/* Remounted when the pin turns off (a resize to phone width):
                motion leaves the pinned opacity and pointer-events inline
                on the old row, which would hide the CTA. */}
            <motion.div
              key={isPinned ? "pinned" : "unpinned"}
              className="workflow-scene-cta-row"
              style={
                isPinned
                  ? { opacity: ctaOpacity, y: ctaY, pointerEvents: ctaPointerEvents }
                  : undefined
              }
            >
              <Link className="ai-workflow-cta" href={setupHref} onFocus={revealCtaForFocus}>
                {copy.cta}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </motion.div>
          </Container>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- diagram */

function WorkflowDiagram({
  ariaLabel,
  mode,
  pin,
  steps,
}: {
  ariaLabel: string;
  mode: DiagramMode;
  pin: MotionValue<number>;
  steps: readonly WorkflowStep[];
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [cardRefs] = useState(() => steps.map(() => createRef<HTMLLIElement>()));
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const cardBeats = slots(CARDS_BEAT, steps.length);
  const arrowBeats = slots(ARROWS_BEAT, steps.length - 1);

  // Arrows are drawn from the cards' layout boxes, re-measured whenever the
  // cards or the stage change size. Pinned, the diagram also scales down to
  // fit the screen if its cards run long.
  useLayoutEffect(() => {
    const slot = slotRef.current;
    const diagram = diagramRef.current;
    if (!slot || !diagram) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const boxes = cardRefs
        .map((ref) => ref.current)
        .filter((card): card is HTMLLIElement => card !== null)
        .map(boxOf);
      const next: Geometry = {
        width: diagram.offsetWidth,
        height: diagram.offsetHeight,
        connectors: boxes.slice(1).map((box, index) => connect(boxes[index], box)),
      };
      setGeometry((previous) => (isSameGeometry(previous, next) ? previous : next));

      if (mode === "pinned") {
        const fit = Math.min(1, slot.clientHeight / Math.max(1, diagram.offsetHeight));
        slot.style.setProperty("--workflow-fit", fit.toFixed(4));
      } else {
        slot.style.removeProperty("--workflow-fit");
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    // Observing calls back once straight away, which takes the first measure.
    const observer = new ResizeObserver(schedule);
    observer.observe(slot);
    observer.observe(diagram);
    for (const ref of cardRefs) if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [cardRefs, mode]);

  return (
    <div className="workflow-scene-slot" ref={slotRef}>
      <div className="workflow-scene-diagram" ref={diagramRef}>
        {geometry ? (
          <svg
            className="workflow-scene-arrows"
            aria-hidden="true"
            width={geometry.width}
            height={geometry.height}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
          >
            {geometry.connectors.map((connector, index) => (
              <WorkflowArrow
                key={index}
                beat={arrowBeats[index]}
                connector={connector}
                mode={mode}
                nextCardRef={cardRefs[index + 1]}
                pin={pin}
              />
            ))}
          </svg>
        ) : null}

        <ol className="workflow-scene-steps" aria-label={ariaLabel}>
          {steps.map((step, index) => (
            <WorkflowStepCard
              key={step.title}
              beat={cardBeats[index]}
              cardRef={cardRefs[index]}
              index={index}
              mode={mode}
              pin={pin}
              step={step}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

function WorkflowStepCard({
  beat,
  cardRef,
  index,
  mode,
  pin,
  step,
}: {
  beat: Beat;
  cardRef: RefObject<HTMLLIElement | null>;
  index: number;
  mode: DiagramMode;
  pin: MotionValue<number>;
  step: WorkflowStep;
}) {
  // Stacked, each card deals itself in as it rises into view.
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start 0.92", "start 0.62"] });
  const flow = useSpring(scrollYProgress, SPRING);
  const progress = mode === "pinned" ? pin : flow;
  const range = mode === "pinned" ? [...beat] : [0, 1];
  const tilt = CARD_TILTS[index % CARD_TILTS.length];

  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [32, 0]);
  const scale = useTransform(progress, range, [0.88, 1]);
  const rotate = useTransform(progress, range, [tilt, 0]);

  return (
    <motion.li
      ref={cardRef}
      className="workflow-scene-card"
      style={mode === "static" ? undefined : { opacity, y, scale, rotate }}
    >
      <span className="workflow-scene-card-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3>{step.title}</h3>
      <p>{richText(step.text)}</p>
    </motion.li>
  );
}

function WorkflowArrow({
  beat,
  connector,
  mode,
  nextCardRef,
  pin,
}: {
  beat: Beat;
  connector: Connector;
  mode: DiagramMode;
  nextCardRef: RefObject<HTMLLIElement | null>;
  pin: MotionValue<number>;
}) {
  // Stacked, an arrow draws just ahead of the card it points to.
  const { scrollYProgress } = useScroll({ target: nextCardRef, offset: ["start 0.98", "start 0.72"] });
  const flow = useSpring(scrollYProgress, SPRING);
  const progress = mode === "pinned" ? pin : flow;
  const [from, to] = mode === "pinned" ? beat : [0, 1];

  const pathLength = useTransform(progress, [from, to], [0, 1]);
  // Round caps would draw a dot at the start before the stroke has any length.
  const strokeOpacity = useTransform(progress, [from, from + (to - from) * 0.04], [0, 1]);
  const headOpacity = useTransform(progress, [from + (to - from) * 0.85, to], [0, 1]);

  if (mode === "static") {
    return (
      <g>
        <path className="workflow-scene-arrow" d={connector.d} />
        <path className="workflow-scene-arrow-head" d={connector.head} />
      </g>
    );
  }

  return (
    <g>
      <motion.path
        className="workflow-scene-arrow"
        d={connector.d}
        style={{ pathLength, opacity: strokeOpacity }}
      />
      <motion.path
        className="workflow-scene-arrow-head"
        d={connector.head}
        style={{ opacity: headOpacity }}
      />
    </g>
  );
}
