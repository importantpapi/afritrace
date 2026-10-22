# Afritrace — Full-stack agent system (AI engineer view)

## What "full stack end-to-end" means here

```
Client (dashboard)
    → POST /api/run-agents
        → Orchestrator
            → Ingest → Extract → Rules → Action → Trust → Export → Reorder
        → PassportState + audit[] + agent_runs[]
    → Human Approve
    → Stripe / invoice
```

## Agents (each has one job)

| # | Agent | Responsibility | Deterministic? |
|---|--------|----------------|----------------|
| 1 | Ingest | Normalize text/files, start audit | Yes |
| 2 | Extract | Structured fields (GPS, kWh, certs) | Yes now; LLM optional |
| 3 | Rules | EUDR/CBAM/Battery gaps | **Always yes** (legal) |
| 4 | Action | Tasks by role | Yes |
| 5 | Trust | 0–100 score | Yes |
| 6 | Export | Pack JSON | Yes |
| 7 | Reorder | Next PO suggestion | Yes |

**Rule:** LLM may fill fields. LLM must **not** decide pass/fail. Rules agent decides.

## Files

- `agents/types.ts` — contracts
- `agents/*.ts` — one agent each
- `agents/orchestrator.ts` — pipeline
- `api/run-agents.ts` — HTTP entry
- `supabase/shipment_passport.sql` — persistence

## Production wiring (keys)

1. `OPENAI_API_KEY` — swap extract body to JSON-schema completion
2. Google Vision / Textract — PDF → text before extract
3. Supabase — save passport + audit
4. Stripe — checkout on `approved`

## Honest status

| Layer | Status |
|-------|--------|
| Agent code + orchestrator | **In repo** |
| API route | **In repo** |
| Live UI demo pipeline | **On Vercel** (same logic, client) |
| OCR + GPT live | Needs keys |
| Multi-tenant DB | Schema ready |

## API example

```bash
curl -X POST https://YOUR_DOMAIN/api/run-agents \\
  -H 'Content-Type: application/json' \\
  -d '{
    "supplier": "Coop Soubré",
    "buyer": "Bruxelles Cocoa",
    "product": "cocoa",
    "originCountry": "CI",
    "rawText": "Plot GPS 5.785432, -6.601234. No deforestation after 31 Dec 2020. Certificate CI-COC-2026-8821."
  }'
```
