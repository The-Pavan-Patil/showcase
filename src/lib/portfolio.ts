export type ProjectVisual = "sync" | "web" | "operations";

export type ProjectMetric = {
  value: string;
  label: string;
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
};

export type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
};

export type SocialLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export const profile = {
  name: "Pavan Patil",
  role: "Software Engineer",
  email: "thepavanpatil.official@gmail.com",
  heroEyebrow: "Software Engineer · Web, mobile & backend",
  heroTitle: "I build dependable software",
  heroAccent: "for complex, real-world workflows.",
  heroDescription:
    "I’m Pavan Patil, a software engineer working across web, mobile, backend, and data-intensive systems. I’ve built offline-first collaboration products, enterprise documentation workflows, workforce automation, and real-time LiDAR services.",
  about:
    "I’m a software engineer from India with experience across product development, client delivery, and research engineering. I enjoy turning complex requirements into reliable software—from offline-first mobile synchronization and Git-backed publishing workflows to payroll automation and real-time LiDAR APIs.",
  education:
    "Bachelor of Engineering in Electronics and Computer Engineering · PES Modern College of Engineering · 9.4 SGPA",
} as const;

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/The-Pavan-Patil",
    ariaLabel: "Visit Pavan Patil on GitHub (opens in a new tab)",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/thepavanpatilofficial",
    ariaLabel: "Visit Pavan Patil on LinkedIn (opens in a new tab)",
  },
];

export const proofMetrics: ProjectMetric[] = [
  { value: "1,000+", label: "worker records supported" },
  { value: "<100 ms", label: "LiDAR API response time" },
  { value: "10 GB+", label: "point-cloud data processed daily" },
  { value: "30%", label: "lower pipeline transfer latency" },
];

export const projects: ProjectCaseStudy[] = [
  {
    slug: "nudge",
    title: "Nudge",
    kicker: "Mobile collaboration",
    cardHeadline: "Offline-first collaboration that keeps work moving.",
    summary:
      "A cross-platform React Native application using PowerSync and Supabase PostgreSQL for synchronized task collaboration, notifications, and reliable use across devices.",
    role: "Software Engineer",
    experienceContext: "Ownpath · Nov 2025–Present",
    client: "Vendaka Pvt. Ltd.",
    technologies: ["React Native", "PowerSync", "Supabase", "PostgreSQL"],
    challenge:
      "Collaborative task work needed to continue when connectivity was unreliable while keeping data consistent across devices.",
    approach:
      "I built the application in React Native, used PowerSync with a Supabase PostgreSQL backend for offline-first synchronization, and implemented real-time task and notification workflows. Requirements and iterations were managed through direct client communication.",
    outcome:
      "The delivered application supports cross-device synchronization, real-time task collaboration, and notification workflows. Feature iterations were aligned with client feedback and business requirements.",
    contributions: [
      "Designed offline-first data flows for intermittent connectivity.",
      "Implemented synchronized tasks and notification workflows.",
      "Translated requirements and feedback into iterative product releases.",
    ],
    metrics: [
      { value: "Cross-platform", label: "React Native delivery" },
      { value: "Offline-first", label: "PowerSync architecture" },
      { value: "Real-time", label: "task collaboration" },
    ],
    visual: "sync",
    visualLabel: "System diagram showing offline devices synchronizing through PowerSync and PostgreSQL",
  },
  {
    slug: "philips-greenheart",
    title: "Philips Greenheart",
    kicker: "Global web experience",
    cardHeadline: "A production-ready multilingual website from Figma.",
    summary:
      "A React and TypeScript corporate website built from Figma designs, with region-specific localization, unit testing, and application performance monitoring.",
    role: "Software Engineer",
    experienceContext: "Ownpath · Nov 2025–Present",
    client: "Philips",
    technologies: ["React", "TypeScript", "Tailwind CSS", "i18n", "APM"],
    challenge:
      "Convert approved Figma designs into a reliable website capable of serving region-specific content and exposing runtime performance signals.",
    approach:
      "I built the interface with React, TypeScript, and Tailwind CSS, added localization through an industry-standard i18n workflow, and implemented unit testing and application performance monitoring.",
    outcome:
      "The delivery included production-ready components, multilingual content support, automated unit testing, and real-time performance monitoring.",
    contributions: [
      "Translated Figma specifications into reusable production components.",
      "Implemented region-specific multilingual content delivery.",
      "Added unit coverage and application performance monitoring.",
    ],
    metrics: [
      { value: "Figma → code", label: "production delivery" },
      { value: "Multilingual", label: "localized content" },
      { value: "Tested + monitored", label: "quality signals" },
    ],
    visual: "web",
    visualLabel: "Abstract browser composition representing a multilingual, monitored corporate website",
  },
  {
    slug: "workforce-management-system",
    title: "Workforce Management",
    kicker: "Operations platform",
    cardHeadline: "Workforce operations for 1,000+ worker records.",
    summary:
      "A full-stack platform for attendance, configurable overtime payroll, labor, site, and portfolio workflows across multiple construction sites, deployed on AWS.",
    role: "Full Stack Developer",
    experienceContext: "Sonai · Feb–Oct 2025",
    client: "Sonai Engineering & Services",
    technologies: ["React", "TypeScript", "Node.js", "MongoDB", "AWS"],
    challenge:
      "The firm needed to manage worker records, attendance, sites, and configurable overtime payroll across multiple construction locations.",
    approach:
      "I built the application with React, TypeScript, Node.js, and MongoDB; developed authentication and REST APIs; added overtime calculations and Excel export; and deployed the system on AWS.",
    outcome:
      "The platform supports efficient tracking of more than 1,000 worker records and replaces parts of manual payroll processing with configurable calculations and exports.",
    contributions: [
      "Built attendance and worker-record workflows across multiple sites.",
      "Automated configurable overtime calculations and Excel exports.",
      "Implemented authenticated REST APIs and maintained the AWS deployment.",
    ],
    metrics: [
      { value: "1,000+", label: "worker records" },
      { value: "Multi-site", label: "construction operations" },
      { value: "AWS", label: "deployed infrastructure" },
    ],
    visual: "operations",
    visualLabel: "Abstract operations dashboard showing worker, attendance, and payroll workflows",
  },
];

export const experience: ExperienceItem[] = [
  {
    company: "Ownpath Pvt. Ltd.",
    role: "Software Engineer",
    period: "Nov 2025–Present",
    location: "Bangalore",
    highlights: [
      "Built Echo, a Git-backed Hero Vida design-system documentation platform using Next.js, TypeScript, PostgreSQL, and GitHub APIs.",
      "Implemented branch collaboration, pull-request review, RBAC, immutable publishing, autosaved drafts, optimistic concurrency control, and IndexedDB caching.",
      "Integrated Anthropic-powered editing and design-compliance analysis with administration, audit, notification, and media workflows.",
      "Delivered Nudge’s offline-first React Native application and Philips Greenheart’s multilingual React and TypeScript website.",
    ],
  },
  {
    company: "Sonai Engineering & Services",
    role: "Full Stack Developer",
    period: "Feb 2025–Oct 2025",
    location: "Pune",
    highlights: [
      "Built a workforce platform supporting 1,000+ worker records across multiple construction sites.",
      "Automated configurable overtime calculations and Excel payroll exports.",
      "Implemented attendance workflows, authentication middleware, and REST APIs for labor, site, and portfolio management.",
      "Deployed and maintained the application on AWS.",
    ],
  },
  {
    company: "Defence Research and Development Organisation",
    role: "Project Intern",
    period: "Feb 2024–Apr 2024",
    location: "Pune",
    highlights: [
      "Deployed LiDAR object-detection models behind an Express.js service with sub-100 ms response times.",
      "Processed more than 10 GB of point-cloud data daily using the Ouster SDK and Python pipelines.",
      "Built APIs for WebGL and Three.js real-time 3D tracking visualizations.",
      "Reduced transfer latency between Python ML pipelines and Node.js services by 30%.",
    ],
  },
];

export const skillGroups = [
  {
    label: "Languages",
    skills: ["TypeScript", "JavaScript", "Python", "SQL"],
  },
  {
    label: "Web & mobile",
    skills: ["React", "Next.js", "React Native", "Expo", "Tailwind CSS", "Redux"],
  },
  {
    label: "Backend & data",
    skills: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Supabase", "Prisma"],
  },
  {
    label: "Delivery",
    skills: ["Jest", "Supertest", "Git", "Docker", "AWS", "Railway", "Firebase"],
  },
] as const;

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}
