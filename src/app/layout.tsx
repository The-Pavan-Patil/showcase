import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import { Providers } from "@/components/providers";
import { getSiteUrl } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pavan Patil — Software Engineer",
    template: "%s — Pavan Patil",
  },
  description:
    "Software engineer building web, mobile, and backend products with TypeScript, React, Next.js, React Native, Node.js, and PostgreSQL.",
  keywords: [
    "Pavan Patil",
    "Software Engineer",
    "TypeScript",
    "React",
    "Next.js",
    "React Native",
    "Node.js",
  ],
  authors: [{ name: "Pavan Patil", url: siteUrl }],
  creator: "Pavan Patil",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Pavan Patil",
    title: "Pavan Patil — Software Engineer",
    description:
      "Dependable software for complex, real-world workflows across web, mobile, backend, and data-intensive systems.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Pavan Patil — Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pavan Patil — Software Engineer",
    description: "Dependable software for complex, real-world workflows.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
