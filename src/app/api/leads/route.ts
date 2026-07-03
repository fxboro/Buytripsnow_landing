import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { sendSlackLeadNotification } from "@/lib/notifications";
import {
  PackageName,
  FlightClass,
  HotelPreference,
  ContactPreference,
  LeadInsert,
  PACKAGE_PRICING,
  UPGRADE_PRICING,
} from "@/types/database";

// Normalization Helpers
function normalizePackage(pkg: string): PackageName {
  const p = pkg.toLowerCase();
  if (p.includes("bavaria") || p.includes("fairy")) return "bavaria_fairy_tales";
  if (p.includes("theme") || p.includes("park") || p.includes("cities")) return "theme_parks_cities";
  return "nature_discovery";
}

function normalizeFlightClass(fc: string): FlightClass {
  const f = fc.toLowerCase();
  if (f.includes("premium")) return "premium_economy";
  if (f.includes("business")) return "business";
  return "economy";
}

function normalizeHotelPref(hp: string): HotelPreference {
  const h = hp.toLowerCase();
  if (h.includes("5-star") || h.includes("five")) return "5_star_deluxe";
  if (h.includes("4-star") || h.includes("four")) return "4_star_luxury";
  if (h.includes("boutique") || h.includes("design")) return "boutique_design";
  if (h.includes("castle") || h.includes("heritage")) return "castle_heritage";
  if (h.includes("family") || h.includes("resort")) return "family_resort";
  return "no_preference";
}

function normalizeContactPref(cp: string): ContactPreference {
  const c = cp.toLowerCase();
  if (c.includes("whatsapp")) return "whatsapp";
  if (c.includes("phone")) return "phone";
  if (c.includes("video")) return "video_call";
  return "email";
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * POST /api/leads
 *
 * Receives the enquiry payload, validates fields, assigns a concierge (auto-routing),
 * inserts the lead, generates & saves the initial quote, records activity logs,
 * and alerts the concierge via Slack.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      howHeard,
      selectedPkg,
      numAdults,
      numChildren,
      depDate,
      depCity,
      budget,
      hotelPref,
      flightClass,
      dietReq,
      specialReq,
      prevExp,
      contactPref,
      marketing,
      source,
    } = body;

    // 1. Validation Check
    if (!firstName || !lastName || !email || !phone || !selectedPkg || !depDate) {
      return NextResponse.json(
        { error: "Missing required fields (firstName, lastName, email, phone, selectedPkg, depDate)" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    const adults = Math.max(1, parseInt(String(numAdults || 1), 10));
    const children = Math.max(0, parseInt(String(numChildren || 0), 10));

    // Normalize values
    const pkgEnum = normalizePackage(selectedPkg);
    const flightEnum = normalizeFlightClass(flightClass || "");
    const hotelEnum = normalizeHotelPref(hotelPref || "");
    const contactEnum = normalizeContactPref(contactPref || "");

    const supabase = createServerClient();

    // 2. Automated Lead Routing (2.6)
    let assignedConciergeId: string | null = null;
    let assignedConciergeName = "Support Team";
    let assignedConciergeEmail = "support@buytripsnow.com";

    // Get active concierges
    const { data: concierges, error: cErr } = await supabase
      .from("concierges")
      .select("id, name, email")
      .eq("is_active", true);

    if (cErr) {
      console.error("Error fetching concierges:", cErr);
    }

    if (concierges && concierges.length > 0) {
      // Fetch active lead counts (status not in completed, cancelled)
      const { data: activeLeads, error: lErr } = await supabase
        .from("leads")
        .select("assigned_concierge_id")
        .not("status", "in", '("completed","cancelled")');

      if (lErr) {
        console.error("Error fetching active leads for routing:", lErr);
      }

      // Compute frequency map
      const counts: Record<string, number> = {};
      concierges.forEach((c) => {
        counts[c.id] = 0;
      });

      if (activeLeads) {
        activeLeads.forEach((lead) => {
          if (lead.assigned_concierge_id && lead.assigned_concierge_id in counts) {
            counts[lead.assigned_concierge_id]++;
          }
        });
      }

      // Route to concierge with fewest active leads
      let bestConcierge = concierges[0];
      let minCount = counts[bestConcierge.id];

      for (const c of concierges) {
        if (counts[c.id] < minCount) {
          minCount = counts[c.id];
          bestConcierge = c;
        }
      }

      assignedConciergeId = bestConcierge.id;
      assignedConciergeName = bestConcierge.name;
      assignedConciergeEmail = bestConcierge.email;
    }

    // 3. Database Insertion (Leads Table)
    const leadPayload: LeadInsert = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      country: country || null,
      how_heard: howHeard || null,
      selected_package: pkgEnum,
      num_adults: adults,
      num_children: children,
      dep_date: depDate,
      dep_city: depCity || null,
      budget: budget || null,
      hotel_pref: hotelEnum,
      flight_class: flightEnum,
      diet_req: dietReq || null,
      special_req: specialReq || null,
      prev_exp: prevExp || null,
      contact_pref: contactEnum,
      marketing_consent: marketing === "Yes" || marketing === true,
      source: source || "Germany 2026 Landing Page",
    };

    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert([leadPayload])
      .select("id")
      .single();

    if (insertError || !lead) {
      console.error("Error inserting lead:", insertError);
      return NextResponse.json(
        { error: `Database lead insertion failed: ${insertError?.message || "unknown"}` },
        { status: 500 }
      );
    }

    const leadId = lead.id;

    // 4. Initial Quote Generation & Insertion
    const pricing = PACKAGE_PRICING[pkgEnum];
    const totalPax = adults + children;
    const upgradesJson: Array<{ label: string; amount: number }> = [];

    // Calculate quote breakdown
    const baseAdultCost = pricing.adultPrice * adults;
    let baseChildCost = 0;
    if (children > 0) {
      baseChildCost = pricing.childPrice * children;
    }

    const flightUpgradeUnit = UPGRADE_PRICING.flight_class[flightEnum];
    let flightUpgradeCost = 0;
    if (flightUpgradeUnit > 0) {
      flightUpgradeCost = flightUpgradeUnit * totalPax;
      upgradesJson.push({
        label: `${flightEnum === "business" ? "Business Class Upgrade" : "Premium Economy Upgrade"} (${totalPax} pax)`,
        amount: flightUpgradeCost,
      });
    }

    const hotelUpgradeCost = UPGRADE_PRICING.hotel_pref[hotelEnum];
    if (hotelUpgradeCost > 0) {
      upgradesJson.push({
        label: `${hotelEnum.replace(/_/g, " ")} upgrade`,
        amount: hotelUpgradeCost,
      });
    }

    const totalEstimate = baseAdultCost + baseChildCost + flightUpgradeCost + hotelUpgradeCost;

    const { error: quoteError } = await supabase.from("quotes").insert([
      {
        lead_id: leadId,
        package_name: pkgEnum,
        base_price_adult: pricing.adultPrice,
        base_price_child: pricing.childPrice,
        num_adults: adults,
        num_children: children,
        upgrades_json: upgradesJson,
        total_estimate: totalEstimate,
        currency: "EUR",
        is_final: false,
      },
    ]);

    if (quoteError) {
      console.error(`Warning: Failed to create quote for lead ${leadId}:`, quoteError);
    }

    // 5. CRM Activity Logs
    const logPayloads = [
      {
        lead_id: leadId,
        action: "lead_created",
        performed_by: "system",
        notes: `Lead record generated via ${source || "marketing form"}.`,
      },
    ];

    if (assignedConciergeId) {
      logPayloads.push({
        lead_id: leadId,
        action: "lead_assigned",
        performed_by: "system",
        notes: `Assigned automatically to ${assignedConciergeName} based on active workload capacity.`,
      });
    }

    const { error: logError } = await supabase.from("activity_log").insert(logPayloads);
    if (logError) {
      console.error("Warning: Activity logs could not be inserted:", logError);
    }

    // 6. Direct Concierge Notification
    const packageDisplayName =
      pkgEnum === "bavaria_fairy_tales"
        ? "Bavaria & Fairy Tales"
        : pkgEnum === "theme_parks_cities"
        ? "Theme Parks & Cities"
        : "Nature & Discovery";

    await sendSlackLeadNotification({
      leadName: `${firstName} ${lastName}`,
      leadEmail: email,
      leadPhone: phone,
      selectedPackage: packageDisplayName,
      numAdults: adults,
      numChildren: children,
      departureDate: depDate,
      departureCity: depCity || undefined,
      conciergeName: assignedConciergeName,
      conciergeEmail: assignedConciergeEmail,
    });

    return NextResponse.json({
      status: "success",
      leadId: leadId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Leads API Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
