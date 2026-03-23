# GitHub: PRs, sponsors, solo → team

## Pull Requests — what to set (solo now, team later)

**Goal:** simple history on `main`, less clutter, ready for review when more people join.

| Setting | Recommendation | Rationale |
|---------|------------------|-----------|
| **Allow merge commits** | You can **disable** if you only use squash | Single line of history; many merge commits with many PRs |
| **Allow squash merging** | **Enabled** (primary method) | One commit per PR — readable with many contributors |
| **Allow rebase merging** | **Optionally** enabled | For maintainers who want linear history without merge commits |
| **Always suggest updating PR branches** | **Enabled** | Fewer “green” PRs stale vs `main` |
| **Allow auto-merge** | **Enabled** after CI + branch protection | PR merges when checks pass (saves clicks) |
| **Automatically delete head branches** | **Enabled** | Cleans up branches after merge |

**Solo:** you can still push to `main` — PR rules mainly apply to **PRs from branches**. When a team appears, add **branch protection** on `main`: require PR + (optional) 1 review.

**Commits → DCO (sign off):** usually **off** unless you legally require DCO.

**Issues → Auto-close:** **on** — sensible (`Fixes #123` in a PR closes the issue).

---

## Sponsors — Stripe (not “native” Stripe in GitHub)

GitHub does **not** connect to the Stripe API. You create a **payment link** in Stripe and paste it into the repo.

1. [Stripe Dashboard](https://dashboard.stripe.com/) → **Product catalog** → **Payment links** → **New** (amount / product / one-time or subscription).
2. After saving, copy the URL (`https://buy.stripe.com/...` or regional equivalent).
3. In [`.github/FUNDING.yml`](../.github/FUNDING.yml) **uncomment** the `custom:` block and paste that URL under it.
4. Commit to `main` — the **Sponsor** button shows both **GitHub Sponsors** (`github:`) and **Custom** (Stripe).

If you do **not** yet have [GitHub Sponsors](https://github.com/sponsors), remove or comment out `github: [Hei33enberg]` in `FUNDING.yml` so it does not point to an empty profile — for a start you can use only `custom:` with Stripe.

---

## Copilot vs repo settings

**GitHub Copilot does not toggle** checkboxes in **Settings** (PR, Discussions, Sponsors). It **can** generate or fix files: `FUNDING.yml`, issue templates, Discussions copy — use [GITHUB-COPILOT-OSS-SETUP-PROMPT.md](./GITHUB-COPILOT-OSS-SETUP-PROMPT.md).
