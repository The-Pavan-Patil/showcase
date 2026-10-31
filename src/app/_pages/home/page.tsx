import { ArrowRight, ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { LaunchTerminal } from "@/components/launch-terminal";
import { AboutScene } from "./_components/about-scene";
import { ExperienceScene } from "./_components/experience-scene";
import { ProjectDust } from "./_components/project-dust";
import { QuickMessageSection } from "@/components/quick-message-section";
import { ScrollAccent } from "@/components/scroll-accent";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { getSetupPath, type Locale } from "@/lib/i18n";
import { getPortfolioContent } from "@/lib/portfolio";
import { getSiteUrl, resumeUrl } from "@/lib/site";
import { getGoogleCalendarBookingUrl } from "@/lib/scheduling";
import { uiCopyByLocale } from "@/lib/ui-copy";

export function HomePage({ locale }: { locale: Locale }) {
  const siteUrl = getSiteUrl();
  const googleCalendarBookingUrl = getGoogleCalendarBookingUrl();
  const ui = uiCopyByLocale[locale];
  const {
    experience,
    profile,
    projects,
    skillGroups,
    socialLinks,
  } = getPortfolioContent(locale);
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
              <span
                className="scroll-accent-heading-target scroll-accent-fallback"
                data-scroll-accent-anchor="hero"
                data-scroll-accent-phase="heading"
                aria-hidden="true"
              />
              <h1 id="hero-title">
                {profile.heroTitle}{" "}
                <span>{profile.heroAccent}</span>
              </h1>
              <p className="hero-description">{profile.heroDescription}</p>
            </div>
          </Container>
        </section>

        <section className="work-section" id="work" aria-labelledby="work-heading">
          <ProjectDust
            copy={ui.projectCard}
            heading={
              <div className="section-header-row">
                <SectionHeading
                  id="work-heading"
                  eyebrow={ui.home.workEyebrow}
                  accentSpacer
                  title={ui.home.workTitle}
                  muted={ui.home.workMuted}
                  description={ui.home.workDescription}
                />
                <span className="section-count">{ui.home.workCount}</span>
              </div>
            }
            locale={locale}
            projects={homepageProjects}
          />
        </section>

        <ExperienceScene
          copy={{
            experienceEyebrow: ui.home.experienceEyebrow,
            experienceTitle: ui.home.experienceTitle,
            experienceMuted: ui.home.experienceMuted,
            experienceDescription: ui.home.experienceDescription,
            technologyStackAria: ui.home.technologyStackAria,
            collapseProjects: ui.home.collapseProjects,
            showProjects: ui.home.showProjects,
          }}
          experience={experience}
        />

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

        <AboutScene
          displayWords={ui.home.aboutDisplay}
          title={ui.home.aboutTitle}
          muted={ui.home.aboutMuted}
          description={profile.about}
          resumeHref={resumeUrl}
          resumeLabel={ui.home.downloadResume}
          portraitAlt={ui.home.portraitAlt}
          beyondEyebrow={ui.home.beyondCode}
          beyondHeading={ui.home.beyondHeading}
          beyondAria={ui.home.personalInterestsAria}
          notes={ui.home.personalNotes}
        />

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
