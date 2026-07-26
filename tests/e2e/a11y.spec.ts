import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/work/nudge",
  "/work/philips-greenheart",
  "/work/workforce-management-system",
];

async function skipLaunchIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("launch-terminal-seen", "true");
  });
}

for (const route of routes) {
  test(`axe reports no violations on ${route} in both themes`, async ({ page }, testInfo) => {
    test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

    if (route === "/") await skipLaunchIntro(page);
    await page.goto(route);
    const lightResults = await new AxeBuilder({ page }).analyze();
    expect(lightResults.violations).toEqual([]);

    if (testInfo.project.name === "mobile-chromium") {
      await page.getByRole("button", { name: "Open navigation utilities" }).click();
    }
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    const darkResults = await new AxeBuilder({ page }).analyze();
    expect(darkResults.violations).toEqual([]);
  });
}

test("axe reports no violations in the compact desktop header", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await skipLaunchIntro(page);
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Pavan Patil, home" }).focus();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page.mouse.wheel(0, 240);
  await expect(page.locator(".site-header")).toHaveAttribute("data-density", "compact");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("axe reports no violations in the mobile utility popover", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await skipLaunchIntro(page);
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation utilities" });
  await menu.click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.keyboard.press("Escape");
  await menu.click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await menu.click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("axe reports no violations in the launch terminal intro", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "pavanpatil.dev launch" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
