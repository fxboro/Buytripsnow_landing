import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { PackageName, ItineraryDayInsert } from "@/types/database";

const DEFAULT_ITINERARIES: Record<PackageName, Array<Omit<ItineraryDayInsert, "lead_id">>> = {
  bavaria_fairy_tales: [
    {
      day_number: 1,
      title: "Arrival in Munich & Rosewood Welcome",
      hotel: "Rosewood Munich",
      morning_activity: "Airport arrival & greeting",
      afternoon_activity: "Private Mercedes S-Class transfer to Rosewood Munich. Welcome orientation.",
      evening_activity: "Exclusive candlelight welcome dinner at a historic private dining vault.",
      notes: "Your concierge is on call 24/7. Standard check-in starts at 15:00.",
    },
    {
      day_number: 2,
      title: "Munich Private Old Town & Tavern Night",
      hotel: "Rosewood Munich",
      morning_activity: "Guided historic walk of Marienplatz and Viktualienmarkt",
      afternoon_activity: "Bespoke pretzel baking workshop with a master baker",
      evening_activity: "Traditional tavern dinner with private beer pairing tasting",
      notes: "Wear comfortable walking shoes.",
    },
    {
      day_number: 3,
      title: "Royal Castles & Schloss Elmau Retreat",
      hotel: "Schloss Elmau (Luxury Spa Retreat)",
      morning_activity: "Scenic alpine drive from Munich to Füssen",
      afternoon_activity: "VIP skip-the-line private tour of Neuschwanstein Castle",
      evening_activity: "Transfer and check-in to Schloss Elmau. Gourmet dining overlooking the peaks.",
      notes: "Bring cameras and light jacket.",
    },
    {
      day_number: 4,
      title: "Alpine Peaks & Spa Rejuvenation",
      hotel: "Schloss Elmau",
      morning_activity: "Guided lake-side hike around the Ferchensee",
      afternoon_activity: "Rest and relaxation in the adult-only or family thermal wellness spas",
      evening_activity: "Live chamber music concert at Schloss Elmau concert hall followed by dinner",
      notes: "Spa treatments booked at 14:30.",
    },
    {
      day_number: 5,
      title: "Top of Germany Peak Excursion",
      hotel: "Schloss Elmau",
      morning_activity: "Transfer to Garmisch-Partenkirchen cogwheel train",
      afternoon_activity: "Zugspitze Peak cable car ride to 2,962m summit",
      evening_activity: "Peak-view cocktails and alpine dinner. Return to Elmau.",
      notes: "Warm winter layers needed at summit even in late summer.",
    },
    {
      day_number: 6,
      title: "Partnachklamm Gorge Adventure",
      hotel: "Schloss Elmau",
      morning_activity: "Guided trek through the dramatic Partnach Gorge waterfalls",
      afternoon_activity: "Traditional alpine lunch. Horse-drawn carriage ride through the valleys.",
      evening_activity: "Luxury outdoor bonfire gathering with toasted delicacies and wine.",
      notes: "Waterproof clothing recommended for gorge mist.",
    },
    {
      day_number: 7,
      title: "Journey to Medieval Rothenburg",
      hotel: "Hotel Eisenhut (Rothenburg)",
      morning_activity: "Transfer from Garmisch to Rothenburg ob der Tauber along Romantic Road",
      afternoon_activity: "Bespoke walking tour of the pristine medieval fortified walls",
      evening_activity: "Private Medieval Night Watchman tour. Traditional Franconian dinner.",
      notes: "Unpack and relax.",
    },
    {
      day_number: 8,
      title: "Rothenburg Artisans & Craft Heritage",
      hotel: "Hotel Eisenhut",
      morning_activity: "Private viewings at local clockmakers, woodcarvers and glassblowers",
      afternoon_activity: "Snowball pastry tasting and coffee roasting class",
      evening_activity: "Exclusive dinner at a Michelin-recommended dining room.",
      notes: "Souvenirs can be packaged and shipped directly from hotel.",
    },
    {
      day_number: 9,
      title: "Romantic Road Return to Munich",
      hotel: "Rosewood Munich",
      morning_activity: "Leisurely morning in Rothenburg. Departure drive.",
      afternoon_activity: "Stopover at Nymphenburg Palace gardens and museum",
      evening_activity: "Farewell dinner celebration at Rosewood's signature restaurant.",
      notes: "Prepare luggage for tomorrow's flights.",
    },
    {
      day_number: 10,
      title: "Farewell Germany & Departure",
      hotel: null,
      morning_activity: "Leisurely breakfast and final concierge checkout assistance",
      afternoon_activity: "Private Mercedes V-Class transfer to Munich International Airport",
      evening_activity: "VIP fast-track security escort & departure flight",
      notes: "Safe travels. We look forward to welcome you back!",
    },
  ],
  theme_parks_cities: [
    {
      day_number: 1,
      title: "Berlin Welcomes You",
      hotel: "Hotel de Rome (Berlin)",
      morning_activity: "Airport arrival & check-in",
      afternoon_activity: "Private transfer to Bebelplatz. Leisurely settling in.",
      evening_activity: "Private rooftop dining with panoramas over Berlin historic core.",
      notes: "Check-in at 15:00.",
    },
    {
      day_number: 2,
      title: "Museum Island & Reichstag Glass Dome",
      hotel: "Hotel de Rome",
      morning_activity: "Exclusive skip-the-line private guide of Pergamon Museum",
      afternoon_activity: "Spree River private solar yacht cruise with champagne service",
      evening_activity: "Sunset dinner reservation inside the Reichstag dome restaurant.",
      notes: "Bring passport IDs for Reichstag security clearance.",
    },
    {
      day_number: 3,
      title: "Berlin to Historic Leipzig",
      hotel: "Steigenberger Grandhotel (Leipzig)",
      morning_activity: "Private high-speed rail transfer to Leipzig",
      afternoon_activity: "Private tour of St. Thomas Church (Bach's legacy) and historic arcades",
      evening_activity: "Dinner at Auerbachs Keller, the famous historic Goethe tavern.",
      notes: "Luggage will be transferred in parallel directly to hotel rooms.",
    },
    {
      day_number: 4,
      title: "Leipzig to Europa-Park Adventure",
      hotel: "Krønasår Museum Hotel (Europa-Park)",
      morning_activity: "Morning scenic drive to Rust in southwest Germany",
      afternoon_activity: "Arrival & check-in at Krønasår. Explore Rulantica indoor waterpark.",
      evening_activity: "Nordic themed dinner experience at Bubba Svens buffet.",
      notes: "Keep swimwear handy for Rulantica.",
    },
    {
      day_number: 5,
      title: "Europa-Park VIP Rollercoasters",
      hotel: "Krønasår Museum Hotel",
      morning_activity: "VIP early entry to Europa-Park attractions",
      afternoon_activity: "Dedicated tour guide offering skip-the-line ride accesses all day",
      evening_activity: "Bespoke multi-sensory gourmet dining experience at Eatrenalin.",
      notes: "Eatrenalin dinner starts at 19:30 (dress code: smart casual).",
    },
    {
      day_number: 6,
      title: "Europa-Park Fun & Rulantica Oasis",
      hotel: "Krønasår Museum Hotel",
      morning_activity: "Second-day custom parks explorations",
      afternoon_activity: "Relaxation inside Rulantica VIP cabana oasis",
      evening_activity: "Dinner at Kronasar’s fine-dining grill restaurant.",
      notes: "Rest early for tomorrow's transfer.",
    },
    {
      day_number: 7,
      title: "Black Forest to Heidelberg Castle",
      hotel: "Der Europäische Hof (Heidelberg)",
      morning_activity: "Morning transfer from Rust to Heidelberg",
      afternoon_activity: "Funicular railway up to Heidelberg Castle ruins with private guide",
      evening_activity: "Philosopher's Walk sunset stroll followed by dinner at hotel garden.",
      notes: "Scenic and relaxed day.",
    },
    {
      day_number: 8,
      title: "Rhine Valley Cruise & Wine Tasting",
      hotel: "Villa Kennedy (Frankfurt)",
      morning_activity: "Scenic drive to Rhine Gorge castle region",
      afternoon_activity: "Charter yacht cruise on Rhine River with private local wine sommelier",
      evening_activity: "Transfer to Frankfurt and check-in to Villa Kennedy. Spa evening.",
      notes: "Tastings include premium Rieslings.",
    },
    {
      day_number: 9,
      title: "Frankfurt Museum Embankment",
      hotel: "Villa Kennedy",
      morning_activity: "Städel Museum private viewings",
      afternoon_activity: "Skyline sightseeing and boutique shopping",
      evening_activity: "Farewell gala dinner at a Michelin-starred dining room.",
      notes: "Luggage organization assistance.",
    },
    {
      day_number: 10,
      title: "Departure Frankfurt",
      hotel: null,
      morning_activity: "Morning check-out & final gift shopping",
      afternoon_activity: "Private Mercedes S-Class transfer to Frankfurt Main Airport",
      evening_activity: "Lufthansa First Class Lounge access & flight departure",
      notes: "Safe journey home.",
    },
  ],
  nature_discovery: [
    {
      day_number: 1,
      title: "Welcome to Maritime Hamburg",
      hotel: "The Fontenay (Hamburg)",
      morning_activity: "Airport greeting & transfer",
      afternoon_activity: "Mercedes V-Class transfer to Alster Lake. Settle into park-view room.",
      evening_activity: "Private yacht cruise on Alster Lake with sunset appetizers.",
      notes: "Welcome to northern Germany.",
    },
    {
      day_number: 2,
      title: "Speicherstadt & Elbphilharmonie Night",
      hotel: "The Fontenay",
      morning_activity: "Private walking tour of historic UNESCO brick warehouses",
      afternoon_activity: "Miniatur Wunderland skip-the-line private VIP tour",
      evening_activity: "Classical concert night at the Elbphilharmonie grand hall & dinner.",
      notes: "Concert tickets are confirmed.",
    },
    {
      day_number: 3,
      title: "Harz National Park & Historic Steam Train",
      hotel: "Landhaus Zu den Rothen Forellen (Harz)",
      morning_activity: "Transfer drive south to Harz Mountains",
      afternoon_activity: "Brocken historic narrow-gauge steam train ride to the peak",
      evening_activity: "Relaxing spa soak at hotel and lake-side dining.",
      notes: "Sensible hiking clothing needed.",
    },
    {
      day_number: 4,
      title: "Deep Forests & Lynx Observation",
      hotel: "Landhaus Zu den Rothen Forellen",
      morning_activity: "Forest hiking adventure led by official Harz national park ranger",
      afternoon_activity: "Lynx observation center viewing and conservation briefing",
      evening_activity: "Outdoor cooking fireside dinner at forest lodge.",
      notes: "Keep noise low at the lynx observatory.",
    },
    {
      day_number: 5,
      title: "Harz to Baden-Baden Thermal Spa",
      hotel: "Brenners Park-Hotel & Spa (Baden-Baden)",
      morning_activity: "Transfer to Baden-Baden at borders of Black Forest",
      afternoon_activity: "Check-in at Brenners. Walk through Lichtentaler Allee gardens.",
      evening_activity: "Gourmet dining at Brenners Park Restaurant.",
      notes: "Relaxation-focused day.",
    },
    {
      day_number: 6,
      title: "Caracalla Thermal Pools & Castle Ruins",
      hotel: "Brenners Park-Hotel & Spa",
      morning_activity: "Caracalla Spa private wellness sessions and thermal pool bathing",
      afternoon_activity: "Excursion to Hohenbaden Castle ruins (Altes Schloss)",
      evening_activity: "Dinner at historic Kurhaus casino restaurant.",
      notes: "Smart dress required at Kurhaus casino.",
    },
    {
      day_number: 7,
      title: "Black Forest Scenic drive & Waterfalls",
      hotel: "Brenners Park-Hotel & Spa",
      morning_activity: "Drive along Schwarzwaldhochstraße panoramic highway",
      afternoon_activity: "Trek at Triberg Waterfalls (highest in Germany) and cuckoo clock heritage",
      evening_activity: "Bavarian style forest tavern dining. Return to hotel.",
      notes: "Bring cameras for waterfalls.",
    },
    {
      day_number: 8,
      title: "Baden-Baden to Lake Constance",
      hotel: "Bayerischer Hof (Lindau Island)",
      morning_activity: "Transfer drive south to Lake Constance (Bodensee)",
      afternoon_activity: "Private yacht charter exploring historic Lindau island town",
      evening_activity: "Lake-side sunset dining with views extending into Swiss Alps.",
      notes: "Lake air can be breezy in evenings.",
    },
    {
      day_number: 9,
      title: "Mainau Island Blooms & Sailing",
      hotel: "Bayerischer Hof",
      morning_activity: "Mainau Flower Island garden walk with private horticulturist",
      afternoon_activity: "Leisurely sailing regatta trial on Lake Constance",
      evening_activity: "Farewell dinner celebrating local fresh catch and local wines.",
      notes: "Luggage sorting checks.",
    },
    {
      day_number: 10,
      title: "Departure Switzerland (Zurich Airport)",
      hotel: null,
      morning_activity: "Morning checkout check",
      afternoon_activity: "Transfer to nearby Zurich Airport (ZRH) across Swiss border",
      evening_activity: "Fast track assistance and boarding departure flights",
      notes: "Thank you for exploring Germany's nature with us. Safe journey!",
    },
  ],
};

/**
 * GET /api/itinerary?leadId=uuid
 *
 * Fetches the 10-day itinerary for a given lead.
 * If no itinerary exists, lazily populates a default template matching the lead's selected package.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId parameter" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch itinerary days
    const { data: days, error: dErr } = await supabase
      .from("itinerary_days")
      .select("*")
      .eq("lead_id", leadId)
      .order("day_number", { ascending: true });

    if (dErr) {
      throw dErr;
    }

    // If days exist, return them
    if (days && days.length > 0) {
      return NextResponse.json(days);
    }

    // 2. Otherwise, fetch the lead to discover its selected package and seed a default itinerary
    const { data: lead, error: lErr } = await supabase
      .from("leads")
      .select("selected_package")
      .eq("id", leadId)
      .single();

    if (lErr || !lead) {
      return NextResponse.json(
        { error: "Lead not found to generate default itinerary: " + (lErr?.message || "") },
        { status: 404 }
      );
    }

    const pkg = lead.selected_package as PackageName;
    const template = DEFAULT_ITINERARIES[pkg] || DEFAULT_ITINERARIES.bavaria_fairy_tales;

    // Build insert payloads
    const insertPayloads = template.map((day) => ({
      lead_id: leadId,
      ...day,
    }));

    const { data: seededDays, error: seedErr } = await supabase
      .from("itinerary_days")
      .insert(insertPayloads)
      .select("*")
      .order("day_number", { ascending: true });

    if (seedErr) {
      throw seedErr;
    }

    // Log the automatic itinerary creation
    await supabase.from("activity_log").insert([
      {
        lead_id: leadId,
        action: "itinerary_sent",
        performed_by: "system",
        notes: `Bespoke 10-day itinerary initialized automatically from package template: ${pkg}`,
      },
    ]);

    return NextResponse.json(seededDays);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Itinerary GET Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/itinerary
 *
 * Updates an itinerary day (activities, hotel details, notes).
 * Triggers activity logs detailing which parts changed.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, leadId, title, hotel, morningActivity, afternoonActivity, eveningActivity, notes } = body;

    if (!id || !leadId) {
      return NextResponse.json({ error: "Missing required fields (id, leadId)" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check for previous values to write details to the audit activity logs
    const { data: prevDay } = await supabase
      .from("itinerary_days")
      .select("*")
      .eq("id", id)
      .single();

    const { error: updateError } = await supabase
      .from("itinerary_days")
      .update({
        title,
        hotel,
        morning_activity: morningActivity,
        afternoon_activity: afternoonActivity,
        evening_activity: eveningActivity,
        notes,
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    // Log changes to activity trail
    const changes: string[] = [];
    if (prevDay) {
      if (prevDay.title !== title) changes.push("title");
      if (prevDay.hotel !== hotel) changes.push("hotel");
      if (prevDay.morning_activity !== morningActivity) changes.push("morning activity");
      if (prevDay.afternoon_activity !== afternoonActivity) changes.push("afternoon activity");
      if (prevDay.evening_activity !== eveningActivity) changes.push("evening activity");
      if (prevDay.notes !== notes) changes.push("notes");
    }

    const changeNotes = changes.length > 0
      ? `Updated itinerary Day ${prevDay?.day_number || ""} parameters: ${changes.join(", ")}`
      : `Re-saved Day ${prevDay?.day_number || ""} with no modifications.`;

    await supabase.from("activity_log").insert([
      {
        lead_id: leadId,
        action: "itinerary_sent",
        performed_by: "Concierge User",
        notes: changeNotes,
      },
    ]);

    return NextResponse.json({ status: "success" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Itinerary POST Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
