import Image from "next/image";

export type AboutLogoStoryCopy = {
  heading: string;
  reading: string;
  meaning: string;
  reason: string;
};

export function AboutLogoStory({ copy }: { copy: AboutLogoStoryCopy }) {
  return (
    <div className="about-logo-story">
      <div className="about-logo-story-art" aria-hidden="true">
        <Image src="/images/brand/shi-glyph.svg" alt="" width={400} height={400} unoptimized />
      </div>
      <div className="about-logo-story-copy">
        <p className="about-logo-story-reading">{copy.reading}</p>
        <h3>{copy.heading}</h3>
        <p>{copy.meaning}</p>
        <p>{copy.reason}</p>
      </div>
    </div>
  );
}
