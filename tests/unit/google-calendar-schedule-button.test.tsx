import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleCalendarScheduleButton } from "@/components/google-calendar-schedule-button";

vi.mock("next/script", async () => {
  const React = await import("react");

  function MockScript({
    onReady,
    strategy,
    ...props
  }: React.ComponentProps<"script"> & {
    onReady?: () => void;
    strategy?: string;
  }) {
    React.useEffect(() => {
      onReady?.();
    }, [onReady]);

    return <script {...props} data-strategy={strategy} />;
  }

  return {
    default: MockScript,
  };
});

const bookingUrl =
  "https://calendar.google.com/calendar/appointments/schedules/example";

function renderButton() {
  return render(
    <GoogleCalendarScheduleButton
      bookingUrl={bookingUrl}
      fallbackAriaLabel="Open Google Calendar to schedule a call"
      helper="Google Meet · Times shown in your timezone"
      label="Schedule a 20-minute intro"
    />,
  );
}

describe("GoogleCalendarScheduleButton", () => {
  beforeEach(() => {
    delete (window as Window & { calendar?: unknown }).calendar;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps a direct booking link available when the widget cannot load", async () => {
    renderButton();

    const fallback = await screen.findByRole("link", {
      name: "Open Google Calendar to schedule a call",
    });
    expect(fallback).toHaveAttribute("href", bookingUrl);
    expect(fallback).toHaveAttribute("target", "_blank");
  });

  it("replaces the fallback after Google's popup button initializes", async () => {
    const load = vi.fn(
      ({ label, target }: { label: string; target: HTMLElement }) => {
        const button = document.createElement("button");
        button.textContent = label;
        target.append(button);
      },
    );
    (window as Window & { calendar?: unknown }).calendar = {
      schedulingButton: { load },
    };

    renderButton();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Schedule a 20-minute intro" }),
      ).toBeVisible();
    });
    expect(load).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "#0d7377",
        label: "Schedule a 20-minute intro",
        url: bookingUrl,
      }),
    );
    expect(
      screen.queryByRole("link", {
        name: "Open Google Calendar to schedule a call",
      }),
    ).not.toBeInTheDocument();
  });
});
