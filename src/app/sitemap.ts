import type { MetadataRoute } from "next";

import { getPosts } from "@/app/_pages/writing/posts";
import { getAlternateLanguages, getLocalizedPath, supportedLocales } from "@/lib/i18n";
import { getProjects } from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";

/**
 * Pages carry no `lastModified`: stamping every build's time on them tells
 * crawlers everything changed on each deploy, which teaches them to ignore
 * the field. Posts have real dates, so they keep it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const projectPaths = getProjects("en").map((project) => `/work/${project.slug}`);
  const pagePaths = ["/", "/setup", ...projectPaths];

  const pages = pagePaths.flatMap((pathname) =>
    supportedLocales.map((locale) => ({
      url: `${siteUrl}${getLocalizedPath(locale, pathname) === "/" ? "" : getLocalizedPath(locale, pathname)}`,
      changeFrequency: "monthly" as const,
      priority: pathname === "/" ? 1 : pathname === "/setup" ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(getAlternateLanguages(pathname)).map(([alternateLocale, alternatePath]) => [
            alternateLocale,
            `${siteUrl}${alternatePath === "/" ? "" : alternatePath}`,
          ]),
        ),
      },
    })),
  );

  const posts = getPosts();
  if (!posts.length) return pages;

  return [
    ...pages,
    {
      url: `${siteUrl}/writing`,
      lastModified: new Date(posts[0].updatedAt ?? posts[0].publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/writing/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
