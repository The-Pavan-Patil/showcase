import type { Metadata } from "next";

import { NotFoundPage } from "@/app/_pages/not-found-page";
import { uiCopyByLocale } from "@/lib/ui-copy";

export const metadata: Metadata = {
  title: uiCopyByLocale.en.metadata.notFoundTitle,
  description: uiCopyByLocale.en.metadata.notFoundDescription,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundPage locale="en" />;
}
