import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("metadata routes", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("publishes exactly the homepage and three canonical case studies", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://portfolio.example/");

    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://portfolio.example",
      "https://portfolio.example/work/nudge",
      "https://portfolio.example/work/philips-greenheart",
      "https://portfolio.example/work/workforce-management-system",
    ]);
  });

  it("allows public crawling and points to the canonical sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://portfolio.example");

    expect(robots()).toMatchObject({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://portfolio.example/sitemap.xml",
      host: "https://portfolio.example",
    });
  });
});
