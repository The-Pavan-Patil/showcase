import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/container";
import { getHashHref, getHomePath, type Locale } from "@/lib/i18n";
import type { Profile, SocialLink } from "@/lib/portfolio";
import type { UiCopy } from "@/lib/ui-copy";

type SiteFooterProps = {
  copy: UiCopy["footer"] & Pick<UiCopy["header"], "brandAria" | "navigation">;
  locale: Locale;
  profile: Profile;
  socialLinks: SocialLink[];
};

export function SiteFooter({ copy, locale, profile, socialLinks }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-top">
          <Link className="brand-link" href={getHomePath(locale)} aria-label={copy.brandAria}>
            <span className="brand-mark" aria-hidden="true">P</span>
            <span>Pavan Patil</span>
          </Link>
          <nav aria-label={copy.navigationAria}>
            <ul>
              <li><Link href={getHashHref(locale, "#work")}>{copy.navigation.work}</Link></li>
              <li><Link href={getHashHref(locale, "#experience")}>{copy.navigation.experience}</Link></li>
              <li><Link href={getHashHref(locale, "#about")}>{copy.navigation.about}</Link></li>
              <li>
                <a href={`mailto:${profile.email}`}>
                  {copy.email}<ArrowUpRight aria-hidden="true" size={13} />
                </a>
              </li>
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.ariaLabel}>
                    {link.label}<ArrowUpRight aria-hidden="true" size={13} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {profile.name}. {copy.builtWithCare}</p>
          <p>{copy.stack}</p>
        </div>
        <div className="footer-watermark" aria-hidden="true">
          <p>
            {"PAVAN".split("").map((letter, index) => (
              <span key={`${letter}-${index}`}>{letter}</span>
            ))}
          </p>
        </div>
      </Container>
    </footer>
  );
}
