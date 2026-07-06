import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase-server";

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for a 30% booking deposit.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId parameter" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.warn("🔔 STRIPE_SECRET_KEY is not defined. Returning a mock success redirection.");
      // Fallback for mock sandbox testing
      const origin = new URL(request.url).origin;
      return NextResponse.json({
        url: `${origin}/portal/${leadId}?mock_checkout=success`,
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24-preview" as any, // standard API version
    });

    const supabase = createServerClient();

    // 1. Fetch lead information
    const { data: lead, error: lErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (lErr || !lead) {
      return NextResponse.json({ error: "Lead details not found in database" }, { status: 404 });
    }

    // 2. Fetch associated quote to get price
    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (qErr || !quote) {
      return NextResponse.json({ error: "No active quote estimate found for this lead" }, { status: 404 });
    }

    // Calculate 30% deposit in cents
    const totalEstimateCents = quote.total_estimate;
    const depositCents = Math.round(totalEstimateCents * 0.3);

    const origin = new URL(request.url).origin;
    const packageNameReadable =
      quote.package_name === "bavaria_fairy_tales"
        ? "Bavaria & Fairy Tales"
        : quote.package_name === "theme_parks_cities"
        ? "Theme Parks & Cities"
        : "Nature & Discovery";

    // 3. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `30% Booking Deposit — ${packageNameReadable}`,
              description: `Bespoke luxury itinerary co-created for ${lead.first_name} ${lead.last_name}. Total value: ${formatEur(totalEstimateCents)}.`,
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/portal/${leadId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/portal/${leadId}`,
      metadata: {
        leadId: leadId,
      },
    });

    // 4. Update lead record with checkout session tracker
    const { error: updateErr } = await supabase
      .from("leads")
      .update({
        stripe_session_id: session.id,
      })
      .eq("id", leadId);

    if (updateErr) {
      console.error(`Warning: Failed to update stripe session ID for lead ${leadId}:`, updateErr);
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Checkout Session API Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
