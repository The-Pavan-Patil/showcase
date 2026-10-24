"use client";

import { useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";

const SESSION_KEY = "launch-terminal-seen";
const DIRECTORY_LABEL = "/Users/pavanpatil/Developer/Portfolio";
const FINAL_COMMAND = "npm run dev";
const MISTYPED_COMMAND = "npm rundev";
const CORRECTION_INDEX = "npm run".length;

const outputLines = [
  "> showcase@0.1.0 dev",
  "> next dev",
  "",
  "▲ Next.js 16.2.11",
  "- Local:        http://localhost:3000",
  "- Network:      http://192.168.1.8:3000",
  "",
  "✓ Starting…",
  "✓ Ready in 1387ms",
];

function sleep(duration: number) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function shouldForceIntro() {
  return new URLSearchParams(window.location.search).get("intro") === "1";
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    // Storage can be unavailable in private browsing; the intro still completes.
  }
}

export function LaunchTerminal({
  copy = {
    title: "pavanpatil.dev launch",
    skip: "Skip",
    websiteLine: "Website: https://pavanpatil.dev",
  },
}: {
  copy?: {
    title: string;
    skip: string;
    websiteLine: string;
  };
} = {}) {
  const websiteLine = copy.websiteLine;
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [command, setCommand] = useState("");
  const [cursorIndex, setCursorIndex] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [visibleOutputCount, setVisibleOutputCount] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  function elapsedSinceStart() {
    return startedAtRef.current === null ? 0 : Date.now() - startedAtRef.current;
  }

  useEffect(() => {
    startedAtRef.current = Date.now();
    let isCancelled = false;

    async function finishIntro(delay = 160) {
      trackEvent("intro_completed", { elapsed_ms: elapsedSinceStart() });
      markIntroSeen();
      setIsExiting(true);
      await sleep(delay);
      if (!isCancelled) setIsVisible(false);
    }

    async function playIntro() {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const forceIntro = shouldForceIntro();

      if ((!forceIntro && hasSeenIntro()) || prefersReducedMotion) {
        trackEvent("intro_not_shown", {
          reason: prefersReducedMotion ? "reduced_motion" : "already_seen",
        });
        markIntroSeen();
        setIsVisible(false);
        return;
      }

      await sleep(50);

      for (let index = 0; index < MISTYPED_COMMAND.length; index += 1) {
        if (isCancelled) return;
        const nextCommand = MISTYPED_COMMAND.slice(0, index + 1);
        setCommand(nextCommand);
        setCursorIndex(nextCommand.length);
        await sleep(index === 3 ? 24 : 14);
      }

      await sleep(25);
      for (let index = MISTYPED_COMMAND.length - 1; index >= CORRECTION_INDEX; index -= 1) {
        if (isCancelled) return;
        setCursorIndex(index);
        await sleep(18);
      }

      await sleep(25);
      if (isCancelled) return;
      setCommand(FINAL_COMMAND);
      setCursorIndex(FINAL_COMMAND.length);

      await sleep(40);
      if (isCancelled) return;
      setHasSubmitted(true);

      for (let index = 0; index < outputLines.length + 1; index += 1) {
        if (isCancelled) return;
        setVisibleOutputCount(index + 1);
        await sleep((outputLines[index] ?? websiteLine) === "" ? 16 : 28);
      }

      await sleep(80);
      if (!isCancelled) await finishIntro();
    }

    void playIntro();

    return () => {
      isCancelled = true;
    };
  }, [websiteLine]);

  function skipIntro() {
    trackEvent("intro_skipped", { elapsed_ms: elapsedSinceStart() });
    markIntroSeen();
    setIsExiting(true);
    window.setTimeout(() => setIsVisible(false), 180);
  }

  if (!isVisible) return null;

  const commandBeforeCursor = command.slice(0, cursorIndex);
  const commandAfterCursor = command.slice(cursorIndex);

  return (
    <aside
      className={`launch-terminal${isExiting ? " launch-terminal-exit" : ""}`}
      aria-labelledby="launch-terminal-title"
      data-launch-terminal
    >
      <button className="launch-terminal-skip" type="button" onClick={skipIntro}>
        {copy.skip}
      </button>

      <div className="launch-terminal-window">
        <div className="launch-terminal-bar">
          <div className="launch-terminal-controls" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p id="launch-terminal-title">{copy.title}</p>
        </div>

        <div className="launch-terminal-body">
          <p className="launch-terminal-directory">{DIRECTORY_LABEL}</p>
          <div className="launch-terminal-line">
            <span className="launch-terminal-prompt">$</span>
            <span className="launch-terminal-command" aria-label={hasSubmitted ? FINAL_COMMAND : command}>
              <span>{commandBeforeCursor}</span>
              {!hasSubmitted ? <span className="launch-terminal-cursor" aria-hidden="true" /> : null}
              <span>{commandAfterCursor}</span>
            </span>
          </div>

          {hasSubmitted ? (
            <div className="launch-terminal-output" role="status" aria-live="polite">
              {[...outputLines, websiteLine].slice(0, visibleOutputCount).map((line, index) => (
                <p
                  className={line.includes("Ready") || line.includes("Website") ? "launch-terminal-success" : undefined}
                  key={`${line}-${index}`}
                >
                  {line || "\u00a0"}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
