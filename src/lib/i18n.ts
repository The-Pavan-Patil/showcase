export const defaultLocale = "en";

export const supportedLocales = ["en", "ja", "de"] as const;
export const prefixedLocales = ["ja", "de"] as const;
export const navbarLocales = ["en", "ja"] as const;

export type Locale = (typeof supportedLocales)[number];
export type NavbarLocale = (typeof navbarLocales)[number];

const localePattern = /^\/(en|ja|de)(?=\/|$)/;

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function isPrefixedLocale(value: string): value is (typeof prefixedLocales)[number] {
  return prefixedLocales.includes(value as (typeof prefixedLocales)[number]);
}

export function getHomePath(locale: Locale) {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

export function getLocalizedPath(locale: Locale, pathname: string) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (locale === defaultLocale) {
    return normalizedPathname;
  }

  return normalizedPathname === "/" ? `/${locale}` : `/${locale}${normalizedPathname}`;
}

export function getWorkPath(locale: Locale, slug: string) {
  return getLocalizedPath(locale, `/work/${slug}`);
}

export function getSetupPath(locale: Locale) {
  return getLocalizedPath(locale, "/setup");
}

export function getHashHref(locale: Locale, hash: string) {
  return `${getHomePath(locale)}${hash}`;
}

export function stripLocaleFromPathname(pathname: string): {
  locale: Locale;
  pathname: string;
} {
  const normalizedPathname = pathname || "/";
  const match = normalizedPathname.match(localePattern);

  if (!match) {
    return { locale: defaultLocale, pathname: normalizedPathname };
  }

  const locale = match[1];
  const pathnameWithoutLocale = normalizedPathname.slice(match[0].length) || "/";

  return {
    locale: isLocale(locale) ? locale : defaultLocale,
    pathname: pathnameWithoutLocale,
  };
}

export function getPathForLocale(currentPathname: string, targetLocale: Locale) {
  const { pathname } = stripLocaleFromPathname(currentPathname);
  return getLocalizedPath(targetLocale, pathname);
}

export function isHomePath(pathname: string, locale: Locale) {
  return pathname === getHomePath(locale);
}

export function isWorkPath(pathname: string) {
  return stripLocaleFromPathname(pathname).pathname.startsWith("/work/");
}

export function getAlternateLanguages(pathname: string) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const { pathname: unprefixedPathname } = stripLocaleFromPathname(normalizedPathname);

  return {
    en: getLocalizedPath("en", unprefixedPathname),
    ja: getLocalizedPath("ja", unprefixedPathname),
    de: getLocalizedPath("de", unprefixedPathname),
    "x-default": getLocalizedPath(defaultLocale, unprefixedPathname),
  };
}
