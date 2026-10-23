import { NextResponse } from "next/server";
import { getShipment } from "@/lib/store";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const s = getShipment(params.id);
  if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!s.paid) {
    return NextResponse.json(
      { error: "payment_required", price_eur: s.price_eur },
      { status: 402 }
    );
  }
  return NextResponse.json(s.pack || s);
}
