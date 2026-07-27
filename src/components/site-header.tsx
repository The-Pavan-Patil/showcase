"use client";

import { Popover } from "@heroui/react";
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
import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { id: "work", label: "Work", href: "/#work", icon: BriefcaseBusiness },
  { id: "experience", label: "Experience", href: "/#experience", icon: Route },
  { id: "about", label: "About", href: "/#about", icon: UserRound },
  { id: "contact", label: "Contact", href: "/#contact", icon: Mail },
] as const;

type NavigationId = (typeof navigation)[number]["id"];
type NavigationSurface = "desktop" | "mobile";

type BubbleMetrics = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export function SiteHeader() {
  const pathname = usePathname();
  const [compactPathname, setCompactPathname] = useState<string | null>(null);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [activeSelection, setActiveSelection] = useState<{
    id: NavigationId | null;
    pathname: string;
  }>({
    id: pathname.startsWith("/work/") ? "work" : null,
    pathname,
  });
  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const desktopBubbleRef = useRef<HTMLSpanElement>(null);
  const mobileBubbleRef = useRef<HTMLSpanElement>(null);
  const pendingNavigationRef = useRef<NavigationId | null>(null);
  const pendingNavigationTimerRef = useRef<number | null>(null);
  const lastBubbleMetrics = useRef<Record<NavigationSurface, BubbleMetrics | null>>({
    desktop: null,
    mobile: null,
  });
  const isCompact = compactPathname === pathname;
  const currentSection =
    activeSelection.pathname === pathname
      ? activeSelection.id
      : pathname.startsWith("/work/")
        ? "work"
        : activeSelection.id;

  const getNavigationElements = useCallback(
    (surface: NavigationSurface): {
      bubbleRef: RefObject<HTMLSpanElement | null>;
      navRef: RefObject<HTMLElement | null>;
    } =>
      surface === "desktop"
        ? { bubbleRef: desktopBubbleRef, navRef: desktopNavRef }
        : { bubbleRef: mobileBubbleRef, navRef: mobileNavRef },
    [],
  );

  const positionSelectionBubble = useCallback(
    (surface: NavigationSurface, id: NavigationId, animate = false) => {
      const { bubbleRef, navRef } = getNavigationElements(surface);
      const nav = navRef.current;
      const bubble = bubbleRef.current;
      const link = nav?.querySelector<HTMLElement>(`[data-navigation-id="${id}"]`);

      if (!nav || !bubble || !link) return;

      const navBounds = nav.getBoundingClientRect();
      const linkBounds = link.getBoundingClientRect();

      if (!navBounds.width || !linkBounds.width) return;

      const next: BubbleMetrics = {
        height: linkBounds.height,
        left: linkBounds.left - navBounds.left,
        top: linkBounds.top - navBounds.top,
        width: linkBounds.width,
      };
      const previous = lastBubbleMetrics.current[surface] ?? next;

      lastBubbleMetrics.current[surface] = next;
      Object.assign(bubble.style, {
        height: `${next.height}px`,
        left: `${next.left}px`,
        top: `${next.top}px`,
        width: `${next.width}px`,
      });
      bubble.dataset.ready = "true";

      if (
        !animate ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        typeof bubble.animate !== "function"
      ) {
        return;
      }

      const distance = Math.abs(next.left - previous.left);
      const direction = Math.sign(next.left - previous.left) || 1;
      const travelExpansion =
        surface === "mobile"
          ? Math.min(44, Math.max(18, distance * 0.22))
          : Math.min(30, Math.max(12, distance * 0.16));
      const travelWidth =
        Math.max(previous.width, next.width) + travelExpansion;
      const midpointCenter =
        (previous.left + previous.width / 2 + next.left + next.width / 2) / 2;
      const midpointLeft = midpointCenter - travelWidth / 2;
      const lift = surface === "mobile" ? 5 : 3;
      const travelHeightExpansion = surface === "mobile" ? 6 : 3;
      const landingExpansion = surface === "mobile" ? 6 : 4;

      bubble.getAnimations().forEach((animation) => animation.cancel());
      bubble.classList.add("is-traveling");

      const animation = bubble.animate(
        [
          {
            height: `${previous.height}px`,
            left: `${previous.left}px`,
            top: `${previous.top}px`,
            transform: "translateY(0) scale(1)",
            width: `${previous.width}px`,
          },
          {
            height: `${previous.height + 4}px`,
            left: `${previous.left - 2}px`,
            offset: 0.16,
            top: `${previous.top - 2}px`,
            transform: `translateY(${-lift}px) scale(1.04, 1.08)`,
            width: `${previous.width + 4}px`,
          },
          {
            height: `${Math.max(previous.height, next.height) + travelHeightExpansion}px`,
            left: `${midpointLeft}px`,
            offset: 0.52,
            top: `${Math.min(previous.top, next.top) - 1}px`,
            transform: `translateY(${-lift}px) scale(1.03, 0.98) skewX(${direction * -1.5}deg)`,
            width: `${travelWidth}px`,
          },
          {
            height: `${next.height + landingExpansion}px`,
            left: `${next.left - landingExpansion / 2}px`,
            offset: 0.8,
            top: `${next.top - landingExpansion / 2}px`,
            transform: "translateY(-1px) scale(1.04, 1.06)",
            width: `${next.width + landingExpansion}px`,
          },
          {
            height: `${next.height}px`,
            left: `${next.left}px`,
            top: `${next.top}px`,
            transform: "translateY(0) scale(1)",
            width: `${next.width}px`,
          },
        ],
        {
          duration: surface === "mobile" ? 880 : 780,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      );

      if (typeof link.animate === "function") {
        link.animate(
          [
            { transform: "translateY(0) scale(1)" },
            {
              transform: `translateY(-1px) scale(${surface === "mobile" ? 1.075 : 1.055})`,
              offset: 0.58,
            },
            { transform: "translateY(0) scale(1)" },
          ],
          {
            delay: surface === "mobile" ? 310 : 260,
            duration: surface === "mobile" ? 570 : 510,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        );
      }

      animation.addEventListener(
        "finish",
        () => bubble.classList.remove("is-traveling"),
        { once: true },
      );
      animation.addEventListener(
        "cancel",
        () => bubble.classList.remove("is-traveling"),
        { once: true },
      );
    },
    [getNavigationElements],
  );

  const handleNavigationClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    surface: NavigationSurface,
    id: NavigationId,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    positionSelectionBubble(surface, id, true);
    pendingNavigationRef.current = id;
    if (pendingNavigationTimerRef.current) {
      window.clearTimeout(pendingNavigationTimerRef.current);
    }
    pendingNavigationTimerRef.current = window.setTimeout(() => {
      pendingNavigationRef.current = null;
      pendingNavigationTimerRef.current = null;
    }, 1200);
    setActiveSelection({ id, pathname });
  };

  useEffect(
    () => () => {
      if (pendingNavigationTimerRef.current) {
        window.clearTimeout(pendingNavigationTimerRef.current);
      }
    },
    [],
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
        if (visible?.target.id) {
          const visibleId = visible.target.id as NavigationId;

          if (pendingNavigationRef.current) return;

          setActiveSelection({
            id: visibleId,
            pathname,
          });
        }
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

  useEffect(() => {
    if (!currentSection) return;

    const syncBubblePositions = () => {
      positionSelectionBubble("desktop", currentSection);
      positionSelectionBubble("mobile", currentSection);
    };

    syncBubblePositions();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(syncBubblePositions);

    if (desktopNavRef.current) resizeObserver?.observe(desktopNavRef.current);
    if (mobileNavRef.current) resizeObserver?.observe(mobileNavRef.current);
    window.addEventListener("resize", syncBubblePositions);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncBubblePositions);
    };
  }, [currentSection, isCompact, positionSelectionBubble]);

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

        <nav className="desktop-nav" aria-label="Primary navigation" ref={desktopNavRef}>
          <span
            aria-hidden="true"
            className="nav-selection-bubble desktop-selection-bubble"
            ref={desktopBubbleRef}
          />
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-navigation-id={item.id}
                  aria-current={currentSection === item.id ? "location" : undefined}
                  onClick={(event) => handleNavigationClick(event, "desktop", item.id)}
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
        <nav className="mobile-tab-bar" aria-label="Primary navigation" ref={mobileNavRef}>
          <span
            aria-hidden="true"
            className="nav-selection-bubble mobile-selection-bubble"
            ref={mobileBubbleRef}
          />
          <ul>
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-navigation-id={item.id}
                    aria-current={currentSection === item.id ? "location" : undefined}
                    onClick={(event) => handleNavigationClick(event, "mobile", item.id)}
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
