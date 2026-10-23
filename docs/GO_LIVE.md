# Go-live checklist (money this month)

## Product paywall (live)

- Free: risk score, completion %, gap rule names + short messages
- Locked until pay: full GPS, cert IDs, remediation text, JSON/PDF download
- Owner unlock PIN: `afritrace-owner` (change before public marketing)
- Public URL: https://afritrace-youbas-projects.vercel.app

## You must do (cannot be automated by code alone)

1. Create Stripe Payment Link for **€750** (product: Afritrace Shipment Evidence Pack)
2. Paste link in app under **Pay €750**
3. Change owner PIN in code before sharing widely
4. List 30 EU cocoa/coffee importers (BE/NL/FR/DE)
5. Send GTM email from `docs/GTM_EMAIL.md`
6. Close first paid pack — only then build OCR/WhatsApp

## Payment rules

- Unknown buyers: pay before full pack
- No free full JSON on page
- Service work: 50% deposit or 100% upfront

## Optional next eng (after first €750)

- Stripe webhook → auto `paid=true` (remove owner PIN for customers)
- Real OpenAI extract path
- Supabase shipment checkpoints
