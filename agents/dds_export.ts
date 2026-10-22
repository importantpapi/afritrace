/**
 * DDS / CBAM oriented export shape (buyer attaches to process).
 * Not a live TRACES submission — assistive pack only.
 */
import type { PassportState, Regulation } from './types';

export interface DdsReadyPack {
  format: 'afritrace_dds_assistive_v1';
  regulation: Regulation;
  shipment_id: string;
  operator_hint: string;
  geo?: { lat: number; lon: number } | null;
  production_date?: string;
  quantity?: string;
  origin_country: string;
  supplier: string;
  evidence_summary: string[];
  gaps_open: string[];
  risk_band?: string;
  trust_score: number;
  approved: boolean;
  disclaimer: string;
}

export function toDdsReady(p: PassportState, riskBand?: string): DdsReadyPack {
  return {
    format: 'afritrace_dds_assistive_v1',
    regulation: p.regulation,
    shipment_id: p.shipment_id,
    operator_hint:
      p.regulation === 'EUDR'
        ? 'Use as evidence pack for operator DDS preparation — not auto-submitted to TRACES'
        : p.regulation === 'CBAM'
          ? 'Use as supplier emissions evidence for CBAM reporting — verify factors officially'
          : 'Use as origin/CoC evidence for battery due diligence display',
    geo:
      p.extracted.lat != null && p.extracted.lon != null
        ? { lat: p.extracted.lat as number, lon: p.extracted.lon as number }
        : null,
    production_date: p.production_date,
    quantity: p.quantity,
    origin_country: p.origin_country,
    supplier: p.supplier,
    evidence_summary: Object.keys(p.extracted),
    gaps_open: p.gaps.map((g) => g.code),
    risk_band: riskBand,
    trust_score: p.trust_score,
    approved: p.approved,
    disclaimer: p.disclaimer,
  };
}
