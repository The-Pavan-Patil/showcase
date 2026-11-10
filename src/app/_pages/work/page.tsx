import { ArrowRight, ArrowUpRight, CheckCircle2, Quote, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { getPersonReference } from "@/lib/structured-data";
import { ProjectVisual } from "@/components/project-visual";
import { SiteFooter } from "@/components/site-footer";
import { ArticleMap } from "./_components/article-map";
import { CaseReveal } from "./_components/case-reveal";
import { WorkTechnologyChip } from "./_components/work-technology-chip";
import {
  getAlternateLanguages,
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
import { getMarkdownAlternate, getOgImage } from "@/lib/metadata";
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
    ? {
        url: project.media.src,
        width: project.media.width,
        height: project.media.height,
        alt: project.media.alt,
      }
    : getOgImage(locale, formatCopy(ui.work.caseStudyAlt, { title: project.title }));

  return {
    title: project.title,
    description,
    alternates: {
      canonical,
      languages: getAlternateLanguages(pathname),
      ...getMarkdownAlternate(locale, `${pathname}.md`),
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
          inLanguage: locale,
          author: getPersonReference(siteUrl),
          creator: getPersonReference(siteUrl),
          keywords: project.technologies.join(", "),
          ...(project.media ? { image: `${siteUrl}${project.media.src}` } : {}),
        }}
      />
      <main id="main-content" className="case-study-main">
        <section className="case-hero" aria-labelledby="case-title">
          <Container>
            <div className="case-hero-grid">
              <div className="case-hero-copy">
                <p className="eyebrow">{project.kicker}</p>
                <h1 id="case-title">{project.title}</h1>
                <p className="case-lede">{article.oneLineSummary}</p>
                <div
                  className="case-tags"
                  aria-label={formatCopy(ui.work.technologiesAria, { title: project.title })}
                >
                  {project.technologies.map((technology) => (
                    <WorkTechnologyChip key={technology} label={technology} />
                  ))}
                </div>
                {project.liveUrl ? (
                  <a
                    className="case-live-link"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={formatCopy(ui.work.liveSiteAria, { title: project.title })}
                  >
                    <span>{ui.work.liveSite}</span>
                    <ArrowUpRight aria-hidden="true" size={15} />
                  </a>
                ) : null}
              </div>

              <div className="case-hero-visual">
                {project.media ? (
                  <figure className="case-media">
                    {/* Sized from the image itself, so the frame follows its aspect ratio. */}
                    <Image
                      src={project.media.src}
                      alt={project.media.alt}
                      width={project.media.width}
                      height={project.media.height}
                      priority
                      sizes="(max-width: 900px) 100vw, 52vw"
                    />
                  </figure>
                ) : (
                  <ProjectVisual
                    copy={ui.projectVisual}
                    type={project.visual}
                    label={project.visualLabel}
                  />
                )}
              </div>
            </div>

            <dl
              className="case-facts"
              aria-label={formatCopy(ui.work.factsAria, { title: project.title })}
            >
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
          </Container>
        </section>

        <section
          className="case-longform"
          aria-label={formatCopy(ui.work.articleAria, { title: project.title })}
        >
          <Container className="case-longform-grid">
            <article className="case-article">
              {article.sections.map((section, index) => (
                <CaseArticleSection key={section.id} section={section} index={index} />
              ))}

              {article.closingQuote ? (
                <blockquote className="case-closing-quote" data-reveal>
                  <Quote aria-hidden="true" size={24} />
                  <p>{article.closingQuote}</p>
                </blockquote>
              ) : null}
            </article>

            <ArticleMap
              slug={project.slug}
              heading={ui.work.articleMap}
              navigationLabel={formatCopy(ui.work.sectionsNavigationAria, { title: project.title })}
              sections={article.sections.map((section) => ({
                id: section.id,
                title: section.title,
                preview: getArticleMapPreview(section),
              }))}
            />
          </Container>
        </section>

        <section className="contribution-section">
          <Container>
            <div className="contribution-card" data-reveal>
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

        <section className="next-project-section" aria-labelledby="next-project-title">
          <Container>
            <Link
              className="next-project-card"
              href={getWorkPath(locale, nextProject.slug)}
              data-reveal
            >
              <div className="next-project-copy">
                <p className="eyebrow">{ui.work.nextCaseStudy}</p>
                <h2 id="next-project-title">{nextProject.title}</h2>
                <p className="next-project-headline">{nextProject.cardHeadline}</p>
                <span className="next-project-arrow" aria-hidden="true">
                  <ArrowRight size={22} />
                </span>
              </div>
              <div className="next-project-media">
                {nextProject.media ? (
                  <Image
                    src={nextProject.media.src}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                  />
                ) : (
                  <ProjectVisual
                    copy={ui.projectVisual}
                    type={nextProject.visual}
                    label={nextProject.visualLabel}
                    compact
                  />
                )}
              </div>
            </Link>
          </Container>
        </section>
        <CaseReveal />
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

function getArticleMapPreview(section: CaseStudySection) {
  const block = section.blocks[0] ?? section.subsections?.[0]?.blocks[0];

  if (!block) return section.title;
  if (block.type === "paragraph" || block.type === "quote") return block.text;
  if (block.type === "callout") return block.text;
  return block.items[0] ?? section.title;
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
      <span className="case-section-number" data-reveal>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="case-section-body">
        <header className="case-section-head" data-reveal>
          {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
          <h2 id={`${section.id}-heading`}>{section.title}</h2>
        </header>
        <div className="case-block-stack">
          {section.blocks.map((block, blockIndex) => (
            <CaseBlock block={block} key={`${section.id}-block-${blockIndex}`} />
          ))}
        </div>

        {section.subsections?.length ? (
          <div className="case-subsections">
            {section.subsections.map((subsection) => (
              <section className="case-subsection" key={`${section.id}-${subsection.title}`}>
                <h3 data-reveal>{subsection.title}</h3>
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
  if (block.type === "paragraph") return <p data-reveal>{block.text}</p>;

  if (block.type === "quote") {
    return (
      <blockquote className="case-inline-quote" data-reveal>
        <Quote aria-hidden="true" size={18} />
        <p>{block.text}</p>
      </blockquote>
    );
  }

  if (block.type === "callout") {
    return (
      <aside className="case-callout" data-reveal>
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
      <ol className="case-ordered-list" data-reveal>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="case-block-list" data-reveal>
      {block.items.map((item) => (
        <li key={item}>
          <CheckCircle2 aria-hidden="true" size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
