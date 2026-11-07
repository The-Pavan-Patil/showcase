import { heroFont } from "@/app/_pages/home/_components/hero-font";
import { HomePage } from "@/app/_pages/home/page";
import { getHomeMetadata } from "@/lib/metadata";

export const metadata = getHomeMetadata("en");

export default function Home() {
  // Imported here, not in HomePage, so the preload stays on the English
  // home page: on /ja the largest paint is in the device font.
  return <HomePage locale="en" mainClassName={heroFont.variable} />;
}
