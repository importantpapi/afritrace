/** Shared types for Afritrace agent system */

export type Regulation = 'EUDR' | 'CBAM' | 'BATTERY';

export type AgentName =
  | 'ingest'
  | 'extract'
  | 'rules'
  | 'action'
  | 'trust'
  | 'export'
  | 'reorder';

export interface AgentContext {
  shipmentId: string;
  supplier: string;
  buyer: string;
  product: string;
  regulation: Regulation;
  originCountry: string;
  quantity?: string;
  productionDate?: string;
  lat?: number;
  lon?: number;
  rawText: string;
  documentIds?: string[];
}

export interface ExtractedFields {
  lat?: number;
  lon?: number;
  origin_cert?: string;
  registration?: string;
  electricity_kwh?: string;
  gas_m3?: string;
  coal_tonnes?: string;
  production_tonnes?: string;
  deforestation_free?: boolean;
  mine_coc?: boolean;
  production_date?: string;
  [key: string]: unknown;
}

export interface Gap {
  code: string;
  role: 'supplier' | 'buyer' | 'freight';
  msg: string;
  severity: 'blocker' | 'warning';
}

export interface AuditEntry {
  at: string;
  agent: AgentName | 'human' | 'system';
  event: string;
  data?: Record<string, unknown>;
}

export interface AgentResult {
  agent: AgentName;
  ok: boolean;
  durationMs: number;
  output: Record<string, unknown>;
  error?: string;
}

export interface PassportState {
  shipment_id: string;
  supplier: string;
  buyer: string;
  product: string;
  regulation: Regulation;
  origin_country: string;
  quantity?: string;
  production_date?: string;
  extracted: ExtractedFields;
  gaps: Gap[];
  trust_score: number;
  status:
    | 'draft'
    | 'ingested'
    | 'extracted'
    | 'gaps_found'
    | 'awaiting_approval'
    | 'approved'
    | 'invoiced';
  approved: boolean;
  approved_at?: string;
  price_eur: number;
  export_pack?: Record<string, unknown>;
  reorder_suggestion?: string;
  audit: AuditEntry[];
  agent_runs: AgentResult[];
  generated_at: string;
  disclaimer: string;
}
