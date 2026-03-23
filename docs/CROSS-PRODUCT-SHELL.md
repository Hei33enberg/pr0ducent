# Wspólna „stajnia” — shell (murd0ch · p0xi · pr0ducent)

Jeden język wizualny (typografia, tokeny, ramka `page-frame`, szkło, wash-e, nagłówek), **różne układy treści** LP zależnie od produktu.

## Źródła prawdy

| Co | Gdzie |
|----|--------|
| Tokeny, §15 multi-product | `newsc0rp-main/src/styles/design-tokens.md` (sibling repo) |
| pr0ducent — wdrożenie CSS / komponenty | [`NEWSCORP-DESIGN-SYSTEM.md`](./NEWSCORP-DESIGN-SYSTEM.md), [`DESIGN-TOKENS.md`](./DESIGN-TOKENS.md), [`src/index.css`](../src/index.css) |
| Parity i odstępstwa (checklist) | [`PR0DUCENT-PARITY-GAPS.md`](./PR0DUCENT-PARITY-GAPS.md) |
| Smoke LP (PL) | [`LP-CHECKLIST-PL.md`](./LP-CHECKLIST-PL.md) |

## Wspólne wytycznice (shell)

- **Ramka strony:** `page-frame` — marginesy zewnętrzne, zaokrąglenie, ciepłe tło; nie rozjeżdżać pastylek ani inputu przez losowe `min-h` na siatce hero.
- **Header:** ta sama skala wysokości co murd0ch LP — `h-12 sm:h-14 md:h-16`, padding poziomy `px-4 sm:px-6 md:px-8 lg:px-12`, subtelny `border-b` / `section-divider` gdy menu zamknięte.
- **Logo (pr0ducent):** `BrandText` w headerze — **ten sam clamp co murd0ch Index:** `clamp(1.6rem, 2.5vw + 0.8rem, 2.4rem)`; wariant `header`: cyfra **1.8em**, ™ **0.4em**, `line-height` cyfry **0.8**.
- **CTA „Get Started”:** jak murd0ch header: `px-4 md:px-6 py-2 md:py-2.5 text-[11px] sm:text-xs`, `rounded-full`, sans semibold.
- **Hamburger:** hit area **`w-8 h-8`**; ikona **20×12px** (linie **1.5px**), animacja X z przesunięciem **±5.5px** — patrz `.hamburger-*` w `src/index.css`.
- **Menu:** `gap-2.5` między CTA a hamburgerem; emblematy w siatce ~48px (desktop) / ~56px (mobile overlay) — patrz parity doc.
- **Hero — wspólne:** wash-e (`.hero-wash--*`), serif na H1, akcent gradientowy na kluczowym fragmencie tytułu, oddech pod sticky (`scroll-mt` na sekcji).

## Rozdzielenie produktów (LP)

| Produkt | Intencja pierwszego ekranu |
|---------|----------------------------|
| **murd0ch** | Story-first: narracja, duża ilustracja, CTA po kontekście |
| **pr0ducent** | Prompt-first: nagłówek + szybki opis, potem **chipy + pole + buildery** — ilustracja wspiera, nie blokuje akcji |

Na mobile **pr0ducent** zachowuje kolejność: **nagłówek → karykatura → chipy → pole** (grid `order-*` w `HeroSection.tsx`).

## pr0ducent — metryki referencyjne (kod)

- **H1:** `font-size: clamp(2.35rem, 4vw + 1rem, 5.75rem)`, `leading-[0.9]`.
- **Karykatura:** `object-contain object-bottom`, limity `max-w` / `max-h` po breakpointach (m.in. `sm`…`xl`), bez sztucznego `min-h` na kolumnie z rysunkiem — żeby nie wypychać pastylek w dół na niskich viewportach.

Zmiana tych wartości: zsynchronizuj wpis w [`PR0DUCENT-PARITY-GAPS.md`](./PR0DUCENT-PARITY-GAPS.md) i smoke z [`LP-CHECKLIST-PL.md`](./LP-CHECKLIST-PL.md).
