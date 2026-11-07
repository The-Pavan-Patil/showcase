"use client";

import { useEffect } from "react";

import { whenPageSettled } from "@/lib/page-settled";

/**
 * Switches Japanese text from the device font to Noto Sans JP once the page
 * has settled (see `html.jp-webfont` in globals.css).
 */
export function JapaneseWebFont() {
  useEffect(() => {
    let cancelled = false;
    void whenPageSettled().then(() => {
      if (!cancelled) document.documentElement.classList.add("jp-webfont");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
