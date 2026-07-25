import type { PortfolioContent } from "../src/lib/portfolio-types";

export const portfolioContent: PortfolioContent = {
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
      "I’m a software engineer from India with experience across product development, client delivery, and research engineering. I enjoy turning complex requirements into reliable software—from offline-first mobile synchronization and Git-backed publishing workflows to payroll automation and real-time LiDAR APIs.",
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
  projects: [
    {
      slug: "nudge",
      title: "Nudge",
      kicker: "Offline-first social tasks",
      cardHeadline: "A simple task app with offline-first collaboration underneath.",
      summary:
        "Nudge is a lightweight social task experience for repeated group planning, built with a simple gesture surface and a local-first sync architecture underneath.",
      role: "Full Stack Developer",
      experienceContext: "Ownpath · Nov 2025–Present",
      client: "Vendaka Pvt. Ltd.",
      technologies: ["React Native", "PowerSync", "Supabase", "PostgreSQL", "Supabase Auth", "RLS"],
      challenge:
        "The app needed to feel instant and simple while local storage, network state, user roles, task lifecycle, RLS, Storage access, and remote synchronization all affected what could safely happen.",
      approach:
        "I built a local-first task flow with PowerSync and Supabase, created tasks locally before remote confirmation, staged participant writes after remote availability, and kept relationship logic in the service layer where roles and sync boundaries could be controlled.",
      outcome:
        "The project reached test and internal demo builds with stable local-to-Supabase task synchronization, role-aware gestures, participant-aware task visibility, notifications, images, and recovery tooling for sync drift.",
      contributions: [
        "Designed the local-first task creation and PowerSync-to-Supabase synchronization flow.",
        "Built the owner/nudger participant model that connected gestures to real permissions.",
        "Aligned Supabase Auth, RLS, Storage, local schema, and sync rules across task and attachment flows.",
        "Created schema inspection, clean-start, reset, local insertion, and sync simulation tooling for debugging.",
      ],
      metrics: [
        { value: "Local-first", label: "task creation before network confirmation" },
        { value: "2 roles", label: "owner and nudger collaboration model" },
        { value: "4 gestures", label: "complete, postpone, nudge, archive" },
      ],
      media: {
        src: "/nudge-case-study.png",
        alt: "A Nudge mobile task deck connected to offline sync and collaborator architecture nodes",
        caption: "Offline-first task UI, sync flow, and collaborator model",
      },
      visual: "sync",
      visualLabel: "Nudge task deck showing role-aware gestures, offline queue, and Supabase synchronization",
      caseStudy: {
        oneLineSummary:
          "Nudge was built as a simple social task app on the surface, powered by an offline-first collaborative architecture underneath.",
        sections: [
          {
            id: "overview",
            title: "Overview",
            blocks: [
              {
                type: "paragraph",
                text: "Nudge is a lightweight social task experience for people who plan things together repeatedly: friend groups organizing trips, shared routines, small events, and everyday responsibilities.",
              },
              {
                type: "paragraph",
                text: "The product idea was intentionally simple:",
              },
              {
                type: "list",
                items: [
                  "Create a task.",
                  "Add the people involved.",
                  "Let the group keep each other accountable.",
                  "Complete, postpone, nudge, or archive tasks through a small set of gestures.",
                ],
              },
              {
                type: "callout",
                title: "Product tension",
                text: "The interface looked simple because the architecture absorbed the complexity.",
              },
            ],
          },
          {
            id: "context",
            title: "Context",
            blocks: [
              {
                type: "paragraph",
                text: "In many friend groups, planning is shared in theory but managed by one person in practice. One person creates the plan, follows up, reminds everyone, and keeps track of what is unfinished.",
              },
              {
                type: "paragraph",
                text: "Nudge was designed to distribute that responsibility across the group.",
              },
              {
                type: "paragraph",
                text: "The task owner could create and complete a task. Contributors could participate and nudge the task when it needed attention. The same flow also worked for personal task management, where the value came from making progress feel immediate and visible.",
              },
              {
                type: "paragraph",
                text: "As the full-stack developer on the project, the goal was to make the interaction feel fast and natural while building the data and sync behavior underneath it.",
              },
            ],
          },
          {
            id: "challenge",
            title: "The challenge",
            blocks: [
              {
                type: "paragraph",
                text: "The product needed to satisfy several expectations at once:",
              },
              {
                type: "list",
                items: [
                  "A user should be able to start creating a task without a reliable connection.",
                  "A task should support an owner and multiple contributors.",
                  "Different people should have different roles within the same task.",
                  "Changes made by one person should reach the rest of the group.",
                  "Completed, postponed, and archived tasks should stay in the right place.",
                ],
              },
              {
                type: "paragraph",
                text: "The challenge was not creating a card or adding a swipe animation. It was making those small interactions trustworthy when the device, network, user role, and task state could all affect what happened next.",
              },
            ],
          },
          {
            id: "product-surface",
            title: "Product surface",
            blocks: [
              {
                type: "paragraph",
                text: "The main task experience was built around a compact gesture language:",
              },
              {
                type: "list",
                items: [
                  "Swipe right to complete a task.",
                  "Swipe left to postpone it.",
                  "Swipe up to nudge collaborators.",
                  "Swipe down to archive it.",
                ],
              },
              {
                type: "paragraph",
                text: "That gave Nudge a clear product personality. It also meant every gesture had to connect to a real rule.",
              },
              {
                type: "paragraph",
                text: "For example, an owner could complete or archive a task, while a contributor with the nudger role could send a nudge. The interface had to feel immediate, but it could not let every user perform every action.",
              },
              {
                type: "paragraph",
                text: "The visual simplicity was therefore both a product decision and an engineering constraint.",
              },
            ],
          },
          {
            id: "approach",
            title: "The approach",
            eyebrow: "Technical approach",
            blocks: [],
            subsections: [
              {
                title: "Local first, then sync",
                blocks: [
                  {
                    type: "paragraph",
                    text: "Offline support was part of the product promise from the beginning.",
                  },
                  {
                    type: "paragraph",
                    text: "PowerSync gave the app a local data layer that could respond immediately and synchronize with Supabase when a connection was available.",
                  },
                  {
                    type: "paragraph",
                    text: "The key decision was to create a task locally first.",
                  },
                  {
                    type: "paragraph",
                    text: "When a user saved a task, Nudge generated its ID and wrote the task into the local store. The task appeared in the app without waiting for a successful network request. The sync layer then uploaded the change to Supabase when the app was online.",
                  },
                ],
              },
              {
                title: "Sync rules versus relationships",
                blocks: [
                  {
                    type: "paragraph",
                    text: "PowerSync was the right choice for local-first behavior, but it introduced a sync-model limitation.",
                  },
                  {
                    type: "paragraph",
                    text: "Nudge was relationship-heavy. A task was connected to:",
                  },
                  {
                    type: "list",
                    items: [
                      "Its creator.",
                      "Its participants.",
                      "Participant roles.",
                      "People who should receive activity and notifications.",
                    ],
                  },
                  {
                    type: "paragraph",
                    text: "Some features naturally depended on join-style queries: find the tasks connected to a user through the participant table, then bring related task and user data into the local experience.",
                  },
                  {
                    type: "paragraph",
                    text: "The legacy PowerSync Sync Rules setup did not support JOINs, including outer-join patterns some features needed.",
                  },
                  {
                    type: "paragraph",
                    text: "This created a split:",
                  },
                  {
                    type: "list",
                    items: [
                      "Supabase could represent and query the relationships correctly.",
                      "The sync configuration could not express the same logic directly.",
                    ],
                  },
                  {
                    type: "paragraph",
                    text: "As a result, data could exist correctly in Supabase while the local data was incomplete or did not arrive in the expected bucket.",
                  },
                ],
              },
            ],
          },
          {
            id: "architectural-adaptation",
            title: "Architectural adaptation",
            blocks: [
              {
                type: "paragraph",
                text: "The architecture was adapted around the limitation:",
              },
              {
                type: "list",
                items: [
                  "Sync task, participant, and user records as separate pieces of data.",
                  "Resolve relationship access through explicit IDs instead of depending on joined sync results.",
                  "Keep role checks and participant reads in the task service, where relationship logic could be controlled.",
                  "Keep the local PowerSync schema, Supabase tables, and sync configuration aligned as separate things to verify.",
                  "Add schema inspection, clean-start, and sync-test tooling so missing relationships could be traced instead of guessed at.",
                ],
              },
              {
                type: "paragraph",
                text: "This added work under the surface, but it created a more predictable boundary.",
              },
              {
                type: "callout",
                title: "Boundary",
                text: "PowerSync handled local task data and replication. The service layer assembled the collaborative view the product needed.",
              },
            ],
          },
          {
            id: "access-control",
            title: "Access control",
            eyebrow: "RLS, participants, and attachments",
            blocks: [
              {
                type: "paragraph",
                text: "Sync was not the only boundary between Supabase and the local experience.",
              },
              {
                type: "paragraph",
                text: "Row Level Security protected the data, but it also meant that a correct query was not enough. The user had to be authenticated, the task relationship had to be visible, and task attachments had to be readable through the right Storage access path.",
              },
              {
                type: "paragraph",
                text: "This became visible in two places:",
              },
              {
                type: "list",
                items: [
                  "Participant reads could return incomplete data when the current user's relationship to the task was not visible under the participants policy.",
                  "Owner-uploaded task images introduced a second permission boundary.",
                ],
              },
              {
                type: "paragraph",
                text: "Uploading the file and reading it back were separate access problems.",
              },
              {
                type: "paragraph",
                text: "A feature could look correct in the database and still appear empty in the app because RLS or Storage visibility filtered the response.",
              },
              {
                type: "paragraph",
                text: "The solution was not to bypass RLS. The app aligned its ownership model with Supabase Auth, made participant access policy-aware, tested authenticated reads and writes, and treated image upload/readback as a separate recoverable flow.",
              },
            ],
          },
          {
            id: "collaboration-model",
            title: "Collaboration model",
            blocks: [],
            subsections: [
              {
                title: "A task is also a relationship",
                blocks: [
                  {
                    type: "paragraph",
                    text: "Adding contributors changed the shape of the product.",
                  },
                  {
                    type: "paragraph",
                    text: "A task was no longer just a title and a status. It also needed to know:",
                  },
                  {
                    type: "list",
                    items: [
                      "Who created it.",
                      "Who could act on it.",
                      "Who should receive a nudge.",
                    ],
                  },
                  {
                    type: "paragraph",
                    text: "The participant model used two roles:",
                  },
                  {
                    type: "list",
                    items: ["Owner", "Nudger"],
                  },
                  {
                    type: "paragraph",
                    text: "That model made collaboration possible, but it revealed a timing problem.",
                  },
                  {
                    type: "paragraph",
                    text: "A locally created task could be visible on the device before its remote record existed. Participant records depended on that remote task record, so adding them too early could fail at the database relationship level.",
                  },
                  {
                    type: "paragraph",
                    text: "The solution was to separate the visible product flow from the underlying write order:",
                  },
                  {
                    type: "orderedList",
                    items: [
                      "The task was created locally and shown immediately.",
                      "The app waited until the task could be found in Supabase.",
                      "The owner and contributor relationships were then created.",
                      "The local task view was refreshed in the background.",
                    ],
                  },
                  {
                    type: "paragraph",
                    text: "The group still experienced one task-creation flow. The architecture handled the dependency in stages.",
                  },
                ],
              },
            ],
          },
          {
            id: "data-model",
            title: "Data model",
            blocks: [
              {
                type: "paragraph",
                text: "The collaboration model stayed deliberately small:",
              },
              {
                type: "list",
                items: [
                  "A user represented a person in the circle.",
                  "A task represented the work, its owner, and its lifecycle.",
                  "A participant connected a user to a task with a role.",
                ],
              },
              {
                type: "paragraph",
                text: "The participant model was the important piece. It expressed shared accountability without turning every task into a group chat or giving every collaborator the same permissions.",
              },
            ],
          },
          {
            id: "role-aware-gestures",
            title: "Role-aware gestures",
            blocks: [
              {
                type: "paragraph",
                text: "The swipe deck became more than a presentation component. It became the point where interaction, task state, and permissions met.",
              },
              {
                type: "paragraph",
                text: "Before a user acted on a task, the app loaded relevant participant information and resolved the current user's role. It also used the task creator as an immediate owner signal, which helped the top card remain responsive while role data was loading.",
              },
              {
                type: "paragraph",
                text: "The service layer still checked permissions before completing, archiving, or nudging.",
              },
              {
                type: "paragraph",
                text: "This created two layers of protection:",
              },
              {
                type: "list",
                items: [
                  "The interface guided the user toward valid actions.",
                  "The data operation rejected actions that did not match the user's role.",
                ],
              },
              {
                type: "paragraph",
                text: "Collaboration needed to feel lightweight, but it could not feel ambiguous.",
              },
            ],
          },
          {
            id: "debugging-tooling",
            title: "Debugging and tooling",
            blocks: [
              {
                type: "paragraph",
                text: "The biggest development slowdown came from the number of systems involved in a single task:",
              },
              {
                type: "list",
                items: [
                  "Mobile interface.",
                  "Local PowerSync database.",
                  "Supabase database.",
                  "Authentication and Row Level Security.",
                  "Participant relationships.",
                  "Remote sync rules.",
                  "Network state.",
                ],
              },
              {
                type: "paragraph",
                text: "When something failed, the visible symptom was often far from the root cause.",
              },
              {
                type: "paragraph",
                text: "A task might be missing because:",
              },
              {
                type: "list",
                items: [
                  "The local schema was stale.",
                  "The participant table was unavailable.",
                  "A sync rule was incomplete.",
                  "A pending operation was being replayed.",
                ],
              },
              {
                type: "paragraph",
                text: "The project gained debugging and recovery tooling:",
              },
              {
                type: "list",
                items: [
                  "Schema comparison tools.",
                  "Supabase inspection scripts.",
                  "Clean-start and reset flows.",
                  "Local insertion tools.",
                  "Sync simulations.",
                  "Debug task creation from inside the app.",
                ],
              },
              {
                type: "paragraph",
                text: "These tools were not part of the customer-facing experience, but they made the invisible system observable, repeatable, and easier to recover when local and remote states drifted apart.",
              },
            ],
          },
          {
            id: "what-shipped",
            title: "What shipped",
            eyebrow: "The outcome",
            blocks: [
              {
                type: "paragraph",
                text: "The project reached test and internal demo builds with stable local-to-Supabase task synchronization.",
              },
              {
                type: "paragraph",
                text: "The implemented system supported:",
              },
              {
                type: "list",
                items: [
                  "Local-first task creation.",
                  "Task ownership and contributor roles.",
                  "Role-aware complete, nudge, postpone, and archive actions.",
                  "Active, postponed, completed, and archived task views.",
                  "Participant-aware task visibility.",
                  "Background refresh and sync recovery behavior.",
                  "Notifications and task activity.",
                  "Task images and profile-related flows.",
                ],
              },
              {
                type: "paragraph",
                text: "The visible result was a small, approachable task app.",
              },
              {
                type: "paragraph",
                text: "The development result was a system that could keep a collaborative task coherent across local storage, remote data, user roles, and changing network conditions.",
              },
            ],
          },
          {
            id: "development-principle",
            title: "Development principle",
            blocks: [
              {
                type: "paragraph",
                text: "Nudge taught us to work backwards from the feeling the product needed to create.",
              },
              {
                type: "paragraph",
                text: "The feeling was immediacy:",
              },
              {
                type: "quote",
                text: "I should be able to capture a task and keep moving.",
              },
              {
                type: "paragraph",
                text: "The feeling was shared responsibility:",
              },
              {
                type: "quote",
                text: "This task should belong to the group, not only to the person who remembered it first.",
              },
              {
                type: "paragraph",
                text: "The feeling was clarity:",
              },
              {
                type: "quote",
                text: "Every gesture should have a clear meaning and every task should appear in the right place.",
              },
              {
                type: "paragraph",
                text: "Those feelings led to the major technical decisions:",
              },
              {
                type: "list",
                items: [
                  "Local-first creation for speed and offline support.",
                  "A participant model for shared accountability.",
                  "Explicit task states for reliable task movement.",
                  "Role-aware gestures for clear collaboration.",
                  "Recovery tooling for dependable development.",
                ],
              },
              {
                type: "paragraph",
                text: "The architecture was successful when users did not have to think about it.",
              },
            ],
          },
          {
            id: "why-this-work-matters",
            title: "Why this work matters",
            blocks: [
              {
                type: "paragraph",
                text: "Nudge is a useful example of the development work hidden inside a simple mobile product.",
              },
              {
                type: "paragraph",
                text: "The product surface was intentionally small. The engineering system underneath had to coordinate local data, remote sync, relationships, permissions, and state transitions without making the experience feel technical.",
              },
            ],
          },
        ],
        closingQuote:
          "We built Nudge as a simple social task app on the surface, powered by an offline-first collaborative architecture underneath.",
      },
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
          logoUrl: "https://ui-avatars.com/api/?name=Nudge&background=0d7377&color=fff&size=256",
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
      logoUrl: "https://ui-avatars.com/api/?name=Sonai&background=18181b&color=fff&size=256",
      description:
        "Built and maintained a workforce management platform for an MEP firm, supporting worker records, attendance, payroll automation, REST APIs, and secure AWS deployment.",
      technologies: ["React.js", "TypeScript", "Node.js", "MongoDB", "AWS"],
      projects: [
        {
          client: "Sonai Engineering & Services",
          project: "Workforce Management Platform",
          logoUrl: "https://ui-avatars.com/api/?name=Sonai&background=18181b&color=fff&size=256",
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
      logoUrl: "https://ui-avatars.com/api/?name=DRDO&background=0d7377&color=fff&size=256",
      description:
        "Developed backend systems and APIs for real-time LiDAR object-detection workflows, connecting Python data pipelines with Node.js services and WebGL/Three.js visualization systems.",
      technologies: ["Express.js", "Node.js", "Python", "Ouster SDK", "Three.js"],
      projects: [
        {
          client: "DRDO",
          project: "LiDAR Object Detection Backend",
          logoUrl: "https://ui-avatars.com/api/?name=DRDO&background=0d7377&color=fff&size=256",
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
} satisfies PortfolioContent;
