-- Migration: Add durum, next_action_date, last_contacted_at to crm_leads
-- Run this SQL in your Supabase SQL Editor

-- Add durum column if it doesn't exist (migrate from status if needed)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_leads' AND column_name = 'durum') THEN
    ALTER TABLE crm_leads ADD COLUMN durum TEXT DEFAULT 'Yeni';
    
    -- Migrate existing status values to durum
    UPDATE crm_leads SET durum = status WHERE status IS NOT NULL;
    
    -- Update CHECK constraint for durum
    ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS crm_leads_status_check;
    ALTER TABLE crm_leads ADD CONSTRAINT crm_leads_durum_check 
      CHECK (durum IN ('Yeni', 'Arandı', 'Teklif Gönderildi', 'Satış Oldu', 'Ulaşılamadı'));
  END IF;
END $$;

-- Add next_action_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_leads' AND column_name = 'next_action_date') THEN
    ALTER TABLE crm_leads ADD COLUMN next_action_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add last_contacted_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'crm_leads' AND column_name = 'last_contacted_at') THEN
    ALTER TABLE crm_leads ADD COLUMN last_contacted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index for next_action_date for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON crm_leads(next_action_date);

-- Create index for durum
CREATE INDEX IF NOT EXISTS idx_leads_durum ON crm_leads(durum);
