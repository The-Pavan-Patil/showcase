import { WritingIndexPage, getWritingIndexMetadata } from "@/app/_pages/writing/page";

export const metadata = getWritingIndexMetadata();

export default function Writing() {
  return <WritingIndexPage />;
}
