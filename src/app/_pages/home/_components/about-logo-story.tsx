import Image from "next/image";

export type AboutLogoStoryCopy = {
  heading: string;
  meaning: string;
  reason: string;
};

/** The About card's third slide: the 志 mark above a title styled like the
 * first slide's, then the story behind it. */
export function AboutLogoStory({ copy }: { copy: AboutLogoStoryCopy }) {
  return (
    <div className="about-logo-story">
      {/* Hidden from screen readers, which get the title and story instead;
          the alt text is for search engines. */}
      <div className="about-logo-story-art" aria-hidden="true">
        <Image src="/images/brand/shi-glyph.svg" alt="志" width={400} height={400} unoptimized />
      </div>
      <h3 className="about-card-title">{copy.heading}</h3>
      <div className="about-logo-story-copy">
        <p>{copy.meaning}</p>
        <p>{copy.reason}</p>
      </div>
    </div>
  );
}
