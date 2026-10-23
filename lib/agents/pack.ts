import type { ShipmentState } from "../types";
import { completionPct } from "../rules/eudr";

export function packAgent(state: ShipmentState): ShipmentState {
  state.pack = {
    reference: state.shipment_id,
    supplier: state.supplier,
    buyer: state.buyer,
    commodity: state.commodity,
    origin: state.origin,
    quantity_kg: state.quantity_kg,
    plots: state.plots,
    extracted: state.extracted,
    findings: state.findings,
    risk: state.risk,
    evidence_completion_pct: completionPct(state.findings),
    disclaimer:
      "Supports due diligence. Operator remains responsible for DDS filing.",
    generated_at: new Date().toISOString(),
  };
  state.model_versions.pack = "json-v1";
  return state;
}
