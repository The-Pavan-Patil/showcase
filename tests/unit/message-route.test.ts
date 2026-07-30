import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/message/route";
import { resetMessageRateLimitForTests } from "@/lib/message-rate-limit";

const webhookUrl = "https://discord.com/api/webhooks/example/token";

function createRequest(body: unknown, ip = "203.0.113.10") {
  return new Request("http://localhost/api/message", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("message route", () => {
  beforeEach(() => {
    resetMessageRateLimitForTests();
    vi.stubEnv("DISCORD_WEBHOOK_URL", webhookUrl);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetMessageRateLimitForTests();
  });

  it("sends a valid anonymous message to Discord with mentions disabled", async () => {
    const response = await POST(createRequest({ message: "Hello @everyone", website: "" }));

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      webhookUrl,
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
      }),
    );

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(init?.body));

    expect(payload.content).toContain("Hello @everyone");
    expect(payload.allowed_mentions).toEqual({ parse: [] });
  });

  it("rejects an empty message", async () => {
    const response = await POST(createRequest({ message: "   ", website: "" }));

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects messages longer than 500 characters", async () => {
    const response = await POST(createRequest({ message: "a".repeat(501), website: "" }));

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts honeypot submissions without calling Discord", async () => {
    const response = await POST(createRequest({ message: "hello", website: "bot.example" }));

    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns unavailable when Discord delivery is not configured", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "");

    const response = await POST(createRequest({ message: "hello", website: "" }));

    expect(response.status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rate limits more than three real messages per window", async () => {
    await POST(createRequest({ message: "one", website: "" }));
    await POST(createRequest({ message: "two", website: "" }));
    await POST(createRequest({ message: "three", website: "" }));

    const response = await POST(createRequest({ message: "four", website: "" }));

    expect(response.status).toBe(429);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
