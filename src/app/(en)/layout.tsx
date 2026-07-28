import { RootShell } from "@/app/_components/root-shell";
import { getRootMetadata, viewport } from "@/lib/metadata";

import "../globals.css";

export { viewport };

export const metadata = getRootMetadata("en");

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootShell locale="en">{children}</RootShell>;
}
