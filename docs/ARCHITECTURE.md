# Afritrace production architecture

Based on industry patterns (multi-agent extract → validate → human-in-the-loop):

## Layers

1. **Ingest** — files/text, hashes, audit open
2. **Extract** — deterministic + optional OpenAI JSON schema (fields only)
3. **Validate (Rules)** — deterministic EUDR/CBAM/Battery — never LLM
4. **Action** — tasks by role
5. **Trust** — score
6. **Export** — passport pack
7. **HITL** — human Approve
8. **Pay** — Stripe / SOW

## Design principles (from production agent systems)

- Separation of concerns (one agent = one job)
- Strict schema contracts (`ExtractedFields`, `Gap`, `PassportState`)
- Deterministic QA before acceptance (Rules agent)
- Confidence / trust score
- Full audit lineage for regulators
- Human approval on governed decisions (approve / invoice)

## What was missing vs industry — now addressed in repo

| Missing before | Implemented |
|----------------|-------------|
| Multi-agent decomposition | `agents/*` + orchestrator |
| Schema contracts | `agents/types.ts` |
| Deterministic validation | `agents/rules.ts` |
| Optional LLM extract | `agents/llm_extract.ts` |
| API entry | `api/run-agents.ts` |
| Audit log | every agent pushes `audit[]` |
| HITL approve | UI + status machine |
| Env template | `.env.example` |

## Still external (needs your accounts)

- Live OpenAI key in Vercel env
- OCR provider for PDFs
- Supabase project connected
- Stripe account + Payment Link

## Run API locally (after deploy with functions)

```bash
curl -X POST /api/run-agents -H 'Content-Type: application/json' -d '{...}'
```
