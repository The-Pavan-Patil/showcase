import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ensureGoogleAnalytics,
  getGoogleAnalyticsId,
  getPostHogAssetsHost,
  getPostHogConfig,
  normalizeAnalyticsUrl,
  setAnalyticsClient,
  trackEvent,
  trackPageView,
} from "@/lib/analytics";

const VALID_KEY = "phc_abcdefghijklmnopqrstuvwxyz0123456789";

describe("PostHog configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the key and normalized origin when both variables are valid", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", VALID_KEY);
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com/");

    expect(getPostHogConfig()).toEqual({
      key: VALID_KEY,
      host: "https://eu.i.posthog.com",
    });
  });

  it("trims surrounding whitespace", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", `  ${VALID_KEY}  `);
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "  https://eu.i.posthog.com  ");

    expect(getPostHogConfig()?.key).toBe(VALID_KEY);
  });

  it("returns null when the key is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");

    expect(getPostHogConfig()).toBeNull();
  });

  it("returns null when the host is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", VALID_KEY);

    expect(getPostHogConfig()).toBeNull();
  });

  it.each(["", "not-a-key", "phc_short", "wrong_prefix_abcdefghijklmnopqrstuvwx"])(
    "rejects malformed keys: %s",
    (key) => {
      vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", key);
      vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");

      expect(getPostHogConfig()).toBeNull();
    },
  );

  it.each(["", "not-a-url", "http://eu.i.posthog.com"])(
    "rejects hosts that are missing, unparseable, or not https: %s",
    (host) => {
      vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", VALID_KEY);
      vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", host);

      expect(getPostHogConfig()).toBeNull();
    },
  );
});

describe("PostHog assets host", () => {
  it.each([
    ["https://eu.i.posthog.com", "https://eu-assets.i.posthog.com"],
    ["https://us.i.posthog.com", "https://us-assets.i.posthog.com"],
    ["https://proxy.example.com", "https://proxy.example.com"],
  ])("maps %s to %s", (host, expected) => {
    expect(getPostHogAssetsHost(host)).toBe(expected);
  });
});

describe("Google Analytics measurement id", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a well-formed measurement id", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", " G-AB12CD34EF ");

    expect(getGoogleAnalyticsId()).toBe("G-AB12CD34EF");
  });

  it.each(["", "UA-12345-1", "G-ab12", "G-1", "not-an-id"])(
    "rejects missing or malformed ids: %s",
    (value) => {
      vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", value);

      expect(getGoogleAnalyticsId()).toBeNull();
    },
  );
});

describe("URL normalization", () => {
  it("resolves relative hrefs against the provided base", () => {
    expect(normalizeAnalyticsUrl("/#work", "https://example.com/setup")).toBe(
      "https://example.com/#work",
    );
  });

  it("resolves bare hash hrefs against the provided base", () => {
    expect(
      normalizeAnalyticsUrl("#workflow", "https://example.com/setup"),
    ).toBe("https://example.com/setup#workflow");
  });

  it("passes absolute URLs through unchanged", () => {
    expect(
      normalizeAnalyticsUrl("https://example.com/work/nudge", "https://example.com/"),
    ).toBe("https://example.com/work/nudge");
  });

  it("strips the intro replay parameter so it does not fragment reports", () => {
    expect(normalizeAnalyticsUrl("https://example.com/?intro=1")).toBe(
      "https://example.com/",
    );
  });

  it("keeps unrelated query parameters", () => {
    expect(
      normalizeAnalyticsUrl("https://example.com/?intro=1&utm_source=x"),
    ).toBe("https://example.com/?utm_source=x");
  });

  it("resolves against window.location when no base is supplied", () => {
    expect(normalizeAnalyticsUrl("/work/nudge")).toBe(
      new URL("/work/nudge", window.location.href).toString(),
    );
  });

  it("falls back to the raw value when the URL cannot be parsed", () => {
    expect(normalizeAnalyticsUrl("http://[", "not-a-valid-base")).toBe(
      "http://[",
    );
  });
});

describe("event dispatch", () => {
  const capture = vi.fn();
  const gtag = vi.fn();

  beforeEach(() => {
    capture.mockReset();
    gtag.mockReset();
    setAnalyticsClient(null);
    delete window.gtag;
  });

  afterEach(() => {
    setAnalyticsClient(null);
    delete window.gtag;
  });

  it("no-ops when no destination is registered", () => {
    expect(() => trackEvent("theme_changed", { theme: "dark" })).not.toThrow();
    expect(() =>
      trackPageView({ url: "https://example.com/" }),
    ).not.toThrow();
  });

  it("sends named events to PostHog and Google Analytics", () => {
    setAnalyticsClient({ capture });
    window.gtag = gtag;

    trackEvent("nav_clicked", { target: "work", surface: "desktop" });

    expect(capture).toHaveBeenCalledWith("nav_clicked", {
      target: "work",
      surface: "desktop",
    });
    expect(gtag).toHaveBeenCalledWith("event", "nav_clicked", {
      target: "work",
      surface: "desktop",
    });
  });

  it("drops undefined properties", () => {
    setAnalyticsClient({ capture });

    trackEvent("message_failed", { reason: "network", status: undefined });

    expect(capture).toHaveBeenCalledWith("message_failed", {
      reason: "network",
    });
  });

  it("sends pageviews with an explicit, normalized URL", () => {
    setAnalyticsClient({ capture });
    window.gtag = gtag;

    trackPageView({
      url: "https://example.com/work/nudge?intro=1",
      title: "Nudge",
      properties: { intro_shown: false },
    });

    expect(capture).toHaveBeenCalledWith("$pageview", {
      $current_url: "https://example.com/work/nudge",
      intro_shown: false,
    });
    expect(gtag).toHaveBeenCalledWith("event", "page_view", {
      page_location: "https://example.com/work/nudge",
      page_title: "Nudge",
      intro_shown: false,
    });
  });

  it("still reports to Google Analytics when PostHog is unconfigured", () => {
    window.gtag = gtag;

    trackEvent("booking_click");

    expect(capture).not.toHaveBeenCalled();
    expect(gtag).toHaveBeenCalledWith("event", "booking_click", {});
  });
});

describe("Google Analytics bootstrap", () => {
  beforeEach(() => {
    delete window.gtag;
    delete window.dataLayer;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.gtag;
    delete window.dataLayer;
  });

  function queuedCommands() {
    return (window.dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    );
  }

  it("does nothing when no measurement id is configured", () => {
    expect(ensureGoogleAnalytics()).toBeNull();
    expect(window.gtag).toBeUndefined();
    expect(window.dataLayer).toBeUndefined();
  });

  it("queues consent defaults, then js, then config, in that order", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-AB12CD34EF");

    expect(ensureGoogleAnalytics()).toBeTypeOf("function");

    const commands = queuedCommands();

    expect(commands.map((command) => command[0])).toEqual([
      "consent",
      "js",
      "config",
    ]);
    expect(commands[0][1]).toBe("default");
    expect(commands[0][2]).toMatchObject({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    expect(commands[2][1]).toBe("G-AB12CD34EF");
    expect(commands[2][2]).toMatchObject({
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  });

  it("sends later events into the same queue, after the config command", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-AB12CD34EF");
    ensureGoogleAnalytics();

    trackEvent("booking_click", { surface: "page" });

    const commands = queuedCommands();

    expect(commands.at(-1)).toEqual([
      "event",
      "booking_click",
      { surface: "page" },
    ]);
  });

  it("is idempotent and preserves an existing queue", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-AB12CD34EF");
    window.dataLayer = ["pre-existing"];

    const first = ensureGoogleAnalytics();
    const second = ensureGoogleAnalytics();

    expect(second).toBe(first);
    expect(window.dataLayer[0]).toBe("pre-existing");
    expect(queuedCommands()).toHaveLength(4);
  });
});
