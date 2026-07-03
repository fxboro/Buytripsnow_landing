/**
 * BuyTripsNow — Supabase Database Types
 *
 * These types mirror the schema defined in /supabase/schema.sql.
 * Keep them in sync whenever you modify the database schema.
 */

/* ═══════════════════════════════════════════════
   ENUMS
═══════════════════════════════════════════════ */

/** Lead lifecycle stages visible in the CRM dashboard */
export type LeadStatus =
  | "new"
  | "contacted"
  | "itinerary_sent"
  | "negotiating"
  | "booked"
  | "completed"
  | "cancelled";

/** Travel package identifiers */
export type PackageName =
  | "bavaria_fairy_tales"
  | "theme_parks_cities"
  | "nature_discovery";

/** Flight class tiers (economy is included in base price) */
export type FlightClass =
  | "economy"
  | "premium_economy"
  | "business";

/** Hotel preference tiers */
export type HotelPreference =
  | "4_star_luxury"
  | "5_star_deluxe"
  | "boutique_design"
  | "castle_heritage"
  | "family_resort"
  | "no_preference";

/** How the user prefers to be contacted */
export type ContactPreference =
  | "email"
  | "whatsapp"
  | "phone"
  | "video_call";

/* ═══════════════════════════════════════════════
   TABLE: leads
═══════════════════════════════════════════════ */

/** A row in the `leads` table */
export interface Lead {
  id: string; // uuid, PK
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string | null;
  how_heard: string | null;
  selected_package: PackageName;
  num_adults: number;
  num_children: number;
  dep_date: string; // ISO date string (YYYY-MM-DD)
  dep_city: string | null;
  budget: string | null;
  hotel_pref: HotelPreference | null;
  flight_class: FlightClass;
  diet_req: string | null;
  special_req: string | null;
  prev_exp: string | null;
  contact_pref: ContactPreference;
  marketing_consent: boolean;
  status: LeadStatus;
  assigned_concierge_id: string | null; // FK → concierges.id
  source: string; // e.g. "Germany 2026 Landing Page"
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/** Payload for inserting a new lead (omit server-generated fields) */
export type LeadInsert = Omit<Lead, "id" | "status" | "assigned_concierge_id" | "created_at" | "updated_at">;

/** Payload for updating an existing lead */
export type LeadUpdate = Partial<Omit<Lead, "id" | "created_at">>;

/* ═══════════════════════════════════════════════
   TABLE: concierges
═══════════════════════════════════════════════ */

/** A row in the `concierges` table */
export interface Concierge {
  id: string; // uuid, PK
  name: string;
  email: string;
  slack_id: string | null;
  max_capacity: number;
  specializations: string[]; // e.g. ["germany-family", "corporate"]
  is_active: boolean;
  created_at: string;
}

/** Payload for inserting a new concierge */
export type ConciergeInsert = Omit<Concierge, "id" | "created_at">;

/* ═══════════════════════════════════════════════
   TABLE: quotes
═══════════════════════════════════════════════ */

/** A line item in the quote breakdown */
export interface QuoteLineItem {
  label: string; // e.g. "2 Adults × €2,990"
  amount: number; // in cents (EUR)
}

/** A row in the `quotes` table */
export interface Quote {
  id: string; // uuid, PK
  lead_id: string; // FK → leads.id
  package_name: PackageName;
  base_price_adult: number; // cents
  base_price_child: number; // cents
  num_adults: number;
  num_children: number;
  upgrades_json: QuoteLineItem[]; // stored as JSONB
  total_estimate: number; // cents
  currency: string; // ISO 4217, default "EUR"
  is_final: boolean;
  created_at: string;
}

/** Payload for inserting a new quote */
export type QuoteInsert = Omit<Quote, "id" | "created_at">;

/* ═══════════════════════════════════════════════
   TABLE: activity_log
═══════════════════════════════════════════════ */

/** Valid actions tracked in the activity log */
export type ActivityAction =
  | "lead_created"
  | "lead_assigned"
  | "status_changed"
  | "quote_generated"
  | "itinerary_sent"
  | "note_added"
  | "email_sent"
  | "payment_received";

/** A row in the `activity_log` table */
export interface ActivityLog {
  id: string; // uuid, PK
  lead_id: string; // FK → leads.id
  action: ActivityAction;
  performed_by: string | null; // concierge name or "system"
  notes: string | null;
  metadata_json: Record<string, unknown> | null; // arbitrary context
  created_at: string;
}

/** Payload for inserting a new activity log entry */
export type ActivityLogInsert = Omit<ActivityLog, "id" | "created_at">;

/* ═══════════════════════════════════════════════
   PACKAGE PRICING CONSTANTS
   Used by the dynamic quote estimator (2.4)
═══════════════════════════════════════════════ */

export interface PackagePricing {
  name: PackageName;
  displayName: string;
  adultPrice: number; // EUR cents
  childPrice: number; // EUR cents
}

/** Base pricing for all three Germany 2026 packages (in EUR cents) */
export const PACKAGE_PRICING: Record<PackageName, PackagePricing> = {
  bavaria_fairy_tales: {
    name: "bavaria_fairy_tales",
    displayName: "Bavaria & Fairy Tales",
    adultPrice: 255700,
    childPrice: 108000,
  },
  theme_parks_cities: {
    name: "theme_parks_cities",
    displayName: "Theme Parks & Cities",
    adultPrice: 299000,
    childPrice: 119500,
  },
  nature_discovery: {
    name: "nature_discovery",
    displayName: "Nature & Discovery",
    adultPrice: 277200,
    childPrice: 106100,
  },
};

/** Upgrade pricing tiers (in EUR cents) */
export const UPGRADE_PRICING = {
  flight_class: {
    economy: 0,
    premium_economy: 45000, // €450 per person
    business: 150000, // €1,500 per person
  },
  hotel_pref: {
    no_preference: 0,
    "4_star_luxury": 0, // included in base
    "5_star_deluxe": 85000, // €850 per room per trip
    boutique_design: 55000, // €550 per room per trip
    castle_heritage: 120000, // €1,200 per room per trip
    family_resort: 35000, // €350 per room per trip
  },
} as const;
