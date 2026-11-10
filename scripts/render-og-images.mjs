// Renders the 1200x630 social-preview cards in public/og/ from the home hero.
//
//   node scripts/render-og-images.mjs
//
// The cards mirror the live hero (Montserrat 800, stretched caps, the second
// line fading into the page), so the copy below must follow the hero copy in
// src/app/_pages/home/_data/content.ts and locales.ts. Rerun after changing it,
// and give the files a new name if the old ones were already shared: link
// previews are cached by image URL.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "og");

const cards = {
  en: {
    lang: "en",
    title: "You found the person",
    accent: "who can handle it.",
    lead: "Software engineer for web, mobile and backend.",
    trail: "Built for Hero Vida, Philips and DRDO.",
  },
  ja: {
    lang: "ja",
    title: "任せられる人、",
    accent: "ここにいます。",
    lead: "Web・モバイル・バックエンドのソフトウェアエンジニア",
    trail: "Hero Vida、Philips、DRDOの案件を担当",
  },
  de: {
    lang: "de",
    title: "Ich baue zuverlässige Software",
    accent: "für komplexe reale Workflows.",
    lead: "Softwareentwickler für Web, Mobile und Backend.",
    trail: "Gebaut für Hero Vida, Philips und DRDO.",
  },
};

const escape = (value) =>
  value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function page(card) {
  return `<!doctype html>
<html lang="${card.lang}">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@500;800&family=Noto+Sans+JP:wght@500;800&display=block" rel="stylesheet">
<style>
  :root { --bg: #efefef; --fg: #1b1b1b; --hero: Montserrat, "Noto Sans JP", sans-serif; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; }
  body {
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 52px 60px 50px;
    overflow: hidden;
    background: var(--bg);
    color: var(--fg);
    font-family: Lato, "Noto Sans JP", sans-serif;
  }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 24px; letter-spacing: 0.01em; text-transform: uppercase; }
  .mark {
    display: grid; place-items: center; width: 42px; height: 42px; border-radius: 11px;
    background: var(--fg); color: var(--bg); font-size: 20px; font-weight: 700;
  }
  .domain { font-family: var(--hero); font-size: 18px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.62; }
  h1 {
    display: grid; align-content: center; justify-items: center;
    font-family: var(--hero); font-weight: 800; letter-spacing: -0.035em; line-height: 1.12;
    text-align: center; text-transform: uppercase; white-space: nowrap;
  }
  /* Umlauts and kana rise above the caps, so the stretched second line
     needs more room than the English one to stay clear of the first. */
  :lang(de) h1 { line-height: 1.28; }
  :lang(ja) h1 { letter-spacing: 0; line-height: 1.22; }
  h1 span { display: block; transform: scaleY(1.2); transform-origin: center bottom; }
  h1 .lower {
    background-image: linear-gradient(180deg, var(--fg) 10%, color-mix(in srgb, var(--fg) 14%, transparent) 92%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; }
  .foot p {
    max-width: 380px; font-family: var(--hero); font-size: 19px; font-weight: 500;
    letter-spacing: 0.08em; line-height: 1.55; text-transform: uppercase; text-wrap: balance;
  }
  :lang(ja) .foot p { letter-spacing: 0.04em; word-break: auto-phrase; }
  .foot .end { text-align: end; }
  .cue { position: absolute; left: 50%; bottom: 58px; display: grid; justify-items: center; transform: translateX(-50%); }
  .cue i { width: 1px; height: 46px; background: color-mix(in srgb, var(--fg) 45%, transparent); }
  .cue b { width: 11px; height: 11px; margin-top: -1px; border-radius: 50%; background: var(--fg); }
</style>
</head>
<body>
  <div class="top">
    <div class="brand"><span class="mark">P</span>Pavan Patil</div>
    <div class="domain">pavanpatil.dev</div>
  </div>
  <h1><span>${escape(card.title)}</span><span class="lower">${escape(card.accent)}</span></h1>
  <div class="foot">
    <p>${escape(card.lead)}</p>
    <p class="end">${escape(card.trail)}</p>
  </div>
  <div class="cue" aria-hidden="true"><i></i><b></b></div>
</body>
</html>`;
}

// Size the title so its longer line fills the card's measure, as the hero
// fills the viewport, without the two lines outgrowing the card's middle band
// (short Japanese lines would otherwise grow until they collide).
async function fitTitle(tab) {
  await tab.evaluate(async () => {
    await document.fonts.ready;
    const h1 = document.querySelector("h1");
    const measure = 1200 - 2 * 60;
    const band = Math.min(h1.getBoundingClientRect().height - 40, 250);
    let size = 160;
    h1.style.fontSize = `${size}px`;
    const lines = () => [...h1.children].map((line) => line.getBoundingClientRect());
    const widest = () => Math.max(...[...h1.children].map((line) => line.scrollWidth));
    const tallest = () => {
      const boxes = lines();
      return Math.max(...boxes.map((box) => box.bottom)) - Math.min(...boxes.map((box) => box.top));
    };
    while ((widest() > measure || tallest() > band) && size > 20) {
      size -= 1;
      h1.style.fontSize = `${size}px`;
    }
  });
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const [locale, card] of Object.entries(cards)) {
    await tab.setContent(page(card), { waitUntil: "networkidle" });
    await fitTitle(tab);
    const file = path.join(outDir, `${locale}.png`);
    await tab.screenshot({ path: file, type: "png" });
    console.log(`wrote ${path.relative(root, file)}`);
  }
} finally {
  await browser.close();
}
