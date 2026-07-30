import { checkMessageRateLimit } from "@/lib/message-rate-limit";
import { QUICK_MESSAGE_MAX_LENGTH } from "@/lib/quick-message";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isMessagePayload(payload)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if ((payload.website ?? "").trim()) {
    return Response.json({ ok: true });
  }

  const message = normalizeMessage(payload.message);

  if (!message) {
    return Response.json({ error: "Write a message before sending." }, { status: 400 });
  }

  if (message.length > QUICK_MESSAGE_MAX_LENGTH) {
    return Response.json(
      { error: `Messages must be ${QUICK_MESSAGE_MAX_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return Response.json({ error: "Message delivery is not configured." }, { status: 503 });
  }

  const rateLimit = checkMessageRateLimit(getRequestIp(request), Date.now());

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Please wait before sending another message.", retryAfter: rateLimit.retryAfter },
      { status: 429 },
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createDiscordPayload(message)),
  });

  if (!response.ok) {
    return Response.json({ error: "Message delivery failed." }, { status: 502 });
  }

  return Response.json({ ok: true });
}

function isMessagePayload(value: unknown): value is { message: string; website?: string } {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.message === "string" &&
    (payload.website === undefined || typeof payload.website === "string")
  );
}

function normalizeMessage(message: string) {
  return message
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
}

function createDiscordPayload(message: string) {
  return {
    content: ["New anonymous portfolio message:", "```", escapeCodeFence(message), "```"].join("\n"),
    allowed_mentions: { parse: [] },
  };
}

function escapeCodeFence(message: string) {
  return message.replaceAll("```", "` ` `");
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
