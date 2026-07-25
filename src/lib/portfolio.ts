import { portfolioContent } from "../../content/portfolio";

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

export const { profile, socialLinks, proofMetrics, projects, experience, skillGroups } = portfolioContent;

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}
