import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  eyebrow,
  title,
  muted,
  description,
  align = "left",
  accentAnchor,
  accentSpacer = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  muted?: string;
  description?: string;
  align?: "left" | "center";
  accentAnchor?: "work" | "experience" | "workflow" | "about";
  /**
   * Reserves the accent dot's slot without registering an anchor, for headings
   * inside a pinned stage whose anchor is measured from outside the stage.
   */
  accentSpacer?: boolean;
}) {
  const hasAccentSlot = Boolean(accentAnchor) || accentSpacer;

  return (
    <div
      className={cn(
        "section-heading",
        align === "center" && "section-heading-center",
      )}
    >
      <p className={cn("eyebrow", hasAccentSlot && "scroll-accent-eyebrow")}>
        {accentAnchor ? (
          <span
            className="scroll-accent-heading-target"
            data-scroll-accent-anchor={accentAnchor}
            data-scroll-accent-phase="heading"
            aria-hidden="true"
          />
        ) : accentSpacer ? (
          <span className="scroll-accent-heading-target" aria-hidden="true" />
        ) : null}
        {eyebrow}
      </p>
      <h2 id={id}>
        {title}
        {muted ? <span className="heading-muted"> {muted}</span> : null}
      </h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  );
}
