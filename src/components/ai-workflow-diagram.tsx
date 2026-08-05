"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";

import type { UiCopy } from "@/lib/ui-copy";

type WorkflowCopy = UiCopy["home"]["aiWorkflow"];
type WorkflowLifecycle = "idle" | "pinned" | "completed" | "collapsed";

function WorkflowWire({ direction }: { direction: "split" | "merge" }) {
  const paths = direction === "split"
    ? [
        "M 450 0 V 18 C 450 30 438 32 426 32 H 162 C 150 32 150 42 150 64",
        "M 450 0 V 64",
        "M 450 0 V 18 C 450 30 462 32 474 32 H 738 C 750 32 750 42 750 64",
      ]
    : [
        "M 150 0 V 22 C 150 34 162 36 174 36 H 426 C 438 36 450 44 450 56 V 64",
        "M 450 0 V 64",
        "M 750 0 V 22 C 750 34 738 36 726 36 H 474 C 462 36 450 44 450 56 V 64",
      ];

  return (
    <svg
      aria-hidden="true"
      className={`ai-workflow-wire ai-workflow-wire-${direction}`}
      preserveAspectRatio="none"
      viewBox="0 0 900 64"
    >
      {paths.map((path) => (
        <g key={path}>
          <path className="ai-workflow-wire-base" d={path} />
          <path
            className="ai-workflow-wire-accent"
            d={path}
            pathLength={1}
          />
        </g>
      ))}
    </svg>
  );
}

export function AiWorkflowDiagram({ workflow }: { workflow: WorkflowCopy }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const diagram = diagramRef.current;
    if (!track || !diagram) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let resizeFrame = 0;
    let lifecycle: WorkflowLifecycle = "idle";
    let activationScrollY = 0;
    let entryScrollY = 0;
    let furthestScrollY = window.scrollY;
    let lastScrollY = window.scrollY;
    let progress = 0;
    let scrollDistance = 0;
    let scaledHeight = 0;
    let stickyTop = 0;

    const stageNodes = (stage: string) =>
      diagram.querySelectorAll<HTMLElement>(`[data-workflow-stage="${stage}"]`);

    const setLifecycle = (nextLifecycle: WorkflowLifecycle) => {
      lifecycle = nextLifecycle;
      track.dataset.workflowLifecycle = nextLifecycle;
      track.classList.toggle("is-workflow-pinned", nextLifecycle === "pinned");
      track.classList.toggle(
        "is-workflow-completed",
        nextLifecycle === "completed",
      );
      track.classList.toggle(
        "is-workflow-collapsed",
        nextLifecycle === "collapsed",
      );
    };

    const segmentProgress = (value: number, start: number, end: number) =>
      Math.min(1, Math.max(0, (value - start) / (end - start)));

    const setStageComplete = (stage: string, isComplete: boolean) => {
      stageNodes(stage).forEach((node) => {
        node.classList.toggle("is-workflow-complete", isComplete);
      });
    };

    const updateProgress = (nextProgress: number) => {
      const percentage = (start: number, end: number) =>
        `${segmentProgress(nextProgress, start, end) * 100}%`;
      const number = (start: number, end: number) =>
        String(segmentProgress(nextProgress, start, end));

      diagram.style.setProperty("--workflow-plan-one", percentage(0, 0.08));
      diagram.style.setProperty("--workflow-plan-two", percentage(0.08, 0.16));
      diagram.style.setProperty("--workflow-split-progress", number(0.16, 0.28));
      diagram.style.setProperty("--workflow-branch-progress", percentage(0.28, 0.55));
      diagram.style.setProperty("--workflow-retry-progress", percentage(0.55, 0.65));
      diagram.style.setProperty("--workflow-merge-progress", number(0.86, 0.94));
      diagram.style.setProperty("--workflow-finish-progress", percentage(0.94, 1));

      setStageComplete("start", true);
      setStageComplete("plan-one", nextProgress >= 0.08);
      setStageComplete("plan-two", nextProgress >= 0.16);
      setStageComplete("split", nextProgress >= 0.28);
      setStageComplete("branch-build", nextProgress >= 0.37);
      setStageComplete("branch-review", nextProgress >= 0.46);
      setStageComplete("branch-test", nextProgress >= 0.55);
      setStageComplete("retry-test", nextProgress >= 0.79);
      setStageComplete("merge", nextProgress >= 0.94);
      setStageComplete("finish", nextProgress >= 1);

      const retryBranch = diagram.querySelector<HTMLElement>(
        '[data-workflow-branch="t3"]',
      );
      retryBranch?.classList.toggle(
        "has-workflow-test-failed",
        nextProgress >= 0.55 && nextProgress < 0.79,
      );
      retryBranch?.classList.toggle(
        "has-workflow-build-retried",
        nextProgress >= 0.65,
      );
      retryBranch?.classList.toggle(
        "has-workflow-review-retried",
        nextProgress >= 0.72,
      );
      retryBranch?.classList.toggle(
        "has-workflow-test-passed",
        nextProgress >= 0.79,
      );
    };

    const configureScrollTrack = () => {
      const naturalHeight = diagram.offsetHeight;
      const isMobile = window.innerWidth <= 760;
      const topClearance = isMobile ? 16 : 88;
      const bottomClearance = isMobile ? 96 : 16;
      const usableHeight = Math.max(
        180,
        window.innerHeight - topClearance - bottomClearance,
      );
      const scale = Math.min(1, usableHeight / naturalHeight);
      scaledHeight = naturalHeight * scale;
      stickyTop = topClearance + Math.max(0, (usableHeight - scaledHeight) / 2);
      scrollDistance = usableHeight * 2;

      track.style.setProperty("--workflow-scale", String(scale));
      track.style.setProperty("--workflow-scaled-height", `${scaledHeight}px`);
      track.style.setProperty("--workflow-sticky-top", `${stickyTop}px`);
      track.style.setProperty("--workflow-scroll-distance", `${scrollDistance}px`);
      track.style.setProperty(
        "--workflow-track-height",
        `${scaledHeight + scrollDistance}px`,
      );
      track.classList.add("is-workflow-scroll-ready");

      if (lifecycle === "pinned") {
        activationScrollY = furthestScrollY - progress * scrollDistance;
      } else if (lifecycle === "idle") {
        entryScrollY = track.getBoundingClientRect().top + window.scrollY - stickyTop;
      }
    };

    const collapseTrack = (compensateScroll: boolean) => {
      if (lifecycle === "collapsed") return;
      const contentAnchor = track.parentElement?.nextElementSibling;
      const anchorTopBefore = contentAnchor?.getBoundingClientRect().top;
      setLifecycle("collapsed");

      if (compensateScroll) {
        const anchorTopAfter = contentAnchor?.getBoundingClientRect().top;
        const scrollCorrection =
          anchorTopBefore !== undefined && anchorTopAfter !== undefined
            ? anchorTopAfter - anchorTopBefore
            : -scrollDistance;

        window.scrollBy({
          top: scrollCorrection,
          left: 0,
          behavior: "instant",
        });
        lastScrollY = window.scrollY;
        furthestScrollY = window.scrollY;
      }
    };

    const finishAnimation = () => {
      if (lifecycle !== "pinned") return;
      setLifecycle("completed");
    };

    const updateFromScroll = () => {
      animationFrame = 0;
      const currentScrollY = window.scrollY;
      const isMovingDown = currentScrollY > lastScrollY;

      if (lifecycle === "completed") {
        if (isMovingDown && diagram.getBoundingClientRect().bottom <= 0) {
          collapseTrack(true);
        }
        lastScrollY = window.scrollY;
        return;
      }

      if (lifecycle === "collapsed") {
        lastScrollY = currentScrollY;
        return;
      }

      if (reducedMotion.matches) {
        progress = 1;
        updateProgress(progress);
        collapseTrack(false);
        lastScrollY = currentScrollY;
        return;
      }

      if (
        lifecycle === "idle"
        && isMovingDown
        && lastScrollY <= entryScrollY
        && currentScrollY >= entryScrollY
      ) {
        setLifecycle("pinned");
        activationScrollY = entryScrollY;
        furthestScrollY = currentScrollY;
      }

      if (lifecycle === "pinned") {
        furthestScrollY = Math.max(furthestScrollY, currentScrollY);
        const nextProgress = Math.min(
          1,
          Math.max(0, (furthestScrollY - activationScrollY) / scrollDistance),
        );

        if (nextProgress > progress) {
          progress = nextProgress;
          updateProgress(progress);
        }

        if (progress >= 1) finishAnimation();
      }

      lastScrollY = currentScrollY;
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateFromScroll);
    };

    const handleResize = () => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        configureScrollTrack();
        updateFromScroll();
      });
    };

    const handleReducedMotionChange = () => {
      if (!reducedMotion.matches) return;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      progress = 1;
      updateProgress(progress);
      collapseTrack(false);
    };

    setLifecycle("idle");
    updateProgress(0);
    configureScrollTrack();
    updateFromScroll();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    reducedMotion.addEventListener("change", handleReducedMotionChange);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", handleResize);
      reducedMotion.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="ai-workflow-scroll-track"
      data-workflow-lifecycle="idle"
    >
      <div className="ai-workflow-sticky-shell">
        <div
          ref={diagramRef}
          className="ai-workflow-map"
          aria-label={workflow.pipelineAria}
          role="group"
        >
          <div className="ai-workflow-plan-column">
            {workflow.planning.map((step, index) => (
              <article
                className="ai-workflow-pill"
                data-workflow-stage={
                  index === 0 ? "start" : `plan-${index === 1 ? "one" : "two"}`
                }
                key={`${step.label}-${step.tool}`}
              >
                <h3>{step.label}</h3>
                <p>{step.tool}</p>
              </article>
            ))}
          </div>

          <WorkflowWire direction="split" />

          <div className="ai-workflow-branches">
            {workflow.branches.map((branch) => {
              const isRetryBranch = branch.task === "t3";

              return (
                <article
                  className="ai-workflow-branch"
                  data-workflow-branch={branch.task}
                  key={branch.task}
                >
                  <span
                    className="ai-workflow-task-pill"
                    data-workflow-stage="split"
                  >
                    {branch.task}
                  </span>
                  <div className="ai-workflow-branch-sequence">
                    {branch.steps.map((step, index) => {
                      const stage = (["build", "review", "test"] as const)[index];
                      const isRetryTest = isRetryBranch && stage === "test";

                      return (
                        <div
                          className="ai-workflow-pill ai-workflow-branch-step"
                          data-workflow-stage={
                            isRetryTest ? "retry-test" : `branch-${stage}`
                          }
                          data-workflow-retry-stage={
                            isRetryBranch ? stage : undefined
                          }
                          key={`${branch.task}-${step.label}`}
                        >
                          <h3>
                            {step.label}
                            {isRetryTest ? (
                              <span className="ai-workflow-test-status">
                                <span className="ai-workflow-test-status-failed">
                                  <AlertCircle aria-hidden="true" size={14} />
                                  <span className="sr-only">{workflow.testFailed}</span>
                                </span>
                                <span className="ai-workflow-test-status-passed">
                                  <CheckCircle2 aria-hidden="true" size={14} />
                                  <span className="sr-only">{workflow.testPassed}</span>
                                </span>
                              </span>
                            ) : null}
                          </h3>
                          <p>{step.tool}</p>
                        </div>
                      );
                    })}
                    {isRetryBranch ? (
                      <span className="ai-workflow-retry-wire" aria-hidden="true" />
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <WorkflowWire direction="merge" />

          <div className="ai-workflow-finish">
            <span className="ai-workflow-merge-label" data-workflow-stage="merge">
              {workflow.merge}
            </span>
            <span className="ai-workflow-finish-wire" aria-hidden="true" />
            <article
              className="ai-workflow-pill ai-workflow-ship-pill"
              data-workflow-stage="finish"
            >
              <h3>{workflow.ship.label}</h3>
              <p>{workflow.ship.tool}</p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
