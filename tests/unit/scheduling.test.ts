import { afterEach, describe, expect, it, vi } from "vitest";

import { getGoogleCalendarBookingUrl } from "@/lib/scheduling";

describe("Google Calendar scheduling URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a generated Google Calendar appointment schedule URL", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_GOOGLE_CALENDAR_SCHEDULING_URL",
      "https://calendar.google.com/calendar/appointments/schedules/example?gv=true",
    );

    expect(getGoogleCalendarBookingUrl()).toBe(
      "https://calendar.google.com/calendar/appointments/schedules/example?gv=true",
    );
  });

  it("accepts Google Calendar URLs that include an account segment", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_GOOGLE_CALENDAR_SCHEDULING_URL",
      "https://calendar.google.com/calendar/u/0/appointments/schedules/example",
    );

    expect(getGoogleCalendarBookingUrl()).toBe(
      "https://calendar.google.com/calendar/u/0/appointments/schedules/example",
    );
  });

  it.each([
    "",
    "not-a-url",
    "http://calendar.google.com/calendar/appointments/schedules/example",
    "https://example.com/calendar/appointments/schedules/example",
    "https://calendar.google.com/calendar/event?eid=example",
  ])("rejects missing or unsupported values: %s", (value) => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CALENDAR_SCHEDULING_URL", value);
    expect(getGoogleCalendarBookingUrl()).toBeNull();
  });
});
