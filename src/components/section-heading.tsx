import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  eyebrow,
  title,
  muted,
  description,
  align = "left",
  accentAnchor,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  muted?: string;
  description?: string;
  align?: "left" | "center";
  accentAnchor?: "work" | "experience" | "about";
}) {
  return (
    <div
      className={cn(
        "section-heading",
        align === "center" && "section-heading-center",
      )}
    >
      <p className={cn("eyebrow", accentAnchor && "scroll-accent-eyebrow")}>
        {accentAnchor ? (
          <span
            className="scroll-accent-heading-target"
            data-scroll-accent-anchor={accentAnchor}
            data-scroll-accent-phase="heading"
            aria-hidden="true"
          />
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
