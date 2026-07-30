import { expect, test } from "@playwright/test";

const projects = [
  ["nudge", "Nudge"],
  ["philips-greenheart", "Philips Greenheart"],
  ["workforce-management-system", "Workforce Management"],
] as const;

async function skipLaunchIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("launch-terminal-seen", "true");
  });
}

async function expectLanguageOption(
  page: import("@playwright/test").Page,
  testInfo: import("@playwright/test").TestInfo,
  name: string,
  href: string,
) {
  const isMobile = testInfo.project.name.startsWith("mobile");
  const scope = isMobile
    ? page.getByRole("menu")
    : page.getByRole("banner");

  if (isMobile) {
    await page.locator(".mobile-utility-trigger").click();
  }

  await expect(scope.getByRole("link", { name })).toHaveAttribute("href", href);
  await expect(scope.getByText("Deutsch")).toHaveCount(0);

  if (isMobile) {
    await page.keyboard.press("Escape");
  }
}

test("homepage exposes the primary portfolio journey", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await skipLaunchIntro(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("dependable software");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /case study/i })).toHaveCount(3);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  expect(errors).toEqual([]);
});

test("homepage first load plays the terminal launch intro", async ({ page }) => {
  await page.goto("/");

  const dialog = page.getByRole("dialog", { name: "pavanpatil.dev launch" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("background-color", "rgb(2, 2, 3)");

  const command = page.locator(".launch-terminal-command");
  await expect(command).toHaveAttribute("aria-label", "npm rundev", { timeout: 4000 });
  await expect(command).toHaveAttribute("aria-label", "npm run dev", { timeout: 4000 });
  await expect(page.getByText("Website: https://pavanpatil.dev")).toBeVisible({ timeout: 7000 });
  await expect(dialog).toBeHidden({ timeout: 3000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("dependable software");
});

test("homepage skips the terminal launch intro after it has played this session", async ({ page }) => {
  await skipLaunchIntro(page);
  await page.goto("/");

  await expect(page.getByRole("dialog", { name: "pavanpatil.dev launch" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("dependable software");
});

test("anonymous keyboard messaging sends from the homepage", async ({ page }) => {
  let postedBody = "";

  await page.route("**/api/message", async (route) => {
    postedBody = route.request().postData() ?? "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await skipLaunchIntro(page);
  await page.goto("/");

  const quickMessage = page.locator("[data-quick-message-section]");
  await expect(quickMessage).toBeVisible();
  expect(
    await page.evaluate(() => {
      const about = document.querySelector<HTMLElement>("#about");
      const message = document.querySelector<HTMLElement>("[data-quick-message-section]");
      const contact = document.querySelector<HTMLElement>("#contact");

      return Boolean(
        about &&
          message &&
          contact &&
          about.offsetTop < message.offsetTop &&
          message.offsetTop < contact.offsetTop,
      );
    }),
  ).toBe(true);
  await quickMessage.scrollIntoViewIfNeeded();
  await expect(page.getByText("Anonymous message")).toBeVisible();
  await expect(page.getByRole("heading", { name: /type something here/i })).toBeVisible();

  const textarea = page.getByRole("textbox", { name: "Message" });
  await textarea.focus();
  await page.keyboard.type("hello");
  await expect(textarea).toHaveValue("hello");

  const keyboardShell = page.locator(".quick-message-keyboard > div");
  const keyboardBeforePress = await keyboardShell.boundingBox();
  expect(keyboardBeforePress).not.toBeNull();

  await page.keyboard.down("h");
  await expect(page.locator('[data-key-code="KeyH"]')).toHaveAttribute("data-pressed", "true");
  await expect(page.locator("[data-key-preview]").last()).toHaveText("H");
  const keyboardDuringPress = await keyboardShell.boundingBox();
  const previewLayer = page.locator("[data-key-preview-layer]");
  const previewLayerBox = await previewLayer.boundingBox();
  expect(keyboardDuringPress).not.toBeNull();
  expect(previewLayerBox).not.toBeNull();
  expect(keyboardDuringPress?.x).toBeCloseTo(keyboardBeforePress?.x ?? 0, 2);
  expect(keyboardDuringPress?.y).toBeCloseTo(keyboardBeforePress?.y ?? 0, 2);
  expect(keyboardDuringPress?.width).toBeCloseTo(keyboardBeforePress?.width ?? 0, 2);
  expect(keyboardDuringPress?.height).toBeCloseTo(keyboardBeforePress?.height ?? 0, 2);
  const previewSpacing = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>(".quick-message-keyboard > div");
    const previewLayer = document.querySelector<HTMLElement>("[data-key-preview-layer]");
    if (!shell || !previewLayer) return null;

    const shellBox = shell.getBoundingClientRect();
    const previewLayerBox = previewLayer.getBoundingClientRect();
    return {
      gap: shellBox.top - previewLayerBox.bottom,
      zoom: Number.parseFloat(getComputedStyle(shell).zoom || "1"),
      previewPaddingTop: getComputedStyle(previewLayer).paddingTop,
    };
  });
  expect(previewSpacing).not.toBeNull();
  expect(previewSpacing?.gap).toBeCloseTo(8 * (previewSpacing?.zoom ?? 1), 1);
  expect(previewSpacing?.previewPaddingTop).toBe("8px");
  await page.keyboard.up("h");
  await expect(page.locator("[data-key-preview]").last()).toHaveCount(0, { timeout: 1800 });

  await page.keyboard.press("Enter");
  await expect(page.getByText("Thanks. Your message was sent.")).toBeVisible();
  await expect(textarea).toHaveValue("");
  expect(JSON.parse(postedBody)).toMatchObject({ message: "helloh", website: "" });
});

test("anonymous keyboard messaging shows delivery errors", async ({ page }) => {
  await page.route("**/api/message", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "failed" }),
    });
  });

  await skipLaunchIntro(page);
  await page.goto("/");

  const textarea = page.getByRole("textbox", { name: "Message" });
  await textarea.fill("hello");
  await page.keyboard.press("Enter");

  await expect(page.getByText("I could not send that message. Please try again.")).toBeVisible();
  await expect(textarea).toHaveValue("hello");
});

test("localized homepages render natural Japanese and German copy", async ({ page }, testInfo) => {
  await skipLaunchIntro(page);
  await page.goto("/ja");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("信頼できるソフトウェア");
  await expectLanguageOption(page, testInfo, "言語を切り替える: EN", "/");

  await skipLaunchIntro(page);
  await page.goto("/de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("zuverlässige Software");
  await expectLanguageOption(page, testInfo, "Sprache wechseln: EN", "/");
});

test("English locale prefix redirects to canonical unprefixed URLs", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveURL("/");

  await page.goto("/en/work/nudge");
  await expect(page).toHaveURL("/work/nudge");
});

test("homepage can force replay the terminal launch intro for testing", async ({ page }) => {
  await skipLaunchIntro(page);
  await page.goto("/?intro=1");

  await expect(page.getByRole("dialog", { name: "pavanpatil.dev launch" })).toBeVisible();
  await expect(page.locator(".launch-terminal-command")).toHaveAttribute("aria-label", "npm rundev", { timeout: 4000 });
});

for (const [slug, title] of projects) {
  test(`${title} has a static case-study route`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const article = page.locator(".case-article");
    await expect(article.getByRole("heading", { name: "The challenge" })).toBeVisible();
    await expect(article.getByRole("heading", { name: "The approach" })).toBeVisible();
    await expect(article.getByText("The outcome", { exact: true })).toBeVisible();
  });
}

test("localized case-study routes render translated article shells", async ({ page }) => {
  await page.goto("/ja/work/nudge");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1, name: "Nudge" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "課題" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "取り組み" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "結果" })).toBeVisible();

  await page.goto("/de/work/nudge");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1, name: "Nudge" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Die Herausforderung" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Der Ansatz" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Das Ergebnis" })).toBeVisible();
});

test("unknown work returns a not-found response", async ({ request }) => {
  const response = await request.get("/work/not-a-real-project");
  expect(response.status()).toBe(404);
});

test("unknown work offers a recovery path", async ({ page }) => {
  await page.goto("/work/not-a-real-project");
  await expect(page.getByRole("heading", { level: 1, name: "This route doesn’t exist." })).toBeVisible();
  await expect(page.getByRole("link", { name: "View selected work" })).toHaveAttribute("href", "/#work");
});

test("unknown localized work offers localized recovery paths", async ({ page }) => {
  await page.goto("/ja/work/not-a-real-project");
  await expect(page.getByRole("heading", { level: 1, name: "このページは存在しません。" })).toBeVisible();
  await expect(page.getByRole("link", { name: "主な実績を見る" })).toHaveAttribute("href", "/ja#work");

  await page.goto("/de/work/not-a-real-project");
  await expect(page.getByRole("heading", { level: 1, name: "Diese Route existiert nicht." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ausgewählte Arbeit ansehen" })).toHaveAttribute("href", "/de#work");
});

test("localized pages avoid horizontal overflow on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await skipLaunchIntro(page);

  for (const route of ["/ja", "/de", "/ja/work/nudge", "/de/work/nudge"]) {
    await page.goto(route);
    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      )
      .toBe(true);
  }
});

test("desktop navigation shrinks down and expands up without losing destinations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"));

  await page.setViewportSize({ width: 1440, height: 900 });
  await skipLaunchIntro(page);
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
  await skipLaunchIntro(page);
  await page.goto("/");

  await expect(page.locator(".site-header-shell")).toBeHidden();
  await expect(page.locator(".mobile-tab-bar")).toBeVisible();
  await expect(page.locator(".mobile-tab-bar").getByRole("link")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toHaveCount(0);

  const menu = page.getByRole("button", { name: "Open navigation utilities" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu", { name: "Navigation utilities" })).toBeVisible();
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

test("the navigation selection bubble travels to the chosen tab", async ({ page }, testInfo) => {
  await skipLaunchIntro(page);
  await page.goto("/work/nudge");

  const isMobile = testInfo.project.name.startsWith("mobile");
  const navigation = page.locator(isMobile ? ".mobile-tab-bar" : ".desktop-nav");
  const bubble = navigation.locator(".nav-selection-bubble");
  const destination = navigation.getByRole("link", { name: "Experience" });

  await expect(bubble).toHaveAttribute("data-ready", "true");
  const initialBox = await bubble.boundingBox();
  expect(initialBox).not.toBeNull();

  await destination.click();

  await expect(destination).toHaveAttribute("aria-current", "location");
  expect(
    await bubble.evaluate((element) =>
      element.getAnimations().some((animation) => animation.playState === "running"),
    ),
  ).toBe(true);

  await expect
    .poll(async () => (await bubble.boundingBox())?.x ?? 0)
    .toBeGreaterThan(initialBox!.x);
});

test("the single accent dot follows headings and Experience timeline nodes", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await skipLaunchIntro(page);
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const traveler = page.locator(".scroll-accent-traveler");
  await expect(page.locator(".availability-dot")).toHaveCount(0);
  await expect(traveler).toHaveCount(1);
  await expect(traveler).toHaveAttribute("data-ready", "true");
  await expect(traveler).toHaveAttribute("data-active-anchor", "hero", {
    timeout: 2000,
  });

  async function activate(anchor: string) {
    await page.locator(`[data-scroll-accent-anchor="${anchor}"]`).evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const activationY = Math.min(360, Math.max(180, window.innerHeight * 0.38));
      window.scrollTo(0, bounds.top + window.scrollY + bounds.height / 2 - activationY);
    });
    await expect(traveler).toHaveAttribute("data-active-anchor", anchor);
  }

  await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(
      '[data-scroll-accent-anchor="hero"]',
    );
    const work = document.querySelector<HTMLElement>(
      '[data-scroll-accent-anchor="work"]',
    );
    if (!hero || !work) return;

    const heroBounds = hero.getBoundingClientRect();
    const workBounds = work.getBoundingClientRect();
    const activationY = Math.min(360, Math.max(180, window.innerHeight * 0.38));
    const heroY = heroBounds.top + window.scrollY + heroBounds.height / 2;
    const workY = workBounds.top + window.scrollY + workBounds.height / 2;
    window.scrollTo(0, (heroY + workY) / 2 - activationY);
  });
  await expect(traveler).toHaveAttribute("data-phase", "global-rail");

  const globalRailX = await page
    .locator(".scroll-accent-global-rail")
    .evaluate((element) => element.getBoundingClientRect().left);
  const contentLeft = await page
    .locator(".site-container")
    .first()
    .evaluate((element) => element.getBoundingClientRect().left);
  await expect
    .poll(async () => {
      const box = await traveler.boundingBox();
      return box ? box.x + box.width / 2 : -1;
    })
    .toBeCloseTo(globalRailX, 0);
  expect(globalRailX).toBeGreaterThanOrEqual(8);
  expect(globalRailX).toBeLessThan(contentLeft);

  await activate("work");
  await expect(traveler).toHaveAttribute("data-phase", "heading");

  await activate("experience");
  await expect(traveler).toHaveAttribute("data-phase", "heading");

  await activate("experience-company-0");
  await expect(traveler).toHaveAttribute("data-phase", "experience-major");
  const companyNodeWidth = await page
    .locator('[data-scroll-accent-anchor="experience-company-0"]')
    .evaluate((element) => element.getBoundingClientRect().width);
  await expect
    .poll(async () => (await traveler.boundingBox())?.width ?? 0)
    .toBeCloseTo(companyNodeWidth, 0);

  await activate("experience-project-0-0");
  await expect(traveler).toHaveAttribute("data-phase", "experience-minor");
  await expect
    .poll(async () => (await traveler.boundingBox())?.width ?? 0)
    .toBeCloseTo(8, 0);

  const firstProjects = page.locator("details[data-scroll-accent-details]").first();
  await firstProjects.locator("summary").click();
  await expect(firstProjects).not.toHaveAttribute("open", "");
  await expect
    .poll(async () => traveler.getAttribute("data-active-anchor"))
    .not.toBe("experience-project-0-0");

  await activate("about");
  await expect(traveler).toHaveAttribute("data-phase", "heading");

  await page.locator('[data-scroll-accent-anchor="about"]').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const contact = document.querySelector<HTMLElement>(
      "[data-scroll-accent-contact]",
    );
    if (!contact) return;

    const activationY = Math.min(360, Math.max(180, window.innerHeight * 0.38));
    const aboutY = bounds.top + window.scrollY + bounds.height / 2;
    const contactY = contact.getBoundingClientRect().top + window.scrollY;
    const returnTravel = Math.min(
      140,
      Math.max(56, (contactY - aboutY) * 0.16),
    );
    window.scrollTo(0, Math.floor(aboutY + returnTravel - activationY - 1));
  });
  await expect(traveler).toHaveAttribute("data-phase", "global-rail");
  await expect
    .poll(async () => Number.parseFloat(await traveler.evaluate((element) => getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.9);

  await expect
    .poll(async () => {
      const box = await traveler.boundingBox();
      return box ? box.x + box.width / 2 : 0;
    })
    .toBeCloseTo(globalRailX, 0);

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect
    .poll(async () => Number.parseFloat(await traveler.evaluate((element) => getComputedStyle(element).opacity)))
    .toBeLessThan(0.1);
});

test("the accent dot snaps between anchors with reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await skipLaunchIntro(page);
  await page.goto("/");

  const traveler = page.locator(".scroll-accent-traveler");
  await expect(traveler).toHaveAttribute("data-ready", "true");
  await page.locator('[data-scroll-accent-anchor="work"]').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const activationY = Math.min(360, Math.max(180, window.innerHeight * 0.38));
    window.scrollTo(0, bounds.top + window.scrollY + bounds.height / 2 - activationY);
  });

  await expect(traveler).toHaveAttribute("data-active-anchor", "work");
  expect(
    await traveler.evaluate((element) =>
      element.getAnimations().some((animation) => animation.playState === "running"),
    ),
  ).toBe(false);
});
