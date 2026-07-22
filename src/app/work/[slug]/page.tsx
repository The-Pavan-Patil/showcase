import { Chip } from "@heroui/react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { ProjectVisual } from "@/components/project-visual";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNextProject, getProjectBySlug, projects } from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";

type WorkPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Work not found", robots: { index: false, follow: false } };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      url: `/work/${project.slug}`,
      title: `${project.title} — Pavan Patil`,
      description: project.summary,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${project.title} case study` }],
    },
    twitter: { card: "summary_large_image", title: project.title, description: project.summary, images: ["/og.png"] },
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const nextProject = getNextProject(project.slug);
  const canonicalUrl = `${getSiteUrl()}/work/${project.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: canonicalUrl,
          creator: { "@type": "Person", name: "Pavan Patil" },
          keywords: project.technologies.join(", "),
        }}
      />
      <SiteHeader />
      <main id="main-content" className="case-study-main">
        <section className="case-hero" aria-labelledby="case-title">
          <Container>
            <Link className="back-link" href="/#work"><ArrowLeft aria-hidden="true" size={16} /> Selected work</Link>
            <div className="case-hero-grid">
              <div className="case-hero-copy">
                <p className="eyebrow">{project.kicker}</p>
                <h1 id="case-title">{project.title}</h1>
                <p>{project.summary}</p>
                <div className="case-tags" aria-label={`${project.title} technologies`}>
                  {project.technologies.map((technology) => (
                    <Chip key={technology} variant="secondary">{technology}</Chip>
                  ))}
                </div>
              </div>
              <dl className="case-facts">
                <div><dt>Role</dt><dd>{project.role}</dd></div>
                <div><dt>Experience context</dt><dd>{project.experienceContext}</dd></div>
                <div><dt>Client / company</dt><dd>{project.client}</dd></div>
              </dl>
            </div>
            <ProjectVisual type={project.visual} label={project.visualLabel} />
          </Container>
        </section>

        <section className="case-metrics" aria-label="Project facts">
          <Container>
            <div className="case-metrics-grid">
              {project.metrics.map((metric) => (
                <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>
              ))}
            </div>
          </Container>
        </section>

        <section className="case-narrative">
          <Container className="case-narrative-grid">
            <aside>
              <p className="eyebrow">Case study</p>
              <p>Selected contribution from Pavan’s verified professional experience.</p>
            </aside>
            <div className="case-sections">
              <article><span>01</span><h2>The challenge</h2><p>{project.challenge}</p></article>
              <article><span>02</span><h2>The approach</h2><p>{project.approach}</p></article>
              <article><span>03</span><h2>The outcome</h2><p>{project.outcome}</p></article>
            </div>
          </Container>
        </section>

        <section className="contribution-section">
          <Container>
            <div className="contribution-card">
              <div>
                <p className="eyebrow">My contribution</p>
                <h2>From requirements to reliable delivery.</h2>
              </div>
              <ul>
                {project.contributions.map((contribution) => (
                  <li key={contribution}><CheckCircle2 aria-hidden="true" size={19} />{contribution}</li>
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
