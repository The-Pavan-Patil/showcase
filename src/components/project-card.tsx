import { Card, Chip } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProjectVisual } from "@/components/project-visual";
import type { ProjectCaseStudy } from "@/lib/portfolio";

export function ProjectCard({ project, index }: { project: ProjectCaseStudy; index: number }) {
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
          <ProjectVisual type={project.visual} label={project.visualLabel} compact />
        )}
      </div>
      <Card.Content className="project-card-content">
        <p className="project-kicker">{project.kicker}</p>
        <Card.Title className="project-title">{project.cardHeadline}</Card.Title>
        <Card.Description className="project-summary">{project.summary}</Card.Description>
        <div className="project-tags" aria-label={`${project.title} technologies`}>
          {project.technologies.slice(0, 4).map((technology) => (
            <Chip key={technology} size="sm" variant="secondary">
              {technology}
            </Chip>
          ))}
        </div>
      </Card.Content>
      <Card.Footer className="project-card-footer">
        <Link href={`/work/${project.slug}`} aria-label={`Read the ${project.title} case study`}>
          View case study
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </Card.Footer>
    </Card>
  );
}
