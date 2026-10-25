import { networkInterfaces } from "node:os";

import type { NextConfig } from "next";

const DEFAULT_POSTHOG_HOST = "https://eu.i.posthog.com";

/**
 * PostHog is reverse-proxied through this origin so ad blockers and tracking
 * protection do not drop events. Kept in sync with `ANALYTICS_INGEST_PATH`
 * in src/lib/analytics.ts.
 */
const INGEST_PATH = "/ingest";

const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_POSTHOG_HOST;
const posthogAssetsHost = posthogHost
  .replace("//eu.i.", "//eu-assets.i.")
  .replace("//us.i.", "//us-assets.i.");

const isAnalyticsConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim(),
);

/**
 * This machine's LAN addresses, so the dev server can be opened from a phone
 * on the same network. Next blocks dev assets for unlisted origins, which
 * leaves the page unhydrated (stuck on the launch intro). Dev-only setting.
 */
const localNetworkHosts = Object.values(networkInterfaces())
  .flat()
  .filter((address) => address?.family === "IPv4" && !address.internal)
  .map((address) => address!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: localNetworkHosts,
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.logo.dev",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
  // PostHog's ingestion API uses trailing-slash paths such as `/e/`. Next's
  // internal trailing-slash redirect runs before rewrites, so without this the
  // proxied requests would 308 and event capture would break. Only enabled
  // when the proxy is actually in use; the `redirects()` below restores
  // canonicalisation for every path except the proxy.
  ...(isAnalyticsConfigured
    ? {
        skipTrailingSlashRedirect: true,
        async redirects() {
          return [
            {
              source: "/:path((?!ingest/).*)+/",
              destination: "/:path+",
              permanent: true,
            },
          ];
        },
        async rewrites() {
          return [
            {
              source: `${INGEST_PATH}/static/:path*`,
              destination: `${posthogAssetsHost}/static/:path*`,
            },
            {
              source: `${INGEST_PATH}/array/:path*`,
              destination: `${posthogAssetsHost}/array/:path*`,
            },
            {
              source: `${INGEST_PATH}/:path*`,
              destination: `${posthogHost}/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
