/**
 * Deterministic EUDR rule engine — never LLM for pass/fail thresholds.
 * Based on: collect information → assess risk → mitigate; geolocation ≥6 decimals;
 * polygons required for plots >4 ha (non-cattle); production dates required.
 */

export type Severity = 'info' | 'warning' | 'blocker';

export interface RuleFinding {
  rule: string;
  severity: Severity;
  message: string;
  remediation: string;
  field?: string;
}

export interface ShipmentInput {
  commodity?: string | null;
  product_description?: string | null;
  hs_code?: string | null;
  origin_country?: string | null;
  quantity?: number | null;
  quantity_unit?: string | null;
  supplier_legal_name?: string | null;
  production_start_date?: string | null;
  production_end_date?: string | null;
  has_legal_evidence?: boolean;
  has_deforestation_free_statement?: boolean;
  has_traceability?: boolean;
  plots?: PlotInput[];
}

export interface PlotInput {
  id?: string;
  lat?: number | null;
  lon?: number | null;
  geometry_type?: 'point' | 'polygon' | null;
  area_hectares?: number | null;
  coordinate_decimals?: number;
  polygon_closed?: boolean;
  production_start_date?: string | null;
  production_end_date?: string | null;
}

const EUDR_COMMODITIES = new Set([
  'cocoa',
  'coffee',
  'palm_oil',
  'rubber',
  'soy',
  'cattle',
  'wood',
]);

function decimalPlaces(n: number): number {
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

export function runEudrRules(input: ShipmentInput): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const commodity = (input.commodity || '').toLowerCase().replace(/\s+/g, '_');
  if (!commodity || commodity === 'other') {
    findings.push({
      rule: 'EUDR_SCOPE',
      severity: 'blocker',
      message: 'Commodity not identified as an EUDR in-scope product.',
      remediation: 'Confirm commodity (e.g. cocoa, coffee) and HS code.',
      field: 'commodity',
    });
  } else if (!EUDR_COMMODITIES.has(commodity) && commodity !== 'cocoa' && commodity !== 'coffee') {
    // still allow known wedge
    findings.push({
      rule: 'EUDR_SCOPE',
      severity: 'warning',
      message: `Commodity "${commodity}" may require additional scope check against Annex I.`,
      remediation: 'Verify HS code against EUDR Annex I.',
      field: 'commodity',
    });
  }

  if (!input.origin_country) {
    findings.push({
      rule: 'EUDR_ORIGIN_COUNTRY',
      severity: 'blocker',
      message: 'Country of production is required.',
      remediation: 'Provide ISO country of production.',
      field: 'origin_country',
    });
  }

  if (!input.supplier_legal_name) {
    findings.push({
      rule: 'EUDR_SUPPLIER_IDENTITY',
      severity: 'blocker',
      message: 'Supplier legal identity is required.',
      remediation: 'Collect legal name and registration details.',
      field: 'supplier',
    });
  }

  if (!input.product_description) {
    findings.push({
      rule: 'EUDR_PRODUCT_DESCRIPTION',
      severity: 'warning',
      message: 'Product description is missing.',
      remediation: 'Add product description and HS code where available.',
      field: 'product_description',
    });
  }

  if (input.quantity == null || input.quantity <= 0) {
    findings.push({
      rule: 'EUDR_QUANTITY',
      severity: 'blocker',
      message: 'Quantity and unit are required.',
      remediation: 'Provide quantity and unit (e.g. kg, tonnes).',
      field: 'quantity',
    });
  }

  const plots = input.plots || [];
  if (plots.length === 0) {
    findings.push({
      rule: 'EUDR_PLOT_REQUIRED',
      severity: 'blocker',
      message: 'At least one production plot with geolocation is required.',
      remediation: 'Upload GeoJSON/KML/CSV or enter coordinates (≥6 decimals).',
      field: 'plots',
    });
  }

  for (const plot of plots) {
    const lat = plot.lat;
    const lon = plot.lon;
    if (lat == null || lon == null) {
      findings.push({
        rule: 'EUDR_PLOT_GEOLOCATION',
        severity: 'blocker',
        message: `Plot ${plot.id || 'unknown'} is missing coordinates.`,
        remediation: 'Provide WGS84 coordinates to at least six decimal places.',
        field: 'plots',
      });
      continue;
    }

    const decLat = plot.coordinate_decimals ?? Math.min(decimalPlaces(lat), decimalPlaces(lon));
    if (decLat < 6 && decimalPlaces(lat) < 6) {
      findings.push({
        rule: 'EUDR_COORDINATE_PRECISION',
        severity: 'blocker',
        message: `Plot ${plot.id || 'unknown'} coordinates need at least six decimal places.`,
        remediation: 'Re-export GPS/GeoJSON with ≥6 decimal places.',
        field: 'plots',
      });
    }

    const area = plot.area_hectares ?? 0;
    const isCattle = commodity === 'cattle';
    if (!isCattle && area > 4 && plot.geometry_type !== 'polygon') {
      findings.push({
        rule: 'EUDR_PLOT_POLYGON_OVER_4HA',
        severity: 'blocker',
        message: `Plot ${plot.id || 'unknown'} is ${area} ha but was not submitted as a polygon.`,
        remediation: 'Request polygon boundary in GeoJSON or KML.',
        field: 'plots',
      });
    }

    if (plot.geometry_type === 'polygon' && plot.polygon_closed === false) {
      findings.push({
        rule: 'EUDR_POLYGON_CLOSED',
        severity: 'blocker',
        message: `Plot ${plot.id || 'unknown'} polygon is not a valid closed ring.`,
        remediation: 'Fix GeoJSON so the first and last coordinates match.',
        field: 'plots',
      });
    }

    if (!plot.production_start_date && !input.production_start_date) {
      findings.push({
        rule: 'EUDR_PRODUCTION_DATE',
        severity: 'blocker',
        message: `Plot ${plot.id || 'unknown'} is missing production/harvest date range.`,
        remediation: 'Provide production start and end dates (YYYY-MM-DD).',
        field: 'production_date',
      });
    }
  }

  if (!input.has_legal_evidence) {
    findings.push({
      rule: 'EUDR_LEGAL_HARVEST',
      severity: 'blocker',
      message: 'Evidence of legal production/harvest is missing or unclear.',
      remediation: 'Upload land rights, permits, or legal harvest documentation.',
      field: 'evidence',
    });
  }

  if (!input.has_deforestation_free_statement) {
    findings.push({
      rule: 'EUDR_DEFORESTATION_FREE',
      severity: 'blocker',
      message: 'Evidence supporting deforestation-free production is missing.',
      remediation: 'Provide plot evidence and deforestation-free declaration (cutoff 31 Dec 2020).',
      field: 'evidence',
    });
  }

  return findings;
}

export function riskFromFindings(findings: RuleFinding[]): {
  score: number;
  level: 'low' | 'medium_low' | 'medium' | 'high';
  human_review_required: boolean;
} {
  let score = 15;
  let blockers = 0;
  for (const f of findings) {
    if (f.severity === 'blocker') {
      score += 18;
      blockers++;
    } else if (f.severity === 'warning') score += 8;
    else score += 2;
  }
  score = Math.min(100, score);
  const level =
    score <= 24 ? 'low' : score <= 49 ? 'medium_low' : score <= 74 ? 'medium' : 'high';
  return {
    score,
    level,
    human_review_required: blockers > 0 || score >= 50,
  };
}
