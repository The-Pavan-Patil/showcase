import { expect, test } from "@playwright/test";

const projects = [
  ["nudge", "Nudge"],
  ["philips-greenheart", "Philips Greenheart"],
  ["workforce-management-system", "Workforce Management"],
] as const;

test("homepage exposes the primary portfolio journey", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("dependable software");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /case study/i })).toHaveCount(3);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  expect(errors).toEqual([]);
});

for (const [slug, title] of projects) {
  test(`${title} has a static case-study route`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText("The challenge")).toBeVisible();
    await expect(page.getByText("The approach")).toBeVisible();
    await expect(page.getByText("The outcome")).toBeVisible();
  });
}

test("unknown work returns a not-found response", async ({ request }) => {
  const response = await request.get("/work/not-a-real-project");
  expect(response.status()).toBe(404);
});

test("unknown work offers a recovery path", async ({ page }) => {
  await page.goto("/work/not-a-real-project");
  await expect(page.getByRole("heading", { level: 1, name: "This route doesn’t exist." })).toBeVisible();
  await expect(page.getByRole("link", { name: "View selected work" })).toHaveAttribute("href", "/#work");
});

test("desktop navigation shrinks down and expands up without losing destinations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Pavan Patil, home" }).focus();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  const header = page.locator(".site-header");
  const shell = page.locator(".site-header-shell");
  const expandedBox = await shell.boundingBox();
  expect(expandedBox).not.toBeNull();

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page.mouse.wheel(0, 240);
  await expect(header).toHaveAttribute("data-density", "compact");

  await expect.poll(async () => (await shell.boundingBox())?.height ?? Infinity)
    .toBeLessThan(expandedBox!.height);
  await expect.poll(async () => (await shell.boundingBox())?.width ?? Infinity)
    .toBeLessThan(expandedBox!.width);
  await expect(page.locator(".desktop-nav").getByRole("link")).toHaveCount(4);

  await page.mouse.wheel(0, -60);
  await expect(header).toHaveAttribute("data-density", "expanded");
});

test("mobile bottom navigation and utility controls are keyboard-operable", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator(".site-header-shell")).toBeHidden();
  await expect(page.locator(".mobile-tab-bar")).toBeVisible();
  await expect(page.locator(".mobile-tab-bar").getByRole("link")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toHaveCount(0);

  const menu = page.getByRole("button", { name: "Open navigation utilities" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Navigation utilities" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();

  await menu.click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  const barBox = await page.locator(".mobile-navigation-shell").boundingBox();
  expect(barBox).not.toBeNull();
  expect(barBox!.y + barBox!.height).toBeLessThanOrEqual(844);
  expect(barBox!.y).toBeGreaterThan(700);
});
