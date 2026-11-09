import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { resumeUrl } from "@/lib/site";
import { uiCopyByLocale } from "@/lib/ui-copy";

const testState = vi.hoisted(() => ({
  pathname: "/",
  resolvedTheme: "light",
  router: { push: vi.fn() },
  setTheme: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => testState.pathname,
  useRouter: () => testState.router,
}));

vi.mock("next-themes", () => ({
  useTheme: () => testState,
}));

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

function renderSiteHeader(locale: Locale = "en") {
  const ui = uiCopyByLocale[locale];
  return render(
    <SiteHeader
      copy={ui.header}
      locale={locale}
      themeCopy={ui.theme}
    />,
  );
}

describe("SiteHeader", () => {
  beforeEach(() => {
    testState.pathname = "/";
    testState.resolvedTheme = "light";
    testState.setTheme.mockClear();
    setScrollY(0);

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  it("shrinks after deliberate downward scrolling and expands after upward movement", () => {
    renderSiteHeader();
    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-density", "expanded");

    act(() => {
      setScrollY(120);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-density", "compact");

    act(() => {
      setScrollY(110);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-density", "compact");

    act(() => {
      setScrollY(102);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-density", "expanded");
  });

  it("expands at the top and whenever keyboard focus enters the header", () => {
    // jsdom never matches :focus-visible; treat the focus below as keyboard
    // focus, which is what expands the header (a click does not).
    const matches = Element.prototype.matches;
    const focusVisible = vi
      .spyOn(Element.prototype, "matches")
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ":focus-visible"
          ? this === document.activeElement
          : matches.call(this, selector);
      });
    renderSiteHeader();
    const header = screen.getByRole("banner");

    act(() => {
      setScrollY(140);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-density", "compact");

    act(() => {
      screen.getByRole("link", { name: "Pavan Patil, home" }).focus();
    });
    expect(header).toHaveAttribute("data-density", "expanded");

    act(() => {
      setScrollY(150);
      window.dispatchEvent(new Event("scroll"));
      setScrollY(50);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-density", "expanded");
    focusVisible.mockRestore();
  });

  it("resets compact presentation after a route change and marks Work current", () => {
    const { rerender } = renderSiteHeader();
    const header = screen.getByRole("banner");

    act(() => {
      setScrollY(140);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-density", "compact");

    testState.pathname = "/work/nudge";
    const ui = uiCopyByLocale.en;
    rerender(<SiteHeader copy={ui.header} locale="en" themeCopy={ui.theme} />);
    expect(header).toHaveAttribute("data-density", "expanded");

    const currentLinks = screen
      .getAllByRole("link", { name: "Work" })
      .filter((link) => link.getAttribute("aria-current") === "location");
    expect(currentLinks).toHaveLength(2);
  });

  it("turns the brand mark into a back control on case-study routes", () => {
    testState.pathname = "/work/nudge";
    renderSiteHeader();

    const backLink = screen.getByRole("link", { name: "Back to selected work" });
    expect(backLink).toHaveAttribute("href", "/#work");
    expect(backLink).toHaveClass("is-back");
    expect(within(backLink).getByText("Pavan Patil")).toBeVisible();
  });

  it("jumps an on-page navigation link to where the section's scene starts", async () => {
    const user = userEvent.setup();
    const section = document.createElement("section");
    section.id = "experience";
    const sceneStart = document.createElement("div");
    sceneStart.dataset.sectionStart = "";
    vi.spyOn(sceneStart, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 900,
      top: 900,
      right: 1000,
      bottom: 1900,
      left: 0,
      width: 1000,
      height: 1000,
      toJSON: () => undefined,
    });
    section.append(sceneStart);
    document.body.append(section);
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 5000 });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    renderSiteHeader();
    await user.click(screen.getAllByRole("link", { name: "Experience" })[0]);

    // One step to the scene's start, and the URL keeps no hash.
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 900, behavior: "instant" }));
    expect(window.location.hash).toBe("");

    section.remove();
    Reflect.deleteProperty(document.documentElement, "scrollHeight");
  });

  it("opens the mobile utility popover and exposes its actions", async () => {
    const user = userEvent.setup();
    renderSiteHeader();

    const trigger = screen.getByRole("button", { name: "Open navigation utilities" });
    await user.click(trigger);

    const menu = screen.getByRole("menu", { name: "Navigation utilities" });

    expect(menu).toBeVisible();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    const resumeLink = within(menu).getByRole("link", { name: "Résumé" });
    expect(resumeLink).toHaveAttribute("href", resumeUrl);
    expect(resumeLink).toHaveAttribute("target", "_blank");
    expect(resumeLink).toHaveAttribute("rel", "noopener noreferrer");

    await user.click(within(menu).getByRole("button", { name: "Switch to dark theme" }));
    expect(testState.setTheme).toHaveBeenCalledWith("dark");
    expect(menu).toHaveAttribute("data-state", "closed");
    expect(menu).toHaveAttribute("aria-hidden", "true");
    fireEvent.transitionEnd(menu, { propertyName: "opacity" });
    expect(menu).not.toBeInTheDocument();
    expect(screen.queryByRole("menu", { name: "Navigation utilities" })).not.toBeInTheDocument();
  });

  it("toggles between English and German on German routes", () => {
    testState.pathname = "/de/work/nudge";
    renderSiteHeader("de");

    expect(screen.getAllByRole("link", { name: "Sprache wechseln: EN" })[0]).toHaveAttribute(
      "href",
      "/work/nudge",
    );
    expect(screen.getAllByRole("link", { name: "Sprache wechseln: DE" })[0]).toHaveAttribute(
      "href",
      "/de/work/nudge",
    );
    expect(screen.queryByRole("link", { name: "Sprache wechseln: 日本語" })).not.toBeInTheDocument();
  });
});
