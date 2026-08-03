import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@/components/theme-toggle";

const themeState = vi.hoisted(() => ({
  resolvedTheme: "light",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => themeState,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    themeState.resolvedTheme = "light";
    themeState.setTheme.mockClear();
  });

  it("switches the light-first experience to dark", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(themeState.setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches an active dark theme back to light", async () => {
    themeState.resolvedTheme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(themeState.setTheme).toHaveBeenCalledWith("light");
  });

  it("supports a labeled utility-menu presentation and callback", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<ThemeToggle presentation="menu" onThemeChange={onThemeChange} />);

    const toggle = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(toggle).toHaveTextContent("Switch to dark theme");

    await user.click(toggle);
    expect(themeState.setTheme).toHaveBeenCalledWith("dark");
    expect(onThemeChange).toHaveBeenCalledOnce();
  });

  it("supports a two-option segmented presentation", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<ThemeToggle presentation="segmented" onThemeChange={onThemeChange} />);

    expect(screen.getByRole("button", { name: "Switch to light theme" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const darkOption = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(darkOption).toHaveAttribute("aria-pressed", "false");

    await user.click(darkOption);
    expect(themeState.setTheme).toHaveBeenCalledWith("dark");
    expect(onThemeChange).toHaveBeenCalledOnce();
  });
});
