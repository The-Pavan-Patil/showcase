import { notFound } from "next/navigation";

import {
  WorkPage,
  generateWorkMetadata,
  getWorkStaticParams,
} from "@/app/_pages/work/page";
import { isPrefixedLocale, prefixedLocales } from "@/lib/i18n";

type LocalizedWorkPageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return prefixedLocales.flatMap((locale) =>
    getWorkStaticParams(locale).map(({ slug }) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: LocalizedWorkPageProps) {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return generateWorkMetadata({ locale, slug });
}

export default async function LocalizedWorkPage({ params }: LocalizedWorkPageProps) {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return <WorkPage locale={locale} slug={slug} />;
}
