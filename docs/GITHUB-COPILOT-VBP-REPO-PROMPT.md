# GitHub Copilot — prompt: public VBP repo

Paste into **GitHub Copilot Chat** (in the repo/org with permissions). Single name: **VBP**. Adjust `org/repo`.

```
You are helping ship the public open-source protocol repo for the Vibecoding Broker Protocol (VBP).

Context:
- Source of truth in monorepo: folder `protocol/vibecoding-broker-protocol/` on branch `main` (openapi/, schemas/, validator/, examples/, sdk/, CONTRIBUTING.md, COMPATIBILITY-MATRIX.md, .github/ISSUE_TEMPLATE/).
- Goal: create a NEW public GitHub repo (e.g. org/vibecoding-broker-protocol) with that content at repo root, wired for contributors.

Tasks (in order, report each step):
1. If the repo does not exist, create an empty public repo under the org/user I specify.
2. Copy the subtree from `protocol/vibecoding-broker-protocol/` into the new repo root (keep .github/ISSUE_TEMPLATE).
3. Copy or adapt the workflow from monorepo `.github/workflows/vbp-protocol.yml` to the new repo `.github/workflows/` so JSON schema validation runs on push/PR.
4. Set repo About: description "Vibecoding Broker Protocol (VBP) — spec, schemas, validator"; website https://pr0ducent.com/docs; topics: vbp, broker-protocol, api, json-schema.
5. Create labels: spec, integration, compatibility, good-first-issue.
6. Enable Issues; optionally Discussions with category "Integrations".
7. Branch protection on `main`: require CI green for PRs when the plan allows.
8. Output: repo URL, first green CI run link, short "Maintainer checklist" for syncing from monorepo (git subtree or manual copy).

Constraints: no secrets in repo. If a step needs org admin, say exactly what to click in GitHub UI.
```

Related: [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md).
