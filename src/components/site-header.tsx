"use client";

import { Popover } from "@heroui/react/popover";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileDown,
  House,
  Mail,
  MoreHorizontal,
  Route,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { id: "work", label: "Work", href: "/#work", icon: BriefcaseBusiness },
  { id: "experience", label: "Experience", href: "/#experience", icon: Route },
  { id: "about", label: "About", href: "/#about", icon: UserRound },
  { id: "contact", label: "Contact", href: "/#contact", icon: Mail },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [compactPathname, setCompactPathname] = useState<string | null>(null);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(
    pathname.startsWith("/work/") ? "work" : null,
  );
  const isCompact = compactPathname === pathname;

  useEffect(() => {
    if (pathname !== "/") return;

    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-22% 0px -62%", threshold: [0, 0.1, 0.35] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let downwardDistance = 0;
    let upwardDistance = 0;
    let animationFrame = 0;

    const measureScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;

      if (scrollY <= 64) {
        downwardDistance = 0;
        upwardDistance = 0;
        setCompactPathname(null);
      } else if (delta > 1) {
        downwardDistance += delta;
        upwardDistance = 0;

        if (scrollY > 96 && downwardDistance >= 24) {
          setCompactPathname(pathname);
          downwardDistance = 0;
        }
      } else if (delta < -1) {
        upwardDistance += Math.abs(delta);
        downwardDistance = 0;

        if (upwardDistance >= 16) {
          setCompactPathname(null);
          upwardDistance = 0;
        }
      }

      lastScrollY = scrollY;
      animationFrame = 0;
    };

    const handleScroll = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(measureScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [pathname]);

  const currentSection = pathname.startsWith("/work/") ? "work" : activeSection;

  return (
    <header
      className="site-header"
      data-density={isCompact ? "compact" : "expanded"}
      onFocusCapture={() => setCompactPathname(null)}
    >
      <div className="site-header-shell">
        <Link className="brand-link" href="/" aria-label="Pavan Patil, home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span className="brand-name">Pavan Patil</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={currentSection === item.id ? "location" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <a className="resume-link desktop-resume" href="/pavan-patil-resume.txt" download>
            <span>Résumé</span>
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </div>
      </div>

      <div className="mobile-navigation-shell">
        <nav className="mobile-tab-bar" aria-label="Primary navigation">
          <ul>
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={currentSection === item.id ? "location" : undefined}
                  >
                    <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Popover isOpen={isUtilitiesOpen} onOpenChange={setIsUtilitiesOpen}>
          <Popover.Trigger
            aria-label="Open navigation utilities"
            className="mobile-utility-trigger"
            tabIndex={0}
          >
            <MoreHorizontal aria-hidden="true" size={23} />
          </Popover.Trigger>
          <Popover.Content
            placement="top end"
            offset={12}
            className="mobile-utility-popover"
          >
            <Popover.Dialog aria-label="Navigation utilities">
              <Popover.Heading className="sr-only">Navigation utilities</Popover.Heading>
              <div className="mobile-utility-menu">
                <Link href="/" onClick={() => setIsUtilitiesOpen(false)}>
                  <House aria-hidden="true" size={17} />
                  <span>Home</span>
                </Link>
                <ThemeToggle
                  presentation="menu"
                  onThemeChange={() => setIsUtilitiesOpen(false)}
                />
                <a
                  href="/pavan-patil-resume.txt"
                  download
                  onClick={() => setIsUtilitiesOpen(false)}
                >
                  <FileDown aria-hidden="true" size={17} />
                  <span>Download résumé</span>
                </a>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>
    </header>
  );
}

export { navigation };
