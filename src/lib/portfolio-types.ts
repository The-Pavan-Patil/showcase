export type ProjectVisual = "sync" | "web" | "operations";

export type ProjectMetric = {
  value: string;
  label: string;
};

export type ProjectMedia = {
  src: string;
  alt: string;
  caption?: string;
};

export type CaseStudyTextBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "orderedList";
      items: string[];
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "callout";
      title: string;
      text: string;
    };

export type CaseStudySubsection = {
  title: string;
  blocks: CaseStudyTextBlock[];
};

export type CaseStudySection = {
  id: string;
  title: string;
  eyebrow?: string;
  blocks: CaseStudyTextBlock[];
  subsections?: CaseStudySubsection[];
};

export type CaseStudyArticle = {
  oneLineSummary: string;
  sections: CaseStudySection[];
  closingQuote?: string;
};

export type ProjectCaseStudy = {
  slug: string;
  title: string;
  kicker: string;
  cardHeadline: string;
  summary: string;
  role: string;
  experienceContext: string;
  client: string;
  technologies: string[];
  challenge: string;
  approach: string;
  outcome: string;
  contributions: string[];
  metrics: ProjectMetric[];
  visual: ProjectVisual;
  visualLabel: string;
  media?: ProjectMedia;
  caseStudy?: CaseStudyArticle;
};

export type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  location: string;
  logoUrl: string;
  description: string;
  technologies: string[];
  status?: string;
  projects?: ExperienceProject[];
};

export type ExperienceProject = {
  client: string;
  project: string;
  logoUrl: string;
  description: string;
  technologies: string[];
};

export type SocialLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type SkillGroup = {
  label: string;
  skills: string[];
};

export type Profile = {
  name: string;
  role: string;
  email: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  about: string;
  education: string;
};

export type PortfolioContent = {
  profile: Profile;
  socialLinks: SocialLink[];
  proofMetrics: ProjectMetric[];
  projects: ProjectCaseStudy[];
  experience: ExperienceItem[];
  skillGroups: SkillGroup[];
};
