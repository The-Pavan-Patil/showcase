import { SetupPage } from "@/app/_pages/setup/page";
import { getSetupMetadata } from "@/lib/metadata";

export const metadata = getSetupMetadata("en");

export default function EnglishSetupPage() {
  return <SetupPage locale="en" />;
}
