# Afritrace

**AI-native CBAM · EUDR · EU Battery Passport compliance for African suppliers**

Steel · Aluminum · Cocoa · Coffee · Lithium · Cobalt · Nickel

90% cheaper than European consultants (€5k–€50k/year vs €50k–€500k).

## Live UI preview

Open the root `index.html` (or deploy this repo to Vercel — Framework: Other / static).

| Tab | What it does |
|-----|----------------|
| Home | Product overview |
| Supplier | Live CBAM calculator + agent demos |
| Buyer | Search suppliers, RFQ, escrow |
| Admin | KPIs, agent health, review queue |
| APIs | Endpoint reference |

## Deploy to Vercel (public link)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **importantpapi/afritrace**
3. Framework preset: **Other**
4. Root directory: `.` (repo root)
5. Deploy → you get `https://afritrace-xxx.vercel.app`

Or CLI:

```bash
npx vercel --yes
```

## Repository structure

```
├── index.html              # Interactive UI (Vercel entry)
├── vercel.json
├── agents/                 # CBAM, EUDR, Battery, Verify, OCR
├── frontend/               # Next.js app (pages + API routes)
├── supabase/schema.sql     # Full database schema
└── preview/                # Same UI (duplicate for reference)
```

## API endpoints (Next.js)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/cbam/calculate` | CBAM emissions + XML |
| POST | `/api/eudr/map` | Farm risk + DDS |
| POST | `/api/battery/dpp` | Battery passport |
| POST | `/api/verify` | Supplier risk score |
| POST | `/api/upload` | Document upload |
| POST | `/api/rfq` | Request for quote |
| POST | `/api/escrow` | Milestone escrow |

## Quick test (Python agents)

```bash
cd agents/cbam && python emissions_calculator.py
cd ../eudr && python risk_scorer.py
cd ../battery && python passport.py
cd ../verify && python risk_engine.py
```

## License

Engineering foundation for a commercial platform. Validate emission factors against official EU regulations before real filings.
