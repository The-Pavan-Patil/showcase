import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bike,
  Briefcase,
  Braces,
  ChevronUp,
  CloudCog,
  Code2,
  Compass,
  Database,
  GitBranch,
  Languages,
  Mail,
  MapPin,
  Smartphone,
  Trophy,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { LaunchTerminal } from "@/components/launch-terminal";
import { ProjectCard } from "@/components/project-card";
import { ScrollAccent } from "@/components/scroll-accent";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import {
  experience,
  profile,
  projects,
  proofMetrics,
  skillGroups,
  socialLinks,
} from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";

export default function Home() {
  const siteUrl = getSiteUrl();
  const personalNotes = [
    {
      label: "Japanese",
      text: "Learning the language with a long-term goal of working with Japan-based companies and startups.",
      icon: Languages,
    },
    {
      label: "Horse riding",
      text: "My reset button when I need to slow down, clear my head, and come back sharper.",
      icon: Compass,
    },
    {
      label: "Bike rides",
      text: "A simple way to stay relaxed, observant, and steady outside work.",
      icon: Bike,
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          jobTitle: profile.role,
          url: siteUrl,
          email: `mailto:${profile.email}`,
          sameAs: socialLinks.map((link) => link.href),
          knowsAbout: skillGroups.flatMap((group) => [...group.skills]),
        }}
      />
      <LaunchTerminal />
      <ScrollAccent />
      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <Container className="hero-container">
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow scroll-accent-eyebrow">
                <span
                  className="scroll-accent-heading-target scroll-accent-fallback"
                  data-scroll-accent-anchor="hero"
                  data-scroll-accent-phase="heading"
                  aria-hidden="true"
                />
                {profile.heroEyebrow}
              </p>
              <h1 id="hero-title">
                {profile.heroTitle}
                <span>{profile.heroAccent}</span>
              </h1>
              <p className="hero-description">{profile.heroDescription}</p>
              <div className="hero-actions">
                <Link className="primary-cta" href="#work">
                  View selected work
                  <ArrowDown aria-hidden="true" size={17} />
                </Link>
                <a className="secondary-cta" href={`mailto:${profile.email}`}>
                  Email me
                  <ArrowUpRight aria-hidden="true" size={17} />
                </a>
              </div>
              <p className="hero-location"><MapPin aria-hidden="true" size={15} /> India · Open to software engineering roles</p>
            </div>

            <div className="hero-stage" role="img" aria-label="A software delivery system connecting product requirements, typed code, data, and reliable releases">
              <div className="hero-stage-glow" />
              <div className="hero-window hero-window-main">
                <div className="window-bar">
                  <span /><span /><span />
                  <p>delivery.pipeline.ts</p>
                  <strong>main</strong>
                </div>
                <div className="code-panel" aria-hidden="true">
                  <p><i>01</i><span className="code-blue">type</span> Product = &#123;</p>
                  <p><i>02</i>&nbsp;&nbsp;problem: <span className="code-green">&quot;understood&quot;</span>;</p>
                  <p><i>03</i>&nbsp;&nbsp;system: <span className="code-green">&quot;designed&quot;</span>;</p>
                  <p><i>04</i>&nbsp;&nbsp;quality: <span className="code-green">&quot;verified&quot;</span>;</p>
                  <p><i>05</i>&#125;;</p>
                </div>
                <div className="pipeline-row" aria-hidden="true">
                  <span><GitBranch size={14} /> Plan</span>
                  <i />
                  <span><Braces size={14} /> Build</span>
                  <i />
                  <span><CloudCog size={14} /> Ship</span>
                </div>
              </div>
              <div className="hero-window hero-window-stack" aria-hidden="true">
                <p>Product stack</p>
                <div><Code2 size={16} /><span>Web</span><strong>Next.js</strong></div>
                <div><Smartphone size={16} /><span>Mobile</span><strong>React Native</strong></div>
                <div><Database size={16} /><span>Data</span><strong>PostgreSQL</strong></div>
              </div>
              <div className="hero-signal" aria-hidden="true">
                <Sparkles size={15} />
                <span>Build signal</span>
                <strong>Healthy</strong>
              </div>
            </div>
          </Container>
        </section>

        <section className="proof-section" aria-label="Selected engineering metrics">
          <Container>
            <div className="proof-grid">
              {proofMetrics.map((metric) => (
                <div key={metric.label} className="proof-item">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="section-block" id="work" aria-labelledby="work-heading">
          <Container>
            <div className="section-header-row">
              <SectionHeading
                id="work-heading"
                eyebrow="Selected work"
                accentAnchor="work"
                title="Built for real constraints."
                muted="Designed to hold up."
                description="Three products that show how I approach synchronization, multilingual experiences, operational workflows, and reliable delivery."
              />
              <span className="section-count">03 case studies</span>
            </div>
            <div className="project-grid">
              {projects.map((project, index) => (
                <ProjectCard key={project.slug} project={project} index={index} />
              ))}
            </div>
          </Container>
        </section>

        <section
          className="section-block experience-section"
          id="experience"
          aria-labelledby="experience-heading"
          data-scroll-accent-experience
        >
          <Container>
            <SectionHeading
              id="experience-heading"
              eyebrow="Experience"
              accentAnchor="experience"
              title="Product delivery,"
              muted="from interface to infrastructure."
              description="Experience across client products, internal platforms, cloud operations, and real-time research systems."
            />
            <div className="experience-list">
              {experience.map((item, experienceIndex) => (
                <article className="experience-item" key={`${item.company}-${item.role}`}>
                  <div
                    className="experience-node"
                    data-scroll-accent-anchor={`experience-company-${experienceIndex}`}
                    data-scroll-accent-phase="experience-major"
                    aria-hidden="true"
                  >
                    <Briefcase size={15} />
                  </div>
                  <div className="experience-content">
                    <div className="experience-company-row">
                      <div className="experience-company-lockup">
                        <span className="experience-logo">
                          <Image src={item.logoUrl} alt="" fill sizes="48px" />
                        </span>
                        <div className="experience-role">
                          <h3>{item.company}</h3>
                          <p>
                            <span>{item.role}</span>
                            <span aria-hidden="true" className="experience-meta-dot" />
                            <span>{item.location}</span>
                          </p>
                        </div>
                      </div>
                      <div className="experience-card-meta">
                        {item.status ? (
                          <span className="experience-status">
                            <Trophy aria-hidden="true" size={13} />
                            {item.status}
                          </span>
                        ) : null}
                        <span className="experience-period">{item.period}</span>
                      </div>
                    </div>

                    <p className="experience-description">{item.description}</p>

                    <div className="experience-tech-list" aria-label={`${item.company} technology stack`}>
                      {item.technologies.map((technology) => (
                        <span className="experience-tech-chip" key={technology}>{technology}</span>
                      ))}
                    </div>

                    {item.projects?.length ? (
                      <details className="client-projects" data-scroll-accent-details open>
                        <summary>
                          <span className="client-project-summary-open">Collapse projects</span>
                          <span className="client-project-summary-closed">Show projects</span>
                          <span className="client-project-count">{item.projects.length}</span>
                          <span className="client-project-toggle-icon" aria-hidden="true">
                            <ChevronUp size={13} />
                          </span>
                        </summary>
                        <div className="client-project-list">
                          {item.projects.map((project, projectIndex) => (
                            <article className="client-project-item" key={`${item.company}-${project.client}-${project.project}`}>
                              <span
                                className="client-project-node"
                                data-scroll-accent-anchor={`experience-project-${experienceIndex}-${projectIndex}`}
                                data-scroll-accent-phase="experience-minor"
                                aria-hidden="true"
                              />
                              <span className="client-project-logo">
                                <Image src={project.logoUrl} alt="" fill sizes="40px" />
                              </span>
                              <div className="client-project-body">
                                <h4>
                                  <span>{project.client}</span>
                                  <ArrowRight aria-hidden="true" size={16} />
                                  <span>{project.project}</span>
                                </h4>
                                <p>{project.description}</p>
                                <div className="client-project-tech" aria-label={`${project.client} project technology stack`}>
                                  {project.technologies.map((technology) => (
                                    <span key={technology}>{technology}</span>
                                  ))}
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section
          className="section-block"
          id="about"
          aria-labelledby="about-heading"
          data-scroll-accent-pass
        >
          <Container>
            <div className="about-shell">
              <aside className="about-portrait" aria-label="Portrait and profile summary">
                <div className="about-photo-frame">
                  <Image
                    src="/pavan-profile.jpg"
                    alt="Pavan Patil smiling outdoors at night"
                    fill
                    sizes="(max-width: 1024px) 100vw, 32vw"
                  />
                </div>
              </aside>

              <div className="about-content">
                <div className="about-copy">
                  <SectionHeading
                    id="about-heading"
                    eyebrow="About"
                    title="Who I am,"
                    muted="and how I build."
                    description="I’m Pavan, a software engineer who likes turning messy product requirements into dependable software people can actually use."
                  />
                  <p>{profile.about}</p>
                </div>

                <div className="about-beyond">
                  <div>
                    <p className="eyebrow">Beyond code</p>
                    <h3>Small signals about how I think.</h3>
                  </div>
                  <div className="about-beyond-list" aria-label="Personal interests">
                    {personalNotes.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div className="about-beyond-item" key={item.label}>
                          <span className="about-beyond-icon">
                            <Icon aria-hidden="true" size={16} />
                          </span>
                          <div>
                            <strong>{item.label}</strong>
                            <p>{item.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <a className="resume-capsule" href="/pavan-patil-resume.txt" download>
                  Download résumé <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section
          className="contact-section"
          id="contact"
          aria-labelledby="contact-heading"
          data-scroll-accent-contact
        >
          <Container>
            <div className="contact-card">
              <div>
                <p className="eyebrow">Let’s build something dependable</p>
                <h2 id="contact-heading">Looking for an engineer who can own the details?</h2>
                <p>I’m open to software engineering roles across product, platform, web, and mobile teams.</p>
              </div>
              <div className="contact-actions">
                <a className="contact-email" href={`mailto:${profile.email}`}>
                  <Mail aria-hidden="true" size={18} />
                  {profile.email}
                </a>
                <div className="social-row">
                  {socialLinks.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.ariaLabel}>
                      {link.label}<ArrowUpRight aria-hidden="true" size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
