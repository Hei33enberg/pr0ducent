# Buildery i orkiestracja — krótki przewodnik (PL)

Dla kogoś, kto nie musi znać całego stacku: **co się dzieje po kliknięciu „uruchom”** i **czym jest v0** względem innych narzędzi.

## Dwie ścieżki użytkownika

- **Gość (bez konta):** front woła funkcję **`run-on-v0`**. To prostsza ścieżka: szybki test v0 **bez** tabel `run_jobs` / `run_tasks` i bez pełnej kolejki brokera.
- **Zalogowany:** front woła **`dispatch-builders`**. Powstaje **`run_job`** i po jednym wierszu **`run_tasks`** na każde wybrane narzędzie. Worker **`process-task-queue`** (z kluczem service role) zdejmuje kolejkę i woła odpowiedni **adapter**. Wyniki lądują m.in. w **`builder_results`**; UI może nasłuchiwać Realtime i pollować status (np. v0 przez **`poll-v0-status`**).

Szczegóły techniczne: [ORCHESTRATOR.md](./ORCHESTRATOR.md).

## Czym jest „v0”, a czym są „inne buildery”

- **v0 (na żywo):** dedykowany adapter w kodzie (`v0-adapter`) — bezpośrednie wywołanie API v0, klucz brokera w sekretach Edge (`V0_API_KEY`). W konfiguracji musi być **`tool_id = 'v0'`**, włączone i odpowiedni tier (patrz `adapter-registry.ts`).
- **Inny builder z umową / API:** może wdrożyć **[VBP](./VBP-SPEC.md)** — wtedy broker używa **`vbp-adapter`** i ustawień w **`builder_integration_config`** (URL API, sekrety), **bez** kopiowania logiki v0.
- **Builder tylko z ogólnym REST:** szablon żądania/odpowiedzi w konfiguracji → **`generic-rest-adapter`**.
- **Brak integracji:** narzędzie idzie w ścieżkę **benchmark** (placeholder / symulacja), dopóki nie dodacie live konfiguracji.

## Kolejka i webhook

- Po **INSERT** do **`run_tasks`** idealnie odpala się **Database Webhook** do **`process-task-queue`** (szybciej i równolegle do żądania użytkownika). Instrukcja: [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md).
- Jeśli webhooka nie ma, **`dispatch-builders`** i tak może **inline** dokończyć dispatch — system nie musi być „martwy”, ale kolejka bywa wolniejsza lub mniej niezawodna przy obciążeniu.

## Migracje a kod workerów

Funkcja **`process-task-queue`** zakłada schemat z migracji **`20260322120000_vbp_orchestration.sql`**: m.in. **`builder_integration_config.circuit_state`** oraz **`run_tasks.next_retry_at`**. Jeśli panel Supabase zgłasza błędy kolumn, **wdroż brakujące migracje** — nie usuwaj tych pól z kodu „żeby przestało krzyczeć” na starej bazie.

## VBP (publiczny bundle)

Spec, przykłady i validator publikujemy jako **VBP**, żeby partnerzy mogli podłączyć własny builder pod brokera. Kroki publikacji bundle: [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md). Normatywny kontrakt: [VBP-SPEC.md](./VBP-SPEC.md).

## Co dalej operacyjnie

Jedna strona z linkami: [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md). Smoke test: [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md). Deploy backendu z CI: [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md). Plan AG (PVI vs orkiestracja): [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md).
