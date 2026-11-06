export function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * A plain `<script>` rather than `next/script`: structured data is not
 * executable, and this keeps it in the server-rendered HTML that crawlers read
 * first (the approach node_modules/next/dist/docs/01-app/02-guides/json-ld.md
 * recommends).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = serializeJsonLd(data);
  const entityType = String(data["@type"] ?? (data["@graph"] ? "graph" : "entity")).toLowerCase();

  return (
    <script
      id={`json-ld-${entityType}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
