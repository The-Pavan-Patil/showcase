"use client";

import { useMemo, useRef, useState } from "react";

import type { SetupCopy } from "../_data/content";
import { usePlayOnView } from "./use-play-on-view";

type Prd = SetupCopy["plan"]["prd"];
type Line = { prefix: string; text: string; suffix: string; checkbox?: boolean };
type Phase = "idle" | "typing" | "done";

/** The whole file types in about this long, whatever the language. */
const TYPING_BUDGET_MS = 3400;
const LINE_PAUSE_MS = 90;

function buildLines(prd: Prd): Line[] {
  return [
    { prefix: "<!-- ", text: prd.comment, suffix: " -->" },
    { prefix: "# ", text: "Master PRD", suffix: "" },
    ...prd.sections.flatMap((section) => [
      { prefix: "## ", text: section.heading, suffix: "" },
      { prefix: "", text: section.text, suffix: "", checkbox: section.checkbox },
    ]),
  ];
}

/**
 * One line of the file. Screen readers get the plain text; the typed copy
 * is decoration. The untyped rest stays in the flow but invisible, so lines
 * wrap where they will end up and nothing shifts while the text types.
 */
function TypedLine({ line, count, caret }: { line: Line; count: number | null; caret: boolean }) {
  const full = line.prefix + line.text + line.suffix;
  const typed = count ?? full.length;
  const textStart = line.prefix.length;
  const textEnd = textStart + line.text.length;

  return (
    <>
      <span className="sr-only">{line.text}</span>
      <span className="setup-type" aria-hidden="true">
        {line.checkbox ? (
          <span className="setup-prd-box" data-pending={typed === 0 ? "" : undefined} />
        ) : null}
        {typed > 0 && textStart > 0 ? (
          <span className="setup-prd-mark">{full.slice(0, Math.min(textStart, typed))}</span>
        ) : null}
        {typed > textStart ? full.slice(textStart, Math.min(textEnd, typed)) : null}
        {typed > textEnd ? <span className="setup-prd-mark">{full.slice(textEnd, typed)}</span> : null}
        {caret ? <span className="setup-type-caret" /> : null}
        {typed < full.length ? <span className="setup-type-rest">{full.slice(typed)}</span> : null}
      </span>
    </>
  );
}

export function PrdTypewriter({ prd }: { prd: Prd }) {
  const ref = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => buildLines(prd), [prd]);
  const schedule = useMemo(() => {
    const lengths = lines.map((line) => (line.prefix + line.text + line.suffix).length);
    const characters = lengths.reduce((sum, length) => sum + length, 0);
    const msPerChar = Math.min(30, Math.max(7, TYPING_BUDGET_MS / characters));
    const starts: number[] = [];
    let cursor = 0;
    for (const length of lengths) {
      starts.push(cursor);
      cursor += length * msPerChar + LINE_PAUSE_MS;
    }
    return { lengths, msPerChar, starts, end: cursor - LINE_PAUSE_MS };
  }, [lines]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);

  usePlayOnView(ref, {
    onPlay: () => {
      let frame = 0;
      const startedAt = performance.now();
      setElapsed(0);
      setPhase("typing");

      const tick = (now: number) => {
        const next = now - startedAt;
        if (next >= schedule.end) {
          setPhase("done");
          return;
        }
        setElapsed(next);
        frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(frame);
    },
    onFinish: () => setPhase("done"),
  });

  const typing = phase === "typing";
  // The caret sits on the last line that has started typing.
  const activeLine = typing ? schedule.starts.filter((start) => elapsed >= start).length - 1 : -1;
  const countFor = (index: number) =>
    typing
      ? Math.max(
          0,
          Math.min(
            schedule.lengths[index],
            Math.floor((elapsed - schedule.starts[index]) / schedule.msPerChar),
          ),
        )
      : null;
  const lineProps = (index: number) => ({
    line: lines[index],
    count: countFor(index),
    caret: index === activeLine,
  });

  return (
    <div ref={ref} className="setup-prd" data-typing={phase}>
      <p className="setup-prd-comment">
        <TypedLine {...lineProps(0)} />
      </p>
      <p className="setup-prd-title" translate="no">
        <TypedLine {...lineProps(1)} />
      </p>
      <dl>
        {prd.sections.map((section, index) => (
          <div key={section.heading}>
            <dt>
              <TypedLine {...lineProps(2 + index * 2)} />
            </dt>
            <dd>
              <TypedLine {...lineProps(3 + index * 2)} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
