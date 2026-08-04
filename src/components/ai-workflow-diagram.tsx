"use client";

import { useEffect, useRef } from "react";

import type { UiCopy } from "@/lib/ui-copy";

type WorkflowCopy = UiCopy["home"]["aiWorkflow"];

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
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const diagram = diagramRef.current;
    if (!diagram) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const segmentProgress = (progress: number, start: number, end: number) =>
      Math.min(1, Math.max(0, (progress - start) / (end - start)));

    const updateProgress = () => {
      animationFrame = 0;
      const bounds = diagram.getBoundingClientRect();
      const startLine = window.innerHeight * 0.78;
      const endLine = window.innerHeight * 0.25;
      const travel = Math.max(1, bounds.height + startLine - endLine);
      const progress = reducedMotion.matches
        ? 1
        : Math.min(1, Math.max(0, (startLine - bounds.top) / travel));

      const percentage = (start: number, end: number) =>
        `${segmentProgress(progress, start, end) * 100}%`;
      const number = (start: number, end: number) =>
        String(segmentProgress(progress, start, end));

      diagram.style.setProperty("--workflow-plan-one", percentage(0, 0.09));
      diagram.style.setProperty("--workflow-plan-two", percentage(0.09, 0.18));
      diagram.style.setProperty("--workflow-split-progress", number(0.18, 0.32));
      diagram.style.setProperty("--workflow-branch-progress", percentage(0.32, 0.7));
      diagram.style.setProperty("--workflow-merge-progress", number(0.7, 0.84));
      diagram.style.setProperty("--workflow-finish-progress", percentage(0.84, 1));
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  return (
    <div
      ref={diagramRef}
      className="ai-workflow-map"
      aria-label={workflow.pipelineAria}
      role="group"
    >
      <div className="ai-workflow-plan-column">
        {workflow.planning.map((step) => (
          <article className="ai-workflow-pill" key={`${step.label}-${step.tool}`}>
            <h3>{step.label}</h3>
            <p>{step.tool}</p>
          </article>
        ))}
      </div>

      <WorkflowWire direction="split" />

      <div className="ai-workflow-branches">
        {workflow.branches.map((branch) => (
          <article className="ai-workflow-branch" key={branch.task}>
            <span className="ai-workflow-task-pill">{branch.task}</span>
            <div className="ai-workflow-branch-sequence">
              {branch.steps.map((step) => (
                <div
                  className="ai-workflow-pill ai-workflow-branch-step"
                  key={`${branch.task}-${step.label}`}
                >
                  <h3>{step.label}</h3>
                  <p>{step.tool}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <WorkflowWire direction="merge" />

      <div className="ai-workflow-finish">
        <span className="ai-workflow-merge-label">{workflow.merge}</span>
        <span className="ai-workflow-finish-wire" aria-hidden="true" />
        <article className="ai-workflow-pill ai-workflow-ship-pill">
          <h3>{workflow.ship.label}</h3>
          <p>{workflow.ship.tool}</p>
        </article>
      </div>
    </div>
  );
}
