import { describe, expect, it } from "vitest";

import { getPortfolioContent } from "@/lib/portfolio";
import { getPersonId, getPersonSchema, getWebSiteSchema } from "@/lib/structured-data";
import { uiCopyByLocale } from "@/lib/ui-copy";

const siteUrl = "https://portfolio.example";

describe("structured data", () => {
  it("gives Pavan one stable identity with profile links and a real location", () => {
    const person = getPersonSchema({ locale: "en", siteUrl, content: getPortfolioContent("en") });

    expect(person).toMatchObject({
      "@type": "Person",
      "@id": getPersonId(siteUrl),
      name: "Pavan Patil",
      url: siteUrl,
      image: `${siteUrl}/pavan-profile.jpg`,
      address: { addressLocality: "Bengaluru", addressCountry: "IN" },
      worksFor: { name: "Ownpath Pvt. Ltd." },
    });
    expect(person.sameAs).toEqual(
      expect.arrayContaining([
        "https://github.com/The-Pavan-Patil",
        "https://www.linkedin.com/in/thepavanpatilofficial",
      ]),
    );
  });

  it("keeps the India address on the Japanese version and describes Japan availability", () => {
    const person = getPersonSchema({ locale: "ja", siteUrl, content: getPortfolioContent("ja") });

    expect(person["@id"]).toBe(getPersonId(siteUrl));
    expect(person.url).toBe(`${siteUrl}/ja`);
    expect(person.address.addressCountry).toBe("IN");
    expect(person.worksFor).toBeDefined();
    expect(uiCopyByLocale.ja.metadata.description).toContain("日本");
  });

  it("names the site's publisher by reference", () => {
    expect(getWebSiteSchema({ locale: "en", siteUrl })).toMatchObject({
      "@type": "WebSite",
      url: siteUrl,
      publisher: { "@id": getPersonId(siteUrl) },
    });
  });
});
