"use client";

import { useState } from "react";

type PublicResult = {
  shipment_id: string;
  status: string;
  risk?: { score: number; level: string; human_review_required: boolean };
  findings?: { rule: string; severity: string; message: string; fix?: string }[];
  evidence_completion_pct?: number | null;
  paid?: boolean;
  price_eur?: number;
  audit_steps?: string[];
  locked?: string[] | boolean;
  pack?: unknown;
  plots?: unknown;
  extracted?: unknown;
  remediation?: { rule: string; message: string }[];
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicResult | null>(null);
  const [pin, setPin] = useState("");
  const [form, setForm] = useState({
    supplier: "Coopérative Agricole de San-Pédro",
    buyer: "Brussels Cocoa Imports BV",
    commodity: "cocoa",
    origin: "CI",
    quantity_kg: 25000,
    production_date: "2026-09-15",
    lat: "5.123456",
    lon: "-6.123456",
    area_ha: "2.5",
    evidence_text:
      "Certificate of origin CI-COC-2026-8821. Registration CI-REG-2019-441. Harvest 2026-08-01 to 2026-09-30. No deforestation after 31 Dec 2020. Plot GPS 5.123456, -6.123456.",
  });

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/v1/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: parseFloat(form.lat),
          lon: parseFloat(form.lon),
          area_ha: parseFloat(form.area_ha),
        }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  async function unlock() {
    if (!result?.shipment_id) return;
    const res = await fetch(`/api/v1/shipments/${result.shipment_id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "owner", pin }),
    });
    const data = await res.json();
    if (data.shipment) setResult(data.shipment);
    else alert(data.error || "Unlock failed");
  }

  async function download() {
    if (!result?.shipment_id) return;
    const res = await fetch(`/api/v1/shipments/${result.shipment_id}/pack`);
    if (res.status === 402) {
      alert("Payment required");
      return;
    }
    const data = await res.json();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    );
    a.download = `${result.shipment_id}-pack.json`;
    a.click();
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Afritrace</h1>
      <p style={{ color: "#71717a", marginBottom: 24 }}>
        Full-stack orchestrator API · free analysis · pay to unlock pack
      </p>

      <section style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <label style={lab}>Supplier</label>
        <input style={inp} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
        <label style={lab}>Buyer</label>
        <input style={inp} value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} />
        <label style={lab}>Evidence text</label>
        <textarea style={{ ...inp, minHeight: 100 }} value={form.evidence_text} onChange={(e) => setForm({ ...form, evidence_text: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div>
            <label style={lab}>Lat</label>
            <input style={inp} value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          </div>
          <div>
            <label style={lab}>Lon</label>
            <input style={inp} value={form.lon} onChange={(e) => setForm({ ...form, lon: e.target.value })} />
          </div>
          <div>
            <label style={lab}>Area ha</label>
            <input style={inp} value={form.area_ha} onChange={(e) => setForm({ ...form, area_ha: e.target.value })} />
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          style={{ marginTop: 12, width: "100%", padding: 14, background: "#0f766e", color: "#fff", border: 0, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "Orchestrator running…" : "Run orchestrator (free analysis)"}
        </button>
      </section>

      {result && (
        <section style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: 20 }}>
          <p style={{ fontWeight: 700 }}>{result.shipment_id}</p>
          <p style={{ color: "#71717a", fontSize: 14 }}>
            status: {result.status} · risk: {result.risk?.level} ({result.risk?.score}) · paid:{" "}
            {String(result.paid)}
          </p>
          {result.audit_steps && (
            <p style={{ fontSize: 13, marginTop: 8 }}>Agents: {result.audit_steps.join(" → ")}</p>
          )}
          <ul style={{ marginTop: 12, paddingLeft: 18 }}>
            {(result.findings || []).map((f) => (
              <li key={f.rule} style={{ marginBottom: 6 }}>
                <strong>{f.rule}</strong> — {f.message}
                {result.paid && f.fix ? (
                  <div style={{ fontSize: 13, color: "#0f766e" }}>Fix: {f.fix}</div>
                ) : (
                  <div style={{ fontSize: 12, color: "#a1a1aa" }}>Remediation locked until pay</div>
                )}
              </li>
            ))}
          </ul>

          {!result.paid && (
            <div style={{ marginTop: 16, padding: 16, background: "#fafafa", borderRadius: 10 }}>
              <p style={{ fontWeight: 600 }}>Unlock full pack — €{result.price_eur || 750}</p>
              <input
                style={{ ...inp, marginTop: 8 }}
                type="password"
                placeholder="Owner PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <button type="button" onClick={unlock} style={{ marginTop: 8, padding: "10px 16px", background: "#0a0a0b", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600 }}>
                Owner unlock
              </button>
            </div>
          )}

          {result.paid && (
            <button type="button" onClick={download} style={{ marginTop: 16, padding: "12px 18px", background: "#0f766e", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700 }}>
              Download pack JSON
            </button>
          )}
        </section>
      )}
    </main>
  );
}

const lab: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#71717a", marginTop: 10, marginBottom: 4 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #e4e4e7", borderRadius: 8, boxSizing: "border-box" };
