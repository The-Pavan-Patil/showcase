import { expect, test } from "@playwright/test";

const routes = [
  ["home", "/"],
  ["nudge", "/work/nudge"],
  ["philips", "/work/philips-greenheart"],
  ["workforce", "/work/workforce-management-system"],
] as const;

for (const [name, route] of routes) {
  test(`${name} light and dark visual baselines`, async ({ page }, testInfo) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    // The Selected Work dust loads three.js once the visitor engages and
    // pauses (a key press counts and doesn't scroll); wait until it has
    // settled on WebGL dust or the plain fallback. Retried, as a press before
    // hydration is not yet heard.
    if (route === "/") {
      await expect(async () => {
        await page.keyboard.press("Shift");
        await expect(page.locator(".dust-track[data-dust]")).toBeAttached({ timeout: 4_000 });
      }).toPass({ timeout: 20_000 });
    }
    await expect(page).toHaveScreenshot(`${name}-light.png`, { fullPage: true, animations: "disabled" });

    if (testInfo.project.name === "mobile-chromium") {
      await page.getByRole("button", { name: "Open navigation utilities" }).click();
    }
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await expect(page).toHaveScreenshot(`${name}-dark.png`, { fullPage: true, animations: "disabled" });
  });
}

test("desktop compact navbar light and dark visual baselines", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Pavan Patil, home" }).focus();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page.mouse.wheel(0, 240);
  await expect(page.locator(".site-header")).toHaveAttribute("data-density", "compact");
  await expect(page).toHaveScreenshot("navbar-compact-light.png", { animations: "disabled" });

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page).toHaveScreenshot("navbar-compact-dark.png", { animations: "disabled" });
});

test("mobile utility popover light and dark visual baselines", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const menu = page.getByRole("button", { name: "Open navigation utilities" });

  await menu.click();
  await expect(page).toHaveScreenshot("mobile-utilities-light.png", { animations: "disabled" });
  await page.keyboard.press("Escape");

  await menu.click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await menu.click();
  await expect(page).toHaveScreenshot("mobile-utilities-dark.png", { animations: "disabled" });
});
