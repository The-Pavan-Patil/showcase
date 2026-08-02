import type { ProjectCaseStudy } from "@/lib/portfolio-types";

export const philipsGreenheart = {
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
} satisfies ProjectCaseStudy;
