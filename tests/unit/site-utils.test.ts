import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

describe("site URL resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes an explicit canonical site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://portfolio.example/");
    expect(getSiteUrl()).toBe("https://portfolio.example");
  });

  it("uses the Vercel production host when no explicit URL exists", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "pavan.example.vercel.app");
    expect(getSiteUrl()).toBe("https://pavan.example.vercel.app");
  });

  it("uses the Vercel preview host when no production origin exists", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "showcase-preview.vercel.app");
    expect(getSiteUrl()).toBe("https://showcase-preview.vercel.app");
  });

  it("uses localhost only when no deployment origin is available", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("class name composition", () => {
  it("keeps truthy class names in source order", () => {
    expect(cn("card", false, undefined, "card-active")).toBe("card card-active");
  });
});
