import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { uiCopyByLocale } from "@/lib/ui-copy";

const testState = vi.hoisted(() => ({
  pathname: "/",
  resolvedTheme: "light",
  setTheme: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => testState.pathname,
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

  it("opens the mobile utility popover and exposes its actions", async () => {
    const user = userEvent.setup();
    renderSiteHeader();

    const trigger = screen.getByRole("button", { name: "Open navigation utilities" });
    await user.click(trigger);

    expect(screen.getByRole("dialog", { name: "Navigation utilities" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Download résumé" })).toHaveAttribute(
      "href",
      "/pavan-patil-resume.txt",
    );

    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(testState.setTheme).toHaveBeenCalledWith("dark");
    expect(screen.queryByRole("dialog", { name: "Navigation utilities" })).not.toBeInTheDocument();
  });

  it("shows only English and Japanese language options, even on German routes", () => {
    testState.pathname = "/de/work/nudge";
    renderSiteHeader("de");

    expect(screen.getByRole("link", { name: "Sprache wechseln: EN" })).toHaveAttribute(
      "href",
      "/work/nudge",
    );
    expect(screen.getByRole("link", { name: "Sprache wechseln: 日本語" })).toHaveAttribute(
      "href",
      "/ja/work/nudge",
    );
    expect(screen.queryByText("Deutsch")).not.toBeInTheDocument();
  });
});
