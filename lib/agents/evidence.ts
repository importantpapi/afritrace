import type { ShipmentState } from "../types";

export function evidenceAgent(state: ShipmentState): ShipmentState {
  // Checklist is applied in rules; this agent only normalizes flags
  const e = state.extracted;
  if (state.production_date) e.production_date = true;
  state.extracted = e;
  state.model_versions.evidence = "checklist-v1";
  return state;
}
