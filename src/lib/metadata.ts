import type { Metadata, Viewport } from "next";

import {
  getAlternateLanguages,
  getHomePath,
  getSetupPath,
  type Locale,
} from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";
import { uiCopyByLocale } from "@/lib/ui-copy";

/**
 * Social-preview cards, one per language, rendered from the home hero by
 * `scripts/render-og-images.mjs`. Link previews are cached by image URL, so a
 * redesigned card needs a new file name, not new pixels under the old one.
 */
const ogImagePaths: Record<Locale, string> = {
  en: "/og/en.png",
  ja: "/og/ja.png",
  de: "/og/de.png",
};

export function getOgImage(locale: Locale, alt: string) {
  return { url: ogImagePaths[locale], width: 1200, height: 630, alt };
}

export function getRootMetadata(locale: Locale): Metadata {
  const siteUrl = getSiteUrl();
  const ui = uiCopyByLocale[locale];
  const canonical = getHomePath(locale);
  const image = getOgImage(locale, ui.metadata.defaultTitle);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: ui.metadata.defaultTitle,
      template: ui.metadata.titleTemplate,
    },
    description: ui.metadata.description,
    keywords: ui.metadata.keywords,
    authors: [{ name: "Pavan Patil", url: siteUrl }],
    creator: "Pavan Patil",
    alternates: {
      canonical,
      languages: getAlternateLanguages("/"),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Pavan Patil",
      title: ui.metadata.defaultTitle,
      description: ui.metadata.openGraphDescription,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.metadata.defaultTitle,
      description: ui.metadata.twitterDescription,
      images: [image.url],
    },
    robots: { index: true, follow: true },
  };
}

/**
 * Points agents at the Markdown copy of an English page (src/lib/agent-markdown.ts).
 * The Japanese and German pages have none, so they get nothing.
 */
export function getMarkdownAlternate(locale: Locale, markdownPath: string) {
  return locale === "en" ? { types: { "text/markdown": markdownPath } } : {};
}

export function getHomeMetadata(locale: Locale): Metadata {
  const metadata = getRootMetadata(locale);
  return {
    ...metadata,
    alternates: { ...metadata.alternates, ...getMarkdownAlternate(locale, "/index.md") },
  };
}

export function getSetupMetadata(locale: Locale): Metadata {
  const canonical = getSetupPath(locale);
  const description =
    "Pavan Patil's AI-assisted software workflow across planning, implementation, testing, review, automation, and hardware setup.";
  const image = getOgImage(locale, "Setup and AI Workflow - Pavan Patil");

  return {
    title: "Setup and AI Workflow",
    description,
    alternates: {
      canonical,
      languages: getAlternateLanguages("/setup"),
      ...getMarkdownAlternate(locale, "/setup.md"),
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: "Setup and AI Workflow - Pavan Patil",
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: "Setup and AI Workflow",
      description,
      images: [image.url],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};
