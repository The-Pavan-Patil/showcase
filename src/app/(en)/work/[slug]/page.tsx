import {
  WorkPage,
  generateWorkMetadata,
  getWorkStaticParams,
} from "@/app/_pages/work/page";

type WorkPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getWorkStaticParams("en");
}

export async function generateMetadata({ params }: WorkPageProps) {
  const { slug } = await params;
  return generateWorkMetadata({ locale: "en", slug });
}

export default async function EnglishWorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  return <WorkPage locale="en" slug={slug} />;
}
