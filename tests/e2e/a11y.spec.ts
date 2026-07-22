import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/work/nudge",
  "/work/philips-greenheart",
  "/work/workforce-management-system",
];

for (const route of routes) {
  test(`axe reports no violations on ${route} in both themes`, async ({ page }) => {
    await page.goto(route);
    const lightResults = await new AxeBuilder({ page }).analyze();
    expect(lightResults.violations).toEqual([]);

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    const darkResults = await new AxeBuilder({ page }).analyze();
    expect(darkResults.violations).toEqual([]);
  });
}

test("axe reports no violations in the open mobile drawer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  await menu.click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await menu.click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
