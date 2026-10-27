import { Container } from "@/components/container";

export type AboutBeyondNote = {
  keyword: string;
  label: string;
  text: string;
};

/**
 * Supporting context for the About section. In the live scene it is the
 * card's final beat ("card"); otherwise it is a compact strip under the card.
 */
export function AboutBeyond({
  ariaLabel,
  eyebrow,
  heading,
  notes,
  variant = "strip",
}: {
  ariaLabel: string;
  eyebrow: string;
  heading: string;
  notes: readonly AboutBeyondNote[];
  variant?: "card" | "strip";
}) {
  const content = (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="sr-only">{heading}</h3>
      <ul className="about-beyond-list" aria-label={ariaLabel}>
        {notes.map((note) => (
          <li className="about-beyond-row" key={note.label}>
            <h4 className="about-beyond-keyword">{note.keyword}</h4>
            <div className="about-beyond-copy">
              <p className="about-beyond-label">{note.label}</p>
              <p className="about-beyond-text">{note.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );

  return variant === "card" ? (
    <div className="about-beyond about-beyond-in-card">{content}</div>
  ) : (
    <Container className="about-beyond about-beyond-strip">{content}</Container>
  );
}
