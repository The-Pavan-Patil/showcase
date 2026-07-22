import { describe, expect, it } from "vitest";

import { JsonLd, serializeJsonLd } from "@/components/json-ld";

describe("JsonLd", () => {
  it("serializes structured data and escapes markup", () => {
    const data = { "@context": "https://schema.org", "@type": "Person", name: "<Pavan>" };
    const json = serializeJsonLd(data);
    const element = JsonLd({ data });

    expect(element.props.type).toBe("application/ld+json");
    expect(element.props.id).toBe("json-ld-person");
    expect(json).toContain("\\u003cPavan>");
    expect(json).not.toContain("<Pavan>");
  });
});
