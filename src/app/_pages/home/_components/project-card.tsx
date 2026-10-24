import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProjectVisual } from "@/components/project-visual";
import { getWorkPath, type Locale } from "@/lib/i18n";
import type { ProjectCaseStudy } from "@/lib/portfolio";
import { formatCopy, type UiCopy } from "@/lib/ui-copy";

export function ProjectCard({
  copy,
  locale,
  project,
  projectVisualCopy,
  index,
}: {
  copy: UiCopy["projectCard"];
  locale: Locale;
  project: ProjectCaseStudy;
  projectVisualCopy: UiCopy["projectVisual"];
  index: number;
}) {
  return (
    <article className="project-card">
      <div className="project-card-visual-wrap">
        <div className="project-index">0{index + 1}</div>
        {project.media ? (
          <div className="project-card-media" role="img" aria-label={project.media.alt}>
            <Image
              src={project.media.src}
              alt=""
              fill
              priority={index === 0}
              sizes={index === 0 ? "(max-width: 760px) 100vw, 58vw" : "(max-width: 760px) 100vw, 50vw"}
            />
            {project.media.caption ? <span>{project.media.caption}</span> : null}
          </div>
        ) : (
          <ProjectVisual
            copy={projectVisualCopy}
            type={project.visual}
            label={project.visualLabel}
            compact
          />
        )}
      </div>
      <div className="project-card-content">
        <p className="project-kicker">{project.kicker}</p>
        <h3 className="project-title">{project.cardHeadline}</h3>
        <p className="project-summary">{project.summary}</p>
        <div
          className="project-tags"
          aria-label={formatCopy(copy.technologiesAria, { title: project.title })}
        >
          {project.technologies.slice(0, 4).map((technology) => (
            <span className="portfolio-chip" key={technology}>
              {technology}
            </span>
          ))}
        </div>
      </div>
      <div className="project-card-footer">
        <Link
          href={getWorkPath(locale, project.slug)}
        >
          {copy.readCaseStudy}
          <span className="sr-only">: {project.title}</span>
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </article>
  );
}
