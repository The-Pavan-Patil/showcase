import { expect, test } from "@playwright/test";

const projects = [
  ["mainichi-koto", "Mainichi koto"],
  ["nudge", "Nudge"],
  ["philips-greenheart", "Philips Greenheart"],
  ["workforce-management-system", "Workforce Management"],
] as const;

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

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("You found the person");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /case study/i })).toHaveCount(3);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  expect(errors).toEqual([]);
});

test("anonymous keyboard messaging sends from the homepage", async ({ page }, testInfo) => {
  let postedBody = "";

  await page.route("**/api/message", async (route) => {
    postedBody = route.request().postData() ?? "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/");
  // Hydrated first: a page scrolled before then is put back at the top.
  await expect(page.locator("#about")).toHaveAttribute("data-live", "");

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
  if (testInfo.project.name.startsWith("mobile")) {
    // Phones fold the band into its compact layout first.
    await expect(page.locator(".quick-message-band")).toHaveAttribute("data-compose", "native");
    await expectBandSettled(page);
  }

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

function heightOf(element: Element) {
  return element.getBoundingClientRect().height;
}

/** Waits out the band's fold or unfold (CSS transitions). */
async function expectBandSettled(page: import("@playwright/test").Page) {
  await expect.poll(() =>
    page.locator(".quick-message-band").evaluate((band) =>
      band.getAnimations({ subtree: true }).filter((animation) => animation instanceof CSSTransition).length,
    ),
  ).toBe(0);
}

/** Stands in for the visual viewport so a test can open a "device keyboard". */
function fakeVisualViewport() {
  const viewport = new EventTarget();
  let height: number | null = null;
  let offsetTop = 0;
  Object.defineProperties(viewport, {
    height: { get: () => height ?? window.innerHeight },
    width: { get: () => window.innerWidth },
    offsetTop: { get: () => offsetTop },
    offsetLeft: { get: () => 0 },
    scale: { get: () => 1 },
  });
  Object.defineProperty(window, "visualViewport", { get: () => viewport, configurable: true });
  Object.assign(window, {
    setDeviceKeyboard(visibleHeight: number | null) {
      height = visibleHeight;
      offsetTop = 0;
      viewport.dispatchEvent(new Event("resize"));
    },
  });
}

/** Scrolls until the message band is pinned (the scenes above may still be laying out). */
async function pinQuickMessageBand(page: import("@playwright/test").Page) {
  // Scrolled before hydration, the page would be put back at the top.
  await expect(page.locator("#about")).toHaveAttribute("data-live", "");
  await expect.poll(() =>
    page.locator(".quick-message-band").evaluate((band) => {
      const track = band.parentElement!;
      window.scrollTo({ top: track.getBoundingClientRect().top + window.scrollY + 40, behavior: "instant" });
      return Math.abs(band.getBoundingClientRect().top - Number.parseFloat(getComputedStyle(band).top));
    }),
  ).toBeLessThan(1);
}

test("phones compose the anonymous message above the device keyboard", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));

  await page.addInitScript(fakeVisualViewport);
  await page.goto("/");
  await pinQuickMessageBand(page);

  const band = page.locator(".quick-message-band");
  const heading = page.locator("#quick-message-heading");
  const textarea = page.getByRole("textbox", { name: "Message" });
  const keyboard = page.locator(".quick-message-keyboard > div");
  // 16px text, or iOS zooms the page into the field.
  await expect(textarea).toHaveCSS("font-size", "16px");

  // Focusing the field (the device keyboard opens) folds the title away.
  await textarea.tap();
  await expect(band).toHaveAttribute("data-compose", "native");
  await expectBandSettled(page);
  expect(await heading.evaluate(heightOf)).toBe(0);
  // A device keyboard leaves a little over half the screen.
  const visible = await page.evaluate(() => {
    const height = Math.round(window.innerHeight * 0.55);
    (window as unknown as { setDeviceKeyboard(height: number): void }).setDeviceKeyboard(height);
    return height;
  });

  // The eyebrow, the message and the on-screen keyboard all fit above it.
  await expect.poll(() => keyboard.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(visible);
  const eyebrow = await band.locator(".eyebrow").boundingBox();
  const field = await textarea.boundingBox();
  expect(eyebrow?.y).toBeGreaterThanOrEqual(0);
  expect((field?.y ?? 0) + (field?.height ?? 0)).toBeLessThan(visible);
  const keyboardAbove = await keyboard.boundingBox();

  // An on-screen key takes over: the device keyboard closes, the key types,
  // and nothing moves under the finger.
  await page.locator('[data-key-code="KeyH"]').tap();
  await page.evaluate(() => (window as unknown as { setDeviceKeyboard(height: null): void }).setDeviceKeyboard(null));
  await expect(band).toHaveAttribute("data-compose", "virtual");
  await expect(textarea).not.toBeFocused();
  await expect(textarea).toHaveValue("h");
  await page.locator('[data-key-code="KeyI"]').tap();
  await expect(textarea).toHaveValue("hi");
  const keyboardAfter = await keyboard.boundingBox();
  expect(keyboardAfter?.y).toBeCloseTo(keyboardAbove?.y ?? 0, 1);
  expect(keyboardAfter?.height).toBeCloseTo(keyboardAbove?.height ?? 0, 1);

  // The field brings the device keyboard back; a tap elsewhere unfolds.
  await textarea.tap();
  await expect(band).toHaveAttribute("data-compose", "native");
  await page.mouse.click(4, 4);
  await expect(band).not.toHaveAttribute("data-compose");
  await expect(heading).toBeVisible();
  await expect(textarea).toHaveValue("hi");
});

test("the phone keyboard rises on the scroll and lies flat as the message band pins", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"));

  await page.goto("/");
  await expect(page.locator("#about")).toHaveAttribute("data-live", "");
  const camera = page.locator(".quick-message-keyboard-camera");
  await expect(camera).toHaveCSS("animation-name", "quick-message-keyboard-rise");

  // Still below the tab bar: tilted.
  await page.locator(".quick-message-scroll-track").evaluate((track) => {
    window.scrollTo({ top: track.getBoundingClientRect().top + window.scrollY - window.innerHeight, behavior: "instant" });
  });
  const isFlat = (element: Element) => new DOMMatrix(getComputedStyle(element).transform).isIdentity;
  await expect.poll(() => camera.evaluate(isFlat)).toBe(false);

  await pinQuickMessageBand(page);
  await expect.poll(() => camera.evaluate(isFlat)).toBe(true);
});

test("anonymous keyboard messaging shows delivery errors", async ({ page }) => {
  await page.route("**/api/message", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "failed" }),
    });
  });

  await page.goto("/");
  // Hydrated first, or React resets the typed value to its empty state.
  await expect(page.locator("#about")).toHaveAttribute("data-live", "");

  const textarea = page.getByRole("textbox", { name: "Message" });
  await textarea.fill("hello");
  await page.keyboard.press("Enter");

  await expect(page.getByText("I could not send that message. Please try again.")).toBeVisible();
  await expect(textarea).toHaveValue("hello");
});

test("localized homepages render natural Japanese and German copy", async ({ page }, testInfo) => {
  await page.goto("/ja");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("任せられる人");
  await expectLanguageOption(page, testInfo, "言語を切り替える: EN", "/");

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
  const readSplitProgress = () =>
    page.locator(".ai-workflow-map").evaluate((element) =>
      Number.parseFloat(
        getComputedStyle(element).getPropertyValue("--workflow-split-progress"),
      ),
    );
  await expect.poll(readSplitProgress).toBeCloseTo(0.5, 1);
  // Scroll positions are whole pixels, so the progress lands within a few
  // tenths of a percent of halfway; the wires must follow it exactly.
  const splitProgress = await readSplitProgress();

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
    expect(style.bottomInset).toBeCloseTo((1 - splitProgress) * 100, 1);
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
  const nextSection = page.locator("#plan");
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
  const nextSectionTopBeforeCompletion = await nextSection.evaluate(
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
    const nextSectionElement = document.querySelector<HTMLElement>(
      "#plan",
    );
    if (!trackElement || !diagramElement || !nextSectionElement) return null;

    const trackBounds = trackElement.getBoundingClientRect();
    const diagramBounds = diagramElement.getBoundingClientRect();
    const nextSectionBounds = nextSectionElement.getBoundingClientRect();

    return {
      trackHeight: trackBounds.height,
      scaledHeight: Number.parseFloat(
        getComputedStyle(trackElement).getPropertyValue(
          "--workflow-scaled-height",
        ),
      ),
      nextSectionTop: nextSectionBounds.top,
      diagramNextSectionGap: nextSectionBounds.top - diagramBounds.bottom,
    };
  });

  expect(completedLayout).not.toBeNull();
  expect(completedLayout!.trackHeight).toBeCloseTo(
    completedLayout!.scaledHeight,
    0,
  );
  expect(completedLayout!.nextSectionTop).toBeCloseTo(
    nextSectionTopBeforeCompletion - 2,
    0,
  );
  expect(completedLayout!.diagramNextSectionGap).toBeLessThan(160);

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
      // Nodes in the pinned Experience scene publish where they come to rest.
      const track = element.closest<HTMLElement>("[data-scroll-accent-track]");
      const offset = (element as HTMLElement).dataset.scrollAccentOffset;
      if (track && offset !== undefined) {
        window.scrollTo(0, track.getBoundingClientRect().top + window.scrollY + Number(offset));
        return;
      }

      const bounds = element.getBoundingClientRect();
      const activationY = Math.min(360, Math.max(180, window.innerHeight * 0.38));
      window.scrollTo(0, bounds.top + window.scrollY + bounds.height / 2 - activationY);
    });
    await expect(traveler).toHaveAttribute("data-active-anchor", anchor);
  }

  async function opacity() {
    return Number.parseFloat(await traveler.evaluate((element) => getComputedStyle(element).opacity));
  }

  async function center() {
    const box = await traveler.boundingBox();
    return box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : { x: -1, y: -1 };
  }

  // Leaving the hero, the dot slides straight to the work eyebrow: no detour
  // to the edge of the page.
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect(traveler).toHaveAttribute("data-phase", "heading");

  await activate("work");
  await expect(traveler).toHaveAttribute("data-phase", "heading");

  // While Selected Work is pinned, the dot stays on its eyebrow.
  await page.locator(".dust-track").evaluate((track) => {
    const bounds = track.getBoundingClientRect();
    window.scrollTo(0, bounds.top + window.scrollY + (bounds.height - window.innerHeight) / 2);
  });
  await expect(traveler).toHaveAttribute("data-active-anchor", "work");
  const eyebrowSlot = page.locator(".dust-stage .scroll-accent-heading-target");
  await expect
    .poll(async () => {
      const slot = (await eyebrowSlot.boundingBox())!;
      const dot = await center();
      return Math.hypot(dot.x - (slot.x + slot.width / 2), dot.y - (slot.y + slot.height / 2));
    })
    .toBeLessThan(2);

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

  await activate("workflow");
  await expect(traveler).toHaveAttribute("data-phase", "heading");
  await expect.poll(opacity).toBeGreaterThan(0.9);

  // Hidden through About.
  await page.locator("#about").evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    window.scrollTo(0, bounds.top + window.scrollY + bounds.height / 2);
  });
  await expect(traveler).toHaveAttribute("data-phase", "hidden");
  await expect.poll(opacity).toBeLessThan(0.1);

  // Back on the quick message's eyebrow.
  await activate("message");
  await expect(traveler).toHaveAttribute("data-phase", "heading");
  await expect.poll(opacity).toBeGreaterThan(0.9);
  const messageSlot = page.locator('[data-scroll-accent-anchor="message"]');
  await expect
    .poll(async () => {
      const slot = (await messageSlot.boundingBox())!;
      const dot = await center();
      return Math.hypot(dot.x - (slot.x + slot.width / 2), dot.y - (slot.y + slot.height / 2));
    })
    .toBeLessThan(2);

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect.poll(opacity).toBeLessThan(0.1);
});

test("the accent dot snaps between anchors with reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.emulateMedia({ reducedMotion: "reduce" });
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

test("setup hero actions start on the hero copy edge", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.goto("/setup");
  const actions = page.locator(".setup-hero-actions a");
  await expect(actions).toHaveCount(2);

  const ledeBox = await page.locator(".setup-lede").boundingBox();
  const firstBox = await actions.first().boundingBox();
  const lastBox = await actions.last().boundingBox();
  expect(ledeBox && firstBox && lastBox).toBeTruthy();
  expect(Math.abs(firstBox!.x - ledeBox!.x)).toBeLessThan(1);

  // Small phones stack the buttons at the full width of the copy.
  if (testInfo.project.name === "mobile-chromium") {
    expect(Math.abs(firstBox!.width - ledeBox!.width)).toBeLessThan(1);
    expect(Math.abs(lastBox!.width - ledeBox!.width)).toBeLessThan(1);
  }
});

test("setup index links each land on a section", async ({ page }) => {
  await page.goto("/setup");

  const hrefs = await page
    .locator(".setup-index a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of hrefs) {
    expect(href).toMatch(/^#[a-z]+$/);
    await expect(page.locator(`main > section${href}`)).toHaveCount(1);
  }
});

test("setup index smooth-scrolls past the pinned workflow to its section", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.goto("/setup");
  await expect(page.locator(".ai-workflow-scroll-track")).toHaveClass(/is-workflow-scroll-ready/);

  // A smooth scroll through the pinned runway used to stop on the diagram
  // when its runway collapsed mid-scroll.
  await page.locator('.setup-index a[href="#team"]').click();
  await expect(page.locator(".ai-workflow-scroll-track")).toHaveAttribute(
    "data-workflow-lifecycle",
    "collapsed",
  );
  await expect
    .poll(() => page.locator("#team").evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThan(1);
  // Arriving plays the section's entrance.
  await expect(page.locator(".setup-team")).toHaveAttribute("data-reveal", "play");
});

test("setup entrances leave every row visible with reduced motion", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/setup");

  await expect(page.locator("[data-reveal]")).toHaveCount(0);
  await expect(page.locator(".setup-type-caret")).toHaveCount(0);
  await expect(page.locator(".setup-type-rest")).toHaveCount(0);
  for (const selector of [
    ".setup-team-table tbody tr",
    ".setup-log li",
    ".setup-feed li",
    ".setup-tasks li",
    ".setup-rules-group li",
  ]) {
    const rows = page.locator(selector);
    for (let index = 0; index < (await rows.count()); index += 1) {
      await expect(rows.nth(index)).toHaveCSS("opacity", "1");
    }
  }
  await expect(page.locator(".setup-log-summary")).toHaveCSS("opacity", "1");
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
  // Phones and wide screens alike keep the copy in the card.
  await expect(page.locator(".about-scene-card .about-scene-resume")).toBeVisible();
  await expect(page.locator(".about-scene-after")).toBeHidden();

  // The scene ends on Beyond code inside the card; short desktop screens
  // show it after.
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
  await page.goto("/");

  const scene = page.locator("#about");
  await expect(scene).not.toHaveAttribute("data-live", "");
  await expect(page.locator(".about-scene-stage")).toHaveCSS("position", "static");
  await expect(page.locator(".about-scene-card .about-scene-heading")).toHaveCSS("opacity", "1");
  await expect(page.locator(".about-scene-card .about-scene-resume")).toBeVisible();
  await expect(page.locator(".about-beyond-strip .about-beyond-keyword").first()).toBeVisible();
  await expect(page.locator(".about-scene-beyond")).toBeHidden();
});

test("the hero and the pinned AI workflow stage each fill one screen", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.goto("/");

  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const selectors = [".hero-section"];
  // Phones stack the workflow cards instead of pinning them on one screen.
  if (testInfo.project.name === "chromium") {
    await expect(page.locator(".workflow-scene")).toHaveAttribute("data-pinned", "");
    selectors.push(".workflow-scene-stage");
  }
  for (const selector of selectors) {
    const box = await page.locator(selector).boundingBox();
    expect(Math.abs((box?.height ?? 0) - viewportHeight), selector).toBeLessThanOrEqual(1);
  }

  // Nothing below the hero shows on landing.
  await expect(page.locator("#work")).not.toBeInViewport();
});

/** Scrolls to `progress` through the workflow scene's pinned runway. */
async function scrollWorkflowSceneTo(page: import("@playwright/test").Page, progress: number) {
  await page.evaluate((target) => {
    const track = document.querySelector<HTMLElement>(".workflow-scene-track");
    if (!track) throw new Error("Workflow scene track is missing");
    const bounds = track.getBoundingClientRect();
    const top = bounds.top + window.scrollY + (bounds.height - window.innerHeight) * target;
    window.scrollTo({ top, behavior: "instant" });
  }, progress);
}

function opacityOf(element: Element) {
  return Number(getComputedStyle(element).opacity);
}

test("AI workflow scene types the title, deals the cards, then connects them", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const scene = page.locator(".workflow-scene");
  await expect(scene).toHaveAttribute("data-pinned", "");
  await expect(
    page.getByRole("heading", { level: 2, name: "See how I use AI to speed up development." }),
  ).toBeAttached();

  const chars = page.locator(".workflow-scene-title-char");
  const cards = scene.getByRole("listitem");
  const arrows = scene.locator(".workflow-scene-arrow");
  const heads = scene.locator(".workflow-scene-arrow-head");
  const cta = scene.getByRole("link", { name: /View my full setup/ });
  const ctaRow = scene.locator(".workflow-scene-cta-row");
  await expect(cards).toHaveCount(4);

  // Rising into view, the title types in from its first character.
  await page.evaluate(() => {
    const track = document.querySelector<HTMLElement>(".workflow-scene-track")!;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - window.innerHeight * 0.375, behavior: "instant" });
  });
  await expect.poll(() => chars.first().evaluate(opacityOf)).toBeGreaterThan(0.9);
  await expect.poll(() => chars.last().evaluate(opacityOf)).toBeLessThan(0.1);

  // Whole by the time the stage pins; no cards yet.
  await scrollWorkflowSceneTo(page, 0);
  await expect
    .poll(() => chars.evaluateAll((elements) => Math.min(...elements.map((element) => Number(getComputedStyle(element).opacity)))))
    .toBeGreaterThan(0.95);
  await expect(page.locator(".workflow-scene-stage")).toHaveCSS("position", "sticky");
  await expect.poll(() => cards.first().evaluate(opacityOf)).toBeLessThan(0.1);

  // Dealt one at a time.
  await scrollWorkflowSceneTo(page, 0.12);
  await expect.poll(() => cards.first().evaluate(opacityOf)).toBeGreaterThan(0.5);
  await expect.poll(() => cards.last().evaluate(opacityOf)).toBeLessThan(0.05);

  // Once all four are down, arrows join them in order, then the CTA arrives.
  await scrollWorkflowSceneTo(page, 0.59);
  await expect.poll(() => cards.last().evaluate(opacityOf)).toBeGreaterThan(0.95);
  await expect(arrows).toHaveCount(3);
  await expect.poll(() => heads.first().evaluate(opacityOf)).toBeLessThan(0.05);
  await expect.poll(() => ctaRow.evaluate(opacityOf)).toBeLessThan(0.05);

  await scrollWorkflowSceneTo(page, 1);
  for (const head of await heads.all()) {
    await expect.poll(() => head.evaluate(opacityOf)).toBeGreaterThan(0.95);
  }
  for (const arrow of await arrows.all()) {
    await expect(arrow).toHaveAttribute("d", /^M [\d.]+ [\d.]+ C /);
  }
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/setup");
  await expect.poll(() => ctaRow.evaluate(opacityOf)).toBeGreaterThan(0.95);

  // The eyebrow sits top left, the title centred, the CTA centred under the cards.
  const viewport = page.viewportSize()!;
  const eyebrow = (await scene.locator(".workflow-scene-eyebrow").boundingBox())!;
  const title = (await page.locator(".workflow-scene-title").boundingBox())!;
  const button = (await cta.boundingBox())!;
  expect(eyebrow.x).toBeLessThan(viewport.width * 0.1);
  expect(Math.abs(title.x + title.width / 2 - viewport.width / 2)).toBeLessThan(4);
  expect(Math.abs(button.x + button.width / 2 - viewport.width / 2)).toBeLessThan(4);
  expect(button.y).toBeGreaterThan(viewport.height * 0.8);
});

test("AI workflow scene reveals its CTA when it receives keyboard focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".workflow-scene")).toHaveAttribute("data-pinned", "");

  const cta = page.locator(".workflow-scene").getByRole("link", { name: /View my full setup/ });
  const ctaRow = page.locator(".workflow-scene-cta-row");
  await scrollWorkflowSceneTo(page, 0.2);
  await cta.focus();
  await expect.poll(() => ctaRow.evaluate(opacityOf)).toBeGreaterThan(0.95);
  await expect(page.locator(".workflow-scene-card").last()).toHaveCSS("opacity", "1");
});

test("AI workflow CTA stays visible after narrowing from the pinned layout to a phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const scene = page.locator(".workflow-scene");
  const ctaRow = page.locator(".workflow-scene-cta-row");
  await expect(scene).toHaveAttribute("data-pinned", "");
  // Before its beat the pinned CTA is transparent and ignores the pointer.
  await expect.poll(() => ctaRow.evaluate(opacityOf)).toBeLessThan(0.05);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(scene).not.toHaveAttribute("data-pinned", "");
  const cta = scene.getByRole("link", { name: /View my full setup/ });
  await cta.scrollIntoViewIfNeeded();
  await expect.poll(() => ctaRow.evaluate(opacityOf)).toBeGreaterThan(0.95);
  await expect(ctaRow).toHaveCSS("pointer-events", "auto");
});

test("AI workflow scene stacks the cards on phones and reveals each as it scrolls in", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await page.goto("/");

  const scene = page.locator(".workflow-scene");
  await expect(scene).toHaveAttribute("data-live", "");
  await expect(scene).not.toHaveAttribute("data-pinned", "");
  await expect(page.locator(".workflow-scene-stage")).toHaveCSS("position", "static");

  const last = page.locator(".workflow-scene-card").last();
  await expect.poll(() => last.evaluate(opacityOf)).toBeLessThan(0.05);
  await last.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - window.innerHeight * 0.4, behavior: "instant" });
  });
  await expect.poll(() => last.evaluate(opacityOf)).toBeGreaterThan(0.95);
  await expect(scene.locator(".workflow-scene-arrow")).toHaveCount(3);
  await expect(scene.getByRole("link", { name: /View my full setup/ })).toBeVisible();
});

test("AI workflow scene shows the finished composition with reduced motion", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const scene = page.locator(".workflow-scene");
  await expect(scene).not.toHaveAttribute("data-live", "");
  await expect(page.locator(".workflow-scene-stage")).toHaveCSS("position", "static");
  await expect(page.locator(".workflow-scene-title-char").first()).toHaveCSS("opacity", "1");
  await expect(page.locator(".workflow-scene-title-char").last()).toHaveCSS("opacity", "1");
  for (const card of await page.locator(".workflow-scene-card").all()) {
    await expect(card).toHaveCSS("opacity", "1");
  }
  await expect(scene.locator(".workflow-scene-arrow")).toHaveCount(3);
  await expect(scene.getByRole("link", { name: /View my full setup/ })).toBeVisible();
});

test("the hero is Montserrat copy with corner lines and a scroll cue", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.goto("/");

  const hero = page.locator(".hero-section");
  // The only images are the experience logos in the scroll cue.
  await expect(hero.locator("canvas")).toHaveCount(0);
  await expect(hero.locator("img")).toHaveCount(await hero.locator(".hero-scroll-cue img").count());
  await expect(hero).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  for (const selector of ["#hero-title", ".hero-corner-start", ".hero-corner-end"]) {
    await expect(hero.locator(selector)).toHaveCSS("font-family", /Montserrat/);
    await expect(hero.locator(selector)).toBeVisible();
  }
  // Line one is solid ink; line two fades out through a clipped gradient.
  const color = await hero.locator("#hero-title").evaluate((element) => getComputedStyle(element).color);
  await expect(hero.locator(".hero-title-upper")).toHaveCSS("color", color);
  await expect(hero.locator(".hero-title-lower")).toHaveCSS("background-clip", "text");
  await expect(hero.locator(".hero-title-lower")).toHaveCSS("background-image", /linear-gradient/);

  const cue = hero.locator(".hero-scroll-cue");
  await expect(cue).toHaveAttribute("href", "#work");
  await expect(cue).toContainText(/scroll down/i);
  await expect(cue.locator('.hero-scroll-cue-logo[data-state="active"]')).toHaveCount(1);
});

async function scrollExperienceToNode(page: import("@playwright/test").Page, anchor: string) {
  await page.locator(`[data-scroll-accent-anchor="${anchor}"]`).evaluate((element) => {
    // A node may call the dot before it arrives; `rest` is where it settles.
    const track = element.closest<HTMLElement>("[data-scroll-accent-track]");
    const offset = (element as HTMLElement).dataset.scrollAccentRest;
    if (!track || offset === undefined) throw new Error("Experience node has no resting offset");
    const top = track.getBoundingClientRect().top + window.scrollY + Number(offset);
    window.scrollTo({ top, behavior: "instant" });
  });
}

// Each live node publishes where it is when the accent dot reaches it.
function distanceFromFocus(page: import("@playwright/test").Page, anchor: string) {
  return page.locator(`[data-scroll-accent-anchor="${anchor}"]`).evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return Math.abs(bounds.top + bounds.height / 2 - Number((element as HTMLElement).dataset.scrollAccentFocus));
  });
}

test("experience scene pins one screen and moves the timeline with the scroll", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.goto("/");
  await expect(page.locator("#experience")).toHaveAttribute("data-live", "");
  await expect(page.locator(".experience-track")).toHaveAttribute("data-scroll-accent-focus", /\d/);

  const viewportHeight = await page.evaluate(() => window.innerHeight);
  for (const anchor of ["experience-company-0", "experience-project-0-0", "experience-company-1"]) {
    await scrollExperienceToNode(page, anchor);
    await expect.poll(() => distanceFromFocus(page, anchor)).toBeLessThan(2);

    const stage = await page.locator(".experience-stage").boundingBox();
    expect(Math.abs(stage?.y ?? Infinity)).toBeLessThanOrEqual(1);
    expect(Math.abs((stage?.height ?? 0) - viewportHeight)).toBeLessThanOrEqual(1);
    await expect(page.locator("#experience-heading")).toBeInViewport();
  }
});

test("experience scene scrolls to a project toggle that receives keyboard focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#experience")).toHaveAttribute("data-live", "");
  await expect(page.locator(".experience-track")).toHaveAttribute("data-scroll-accent-focus", /\d/);

  // Resting on the last node, the first company's toggle is out of the window.
  const lastAnchor = await page
    .locator("#experience [data-scroll-accent-offset]")
    .last()
    .getAttribute("data-scroll-accent-anchor");
  await scrollExperienceToNode(page, lastAnchor ?? "");
  const toggle = page.locator("#experience details summary").first();
  await expect(toggle).not.toBeInViewport();

  await toggle.focus();
  await expect.poll(() => distanceFromFocus(page, "experience-company-0")).toBeLessThan(2);
  await expect(toggle).toBeInViewport();
});

test("experience index jumps to a company and marks it current", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const index = page.locator(".experience-index-button");
  await expect(index).toHaveCount(3);
  await index.nth(1).click();
  await expect.poll(() => distanceFromFocus(page, "experience-company-1")).toBeLessThan(2);
  await expect(index.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(index.nth(0)).not.toHaveAttribute("aria-current", "step");
});

test("experience shows the plain timeline with reduced motion", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("#experience")).not.toHaveAttribute("data-live", "");
  await expect(page.locator(".experience-stage")).toHaveCSS("position", "static");
  await expect(page.locator("#experience [data-scroll-accent-offset]")).toHaveCount(0);
  await expect(page.locator(".client-project-item").first()).toBeVisible();
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

test("first visits from Japan and Germany land on their language", async ({ request }) => {
  const visit = (path: string, country: string, extra: Record<string, string> = {}) =>
    request.get(path, {
      headers: {
        accept: "text/html",
        "sec-fetch-dest": "document",
        "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36",
        "x-vercel-ip-country": country,
        ...extra,
      },
      maxRedirects: 0,
    });

  const japan = await visit("/", "JP");
  expect(japan.status()).toBe(307);
  expect(japan.headers().location).toBe("/ja");

  const germany = await visit("/work/nudge", "DE");
  expect(germany.status()).toBe(307);
  expect(germany.headers().location).toBe("/de/work/nudge");

  for (const country of ["US", "IN", "AT", "CH"]) {
    expect((await visit("/", country)).status(), country).toBe(200);
  }

  expect((await visit("/", "DE", { cookie: "site-locale=en" })).status()).toBe(200);
  expect((await visit("/writing", "DE")).status()).toBe(200);
  expect((await visit("/", "DE", { "user-agent": "Googlebot/2.1" })).status()).toBe(200);
});

test("german pages toggle between German and English and remember the choice", async ({ page, context }, testInfo) => {
  await page.goto("/de/work/nudge");

  if (testInfo.project.name.startsWith("mobile")) {
    await page.locator(".mobile-utility-trigger").click();
  }

  const toggle = page.locator(".language-toggle:visible a");
  await expect(toggle).toHaveText(["EN", "DE"]);
  await expect(toggle.nth(1)).toHaveAttribute("aria-current", "true");

  await toggle.nth(0).click();
  // The page swaps once the thumb arrives; /de/work/nudge must not count.
  await expect(page).toHaveURL((url) => url.pathname === "/work/nudge");
  expect((await context.cookies()).find((cookie) => cookie.name === "site-locale")?.value).toBe("en");
});
