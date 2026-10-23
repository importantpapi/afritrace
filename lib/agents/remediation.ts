import type { ShipmentState } from "../types";

export function remediationAgent(state: ShipmentState): ShipmentState {
  state.remediation = state.findings.map((f) => ({
    rule: f.rule,
    message: `[Afritrace] ${f.fix}`,
  }));
  state.model_versions.remediation = "template-v1"; // later: LLM FR/EN
  return state;
}
