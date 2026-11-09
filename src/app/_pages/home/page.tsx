import { ArrowUpRight, CalendarDays, Mail } from "lucide-react";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { AboutScene } from "./_components/about-scene";
import { ExperienceScene } from "./_components/experience-scene";
import { HeroSection } from "./_components/hero-section";
import { ProjectDust } from "./_components/project-dust";
import { WorkflowScene } from "./_components/workflow-scene";
import { QuickMessageSection } from "@/components/quick-message-section";
import { ScrollAccent } from "@/components/scroll-accent";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { getHomePath, getSetupPath, type Locale } from "@/lib/i18n";
import { getPortfolioContent } from "@/lib/portfolio";
import { getSiteUrl, resumeUrl } from "@/lib/site";
import { getGoogleCalendarBookingUrl } from "@/lib/scheduling";
import {
  getPersonId,
  getPersonSchema,
  getWebSiteId,
  getWebSiteSchema,
} from "@/lib/structured-data";
import { uiCopyByLocale } from "@/lib/ui-copy";

/**
 * The scroll cue uses transparent, ink-only copies of the logos (built from
 * the originals with their white backing removed), so they fade without a
 * blend mode and never flash white.
 */
const heroCueLogoSrc: Record<string, string> = {
  "https://img.logo.dev/ownpath.com?token=pk_bgxz_gwPQda2OGjDfooXyQ&size=128&retina=true&format=png":
    "/images/companies/cue/ownpath.png",
  "https://img.logo.dev/heromotocorp.com?token=pk_bgxz_gwPQda2OGjDfooXyQ&size=128&retina=true&format=png":
    "/images/companies/cue/heromotocorp.png",
  "https://img.logo.dev/philips.co.in?token=pk_bgxz_gwPQda2OGjDfooXyQ&size=128&retina=true&format=png":
    "/images/companies/cue/philips.png",
  "/images/companies/nudge.png": "/images/companies/cue/nudge.png",
  "/images/companies/sonai-engineering.svg": "/images/companies/cue/sonai-engineering.png",
  "/images/companies/drdo.png": "/images/companies/cue/drdo.png",
};

export function HomePage({ locale }: { locale: Locale }) {
  const siteUrl = getSiteUrl();
  const homePath = getHomePath(locale);
  const pageUrl = `${siteUrl}${homePath === "/" ? "" : homePath}`;
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
  const heroLogos = [
    ...new Map(
      experience
        .flatMap((item) => [
          { src: item.logoUrl, name: item.company },
          ...(item.projects ?? []).map((project) => ({
            src: project.logoUrl,
            name: project.client,
          })),
        ])
        .map((logo) => [logo.src, logo] as const),
    ).values(),
  ].map((logo) => ({ ...logo, src: heroCueLogoSrc[logo.src] ?? logo.src }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ProfilePage",
              "@id": `${siteUrl}${homePath}#profile`,
              url: pageUrl,
              name: ui.metadata.defaultTitle,
              inLanguage: locale,
              isPartOf: { "@id": getWebSiteId(siteUrl) },
              mainEntity: { "@id": getPersonId(siteUrl) },
            },
            getWebSiteSchema({ locale, siteUrl }),
            getPersonSchema({
              locale,
              siteUrl,
              content: { profile, socialLinks, skillGroups, experience },
            }),
          ],
        }}
      />
      <ScrollAccent />
      <main id="main-content">
        <HeroSection
          title={profile.heroTitle}
          accent={profile.heroAccent}
          lead={profile.heroDescriptionLead}
          trail={profile.heroDescriptionTrail}
          logos={heroLogos}
          scrollLabel={ui.home.scrollDown}
        />

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
            technologyStackAria: ui.home.technologyStackAria,
            clientProjects: ui.home.clientProjects,
          }}
          experience={experience}
        />

        <WorkflowScene copy={ui.home.aiWorkflow} setupHref={getSetupPath(locale)} />

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
            <div className="contact-card" data-scroll-accent-surface="inverse">
              <div>
                <p className="eyebrow scroll-accent-eyebrow">
                  <span
                    className="scroll-accent-heading-target"
                    data-scroll-accent-anchor="contact"
                    data-scroll-accent-phase="heading"
                    aria-hidden="true"
                  />
                  {ui.home.contactEyebrow}
                </p>
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
