/**
 * Minimal TypeScript client for VBP v0.1 (broker-side).
 * Not bundled; copy or publish as `@pr0ducent/vbp-client` when the protocol repo is split.
 */
export type VbpDispatchRequest = {
  broker_id: string;
  broker_auth_token?: string;
  run_id: string;
  prompt: string;
  user_context?: { intent_id?: string; experiment_id?: string };
  webhook_url?: string;
};

export type VbpDispatchResponse = {
  provider_run_id: string;
  stream_url?: string | null;
  claim_token?: string | null;
};

export class VbpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly partnerKey: string
  ) {}

  private url(path: string): string {
    const b = this.baseUrl.replace(/\/$/, "");
    return b.includes("/vbp/") ? `${b}${path}` : `${b}/vbp/v1${path}`;
  }

  async dispatch(body: VbpDispatchRequest): Promise<VbpDispatchResponse> {
    const res = await fetch(this.url("/dispatch"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.partnerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as VbpDispatchResponse) : ({} as VbpDispatchResponse);
    if (!res.ok && res.status !== 202) {
      throw new Error(`VBP dispatch ${res.status}: ${text.slice(0, 200)}`);
    }
    return data;
  }

  async status(providerRunId: string): Promise<unknown> {
    const res = await fetch(this.url(`/status/${encodeURIComponent(providerRunId)}`), {
      headers: { Authorization: `Bearer ${this.partnerKey}`, Accept: "application/json" },
    });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }
}
