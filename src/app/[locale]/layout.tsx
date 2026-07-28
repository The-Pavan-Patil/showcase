import { notFound } from "next/navigation";

import { RootShell } from "@/app/_components/root-shell";
import { prefixedLocales, isPrefixedLocale } from "@/lib/i18n";
import { getRootMetadata, viewport } from "@/lib/metadata";

import "../globals.css";

export { viewport };

type LocalizedLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedLayoutProps) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return getRootMetadata(locale);
}

export default async function LocalizedRootLayout({
  children,
  params,
}: LocalizedLayoutProps) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();

  return <RootShell locale={locale}>{children}</RootShell>;
}
