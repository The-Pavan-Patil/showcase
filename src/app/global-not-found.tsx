import type { Metadata } from "next";

import { RootShell } from "@/app/_components/root-shell";
import { NotFoundPage } from "@/app/_pages/not-found-page";
import { uiCopyByLocale } from "@/lib/ui-copy";

import "./globals.css";

export const metadata: Metadata = {
  title: uiCopyByLocale.en.metadata.notFoundTitle,
  description: uiCopyByLocale.en.metadata.notFoundDescription,
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <RootShell locale="en">
      <NotFoundPage locale="en" />
    </RootShell>
  );
}
