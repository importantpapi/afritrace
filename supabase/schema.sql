-- ============================================================
-- CBAM + Multi-Agent Compliance Platform Schema
-- Supabase / PostgreSQL + PostGIS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    registration_number TEXT,
    country TEXT NOT NULL,
    region TEXT,
    product_types TEXT[] NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','verified','flagged','rejected','active')),
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size_bytes BIGINT,
    period_start DATE,
    period_end DATE,
    ocr_text TEXT,
    parsed_json JSONB,
    processing_status TEXT DEFAULT 'uploaded',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE emissions_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    electricity_kwh NUMERIC(18,4) DEFAULT 0,
    natural_gas_m3 NUMERIC(18,4) DEFAULT 0,
    coal_tonnes NUMERIC(18,4) DEFAULT 0,
    diesel_liters NUMERIC(18,4) DEFAULT 0,
    production_tonnes NUMERIC(18,4) NOT NULL,
    product_type TEXT NOT NULL,
    total_emissions_tco2e NUMERIC(18,6) DEFAULT 0,
    embedded_emissions_tco2e_per_tonne NUMERIC(18,6),
    cbam_liability_eur NUMERIC(18,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(supplier_id, period_year, period_month, product_type)
);

CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id),
    farmer_name TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    polygon GEOMETRY(Polygon, 4326),
    area_hectares NUMERIC(12,4),
    deforestation_risk_score NUMERIC(5,2),
    forest_loss_pct NUMERIC(6,3),
    compliance_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE battery_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battery_id TEXT UNIQUE NOT NULL,
    manufacturer_id UUID,
    mineral_origin JSONB,
    carbon_footprint_kg_co2e_per_kwh NUMERIC(12,4),
    recycled_content_percent NUMERIC(5,2),
    due_diligence JSONB,
    dpp_json JSONB,
    public_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
    recommendation TEXT CHECK (recommendation IN ('approve','reject','flag_for_review')),
    factors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    country TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    supplier_id UUID REFERENCES suppliers(id),
    product_type TEXT NOT NULL,
    quantity_tonnes NUMERIC(18,4),
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE escrow_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES buyers(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    amount_eur NUMERIC(18,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
