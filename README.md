# Afritrace — full-stack orchestrator

## Architecture

```
POST /api/v1/shipments          create + run orchestrator turn
GET  /api/v1/shipments/:id      poll state (locked if unpaid)
POST /api/v1/shipments/:id      refine turn (new evidence)
POST /api/v1/shipments/:id/checkout   pay / owner unlock
GET  /api/v1/shipments/:id/pack       download (402 if unpaid)
```

Agents: intake → evidence → geo → **rules (code)** → risk → remediation → pack  
Store: `lib/store.ts` in-memory → **swap for Supabase later**

## Local

```bash
npm install
npm run dev
```

Owner PIN default: `afritrace-owner` (env `OWNER_PIN`)

## Connect backend later

1. Replace `lib/store.ts` with Supabase
2. Replace `intakeAgent` body with OCR + OpenAI
3. Stripe webhook → `markPaid(shipment_id)`
4. Set `STRIPE_PAYMENT_LINK`

## Live marketing UI (static paywall)

https://afritrace-youbas-projects.vercel.app
