import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { getHashHref, getHomePath, type Locale } from "@/lib/i18n";
import { getPortfolioContent } from "@/lib/portfolio";
import { uiCopyByLocale } from "@/lib/ui-copy";

export function NotFoundPage({ locale }: { locale: Locale }) {
  const ui = uiCopyByLocale[locale];
  const { profile, socialLinks } = getPortfolioContent(locale);

  return (
    <>
      <main id="main-content" className="not-found-main">
        <Container>
          <p className="eyebrow">{ui.notFound.eyebrow}</p>
          <h1>{ui.notFound.title}</h1>
          <p>{ui.notFound.description}</p>
          <div className="not-found-actions">
            <Link className="primary-cta" href={getHashHref(locale, "#work")}>
              <ArrowLeft aria-hidden="true" size={17} />
              {ui.notFound.viewSelectedWork}
            </Link>
            <Link className="secondary-cta" href={getHomePath(locale)}>
              {ui.notFound.returnHome}
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter
        copy={{ ...ui.footer, brandAria: ui.header.brandAria, navigation: ui.header.navigation }}
        locale={locale}
        profile={profile}
        socialLinks={socialLinks}
      />
    </>
  );
}
