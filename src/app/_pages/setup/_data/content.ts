/**
 * Copy for the /setup page. Each fact lives in exactly one section, so the
 * page never repeats itself. Wrap tool names in **double asterisks** to set
 * them bold. File names, commands and IDs are code and are not translated.
 */

export type SetupSectionId =
  | "pipeline"
  | "plan"
  | "team"
  | "chaos"
  | "orchestration"
  | "handover"
  | "automation"
  | "desk";

export type SetupTaskStatus = "done" | "active" | "ready" | "blocked";
export type SetupCiState = "merged" | "progress" | "failed" | "completed";

export type SetupCopy = {
  schema: { name: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    titleMuted: string;
    lede: string;
    primaryCta: string;
    secondaryCta: string;
    indexAria: string;
    indexPath: string;
    index: Array<{ file: string; label: string; target: SetupSectionId }>;
  };
  pipeline: { eyebrow: string; title: string; intro: string };
  plan: {
    eyebrow: string;
    title: string;
    intro: string;
    prd: {
      file: string;
      tool: string;
      comment: string;
      sections: Array<{ heading: string; text: string; checkbox?: boolean }>;
    };
    tasks: {
      command: string;
      tool: string;
      aria: string;
      afterLabel: string;
      statusLabels: Record<SetupTaskStatus, string>;
      rows: Array<{ id: string; title: string; after?: string; status: SetupTaskStatus }>;
    };
  };
  team: {
    eyebrow: string;
    title: string;
    intro: string;
    caption: string;
    columns: { role: string; agent: string; stage: string; focus: string };
    rows: Array<{ role: string; agent: string; stage: string; focus: string }>;
  };
  chaos: {
    eyebrow: string;
    title: string;
    body: string[];
    log: {
      file: string;
      aria: string;
      levelLabels: { fail: string; warn: string };
      entries: Array<{ level: "fail" | "warn"; area: string; text: string }>;
      summary: string;
    };
  };
  orchestration: {
    eyebrow: string;
    title: string;
    intro: string;
    aria: string;
    levelLabel: string;
    whenLabel: string;
    steps: Array<{ tool: string; text: string; when: string }>;
  };
  handover: {
    eyebrow: string;
    title: string;
    intro: string;
    file: {
      name: string;
      sections: Array<{ heading: string; items: string[]; checklist?: boolean }>;
    };
    rules: { dontTitle: string; dont: string[]; doTitle: string; do: string[] };
  };
  automation: {
    eyebrow: string;
    title: string;
    intro: string;
    ci: {
      title: string;
      aria: string;
      events: Array<{ state: SetupCiState; label: string; text: string }>;
    };
    personal: { title: string; tag: string; aria: string; tasks: string[] };
  };
  desk: {
    eyebrow: string;
    title: string;
    items: Array<{ title: string; text: string }>;
  };
  closing: { title: string; text: string };
};

export const setupContent: SetupCopy = {
  schema: {
    name: "Setup and AI Workflow",
    description:
      "Pavan Patil's AI-assisted software workflow across planning, implementation, testing, review, automation, and hardware setup.",
  },
  hero: {
    eyebrow: "AI workflow and setup",
    title: "I use AI like an",
    titleMuted: "engineering team around me.",
    lede:
      "Agents plan, build, test and attack every feature. I keep the review and the merge. Below is the loop each feature runs through, one stage at a time.",
    primaryCta: "See the pipeline",
    secondaryCta: "View case studies",
    indexAria: "On this page",
    indexPath: "~/setup",
    index: [
      { file: "plan.md", label: "Planning and tasks", target: "plan" },
      { file: "agents.md", label: "Who does what", target: "team" },
      { file: "chaos.log", label: "What breaks", target: "chaos" },
      { file: "orchestrate/", label: "When to add structure", target: "orchestration" },
      { file: "HANDOVER.md", label: "Hand-off and review", target: "handover" },
      { file: "ci.yml", label: "Background agents", target: "automation" },
      { file: "desk.txt", label: "Hardware", target: "desk" },
    ],
  },
  pipeline: {
    eyebrow: "The loop",
    title: "One feature, from brainstorm to ship.",
    intro:
      "Planning splits a feature into tasks, and every task gets its own build, review and test run. When a test fails, only that task loops back. Nothing merges until all of them pass.",
  },
  plan: {
    eyebrow: "Plan",
    title: "Nothing gets built before it is written down.",
    intro:
      "This is where I lean on AI the most. A brainstorm with **Claude Opus** works through the problem, constraints, architecture options and test cases. **Spec Kit** turns it into a Master PRD, and **Beads** splits that into tasks small enough to review one by one.",
    prd: {
      file: "master-prd.md",
      tool: "Spec Kit",
      comment: "source of truth for every agent",
      sections: [
        { heading: "Why", text: "The problem, who has it and what it costs them." },
        { heading: "Goals", text: "What changes for the user once this ships." },
        { heading: "Architecture", text: "The option we chose, and the ones we ruled out." },
        {
          heading: "Acceptance criteria",
          text: "Each one written as a check an agent can run.",
          checkbox: true,
        },
        { heading: "Test cases", text: "Written now, before any code exists." },
      ],
    },
    tasks: {
      command: "bd list",
      tool: "Beads",
      aria: "Beads task list for one feature",
      afterLabel: "after",
      statusLabels: {
        done: "done",
        active: "in progress",
        ready: "ready",
        blocked: "blocked",
      },
      rows: [
        { id: "bd-1", title: "Data model and migrations", status: "done" },
        { id: "bd-2", title: "API for the new flow", after: "bd-1", status: "active" },
        { id: "bd-3", title: "Interface and empty states", after: "bd-2", status: "blocked" },
        { id: "bd-4", title: "Tests from the acceptance criteria", status: "ready" },
        { id: "bd-5", title: "Handover notes", after: "bd-2, bd-3", status: "blocked" },
      ],
    },
  },
  team: {
    eyebrow: "The team",
    title: "Two agents build. The rest check the work.",
    intro:
      "Each agent stays inside one domain. The PRD and the task list keep all of them pointed at the same result.",
    caption: "Agent roles on a feature",
    columns: { role: "Role", agent: "Agent", stage: "Stage", focus: "Focus" },
    rows: [
      {
        role: "Frontend",
        agent: "Codex",
        stage: "Build",
        focus:
          "Interfaces, layouts and responsive behaviour, kept close to the existing design system.",
      },
      {
        role: "Backend",
        agent: "Claude Opus · terminal",
        stage: "Build",
        focus: "Architecture, APIs, data models and service-level trade-offs.",
      },
      {
        role: "Chaos",
        agent: "Chaos pass",
        stage: "Review",
        focus: "Attacks the build before anyone else sees it.",
      },
      {
        role: "Testing",
        agent: "Claude Sonnet",
        stage: "Test",
        focus: "Acceptance criteria, test coverage, linting and edge cases.",
      },
      {
        role: "Docs",
        agent: "Docs pass",
        stage: "Wrap-up",
        focus:
          "Implementation notes, handover files and repo context that stay readable after the coding pass.",
      },
    ],
  },
  chaos: {
    eyebrow: "Chaos engineering",
    title: "One agent's only job is to break the build.",
    body: [
      "It hunts for the places where the system works only when everything goes right, and puts that pressure on the design before users do.",
      "That turns AI from a builder into a reviewer that goes looking for failure.",
    ],
    log: {
      file: "chaos.log",
      aria: "Example report from the chaos agent",
      levelLabels: { fail: "fail", warn: "warn" },
      entries: [
        { level: "fail", area: "assumption", text: "A field the code relies on arrives empty." },
        { level: "fail", area: "edge case", text: "An empty list renders a broken layout." },
        { level: "warn", area: "recovery", text: "A failed retry leaves the spinner running." },
        { level: "fail", area: "state", text: "Going back restores a half-saved form." },
        { level: "fail", area: "race", text: "Two quick saves overwrite each other." },
        { level: "warn", area: "user flow", text: "One step has no clear way back." },
        { level: "warn", area: "happy path", text: "It works only while the network holds." },
      ],
      summary: "4 failed, 3 warnings · sent back to build",
    },
  },
  orchestration: {
    eyebrow: "Orchestration",
    title: "Bigger systems get more structure, not more agents.",
    intro:
      "I add a layer only when the one below stops holding the work together. At every level, **Git** stays the single source of truth.",
    aria: "Orchestration tools, from the least structure to the most",
    levelLabel: "Level",
    whenLabel: "Step up when",
    steps: [
      {
        tool: "Warp",
        text: "Starts the agents, coordinates them and keeps every role tied to the current plan.",
        when: "A feature needs more than one agent.",
      },
      {
        tool: "AO or Python",
        text: "**Agent Orchestrator** or a Python script fixes the order of agents, their retries, hand-offs and checkpoints.",
        when: "The run needs tighter control.",
      },
      {
        tool: "LangGraph",
        text: "Models the work as a graph of agents instead of one loop.",
        when: "A feature outgrows a simple agent loop.",
      },
      {
        tool: "Temporal",
        text: "Durable orchestration for long runs that have to survive failures.",
        when: "Reliability matters most.",
      },
    ],
  },
  handover: {
    eyebrow: "Handover and review",
    title: "Handover files keep repos in step. The merge stays with me.",
    intro:
      "When a project spans several directories or repositories, a handover file travels with the work, so frontend, backend, tests and docs don't drift apart.",
    file: {
      name: "HANDOVER.md",
      sections: [
        { heading: "What changed", items: ["Every edit, listed per repo and directory"] },
        {
          heading: "Still to do",
          items: ["Open tasks, and who picks each one up"],
          checklist: true,
        },
        { heading: "Shared assumptions", items: ["The contracts every side builds against"] },
      ],
    },
    rules: {
      dontTitle: "Agents never",
      dont: ["Open pull requests on their own.", "Merge their own code."],
      doTitle: "I always",
      do: [
        "Review uncommitted changes by hand before a commit or merge.",
        "Rerun the agent, fix it by hand or write the missing part myself when the result falls short.",
        "Do git review and small fixes in **Cursor**, my main IDE, with quick agents on the side.",
      ],
    },
  },
  automation: {
    eyebrow: "Automation",
    title: "Background agents report back, so I don't go checking.",
    intro:
      "Two agents run without me watching: one for the codebase, one for the rest of the day.",
    ci: {
      title: "GitHub Actions agents",
      aria: "Deployment updates from GitHub Actions agents",
      events: [
        { state: "merged", label: "Merged", text: "Reviewed changes are on the main branch." },
        { state: "progress", label: "In progress", text: "The deployment is running." },
        { state: "failed", label: "Failed", text: "The deployment stopped and needs a look." },
        { state: "completed", label: "Completed", text: "The deployment is live." },
      ],
    },
    personal: {
      title: "Hermes agent",
      tag: "self-hosted",
      aria: "What the Hermes agent handles",
      tasks: ["Starts the day", "Checks email", "Reviews meetings", "Handles small personal tasks"],
    },
  },
  desk: {
    eyebrow: "Working setup",
    title: "The hardware stays simple and reliable.",
    items: [
      {
        title: "Primary machine",
        text: "MacBook Air M5 for development, AI-assisted coding, planning, review, and shipping work.",
      },
      {
        title: "Secondary machine",
        text: "MacBook M1 for personal work and a separate secondary environment.",
      },
      {
        title: "Desk",
        text: "BenQ 27-inch 2790Q monitor with a Logitech Pebble 2 for the everyday setup.",
      },
    ],
  },
  closing: {
    title: "The setup keeps changing, but the direction is consistent.",
    text: "Faster feedback, better thinking, fewer repetitive steps, and more time spent on the parts of software that need taste, judgment, and care.",
  },
};
