import { describe, expect, it } from "vitest";
import { normalizeWebhookEvent } from "./webhook-event";

describe("normalizeWebhookEvent", () => {
  it("prefers event, then type, then event_type, then status on payload", () => {
    expect(
      normalizeWebhookEvent({
        event: "Completed",
        type: "ignored",
        event_type: "ignored",
        status: "ignored",
      })
    ).toBe("completed");
    expect(normalizeWebhookEvent({ type: "SUCCESS" })).toBe("success");
    expect(normalizeWebhookEvent({ event_type: "Done" })).toBe("done");
    expect(normalizeWebhookEvent({ status: "failed" })).toBe("failed");
  });

  it("reads nested object when passed as second arg", () => {
    expect(
      normalizeWebhookEvent({}, { event_type: "completed", experiment_id: "x" })
    ).toBe("completed");
  });
});
