import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getLlmsFull } from "@/app/llms-full.txt/route";
import { GET as getLlms } from "@/app/llms.txt/route";
import { GET as getMarkdown, generateStaticParams } from "@/app/md/[...path]/route";
import {
  getCanonicalPath,
  getFullSiteMarkdown,
  getMarkdownDocument,
  getMarkdownKeys,
  getMarkdownPath,
} from "@/lib/agent-markdown";
import { getClients, getDisambiguation } from "@/lib/identity";
import { getHomeMetadata, getSetupMetadata } from "@/lib/metadata";
import { getPortfolioContent } from "@/lib/portfolio";
import { getPersonSchema } from "@/lib/structured-data";
import { generateWorkMetadata } from "@/app/_pages/work/page";
import { proxy } from "@/proxy";

const siteUrl = "https://portfolio.example";
const { projects } = getPortfolioContent("en");

function markdownRequest(key: string) {
  return getMarkdown(new Request(`${siteUrl}/md/${key}`), {
    params: Promise.resolve({ path: key.split("/") }),
  });
}

describe("agent readiness", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("identity", () => {
    it("tells this Pavan Patil apart by role, employer, city and clients", () => {
      const sentence = getDisambiguation();

      expect(sentence).toContain("Pavan Patil is a software engineer at Ownpath Pvt. Ltd.");
      expect(sentence).toContain("Bengaluru, Karnataka, India");
      expect(sentence).toMatch(/Hero Vida, Philips, .* and DRDO\.$/);
    });

    it("lists clients once each, shortens DRDO and leaves out the current employer", () => {
      const clients = getClients();

      expect(new Set(clients).size).toBe(clients.length);
      expect(clients).toContain("DRDO");
      expect(clients.some((name) => /ownpath/i.test(name))).toBe(false);
    });

    it("puts the same sentence in the Person JSON-LD on every language version", () => {
      for (const locale of ["en", "ja", "de"] as const) {
        const person = getPersonSchema({ locale, siteUrl, content: getPortfolioContent(locale) });
        expect(person).toMatchObject({
          givenName: "Pavan",
          familyName: "Patil",
          disambiguatingDescription: getDisambiguation(),
        });
      }
    });
  });

  describe("markdown copies", () => {
    it("covers the home page, the setup page and every case study", () => {
      expect(getMarkdownKeys()).toEqual([
        "index",
        "setup",
        ...projects.map((project) => `work/${project.slug}`),
      ]);
      expect(generateStaticParams()).toContainEqual({ path: ["work", "nudge"] });
      expect(getCanonicalPath("index")).toBe("/");
      expect(getCanonicalPath("work/nudge")).toBe("/work/nudge");
      expect(getMarkdownPath("index")).toBe("/index.md");
    });

    it("opens the home copy with who Pavan is and links every case study", () => {
      const home = getMarkdownDocument("index")!;

      expect(home.startsWith("# Pavan Patil — Software Engineer\n")).toBe(true);
      expect(home).toContain(getDisambiguation());
      expect(home).toContain(`Canonical page: ${siteUrl}/`);
      expect(home).toContain("Open to roles in Japan.");
      for (const project of projects) {
        expect(home).toContain(`(${siteUrl}/work/${project.slug})`);
      }
      expect(home).toContain("### Software Engineer, Ownpath Pvt. Ltd.");
      expect(home).not.toMatch(/\n{3,}/);
    });

    it("renders a case study's article sections and names its canonical page", () => {
      const nudge = getMarkdownDocument("work/nudge")!;
      const project = projects.find((item) => item.slug === "nudge")!;

      expect(nudge.startsWith(`# Nudge: ${project.kicker}\n`)).toBe(true);
      expect(nudge).toContain(`Canonical page: ${siteUrl}/work/nudge`);
      for (const section of project.caseStudy?.sections ?? []) {
        expect(nudge).toContain(`## ${section.title}`);
      }
    });

    it("renders the setup page's agent roles as a table", () => {
      const setup = getMarkdownDocument("setup")!;

      expect(setup).toContain(`Canonical page: ${siteUrl}/setup`);
      expect(setup).toContain("| Role | Agent | Stage | Focus |");
      expect(setup).toContain("| Testing | Claude Sonnet | Test |");
    });

    it("has no copy for unknown pages", () => {
      expect(getMarkdownDocument("work/unknown")).toBeUndefined();
      expect(getMarkdownDocument("about")).toBeUndefined();
    });

    it("serves Markdown that caches per Accept header and points at the HTML page", async () => {
      const response = await markdownRequest("work/nudge");

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
      expect(response.headers.get("vary")).toBe("Accept");
      expect(response.headers.get("link")).toBe(`<${siteUrl}/work/nudge>; rel="canonical"`);
      expect(await response.text()).toBe(getMarkdownDocument("work/nudge"));

      const home = await markdownRequest("index");
      expect(home.headers.get("link")).toBe(`<${siteUrl}/>; rel="canonical"`);
    });

    it("returns 404 for a page without a copy", async () => {
      expect((await markdownRequest("work/unknown")).status).toBe(404);
    });

    it("advertises the copies from the English pages only", async () => {
      expect(getHomeMetadata("en").alternates?.types).toEqual({ "text/markdown": "/index.md" });
      expect(getSetupMetadata("en").alternates?.types).toEqual({ "text/markdown": "/setup.md" });
      expect((await generateWorkMetadata({ locale: "en", slug: "nudge" })).alternates?.types).toEqual({
        "text/markdown": "/work/nudge.md",
      });
      expect(getHomeMetadata("ja").alternates?.types).toBeUndefined();
      expect(getHomeMetadata("ja").alternates?.canonical).toBe("/ja");
      expect((await generateWorkMetadata({ locale: "de", slug: "nudge" })).alternates?.types).toBeUndefined();
    });
  });

  describe("llms files", () => {
    it("states who Pavan is and where the machine-readable copies live", async () => {
      const text = await getLlms().text();

      expect(text).toContain(getDisambiguation());
      expect(text).toContain("Several other people share the name Pavan Patil.");
      expect(text).toContain(`${siteUrl}/llms-full.txt`);
      expect(text).toContain(`${siteUrl}/index.md`);
    });

    it("joins every Markdown copy into llms-full.txt", async () => {
      const response = getLlmsFull();
      const text = await response.text();

      expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
      expect(text).toBe(getFullSiteMarkdown());
      for (const key of getMarkdownKeys()) {
        expect(text).toContain(getMarkdownDocument(key)!.split("\n")[0]);
      }
    });
  });

  describe("locale redirect", () => {
    function visit(headers: Record<string, string>) {
      return proxy(
        new NextRequest("https://www.pavanpatil.dev/", {
          headers: { "x-vercel-ip-country": "JP", ...headers },
        }),
      );
    }

    const browser = {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    };

    it("still sends Japanese visitors to /ja", () => {
      const response = visit(browser);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("https://www.pavanpatil.dev/ja");
    });

    it.each([
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
      "Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)",
      "Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)",
    ])("lets AI assistants read the page they asked for: %s", (userAgent) => {
      expect(visit({ ...browser, "user-agent": userAgent }).headers.get("location")).toBeNull();
    });

    it("never redirects a request for Markdown", () => {
      const response = visit({ ...browser, accept: "text/markdown, text/html;q=0.9" });

      expect(response.headers.get("location")).toBeNull();
    });
  });
});
