import { expect, test } from "@playwright/test";

const projects = [
  ["mainichi-koto", "Mainichi koto"],
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

  const terminal = page.locator("[data-launch-terminal]");
  await expect(terminal).toBeVisible();
  await expect(terminal).toHaveCSS("background-color", "rgb(2, 2, 3)");
  await expect(terminal).toBeHidden({ timeout: 3000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("dependable software");
});

test("homepage skips the terminal launch intro after it has played this session", async ({ page }) => {
  await skipLaunchIntro(page);
  await page.goto("/");

  await expect(page.locator("[data-launch-terminal]")).toHaveCount(0);
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

  await expect(page.locator("[data-launch-terminal]")).toBeVisible();
});

for (const [slug, title] of projects) {
  test(`${title} has a static case-study route`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const article = page.locator(".case-article");
    await expect(article).toBeVisible();
    await expect(article.getByRole("heading", { level: 2 })).not.toHaveCount(0);
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

test("setup workflow wires reveal as continuous strokes", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.goto("/setup");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const track = page.locator(".ai-workflow-scroll-track");
  const splitWires = page.locator(
    ".ai-workflow-wire-split .ai-workflow-wire-accent",
  );
  await expect(track).toHaveClass(/is-workflow-scroll-ready/);
  await expect(splitWires).toHaveCount(3);

  const halfwayThroughSplit = await track.evaluate((element) => {
    const styles = getComputedStyle(element);
    const stickyTop = Number.parseFloat(
      styles.getPropertyValue("--workflow-sticky-top"),
    );
    const scrollDistance = Number.parseFloat(
      styles.getPropertyValue("--workflow-scroll-distance"),
    );
    const entryScrollY =
      element.getBoundingClientRect().top + window.scrollY - stickyTop;

    return entryScrollY + scrollDistance * 0.22;
  });

  await page.evaluate((target) => window.scrollTo(0, target), halfwayThroughSplit);
  await expect(track).toHaveAttribute("data-workflow-lifecycle", "pinned");
  await expect
    .poll(() =>
      page.locator(".ai-workflow-map").evaluate((element) =>
        Number.parseFloat(
          getComputedStyle(element).getPropertyValue(
            "--workflow-split-progress",
          ),
        ),
      ),
    )
    .toBeCloseTo(0.5, 1);

  const wireStyles = await splitWires.evaluateAll((elements) =>
    elements.map((element) => {
      const styles = getComputedStyle(element);
      return {
        bottomInset: Number.parseFloat(
          styles.clipPath.split(" ").at(-1) ?? "",
        ),
        dashArray: styles.strokeDasharray,
      };
    }),
  );

  for (const style of wireStyles) {
    expect(style.dashArray).toBe("none");
    expect(style.bottomInset).toBeCloseTo(50, 1);
  }
});

test("completed setup workflow removes its scroll runway without a reverse-scroll gap", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.goto("/setup");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const track = page.locator(".ai-workflow-scroll-track");
  const diagram = page.locator(".ai-workflow-map");
  const timeline = page.locator(".setup-timeline");
  await expect(track).toHaveClass(/is-workflow-scroll-ready/);

  const scrollTarget = await track.evaluate((element) => {
    const styles = getComputedStyle(element);
    const stickyTop = Number.parseFloat(
      styles.getPropertyValue("--workflow-sticky-top"),
    );
    const scrollDistance = Number.parseFloat(
      styles.getPropertyValue("--workflow-scroll-distance"),
    );
    const entryScrollY =
      element.getBoundingClientRect().top + window.scrollY - stickyTop;

    return entryScrollY + scrollDistance;
  });

  await page.evaluate((target) => window.scrollTo(0, target - 1), scrollTarget);
  await expect(track).toHaveAttribute("data-workflow-lifecycle", "pinned");
  const timelineTopBeforeCompletion = await timeline.evaluate(
    (element) => element.getBoundingClientRect().top,
  );

  await page.evaluate((target) => window.scrollTo(0, target + 1), scrollTarget);
  await expect(track).toHaveAttribute("data-workflow-lifecycle", "collapsed");

  const completedLayout = await page.evaluate(() => {
    const trackElement = document.querySelector<HTMLElement>(
      ".ai-workflow-scroll-track",
    );
    const diagramElement = document.querySelector<HTMLElement>(
      ".ai-workflow-map",
    );
    const timelineElement = document.querySelector<HTMLElement>(
      ".setup-timeline",
    );
    if (!trackElement || !diagramElement || !timelineElement) return null;

    const trackBounds = trackElement.getBoundingClientRect();
    const diagramBounds = diagramElement.getBoundingClientRect();
    const timelineBounds = timelineElement.getBoundingClientRect();

    return {
      trackHeight: trackBounds.height,
      scaledHeight: Number.parseFloat(
        getComputedStyle(trackElement).getPropertyValue(
          "--workflow-scaled-height",
        ),
      ),
      timelineTop: timelineBounds.top,
      diagramTimelineGap: timelineBounds.top - diagramBounds.bottom,
    };
  });

  expect(completedLayout).not.toBeNull();
  expect(completedLayout!.trackHeight).toBeCloseTo(
    completedLayout!.scaledHeight,
    0,
  );
  expect(completedLayout!.timelineTop).toBeCloseTo(
    timelineTopBeforeCompletion - 2,
    0,
  );
  expect(completedLayout!.diagramTimelineGap).toBeLessThan(100);

  await page.evaluate(() => window.scrollBy(0, -window.innerHeight * 0.75));
  await expect(track).toHaveAttribute("data-workflow-lifecycle", "collapsed");
  await expect
    .poll(async () => {
      const trackBox = await track.boundingBox();
      const diagramBox = await diagram.boundingBox();
      return trackBox && diagramBox
        ? Math.abs(trackBox.height - diagramBox.height)
        : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(1);
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

test("loop engineering cards reveal once with responsive entrance directions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.goto("/setup");

  const grid = page.locator(".setup-orchestration-stack");
  const cards = page.locator(".setup-orchestration-card");
  await expect(grid).toHaveAttribute("data-loop-revealed", "false");

  const entranceStyles = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const styles = getComputedStyle(element);
      const rawDelay = styles.getPropertyValue("--loop-reveal-delay").trim();
      return {
        x: styles.getPropertyValue("--loop-enter-x").trim(),
        y: styles.getPropertyValue("--loop-enter-y").trim(),
        delayMs: rawDelay.endsWith("ms")
          ? Number.parseFloat(rawDelay)
          : Number.parseFloat(rawDelay) * 1000,
      };
    }),
  );

  expect(entranceStyles).toEqual([
    { x: "0px", y: "40px", delayMs: 0 },
    { x: "-40px", y: "0px", delayMs: 160 },
    { x: "40px", y: "0px", delayMs: 480 },
    { x: "0px", y: "-40px", delayMs: 320 },
  ]);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if ((await grid.getAttribute("data-loop-revealed")) === "true") break;

    await grid.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(250);
  }
  await expect(grid).toHaveAttribute("data-loop-revealed", "true");
  await expect(cards.last()).toHaveCSS("opacity", "1");

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(grid).toHaveAttribute("data-loop-revealed", "true");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("mobile loop engineering cards stack and release into the next section", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await page.goto("/setup");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const stack = page.locator(".setup-orchestration-stack");
  const cards = page.locator(".setup-orchestration-card");
  const chaosSection = page.locator(".setup-chaos-section");
  await expect(stack).toHaveClass(/is-loop-stack-ready/);
  await expect(stack).toHaveAttribute("data-loop-revealed", "true");
  await expect(cards).toHaveCount(4);

  await stack.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(300);

  const stackTarget = await stack.evaluate((element) => {
    const styles = getComputedStyle(element);
    const stickyTop = Number.parseFloat(
      styles.getPropertyValue("--loop-sticky-top"),
    );
    const scrollDistance = Number.parseFloat(
      styles.getPropertyValue("--loop-scroll-distance"),
    );
    const entryScrollY =
      element.getBoundingClientRect().top + window.scrollY - stickyTop;

    return entryScrollY + scrollDistance * 0.92;
  });

  await page.evaluate((target) => window.scrollTo(0, target), stackTarget);
  await expect(stack).toHaveAttribute("data-loop-stack-lifecycle", "stacking");
  await expect
    .poll(() =>
      cards.last().evaluate((element) =>
        Number.parseFloat(
          getComputedStyle(element).getPropertyValue("--loop-card-translate"),
        ),
      ),
    )
    .toBeLessThan(-200);

  const stackedLayout = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      const heading = element.querySelector("h3")?.getBoundingClientRect();

      return {
        top: bounds.top,
        height: bounds.height,
        headingBottom: heading?.bottom ?? bounds.top,
      };
    }),
  );

  expect(stackedLayout).toHaveLength(4);
  for (let index = 1; index < stackedLayout.length; index += 1) {
    expect(stackedLayout[index].top).toBeGreaterThan(
      stackedLayout[index - 1].top,
    );
    expect(stackedLayout[index].top).toBeGreaterThanOrEqual(
      stackedLayout[index - 1].headingBottom - 1,
    );
    expect(stackedLayout[index].top - stackedLayout[index - 1].top).toBeLessThan(
      stackedLayout[index - 1].height * 0.7,
    );
  }

  const completionTarget = await stack.evaluate((element) => {
    const styles = getComputedStyle(element);
    const stickyTop = Number.parseFloat(
      styles.getPropertyValue("--loop-sticky-top"),
    );
    const scrollDistance = Number.parseFloat(
      styles.getPropertyValue("--loop-scroll-distance"),
    );
    const entryScrollY =
      element.getBoundingClientRect().top + window.scrollY - stickyTop;

    return entryScrollY + scrollDistance + 2;
  });

  const chaosTopBeforeCompletion = await chaosSection.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  await page.evaluate((target) => window.scrollTo(0, target), completionTarget);
  await expect(stack).toHaveAttribute("data-loop-stack-lifecycle", "collapsed");

  const completedLayout = await page.evaluate(() => {
    const stackElement = document.querySelector<HTMLElement>(
      ".setup-orchestration-stack",
    );
    const lastCard = document.querySelector<HTMLElement>(
      ".setup-orchestration-card:last-child",
    );
    const chaosElement = document.querySelector<HTMLElement>(
      ".setup-chaos-section",
    );
    if (!stackElement || !lastCard || !chaosElement) return null;

    const stackBounds = stackElement.getBoundingClientRect();
    const lastCardBounds = lastCard.getBoundingClientRect();
    const chaosBounds = chaosElement.getBoundingClientRect();

    return {
      stackHeight: stackBounds.height,
      collapsedHeight: Number.parseFloat(
        getComputedStyle(stackElement).getPropertyValue(
          "--loop-collapsed-height",
        ),
      ),
      chaosTop: chaosBounds.top,
      lastCardBottom: lastCardBounds.bottom,
    };
  });

  expect(completedLayout).not.toBeNull();
  expect(completedLayout!.stackHeight).toBeCloseTo(
    completedLayout!.collapsedHeight,
    0,
  );
  expect(completedLayout!.chaosTop).toBeLessThanOrEqual(
    chaosTopBeforeCompletion + 2,
  );
  expect(completedLayout!.chaosTop - completedLayout!.lastCardBottom).toBeLessThan(
    180,
  );
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("loop engineering cards remain visible with reduced motion", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/setup");

  const cards = page.locator(".setup-orchestration-card");
  const stack = page.locator(".setup-orchestration-stack");
  await expect(cards.first()).toHaveCSS("opacity", "1");
  await expect(stack).toHaveAttribute("data-loop-stack-lifecycle", "static");
  await expect(stack).not.toHaveClass(/is-loop-stack-ready/);
  const reducedTransform = await cards.first().evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    const matrix = transform === "none" ? new DOMMatrix() : new DOMMatrix(transform);
    return { x: matrix.m41, y: matrix.m42 };
  });
  expect(reducedTransform).toEqual({ x: 0, y: 0 });
});

async function scrollAboutSceneTo(page: import("@playwright/test").Page, progress: number) {
  await page.evaluate((target) => {
    const track = document.querySelector<HTMLElement>(".about-scene-track");
    if (!track) throw new Error("About scene track is missing");
    const bounds = track.getBoundingClientRect();
    const top = bounds.top + window.scrollY + (bounds.height - window.innerHeight) * target;
    window.scrollTo({ top, behavior: "instant" });
  }, progress);
}

function translateX(element: Element) {
  const transform = getComputedStyle(element).transform;
  return transform === "none" ? 0 : new DOMMatrix(transform).m41;
}

test("about scene parts the title and reveals the profile copy on scroll", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await skipLaunchIntro(page);
  await page.goto("/");

  const scene = page.locator("#about");
  await expect(scene).toHaveAttribute("data-live", "");
  await expect(page.getByRole("heading", { level: 2, name: "About Me" })).toBeAttached();

  const left = page.locator(".about-scene-word-left");
  const right = page.locator(".about-scene-word-right");

  await scrollAboutSceneTo(page, 0);
  await expect.poll(() => left.evaluate(translateX)).toBeCloseTo(0, 0);

  await scrollAboutSceneTo(page, 0.3);
  await expect.poll(() => left.evaluate(translateX)).toBeLessThan(-50);
  await expect.poll(() => right.evaluate(translateX)).toBeGreaterThan(50);

  await scrollAboutSceneTo(page, 0.75);
  await expect(page.locator(".about-scene-heading")).toHaveCSS("opacity", "1");

  const resume = page.getByRole("link", { name: /Open résumé/ });
  await expect(resume).toBeVisible();
  await expect(resume).toHaveAttribute("target", "_blank");

  // Wide screens end on Beyond code inside the card; phones show it after.
  if ((await scene.getAttribute("data-beat")) !== null) {
    await scrollAboutSceneTo(page, 1);
    await expect.poll(() => page.locator(".about-scene-beyond").evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);
    await expect(page.locator(".about-scene-beyond .about-beyond-keyword").first()).toBeVisible();
    await expect(page.locator(".about-beyond-strip")).toBeHidden();
  } else {
    await expect(page.locator(".about-beyond-strip .about-beyond-keyword").first()).toBeVisible();
  }
});

test("about scene scrolls forward when the résumé link receives keyboard focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  // Tall enough that the paragraph and résumé link stay inside the card.
  await page.setViewportSize({ width: 1440, height: 900 });
  await skipLaunchIntro(page);
  await page.goto("/");
  await expect(page.locator("#about")).toHaveAttribute("data-live", "");

  const resume = page.locator(".about-scene-card .about-scene-resume");
  const content = page.locator(".about-scene-card .about-scene-content");
  const opacityOf = (locator: typeof content) => locator.evaluate((element) => Number(getComputedStyle(element).opacity));

  await scrollAboutSceneTo(page, 0.1);
  await resume.focus();
  await expect.poll(() => page.locator(".about-scene-body").first().evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.95);

  // Once the copy has handed over to Beyond code, focus scrolls back to it.
  await resume.blur();
  await scrollAboutSceneTo(page, 1);
  await expect.poll(() => opacityOf(content)).toBeLessThan(0.05);
  await resume.focus();
  await expect.poll(() => opacityOf(content)).toBeGreaterThan(0.95);
});

test("about scene shows the finished composition with reduced motion", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await skipLaunchIntro(page);
  await page.goto("/");

  const scene = page.locator("#about");
  await expect(scene).not.toHaveAttribute("data-live", "");
  await expect(page.locator(".about-scene-stage")).toHaveCSS("position", "static");
  await expect(page.locator(".about-scene-card .about-scene-heading")).toHaveCSS("opacity", "1");
  await expect(page.locator(".about-scene-card .about-scene-resume")).toBeVisible();
  await expect(page.locator(".about-beyond-strip .about-beyond-keyword").first()).toBeVisible();
  await expect(page.locator(".about-scene-beyond")).toBeHidden();
});

async function scrollWorkDustTo(page: import("@playwright/test").Page, progress: number) {
  await page.evaluate((target) => {
    const track = document.querySelector<HTMLElement>(".dust-track");
    if (!track) throw new Error("Work dust track is missing");
    const bounds = track.getBoundingClientRect();
    const top = bounds.top + window.scrollY + (bounds.height - window.innerHeight) * target;
    window.scrollTo({ top, behavior: "instant" });
  }, progress);
}

// Mirrors resolveProgressForIndex in project-dust-timeline.ts for 3 cards.
const dustRestProgress = (index: number) => (index + 0.3) / (2 + 0.3 * 2);

test("selected work carries portrait cards through the dust lane on scroll", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await skipLaunchIntro(page);
  await page.goto("/");

  const track = page.locator(".dust-track");
  await expect(track).toHaveAttribute("data-live", "");
  const cards = page.locator(".dust-card");
  await expect(cards).toHaveCount(3);
  await expect(page.locator(".dust-canvas")).toHaveCount(1);

  // Distance of a card's centre from the lane's centre.
  const offCentre = (index: number) =>
    page.evaluate((cardIndex) => {
      const lane = document.querySelector<HTMLElement>(".dust-lane")!.getBoundingClientRect();
      const card = document.querySelectorAll<HTMLElement>(".dust-card")[cardIndex]!.getBoundingClientRect();
      return card.left + card.width / 2 - (lane.left + lane.width / 2);
    }, index);

  for (const index of [0, 1, 2]) {
    await scrollWorkDustTo(page, dustRestProgress(index));
    await expect.poll(() => offCentre(index)).toBeCloseTo(0, 0);
    await expect(page.locator(".dust-counter")).toContainText(`0${index + 1}`);
    // The stage stays pinned to the viewport while the cards travel.
    expect(await page.locator(".dust-stage").evaluate((element) => element.getBoundingClientRect().top)).toBeCloseTo(0, 0);
  }

  // Earlier cards have moved off to the left, the way they left.
  expect(await offCentre(0)).toBeLessThan(0);
  await expect(cards.nth(2).getByRole("link", { name: /Read the Philips Greenheart case study/ })).toBeVisible();
});

test("selected work shows a plain row of portrait cards with reduced motion", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await skipLaunchIntro(page);
  await page.goto("/");

  await expect(page.locator(".dust-track")).not.toHaveAttribute("data-live", "");
  await expect(page.locator(".dust-stage")).toHaveCSS("position", "static");
  await expect(page.locator(".dust-canvas")).toHaveCount(0);
  for (const index of [0, 1, 2]) {
    const card = page.locator(".dust-card").nth(index);
    await expect(card).toHaveCSS("transform", "none");
    await expect(card.getByRole("link")).toBeVisible();
  }
});
