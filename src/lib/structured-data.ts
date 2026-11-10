import { getDisambiguation } from "@/lib/identity";
import { getHomePath, type Locale } from "@/lib/i18n";
import type { PortfolioContent } from "@/lib/portfolio-types";
import { uiCopyByLocale } from "@/lib/ui-copy";

/**
 * One stable identity for Pavan across every page and language, so search
 * engines merge the home page, case studies, setup page and posts (and every
 * `sameAs` profile) into a single person rather than several namesakes.
 */
export function getPersonId(siteUrl: string) {
  return `${siteUrl}/#person`;
}

export function getWebSiteId(siteUrl: string) {
  return `${siteUrl}/#website`;
}

export function getPersonReference(siteUrl: string) {
  return { "@id": getPersonId(siteUrl) };
}

/**
 * Location follows the language version, never the visitor's IP: crawlers
 * fetch from one region, so IP-based variants would be invisible to them.
 * Every version gives the real base; the Japanese one adds availability.
 */
const address = {
  "@type": "PostalAddress",
  addressLocality: "Bengaluru",
  addressRegion: "Karnataka",
  addressCountry: "IN",
};

export function getPersonSchema({
  locale,
  siteUrl,
  content,
}: {
  locale: Locale;
  siteUrl: string;
  content: Pick<PortfolioContent, "profile" | "socialLinks" | "skillGroups" | "experience">;
}) {
  const { profile, socialLinks, skillGroups, experience } = content;
  const currentRole = experience.find((item) => /present|現在|heute/i.test(item.period));

  return {
    "@type": "Person",
    "@id": getPersonId(siteUrl),
    name: profile.name,
    givenName: "Pavan",
    familyName: "Patil",
    jobTitle: profile.role,
    description: uiCopyByLocale[locale].metadata.description,
    // Many people share this name. One English sentence (role, employer,
    // city, clients) on every language version keeps the entity distinct.
    disambiguatingDescription: getDisambiguation(),
    url: `${siteUrl}${getHomePath(locale) === "/" ? "" : getHomePath(locale)}`,
    image: `${siteUrl}/pavan-profile.jpg`,
    email: `mailto:${profile.email}`,
    address,
    homeLocation: { "@type": "Place", name: "Bengaluru, India", address },
    ...(currentRole
      ? { worksFor: { "@type": "Organization", name: currentRole.company } }
      : {}),
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "PES Modern College of Engineering",
    },
    sameAs: socialLinks.map((link) => link.href),
    knowsAbout: skillGroups.flatMap((group) => [...group.skills]),
  };
}

export function getWebSiteSchema({ locale, siteUrl }: { locale: Locale; siteUrl: string }) {
  return {
    "@type": "WebSite",
    "@id": getWebSiteId(siteUrl),
    url: siteUrl,
    name: "Pavan Patil",
    inLanguage: locale,
    publisher: getPersonReference(siteUrl),
  };
}
