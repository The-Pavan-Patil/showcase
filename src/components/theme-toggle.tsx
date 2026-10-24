"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { trackEvent } from "@/lib/analytics";

const subscribe = () => () => undefined;

type ThemeToggleProps = {
  copy?: {
    switchToDark: string;
    switchToLight: string;
  };
  presentation?: "icon" | "menu" | "segmented";
  onThemeChange?: () => void;
};

export function ThemeToggle({
  copy = {
    switchToDark: "Switch to dark theme",
    switchToLight: "Switch to light theme",
  },
  presentation = "icon",
  onThemeChange,
}: ThemeToggleProps = {}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? copy.switchToLight : copy.switchToDark;

  const changeTheme = () => {
    setTheme(nextTheme);
    trackEvent("theme_changed", { theme: nextTheme, surface: presentation });
    onThemeChange?.();
  };

  const selectTheme = (theme: "light" | "dark") => {
    setTheme(theme);
    trackEvent("theme_changed", { theme, surface: presentation });
    onThemeChange?.();
  };

  if (presentation === "segmented") {
    return (
      <div className="theme-toggle-segmented">
        <button
          aria-label={copy.switchToLight}
          aria-pressed={mounted && !isDark}
          type="button"
          onClick={() => selectTheme("light")}
        >
          <Sun aria-hidden="true" size={16} />
        </button>
        <button
          aria-label={copy.switchToDark}
          aria-pressed={mounted && isDark}
          type="button"
          onClick={() => selectTheme("dark")}
        >
          <Moon aria-hidden="true" size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      aria-label={label}
      className={presentation === "menu" ? "theme-toggle theme-toggle-menu" : "theme-toggle"}
      type="button"
      onClick={changeTheme}
    >
      {isDark ? <Sun aria-hidden="true" size={16} /> : <Moon aria-hidden="true" size={16} />}
      {presentation === "menu" && <span>{label}</span>}
    </button>
  );
}
