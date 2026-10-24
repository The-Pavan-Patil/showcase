"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type ArticleMapSection = {
  id: string;
  title: string;
  preview: string;
};

const BAR_WIDTHS = [52, 40, 30, 20] as const;

function getBarWidth(index: number, interactionIndex: number | null) {
  if (interactionIndex === null) return 12;
  return BAR_WIDTHS[Math.abs(index - interactionIndex)] ?? 12;
}

export function ArticleMap({
  heading,
  navigationLabel,
  sections,
  slug,
}: {
  heading: string;
  navigationLabel: string;
  sections: ArticleMapSection[];
  slug: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const interactionIndex = hoveredIndex ?? focusedIndex;
  const readSectionsRef = useRef(new Set<string>());

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section !== null);

    if (!sectionElements.length) return;

    let animationFrame: number | null = null;

    const updateActiveSection = () => {
      animationFrame = null;
      const readingLine = window.innerHeight * 0.3;
      let nextSection = sectionElements[0].id;

      for (const section of sectionElements) {
        if (section.getBoundingClientRect().top > readingLine) break;
        nextSection = section.id;
      }

      setActiveSection((currentSection) =>
        currentSection === nextSection ? currentSection : nextSection,
      );
    };

    const scheduleUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    const updateFromHash = () => {
      const id = window.location.hash.slice(1);
      if (sections.some((section) => section.id === id)) setActiveSection(id);
    };
    updateFromHash();
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [sections]);

  useEffect(() => {
    if (!activeSection) return;

    const readSections = readSectionsRef.current;
    if (readSections.has(activeSection)) return;

    readSections.add(activeSection);
    trackEvent("case_study_section_read", {
      slug,
      section: activeSection,
      depth: sections.findIndex((section) => section.id === activeSection) + 1,
      total: sections.length,
    });
  }, [activeSection, sections, slug]);

  return (
    <aside className="article-map">
      <p className="sr-only">{heading}</p>
      <nav aria-label={navigationLabel}>
        <ol
          className={interactionIndex === null ? undefined : "is-interacting"}
          onPointerLeave={() => setHoveredIndex(null)}
        >
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isTarget = interactionIndex === index;
            const barStyle = {
              "--article-map-bar-width": `${getBarWidth(index, interactionIndex)}px`,
            } as CSSProperties;

            return (
              <li key={section.id} onPointerEnter={() => setHoveredIndex(index)}>
                <a
                  aria-current={isActive ? "location" : undefined}
                  className={[isActive ? "is-current" : "", isTarget ? "is-target" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  href={`#${section.id}`}
                  onBlur={() => setFocusedIndex(null)}
                  onClick={() => setActiveSection(section.id)}
                  onFocus={() => setFocusedIndex(index)}
                  style={barStyle}
                >
                  <span aria-hidden="true" className="article-map-bar" />
                  <span className="article-map-mobile-label">{section.title}</span>
                </a>

                {isTarget ? (
                  <div aria-hidden="true" className="article-map-preview">
                    <strong>{section.title}</strong>
                    <p>{section.preview}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
