# VBP — obiekcje partnerów i odpowiedzi

Używaj w rozmowach z product/legal/engineering u buildera. Techniczna prawda: [VBP-SPEC.md](./VBP-SPEC.md).

## „Nie chcemy oddawać relacji z użytkownikiem brokerowi”

**Odpowiedź:** Broker nie zastępuje Waszego produktu — **kieruje porównanie i pierwszy run**. Handoff jest u Was: `claim_token`, strona claim, normalne konto użytkownika. Użytkownik i tak wybiera buildera po jakości wyniku; broker skraca drogę do discovery.

## „To kolejny standard — mamy już API / MCP”

**Odpowiedź:** POP/VBP jest **wąskim kontraktem** (prompt → run → artefakt → claim), nie zastępuje MCP ani A2A. Możecie wewnętrznie używać dowolnych narzędzi; na granicy z brokerem potrzebujecie stabilnego HTTP + opcjonalnie webhook/SSE.

## „Kanibalizacja brandu”

**Odpowiedź:** Conformance i marketing: **„POP Verified”** jako badge jakości; broker może wyświetlać logo partnera zgodnie z guidelines. Negocjujemy placement (np. „Otwórz w {Builder}”) zamiast anonimowego embeda.

## „Rate limits i koszty inferencji”

**Odpowiedź:** Broker powinien wysyłać `run_id`, respektować **429** i **rate limits** per partnera (`builder_rate_limits` po stronie brokerów). Pilot zaczyna się od małej skali i limitów; umowa może zawierać SLA i cap.

## „Bezpieczeństwo: webhook spoofing, replay”

**Odpowiedź:** Wymagany **HMAC** nad surowym body (`X-VBP-Signature`), sekret out-of-band; broker po stronie odbioru deduplikuje payloady. Zob. [POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md).

## „Nie mamy zasobów na pełny SSE”

**Odpowiedź:** **Minimalny profil POP:** dispatch + **poll status** lub **webhook**; SSE jest opcjonalny w spec ([VBP-SPEC.md](./VBP-SPEC.md)).

## „Reverse engineering / browser automation”

**Odpowiedź:** Nie prosimy o to jako docelową integrację. Natywny VBP jest preferowany. Mosty przeglądarkowe są **tymczasowe** i pod polityką ryzyka ([POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md)).

## „Atrybucja konwersji — spór kto „wygrał””

**Odpowiedź:** Wspólne zdarzenia: **referral click** (CTA), **conversion** (handoff z `claim_token` lub potwierdzony signup z parametru `ref`). Ustalenie w kontrakcie: okno atrybucji, deduplikacja, logowanie po stronie obu systemów ([POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)).

## „Projekt na półkę”

**Typowe przyczyny:** brak jasnego ROI, zbyt szeroki scope, brak ownera po stronie buildera.  
**Mitigacja:** pilot z jasnym KPI ([POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md)), minimalny profil conformance, jeden broker jako referencja.
