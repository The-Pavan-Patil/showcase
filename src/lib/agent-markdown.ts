/**
 * Markdown versions of the English pages, for AI agents and answer engines.
 *
 * Agents prefer Markdown when a site offers it: no scripts, no motion markup,
 * every fact in one pass. Each page is reachable two ways (see the rewrites
 * in next.config.ts):
 *   - its URL plus `.md` (`/index.md` for the home page), and
 *   - its normal URL with `Accept: text/markdown`.
 * Every document names its canonical HTML page, so agents cite the page
 * people should open rather than the Markdown mirror.
 *
 * Built only from the same content modules as the pages, so the two never
 * disagree.
 */
import { setupCopyByLocale } from "@/app/_pages/setup/_data/locales";
import type { CaseStudyTextBlock, ProjectCaseStudy } from "@/lib/portfolio-types";
import { baseLocation, getClients, getDisambiguation } from "@/lib/identity";
import { getPortfolioContent } from "@/lib/portfolio";
import { getGoogleCalendarBookingUrl } from "@/lib/scheduling";
import { getSiteUrl, resumeUrl } from "@/lib/site";
import { uiCopyByLocale } from "@/lib/ui-copy";

const homeKey = "index";

/** Every Markdown document, keyed by its page path without the leading slash. */
export function getMarkdownKeys() {
  const { projects } = getPortfolioContent("en");
  return [homeKey, "setup", ...projects.map((project) => `work/${project.slug}`)];
}

/** The HTML page a Markdown document mirrors, e.g. `work/nudge` → `/work/nudge`. */
export function getCanonicalPath(key: string) {
  return key === homeKey ? "/" : `/${key}`;
}

/** The public Markdown URL of a page, e.g. `/` → `/index.md`. */
export function getMarkdownPath(key: string) {
  return `/${key}.md`;
}

export function getMarkdownDocument(key: string): string | undefined {
  if (key === homeKey) return getHomeMarkdown();
  if (key === "setup") return getSetupMarkdown();

  const slug = key.startsWith("work/") ? key.slice("work/".length) : undefined;
  const project = slug
    ? getPortfolioContent("en").projects.find((item) => item.slug === slug)
    : undefined;
  return project ? getCaseStudyMarkdown(project) : undefined;
}

/** All documents in one file, for /llms-full.txt. */
export function getFullSiteMarkdown() {
  return getMarkdownKeys()
    .map((key) => getMarkdownDocument(key))
    .filter((document): document is string => Boolean(document))
    .join("\n\n---\n\n");
}

function getHomeMarkdown() {
  const siteUrl = getSiteUrl();
  const ui = uiCopyByLocale.en;
  const { profile, socialLinks, experience, skillGroups, projects } = getPortfolioContent("en");
  const current = experience.find((item) => /present/i.test(item.period));
  const bookingUrl = getGoogleCalendarBookingUrl();

  return lines([
    `# ${profile.name} — ${profile.role}`,
    "",
    `> ${ui.metadata.description}`,
    "",
    getDisambiguation(),
    "",
    `Canonical page: ${siteUrl}/`,
    "",
    "## At a glance",
    "",
    `- Name: ${profile.name}`,
    current
      ? `- Current role: ${current.role} at ${current.company} (${current.period})`
      : `- Role: ${profile.role}`,
    `- Based in: ${baseLocation}. Open to roles in Japan.`,
    `- Built for: ${getClients().join(", ")}`,
    `- Education: ${profile.education}`,
    `- Email: ${profile.email}`,
    `- Website: ${siteUrl}/`,
    ...socialLinks.map((link) => `- ${link.label}: ${link.href}`),
    `- Résumé: ${resumeUrl}`,
    "",
    "## Experience",
    "",
    ...experience.flatMap((item) => [
      `### ${item.role}, ${item.company}`,
      "",
      `${item.period} · ${item.location}`,
      "",
      item.description,
      "",
      `Technologies: ${item.technologies.join(", ")}`,
      "",
      ...(item.projects?.length
        ? [
            ...item.projects.map(
              (project) =>
                `- **${project.project}** (client: ${project.client}). ${project.description} Technologies: ${project.technologies.join(", ")}.`,
            ),
            "",
          ]
        : []),
    ]),
    "## Case studies",
    "",
    ...projects.map(
      (project) =>
        `- [${project.title}](${siteUrl}/work/${project.slug}): ${project.kicker}. ${project.summary}`,
    ),
    "",
    "## Skills",
    "",
    ...skillGroups.map((group) => `- ${group.label}: ${group.skills.join(", ")}`),
    "",
    "## AI workflow",
    "",
    ...ui.home.aiWorkflow.steps.map((step, index) => `${index + 1}. **${step.title}.** ${step.text}`),
    "",
    `Full write-up: ${siteUrl}/setup`,
    "",
    "## About",
    "",
    profile.about,
    "",
    `### ${ui.home.beyondCode}: ${lowerFirst(ui.home.beyondHeading)}`,
    "",
    ...ui.home.personalNotes.map((note) => `- **${note.label}.** ${note.text}`),
    "",
    "## Contact",
    "",
    `${ui.home.contactTitle} ${ui.home.contactDescription}`,
    "",
    `- Email: ${profile.email}`,
    ...(bookingUrl ? [`- Book a call: ${bookingUrl}`] : []),
  ]);
}

function getCaseStudyMarkdown(project: ProjectCaseStudy) {
  const siteUrl = getSiteUrl();
  const article = project.caseStudy;

  return lines([
    `# ${project.title}: ${project.kicker}`,
    "",
    `> ${article?.oneLineSummary ?? project.summary}`,
    "",
    `A case study by Pavan Patil. Canonical page: ${siteUrl}/work/${project.slug}`,
    "",
    `- Role: ${project.role}`,
    `- Context: ${project.experienceContext}`,
    `- Client: ${project.client}`,
    `- Technologies: ${project.technologies.join(", ")}`,
    ...(project.liveUrl ? [`- Live product: ${project.liveUrl}`] : []),
    "",
    "## Summary",
    "",
    project.summary,
    "",
    `**Challenge.** ${project.challenge}`,
    "",
    `**Approach.** ${project.approach}`,
    "",
    `**Outcome.** ${project.outcome}`,
    "",
    "## Contributions",
    "",
    ...project.contributions.map((item) => `- ${item}`),
    "",
    "## Results",
    "",
    ...project.metrics.map((metric) => `- ${metric.value}: ${metric.label}`),
    "",
    ...(article
      ? article.sections.flatMap((section) => [
          `## ${section.title}`,
          "",
          ...renderBlocks(section.blocks),
          ...(section.subsections ?? []).flatMap((subsection) => [
            `### ${subsection.title}`,
            "",
            ...renderBlocks(subsection.blocks),
          ]),
        ])
      : []),
    ...(article?.closingQuote ? [`> ${article.closingQuote}`, ""] : []),
    `More from Pavan Patil: ${siteUrl}/`,
  ]);
}

function getSetupMarkdown() {
  const siteUrl = getSiteUrl();
  const copy = setupCopyByLocale.en;

  return lines([
    `# ${copy.schema.name} — Pavan Patil`,
    "",
    `> ${copy.schema.description}`,
    "",
    `Canonical page: ${siteUrl}/setup`,
    "",
    `**${copy.hero.title} ${copy.hero.titleMuted}** ${copy.hero.lede}`,
    "",
    `## ${copy.pipeline.title}`,
    "",
    copy.pipeline.intro,
    "",
    `## ${copy.plan.title}`,
    "",
    copy.plan.intro,
    "",
    `The Master PRD (${copy.plan.prd.tool}) covers:`,
    "",
    ...copy.plan.prd.sections.map((section) => `- **${section.heading}.** ${section.text}`),
    "",
    `## ${copy.team.title}`,
    "",
    copy.team.intro,
    "",
    `| ${copy.team.columns.role} | ${copy.team.columns.agent} | ${copy.team.columns.stage} | ${copy.team.columns.focus} |`,
    "| --- | --- | --- | --- |",
    ...copy.team.rows.map((row) => `| ${row.role} | ${row.agent} | ${row.stage} | ${row.focus} |`),
    "",
    `## ${copy.chaos.title}`,
    "",
    ...copy.chaos.body.flatMap((paragraph) => [paragraph, ""]),
    "What the chaos pass typically catches:",
    "",
    ...copy.chaos.log.entries.map((entry) => `- ${entry.area}: ${entry.text}`),
    "",
    `## ${copy.orchestration.title}`,
    "",
    copy.orchestration.intro,
    "",
    ...copy.orchestration.steps.map(
      (step) => `- **${step.tool}.** ${step.text} ${copy.orchestration.whenLabel}: ${lowerFirst(step.when)}`,
    ),
    "",
    `## ${copy.handover.title}`,
    "",
    copy.handover.intro,
    "",
    `${copy.handover.rules.dontTitle}:`,
    "",
    ...copy.handover.rules.dont.map((item) => `- ${lowerFirst(item)}`),
    "",
    `${copy.handover.rules.doTitle}:`,
    "",
    ...copy.handover.rules.do.map((item) => `- ${lowerFirst(item)}`),
    "",
    `## ${copy.automation.title}`,
    "",
    copy.automation.intro,
    "",
    `- **${copy.automation.ci.title}.** ${copy.automation.ci.events.map((event) => `${event.label}: ${lowerFirst(event.text)}`).join(" ")}`,
    `- **${copy.automation.personal.title}** (${copy.automation.personal.tag}). ${copy.automation.personal.tasks.map((task, index) => (index ? lowerFirst(task) : task)).join(", ")}.`,
    "",
    `## ${copy.desk.title}`,
    "",
    ...copy.desk.items.map((item) => `- **${item.title}.** ${item.text}`),
    "",
    `## ${copy.closing.title}`,
    "",
    copy.closing.text,
    "",
    `More from Pavan Patil: ${siteUrl}/`,
  ]);
}

function renderBlocks(blocks: CaseStudyTextBlock[]) {
  return blocks.flatMap((block) => {
    switch (block.type) {
      case "paragraph":
        return [block.text, ""];
      case "list":
        return [...block.items.map((item) => `- ${item}`), ""];
      case "orderedList":
        return [...block.items.map((item, index) => `${index + 1}. ${item}`), ""];
      case "quote":
        return [`> ${block.text}`, ""];
      case "callout":
        return [`**${block.title}.** ${block.text}`, ""];
    }
  });
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Joins lines and collapses the blank runs that optional sections leave. */
function lines(parts: string[]) {
  return `${parts.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
