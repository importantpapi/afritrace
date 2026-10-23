export type ShipmentStatus =
  | "idle"
  | "processing"
  | "needs_remediation"
  | "needs_human"
  | "pack_ready"
  | "paid";

export type Finding = {
  rule: string;
  severity: "blocker" | "warning";
  message: string;
  fix: string;
};

export type ShipmentState = {
  shipment_id: string;
  status: ShipmentStatus;
  supplier: string;
  buyer: string;
  commodity: string;
  origin: string;
  quantity_kg: number;
  production_date?: string;
  evidence_text: string;
  extracted: Record<string, unknown>;
  plots: { lat?: number; lon?: number; area_ha?: number }[];
  findings: Finding[];
  risk: { score: number; level: string; human_review_required: boolean };
  remediation: { rule: string; message: string }[];
  pack?: Record<string, unknown>;
  wallet_id?: string;
  paid: boolean;
  price_eur: number;
  audit: { at: string; agent: string; note: string }[];
  model_versions: Record<string, string>;
  created_at: string;
  updated_at: string;
};
