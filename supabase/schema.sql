create table if not exists marketplaces (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_name text not null,
  business_type text not null,
  offerings text,
  primary_goal text,
  tone text,
  contact_email text not null,
  contact_phone text,
  service_area text,
  brand_color text,
  inventory_method text,
  inventory_raw_content text,
  inventory_file_name text,
  plan text default 'launch',
  status text default 'draft',
  owner_token_hash text not null,
  draft_snapshot jsonb,
  deployment_state jsonb
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  marketplace_id uuid not null references marketplaces(id) on delete cascade,
  name text not null,
  price numeric,
  description text,
  category text
);

create table if not exists checkout_intents (
  id uuid primary key,
  site_id uuid not null references marketplaces(id) on delete cascade,
  customer_name text not null,
  email text not null,
  phone text,
  product_interest text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists deployments (
  site_id uuid primary key references marketplaces(id) on delete cascade,
  deployment_id uuid not null unique,
  status text not null check (status in (
    'draft',
    'editing',
    'inventory',
    'launch_ready',
    'deploy_requested',
    'provisioning',
    'syncing_inventory',
    'storefront_building',
    'dns_pending',
    'live',
    'failed'
  )),
  plan text not null,
  idempotency_key text not null,
  attempt_count integer not null default 1,
  requested_at timestamptz not null,
  updated_at timestamptz not null default now(),
  deployed_at timestamptz,
  publish_url text,
  message text,
  medusa_sync jsonb,
  failure_stage text,
  failure_reason text,
  provisioning_id text,
  vercel_deployment_id text,
  history jsonb not null default '[]'::jsonb
);
