-- Afritrace EUDR core schema (PostgreSQL + PostGIS)
-- Enable: CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('eu_buyer','supplier','afritrace_admin')),
  country TEXT,
  vat_number TEXT,
  eudr_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  legal_name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  tax_id TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  certifications TEXT[] DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  supplier_id UUID REFERENCES suppliers(id),
  reference TEXT UNIQUE NOT NULL,
  commodity TEXT NOT NULL,
  product_description TEXT,
  hs_code TEXT,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL DEFAULT 'kg',
  status TEXT NOT NULL DEFAULT 'draft',
  risk_status TEXT,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id),
  supplier_id UUID REFERENCES suppliers(id),
  name TEXT,
  country TEXT,
  geom geometry(Geometry, 4326),
  area_hectares NUMERIC,
  production_start_date DATE,
  production_end_date DATE,
  validation_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plots_geom_idx ON plots USING GIST (geom);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id),
  supplier_id UUID REFERENCES suppliers(id),
  type TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_hash TEXT,
  extracted_json JSONB,
  ai_confidence NUMERIC,
  verification_status TEXT DEFAULT 'needs_review',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id),
  score INT,
  level TEXT,
  findings JSONB,
  human_review_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id),
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  json_url TEXT,
  dds_payload JSONB,
  audit_hash TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  actor_id UUID,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  payload JSONB,
  prompt_hash TEXT,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipments_tenant_idx ON shipments(tenant_id);
CREATE INDEX IF NOT EXISTS shipments_status_idx ON shipments(status);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_events(entity_type, entity_id);
