# VBP compatibility matrix (community-maintained)

**Purpose:** track real-world builder implementations against [CONFORMANCE.md](./CONFORMANCE.md).  
**Levels:** Experimental | Partial | Verified (see CONFORMANCE).

Update this file via pull request. Keep rows factual; link public docs or blog posts when available.

| Builder | Level | Dispatch | Status poll | Webhook | SSE | Notes | Last updated |
|---------|-------|----------|-------------|---------|-----|-------|--------------|
| _Example_ | Partial | Yes | Yes | Planned | No | Pilot Q2 | YYYY-MM-DD |

## How to add a row

1. Run `node validator/cli.mjs <baseUrl>` and paste summary in your PR (or attach log).
2. Set **Level** to **Verified** only if required routes and shapes match the current schemas.
3. If the builder is invite-only or NDA, say so in **Notes** without leaking secrets.

## Badge ladder (informative)

- **Experimental** — in development; not for production broker routing.
- **Partial** — dispatch + one completion path (poll or webhook); gaps documented.
- **Verified** — passes validator against live `api_base_url` per CONFORMANCE.

Product policy for “badges” in a broker UI is up to each broker (e.g. pr0ducent).
