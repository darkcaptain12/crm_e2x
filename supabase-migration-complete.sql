-- Complete Migration for CRM_E2X Production Improvements
-- Run this SQL in your Supabase SQL Editor after running supabase-setup.sql and supabase-migration-leads.sql

-- ============================================
-- 1. Fix crm_offers table structure
-- ============================================
-- The code uses 'musteri_id' but setup.sql has 'customer_id'
-- Add musteri_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_offers' AND column_name = 'musteri_id') THEN
    -- If customer_id exists, migrate data and rename
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'crm_offers' AND column_name = 'customer_id') THEN
      ALTER TABLE crm_offers ADD COLUMN musteri_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE;
      UPDATE crm_offers SET musteri_id = customer_id WHERE customer_id IS NOT NULL;
      ALTER TABLE crm_offers DROP COLUMN customer_id;
    ELSE
      ALTER TABLE crm_offers ADD COLUMN musteri_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Add other missing columns for offers
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_offers' AND column_name = 'hizmet') THEN
    ALTER TABLE crm_offers ADD COLUMN hizmet TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_offers' AND column_name = 'tutar') THEN
    ALTER TABLE crm_offers ADD COLUMN tutar DECIMAL(10, 2);
    -- Migrate from teklif_tutar if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'crm_offers' AND column_name = 'teklif_tutar') THEN
      UPDATE crm_offers SET tutar = teklif_tutar WHERE tutar IS NULL;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_offers' AND column_name = 'para_birimi') THEN
    ALTER TABLE crm_offers ADD COLUMN para_birimi TEXT DEFAULT 'TL';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_offers' AND column_name = 'durum') THEN
    ALTER TABLE crm_offers ADD COLUMN durum TEXT DEFAULT 'Beklemede';
    -- Migrate from status if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'crm_offers' AND column_name = 'status') THEN
      UPDATE crm_offers SET durum = status WHERE durum IS NULL;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_offers' AND column_name = 'not') THEN
    ALTER TABLE crm_offers ADD COLUMN not TEXT;
  END IF;
END $$;

-- ============================================
-- 2. Add missing columns to crm_leads
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_leads' AND column_name = 'sehir') THEN
    ALTER TABLE crm_leads ADD COLUMN sehir TEXT;
  END IF;
END $$;

-- ============================================
-- 3. Add missing columns to crm_customers
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_customers' AND column_name = 'sehir') THEN
    ALTER TABLE crm_customers ADD COLUMN sehir TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_customers' AND column_name = 'iletisim_kisi') THEN
    ALTER TABLE crm_customers ADD COLUMN iletisim_kisi TEXT;
  END IF;
END $$;

-- ============================================
-- 4. Add missing columns to crm_notes
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_notes' AND column_name = 'category') THEN
    ALTER TABLE crm_notes ADD COLUMN category TEXT;
  END IF;
END $$;

-- ============================================
-- 5. Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_offers_musteri_id ON crm_offers(musteri_id);
CREATE INDEX IF NOT EXISTS idx_offers_durum ON crm_offers(durum);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON crm_offers(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_sehir ON crm_leads(sehir);
CREATE INDEX IF NOT EXISTS idx_leads_sektor ON crm_leads(sektor);
CREATE INDEX IF NOT EXISTS idx_customers_sehir ON crm_customers(sehir);
CREATE INDEX IF NOT EXISTS idx_customers_sektor ON crm_customers(sektor);

-- ============================================
-- 6. Verify RLS Policies (they should already exist from setup.sql)
-- ============================================
-- RLS is already enabled and policies exist for all tables
-- If you need to recreate policies, uncomment below:

-- DROP POLICY IF EXISTS "Authenticated users can view offers" ON crm_offers;
-- DROP POLICY IF EXISTS "Authenticated users can insert offers" ON crm_offers;
-- DROP POLICY IF EXISTS "Authenticated users can update offers" ON crm_offers;
-- DROP POLICY IF EXISTS "Authenticated users can delete offers" ON crm_offers;

-- CREATE POLICY "Authenticated users can view offers"
--   ON crm_offers FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Authenticated users can insert offers"
--   ON crm_offers FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- CREATE POLICY "Authenticated users can update offers"
--   ON crm_offers FOR UPDATE
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Authenticated users can delete offers"
--   ON crm_offers FOR DELETE
--   TO authenticated
--   USING (true);

-- ============================================
-- 7. Notes for future multi-user support
-- ============================================
-- If you want to add multi-user support later, add user_id columns:
-- ALTER TABLE crm_leads ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- ALTER TABLE crm_customers ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- ALTER TABLE crm_offers ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- ALTER TABLE crm_notes ADD COLUMN user_id UUID REFERENCES auth.users(id);
--
-- Then update RLS policies to filter by user_id:
-- CREATE POLICY "Users can only see their own leads"
--   ON crm_leads FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);
