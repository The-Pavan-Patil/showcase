import { HomePage } from "@/app/_pages/home/page";
import { getHomeMetadata } from "@/lib/metadata";

export const metadata = getHomeMetadata("en");

export default function Home() {
  return <HomePage locale="en" />;
}
