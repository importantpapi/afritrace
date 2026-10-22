/** POST /api/checkout — Stripe €750 Shipment Passport */
import type { VercelRequest, VercelResponse } from "@vercel/node";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const secret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://afritrace-youbas-projects.vercel.app";
  if (!secret) return res.status(503).json({ error: "STRIPE_SECRET_KEY not configured", amount_eur: 750, pilot: true });
  const passportId = req.body?.passportId || "draft";
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${appUrl}?paid=1&passport=${encodeURIComponent(passportId)}`);
  params.set("cancel_url", `${appUrl}?paid=0`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "eur");
  params.set("line_items[0][price_data][unit_amount]", "75000");
  params.set("line_items[0][price_data][product_data][name]", "Afritrace Shipment Passport");
  params.set("metadata[passport_id]", String(passportId));
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const session = await r.json();
  if (!r.ok) return res.status(502).json(session);
  return res.status(200).json({ url: session.url, id: session.id });
}
