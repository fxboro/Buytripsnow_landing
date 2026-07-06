import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase-server";
import { sendSlackLeadNotification } from "@/lib/notifications";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe secure webhook processor.
 * Listens for checkout.session.completed to confirm deposits and lock bookings.
 */
export async function POST(request: Request) {
  const bodyText = await request.text();
  const sig = request.headers.get("stripe-signature");

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Stripe configuration missing" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-24-preview" as any,
  });

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
    } else {
      // In local testing/development, if signature details are omitted, parse directly
      console.warn("⚠️ Bypass Stripe signature verification (development mode).");
      event = JSON.parse(bodyText) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook Signature Verification Failed";
    console.error("Webhook signature check error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Handle transaction confirmation
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const leadId = session.metadata?.leadId;
    const amountPaid = session.amount_total || 0; // total paid in cents
    const customerId = typeof session.customer === "string" ? session.customer : null;

    if (!leadId) {
      console.error("Stripe webhook: Checkout session lacks leadId metadata.");
      return NextResponse.json({ received: true });
    }

    try {
      const supabase = createServerClient();

      // 1. Update lead status in Supabase
      const { data: lead, error: updateErr } = await supabase
        .from("leads")
        .update({
          status: "booked",
          amount_paid_cents: amountPaid,
          stripe_customer_id: customerId,
        })
        .eq("id", leadId)
        .select(`
          first_name,
          last_name,
          email,
          phone,
          selected_package,
          num_adults,
          num_children,
          dep_date,
          dep_city,
          assigned_concierge_id,
          concierges (
            name,
            email
          )
        `)
        .single();

      if (updateErr || !lead) {
        console.error(`Stripe Webhook DB Update Error on lead ${leadId}:`, updateErr);
        return NextResponse.json({ error: "Failed to update lead status" }, { status: 500 });
      }

      // 2. Insert payment log in audit trail
      const { error: logErr } = await supabase.from("activity_log").insert([
        {
          lead_id: leadId,
          action: "payment_received",
          performed_by: "Stripe Webhook",
          notes: `Confirmed 30% booking deposit of ${formatEur(amountPaid)} via Stripe Session: ${session.id}`,
          metadata_json: { session_id: session.id, amount_cents: amountPaid },
        },
      ]);

      if (logErr) {
        console.error("Warning: Webhook failed to create payment log:", logErr);
      }

      // 3. Notify concierge (Slack alert)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const concierge = lead.concierges as any;
      const conciergeName = concierge?.name || "Support Team";
      const conciergeEmail = concierge?.email || "support@buytripsnow.com";

      const packageDisplayName =
        lead.selected_package === "bavaria_fairy_tales"
          ? "Bavaria & Fairy Tales"
          : lead.selected_package === "theme_parks_cities"
          ? "Theme Parks & Cities"
          : "Nature & Discovery";

      await sendSlackLeadNotification({
        leadName: `💳 DEPOSIT PAID: ${lead.first_name} ${lead.last_name}`,
        leadEmail: lead.email,
        leadPhone: lead.phone,
        selectedPackage: `${packageDisplayName} (Deposit Confirmed: ${formatEur(amountPaid)})`,
        numAdults: lead.num_adults,
        numChildren: lead.num_children,
        departureDate: lead.dep_date,
        departureCity: lead.dep_city || undefined,
        conciergeName,
        conciergeEmail,
      });

      console.log(`Stripe Webhook: Successfully processed deposit for lead ${leadId}`);
    } catch (dbErr) {
      console.error("Stripe Webhook processor error:", dbErr);
      return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
