# POP / VBP — zakres open source (co otwieramy, czego nie)

Cel: **zaufanie i wkład społeczności** w integracje buildera bez odsłaniania całego produktu brokera ani utrudniania operacji.

## Otwarte teraz (zalecane repo publiczne)

Pakiet w [`protocol/vibecoding-broker-protocol/`](../protocol/vibecoding-broker-protocol/README.md) (mirror na GitHub wg [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)):

| Element | Po co |
|---------|--------|
| [VBP-SPEC.md](./VBP-SPEC.md) (lub kopia w bundle) | Normatywny kontrakt |
| JSON Schemas + OpenAPI | Walidacja i generacja klientów |
| `validator/` | `vbp-validate` przeciw `api_base_url` |
| `examples/minimal-node/` | Serwer referencyjny |
| `sdk/typescript`, `sdk/python` | Minimalni klienci po stronie brokera |
| [POP-QUICKSTART.md](../protocol/vibecoding-broker-protocol/examples/POP-QUICKSTART.md) | Ścieżka „90 min” |

To wystarcza, żeby **builder** zaimplementował VBP i żeby **społeczność** poprawiała schematy, przykłady i dokumentację.

## Nie otwieramy jako OSS (obecnie)

| Obszar | Powód |
|--------|--------|
| Pełny orchestrator (`dispatch-builders`, kolejka, billing) | Operacyjna powierzchnia ataku, koszt wsparcia |
| Wewnętrzne klucze, limity, polityki cenowe | Bezpieczeństwo i biznes |
| Mosty **browser-only** / RPA wysokiego ryzyka | ToS, kruchość, compliance ([POP-BRIDGE-RISK-POLICY.md](./POP-BRIDGE-RISK-POLICY.md)) |
| Szczegóły scoringu PVI powiązane z benchmarkiem produktu | IP produktu |

## Co może dojść później (rozważnie)

- Referencyjny „shim” adaptera (tylko mapowanie JSON → VBP) **bez** sekretów produkcyjnych.
- Większy zestaw przykładów w `examples/` finansowany przez community PR.

## Dla contributorów

[protocol/vibecoding-broker-protocol/CONTRIBUTING.md](../protocol/vibecoding-broker-protocol/CONTRIBUTING.md)
