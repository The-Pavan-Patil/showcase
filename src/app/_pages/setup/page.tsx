import {
  ArrowRight,
  ClipboardCheck,
  Code2,
  FileText,
  GitBranch,
  Laptop,
  Monitor,
  Network,
  Quote,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { ScrollAccent } from "@/components/scroll-accent";
import { getHomePath, getSetupPath, type Locale } from "@/lib/i18n";
import { getPortfolioContent } from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";
import { uiCopyByLocale } from "@/lib/ui-copy";

/** Wrap any phrase in **double asterisks** to render it bold. */
function richText(input: string) {
  return input.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

const workflowStats = [
  { value: "01", label: "Master PRD" },
  { value: "04+", label: "agents per feature" },
  { value: "Manual", label: "git control" },
  { value: "CI/CD", label: "deployment checks" },
] as const;

const workflowSteps = [
  {
    title: "Brainstorm the system",
    text:
      "I start with **Claude Opus** for planning and architecture. The first pass is a brainstorming session around the problem, constraints, architecture options, goals, acceptance criteria, and test cases.",
  },
  {
    title: "Shape the Master PRD",
    text:
      "I use **Spec Kit** and **Beads** on top of the brainstorming work to turn the idea into a Master PRD. That document becomes the source of truth for what we are building, why it matters, and how it will be accepted.",
  },
  {
    title: "Break work into tasks",
    text:
      "For large projects and small features, I use **Beads** to split the work into clear tasks. It keeps features from turning into one vague brief and makes progress easier to review.",
  },
  {
    title: "Run agents by role",
    text:
      "Once the plan is ready, I run **multiple agents** over the feature. Two agents usually implement, other agents check tests, linting, edge cases, and documentation.",
  },
] as const;

const agentRoles = [
  {
    icon: Code2,
    title: "Frontend agent",
    label: "Codex",
    text:
      "I use **Codex** especially for frontend work: building interfaces, refining layouts, checking responsive behavior, and keeping implementation close to the existing design system.",
  },
  {
    icon: Network,
    title: "Backend agent",
    label: "Opus terminal",
    text:
      "For backend-heavy work, I use an **Opus terminal** where the agent can stay focused on architecture, APIs, data models, and service-level tradeoffs.",
  },
  {
    icon: ClipboardCheck,
    title: "Testing agent",
    label: "Sonnet",
    text:
      "I use **Sonnet** for testing-focused passes: checking acceptance criteria, test coverage, linting, and edge cases that should be verified before the feature is considered done.",
  },
  {
    icon: FileText,
    title: "Documentation agent",
    label: "Docs pass",
    text:
      "One agent can focus on documentation so the implementation notes, handover files, and repo context stay readable after the coding pass is finished.",
  },
] as const;

const controlPoints = [
  "I do not like agents raising PRs and auto-merging code for me.",
  "I review uncommitted features manually before committing or merging.",
  "If I am not satisfied, I rerun the agent, make manual fixes, or code the missing parts directly.",
  "Cursor is my primary IDE for git review, small fixes, quick agents, and manual control.",
] as const;

const repoSyncNotes = [
  "When a project spans multiple directories or repositories, I create handover markdown files.",
  "The handover files explain what changed, what still needs to be done, and which assumptions are shared.",
  "This keeps frontend, backend, tests, documentation, and parallel repo work from drifting apart.",
] as const;

const tools = [
  {
    title: "Planning",
    items: ["Claude Opus", "Spec Kit", "Beads", "Master PRD"],
  },
  {
    title: "Implementation",
    items: ["Codex", "Opus terminal", "Cursor Auto Agent", "manual coding"],
  },
  {
    title: "Review",
    items: ["Sonnet", "ESLint", "test cases", "chaos engineering agent"],
  },
  {
    title: "Automation",
    items: ["GitHub Actions", "CI/CD agents", "Hermas agent", "handover markdown"],
  },
] as const;

const deskSetup = [
  {
    icon: Laptop,
    title: "Primary machine",
    text: "MacBook Air M5 for development, AI-assisted coding, planning, review, and shipping work.",
  },
  {
    icon: Laptop,
    title: "Secondary machine",
    text: "MacBook M1 for personal work and a separate secondary environment.",
  },
  {
    icon: Monitor,
    title: "Desk",
    text: "BenQ 27-inch 2790Q monitor with a Logitech Pebble 2 for the everyday setup.",
  },
] as const;

function SetupEyebrow({
  anchor,
  children,
  fallback = false,
}: {
  anchor: string;
  children: string;
  fallback?: boolean;
}) {
  return (
    <p className="eyebrow scroll-accent-eyebrow">
      <span
        className={
          fallback
            ? "scroll-accent-heading-target scroll-accent-fallback"
            : "scroll-accent-heading-target"
        }
        data-scroll-accent-anchor={anchor}
        data-scroll-accent-phase="heading"
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

export function SetupPage({ locale }: { locale: Locale }) {
  const siteUrl = getSiteUrl();
  const ui = uiCopyByLocale[locale];
  const { profile, socialLinks } = getPortfolioContent(locale);
  const canonicalPath = getSetupPath(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Setup and AI Workflow",
          description:
            "Pavan Patil's AI-assisted software workflow across planning, implementation, testing, review, automation, and hardware setup.",
          url: `${siteUrl}${canonicalPath}`,
          mainEntity: {
            "@type": "Person",
            name: profile.name,
            jobTitle: profile.role,
          },
        }}
      />
      <ScrollAccent />
      <main id="main-content" className="setup-main">
        <section className="setup-hero" aria-labelledby="setup-title">
          <Container>
            <div className="setup-hero-grid">
              <div className="setup-hero-copy">
                <SetupEyebrow anchor="hero" fallback>
                  AI workflow and Setup
                </SetupEyebrow>
                <h1 id="setup-title">
                  I use AI like an engineering team around me.
                </h1>
                <p className="setup-lede">
                  One agent helps plan, others implement, others test, one tries
                  to break the system, and I keep final control over review, git,
                  and shipping.
                </p>
                <div className="hero-actions setup-hero-actions">
                  <Link className="primary-cta" href="#workflow">
                    View workflow
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                  <Link className="secondary-cta" href={getHomePath(locale)}>
                    Back home
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                </div>
              </div>

              <div className="setup-command-panel" aria-label="AI workflow summary">
                <div className="window-bar">
                  <span />
                  <span />
                  <span />
                  <p>ai-workflow.md</p>
                  <strong>merge</strong>
                </div>
                <div className="setup-command-body">
                  <p>
                    <span>plan</span>
                    Claude Opus + Spec Kit
                  </p>
                  <p>
                    <span>tasks</span>
                    Beads breakdown
                  </p>
                  <p>
                    <span>build</span>
                    Codex + Opus agents
                  </p>
                  <p>
                    <span>verify</span>
                    Sonnet + chaos pass
                  </p>
                  <p>
                    <span>ship</span>
                    manual git + CI/CD agents
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="setup-stats" aria-label="AI workflow facts">
          <Container>
            <div className="setup-stats-grid">
              {workflowStats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="setup-section" id="workflow" aria-labelledby="workflow-heading">
          <Container>
            <div className="setup-section-heading">
              <SetupEyebrow anchor="workflow">
                Planning pipeline
              </SetupEyebrow>
              <h2 id="workflow-heading">The work starts before code.</h2>
              <p>
                I use AI most heavily at the beginning of a feature, when the
                architecture, acceptance criteria, and test cases need to become
                clear enough for multiple agents to work without losing the
                original intent.
              </p>
            </div>

            <div className="setup-timeline">
              {workflowSteps.map((step, index) => (
                <article key={step.title} className="setup-timeline-item">
                  <span className="setup-step-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{richText(step.text)}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="setup-section setup-section-muted" aria-labelledby="agents-heading">
          <Container>
            <div className="setup-section-heading">
              <SetupEyebrow anchor="agents">
                Multi-agent setup
              </SetupEyebrow>
              <h2 id="agents-heading">Agents have roles, not unlimited control.</h2>
              <p>
                I split agent work by responsibility. That keeps each agent close
                to a domain while the PRD, Beads tasks, and acceptance criteria
                keep the overall system aligned.
              </p>
            </div>

            <div className="setup-agent-grid">
              {agentRoles.map((role) => {
                const Icon = role.icon;

                return (
                  <article key={role.title} className="setup-agent-card">
                    <div className="setup-agent-icon">
                      <Icon aria-hidden="true" size={20} />
                    </div>
                    <p>{role.label}</p>
                    <h3>{role.title}</h3>
                    <span>{richText(role.text)}</span>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="setup-chaos-section" aria-labelledby="chaos-heading">
          <Container>
            <div className="setup-chaos-grid">
              <div>
                <SetupEyebrow anchor="chaos">
                  Chaos engineer
                </SetupEyebrow>
                <h2 id="chaos-heading">An agent built to break code.</h2>
              </div>
              <div className="setup-chaos-copy">
                {/* <ShieldAlert aria-hidden="true" size={24} /> */}
                <p>
                  The **chaos engineering agent** breaks the code intentionally and looks for broken assumptions,
                  missing edge cases, weak recovery paths, bad states, race
                  conditions, unclear user flows, and places where the system
                  works only when everything goes perfectly.
                </p>
                <p>
                  I like this role because it adds pressure to the design before
                  users do. It turns AI from only a builder into a reviewer that
                  actively searches for failure.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="setup-section" aria-labelledby="control-heading">
          <Container>
            <div className="setup-two-column">
              <div className="setup-section-heading">
                <SetupEyebrow anchor="control">
                  Git and review
                </SetupEyebrow>
                <h2 id="control-heading">Manual control stays with me.</h2>
                <p>
                  Agents can move quickly, but the final engineering decision
                  should still be mine. I use AI to increase leverage, not to
                  hand over the merge button.
                </p>
              </div>

              <ol className="setup-check-list">
                {controlPoints.map((point) => (
                  <li key={point}>
                    <span>{richText(point)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>

        <section className="setup-section setup-section-muted" aria-labelledby="sync-heading">
          <Container>
            <div className="setup-two-column">
              <div className="setup-section-heading">
                <SetupEyebrow anchor="sync">
                  Repo sync
                </SetupEyebrow>
                <h2 id="sync-heading">Handover files keep parallel work aligned.</h2>
              </div>

              <div className="setup-sync-list">
                {repoSyncNotes.map((note) => (
                  <p key={note}>
                    <GitBranch aria-hidden="true" size={17} />
                    <span>{richText(note)}</span>
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="setup-section" aria-labelledby="tools-heading">
          <Container>
            <div className="setup-section-heading">
              <SetupEyebrow anchor="tools">
                Toolchain
              </SetupEyebrow>
              <h2 id="tools-heading">A small system around planning, building, and review.</h2>
            </div>

            <div className="setup-tool-grid">
              {tools.map((group) => (
                <article key={group.title} className="setup-tool-card">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{richText(item)}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="setup-section setup-section-muted" aria-labelledby="automation-heading">
          <Container>
            <div className="setup-two-column">
              <div className="setup-section-heading">
                <SetupEyebrow anchor="automation">
                  Automation
                </SetupEyebrow>
                <h2 id="automation-heading">CI/CD and personal agents handle the background checks.</h2>
                <p>
                  **GitHub Actions agents** tell me whether deployment is in process,
                  failed, merged, or completed. For personal automation, I use a
                  self-hosted **Hermas agent** for starting the day, checking emails,
                  reviewing meetings, and handling small personal tasks.
                </p>
              </div>

              <div className="setup-automation-panel">
                <Workflow aria-hidden="true" size={24} />
                <strong>Plan - build - verify - review - ship</strong>
                <p>
                  The setup keeps fast feedback around the work while preserving
                  manual review at the points that matter.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="setup-section setup-desk-section" aria-labelledby="desk-heading">
          <Container>
            <div className="setup-section-heading">
              <SetupEyebrow anchor="desk">
                Working setup
              </SetupEyebrow>
              <h2 id="desk-heading">The hardware stays simple and reliable.</h2>
            </div>

            <div className="setup-desk-grid">
              {deskSetup.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title}>
                    <Icon aria-hidden="true" size={21} />
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="setup-closing" aria-labelledby="setup-closing-heading">
          <Container>
            <blockquote className="setup-closing-quote">
              {/* <Quote aria-hidden="true" size={28} /> */}
              <h2 id="setup-closing-heading">
                The setup keeps changing, but the direction is consistent.
              </h2>
            </blockquote>
            <p>
              Faster feedback, better thinking, fewer repetitive steps, and more
              time spent on the parts of software that need taste, judgment, and
              care.
            </p>
          </Container>
        </section>
      </main>
      <SiteFooter
        copy={{ ...ui.footer, brandAria: ui.header.brandAria, navigation: ui.header.navigation }}
        locale={locale}
        profile={profile}
        socialLinks={socialLinks}
      />
    </>
  );
}
