import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { sendSlackLeadNotification } from "@/lib/notifications";

/**
 * POST /api/notify
 *
 * Scans a lead and its assigned concierge, then delivers a Slack notification.
 * This decoupled endpoint allows asynchronous or retried notifications.
 */
export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing required parameter: leadId" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch lead details and joined concierge details
    const { data: lead, error } = await supabase
      .from("leads")
      .select(`
        id,
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
      .eq("id", leadId)
      .single();

    if (error || !lead) {
      console.error(`Error loading lead ${leadId} for notification:`, error);
      return NextResponse.json(
        { error: `Lead not found or database read failed: ${error?.message || "unknown"}` },
        { status: 404 }
      );
    }

    // Cast the joined table data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const concierge = lead.concierges as any;

    const conciergeName = concierge?.name || "Support Team";
    const conciergeEmail = concierge?.email || "support@buytripsnow.com";

    // Format human-friendly package names
    const packageDisplayName =
      lead.selected_package === "bavaria_fairy_tales"
        ? "Bavaria & Fairy Tales"
        : lead.selected_package === "theme_parks_cities"
        ? "Theme Parks & Cities"
        : lead.selected_package === "nature_discovery"
        ? "Nature & Discovery"
        : lead.selected_package;

    const notified = await sendSlackLeadNotification({
      leadName: `${lead.first_name} ${lead.last_name}`,
      leadEmail: lead.email,
      leadPhone: lead.phone,
      selectedPackage: packageDisplayName,
      numAdults: lead.num_adults,
      numChildren: lead.num_children,
      departureDate: lead.dep_date,
      departureCity: lead.dep_city || undefined,
      conciergeName,
      conciergeEmail,
    });

    if (!notified) {
      return NextResponse.json(
        { status: "warning", message: "Database query succeeded, but failed to deliver Slack webhook notification." },
        { status: 502 }
      );
    }

    return NextResponse.json({ status: "success", message: "Notification sent." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Notify API Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
