import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/container";
import { profile, socialLinks } from "@/lib/portfolio";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-top">
          <Link className="brand-link" href="/" aria-label="Pavan Patil, home">
            <span className="brand-mark" aria-hidden="true">P</span>
            <span>Pavan Patil</span>
          </Link>
          <nav aria-label="Footer navigation">
            <ul>
              <li><Link href="/#work">Work</Link></li>
              <li><Link href="/#experience">Experience</Link></li>
              <li><Link href="/#about">About</Link></li>
              <li>
                <a href={`mailto:${profile.email}`}>
                  Email<ArrowUpRight aria-hidden="true" size={13} />
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
          <p>© {new Date().getFullYear()} {profile.name}. Designed and built with care.</p>
          <p>Next.js · HeroUI · TypeScript</p>
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
