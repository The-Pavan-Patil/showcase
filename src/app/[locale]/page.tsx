import { notFound } from "next/navigation";

import { HomePage } from "@/app/_pages/home-page";
import { isPrefixedLocale, prefixedLocales } from "@/lib/i18n";
import { getHomeMetadata } from "@/lib/metadata";

type LocalizedHomeProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedHomeProps) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return getHomeMetadata(locale);
}

export default async function LocalizedHome({ params }: LocalizedHomeProps) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return <HomePage locale={locale} />;
}
