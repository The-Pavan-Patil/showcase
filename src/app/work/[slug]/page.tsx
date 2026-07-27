import { Chip } from "@heroui/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Quote, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { ProjectVisual } from "@/components/project-visual";
import { SiteFooter } from "@/components/site-footer";
import {
  getNextProject,
  getProjectBySlug,
  projects,
  type CaseStudyArticle,
  type CaseStudySection,
  type CaseStudyTextBlock,
  type ProjectCaseStudy,
} from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";

type WorkPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Work not found", robots: { index: false, follow: false } };

  const description = project.caseStudy?.oneLineSummary ?? project.summary;
  const image = project.media
    ? { url: project.media.src, width: 1672, height: 941, alt: project.media.alt }
    : { url: "/og.png", width: 1200, height: 630, alt: `${project.title} case study` };

  return {
    title: project.title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      url: `/work/${project.slug}`,
      title: `${project.title} — Pavan Patil`,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [image.url],
    },
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const article = getCaseStudyArticle(project);
  const nextProject = getNextProject(project.slug);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/work/${project.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: article.oneLineSummary,
          url: canonicalUrl,
          creator: { "@type": "Person", name: "Pavan Patil" },
          keywords: project.technologies.join(", "),
          ...(project.media ? { image: `${siteUrl}${project.media.src}` } : {}),
        }}
      />
      <main id="main-content" className="case-study-main">
        <section className="case-hero" aria-labelledby="case-title">
          <Container>
            <Link className="back-link" href="/#work">
              <ArrowLeft aria-hidden="true" size={16} />
              Selected work
            </Link>

            <div className="case-hero-grid">
              <div className="case-hero-copy">
                <p className="eyebrow">{project.kicker}</p>
                <h1 id="case-title">{project.title}</h1>
                <p className="case-lede">{article.oneLineSummary}</p>
                <p className="case-summary">{project.summary}</p>
                <div className="case-tags" aria-label={`${project.title} technologies`}>
                  {project.technologies.map((technology) => (
                    <Chip key={technology} variant="secondary">
                      {technology}
                    </Chip>
                  ))}
                </div>
              </div>

              <dl className="case-facts">
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Experience context</dt>
                  <dd>{project.experienceContext}</dd>
                </div>
                <div>
                  <dt>Client / company</dt>
                  <dd>{project.client}</dd>
                </div>
                <div>
                  <dt>Article length</dt>
                  <dd>{article.sections.length} sections</dd>
                </div>
              </dl>
            </div>

            {project.media ? (
              <figure className="case-media">
                <Image
                  src={project.media.src}
                  alt={project.media.alt}
                  fill
                  priority
                  sizes="(max-width: 760px) 100vw, 72rem"
                />
                {project.media.caption ? <figcaption>{project.media.caption}</figcaption> : null}
              </figure>
            ) : (
              <ProjectVisual type={project.visual} label={project.visualLabel} />
            )}
          </Container>
        </section>

        <section className="case-metrics" aria-label={`${project.title} project facts`}>
          <Container>
            <div className="case-metrics-grid">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="case-longform" aria-label={`${project.title} case study article`}>
          <Container className="case-longform-grid">
            <aside className="case-toc">
              <p className="eyebrow">Article map</p>
              <nav aria-label={`${project.title} case study sections`}>
                <ol>
                  {article.sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>{section.title}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <article className="case-article">
              {article.sections.map((section, index) => (
                <CaseArticleSection key={section.id} section={section} index={index} />
              ))}

              {article.closingQuote ? (
                <blockquote className="case-closing-quote">
                  <Quote aria-hidden="true" size={24} />
                  <p>{article.closingQuote}</p>
                </blockquote>
              ) : null}
            </article>
          </Container>
        </section>

        <section className="contribution-section">
          <Container>
            <div className="contribution-card">
              <div>
                <p className="eyebrow">My contribution</p>
                <h2>What I owned across this build.</h2>
              </div>
              <ul>
                {project.contributions.map((contribution) => (
                  <li key={contribution}>
                    <CheckCircle2 aria-hidden="true" size={19} />
                    {contribution}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section className="next-project-section">
          <Container>
            <p className="eyebrow">Next case study</p>
            <Link href={`/work/${nextProject.slug}`}>
              <span>{nextProject.title}</span>
              <strong>{nextProject.cardHeadline}</strong>
              <ArrowRight aria-hidden="true" size={26} />
            </Link>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function getCaseStudyArticle(project: ProjectCaseStudy): CaseStudyArticle {
  return (
    project.caseStudy ?? {
      oneLineSummary: project.summary,
      sections: [
        {
          id: "challenge",
          title: "The challenge",
          blocks: [{ type: "paragraph", text: project.challenge }],
        },
        {
          id: "approach",
          title: "The approach",
          blocks: [{ type: "paragraph", text: project.approach }],
        },
        {
          id: "outcome",
          title: "The outcome",
          blocks: [
            { type: "paragraph", text: project.outcome },
            { type: "list", items: project.contributions },
          ],
        },
      ],
    }
  );
}

function CaseArticleSection({
  section,
  index,
}: {
  section: CaseStudySection;
  index: number;
}) {
  return (
    <section className="case-article-section" id={section.id} aria-labelledby={`${section.id}-heading`}>
      <span className="case-section-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="case-section-body">
        {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
        <h2 id={`${section.id}-heading`}>{section.title}</h2>
        <div className="case-block-stack">
          {section.blocks.map((block, blockIndex) => (
            <CaseBlock block={block} key={`${section.id}-block-${blockIndex}`} />
          ))}
        </div>

        {section.subsections?.length ? (
          <div className="case-subsections">
            {section.subsections.map((subsection) => (
              <section className="case-subsection" key={`${section.id}-${subsection.title}`}>
                <h3>{subsection.title}</h3>
                <div className="case-block-stack">
                  {subsection.blocks.map((block, blockIndex) => (
                    <CaseBlock block={block} key={`${section.id}-${subsection.title}-${blockIndex}`} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CaseBlock({ block }: { block: CaseStudyTextBlock }) {
  if (block.type === "paragraph") return <p>{block.text}</p>;

  if (block.type === "quote") {
    return (
      <blockquote className="case-inline-quote">
        <Quote aria-hidden="true" size={18} />
        <p>{block.text}</p>
      </blockquote>
    );
  }

  if (block.type === "callout") {
    return (
      <aside className="case-callout">
        <Sparkles aria-hidden="true" size={18} />
        <div>
          <strong>{block.title}</strong>
          <p>{block.text}</p>
        </div>
      </aside>
    );
  }

  if (block.type === "orderedList") {
    return (
      <ol className="case-ordered-list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="case-block-list">
      {block.items.map((item) => (
        <li key={item}>
          <CheckCircle2 aria-hidden="true" size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
