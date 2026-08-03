import type { Metadata, Viewport } from "next";

import {
  getAlternateLanguages,
  getHomePath,
  getSetupPath,
  type Locale,
} from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";
import { uiCopyByLocale } from "@/lib/ui-copy";

export function getRootMetadata(locale: Locale): Metadata {
  const siteUrl = getSiteUrl();
  const ui = uiCopyByLocale[locale];
  const canonical = getHomePath(locale);

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
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: ui.metadata.defaultTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ui.metadata.defaultTitle,
      description: ui.metadata.twitterDescription,
      images: ["/og.png"],
    },
    robots: { index: true, follow: true },
  };
}

export function getHomeMetadata(locale: Locale): Metadata {
  return getRootMetadata(locale);
}

export function getSetupMetadata(locale: Locale): Metadata {
  const canonical = getSetupPath(locale);
  const description =
    "Pavan Patil's AI-assisted software workflow across planning, implementation, testing, review, automation, and hardware setup.";

  return {
    title: "Setup and AI Workflow",
    description,
    alternates: {
      canonical,
      languages: getAlternateLanguages("/setup"),
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: "Setup and AI Workflow - Pavan Patil",
      description,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Setup and AI Workflow - Pavan Patil",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Setup and AI Workflow",
      description,
      images: ["/og.png"],
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
