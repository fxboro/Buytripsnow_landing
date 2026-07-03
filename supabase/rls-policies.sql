-- ═══════════════════════════════════════════════════════════════
-- BuyTripsNow — Row Level Security (RLS) Policies
-- ═══════════════════════════════════════════════════════════════
-- Run this AFTER schema.sql in the Supabase SQL Editor.
--
-- Security Model:
--   • Anonymous (public) users can INSERT leads (form submissions)
--   • Authenticated users (concierges) can read/update all CRM data
--   • Service role bypasses all RLS (used by server-side API routes)
-- ═══════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────
-- Enable RLS on all tables
-- ────────────────────────────────────────────────

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE concierges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────
-- TABLE: leads
-- ────────────────────────────────────────────────

-- Public (anonymous) users can submit leads via the form
CREATE POLICY "leads_anon_insert"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated concierges can view all leads
CREATE POLICY "leads_auth_select"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated concierges can update lead status, assignment, etc.
CREATE POLICY "leads_auth_update"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────
-- TABLE: concierges
-- ────────────────────────────────────────────────

-- Authenticated users can view the concierge roster
CREATE POLICY "concierges_auth_select"
  ON concierges
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete concierges
-- (No additional policies needed — service role bypasses RLS)


-- ────────────────────────────────────────────────
-- TABLE: quotes
-- ────────────────────────────────────────────────

-- Public users can insert quotes (generated during form interaction)
CREATE POLICY "quotes_anon_insert"
  ON quotes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated concierges can view all quotes
CREATE POLICY "quotes_auth_select"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated concierges can update quotes (mark as final, etc.)
CREATE POLICY "quotes_auth_update"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────
-- TABLE: activity_log
-- ────────────────────────────────────────────────

-- Only authenticated concierges can view the activity log
CREATE POLICY "activity_auth_select"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (true);

-- System and concierges can insert log entries
-- (inserts go through API routes using the service role key)
CREATE POLICY "activity_anon_insert"
  ON activity_log
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "activity_auth_insert"
  ON activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
