# Prompt dla GitHub Copilot (pliki OSS — nie Settings)

Wklej w **Copilot Chat** w repo `pr0ducent` (na GitHubie). Copilot **nie może** kliknąć Settings → Pull requests; przygotuje/edytuje **pliki** w `.github/` i `docs/`.

```text
Repository: Hei33enberg/pr0ducent — open source MIT.

Tasks:
1. Review .github/FUNDING.yml — ensure YAML is valid. Document that `custom:` must be uncommented and filled with a real Stripe Payment Link from the Stripe Dashboard; `github:` only if GitHub Sponsors is enrolled.
2. Ensure .github/ISSUE_TEMPLATE/ has: config.yml (contact_links to Discussions + security info), 01-bug-report.yml, 02-feature-request.yml, 03-integration-vbp.md — fix any YAML schema issues for GitHub issue forms.
3. Add or update docs/GITHUB-SETTINGS-SOLO-AND-TEAM.md with a short checklist for solo maintainer: enable squash merge, auto-delete branches, suggest updating PR branches; later add branch protection when a team joins.
4. Do NOT invent secrets or Stripe keys.

Output: list files changed and any follow-up the human must do in GitHub Settings (manual only).
```

Po odpowiedzi Copilota **Ty ręcznie** w Settings → General:

- Włącz **Squash** jako preferowany sposób merge (jeśli wyłączasz merge commits — zostań przy squash + ewentualnie rebase).
- Włącz **Automatically delete head branches**.
- Włącz **Always suggest updating pull request branches**.
- **Sponsor button:** po commitowaniu `FUNDING.yml` ze Stripe URL sprawdź, czy przycisk Sponsor pokazuje link.
