# Edge Marketplace Supabase Schema

This document outlines the Supabase schema for the multi-tenant marketplace platform.

```sql
-- Enums
CREATE TYPE commerce_mode AS ENUM ('catalog', 'quote', 'checkout', 'booking', 'digital');
CREATE TYPE template_family AS ENUM ('retail-core', 'service-pro', 'food-catering', 'artisan-market', 'event-floral');
CREATE TYPE deployment_status AS ENUM ('pending', 'building', 'live', 'failed');

-- Marketplaces (Multi-tenant root)
CREATE TABLE marketplaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  template_family template_family NOT NULL,
  commerce_mode commerce_mode NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Intakes
-- Stores the original AI intake answers
CREATE TABLE marketplace_intakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_id UUID REFERENCES marketplaces(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  offerings TEXT,
  target_audience TEXT,
  brand_vibe TEXT,
  raw_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Deployments
-- CI/CD state and Puck JSON persistence
CREATE TABLE marketplace_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_id UUID REFERENCES marketplaces(id) ON DELETE CASCADE,
  status deployment_status DEFAULT 'pending',
  puck_payload JSONB NOT NULL,
  root_props JSONB NOT NULL,
  preview_url VARCHAR(255),
  live_url VARCHAR(255),
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Client Stores
-- General configurations, SEO, theme overrides (synced with EdgeRootProps)
CREATE TABLE marketplace_client_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_id UUID UNIQUE REFERENCES marketplaces(id) ON DELETE CASCADE,
  primary_color VARCHAR(50),
  font_family VARCHAR(100),
  border_radius VARCHAR(20),
  meta_title VARCHAR(255),
  meta_description TEXT,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Products
-- Universal product table supporting all commerce modes
CREATE TABLE marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_id UUID REFERENCES marketplaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  metadata JSONB, -- For custom attributes per template
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Custom Order Requests
-- Handles 'quote' and 'booking' leads
CREATE TABLE marketplace_custom_order_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_id UUID REFERENCES marketplaces(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  details TEXT,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'unseen',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies Example
ALTER TABLE marketplaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only manage their own marketplaces" 
ON marketplaces FOR ALL USING (auth.uid() = owner_id);
-- Repeat for other tables based on marketplace_id -> owner_id
```
