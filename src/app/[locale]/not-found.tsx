"use client";

import { usePathname } from "next/navigation";

import { NotFoundPage } from "@/app/_pages/not-found-page";
import { isPrefixedLocale, stripLocaleFromPathname } from "@/lib/i18n";

export default function LocalizedNotFound() {
  const pathname = usePathname();
  const { locale } = stripLocaleFromPathname(pathname);

  return <NotFoundPage locale={isPrefixedLocale(locale) ? locale : "en"} />;
}
