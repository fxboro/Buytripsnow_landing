-- ═══════════════════════════════════════════════════════════════
-- BuyTripsNow — Phase 3 Database Schema Migrations
-- ═══════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────
-- 1. TABLE: itinerary_days
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS itinerary_days (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id             UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  day_number          INT NOT NULL,
  title               TEXT NOT NULL,
  hotel               TEXT,
  morning_activity    TEXT,
  afternoon_activity  TEXT,
  evening_activity    TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id, day_number)
);

-- Indexing for fast day-by-day lookup per lead
CREATE INDEX IF NOT EXISTS idx_itinerary_days_lead ON itinerary_days (lead_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_seq ON itinerary_days (lead_id, day_number ASC);

-- Add column update trigger for updated_at column
CREATE TRIGGER itinerary_days_updated_at
  BEFORE UPDATE ON itinerary_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────
-- 2. RLS POLICIES FOR ITINERARIES
-- ────────────────────────────────────────────────

-- Clients access the itinerary page via secure UUID tokens
-- (anyone with the URL can select the itinerary)
CREATE POLICY "itinerary_anon_select"
  ON itinerary_days
  FOR SELECT
  TO anon
  USING (true);

-- Clients can edit the notes or activities directly on the portal page
CREATE POLICY "itinerary_anon_update"
  ON itinerary_days
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Concierges have full CRUD rights
CREATE POLICY "itinerary_auth_all"
  ON itinerary_days
  FOR ALL
  TO authenticated
  USING (true);


-- ────────────────────────────────────────────────
-- 3. EXTRA CRM COLUMNS ON LEADS TABLE
-- ────────────────────────────────────────────────

ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS amount_paid_cents INT DEFAULT 0;

COMMENT ON COLUMN leads.stripe_customer_id IS 'Associated customer reference generated in Stripe';
COMMENT ON COLUMN leads.stripe_session_id IS 'Latest Stripe checkout session tracking ID';
COMMENT ON COLUMN leads.amount_paid_cents IS 'Deposit or full payment amount confirmed by webhook';
