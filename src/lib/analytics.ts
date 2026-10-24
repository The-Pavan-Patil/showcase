const POSTHOG_KEY_PATTERN = /^phc_[A-Za-z0-9]{16,}$/;
const GOOGLE_ANALYTICS_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

/**
 * Same-origin path that proxies PostHog through this site. Keep it in sync with
 * the rewrites in next.config.ts.
 */
export const ANALYTICS_INGEST_PATH = "/ingest";

/** Query params stripped from tracked URLs so they do not fragment reports. */
const STRIPPED_QUERY_PARAMS = ["intro"];

export type AnalyticsEvent =
  | "nav_clicked"
  | "section_viewed"
  | "case_study_section_read"
  | "resume_opened"
  | "outbound_click"
  | "email_click"
  | "booking_click"
  | "message_started"
  | "message_submit_attempted"
  | "message_sent"
  | "message_failed"
  | "theme_changed"
  | "language_changed"
  | "intro_completed"
  | "intro_skipped"
  | "intro_not_shown";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | undefined
>;

/** The slice of the PostHog browser client this module depends on. */
export type AnalyticsClient = {
  capture: (event: string, properties?: Record<string, unknown>) => unknown;
};

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer?: unknown[];
  }
}

let posthogClient: AnalyticsClient | null = null;

/**
 * Public project key and ingestion origin for PostHog, or null when analytics
 * is not configured. Env vars are read as literal member access so Next can
 * inline them into the client bundle.
 */
export function getPostHogConfig() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();

  if (!key || !host || !POSTHOG_KEY_PATTERN.test(key)) return null;

  try {
    const url = new URL(host);

    if (url.protocol !== "https:") return null;

    return { key, host: url.origin };
  } catch {
    return null;
  }
}

/** GA4 measurement id, or null when analytics is not configured. */
export function getGoogleAnalyticsId() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  if (!measurementId || !GOOGLE_ANALYTICS_ID_PATTERN.test(measurementId)) {
    return null;
  }

  return measurementId;
}

/**
 * PostHog serves its static assets from a sibling host, so the reverse proxy
 * needs both origins.
 */
export function getPostHogAssetsHost(host: string) {
  return host.replace("//eu.i.", "//eu-assets.i.").replace("//us.i.", "//us-assets.i.");
}

/** Registers the initialized PostHog instance. Called once, from instrumentation-client. */
export function setAnalyticsClient(client: AnalyticsClient | null) {
  posthogClient = client;
}

/**
 * Installs the Google Analytics bootstrap: the `dataLayer` queue, the `gtag`
 * shim, consent defaults, and the property config.
 *
 * This is done here rather than in an inline `<Script>` so that `gtag` exists
 * before the first pageview is sent — client instrumentation runs ahead of
 * hydration — and so `config` is guaranteed to be queued before any event.
 * Calls made now are drained in order once gtag.js finishes loading.
 */
export function ensureGoogleAnalytics() {
  if (typeof window === "undefined") return null;
  if (typeof window.gtag === "function") return window.gtag;

  const measurementId = getGoogleAnalyticsId();
  if (!measurementId) return null;

  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;

  // Matches Google's own snippet: the pushed value must be the `arguments`
  // object, so this cannot be an arrow function.
  const gtag: GtagFunction = function () {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };

  window.gtag = gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  gtag("config", measurementId, {
    // Pageviews are sent manually: this site pushes history state for in-page
    // anchor navigation, which GA would otherwise count as a page change.
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  return window.gtag;
}

function getGtag() {
  if (typeof window === "undefined") return null;

  return typeof window.gtag === "function" ? window.gtag : null;
}

function compactProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

/**
 * Resolves a possibly-relative URL against `base` and strips noise params.
 * Returns the input unchanged when it cannot be parsed.
 */
export function normalizeAnalyticsUrl(url: string, base?: string) {
  const resolvedBase =
    base ?? (typeof window === "undefined" ? undefined : window.location.href);

  try {
    const resolved = new URL(url, resolvedBase);

    for (const param of STRIPPED_QUERY_PARAMS) {
      resolved.searchParams.delete(param);
    }

    return resolved.toString();
  } catch {
    return url;
  }
}

/** Sends a named event to every configured destination. No-ops when unconfigured. */
export function trackEvent(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
) {
  const payload = compactProperties(properties);

  posthogClient?.capture(event, payload);
  getGtag()?.("event", event, payload);
}

/**
 * Sends a pageview. The URL is always passed explicitly because the App Router
 * transition hook fires before `window.location` updates.
 */
export function trackPageView({
  url,
  title,
  properties,
}: {
  url: string;
  title?: string;
  properties?: AnalyticsProperties;
}) {
  const pageLocation = normalizeAnalyticsUrl(url);
  const payload = compactProperties(properties);

  posthogClient?.capture("$pageview", {
    $current_url: pageLocation,
    ...payload,
  });

  getGtag()?.("event", "page_view", {
    page_location: pageLocation,
    page_title: title,
    ...payload,
  });
}
