"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { trackEvent } from "@/lib/analytics";
import {
  getPathForLocale,
  getToggleLocales,
  localeCookieName,
  type Locale,
} from "@/lib/i18n";
import type { UiCopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

type LanguageToggleProps = {
  copy: Pick<
    UiCopy["header"],
    "languageLabel" | "languageOptionLabels" | "switchLanguageLabel"
  >;
  locale: Locale;
  onNavigate?: () => void;
  presentation?: "compact" | "menu";
};

type ThumbBox = { height: number; left: number; top: number; width: number };

/**
 * The thumb stretches over both options, then lets go of the old one and
 * settles on the new one with a slight squeeze. Each language is its own
 * root layout, so switching loads a new page: while the thumb travels the
 * page content dips out under the header, and the page swaps once the thumb
 * has arrived, so the new language comes in on a calm page instead of a
 * flash. (A cross-document view transition would do this natively, but it
 * freezes rendering in Chromium 149.)
 */
const THUMB_TRAVEL_MS = 440;
const SWITCH_AFTER_MS = 320;
const CONTENT_FADE: KeyframeAnimationOptions = {
  delay: 80,
  duration: 260,
  easing: "cubic-bezier(0.4, 0, 1, 1)",
  fill: "forwards",
};
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Everything under the header, which dips out while the language changes. */
function pageContent() {
  return [
    document.getElementById("main-content"),
    document.querySelector<HTMLElement>(".site-footer"),
    document.querySelector<HTMLElement>(".scroll-accent-traveler"),
  ].filter((element): element is HTMLElement => Boolean(element));
}

export function LanguageToggle({
  copy,
  locale,
  onNavigate,
  presentation = "compact",
}: LanguageToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const optionsRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const thumbBox = useRef<ThumbBox | null>(null);
  const selectedRef = useRef<Locale>(locale);
  const switchTimer = useRef<number | undefined>(undefined);
  const contentFade = useRef<Animation[]>([]);
  const [selected, setSelected] = useState<Locale>(locale);

  /** "out" dips the content, "back" brings it back, "reset" restores it at once. */
  const fadeContent = useCallback((mode: "out" | "back" | "reset") => {
    if (mode === "back") {
      contentFade.current.forEach((animation) => animation.reverse());
      return;
    }
    contentFade.current.forEach((animation) => animation.cancel());
    contentFade.current =
      mode === "out" && !window.matchMedia(REDUCED_MOTION_QUERY).matches
        ? pageContent()
            .filter((element) => typeof element.animate === "function")
            .map((element) => element.animate([{ opacity: 0 }], CONTENT_FADE))
        : [];
  }, []);

  const placeThumb = useCallback((target: Locale, animate: boolean) => {
    const options = optionsRef.current;
    const thumb = thumbRef.current;
    const link = options?.querySelector<HTMLElement>(`a[hreflang="${target}"]`);
    if (!options || !thumb || !link || !link.offsetWidth) return;

    const next: ThumbBox = {
      height: link.offsetHeight,
      left: link.offsetLeft,
      top: link.offsetTop,
      width: link.offsetWidth,
    };
    const previous = thumbBox.current;
    thumbBox.current = next;
    Object.assign(thumb.style, {
      height: `${next.height}px`,
      left: `${next.left}px`,
      top: `${next.top}px`,
      width: `${next.width}px`,
    });
    options.dataset.thumb = "ready";

    if (
      !animate ||
      !previous ||
      typeof thumb.animate !== "function" ||
      window.matchMedia(REDUCED_MOTION_QUERY).matches
    ) {
      return;
    }

    const spanLeft = Math.min(previous.left, next.left);
    const spanWidth =
      Math.max(previous.left + previous.width, next.left + next.width) - spanLeft;

    thumb.getAnimations().forEach((animation) => animation.cancel());
    thumb.animate(
      [
        {
          easing: "cubic-bezier(0.45, 0, 0.2, 1)",
          left: `${previous.left}px`,
          transform: "scale(1)",
          width: `${previous.width}px`,
        },
        {
          // The leading edge reaches the new option first.
          easing: "cubic-bezier(0.3, 1.3, 0.5, 1)",
          left: `${spanLeft}px`,
          offset: 0.48,
          transform: "scale(1, 0.9)",
          width: `${spanWidth}px`,
        },
        {
          left: `${next.left}px`,
          transform: "scale(1)",
          width: `${next.width}px`,
        },
      ],
      { duration: THUMB_TRAVEL_MS },
    );
  }, []);

  const select = useCallback(
    (target: Locale, animate: boolean) => {
      selectedRef.current = target;
      setSelected(target);
      placeThumb(target, animate);
    },
    [placeThumb],
  );

  useLayoutEffect(() => {
    const options = optionsRef.current;
    if (!options) return;

    // The header changes density with a transition; the thumb follows the
    // option's size as it goes.
    const follow = () => placeThumb(selectedRef.current, false);
    follow();
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(follow);
    resizeObserver?.observe(options);
    return () => resizeObserver?.disconnect();
  }, [placeThumb]);

  useEffect(() => {
    // Coming back from the other language through the back/forward cache
    // restores this page as it was left, mid-switch.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      window.clearTimeout(switchTimer.current);
      fadeContent("reset");
      select(locale, false);
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.clearTimeout(switchTimer.current);
    };
  }, [fadeContent, locale, select]);

  const handleClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    target: Locale,
    href: string,
  ) => {
    // Let modified clicks open the other language in a new tab or window.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (target === selectedRef.current) return;

    window.clearTimeout(switchTimer.current);
    select(target, true);
    fadeContent(target === locale ? "back" : "out");
    // Saved at once; changing your mind saves this page's language again.
    rememberLocale(target);

    // Changing your mind before the page swaps slides back and stays.
    if (target === locale) return;

    trackEvent("language_changed", { from: locale, to: target });
    switchTimer.current = window.setTimeout(
      () => {
        onNavigate?.();
        router.push(href);
      },
      window.matchMedia(REDUCED_MOTION_QUERY).matches ? 0 : SWITCH_AFTER_MS,
    );
  };

  return (
    <div
      aria-label={copy.languageLabel}
      className={cn("language-toggle", presentation === "menu" && "language-toggle-menu")}
    >
      <Languages aria-hidden="true" size={presentation === "menu" ? 17 : 15} />
      <div className="language-toggle-options" ref={optionsRef}>
        <span aria-hidden="true" className="language-toggle-thumb" ref={thumbRef} />
        {getToggleLocales(locale).map((targetLocale) => {
          const href = getPathForLocale(pathname, targetLocale);

          return (
            <Link
              aria-current={locale === targetLocale ? "true" : undefined}
              aria-label={`${copy.switchLanguageLabel}: ${copy.languageOptionLabels[targetLocale]}`}
              data-selected={selected === targetLocale ? "" : undefined}
              href={href}
              hrefLang={targetLocale}
              key={targetLocale}
              lang={targetLocale}
              onClick={(event) => handleClick(event, targetLocale, href)}
            >
              {copy.languageOptionLabels[targetLocale]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function rememberLocale(locale: Locale) {
  try {
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Cookies can be blocked; the link still navigates.
  }
}
