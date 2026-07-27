import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested portfolio page could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <main id="main-content" className="not-found-main">
        <Container>
          <p className="eyebrow">404 · Page not found</p>
          <h1>This route doesn’t exist.</h1>
          <p>
            The address may have changed, or the page may never have existed. Pavan’s selected
            work and verified experience are still available from the portfolio.
          </p>
          <div className="not-found-actions">
            <Link className="primary-cta" href="/#work">
              <ArrowLeft aria-hidden="true" size={17} />
              View selected work
            </Link>
            <Link className="secondary-cta" href="/">
              Return home
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
