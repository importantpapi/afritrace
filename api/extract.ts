/** POST /api/extract — requires OPENAI_API_KEY */
import type { VercelRequest, VercelResponse } from "@vercel/node";
const SYSTEM = `Extract Africa→EU compliance fields. JSON only: has_geo, has_origin_doc, has_energy_data, has_registration, kwh_monthly, product_hint, notes, confidence. Assistive only.`;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY not configured", fallback: "paste_mode" });
  const text = (req.body?.text as string) || "";
  if (!text || text.length < 10) return res.status(400).json({ error: "Provide text" });
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: text.slice(0, 12000) }],
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data });
    return res.status(200).json({ extracted: JSON.parse(data.choices?.[0]?.message?.content || "{}"), disclaimer: process.env.DISCLAIMER || "Indicative / assistive — not a legal filing engine." });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "extract failed" });
  }
}
