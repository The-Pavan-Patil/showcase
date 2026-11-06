import {
  WritingPostPage,
  getWritingPostMetadata,
  getWritingStaticParams,
} from "@/app/_pages/writing/page";

type WritingPostRouteProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getWritingStaticParams();
}

export async function generateMetadata({ params }: WritingPostRouteProps) {
  const { slug } = await params;
  return getWritingPostMetadata(slug);
}

export default async function WritingPost({ params }: WritingPostRouteProps) {
  const { slug } = await params;
  return <WritingPostPage slug={slug} />;
}
