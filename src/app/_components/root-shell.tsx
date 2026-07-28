import type { ReactNode } from "react";
import { Inter, Manrope, Michroma, Noto_Sans_JP } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { uiCopyByLocale } from "@/lib/ui-copy";

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

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: "variable",
  display: "swap",
});

export function RootShell({
  children,
  locale,
}: Readonly<{
  children: ReactNode;
  locale: Locale;
}>) {
  const ui = uiCopyByLocale[locale];

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable} ${michroma.variable} ${notoSansJp.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">{ui.header.skipToMain}</a>
        <Providers>
          <SiteHeader
            copy={ui.header}
            locale={locale}
            themeCopy={ui.theme}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
