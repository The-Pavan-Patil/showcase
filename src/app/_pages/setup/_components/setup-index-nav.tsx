"use client";

import type { HTMLAttributes, MouseEvent } from "react";

import { AI_WORKFLOW_COMPLETE_EVENT } from "@/components/ai-workflow-diagram";

/**
 * The hero's "on this page" index. A link to a section past the pinned
 * workflow diagram finishes the diagram first, so the browser's smooth
 * scroll runs against the final layout instead of being cut short when the
 * diagram's runway collapses mid-scroll.
 */
export function SetupIndexNav({ children, ...rest }: HTMLAttributes<HTMLElement>) {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;

    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    const track = document.querySelector(".ai-workflow-scroll-track");
    if (!target || !track) return;

    if (track.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) {
      window.dispatchEvent(new Event(AI_WORKFLOW_COMPLETE_EVENT));
    }
  };

  return (
    <nav {...rest} onClick={handleClick}>
      {children}
    </nav>
  );
}
