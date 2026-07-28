import { portfolioContentByLocale } from "../../content/portfolio-locales";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import type { ProjectCaseStudy } from "./portfolio-types";

export type {
  CaseStudyArticle,
  CaseStudySection,
  CaseStudySubsection,
  CaseStudyTextBlock,
  ExperienceItem,
  ExperienceProject,
  PortfolioContent,
  Profile,
  ProjectMedia,
  ProjectCaseStudy,
  ProjectMetric,
  ProjectVisual,
  SkillGroup,
  SocialLink,
} from "./portfolio-types";

export const portfolioContent = portfolioContentByLocale[defaultLocale];
export const { profile, socialLinks, proofMetrics, projects, experience, skillGroups } = portfolioContent;

export function getPortfolioContent(locale: Locale) {
  return portfolioContentByLocale[locale];
}

export function getProjects(locale: Locale) {
  return getPortfolioContent(locale).projects;
}

export function getProjectBySlug(slug: string): ProjectCaseStudy | undefined;
export function getProjectBySlug(locale: Locale, slug: string): ProjectCaseStudy | undefined;
export function getProjectBySlug(localeOrSlug: Locale | string, maybeSlug?: string) {
  const locale = maybeSlug && isLocale(localeOrSlug) ? localeOrSlug : defaultLocale;
  const slug = maybeSlug ?? localeOrSlug;
  return getProjects(locale).find((project) => project.slug === slug);
}

export function getNextProject(slug: string): ProjectCaseStudy;
export function getNextProject(locale: Locale, slug: string): ProjectCaseStudy;
export function getNextProject(localeOrSlug: Locale | string, maybeSlug?: string) {
  const locale = maybeSlug && isLocale(localeOrSlug) ? localeOrSlug : defaultLocale;
  const slug = maybeSlug ?? localeOrSlug;
  const localizedProjects = getProjects(locale);
  const index = localizedProjects.findIndex((project) => project.slug === slug);
  return localizedProjects[(index + 1) % localizedProjects.length];
}
