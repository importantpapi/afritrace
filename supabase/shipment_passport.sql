-- Afritrace Shipment Passport OS schema
-- States: draft → data_collected → gaps_found → corrective_actions → gaps_closed → risk_assessed → dds_ready → dds_submitted → shipped → delivered → reorder_proposed

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

create table if not exists public.shipment_passports (
  id uuid primary key default uuid_generate_v4(),
  shipment_id text unique not null,
  buyer_org_id uuid,
  supplier_id uuid,
  product text not null,
  quantity numeric,
  unit text default 'tonnes',
  origin_country text not null,
  state text not null default 'draft',
  plots jsonb default '[]',
  documents jsonb default '[]',
  risk_assessment jsonb default '{}',
  gaps jsonb default '[]',
  logistics jsonb default '{}',
  dds_status text default 'draft',
  dds_reference text,
  trust_score int,
  reorder_status text default 'none',
  pack jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid references public.shipment_passports(id) on delete cascade,
  actor_type text not null,
  actor_role text,
  action text not null,
  detail jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists public.mission_events (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid references public.shipment_passports(id) on delete cascade,
  role text not null,
  message text not null,
  meta jsonb default '{}',
  created_at timestamptz default now()
);
