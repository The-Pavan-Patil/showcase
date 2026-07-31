"use client";

import { ArrowUpRight, CalendarDays } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

const GOOGLE_CALENDAR_STYLESHEET =
  "https://calendar.google.com/calendar/scheduling-button-script.css";
const GOOGLE_CALENDAR_SCRIPT =
  "https://calendar.google.com/calendar/scheduling-button-script.js";

type GoogleCalendarWindow = Window &
  typeof globalThis & {
    calendar?: {
      schedulingButton?: {
        load: (options: {
          color: string;
          label: string;
          target: HTMLElement;
          url: string;
        }) => void;
      };
    };
  };

type WidgetState = "loading" | "ready" | "error";

type GoogleCalendarScheduleButtonProps = {
  bookingUrl: string;
  fallbackAriaLabel: string;
  helper: string;
  label: string;
};

export function GoogleCalendarScheduleButton({
  bookingUrl,
  fallbackAriaLabel,
  helper,
  label,
}: GoogleCalendarScheduleButtonProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>("loading");
  const targetRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearPendingCheck = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearPendingCheck, [clearPendingCheck]);

  const initializeWidget = useCallback(() => {
    const target = targetRef.current;
    const schedulingButton = (window as GoogleCalendarWindow).calendar
      ?.schedulingButton;

    if (initializedRef.current || !target) return;

    if (!schedulingButton) {
      setWidgetState("error");
      return;
    }

    try {
      schedulingButton.load({
        url: bookingUrl,
        color: "#0d7377",
        label,
        target,
      });
      initializedRef.current = true;

      if (target.childElementCount > 0) {
        setWidgetState("ready");
        return;
      }

      observerRef.current = new MutationObserver(() => {
        if (target.childElementCount === 0) return;

        clearPendingCheck();
        setWidgetState("ready");
      });
      observerRef.current.observe(target, { childList: true });
      timeoutRef.current = window.setTimeout(() => {
        clearPendingCheck();
        setWidgetState(target.childElementCount > 0 ? "ready" : "error");
      }, 3000);
    } catch {
      clearPendingCheck();
      setWidgetState("error");
    }
  }, [bookingUrl, clearPendingCheck, label]);

  return (
    <div className="schedule-call">
      <p className="schedule-call-helper">{helper}</p>
      <div className="google-calendar-schedule" data-state={widgetState}>
        <link rel="stylesheet" href={GOOGLE_CALENDAR_STYLESHEET} />
        <div
          ref={targetRef}
          className="google-calendar-schedule-target"
          hidden={widgetState !== "ready"}
        />
        <a
          className="schedule-call-fallback"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={fallbackAriaLabel}
          hidden={widgetState === "ready"}
        >
          <CalendarDays aria-hidden="true" size={18} />
          <span>{label}</span>
          <ArrowUpRight aria-hidden="true" size={16} />
        </a>
        <Script
          id="google-calendar-scheduling-button"
          src={GOOGLE_CALENDAR_SCRIPT}
          strategy="lazyOnload"
          onReady={initializeWidget}
          onError={() => setWidgetState("error")}
        />
      </div>
    </div>
  );
}
