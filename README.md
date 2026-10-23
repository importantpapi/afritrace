# Afritrace

AI-native compliance operations platform for EU import due diligence.

**Positioning:** Afritrace prepares, validates, and monitors the evidence needed for EU import compliance—then routes exceptions to human review. It does not guarantee legal compliance or replace the operator’s DDS obligations.

**Initial wedge:** EUDR due-diligence packs for cocoa and coffee shipments entering the EU.

## Product journey

1. Create shipment  
2. Add evidence  
3. Validate plots  
4. Assess risk  
5. Remediate gaps  
6. Generate pack  
7. Export / monitor  

## Repo layout

```
agents/           # Intake, Evidence, Geospatial, Risk, Pack agents + orchestrator
prompts/          # Production LLM prompts (JSON-only outputs)
rules/            # Deterministic EUDR rule engine
schema/           # PostgreSQL + PostGIS DDL
api/              # Vercel/serverless endpoints
docs/             # Architecture and competitor notes
```

## Stack

- Frontend: Next.js, TypeScript, Tailwind (UI prototype on Vercel)
- Backend: API routes + PostgreSQL/PostGIS
- AI: structured extraction + reasoning; rules are deterministic
- Payments: Stripe
- Storage: S3-compatible

## Pricing (launch)

| Plan | Price | Includes |
|------|-------|----------|
| Starter | €750 / shipment | AI extract, plot checks, risk, PDF/JSON pack |
| Supplier Verified | €1,500 / year | Reusable supplier vault |
| Growth | €2,500 / month | 5 shipments, portal, API |
| Enterprise | Custom | Volume, ERP, review SLA |

## Guardrails

- LLM never decides pass/fail for legal thresholds
- Human review required for blockers / high risk
- Audit: prompts, model version, hashes, reviewer, timestamps
- 5-year retention capability for production/traceability data
