import type { ShipmentState } from "../types";
import { scoreRisk } from "../rules/eudr";

export function riskAgent(state: ShipmentState): ShipmentState {
  state.risk = scoreRisk(state.findings);
  state.model_versions.risk = "score-v1";
  return state;
}
