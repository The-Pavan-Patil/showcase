import { getPosts } from "@/app/_pages/writing/posts";
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
    `${profile.name} is a ${profile.role.toLowerCase()} based in Bengaluru, India, open to roles in Japan. ${profile.education}.`,
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
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
