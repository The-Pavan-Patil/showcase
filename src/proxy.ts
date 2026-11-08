import { NextResponse, type NextRequest } from "next/server";

import { localeCookieName, type Locale } from "@/lib/i18n";

// Only Japan and Germany get a localized first visit. Every other country,
// including other German-speaking ones, stays on the English site.
const localeByCountry: Partial<Record<string, Exclude<Locale, "en">>> = {
  JP: "ja",
  DE: "de",
};

// Crawlers must always see the URL they asked for. Googlebot mostly crawls
// from the US, but redirecting it from anywhere would hide the English pages.
const botPattern =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|preview|lighthouse|pagespeed|headless/i;

function getPreferredLocale(request: NextRequest): Locale | null {
  const chosen = request.cookies.get(localeCookieName)?.value;

  if (chosen === "en" || chosen === "ja" || chosen === "de") {
    return chosen;
  }

  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  return (country && localeByCountry[country]) || null;
}

function isTopLevelPageVisit(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  // Client-side navigations and prefetches fetch RSC payloads, not documents.
  // Redirecting those would send a visitor who just chose English straight
  // back to the localized page.
  const fetchDest = request.headers.get("sec-fetch-dest");
  if (fetchDest && fetchDest !== "document") {
    return false;
  }

  if (!request.headers.get("accept")?.includes("text/html")) {
    return false;
  }

  return !botPattern.test(request.headers.get("user-agent") ?? "");
}

export function proxy(request: NextRequest) {
  const nextUrl = request.nextUrl.clone();
  const { pathname } = nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    nextUrl.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(nextUrl);
  }

  if (!isTopLevelPageVisit(request)) {
    return NextResponse.next();
  }

  const locale = getPreferredLocale(request);

  if (!locale || locale === "en") {
    return NextResponse.next();
  }

  nextUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  // 307 keeps "/" indexed as the English page, and no-store keeps the CDN
  // from serving one country's redirect to everyone.
  const response = NextResponse.redirect(nextUrl, 307);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie, X-Vercel-IP-Country");
  return response;
}

export const config = {
  matcher: [
    "/en",
    "/en/:path*",
    // Only the unprefixed pages that have /ja and /de twins. /writing is
    // English-only, so it is left out. RSC and prefetch requests skip the
    // proxy entirely, as do visitors who already chose English. Next needs
    // these as literals, so the conditions repeat.
    {
      source: "/",
      missing: [
        { type: "header", key: "rsc" },
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
        { type: "cookie", key: "site-locale", value: "en" },
      ],
    },
    {
      source: "/setup",
      missing: [
        { type: "header", key: "rsc" },
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
        { type: "cookie", key: "site-locale", value: "en" },
      ],
    },
    {
      source: "/work/:slug",
      missing: [
        { type: "header", key: "rsc" },
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
        { type: "cookie", key: "site-locale", value: "en" },
      ],
    },
  ],
};
