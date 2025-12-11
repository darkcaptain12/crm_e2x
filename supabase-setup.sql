-- CRM_E2X Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create crm_leads table
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firma TEXT NOT NULL,
  telefon TEXT NOT NULL,
  sektor TEXT,
  kaynak TEXT,
  status TEXT NOT NULL DEFAULT 'Yeni' CHECK (status IN ('Yeni', 'Arandı', 'Teklif', 'Kazanıldı')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crm_customers table
CREATE TABLE IF NOT EXISTS crm_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firma TEXT NOT NULL,
  telefon TEXT NOT NULL,
  sektor TEXT,
  hizmet TEXT,
  odeme_durumu TEXT DEFAULT 'Beklemede',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crm_offers table
CREATE TABLE IF NOT EXISTS crm_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  teklif_tutar DECIMAL(10, 2),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crm_notes table
CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  related_type TEXT CHECK (related_type IN ('lead', 'customer')),
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated users can access
CREATE POLICY "Authenticated users can view leads"
  ON crm_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON crm_leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
  ON crm_leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leads"
  ON crm_leads FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view customers"
  ON crm_customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON crm_customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON crm_customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON crm_customers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view offers"
  ON crm_offers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert offers"
  ON crm_offers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update offers"
  ON crm_offers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete offers"
  ON crm_offers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view notes"
  ON crm_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert notes"
  ON crm_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notes"
  ON crm_notes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete notes"
  ON crm_notes FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON crm_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON crm_customers(created_at);
CREATE INDEX IF NOT EXISTS idx_offers_lead_id ON crm_offers(lead_id);
CREATE INDEX IF NOT EXISTS idx_offers_customer_id ON crm_offers(customer_id);
CREATE INDEX IF NOT EXISTS idx_notes_related ON crm_notes(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_notes_due_date ON crm_notes(due_date);
