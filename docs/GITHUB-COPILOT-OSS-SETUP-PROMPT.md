# GitHub Copilot prompt (OSS files — not Settings)

Paste into **Copilot Chat** in the `pr0ducent` repo (on GitHub). Copilot **cannot** click Settings → Pull requests; it will prepare/edit **files** in `.github/` and `docs/`.

```text
Repository: Hei33enberg/pr0ducent — open source MIT.

Tasks:
1. Review .github/FUNDING.yml — ensure YAML is valid. Document that `custom:` must be uncommented and filled with a real Stripe Payment Link from the Stripe Dashboard; `github:` only if GitHub Sponsors is enrolled.
2. Ensure .github/ISSUE_TEMPLATE/ has: config.yml (contact_links to Discussions + security info), 01-bug-report.yml, 02-feature-request.yml, 03-integration-vbp.md — fix any YAML schema issues for GitHub issue forms.
3. Add or update docs/GITHUB-SETTINGS-SOLO-AND-TEAM.md with a short checklist for solo maintainer: enable squash merge, auto-delete branches, suggest updating PR branches; later add branch protection when a team joins.
4. Do NOT invent secrets or Stripe keys.

Output: list files changed and any follow-up the human must do in GitHub Settings (manual only).
```

After Copilot responds, **you manually** in Settings → General:

- Enable **Squash** as the preferred merge method (if you disable merge commits — keep squash and optionally rebase).
- Enable **Automatically delete head branches**.
- Enable **Always suggest updating pull request branches**.
- **Sponsor button:** after committing `FUNDING.yml` with a Stripe URL, verify the Sponsor button shows the link.
