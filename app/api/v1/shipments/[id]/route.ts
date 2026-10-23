import { NextResponse } from "next/server";
import { getShipment } from "@/lib/store";
import { runShipmentTurn } from "@/lib/orchestrator";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const s = getShipment(params.id);
  if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!s.paid) {
    return NextResponse.json({
      shipment_id: s.shipment_id,
      status: s.status,
      risk: s.risk,
      findings: s.findings.map((f) => ({
        rule: f.rule,
        severity: f.severity,
        message: f.message,
      })),
      paid: false,
      price_eur: s.price_eur,
      audit_steps: s.audit.map((a) => a.agent),
      locked: true,
    });
  }
  return NextResponse.json(s);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  if (body.evidence_text) {
    const s = getShipment(params.id);
    if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });
    s.evidence_text = body.evidence_text;
    if (body.lat != null) s.plots[0] = { ...s.plots[0], lat: Number(body.lat) };
    if (body.lon != null) s.plots[0] = { ...s.plots[0], lon: Number(body.lon) };
    if (body.area_ha != null)
      s.plots[0] = { ...s.plots[0], area_ha: Number(body.area_ha) };
  }
  const result = await runShipmentTurn(params.id, body.message);
  if (!result.paid) {
    return NextResponse.json({
      shipment_id: result.shipment_id,
      status: result.status,
      risk: result.risk,
      findings: result.findings,
      paid: false,
      locked: true,
    });
  }
  return NextResponse.json(result);
}
