import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("metadata routes", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("publishes canonical home and case-study routes for all supported locales", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://portfolio.example/");

    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://portfolio.example",
      "https://portfolio.example/ja",
      "https://portfolio.example/de",
      "https://portfolio.example/setup",
      "https://portfolio.example/ja/setup",
      "https://portfolio.example/de/setup",
      "https://portfolio.example/work/mainichi-koto",
      "https://portfolio.example/ja/work/mainichi-koto",
      "https://portfolio.example/de/work/mainichi-koto",
      "https://portfolio.example/work/nudge",
      "https://portfolio.example/ja/work/nudge",
      "https://portfolio.example/de/work/nudge",
      "https://portfolio.example/work/philips-greenheart",
      "https://portfolio.example/ja/work/philips-greenheart",
      "https://portfolio.example/de/work/philips-greenheart",
      "https://portfolio.example/work/workforce-management-system",
      "https://portfolio.example/ja/work/workforce-management-system",
      "https://portfolio.example/de/work/workforce-management-system",
    ]);
  });

  it("adds alternate-language sitemap entries", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://portfolio.example/");

    expect(sitemap()[6]).toMatchObject({
      url: "https://portfolio.example/work/mainichi-koto",
      alternates: {
        languages: {
          en: "https://portfolio.example/work/mainichi-koto",
          ja: "https://portfolio.example/ja/work/mainichi-koto",
          de: "https://portfolio.example/de/work/mainichi-koto",
          "x-default": "https://portfolio.example/work/mainichi-koto",
        },
      },
    });
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
