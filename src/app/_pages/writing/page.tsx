import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { getPortfolioContent } from "@/lib/portfolio";
import { getSiteUrl } from "@/lib/site";
import { getPersonReference } from "@/lib/structured-data";
import { uiCopyByLocale } from "@/lib/ui-copy";

import { getPostBySlug, getPosts, type WritingPost } from "./posts";

// Posts are English-only, so the section lives under the default locale.
const locale = "en";
const indexDescription =
  "Notes by Pavan Patil, a software engineer, on building web, mobile, and backend products.";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

function Footer() {
  const ui = uiCopyByLocale[locale];
  const { profile, socialLinks } = getPortfolioContent(locale);

  return (
    <SiteFooter
      copy={{ ...ui.footer, brandAria: ui.header.brandAria, navigation: ui.header.navigation }}
      locale={locale}
      profile={profile}
      socialLinks={socialLinks}
    />
  );
}

export function getWritingIndexMetadata(): Metadata {
  const hasPosts = getPosts().length > 0;

  return {
    title: "Writing",
    description: indexDescription,
    alternates: { canonical: "/writing" },
    openGraph: { type: "website", url: "/writing", title: "Writing — Pavan Patil", description: indexDescription },
    robots: { index: hasPosts, follow: true },
  };
}

export function WritingIndexPage() {
  const posts = getPosts();

  return (
    <>
      <main id="main-content" className="case-study-main writing-main">
        <Container>
          <header className="writing-header">
            <p className="eyebrow">Writing</p>
            <h1>Notes from building software</h1>
            <p className="case-lede">{indexDescription}</p>
          </header>
          {posts.length ? (
            <ol className="writing-list">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/writing/${post.slug}`}>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <strong>{post.title}</strong>
                    <span>{post.description}</span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="writing-empty">The first posts are on the way.</p>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

export function getWritingStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export function getWritingPostMetadata(slug: string): Metadata {
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found", robots: { index: false, follow: false } };

  const url = `/writing/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${post.title} — Pavan Patil`,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: ["Pavan Patil"],
      tags: post.tags,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: ["/og.png"] },
  };
}

function getPostSchema(post: WritingPost) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/writing/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: locale,
    keywords: post.tags.join(", "),
    image: `${siteUrl}/og.png`,
    author: getPersonReference(siteUrl),
    publisher: getPersonReference(siteUrl),
  };
}

export async function WritingPostPage({ slug }: { slug: string }) {
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { default: Content } = await post.load();

  return (
    <>
      <JsonLd data={getPostSchema(post)} />
      <main id="main-content" className="case-study-main writing-main">
        <Container>
          <article className="writing-article" aria-labelledby="post-title">
            <header className="writing-header">
              <p className="eyebrow">
                <Link href="/writing">Writing</Link>
              </p>
              <h1 id="post-title">{post.title}</h1>
              <p className="case-lede">{post.description}</p>
              <p className="writing-meta">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                {post.updatedAt ? (
                  <>
                    {" · Updated "}
                    <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                  </>
                ) : null}
              </p>
            </header>
            <div className="writing-prose">
              <Content />
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
