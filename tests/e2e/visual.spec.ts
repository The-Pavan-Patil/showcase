import { expect, test } from "@playwright/test";

const routes = [
  ["home", "/"],
  ["nudge", "/work/nudge"],
  ["philips", "/work/philips-greenheart"],
  ["workforce", "/work/workforce-management-system"],
] as const;

for (const [name, route] of routes) {
  test(`${name} light and dark visual baselines`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}-light.png`, { fullPage: true, animations: "disabled" });

    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page).toHaveScreenshot(`${name}-dark.png`, { fullPage: true, animations: "disabled" });
  });
}

test("mobile drawer light and dark visual baselines", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const menu = page.getByRole("button", { name: "Open navigation menu" });

  await menu.click();
  await expect(page).toHaveScreenshot("drawer-light.png", { animations: "disabled" });
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await menu.click();
  await expect(page).toHaveScreenshot("drawer-dark.png", { animations: "disabled" });
});
