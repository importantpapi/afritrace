/** Deterministic EUDR rules — CODE, not LLM */
import type { Finding } from "../types";

function decimalPlaces(n: number): number {
  const s = String(n);
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
}

export function runEudrRules(input: {
  supplier?: string;
  origin?: string;
  quantity_kg?: number;
  lat?: number;
  lon?: number;
  area_ha?: number;
  has_legal?: boolean;
  has_deforest?: boolean;
  has_date?: boolean;
}): Finding[] {
  const f: Finding[] = [];

  if (!input.supplier?.trim()) {
    f.push({
      rule: "SUPPLIER",
      severity: "blocker",
      message: "Supplier legal identity missing",
      fix: "Request legal name + registration from cooperative",
    });
  }
  if (!input.origin?.trim()) {
    f.push({
      rule: "ORIGIN",
      severity: "blocker",
      message: "Country of production missing",
      fix: "Confirm origin country",
    });
  }
  if (!input.quantity_kg || input.quantity_kg <= 0) {
    f.push({
      rule: "QTY",
      severity: "blocker",
      message: "Quantity missing",
      fix: "Confirm kg/tonnes",
    });
  }
  if (input.lat == null || input.lon == null) {
    f.push({
      rule: "GEO",
      severity: "blocker",
      message: "Plot geolocation missing",
      fix: "Send GPS point or polygon with 6+ decimal places",
    });
  } else {
    if (decimalPlaces(input.lat) < 6 || decimalPlaces(input.lon) < 6) {
      f.push({
        rule: "PRECISION",
        severity: "blocker",
        message: "Coordinates need 6 decimal places",
        fix: "Re-export GPS/GeoJSON with full precision",
      });
    }
    if ((input.area_ha ?? 0) > 4) {
      f.push({
        rule: "POLYGON_4HA",
        severity: "blocker",
        message: `Plot is ${input.area_ha} ha but only a point was provided`,
        fix: "Request polygon GeoJSON or KML for this plot",
      });
    }
  }
  if (!input.has_legal) {
    f.push({
      rule: "LEGAL",
      severity: "blocker",
      message: "Legal production evidence missing",
      fix: "Upload origin certificate / land document",
    });
  }
  if (!input.has_deforest) {
    f.push({
      rule: "DEFOREST",
      severity: "blocker",
      message: "Deforestation-free evidence missing",
      fix: "Confirm no deforestation after 31 Dec 2020 + plot link",
    });
  }
  if (!input.has_date) {
    f.push({
      rule: "DATE",
      severity: "blocker",
      message: "Production/harvest date missing",
      fix: "Provide harvest start and end dates",
    });
  }
  return f;
}

export function scoreRisk(findings: Finding[]) {
  let score = 15;
  let blockers = 0;
  for (const x of findings) {
    if (x.severity === "blocker") {
      score += 18;
      blockers++;
    } else score += 6;
  }
  score = Math.min(100, score);
  const level =
    score <= 24 ? "Low" : score <= 49 ? "Medium-low" : score <= 74 ? "Medium" : "High";
  return {
    score,
    level,
    human_review_required: blockers > 0 || score >= 50,
  };
}

export function completionPct(findings: Finding[]) {
  const max = 8;
  const miss = findings.filter((x) => x.severity === "blocker").length;
  return Math.max(0, Math.round((100 * (max - Math.min(miss, max))) / max));
}
