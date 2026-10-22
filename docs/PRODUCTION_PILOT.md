# Afritrace — paid pilot production checklist

## Demand (yes — regulation-forced)

| Signal | Evidence |
|--------|----------|
| EUDR deadline | Large operators **30 Dec 2026**; SMEs later |
| Buyer pressure | Exporters already asked for GPS / due diligence data |
| Cost gap | EU tools often €12k+/yr or €40k deforestation analysis; African pricing gap is explicit |
| CBAM | Certificate phase live; importers need supplier emissions data |
| Software market | 14+ EUDR vendors compared in 2026; most quote-only / enterprise |

Willingness to pay is **keep the EU contract / avoid exclusion**, not buy AI.

## Satellite note (not SpaceX EO)

- Starlink / SpaceX = connectivity for field teams, not EUDR forest maps.
- Production EO: Copernicus Sentinel-2 (free), optional Planet / Maxar / Sentinel Hub.

## Minimum pilot stack

1. Auth — Supabase Auth
2. DB — supabase/schema.sql
3. Upload — Storage bucket documents
4. OCR + GPT — api/extract.ts + OPENAI_API_KEY
5. Stripe — api/checkout.ts €750
6. Export + disclaimer always on
7. Human review before ready

Configure secrets on Vercel. Until then: guided demo / human-review pilot only.
