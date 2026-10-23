import { NextResponse } from "next/server";
import { markPaid } from "@/lib/orchestrator";
import { getShipment } from "@/lib/store";

/**
 * POST /checkout — for now owner unlock or simulated pay.
 * Later: Stripe webhook calls markPaid.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const s = getShipment(params.id);
  if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const pin = process.env.OWNER_PIN || "afritrace-owner";
  if (body.mode === "owner" && body.pin === pin) {
    const paid = markPaid(params.id);
    return NextResponse.json({ ok: true, shipment: paid });
  }

  // Simulated Stripe success (replace with session verification)
  if (body.mode === "stripe_simulated") {
    const paid = markPaid(params.id);
    return NextResponse.json({ ok: true, shipment: paid });
  }

  return NextResponse.json(
    {
      error: "payment_required",
      stripe_payment_link: process.env.STRIPE_PAYMENT_LINK || null,
      price_eur: s.price_eur,
    },
    { status: 402 }
  );
}
