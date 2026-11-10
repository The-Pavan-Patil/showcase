import {
  getCanonicalPath,
  getMarkdownDocument,
  getMarkdownKeys,
} from "@/lib/agent-markdown";
import { getSiteUrl } from "@/lib/site";

/**
 * Markdown mirrors of the English pages. Visitors never use this path: the
 * rewrites in next.config.ts serve it at `/index.md`, `/setup.md` and
 * `/work/<slug>.md`, and at the normal page URLs for `Accept: text/markdown`.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getMarkdownKeys().map((key) => ({ path: key.split("/") }));
}

export async function GET(_request: Request, { params }: RouteContext<"/md/[...path]">) {
  const { path } = await params;
  const key = path.join("/");
  const document = getMarkdownDocument(key);

  if (!document) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const canonicalUrl = `${getSiteUrl()}${getCanonicalPath(key) === "/" ? "/" : getCanonicalPath(key)}`;

  return new Response(document, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // The same URL can answer with HTML or Markdown, so caches must key on
      // the Accept header.
      Vary: "Accept",
      // Search engines fold the mirror into the HTML page instead of listing
      // both.
      Link: `<${canonicalUrl}>; rel="canonical"`,
    },
  });
}
