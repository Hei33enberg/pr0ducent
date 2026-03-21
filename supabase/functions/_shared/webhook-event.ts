/**
 * PBP webhook event string extraction. Keep in sync with /docs and DeveloperPortal.
 * Used by vbp-webhook-apply and tested from Vitest via src/lib/webhook-event.ts.
 */
export function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export function normalizeWebhookEvent(
  payload: Record<string, unknown>,
  nested?: Record<string, unknown> | null
): string {
  const raw =
    str(payload.event) ||
    str(payload.type) ||
    str(payload.event_type) ||
    str(payload.status) ||
    (nested
      ? str(nested.event) ||
        str(nested.type) ||
        str(nested.event_type) ||
        str(nested.status)
      : "") ||
    "";
  return raw.toLowerCase();
}
