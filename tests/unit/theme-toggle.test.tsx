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
});
