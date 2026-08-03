import { describe, expect, it } from "vitest";

import {
  getAlternateLanguages,
  getHomePath,
  getPathForLocale,
  getSetupPath,
  getWorkPath,
  isLocale,
  stripLocaleFromPathname,
} from "@/lib/i18n";

describe("i18n routing helpers", () => {
  it("validates supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(true);
    expect(isLocale("de")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("keeps English unprefixed and prefixes localized routes", () => {
    expect(getHomePath("en")).toBe("/");
    expect(getHomePath("ja")).toBe("/ja");
    expect(getHomePath("de")).toBe("/de");
    expect(getWorkPath("en", "nudge")).toBe("/work/nudge");
    expect(getWorkPath("ja", "nudge")).toBe("/ja/work/nudge");
    expect(getWorkPath("de", "nudge")).toBe("/de/work/nudge");
    expect(getSetupPath("en")).toBe("/setup");
    expect(getSetupPath("ja")).toBe("/ja/setup");
    expect(getSetupPath("de")).toBe("/de/setup");
  });

  it("switches equivalent routes across visible navbar locales", () => {
    expect(getPathForLocale("/", "ja")).toBe("/ja");
    expect(getPathForLocale("/ja", "en")).toBe("/");
    expect(getPathForLocale("/work/nudge", "ja")).toBe("/ja/work/nudge");
    expect(getPathForLocale("/ja/work/nudge", "en")).toBe("/work/nudge");
    expect(getPathForLocale("/de/work/nudge", "en")).toBe("/work/nudge");
    expect(getPathForLocale("/de/work/nudge", "ja")).toBe("/ja/work/nudge");
  });

  it("strips supported locale prefixes and builds alternates", () => {
    expect(stripLocaleFromPathname("/de/work/nudge")).toEqual({
      locale: "de",
      pathname: "/work/nudge",
    });
    expect(getAlternateLanguages("/work/nudge")).toEqual({
      en: "/work/nudge",
      ja: "/ja/work/nudge",
      de: "/de/work/nudge",
      "x-default": "/work/nudge",
    });
    expect(getAlternateLanguages("/ja/work/nudge")).toEqual({
      en: "/work/nudge",
      ja: "/ja/work/nudge",
      de: "/de/work/nudge",
      "x-default": "/work/nudge",
    });
  });
});
