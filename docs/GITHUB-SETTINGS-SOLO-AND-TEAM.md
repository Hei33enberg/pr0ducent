# GitHub: PR, sponsorzy, solo → zespół

## Pull Requests — co ustawić (solo teraz, zespół później)

**Cel:** prosta historia na `main`, mniej śmieci, gotowość na review gdy dojdą ludzie.

| Ustawienie | Rekomendacja | Uzasadnienie |
|------------|--------------|--------------|
| **Allow merge commits** | Możesz **wyłączyć**, jeśli używasz tylko squash | Jedna linia historii; merge commitów dużo przy wielu PR. |
| **Allow squash merging** | **Włączone** (jako główna metoda) | Jeden commit na PR — czytelne przy wielu contributorach. |
| **Allow rebase merging** | **Opcjonalnie** włączone | Dla maintainerów lubiących liniową historię bez merge commita. |
| **Always suggest updating PR branches** | **Włączone** | Mniej „zielonych” PRów przestarzałych względem `main`. |
| **Allow auto-merge** | **Włączone** po dodaniu CI + branch protection | PR sam się merduje gdy checki OK (oszczędza kliknięcia). |
| **Automatically delete head branches** | **Włączone** | Sprząta gałęzie po merge. |

**Solo:** możesz nadal pushować na `main` — reguły PR dotyczą głównie **PR z gałęzi**. Gdy pojawi się zespół, dodaj **branch protection** na `main`: wymagaj PR + (opcjonalnie) 1 review.

**Commits → DCO (sign off):** zwykle **wyłączone**, chyba że prawnie wymagacie DCO.

**Issues → Auto-close:** **włączone** — sensowne (`Fixes #123` w PR zamyka issue).

---

## Sponsorzy — Stripe (nie jest to „natywny” Stripe w GitHub)

GitHub **nie** łączy się z API Stripe. Ty tworzysz **link płatności** w Stripe i wklejasz go do repo.

1. [Stripe Dashboard](https://dashboard.stripe.com/) → **Product catalog** → **Payment links** → **New** (kwota / produkt / jednorazowo lub subskrypcja).
2. Po zapisaniu skopiuj URL (postaci `https://buy.stripe.com/...` lub regionalny odpowiednik).
3. W [`.github/FUNDING.yml`](../.github/FUNDING.yml) **odkomentuj** blok `custom:` i wklej ten URL pod spodem.
4. Commit na `main` — przycisk **Sponsor** pokaże zarówno **GitHub Sponsors** (`github:`), jak i **Custom** (Stripe).

Jeśli **nie** masz jeszcze [GitHub Sponsors](https://github.com/sponsors), usuń lub zakomentuj linię `github: [Hei33enberg]` w `FUNDING.yml`, żeby nie prowadziła do pustego profilu — zostaw na start sam `custom:` ze Stripe.

---

## Copilot a ustawienia repo

**GitHub Copilot nie ustawia** checkboxów w **Settings** (PR, Discussions, Sponsors). Może natomiast **wygenerować lub poprawić pliki**: `FUNDING.yml`, szablony Issues, treść Discussions — użyj [GITHUB-COPILOT-OSS-SETUP-PROMPT.md](./GITHUB-COPILOT-OSS-SETUP-PROMPT.md).
