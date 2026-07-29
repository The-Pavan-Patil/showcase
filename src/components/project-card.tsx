"use client";

import { Card, Chip } from "@heroui/react";
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
    <Card className="project-card" variant="default">
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
      <Card.Content className="project-card-content">
        <p className="project-kicker">{project.kicker}</p>
        <Card.Title className="project-title">{project.cardHeadline}</Card.Title>
        <Card.Description className="project-summary">{project.summary}</Card.Description>
        <div
          className="project-tags"
          aria-label={formatCopy(copy.technologiesAria, { title: project.title })}
        >
          {project.technologies.slice(0, 4).map((technology) => (
            <Chip key={technology} size="sm" variant="secondary">
              {technology}
            </Chip>
          ))}
        </div>
      </Card.Content>
      <Card.Footer className="project-card-footer">
        <Link
          href={getWorkPath(locale, project.slug)}
          aria-label={formatCopy(copy.readCaseStudyAria, { title: project.title })}
        >
          {copy.readCaseStudy}
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </Card.Footer>
    </Card>
  );
}
