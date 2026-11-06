/**
 * Posts for /writing. To publish one:
 *   1. Add `src/content/writing/<slug>.mdx` (Markdown + JSX, no front matter;
 *      start at `##` headings, the page renders the title as the h1).
 *   2. Add an entry below with the same slug and a loader, e.g.
 *      `load: () => import("@/content/writing/<slug>.mdx")`.
 * The index stays noindex and out of the sitemap until at least one post is
 * listed here, so an empty section never reaches search results.
 */
import type { MDXContent } from "mdx/types";

export type WritingPost = {
  slug: string;
  title: string;
  /** One or two sentences; used as the meta description and the list summary. */
  description: string;
  /** ISO date, e.g. "2026-11-20". */
  publishedAt: string;
  /** ISO date of the last meaningful edit, if any. */
  updatedAt?: string;
  tags: string[];
  load: () => Promise<{ default: MDXContent }>;
};

const posts: WritingPost[] = [];

export function getPosts(): WritingPost[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}
