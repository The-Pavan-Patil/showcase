import { Montserrat } from "next/font/google";

/**
 * The same Montserrat files as the root layout's, called here with preload
 * on: next/font preloads a font only on routes that render it, so the hero
 * font is fetched early on the English home page alone, where its title is
 * the largest paint. Only app/(en)/page.tsx should import this.
 */
export const heroFont = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
