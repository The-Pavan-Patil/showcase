"use client";

import { useEffect, useState } from "react";

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
  "✓ Starting...",
  "✓ Ready in 1387ms",
  "Website: https://pavanpatil.dev",
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

export function LaunchTerminal() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [command, setCommand] = useState("");
  const [cursorIndex, setCursorIndex] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [visibleOutputCount, setVisibleOutputCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function finishIntro(delay = 560) {
      markIntroSeen();
      setIsExiting(true);
      await sleep(delay);
      if (!isCancelled) setIsVisible(false);
    }

    async function playIntro() {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const forceIntro = shouldForceIntro();

      if ((!forceIntro && hasSeenIntro()) || prefersReducedMotion) {
        markIntroSeen();
        setIsVisible(false);
        return;
      }

      await sleep(420);

      for (let index = 0; index < MISTYPED_COMMAND.length; index += 1) {
        if (isCancelled) return;
        const nextCommand = MISTYPED_COMMAND.slice(0, index + 1);
        setCommand(nextCommand);
        setCursorIndex(nextCommand.length);
        await sleep(index === 3 ? 150 : 74);
      }

      await sleep(420);
      for (let index = MISTYPED_COMMAND.length - 1; index >= CORRECTION_INDEX; index -= 1) {
        if (isCancelled) return;
        setCursorIndex(index);
        await sleep(105);
      }

      await sleep(260);
      if (isCancelled) return;
      setCommand(FINAL_COMMAND);
      setCursorIndex(CORRECTION_INDEX + 1);

      await sleep(300);
      if (isCancelled) return;
      setCursorIndex(FINAL_COMMAND.length);

      await sleep(240);
      if (isCancelled) return;
      setHasSubmitted(true);

      for (let index = 0; index < outputLines.length; index += 1) {
        if (isCancelled) return;
        setVisibleOutputCount(index + 1);
        await sleep(outputLines[index] === "" ? 90 : 190);
      }

      await sleep(700);
      if (!isCancelled) await finishIntro();
    }

    void playIntro();

    return () => {
      isCancelled = true;
    };
  }, []);

  function skipIntro() {
    markIntroSeen();
    setIsExiting(true);
    window.setTimeout(() => setIsVisible(false), 180);
  }

  if (!isVisible) return null;

  const commandBeforeCursor = command.slice(0, cursorIndex);
  const commandAfterCursor = command.slice(cursorIndex);

  return (
    <div
      className={`launch-terminal${isExiting ? " launch-terminal-exit" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-terminal-title"
    >
      <button className="launch-terminal-skip" type="button" onClick={skipIntro}>
        Skip
      </button>

      <div className="launch-terminal-window">
        <div className="launch-terminal-bar">
          <div className="launch-terminal-controls" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p id="launch-terminal-title">pavanpatil.dev launch</p>
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
            <div className="launch-terminal-output" aria-live="polite">
              {outputLines.slice(0, visibleOutputCount).map((line, index) => (
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
    </div>
  );
}
