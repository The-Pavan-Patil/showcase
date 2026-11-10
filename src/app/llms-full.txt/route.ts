import { getFullSiteMarkdown } from "@/lib/agent-markdown";

export const dynamic = "force-static";

/**
 * Every English page as Markdown in one file, so an agent can read the whole
 * site in a single request. /llms.txt is the short index.
 */
export function GET() {
  return new Response(getFullSiteMarkdown(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
