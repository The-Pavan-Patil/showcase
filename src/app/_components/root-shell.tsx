import type { ReactNode } from "react";
import { Figtree, Lato, Michroma, Montserrat, Noto_Sans_JP } from "next/font/google";

import { GoogleAnalytics } from "@/components/google-analytics";
import { JapaneseWebFont } from "@/components/japanese-web-font";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { uiCopyByLocale } from "@/lib/ui-copy";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  preload: false,
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Preloaded only where it is the largest paint: see heroFont, rendered by
// the English home page. Elsewhere a preload would compete with the CSS.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: "variable",
  display: "swap",
  preload: false,
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
      className={`${lato.variable} ${figtree.variable} ${michroma.variable} ${montserrat.variable} ${notoSansJp.variable}`}
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
        <GoogleAnalytics />
        {locale === "ja" ? <JapaneseWebFont /> : null}
      </body>
    </html>
  );
}
