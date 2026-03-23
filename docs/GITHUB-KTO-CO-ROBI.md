# GitHub: kto co robi (Cursor vs Copilot vs Ty)

## Podział

| Kto | Co może |
|-----|---------|
| **Cursor / agent w workspace** | Edycja plików w klonie repo (`src/`, `docs/`, `.github/`, migracje, Edge), commit, push na `main` — to sam robisz przez agenta lub lokalnie. |
| **GitHub Copilot (chat w przeglądarce)** | Propozycje zmian w plikach **w ramach sesji na GitHubie** (issue, PR, edycja w UI), gałęzie, czasem merge PR — **bez** klikania Settings → Security, branch protection, uprawnienia org. |
| **Ty** | Wszystko w **Settings** repozytorium i konta: widoczność, branch protection, Dependabot, secret scanning, Sponsors enrollment, Stripe Dashboard, DNS, sekrety CI. Opcjonalnie **GitHub CLI** (`gh`) z tokenem. |

---

## Prompt dla GitHub Copilot (wklej w Copilot Chat na github.com)

Język: **English** — Copilot lepiej rozumie instrukcje techniczne po angielsku.

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

## Tylko Ty (ani agent w Cursorze, ani Copilot tego nie zrobią za Ciebie)

Zaznacz po kolei, co jest zrobione:

### Security i jakość

- [ ] **Settings → Code security and analysis** — Dependabot alerts (włącz); opcjonalnie Dependabot security updates.
- [ ] **Private vulnerability reporting** (jeśli dostępne) — włącz; masz już `SECURITY.md`.
- [ ] **Secret scanning** — włącz w ramach planu / org.

### Pull requests (Settings → General → Pull Requests)

- [ ] **Allow squash merging** — włączone (główna metoda merge).
- [ ] **Allow merge commits** — opcjonalnie wyłącz, jeśli używasz tylko squash.
- [ ] **Always suggest updating pull request branches** — włączone.
- [ ] **Automatically delete head branches** — włączone.
- [ ] **Allow auto-merge** — włącz, gdy masz CI (najpierw workflow zielony).

### Branch protection (Settings → Rules / Branches)

- [ ] Reguła na `main`: wymagaj PR przed merge (gdy jest zespół); wymagane status checks po dodaniu CI.

### Sponsorzy

- [ ] **Stripe:** Dashboard → Payment links → skopiuj URL → wklej w `.github/FUNDING.yml` pod `custom:` (commit może zrobić Cursor — Ty masz URL ze Stripe).
- [ ] **GitHub Sponsors:** jeśli nie masz profilu — w `FUNDING.yml` zakomentuj `github:` (albo zrób to przez Cursor).

### Discussions

- [ ] **Settings → Features** — Discussions włączone.
- [ ] Pierwszy post: tekst z [DISCUSSIONS-WELCOME-COPY.md](./DISCUSSIONS-WELCOME-COPY.md).

### Org / konto

- [ ] **Sponsors** (GitHub) — osobna rejestracja; nie zastępuje Stripe w `FUNDING`.

---

Szczegóły PR i Stripe: [GITHUB-SETTINGS-SOLO-AND-TEAM.md](./GITHUB-SETTINGS-SOLO-AND-TEAM.md). Starszy prompt tylko pod OSS: [GITHUB-COPILOT-OSS-SETUP-PROMPT.md](./GITHUB-COPILOT-OSS-SETUP-PROMPT.md).
