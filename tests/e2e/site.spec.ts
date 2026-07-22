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

test("mobile navigation and theme controls are keyboard-operable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menu = page.getByRole("button", { name: "Open navigation menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
