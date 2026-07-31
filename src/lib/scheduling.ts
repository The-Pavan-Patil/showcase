const GOOGLE_CALENDAR_ORIGIN = "https://calendar.google.com";
const GOOGLE_APPOINTMENT_PATH = /^\/calendar\/(?:u\/\d+\/)?appointments\/schedules\//;

export function getGoogleCalendarBookingUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_SCHEDULING_URL?.trim();

  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);

    if (
      url.origin !== GOOGLE_CALENDAR_ORIGIN ||
      !GOOGLE_APPOINTMENT_PATH.test(url.pathname)
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
