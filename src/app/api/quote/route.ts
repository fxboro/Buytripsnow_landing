import { NextResponse } from "next/server";
import {
  PackageName,
  FlightClass,
  HotelPreference,
  PACKAGE_PRICING,
  UPGRADE_PRICING,
} from "@/types/database";

/**
 * Normalizes package selection strings from the frontend to the database PackageName enum.
 */
function normalizePackage(pkg: string): PackageName {
  const p = pkg.toLowerCase();
  if (p.includes("bavaria") || p.includes("fairy")) return "bavaria_fairy_tales";
  if (p.includes("theme") || p.includes("park") || p.includes("cities")) return "theme_parks_cities";
  return "nature_discovery"; // Default/fallback
}

/**
 * Normalizes flight class selections from the frontend to FlightClass enum.
 */
function normalizeFlightClass(fc: string): FlightClass {
  const f = fc.toLowerCase();
  if (f.includes("premium")) return "premium_economy";
  if (f.includes("business")) return "business";
  return "economy";
}

/**
 * Normalizes hotel preferences from the frontend to HotelPreference enum.
 */
function normalizeHotelPref(hp: string): HotelPreference {
  const h = hp.toLowerCase();
  if (h.includes("5-star") || h.includes("five")) return "5_star_deluxe";
  if (h.includes("4-star") || h.includes("four")) return "4_star_luxury";
  if (h.includes("boutique") || h.includes("design")) return "boutique_design";
  if (h.includes("castle") || h.includes("heritage")) return "castle_heritage";
  if (h.includes("family") || h.includes("resort")) return "family_resort";
  return "no_preference";
}

/**
 * Formats cents into an EUR currency string (e.g. 299000 -> "€2,990")
 */
function formatEur(cents: number): string {
  const eur = cents / 100;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eur);
}

/**
 * POST /api/quote
 *
 * Calculates a dynamic quote estimate based on enquiry parameters.
 * Does not write to DB; returns calculation logic and pricing breakdown.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { selectedPkg, numAdults, numChildren, flightClass, hotelPref } = body;

    if (!selectedPkg) {
      return NextResponse.json(
        { error: "Missing selectedPkg parameter" },
        { status: 400 }
      );
    }

    // Standardize input values
    const pkgEnum = normalizePackage(selectedPkg);
    const flightEnum = normalizeFlightClass(flightClass || "");
    const hotelEnum = normalizeHotelPref(hotelPref || "");

    const adults = Math.max(1, parseInt(String(numAdults || 1), 10));
    const children = Math.max(0, parseInt(String(numChildren || 0), 10));

    // Get pricing configurations
    const pricing = PACKAGE_PRICING[pkgEnum];
    const totalPax = adults + children;

    const breakdown: Array<{ label: string; amount: number }> = [];

    // 1. Base pricing (Adults)
    const baseAdultCost = pricing.adultPrice * adults;
    breakdown.push({
      label: `${adults} ${adults === 1 ? "Adult" : "Adults"} × ${formatEur(pricing.adultPrice)}`,
      amount: baseAdultCost,
    });

    // 2. Base pricing (Children)
    let baseChildCost = 0;
    if (children > 0) {
      baseChildCost = pricing.childPrice * children;
      breakdown.push({
        label: `${children} ${children === 1 ? "Child" : "Children"} × ${formatEur(pricing.childPrice)}`,
        amount: baseChildCost,
      });
    }

    // 3. Flight Upgrade cost (per person upgrade)
    const flightUpgradeUnit = UPGRADE_PRICING.flight_class[flightEnum];
    let flightUpgradeCost = 0;
    if (flightUpgradeUnit > 0) {
      flightUpgradeCost = flightUpgradeUnit * totalPax;
      const flightLabel = flightEnum === "business" ? "Business Class Upgrade" : "Premium Economy Upgrade";
      breakdown.push({
        label: `${flightLabel} (${totalPax} pax × ${formatEur(flightUpgradeUnit)})`,
        amount: flightUpgradeCost,
      });
    }

    // 4. Hotel Upgrade cost (flat upgrade fee per trip)
    const hotelUpgradeCost = UPGRADE_PRICING.hotel_pref[hotelEnum];
    if (hotelUpgradeCost > 0) {
      const hotelLabel =
        hotelEnum === "5_star_deluxe"
          ? "5-Star Deluxe Upgrade"
          : hotelEnum === "castle_heritage"
          ? "Castle / Heritage Property Upgrade"
          : hotelEnum === "boutique_design"
          ? "Boutique / Design Hotel Upgrade"
          : hotelEnum === "family_resort"
          ? "Family Resort Upgrade"
          : "Hotel Tier Upgrade";
      breakdown.push({
        label: `${hotelLabel} (flat)`,
        amount: hotelUpgradeCost,
      });
    }

    // Total cost in cents
    const totalEstimate = baseAdultCost + baseChildCost + flightUpgradeCost + hotelUpgradeCost;

    return NextResponse.json({
      estimate: totalEstimate,
      breakdown,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Quote API Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
