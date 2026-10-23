# Afritrace complete blueprint (build-ready)

## Positioning

Afritrace prepares, validates, and monitors the evidence needed for EU import compliance—then routes exceptions to human review.

**Wedge:** EUDR packs for cocoa & coffee → EU.

## Journey

Create shipment → Add evidence → Validate plots → Assess risk → Remediate → Generate pack → Submit/monitor

## Architecture

- **Frontend:** Buyer workspace, supplier portal, admin review, marketing site
- **Backend:** Identity, shipment, document intelligence, geospatial, risk, pack, workflow, billing, audit, integrations
- **AI:** Intake, Evidence, Geospatial, Risk, Pack agents — LLM extracts/summarizes; rules engine enforces thresholds

## Screens

Dashboard · New shipment · Supplier profile · Evidence vault · Plot map · Risk report · Exception inbox · Pack preview · Billing · Audit log

## Build order

1. Auth + shipment + upload + status  
2. OCR + evidence checklist + GeoJSON validation + map  
3. EUDR rules + risk + human review + PDF/JSON + Stripe + audit  
4. Supplier portal + notifications + pilot with 3–5 importers  

## Guardrails

No auto-approve high risk · Version all AI outputs · File hashes · Deterministic legal thresholds · 5-year retention · Operator remains responsible for DDS
