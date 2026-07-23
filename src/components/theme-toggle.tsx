"use client";

import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

type ThemeToggleProps = {
  presentation?: "icon" | "menu";
  onThemeChange?: () => void;
};

export function ThemeToggle({
  presentation = "icon",
  onThemeChange,
}: ThemeToggleProps = {}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = `Switch to ${nextTheme} theme`;

  const changeTheme = () => {
    setTheme(nextTheme);
    onThemeChange?.();
  };

  return (
    <Button
      aria-label={label}
      className={presentation === "menu" ? "theme-toggle theme-toggle-menu" : "theme-toggle"}
      isIconOnly={presentation === "icon"}
      size="sm"
      variant="ghost"
      onPress={changeTheme}
    >
      {isDark ? <Sun aria-hidden="true" size={16} /> : <Moon aria-hidden="true" size={16} />}
      {presentation === "menu" && <span>{label}</span>}
    </Button>
  );
}
