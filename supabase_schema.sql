-- SQL Schema for Supabase Integration

-- Create Marketplaces Table
create table public.marketplaces (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
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
    plan text default 'launch'
);

-- Create Inventory Items Table
create table public.inventory_items (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    marketplace_id uuid references public.marketplaces(id) on delete cascade not null,
    name text not null,
    price decimal,
    description text,
    category text
);

-- Enable RLS (Optional, but recommended)
alter table public.marketplaces enable row level security;
alter table public.inventory_items enable row level security;

-- Create Policies (Allow anonymous access for this specific project example)
create policy "Allow public insert for anonymous" on marketplaces for insert with check (true);
create policy "Allow public select for anonymous" on marketplaces for select using (true);
create policy "Allow public insert for anonymous" on inventory_items for insert with check (true);
create policy "Allow public select for anonymous" on inventory_items for select using (true);
