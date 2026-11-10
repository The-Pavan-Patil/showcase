import { getPosts } from "@/app/_pages/writing/posts";
import { getDisambiguation } from "@/lib/identity";
import { getPortfolioContent } from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";
import { uiCopyByLocale } from "@/lib/ui-copy";

export const dynamic = "force-static";

/**
 * A plain-text map of the site for AI assistants and answer engines
 * (https://llmstxt.org), built from the same content as the pages.
 */
export function GET() {
  const siteUrl = getSiteUrl();
  const { profile, socialLinks, experience, skillGroups, projects } = getPortfolioContent("en");
  const posts = getPosts();

  const lines = [
    `# ${profile.name}`,
    "",
    `> ${uiCopyByLocale.en.metadata.description}`,
    "",
    `${getDisambiguation()} Open to roles in Japan. ${profile.education}.`,
    "",
    "Several other people share the name Pavan Patil. This site is the official page of the software engineer above, the same person as the profiles listed under Profile.",
    "",
    "## Profile",
    "",
    `- [Home](${siteUrl}/): portfolio, experience and contact`,
    `- [Setup and AI workflow](${siteUrl}/setup): how Pavan plans, builds, tests and ships with AI agents`,
    `- [Japanese version](${siteUrl}/ja)`,
    ...socialLinks.map((link) => `- [${link.label}](${link.href})`),
    "",
    "## Experience",
    "",
    ...experience.map(
      (item) => `- ${item.role}, ${item.company} (${item.period}, ${item.location}): ${item.description}`,
    ),
    "",
    "## Case studies",
    "",
    ...projects.map((project) => `- [${project.title}](${siteUrl}/work/${project.slug}): ${project.summary}`),
    "",
    "## Skills",
    "",
    ...skillGroups.map((group) => `- ${group.label}: ${group.skills.join(", ")}`),
    "",
    ...(posts.length
      ? [
          "## Writing",
          "",
          ...posts.map((post) => `- [${post.title}](${siteUrl}/writing/${post.slug}): ${post.description}`),
          "",
        ]
      : []),
    "## Machine-readable versions",
    "",
    `- [Full site as Markdown](${siteUrl}/llms-full.txt): every English page in one file`,
    `- Each English page has a Markdown copy at its URL plus \`.md\` (the home page is [${siteUrl}/index.md](${siteUrl}/index.md)), or at its normal URL with \`Accept: text/markdown\`. Cite the HTML page, not the Markdown copy.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
