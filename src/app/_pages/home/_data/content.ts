import type { PortfolioContent } from "@/lib/portfolio-types";

type HomeContent = Omit<PortfolioContent, "projects">;

export const homeContent = {
  profile: {
    name: "Pavan Patil",
    role: "Software Engineer",
    email: "thepavanpatil.official@gmail.com",
    heroEyebrow: "Software Engineer · Web, mobile & backend",
    heroTitle: "I build dependable software",
    heroAccent: "for complex, real-world workflows.",
    heroDescription:
      "I’m Pavan Patil, a software engineer working across web, mobile, backend, and data-intensive systems. I’ve built offline-first collaboration products, enterprise documentation workflows, workforce automation, and real-time LiDAR services.",
    about:
      "I’m Pavan Patil. My interest in computers started in childhood, when my father brought home a computer and I became curious about what was happening beneath the screen. I wrote my first code in sixth grade, and that curiosity never really left. Today I enjoy building products end to end: shaping the plan, designing the architecture, writing the software, and turning rough ideas into systems people can use. I feel lucky that the thing I kept returning to became my profession.",
    education:
      "Bachelor of Engineering in Electronics and Computer Engineering · PES Modern College of Engineering · 9.4 SGPA",
  },
  socialLinks: [
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
  ],
  proofMetrics: [
    { value: "1,000+", label: "worker records supported" },
    { value: "<100 ms", label: "LiDAR API response time" },
    { value: "10 GB+", label: "point-cloud data processed daily" },
    { value: "30%", label: "lower pipeline transfer latency" },
  ],

  experience: [
    {
      company: "Ownpath Pvt. Ltd.",
      role: "Software Engineer",
      period: "Nov 2025 - Present",
      location: "Bangalore",
      logoUrl: "https://img.logo.dev/ownpath.com?token=pk_bgxz_gwPQda2OGjDfooXyQ&size=128&retina=true&format=png",
      description:
        "Software engineer delivering production web and mobile applications for enterprise clients, including design-system documentation, multilingual corporate web, and offline-first collaboration workflows.",
      technologies: ["Next.js", "TypeScript", "React Native", "PostgreSQL", "Supabase"],
      projects: [
        {
          client: "Hero Vida",
          project: "Echo - Hero Design System Documentation Platform",
          logoUrl: "https://img.logo.dev/heromotocorp.com?token=pk_bgxz_gwPQda2OGjDfooXyQ&size=128&retina=true&format=png",
          description:
            "Built a Git-backed design-system documentation platform with branch collaboration, pull-request review, RBAC permissions, immutable publishing, TipTap editing, IndexedDB caching, autosave drafts, optimistic concurrency control, and AI-assisted design-compliance analysis.",
          technologies: ["Next.js", "TypeScript", "PostgreSQL", "GitHub APIs", "TipTap"],
        },
        {
          client: "Philips",
          project: "Philips Greenheart Website",
          logoUrl: "https://img.logo.dev/philips.co.in?token=pk_bgxz_gwPQda2OGjDfooXyQ&size=128&retina=true&format=png",
          description:
            "Developed a corporate website from Figma designs using production-ready React components, multilingual localization, unit testing, and application performance monitoring.",
          technologies: ["React.js", "TypeScript", "Tailwind CSS", "i18n", "APM"],
        },
        {
          client: "Vendaka Pvt. Ltd.",
          project: "Nudge - Social Task Collaboration Platform",
          logoUrl: "/images/companies/nudge.png",
          description:
            "Developed a cross-platform social collaboration app with PowerSync offline-first architecture, Supabase PostgreSQL synchronization, real-time task collaboration, notifications, and end-to-end client communication.",
          technologies: ["React Native", "PowerSync", "Supabase", "PostgreSQL"],
        },
      ],
    },
    {
      company: "Sonai Engineering & Services",
      role: "Full Stack Developer",
      period: "Feb 2025 - Oct 2025",
      location: "Pune",
      logoUrl: "/images/companies/sonai-engineering.svg",
      description:
        "Built and maintained a workforce management platform for an MEP firm, supporting worker records, attendance, payroll automation, REST APIs, and secure AWS deployment.",
      technologies: ["React.js", "TypeScript", "Node.js", "MongoDB", "AWS"],
      projects: [
        {
          client: "Sonai Engineering & Services",
          project: "Workforce Management Platform",
          logoUrl: "/images/companies/sonai-engineering.svg",
          description:
            "Enabled tracking of 1,000+ worker records across multiple construction sites, configurable overtime payroll calculations, Excel exports, attendance workflows, authentication middleware, and REST APIs for labor, site, and portfolio management.",
          technologies: ["React.js", "TypeScript", "Node.js", "MongoDB", "AWS"],
        },
      ],
    },
    {
      company: "Defence Research and Development Organization",
      role: "Project Intern",
      period: "Feb 2024 - Apr 2024",
      location: "Pune",
      logoUrl: "/images/companies/drdo.png",
      description:
        "Developed backend systems and APIs for real-time LiDAR object-detection workflows, connecting Python data pipelines with Node.js services and WebGL/Three.js visualization systems.",
      technologies: ["Express.js", "Node.js", "Python", "Ouster SDK", "Three.js"],
      projects: [
        {
          client: "DRDO",
          project: "LiDAR Object Detection Backend",
          logoUrl: "/images/companies/drdo.png",
          description:
            "Deployed LiDAR object-detection models behind an Express.js service, processed 10GB+ of point-cloud data daily, served detection results to 3D visualization systems, and reduced Python-to-Node data-transfer latency by 30%.",
          technologies: ["Express.js", "Python", "Ouster SDK", "WebGL", "Three.js"],
        },
      ],
    },
  ],
  skillGroups: [
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
  ],
} satisfies HomeContent;
