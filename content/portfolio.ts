import { homeContent } from "@/app/_pages/home/_data/content";
import { caseStudies } from "@/app/_pages/work/_data/case-studies";
import type { PortfolioContent } from "@/lib/portfolio-types";

export const portfolioContent = {
  ...homeContent,
  projects: caseStudies,
} satisfies PortfolioContent;
