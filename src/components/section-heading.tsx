import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  muted,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  muted?: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "section-heading",
        align === "center" && "section-heading-center",
      )}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2>
        {title}
        {muted ? <span className="heading-muted"> {muted}</span> : null}
      </h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  );
}
