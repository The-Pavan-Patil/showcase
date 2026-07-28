"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getPathForLocale,
  navbarLocales,
  type Locale,
  type NavbarLocale,
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

export function LanguageToggle({
  copy,
  locale,
  onNavigate,
  presentation = "compact",
}: LanguageToggleProps) {
  const pathname = usePathname();

  return (
    <div
      aria-label={copy.languageLabel}
      className={cn("language-toggle", presentation === "menu" && "language-toggle-menu")}
    >
      <Languages aria-hidden="true" size={presentation === "menu" ? 17 : 15} />
      <div className="language-toggle-options">
        {navbarLocales.map((targetLocale: NavbarLocale) => (
          <Link
            aria-current={locale === targetLocale ? "true" : undefined}
            aria-label={`${copy.switchLanguageLabel}: ${copy.languageOptionLabels[targetLocale]}`}
            href={getPathForLocale(pathname, targetLocale)}
            hrefLang={targetLocale}
            key={targetLocale}
            lang={targetLocale}
            onClick={onNavigate}
          >
            {copy.languageOptionLabels[targetLocale]}
          </Link>
        ))}
      </div>
    </div>
  );
}
