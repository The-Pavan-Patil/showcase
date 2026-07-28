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
  getAlternateLanguages,
  getHashHref,
  getWorkPath,
  type Locale,
} from "@/lib/i18n";
import {
  getNextProject,
  getPortfolioContent,
  getProjectBySlug,
  getProjects,
  type CaseStudyArticle,
  type CaseStudySection,
  type CaseStudyTextBlock,
  type ProjectCaseStudy,
} from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";
import { formatCopy, uiCopyByLocale } from "@/lib/ui-copy";

export function getWorkStaticParams(locale: Locale) {
  return getProjects(locale).map((project) => ({ slug: project.slug }));
}

export async function generateWorkMetadata({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}): Promise<Metadata> {
  const ui = uiCopyByLocale[locale];
  const project = getProjectBySlug(locale, slug);

  if (!project) {
    return {
      title: ui.metadata.workNotFoundTitle,
      robots: { index: false, follow: false },
    };
  }

  const description = project.caseStudy?.oneLineSummary ?? project.summary;
  const pathname = `/work/${project.slug}`;
  const canonical = getWorkPath(locale, project.slug);
  const image = project.media
    ? { url: project.media.src, width: 1672, height: 941, alt: project.media.alt }
    : {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: formatCopy(ui.work.caseStudyAlt, { title: project.title }),
      };

  return {
    title: project.title,
    description,
    alternates: {
      canonical,
      languages: getAlternateLanguages(pathname),
    },
    openGraph: {
      type: "article",
      url: canonical,
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

export function WorkPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const ui = uiCopyByLocale[locale];
  const { profile, socialLinks } = getPortfolioContent(locale);
  const project = getProjectBySlug(locale, slug);
  if (!project) notFound();

  const article = getCaseStudyArticle(project, ui.work);
  const nextProject = getNextProject(locale, project.slug);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${getWorkPath(locale, project.slug)}`;

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
            <Link className="back-link" href={getHashHref(locale, "#work")}>
              <ArrowLeft aria-hidden="true" size={16} />
              {ui.work.selectedWork}
            </Link>

            <div className="case-hero-grid">
              <div className="case-hero-copy">
                <p className="eyebrow">{project.kicker}</p>
                <h1 id="case-title">{project.title}</h1>
                <p className="case-lede">{article.oneLineSummary}</p>
                <p className="case-summary">{project.summary}</p>
                <div
                  className="case-tags"
                  aria-label={formatCopy(ui.work.technologiesAria, { title: project.title })}
                >
                  {project.technologies.map((technology) => (
                    <Chip key={technology} variant="secondary">
                      {technology}
                    </Chip>
                  ))}
                </div>
              </div>

              <dl className="case-facts">
                <div>
                  <dt>{ui.work.role}</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>{ui.work.experienceContext}</dt>
                  <dd>{project.experienceContext}</dd>
                </div>
                <div>
                  <dt>{ui.work.clientCompany}</dt>
                  <dd>{project.client}</dd>
                </div>
                <div>
                  <dt>{ui.work.articleLengthLabel}</dt>
                  <dd>{formatCopy(ui.work.articleLength, { count: article.sections.length })}</dd>
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
              <ProjectVisual
                copy={ui.projectVisual}
                type={project.visual}
                label={project.visualLabel}
              />
            )}
          </Container>
        </section>

        <section
          className="case-metrics"
          aria-label={formatCopy(ui.work.factsAria, { title: project.title })}
        >
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

        <section
          className="case-longform"
          aria-label={formatCopy(ui.work.articleAria, { title: project.title })}
        >
          <Container className="case-longform-grid">
            <aside className="case-toc">
              <p className="eyebrow">{ui.work.articleMap}</p>
              <nav aria-label={formatCopy(ui.work.sectionsNavigationAria, { title: project.title })}>
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
                <p className="eyebrow">{ui.work.contributionEyebrow}</p>
                <h2>{ui.work.contributionTitle}</h2>
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
            <p className="eyebrow">{ui.work.nextCaseStudy}</p>
            <Link href={getWorkPath(locale, nextProject.slug)}>
              <span>{nextProject.title}</span>
              <strong>{nextProject.cardHeadline}</strong>
              <ArrowRight aria-hidden="true" size={26} />
            </Link>
          </Container>
        </section>
      </main>
      <SiteFooter
        copy={{ ...ui.footer, brandAria: ui.header.brandAria, navigation: ui.header.navigation }}
        locale={locale}
        profile={profile}
        socialLinks={socialLinks}
      />
    </>
  );
}

function getCaseStudyArticle(
  project: ProjectCaseStudy,
  copy: typeof uiCopyByLocale.en.work,
): CaseStudyArticle {
  return (
    project.caseStudy ?? {
      oneLineSummary: project.summary,
      sections: [
        {
          id: "challenge",
          title: copy.fallbackChallenge,
          blocks: [{ type: "paragraph", text: project.challenge }],
        },
        {
          id: "approach",
          title: copy.fallbackApproach,
          blocks: [{ type: "paragraph", text: project.approach }],
        },
        {
          id: "outcome",
          title: copy.fallbackOutcome,
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
