# GitHub: who does what (Cursor vs Copilot vs you)

## Division of labor

| Who | What they can do |
|-----|------------------|
| **Cursor / workspace agent** | Edit files in your repo clone (`src/`, `docs/`, `.github/`, migrations, Edge), commit, push to `main` — you do this via the agent or locally. |
| **GitHub Copilot (browser chat)** | Suggest file changes **in a GitHub session** (issue, PR, UI edit), branches, sometimes merge PR — **without** clicking Settings → Security, branch protection, org permissions. |
| **You** | Everything in repo and account **Settings**: visibility, branch protection, Dependabot, secret scanning, Sponsors enrollment, Stripe Dashboard, DNS, CI secrets. Optionally **GitHub CLI** (`gh`) with a token. |

---

## Prompt for GitHub Copilot (paste in Copilot Chat on github.com)

Language: **English** — Copilot follows technical instructions better in English.

```text
You are helping maintain the public MIT repo Hei33enberg/pr0ducent.

Scope: file and PR content only. Do NOT claim you can change GitHub Settings (branch protection, security policies, org permissions).

If the user asks for repo hygiene, do the following when possible via PR or direct file edit:
1. Validate .github/FUNDING.yml (YAML). If github: points to a user without GitHub Sponsors enabled, suggest commenting it out and using custom: with a Stripe Payment Link URL only.
2. Check .github/ISSUE_TEMPLATE/*.yml for valid GitHub issue form schema; fix broken keys.
3. Suggest small README or CONTRIBUTING.md improvements for contributors (no secrets).
4. Open or update Issues with clear titles when the user asks for a checklist.

Always end with a short "Human required" list: items that must be done in GitHub Settings (web UI) or Stripe Dashboard, not in code.

Never output real secrets or API keys.
```

---

## Only you (neither the Cursor agent nor Copilot can do this for you)

Check off as you go:

### Security and quality

- [ ] **Settings → Code security and analysis** — Dependabot alerts (enable); optional Dependabot security updates.
- [ ] **Private vulnerability reporting** (if available) — enable; you already have `SECURITY.md`.
- [ ] **Secret scanning** — enable per plan / org.

### Pull requests (Settings → General → Pull Requests)

- [ ] **Allow squash merging** — enabled (primary merge method).
- [ ] **Allow merge commits** — optionally disable if you only use squash.
- [ ] **Always suggest updating pull request branches** — enabled.
- [ ] **Automatically delete head branches** — enabled.
- [ ] **Allow auto-merge** — enable when you have CI (green workflow first).

### Branch protection (Settings → Rules / Branches)

- [ ] Rule on `main`: require PR before merge (when you have a team); required status checks after CI exists.

### Sponsors

- [ ] **Stripe:** Dashboard → Payment links → copy URL → paste in `.github/FUNDING.yml` under `custom:` (Cursor can commit — you have the URL from Stripe).
- [ ] **GitHub Sponsors:** if you have no profile — comment out `github:` in `FUNDING.yml` (or do it via Cursor).

### Discussions

- [ ] **Settings → Features** — Discussions enabled.
- [ ] First post: copy from [DISCUSSIONS-WELCOME-COPY.md](./DISCUSSIONS-WELCOME-COPY.md).

### Org / account

- [ ] **Sponsors** (GitHub) — separate enrollment; does not replace Stripe in `FUNDING`.

---

More on PRs and Stripe: [GITHUB-SETTINGS-SOLO-AND-TEAM.md](./GITHUB-SETTINGS-SOLO-AND-TEAM.md). Older OSS-only prompt: [GITHUB-COPILOT-OSS-SETUP-PROMPT.md](./GITHUB-COPILOT-OSS-SETUP-PROMPT.md).
