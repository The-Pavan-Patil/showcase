import type { MetadataRoute } from "next";

import { getAlternateLanguages, getLocalizedPath, supportedLocales } from "@/lib/i18n";
import { getProjects } from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const projectPaths = getProjects("en").map((project) => `/work/${project.slug}`);

  return ["/", ...projectPaths].flatMap((pathname) =>
    supportedLocales.map((locale) => ({
      url: `${siteUrl}${getLocalizedPath(locale, pathname) === "/" ? "" : getLocalizedPath(locale, pathname)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: pathname === "/" ? 1 : 0.8,
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
}
