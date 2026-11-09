"use client";

import { useRef, useState } from "react";

import type { SetupCopy } from "../_data/content";
import { usePlayOnView } from "./use-play-on-view";

type Log = SetupCopy["chaos"]["log"];
type Phase = "idle" | "live" | "done";
type LineState = "idle" | "running" | "done";

/** How long each check runs before it resolves, and the beat before the next. */
const RUN_MS = 460;
const GAP_MS = 140;

/**
 * The chaos agent's report, played as a live run: each check drops in,
 * runs, then resolves to fail or warn while the tally in the title bar
 * counts up. The summary lands last.
 */
export function ChaosLiveLog({ log }: { log: Log }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  // Every line takes two steps: running (even), then resolved (odd).
  const [step, setStep] = useState(0);
  const steps = log.entries.length * 2;

  usePlayOnView(ref, {
    onPlay: () => {
      let timer = 0;
      let current = 0;
      setStep(0);
      setPhase("live");

      const advance = () => {
        current += 1;
        if (current >= steps) {
          setPhase("done");
          return;
        }
        setStep(current);
        timer = window.setTimeout(advance, current % 2 === 0 ? RUN_MS : GAP_MS);
      };
      timer = window.setTimeout(advance, RUN_MS);
      return () => window.clearTimeout(timer);
    },
    onFinish: () => setPhase("done"),
  });

  const live = phase === "live";
  const lineState = (index: number): LineState => {
    if (!live) return "done";
    const line = Math.floor(step / 2);
    if (index < line) return "done";
    if (index > line) return "idle";
    return step % 2 === 0 ? "running" : "done";
  };
  const tally = (level: "fail" | "warn") =>
    log.entries.filter((entry, index) => entry.level === level && lineState(index) === "done")
      .length;

  return (
    <div ref={ref} className="setup-log" role="group" aria-label={log.aria} data-live={phase}>
      <div className="setup-log-bar">
        <p className="setup-log-file" translate="no">
          {log.file}
        </p>
        <p className="setup-log-tally" aria-hidden="true">
          <span className="setup-log-pulse" data-on={live ? "" : undefined} />
          <span data-level="fail">
            {log.levelLabels.fail} {tally("fail")}
          </span>
          <span data-level="warn">
            {log.levelLabels.warn} {tally("warn")}
          </span>
        </p>
      </div>
      <ol>
        {log.entries.map((entry, index) => (
          <li key={entry.area} data-level={entry.level} data-state={lineState(index)}>
            <span className="setup-log-level">
              <span className="setup-log-label">{log.levelLabels[entry.level]}</span>
              <span className="setup-log-run" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </span>
            <span className="setup-log-area">{entry.area}</span>
            <span className="setup-log-text">{entry.text}</span>
          </li>
        ))}
      </ol>
      <p className="setup-log-summary">
        <span aria-hidden="true">→ </span>
        {log.summary}
      </p>
    </div>
  );
}
