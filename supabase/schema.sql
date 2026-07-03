-- ═══════════════════════════════════════════════════════════════
-- BuyTripsNow — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- or via the Supabase CLI:  supabase db push
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────
-- 1. CUSTOM ENUM TYPES
-- ────────────────────────────────────────────────

CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'itinerary_sent',
  'negotiating',
  'booked',
  'completed',
  'cancelled'
);

CREATE TYPE package_name AS ENUM (
  'bavaria_fairy_tales',
  'theme_parks_cities',
  'nature_discovery'
);

CREATE TYPE flight_class AS ENUM (
  'economy',
  'premium_economy',
  'business'
);

CREATE TYPE hotel_preference AS ENUM (
  '4_star_luxury',
  '5_star_deluxe',
  'boutique_design',
  'castle_heritage',
  'family_resort',
  'no_preference'
);

CREATE TYPE contact_preference AS ENUM (
  'email',
  'whatsapp',
  'phone',
  'video_call'
);

CREATE TYPE activity_action AS ENUM (
  'lead_created',
  'lead_assigned',
  'status_changed',
  'quote_generated',
  'itinerary_sent',
  'note_added',
  'email_sent',
  'payment_received'
);


-- ────────────────────────────────────────────────
-- 2. EXTENSIONS
-- ────────────────────────────────────────────────

-- UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────
-- 3. TABLE: concierges
-- ────────────────────────────────────────────────
-- Created FIRST because `leads` references it via FK.

CREATE TABLE concierges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  slack_id        TEXT,
  max_capacity    INT NOT NULL DEFAULT 20,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE concierges IS 'Concierge team roster — each concierge can be assigned leads';
COMMENT ON COLUMN concierges.specializations IS 'Array of tags: e.g. germany-family, corporate, honeymoon';
COMMENT ON COLUMN concierges.max_capacity IS 'Max active leads this concierge can handle simultaneously';


-- ────────────────────────────────────────────────
-- 4. TABLE: leads
-- ────────────────────────────────────────────────

CREATE TABLE leads (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Step 1: Contact details
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  country               TEXT,
  how_heard             TEXT,

  -- Step 2: Trip details
  selected_package      package_name NOT NULL,
  num_adults            INT NOT NULL DEFAULT 1 CHECK (num_adults >= 1 AND num_adults <= 10),
  num_children          INT NOT NULL DEFAULT 0 CHECK (num_children >= 0 AND num_children <= 10),
  dep_date              DATE NOT NULL,
  dep_city              TEXT,
  budget                TEXT,

  -- Step 3: Preferences
  hotel_pref            hotel_preference DEFAULT 'no_preference',
  flight_class          flight_class NOT NULL DEFAULT 'economy',
  diet_req              TEXT,
  special_req           TEXT,
  prev_exp              TEXT,
  contact_pref          contact_preference NOT NULL DEFAULT 'email',
  marketing_consent     BOOLEAN NOT NULL DEFAULT false,

  -- Internal CRM fields
  status                lead_status NOT NULL DEFAULT 'new',
  assigned_concierge_id UUID REFERENCES concierges(id) ON DELETE SET NULL,
  source                TEXT NOT NULL DEFAULT 'Germany 2026 Landing Page',

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update `updated_at` on every row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common CRM queries
CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_assigned ON leads (assigned_concierge_id);
CREATE INDEX idx_leads_created ON leads (created_at DESC);
CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_package ON leads (selected_package);

COMMENT ON TABLE leads IS 'Core lead storage — every form submission creates a row here';
COMMENT ON COLUMN leads.budget IS 'Free-text budget range from the form, e.g. "€5,000–€10,000"';
COMMENT ON COLUMN leads.source IS 'Attribution: which landing page or campaign generated this lead';


-- ────────────────────────────────────────────────
-- 5. TABLE: quotes
-- ────────────────────────────────────────────────

CREATE TABLE quotes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id           UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  package_name      package_name NOT NULL,
  base_price_adult  INT NOT NULL,           -- in EUR cents
  base_price_child  INT NOT NULL,           -- in EUR cents
  num_adults        INT NOT NULL DEFAULT 1,
  num_children      INT NOT NULL DEFAULT 0,
  upgrades_json     JSONB NOT NULL DEFAULT '[]',
  total_estimate    INT NOT NULL,           -- in EUR cents
  currency          TEXT NOT NULL DEFAULT 'EUR',
  is_final          BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_lead ON quotes (lead_id);
CREATE INDEX idx_quotes_created ON quotes (created_at DESC);

COMMENT ON TABLE quotes IS 'Dynamic price quotes — multiple quotes can exist per lead as they adjust preferences';
COMMENT ON COLUMN quotes.base_price_adult IS 'Price per adult in EUR cents (e.g., 255700 = €2,557.00)';
COMMENT ON COLUMN quotes.upgrades_json IS 'Array of { label, amount } objects for flight/hotel upgrades';
COMMENT ON COLUMN quotes.is_final IS 'True when the concierge has confirmed the price and the client accepts';


-- ────────────────────────────────────────────────
-- 6. TABLE: activity_log
-- ────────────────────────────────────────────────

CREATE TABLE activity_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  action          activity_action NOT NULL,
  performed_by    TEXT,                     -- concierge name or 'system'
  notes           TEXT,
  metadata_json   JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_lead ON activity_log (lead_id);
CREATE INDEX idx_activity_action ON activity_log (action);
CREATE INDEX idx_activity_created ON activity_log (created_at DESC);

COMMENT ON TABLE activity_log IS 'Audit trail — every significant action on a lead is logged here';
COMMENT ON COLUMN activity_log.metadata_json IS 'Arbitrary context, e.g. { "old_status": "new", "new_status": "contacted" }';


-- ═══════════════════════════════════════════════════════════════
-- SEED DATA: Initial concierge team
-- ═══════════════════════════════════════════════════════════════

INSERT INTO concierges (name, email, specializations) VALUES
  ('Chima', 'chima@buytripsnow.com', ARRAY['germany-family', 'corporate', 'honeymoon']),
  ('Support Team', 'support@buytripsnow.com', ARRAY['germany-family', 'nature', 'adventure']);
