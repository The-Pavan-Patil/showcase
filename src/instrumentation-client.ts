import {
  ANALYTICS_INGEST_PATH,
  ensureGoogleAnalytics,
  getPostHogConfig,
  normalizeAnalyticsUrl,
  setAnalyticsClient,
  trackEvent,
  trackPageView,
} from "@/lib/analytics";
import { stripLocaleFromPathname } from "@/lib/i18n";
import { resumeUrl } from "@/lib/site";

const LAUNCH_INTRO_SESSION_KEY = "launch-terminal-seen";
const POSTHOG_UI_HOST = "https://eu.posthog.com";

/**
 * Identifies a page for change detection. Hash-only changes are not pageviews,
 * so the fragment is deliberately excluded.
 */
function getPageKey(url: string) {
  try {
    const parsed = new URL(url, window.location.href);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

let lastPageKey = getPageKey(window.location.href);

/**
 * Mirrors the LaunchTerminal gate in src/components/launch-terminal.tsx. The
 * intro covers the viewport for about a second, so pageviews are tagged
 * with it — otherwise first and second pageviews in a session are not
 * comparable.
 */
function willLaunchIntroPlay() {
  try {
    if (stripLocaleFromPathname(window.location.pathname).pathname !== "/") {
      return false;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }

    if (new URLSearchParams(window.location.search).get("intro") === "1") {
      return true;
    }

    return window.sessionStorage.getItem(LAUNCH_INTRO_SESSION_KEY) !== "true";
  } catch {
    return false;
  }
}

function getLinkSurface(anchor: HTMLAnchorElement) {
  if (anchor.closest(".site-header")) return "header";
  if (anchor.closest(".site-footer")) return "footer";

  return "page";
}

function getOutboundLabel(hostname: string) {
  if (hostname.endsWith("github.com")) return "github";
  if (hostname.endsWith("linkedin.com")) return "linkedin";

  return "other";
}

/**
 * One delegated listener covers every outbound link, including those rendered
 * by Server Components. Internal navigation is intentionally excluded — the
 * router transition hook already emits a pageview for it.
 */
function handleLinkActivation(event: MouseEvent) {
  // `click` is the primary button; `auxclick` is used for middle-click opens.
  if (event.type === "click" ? event.button !== 0 : event.button !== 1) return;

  const target = event.target;
  if (!(target instanceof Element)) return;

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;

  const surface = getLinkSurface(anchor);

  if ((anchor.getAttribute("href") ?? "").startsWith("mailto:")) {
    trackEvent("email_click", { surface });
    return;
  }

  let url: URL;

  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return;
  if (url.origin === window.location.origin) return;

  if (anchor.href === resumeUrl) {
    trackEvent("resume_opened", { surface });
    return;
  }

  if (url.hostname === "calendar.google.com") {
    trackEvent("booking_click", { surface });
    return;
  }

  trackEvent("outbound_click", {
    host: url.hostname,
    label: getOutboundLabel(url.hostname),
    surface,
  });
}

/** Upper bound on how long a pageview waits for the navigation to commit. */
const NAVIGATION_COMMIT_TIMEOUT_MS = 250;

/**
 * Defers to just after the navigation commits so `document.title` is fresh.
 *
 * A frame is the cheapest signal that React has committed, but frames are never
 * delivered while the tab is hidden — so a timer guarantees the pageview is
 * still sent. Whichever fires first wins. The URL is never read from
 * `window.location`; it is always passed in explicitly.
 */
function afterNavigationCommit(callback: () => void) {
  let hasRun = false;

  const run = () => {
    if (hasRun) return;

    hasRun = true;
    callback();
  };

  window.requestAnimationFrame(() => window.setTimeout(run, 0));
  window.setTimeout(run, NAVIGATION_COMMIT_TIMEOUT_MS);
}

function captureInitialPageView() {
  trackPageView({
    url: window.location.href,
    title: document.title,
    properties: { intro_shown: willLaunchIntroPlay() },
  });
}

try {
  const posthogConfig = getPostHogConfig();
  const isAnalyticsEnabled = Boolean(ensureGoogleAnalytics()) || Boolean(posthogConfig);

  if (isAnalyticsEnabled) {
    // `auxclick` is needed as well as `click`: every outbound link opens in a
    // new tab, so middle-click opens would otherwise go uncounted.
    document.addEventListener("click", handleLinkActivation, true);
    document.addEventListener("auxclick", handleLinkActivation, true);
  }

  if (posthogConfig) {
    // Imported lazily: instrumentation-client runs before hydration, and a
    // static import would put the SDK on the critical path.
    void import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(posthogConfig.key, {
          api_host: ANALYTICS_INGEST_PATH,
          ui_host: POSTHOG_UI_HOST,
          defaults: "2026-08-30",
          // Pageviews are sent manually. The site pushes history state for
          // in-page anchor navigation, which history-based capture would
          // wrongly count as a pageview.
          capture_pageview: false,
          capture_pageleave: true,
          person_profiles: "identified_only",
          persistence: "localStorage",
          capture_exceptions: true,
          capture_performance: { web_vitals: true },
          session_recording: { maskAllInputs: true },
          sanitize_properties: (properties) => {
            const currentUrl = properties.$current_url;

            if (typeof currentUrl === "string") {
              return {
                ...properties,
                $current_url: normalizeAnalyticsUrl(currentUrl),
              };
            }

            return properties;
          },
        });

        setAnalyticsClient(posthog);
        captureInitialPageView();
      })
      .catch(() => {
        // Analytics must never break the page.
        captureInitialPageView();
      });
  } else if (isAnalyticsEnabled) {
    captureInitialPageView();
  }
} catch {
  // Analytics must never break the page.
}

export function onRouterTransitionStart(url: string) {
  try {
    // The hook receives the raw `href` prop, which may be relative, and fires
    // before `window.location` updates — so the URL is resolved here.
    const resolvedUrl = normalizeAnalyticsUrl(url);
    const pageKey = getPageKey(resolvedUrl);

    // Same-page hash links still trigger a router transition.
    if (pageKey === lastPageKey) return;

    lastPageKey = pageKey;

    afterNavigationCommit(() => {
      trackPageView({ url: resolvedUrl, title: document.title });
    });
  } catch {
    // Analytics must never break navigation.
  }
}
