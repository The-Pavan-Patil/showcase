"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";

import { Container } from "@/components/container";

export type AboutBeyondNote = {
  keyword: string;
  label: string;
  text: string;
};

/**
 * Opacity of unlit text before a row scrolls into the reading line. These are
 * the lowest values that keep WCAG AA contrast in both themes: 4.5:1 for the
 * sentence and 3:1 for the large keyword.
 */
const UNLIT_TEXT_OPACITY = 0.6;
const UNLIT_KEYWORD_OPACITY = 0.5;

/**
 * Splits a sentence into the pieces that light up one after another. Text
 * without spaces (Japanese) is lit per character so the sweep still reads.
 */
function splitIntoTokens(text: string) {
  const words = text.split(/(\s+)/).filter(Boolean);
  return words.length > 1 ? words : Array.from(text);
}

function LitToken({
  progress,
  index,
  count,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  children: string;
}) {
  const start = 0.2 + (index / count) * 0.7;
  const opacity = useTransform(progress, [start, start + 0.12], [UNLIT_TEXT_OPACITY, 1]);

  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

function BeyondRow({ note, isLive }: { note: AboutBeyondNote; isLive: boolean }) {
  const rowRef = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 85%", "center 45%"],
  });
  const keywordOpacity = useTransform(scrollYProgress, [0, 0.45], [UNLIT_KEYWORD_OPACITY, 1]);
  const keywordX = useTransform(scrollYProgress, [0, 0.6], ["-1.5rem", "0rem"]);
  const tokens = splitIntoTokens(note.text);

  return (
    <li className="about-beyond-row" ref={rowRef}>
      <motion.h4
        className="about-beyond-keyword"
        style={isLive ? { opacity: keywordOpacity, x: keywordX } : undefined}
      >
        {note.keyword}
      </motion.h4>
      <div className="about-beyond-copy">
        <p className="about-beyond-label">{note.label}</p>
        <p className="about-beyond-text">
          {isLive
            ? tokens.map((token, index) => (
                <LitToken
                  count={tokens.length}
                  index={index}
                  key={`${index}-${token}`}
                  progress={scrollYProgress}
                >
                  {token}
                </LitToken>
              ))
            : note.text}
        </p>
      </div>
    </li>
  );
}

export function AboutBeyond({
  ariaLabel,
  eyebrow,
  heading,
  isLive,
  notes,
}: {
  ariaLabel: string;
  eyebrow: string;
  heading: string;
  isLive: boolean;
  notes: readonly AboutBeyondNote[];
}) {
  return (
    <Container className="about-beyond">
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="sr-only">{heading}</h3>
      <ul className="about-beyond-list" aria-label={ariaLabel}>
        {notes.map((note) => (
          <BeyondRow isLive={isLive} key={note.label} note={note} />
        ))}
      </ul>
    </Container>
  );
}
