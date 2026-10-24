import Script from "next/script";

import { getGoogleAnalyticsId } from "@/lib/analytics";

/**
 * Loads the Google Analytics library when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 *
 * Only the ~90KB library is loaded here, lazily, to protect the performance
 * budget. The `dataLayer` queue and property config are installed by
 * `ensureGoogleAnalytics()` from client instrumentation, which runs before
 * hydration — so events captured early are queued and drained in order once
 * this script arrives.
 */
export function GoogleAnalytics() {
  const measurementId = getGoogleAnalyticsId();

  if (!measurementId) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="lazyOnload"
    />
  );
}
