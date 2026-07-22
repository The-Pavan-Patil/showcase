"use client";

import { Drawer } from "@heroui/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { id: "work", label: "Work", href: "/#work" },
  { id: "experience", label: "Experience", href: "/#experience" },
  { id: "about", label: "About", href: "/#about" },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(
    pathname.startsWith("/work/") ? "work" : null,
  );

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

  const currentSection = pathname.startsWith("/work/") ? "work" : activeSection;

  return (
    <header className="site-header">
      <div className="site-header-shell">
        <Link className="brand-link" href="/" aria-label="Pavan Patil, home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>Pavan Patil</span>
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
            Résumé
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>

          <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
            <Drawer.Trigger
              aria-label="Open navigation menu"
              className="mobile-menu-trigger"
            >
              <Menu aria-hidden="true" size={19} />
            </Drawer.Trigger>
            <Drawer.Backdrop className="mobile-drawer-backdrop">
              <Drawer.Content placement="right" className="mobile-drawer-content">
                <Drawer.Dialog aria-label="Mobile navigation">
                  <Drawer.Header className="mobile-drawer-header">
                    <Drawer.Heading>Navigate</Drawer.Heading>
                    <Drawer.CloseTrigger aria-label="Close navigation menu">
                      <X aria-hidden="true" size={19} />
                    </Drawer.CloseTrigger>
                  </Drawer.Header>
                  <Drawer.Body className="mobile-drawer-body">
                    <nav aria-label="Mobile navigation">
                      <ul>
                        {navigation.map((item, index) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              aria-current={currentSection === item.id ? "location" : undefined}
                              onClick={() => setIsOpen(false)}
                            >
                              <span>0{index + 1}</span>
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </Drawer.Body>
                  <Drawer.Footer className="mobile-drawer-footer">
                    <a href="/pavan-patil-resume.txt" download>
                      Download résumé
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  </Drawer.Footer>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </div>
      </div>
    </header>
  );
}

export { navigation };
