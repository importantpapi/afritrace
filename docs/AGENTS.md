# Afritrace agent pipeline

## Shipment Passport agents (product UI)

1. **Extract Agent** — document text → geo / origin / energy / registration signals
2. **Validate Agent** — EUDR / CBAM / Battery completeness rules
3. **Action Agent** — gap → role assignment (supplier / buyer)
4. **Trust Agent** — 0–100 score from KYB + geo + docs + country risk
5. **Export Agent** — compliance pack JSON (DDS / CBAM / DPP fields)
6. **Reorder Agent** — next shipment template from this passport

## Python agents (agents/)

- `cbam/` — calculator, llm_parser, default_vs_actual
- `eudr/` — risk_scorer, DDS builder
- `battery/` — passport builder
- `verify/` — risk_engine
- `orchestrator.py` — full pipeline

Production wiring: OCR API → GPT extract → same math → Supabase → TRACES/registry.
