import { NextResponse } from "next/server";
import { createShipment, runShipmentTurn } from "@/lib/orchestrator";
import { listShipments } from "@/lib/store";

export async function GET() {
  const list = listShipments().map((s) => ({
    shipment_id: s.shipment_id,
    status: s.status,
    supplier: s.supplier,
    commodity: s.commodity,
    risk: s.risk,
    paid: s.paid,
    created_at: s.created_at,
  }));
  return NextResponse.json({ shipments: list });
}

export async function POST(req: Request) {
  const body = await req.json();
  const s = createShipment({
    supplier: body.supplier || "",
    buyer: body.buyer || "",
    commodity: body.commodity || "cocoa",
    origin: body.origin || "CI",
    quantity_kg: Number(body.quantity_kg) || 0,
    production_date: body.production_date,
    evidence_text: body.evidence_text || "",
    lat: body.lat != null ? Number(body.lat) : undefined,
    lon: body.lon != null ? Number(body.lon) : undefined,
    area_ha: body.area_ha != null ? Number(body.area_ha) : undefined,
  });
  const result = await runShipmentTurn(s.shipment_id, body.message);
  // Public response: strip sensitive if unpaid
  return NextResponse.json(publicView(result));
}

function publicView(s: ReturnType<typeof createShipment>) {
  if (s.paid) return s;
  return {
    shipment_id: s.shipment_id,
    status: s.status,
    supplier: s.supplier,
    buyer: s.buyer,
    commodity: s.commodity,
    origin: s.origin,
    quantity_kg: s.quantity_kg,
    risk: s.risk,
    findings: s.findings.map((f) => ({
      rule: f.rule,
      severity: f.severity,
      message: f.message,
      // fix locked until paid
    })),
    evidence_completion_pct: s.pack
      ? (s.pack as { evidence_completion_pct?: number }).evidence_completion_pct
      : null,
    paid: false,
    price_eur: s.price_eur,
    audit_steps: s.audit.map((a) => a.agent),
    locked: ["plots", "extracted", "remediation", "pack"],
    disclaimer: "Pay to unlock full pack. Assistive only — not a filing engine.",
  };
}
