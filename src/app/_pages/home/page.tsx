import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Braces,
  CalendarDays,
  ChevronUp,
  CloudCog,
  Code2,
  Database,
  GitBranch,
  Mail,
  MapPin,
  Smartphone,
  Trophy,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { AsciiArt } from "@/components/ascii-art";
import { CometCard } from "@/components/ui/comet-card";
import { JsonLd } from "@/components/json-ld";
import { LaunchTerminal } from "@/components/launch-terminal";
import { ProjectCard } from "./_components/project-card";
import { QuickMessageSection } from "@/components/quick-message-section";
import { ScrollAccent } from "@/components/scroll-accent";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { getHashHref, getSetupPath, type Locale } from "@/lib/i18n";
import { getPortfolioContent } from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";
import { getGoogleCalendarBookingUrl } from "@/lib/scheduling";
import { formatCopy, uiCopyByLocale } from "@/lib/ui-copy";

export function HomePage({ locale }: { locale: Locale }) {
  const siteUrl = getSiteUrl();
  const googleCalendarBookingUrl = getGoogleCalendarBookingUrl();
  const ui = uiCopyByLocale[locale];
  const {
    experience,
    profile,
    projects,
    proofMetrics,
    skillGroups,
    socialLinks,
  } = getPortfolioContent(locale);
  const personalNotes = [
    { ...ui.home.personalNotes[0], image: "/images/beyond-code/calisthenics.avif" },
    { ...ui.home.personalNotes[1], image: "/images/beyond-code/horse-riding.avif" },
    { ...ui.home.personalNotes[2], image: "/images/beyond-code/bike-rides.webp" },
  ];
  const homepageProjects = projects.filter(
    (project) => project.slug !== "workforce-management-system",
  );

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
      <LaunchTerminal copy={ui.launch} />
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
                <Link className="primary-cta" href={getHashHref(locale, "#work")}>
                  {ui.home.heroPrimaryCta}
                  <ArrowDown aria-hidden="true" size={17} />
                </Link>
                <a className="secondary-cta" href={`mailto:${profile.email}`}>
                  {ui.home.heroSecondaryCta}
                  <ArrowUpRight aria-hidden="true" size={17} />
                </a>
              </div>
              <p className="hero-location">
                <MapPin aria-hidden="true" size={15} /> {ui.home.heroLocation}
              </p>
            </div>

            <div className="hero-stage" role="img" aria-label={ui.home.heroStageAria}>
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
                  <span><GitBranch size={14} /> {ui.home.plan}</span>
                  <i />
                  <span><Braces size={14} /> {ui.home.build}</span>
                  <i />
                  <span><CloudCog size={14} /> {ui.home.ship}</span>
                </div>
              </div>
              <div className="hero-window hero-window-stack" aria-hidden="true">
                <p>{ui.home.productStack}</p>
                <div><Code2 size={16} /><span>{ui.home.web}</span><strong>Next.js</strong></div>
                <div><Smartphone size={16} /><span>{ui.home.mobile}</span><strong>React Native</strong></div>
                <div><Database size={16} /><span>{ui.home.data}</span><strong>PostgreSQL</strong></div>
              </div>
              <div className="hero-signal" aria-hidden="true">
                <Sparkles size={15} />
                <span>{ui.home.buildSignal}</span>
                <strong>{ui.home.healthy}</strong>
              </div>
            </div>
          </Container>
        </section>

        <section className="proof-section" aria-label={ui.home.proofAria}>
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
                eyebrow={ui.home.workEyebrow}
                accentAnchor="work"
                title={ui.home.workTitle}
                muted={ui.home.workMuted}
                description={ui.home.workDescription}
              />
              <span className="section-count">{ui.home.workCount}</span>
            </div>
            <div className="project-grid">
              {homepageProjects.map((project, index) => (
                <ProjectCard
                  copy={ui.projectCard}
                  key={project.slug}
                  locale={locale}
                  project={project}
                  projectVisualCopy={ui.projectVisual}
                  index={index}
                />
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
              eyebrow={ui.home.experienceEyebrow}
              accentAnchor="experience"
              title={ui.home.experienceTitle}
              muted={ui.home.experienceMuted}
              description={ui.home.experienceDescription}
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

                    <div
                      className="experience-tech-list"
                      aria-label={formatCopy(ui.home.technologyStackAria, { name: item.company })}
                    >
                      {item.technologies.map((technology) => (
                        <span className="experience-tech-chip" key={technology}>{technology}</span>
                      ))}
                    </div>

                    {item.projects?.length ? (
                      <details className="client-projects" data-scroll-accent-details open>
                        <summary>
                          <span className="client-project-summary-open">{ui.home.collapseProjects}</span>
                          <span className="client-project-summary-closed">{ui.home.showProjects}</span>
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
                                <div
                                  className="client-project-tech"
                                  aria-label={formatCopy(ui.home.technologyStackAria, { name: project.client })}
                                >
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
          className="ai-workflow-band"
          aria-labelledby="ai-workflow-heading"
        >
          <Container className="ai-workflow-container">
            <div className="ai-workflow-copy">
              <SectionHeading
                id="ai-workflow-heading"
                eyebrow={ui.home.aiWorkflow.eyebrow}
                title={ui.home.aiWorkflow.title}
                muted={ui.home.aiWorkflow.titleMuted}
                description={`${ui.home.aiWorkflow.description} ${ui.home.aiWorkflow.descriptionEmphasis}`}
                accentAnchor="workflow"
              />
            </div>

            <Link className="ai-workflow-cta" href={getSetupPath(locale)}>
              {ui.home.aiWorkflow.cta}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
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
              <div className="about-content">
                <div className="about-copy">
                  <SectionHeading
                    id="about-heading"
                    eyebrow={ui.home.aboutEyebrow}
                    title={ui.home.aboutTitle}
                    muted={ui.home.aboutMuted}
                    description={profile.about}
                    accentAnchor="about"
                  />
                </div>

                <a className="resume-capsule" href="/pavan-patil-resume.txt" download>
                  {ui.home.downloadResume} <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>

              <CometCard
                className="about-portrait"
                rotateDepth={4}
                translateDepth={4}
              >
                <aside className="about-portrait-content" aria-label={ui.home.portraitAria}>
                  <div className="about-photo-frame">
                    <Image
                      src="/pavan-profile.jpg"
                      alt={ui.home.portraitAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 32vw"
                    />
                  </div>
                  <div className="about-portrait-copy">
                    <strong>{profile.name}</strong>
                    <span>{profile.role}</span>
                  </div>
                </aside>
              </CometCard>

              <div className="about-beyond">
                <div>
                  <p className="eyebrow">{ui.home.beyondCode}</p>
                  <h3>{ui.home.beyondHeading}</h3>
                </div>
                <div className="about-beyond-list" aria-label={ui.home.personalInterestsAria}>
                  {personalNotes.map((item) => {
                    return (
                      <div className="about-beyond-item" key={item.label}>
                        <div className="about-beyond-image">
                          <AsciiArt className="about-beyond-ascii" src={item.image} />
                        </div>
                        <div className="about-beyond-item-copy">
                          <strong>{item.label}</strong>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <QuickMessageSection copy={ui.home.quickMessage} />

        <section
          className="contact-section"
          id="contact"
          aria-labelledby="contact-heading"
          data-scroll-accent-contact
        >
          <Container>
            <div className="contact-card">
              <div>
                <p className="eyebrow">{ui.home.contactEyebrow}</p>
                <h2 id="contact-heading">{ui.home.contactTitle}</h2>
                <p>{ui.home.contactDescription}</p>
              </div>
              <div className="contact-actions">
                {googleCalendarBookingUrl ? (
                  <div className="schedule-call">
                    <p className="schedule-call-helper">
                      {ui.home.contactScheduleHelper}
                    </p>
                    <a
                      className="schedule-call-link"
                      href={googleCalendarBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ui.home.contactScheduleFallbackAria}
                    >
                      <CalendarDays aria-hidden="true" size={18} />
                      <span>{ui.home.contactScheduleLabel}</span>
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  </div>
                ) : null}
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
      <SiteFooter
        copy={{ ...ui.footer, brandAria: ui.header.brandAria, navigation: ui.header.navigation }}
        locale={locale}
        profile={profile}
        socialLinks={socialLinks}
      />
    </>
  );
}
