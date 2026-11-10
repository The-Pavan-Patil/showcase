// Asks the IndexNow search engines (Bing, Yandex, Naver, Seznam and others
// that share submissions) to recrawl pages after a production deploy. Bing's
// index also feeds Copilot, DuckDuckGo and much of ChatGPT search, so this is
// the fastest way to get changes in front of those assistants.
//
//   npm run indexnow                      # every URL in the live sitemap
//   npm run indexnow -- /work/nudge /setup # only the pages that changed
//
// Run it only after the deploy is live: the engines fetch the key file below
// from the production site to check the request is ours. Send only pages that
// actually changed; resubmitting unchanged pages too often can get the key
// ignored.
const siteUrl = (process.env.INDEXNOW_SITE_URL ?? "https://www.pavanpatil.dev").replace(/\/$/, "");
// Public by design: the same value is served at /<key>.txt (public/).
const key = "310850641cac0762b0703c7b4343c496";
const keyLocation = `${siteUrl}/${key}.txt`;

async function getUrls() {
  const paths = process.argv.slice(2);
  if (paths.length) {
    return paths.map((value) => (value.startsWith("http") ? value : `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`));
  }

  const response = await fetch(`${siteUrl}/sitemap.xml`);
  if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

const keyResponse = await fetch(keyLocation);
const servedKey = keyResponse.ok ? (await keyResponse.text()).trim() : "";
if (servedKey !== key) {
  console.error(`The key file is not live at ${keyLocation} (status ${keyResponse.status}). Deploy first.`);
  process.exit(1);
}

const urlList = await getUrls();
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(siteUrl).host, key, keyLocation, urlList }),
});

// 200 = accepted, 202 = accepted and the key is still being checked.
if (response.status === 200 || response.status === 202) {
  console.log(`IndexNow accepted ${urlList.length} URL(s) (status ${response.status}).`);
} else {
  console.error(`IndexNow returned ${response.status}: ${await response.text()}`);
  process.exit(1);
}
