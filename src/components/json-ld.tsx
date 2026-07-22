import Script from "next/script";

export function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = serializeJsonLd(data);
  const entityType = String(data["@type"] ?? "entity").toLowerCase();

  return (
    <Script
      id={`json-ld-${entityType}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
