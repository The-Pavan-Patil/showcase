import type { ProjectCaseStudy } from "@/lib/portfolio-types";

export const workforceManagementSystem = {
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
} satisfies ProjectCaseStudy;
