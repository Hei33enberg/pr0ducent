# Checklista LP (pr0ducent) — przed powrotem do backendu

Prosty przewodnik po polsku: co domknąć na landing page, zanim wracacie do **streamu builderów**, kolejki i core produktu.

---

## Różnica produktowa vs murd0ch (ważne)

| | **pr0ducent** | **murd0ch.com** |
|--|----------------|-----------------|
| Cel na LP | **Szybka akcja:** prompt + wybór builderów to serce strony | **Opowieść:** zaufanie, narracja, długi scroll |
| Co jest „focal” | Pole promptu, szablony, uruchomienie testu — **jak najwyżej** w pierwszym ekranie | Sekcje, ilustracje, klipy, CTA po zbudowaniu kontekstu |

**Wspólna stajnia** = ten sam język wizualny (typografia, ramka `page-frame`, szkło, wash-e). **Nie** kopiujemy 1:1 **układu treści** murd0ch na pr0ducent — inny jest cel biznesowy.

**Pytanie kontrolne:** *Czy w pierwszym ekranie widać od razu, że użytkownik ma wpisać pomysł i odpalić buildery?*

---

## Smoke przed publikacją

- [ ] **Logo** — nie „klei się” do górnej/lewej krawędzi ramki; po otwarciu menu mobilnego to samo co w pasku.
- [ ] **Hero** — na telefonie kolejność: nagłówek → **prompt (chipy + pole)** → karykatura (akcja przed ilustracją).
- [ ] **Sticky header** — nie zasłania nagłówka hero przy scrollu / anchorach (`scroll-margin` na hero).
- [ ] **Menu** — desktop: dropdown przewija się przy wielu pozycjach; mobile: pełny ekran, zamknięcie, język na dole.
- [ ] **CTA** — „Get Started” prowadzi tam, gdzie ustaliliście (np. pricing / auth).

---

## Treści i automatyzacja (crony / joby)

- [ ] Ustalone źródło prawdy dla treści (np. blog: CMS, markdown w repo, Supabase — **jedno miejsce**).
- [ ] Jeśli są crony (sync bloga, RSS, itp.): **gdzie się odpalają** (GitHub Actions / Supabase cron / ręcznie na start) i kto je pilnuje po deployu.
- [ ] Placeholdery na LP zamienione na finalne lub oznaczone jako „WIP”.

---

## Deploy (Lovable / hosting)

1. Pull z GitHub (`main`).
2. Build (lokalnie `npm ci && npm run build` lub build w Lovable).
3. Publish.

**Migracje / Edge:** tylko jeśli w tej iteracji zmienialiście bazę lub funkcje — wtedy osobna checklista w `docs/DEVELOPMENT-STATUS.md` lub dedykowany handoff.

---

## Po LP — backend / core

Krótka notatka na później: **stream wyników builderów**, kolejka (`process-task-queue`), realtime — zgodnie z `docs/ORCHESTRATOR.md` i roadmapą zespołu.

---

## Powiązane dokumenty

- Szczegóły parity wizualnej i braków graficznych: [`PR0DUCENT-PARITY-GAPS.md`](./PR0DUCENT-PARITY-GAPS.md)
- Wspólny design system (master w newsc0rp): [`NEWSCORP-DESIGN-SYSTEM.md`](./NEWSCORP-DESIGN-SYSTEM.md)
