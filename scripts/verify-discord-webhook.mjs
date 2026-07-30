import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
const shouldSend = process.argv.includes("--send");

if (!webhookUrl) {
  console.error("DISCORD_WEBHOOK_URL is not set. Add it to .env.local or your host env vars.");
  process.exit(1);
}

let parsedUrl;

try {
  parsedUrl = new URL(webhookUrl);
} catch {
  console.error("DISCORD_WEBHOOK_URL is not a valid URL.");
  process.exit(1);
}

const validDiscordHost = ["discord.com", "discordapp.com"].includes(parsedUrl.hostname);
const validDiscordPath = /^\/api\/webhooks\/\d+\/[^/]+/.test(parsedUrl.pathname);

if (parsedUrl.protocol !== "https:" || !validDiscordHost || !validDiscordPath) {
  console.error("DISCORD_WEBHOOK_URL does not look like a Discord webhook URL.");
  process.exit(1);
}

if (!shouldSend) {
  console.log("DISCORD_WEBHOOK_URL is configured. Run with --send to post a test message.");
  process.exit(0);
}

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    content: "Discord webhook verification from the portfolio message endpoint.",
    allowed_mentions: { parse: [] },
  }),
});

if (!response.ok) {
  console.error(`Discord webhook test failed with ${response.status} ${response.statusText}.`);
  process.exit(1);
}

console.log("Discord webhook test message sent.");
