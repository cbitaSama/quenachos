import { track } from "@vercel/analytics";

type EventName =
  | "whatsapp_click"
  | "sabor_view"
  | "pickup_directions"
  | "qr_scan"
  | "event_inquiry";

export function trackEvent(
  name: EventName,
  data?: Record<string, string | number | boolean | null>,
) {
  try {
    track(name, data);
  } catch {
    // analytics no debe romper la UI
  }
}
