

# Podejście do kont builderów — analiza opcji

## Czy jedno logowanie Google zadziała na wszystkich builderach?

**Nie.** OAuth działa per-serwis. Token Google uwierzytelnia użytkownika wobec *jednej* aplikacji (np. Lovable). Nie można użyć tego samego tokena, żeby zalogować się do v0, Replit czy Floot — każdy builder ma własną rejestrację OAuth i własne konto użytkownika.

## Opcja enterprise seats — to jest dobry pomysł

Większość builderów oferuje plany zespołowe/enterprise z wieloma "seats":

| Builder | Team/Enterprise plan | API dostępne? | Seat management |
|---|---|---|---|
| Lovable | Teams plan | Tak (API) | Zaproszenia email |
| v0 | Vercel Team | Częściowo (REST) | Zaproszenia |
| Replit | Teams for Business | Tak (API) | Zaproszenia + API |
| Bolt | Team plan | Nie (brak publicznego API) | Zaproszenia |
| Floot/Orchids/Base44 | Zależy od fazy | Nieznane | Nieznane |

**Problem:** Żaden builder nie oferuje publicznego API do *automatycznego tworzenia seats/kont*. Zaproszenia wymagają ręcznej akceptacji przez użytkownika.

## Rekomendowane rozwiązanie: API-first (bez browser automation)

Zamiast logować użytkowników na builderów, **PromptLab działa jako proxy** — używa kont enterprise z API keys do wysyłania promptów programowo:

```text
User wpisuje prompt
       ↓
Edge Function wysyła prompt przez API buildera
       ↓
Builder generuje projekt na koncie enterprise PromptLab
       ↓
PromptLab wyświetla preview URL / screenshot wyniku
```

### Jak to działa per builder:

1. **Lovable** — ma publiczne API. Można tworzyć projekty programowo, pobierać preview URL.
2. **v0** — Vercel ma REST API. Można generować komponenty i pobierać wynik.
3. **Replit** — ma GraphQL API. Można tworzyć Repls i uruchamiać kod.
4. **Bolt/Floot/Orchids** — brak publicznych API → tu zostaje Browserbase jako fallback.

### Architektura hybrydowa:

```text
┌─────────────┐
│  React App  │
└──────┬──────┘
       │ POST /api/run-experiment
       ▼
┌──────────────────────┐
│  Edge Function       │
│  (router)            │
├──────────────────────┤
│ if builder.hasAPI:   │──→ Direct API call (Lovable API, Vercel API, Replit API)
│ else:                │──→ Browserbase session (login + paste prompt)
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│  Results stored in   │
│  Supabase            │
│  - preview_url       │
│  - screenshots[]     │
│  - generation_time   │
│  - status            │
└──────────────────────┘
```

## Co trzeba zrobić

### Faza 1: API-first builderzy (Lovable, v0, Replit)

1. **Zbadać API** każdego buildera — endpointy do tworzenia projektów, pobierania preview
2. **Kupić plany enterprise/team** na builderach z API
3. **Dodać API keys jako secrets** w Lovable Cloud
4. **Edge function `run-on-builder`** — przyjmuje prompt + builder ID, wywołuje odpowiednie API
5. **Nowa tabela `builder_results`** — przechowuje preview URL, screenshoty, czas generowania
6. **Frontend** — wyświetla realne wyniki (preview iframe lub screenshot) zamiast mocków

### Faza 2: Browserbase fallback (Floot, Orchids, Base44, etc.)

Dla builderów bez API — Browserbase z kontami enterprise (jak w poprzednim planie).

### Faza 3: Partnerstwa

Nawiązać kontakt z builderami o dedykowane API / integracje partnerskie. Wiele startupów chętnie daje API access w zamian za ruch.

## Koszty

| Pozycja | Koszt/mo |
|---|---|
| Lovable Team | $20-100 |
| Vercel Pro (dla v0) | $20 |
| Replit Teams | $25 |
| Browserbase (dla reszty) | $20 |
| **Łącznie** | **~$85-165/mo** |

## Następny krok

Zanim zacznę implementować, trzeba zweryfikować które API są dostępne. Proponuję:

1. Sprawdzić dokumentację API Lovable, Vercel/v0, Replit
2. Zacząć od **jednego buildera z API** (np. Lovable — bo znamy go najlepiej)
3. Zbudować edge function + frontend dla tego jednego
4. Iterować na kolejne

Czy chcesz żebym zbadał konkretne API builderów i zaplanował implementację zaczynając od jednego?

