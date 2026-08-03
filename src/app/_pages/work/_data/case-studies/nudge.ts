import type { ProjectCaseStudy } from "@/lib/portfolio-types";

export const nudge = {
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
    src: "/nudge-iphone-trio.png",
    alt: "Three iPhone screens showing the Nudge social task app interface",
    caption: "Nudge task deck across owner and collaborator flows",
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
            text: "Nudge is a social task app for people who plan together repeatedly: friends arranging a trip, housemates sharing routines, or small groups coordinating an event. A person creates a task, adds the people involved, and the group can keep that work moving without turning the task into a chat thread.",
          },
          {
            type: "paragraph",
            text: "The product was deliberately small. Its interaction model used four gestures—complete, postpone, nudge, and archive—while the system underneath handled local state, shared ownership, permissions, and synchronization.",
          },
          {
            type: "callout",
            title: "Product tension",
            text: "The interface felt simple only because the architecture absorbed the complexity.",
          },
        ],
      },
      {
        id: "problem",
        title: "The problem",
        blocks: [
          {
            type: "paragraph",
            text: "In many groups, planning is shared in theory but managed by one person in practice. That person remembers the plan, follows up, and keeps track of what remains unfinished. Nudge was designed to distribute that responsibility while keeping the experience as immediate as a personal task app.",
          },
          {
            type: "paragraph",
            text: "The difficult part was not rendering a card or adding swipe animation. A task had to work with an unreliable network, multiple participants, distinct roles, remote updates, and lifecycle states without allowing an invalid action or leaving people with conflicting views of the same work.",
          },
        ],
      },
      {
        id: "local-first-sync",
        title: "Local-first task creation",
        eyebrow: "Technical approach",
        blocks: [
          {
            type: "paragraph",
            text: "Offline support was part of the product promise from the beginning. PowerSync provided a local data layer that could respond immediately and synchronize with Supabase when a connection became available.",
          },
          {
            type: "paragraph",
            text: "When someone saved a task, the app generated its ID and wrote it to the local store first. The task appeared without waiting for a network request; the sync layer replicated the change to Supabase when the device was online. This made task creation feel responsive while preserving a clear path to the shared source of truth.",
          },
        ],
      },
      {
        id: "relationship-boundary",
        title: "Relationship and sync boundaries",
        blocks: [
          {
            type: "paragraph",
            text: "Nudge was relationship-heavy: a task connected its creator, participants, participant roles, and people who could receive activity or notifications. Supabase could model those relationships, but the legacy PowerSync Sync Rules setup could not express the JOIN and outer-join patterns that some local views needed.",
          },
          {
            type: "paragraph",
            text: "I treated replication and relationship assembly as separate concerns. Task, participant, and user records synchronized independently; the task service resolved their explicit IDs and applied the product's relationship logic. That boundary made it possible to investigate missing local data without guessing whether the issue was in the database, schema, sync configuration, or service layer.",
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
            text: "Row Level Security protected the shared data, but it also made authentication and relationship visibility part of the feature. A valid query was not enough: the current user needed the right participant relationship, and task images needed the correct Supabase Storage access path.",
          },
          {
            type: "paragraph",
            text: "Participant reads and image access were tested as distinct authenticated flows. Rather than bypassing RLS, I aligned the ownership model with Supabase Auth, made participant reads policy-aware, and treated upload and readback as separate recoverable operations.",
          },
        ],
      },
      {
        id: "collaboration-model",
        title: "Collaboration model",
        blocks: [
          {
            type: "paragraph",
            text: "The core data model stayed deliberately small: a user represented a person in the group, a task represented the work and its lifecycle, and a participant connected the two with a role. The two roles—owner and nudger—gave the app shared accountability without giving every collaborator the same permissions.",
          },
          {
            type: "paragraph",
            text: "Creating a task exposed an important timing dependency. The task could appear locally before its remote record existed, while participant records depended on that remote record. The app therefore showed the new task immediately, waited for Supabase to make it available, created the owner and contributor relationships, and refreshed the local view in the background. Users experienced one flow even though the write sequence had to be staged.",
          },
        ],
      },
      {
        id: "role-aware-gestures",
        title: "Role-aware gestures",
        blocks: [
          {
            type: "paragraph",
            text: "The swipe deck was the point where interaction, task state, and permissions met. Before an action, the app loaded relevant participant data and resolved the current user's role; the task creator also provided an immediate owner signal while role data was still loading.",
          },
          {
            type: "paragraph",
            text: "The interface guided people toward the actions available to them, and the service layer checked the same permissions before completing, archiving, or nudging. That paired UI and data validation kept collaboration lightweight without making it ambiguous.",
          },
        ],
      },
      {
        id: "debugging-and-delivery",
        title: "Making the system observable",
        blocks: [
          {
            type: "paragraph",
            text: "A missing task could originate in the mobile interface, local PowerSync database, Supabase database, authentication policy, participant relationship, sync rules, or network state. Because the visible symptom was often distant from the cause, the project needed diagnostics as much as product code.",
          },
          {
            type: "paragraph",
            text: "I added schema comparison and Supabase inspection tools, clean-start and reset flows, local insertion helpers, and sync simulations. These tools made local and remote state easier to compare, reproduce, and recover when they drifted apart.",
          },
          {
            type: "paragraph",
            text: "The result reached test and internal demo builds with stable local-to-Supabase synchronization, participant-aware visibility, role-aware actions, notifications, images, and recovery behavior. The visible product remained a small task app; the engineering outcome was a dependable collaborative system underneath it.",
          },
        ],
      },
      {
        id: "principle",
        title: "What guided the work",
        blocks: [
          {
            type: "paragraph",
            text: "The technical decisions all worked backward from the product feeling: capture a task quickly, make shared responsibility clear, and ensure every gesture has a predictable result. Local-first creation supported immediacy; the participant model supported accountability; explicit states, role-aware actions, and recovery tooling supported clarity.",
          },
          {
            type: "quote",
            text: "The architecture was successful when users did not have to think about it.",
          },
        ],
      },
    ],
    closingQuote:
      "We built Nudge as a simple social task app on the surface, powered by an offline-first collaborative architecture underneath.",
  },
} satisfies ProjectCaseStudy;
