import type { ShipmentState } from "../types";

export function geoAgent(state: ShipmentState): ShipmentState {
  // Prefer form plots if extract missed GPS
  if ((!state.plots[0]?.lat || !state.plots[0]?.lon) && state.extracted.lat) {
    state.plots = [
      {
        lat: state.extracted.lat as number,
        lon: state.extracted.lon as number,
        area_ha: state.plots[0]?.area_ha,
      },
    ];
  }
  state.model_versions.geo = "validate-v1";
  return state;
}
