import { notFound } from "next/navigation";

import { SetupPage } from "@/app/_pages/setup/page";
import { isPrefixedLocale, prefixedLocales } from "@/lib/i18n";
import { getSetupMetadata } from "@/lib/metadata";

type LocalizedSetupPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedSetupPageProps) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return getSetupMetadata(locale);
}

export default async function LocalizedSetupPage({ params }: LocalizedSetupPageProps) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return <SetupPage locale={locale} />;
}
