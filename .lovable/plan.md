
Plan naprawczy (priorytet: „normalny pricing” publicznie, bez chaosu)

## Diagnoza (dlaczego teraz tego nie widać)
1. `/dashboard` jest strefą konta i wymaga logowania — dlatego bez logowania nie widzisz subskrypcji.
2. Nie ma osobnej publicznej strony `/pricing`.
3. Subskrypcje nie działają end-to-end: przyciski „Upgrade” nie mają realnego flow płatności.
4. W bazie brak aktywnych rekordów subskrypcji (trigger `handle_new_user` istnieje jako funkcja, ale nie jest podpięty jako trigger).

## Co wdrożyć teraz (P0 → P2)

### P0 — Publiczny Pricing (najpierw)
1. Dodać stronę `/pricing` dostępną bez logowania:
   - 3 plany: Free / Pro ($9) / Business ($29),
   - czytelna tabela limitów promptów i funkcji,
   - CTA: „Start Free”, „Upgrade to Pro”, „Upgrade to Business”.
2. Dodać link „Pricing” w:
   - górnym menu,
   - mobile menu,
   - footerze,
   - floating toolbar.
3. Uporządkować nawigację:
   - „Dashboard” tylko dla zalogowanych (konto),
   - niezalogowany użytkownik trafia na `/pricing` albo `/auth?next=/dashboard`.

### P1 — Płatności i abonamenty (natywnie Stripe)
4. Włączyć natywną integrację Stripe.
5. Dodać flow:
   - checkout dla Pro/Business,
   - portal zarządzania subskrypcją (zmiana planu/anulowanie),
   - strony sukces/anulowanie płatności.
6. Podpiąć webhooki płatności i aktualizować `subscriptions` (plan, limity, okres, status).

### P2 — Spójność danych i bezpieczeństwo
7. Podpiąć trigger `handle_new_user` do tworzenia `profiles` + `subscriptions` po rejestracji.
8. Backfill: utworzyć brakujące subskrypcje dla już istniejących kont.
9. Zaostrzyć RLS dla `subscriptions`:
   - użytkownik: tylko odczyt własnej subskrypcji,
   - zmiany planu tylko przez backend płatności (nie z frontu).

## Dodatki UX (od razu przy tej iteracji)
10. Scroll reset na każdej podstronie (otwieranie od góry).
11. Floating toolbar: poprawa centrowania i responsywności na 411px.
12. Dashboard: czytelny blok „Current plan / Renew date / Usage”.

## Szczegóły techniczne (zakres zmian)
- Nowe: `src/pages/Pricing.tsx`, komponenty sekcji pricing, success/cancel pages.
- Edycje: `src/App.tsx`, `src/components/PageFrame.tsx`, `src/components/Footer.tsx`, `src/components/FloatingToolbar.tsx`, `src/pages/UserDashboard.tsx`.
- Backend: funkcje płatności (checkout, webhook, portal), poprawka triggera użytkownika, polityki RLS `subscriptions`, backfill rekordów.

Założenie do wdrożenia: pricing publiczny dla każdego, checkout po kliknięciu CTA (zalogowanie wymagane dopiero przed finalizacją płatności).
