"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RouteMap from "@/components/RouteMap";
import LeadForm from "@/components/LeadForm";

const routes = {
  bavaria: {
    center: [47.8, 10.9] as [number, number],
    zoom: 8,
    stops: [
      { name: "Munich", coords: [48.1351, 11.5820] as [number, number], desc: "Arrival flight, luxury hotel stay and city touring." },
      { name: "Füssen & Neuschwanstein", coords: [47.5696, 10.7004] as [number, number], desc: "Fairy tale castles and Alpine scenery." },
      { name: "Garmisch & Zugspitze", coords: [47.4917, 11.0955] as [number, number], desc: "Zugspitze mountain summit and Alpine lakes." }
    ]
  },
  themeparks: {
    center: [50.4, 10.5] as [number, number],
    zoom: 6,
    stops: [
      { name: "Berlin", coords: [52.5200, 13.4050] as [number, number], desc: "City history, exploration and modern culture." },
      { name: "Rhine Valley", coords: [50.1436, 7.7171] as [number, number], desc: "Ancient castles, river cruising and vineyards." },
      { name: "Europa-Park (Rust)", coords: [48.2660, 7.7220] as [number, number], desc: "Two full days at Europe's leading theme park." },
      { name: "Frankfurt", coords: [50.1109, 8.6821] as [number, number], desc: "Departure flight and modern metropolis." }
    ]
  },
  nature: {
    center: [50.6, 11.5] as [number, number],
    zoom: 6,
    stops: [
      { name: "Hamburg", coords: [53.5511, 9.9937] as [number, number], desc: "Elbphilharmonie and historic port." },
      { name: "Black Forest (Freiburg)", coords: [47.9990, 7.8421] as [number, number], desc: "Ancient woodlands, hiking trails and cuckoo clocks." },
      { name: "Berchtesgaden", coords: [47.6302, 13.0012] as [number, number], desc: "Alpine discovery and pristine lakes." }
    ]
  }
};

export default function Home() {
  const [selectedPkg, setSelectedPkg] = useState("");

  const handleBook = (name: string, selectValue: string) => {
    setSelectedPkg(selectValue);
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Nav isHome={true} />

      {/* ──═ HERO ═── */}
      <header className="hero" role="banner" style={{ backgroundImage: "linear-gradient(175deg,rgba(13,15,20,.4) 0%,rgba(13,15,20,.94) 100%), url('/images/hero_germany.png')" }}>
        <div className="hero-inner">
          <p className="hero-eyebrow">EXCLUSIVE CAMPAIGN &nbsp;·&nbsp; LATE SUMMER 2026</p>
          <h1 className="hero-h1">Germany, Crafted for<br />Discerning <em>Families</em></h1>
          <p className="hero-sub">
            Step away from generic tours. Discover Germany&apos;s fairy-tale spires, historic cities, and legendary theme parks on a 10-day luxury journey designed for multigenerational families.
          </p>
          <div className="hero-btns">
            <a href="#packages" className="btn-primary" aria-label="Explore bespoke travel packages">
              Explore Journeys
            </a>
            <a href="#enquiry-form" className="btn-ghost" aria-label="Build a bespoke itinerary with our concierge">
              Plan Bespoke Itinerary
            </a>
          </div>
          <div className="hero-line"></div>
        </div>
      </header>

      {/* ──═ TRUST INDICATORS ═── */}
      <section className="trust" aria-label="Trust factors">
        <div className="trust-inner">
          <div className="trust-item"><span className="trust-e" aria-hidden="true">🇪🇪</span> Tallinn, Estonia Founded</div>
          <div className="trust-item"><span className="trust-e" aria-hidden="true">🏰</span> 500+ Luxury Clients</div>
          <div className="trust-item"><span className="trust-e" aria-hidden="true">✦</span> 98% Concierge Score</div>
          <div className="trust-item"><span className="trust-e" aria-hidden="true">🛎️</span> 24/7 Support Guaranteed</div>
        </div>
      </section>

      {/* ──═ CONCEPT INTRO ═── */}
      <section className="section" id="concept" aria-labelledby="concept-h">
        <div className="wrap">
          <div className="section-lbl">Concept</div>
          <h2 className="section-h2" id="concept-h">Where Vision Meets <em>Connoisseurship</em></h2>
          <p className="section-p" style={{ marginBottom: 0 }}>
            Luxury is not just where you sleep—it is the complete absence of friction. BuyTripsNow is an elite travel concierge registered in Tallinn, Estonia. We construct tailored experiences for families who demand both cultural depth and seamless execution. We handpick elite partners, manage private ground transfers, and assign a dedicated concierge to handle every detail in real-time.
          </p>
        </div>
      </section>

      {/* ──═ PACKAGES ──═ */}
      <section className="section section-alt" id="packages" aria-labelledby="pkgs-h">
        <div className="wrap" style={{ marginBottom: "52px" }}>
          <div className="section-lbl">Germany · Late Summer 2026</div>
          <h2 className="section-h2" id="pkgs-h">Three <em>Extraordinary</em><br />Family Journeys</h2>
          <p className="section-p">
            Each package is curated to the finest detail — return flights, handpicked 4★ luxury hotels, daily breakfast, and private airport transfers included. All pricing shown per adult and per child (ages 9–14).
          </p>
        </div>

        <div className="pkgs-grid">
          {/* PACKAGE 1 */}
          <article className="pkg" aria-label="Bavaria & Fairy Tales package">
            <div className="pkg-band band-burgundy"></div>
            <div className="pkg-body">
              <span className="pkg-icon" aria-hidden="true">🏰</span>
              <div className="pkg-tier">Package 01 · Classic</div>
              <h3 className="pkg-name">Bavaria &amp; Fairy Tales</h3>
              <p className="pkg-tagline">Neuschwanstein&apos;s spires, crystal Alpine lakes, and Zugspitze&apos;s snow-dusted summit. The quintessential German fairy tale, lived by your family.</p>
              <div className="pkg-route" aria-label="Route: Munich, Füssen, Garmisch">
                <span className="stop">Munich</span><span className="arr">→</span>
                <span className="stop">Füssen</span><span className="arr">→</span>
                <span className="stop">Garmisch</span>
              </div>
              
              <RouteMap id="map-bavaria" routeData={routes.bavaria} />

              <div className="incl-label" style={{ marginTop: "20px" }}>Included</div>
              <ul className="incl-list" aria-label="What's included">
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>Return economy flights</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>9 nights, 4★ luxury hotels</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>Daily breakfast</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" strokeLinecap="round"/></svg>Private airport pickup &amp; drop-off</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" strokeLinecap="round"/></svg>Dedicated 24/7 concierge</li>
              </ul>
              <div className="pkg-divider"></div>
              <div className="incl-label">Excludes</div>
              <ul className="incl-list" aria-label="What's excluded">
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>Personal meals &amp; dining</li>
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" strokeLinecap="round"/></svg>Local buses &amp; trains</li>
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" strokeLinecap="round"/></svg>Personal travel insurance</li>
              </ul>
            </div>
            <div className="pkg-price-block">
              <div className="price-rows">
                <div className="price-row price-adult">
                  <div className="price-row-lbl">Per Adult</div>
                  <div className="price-row-amt"><sup>€</sup>2,557</div>
                  <div className="price-row-note">incl. return flights</div>
                </div>
                <div className="price-row price-child">
                  <div className="price-row-lbl">Child (9–14)</div>
                  <div className="price-row-amt"><sup>€</sup>1,080</div>
                  <div className="price-row-note">incl. return flights</div>
                </div>
              </div>
              <div className="pkg-meta">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 2"/></svg>
                10 Days &nbsp;·&nbsp; Aug–Sep 2026
              </div>
              <button className="btn-book" onClick={() => handleBook("Bavaria & Fairy Tales", "Bavaria & Fairy Tales — Adult €2,557 · Child €1,080")} aria-label="Reserve Bavaria & Fairy Tales journey">
                Reserve This Journey
              </button>
            </div>
          </article>

          {/* PACKAGE 2 */}
          <article className="pkg featured" aria-label="Theme Parks & Cities package — Most Popular">
            <div className="pkg-band band-navy"></div>
            <div className="pkg-ribbon" aria-label="Most Popular">Most Popular</div>
            <div className="pkg-body">
              <span className="pkg-icon" aria-hidden="true">🎢</span>
              <div className="pkg-tier">Package 02 · Adventure</div>
              <h3 className="pkg-name">Theme Parks &amp; Cities</h3>
              <p className="pkg-tagline">Berlin&apos;s electric energy, the storied Rhine Valley, and two full days at Europa-Park — Europe&apos;s greatest theme park. Pure adventure for the whole family.</p>
              <div className="pkg-route" aria-label="Route: Berlin, Rhine Valley, Europa-Park, Frankfurt">
                <span className="stop">Berlin</span><span className="arr">→</span>
                <span className="stop">Rhine</span><span className="arr">→</span>
                <span className="stop">Europa-Park</span><span className="arr">→</span>
                <span className="stop">Frankfurt</span>
              </div>
              
              <RouteMap id="map-themeparks" routeData={routes.themeparks} />

              <div className="incl-label" style={{ marginTop: "20px" }}>Included</div>
              <ul className="incl-list" aria-label="What's included">
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Return economy flights</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>9 nights, 4★ luxury hotels</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Daily breakfast</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Private airport pickup &amp; drop-off</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Dedicated 24/7 concierge</li>
              </ul>
              <div className="pkg-divider"></div>
              <div className="incl-label">Excludes</div>
              <ul className="incl-list" aria-label="What's excluded">
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Personal meals &amp; dining</li>
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Local buses &amp; trains</li>
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Personal travel insurance</li>
              </ul>
            </div>
            <div className="pkg-price-block">
              <div className="price-rows">
                <div className="price-row price-adult">
                  <div className="price-row-lbl">Per Adult</div>
                  <div className="price-row-amt"><sup>€</sup>2,990</div>
                  <div className="price-row-note">incl. return flights</div>
                </div>
                <div className="price-row price-child">
                  <div className="price-row-lbl">Child (9–14)</div>
                  <div className="price-row-amt"><sup>€</sup>1,195</div>
                  <div className="price-row-note">incl. return flights</div>
                </div>
              </div>
              <div className="pkg-meta">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 2"/></svg>
                10 Days &nbsp;·&nbsp; Aug–Sep 2026
              </div>
              <button className="btn-book" onClick={() => handleBook("Theme Parks & Cities", "Theme Parks & Cities — Adult €2,990 · Child €1,195")} aria-label="Reserve Theme Parks & Cities journey">
                Reserve This Journey
              </button>
            </div>
          </article>

          {/* PACKAGE 3 */}
          <article className="pkg" aria-label="Nature & Discovery package">
            <div className="pkg-band band-forest"></div>
            <div className="pkg-body">
              <span className="pkg-icon" aria-hidden="true">🌲</span>
              <div className="pkg-tier">Package 03 · Nature</div>
              <h3 className="pkg-name">Nature &amp; Discovery</h3>
              <p className="pkg-tagline">Hamburg&apos;s magnificent harbour, the ancient Black Forest, and Berchtesgaden&apos;s breathtaking Alpine lakes. A journey into Germany&apos;s wild heart.</p>
              <div className="pkg-route" aria-label="Route: Hamburg, Black Forest, Berchtesgaden, Munich">
                <span className="stop">Hamburg</span><span className="arr">→</span>
                <span className="stop">Black Forest</span><span className="arr">→</span>
                <span className="stop">Berchtesgaden</span>
              </div>
              
              <RouteMap id="map-nature" routeData={routes.nature} />

              <div className="incl-label" style={{ marginTop: "20px" }}>Included</div>
              <ul className="incl-list" aria-label="What's included">
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Return economy flights</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>9 nights, 4★ luxury hotels</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Daily breakfast</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Private airport pickup &amp; drop-off</li>
                <li><svg className="ic ic-y" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Dedicated 24/7 concierge</li>
              </ul>
              <div className="pkg-divider"></div>
              <div className="incl-label">Excludes</div>
              <ul className="incl-list" aria-label="What's excluded">
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Personal meals &amp; dining</li>
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Local buses &amp; trains</li>
                <li><svg className="ic ic-n" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity=".1"/><path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Personal travel insurance</li>
              </ul>
            </div>
            <div className="pkg-price-block">
              <div className="price-rows">
                <div className="price-row price-adult">
                  <div className="price-row-lbl">Per Adult</div>
                  <div className="price-row-amt"><sup>€</sup>2,772</div>
                  <div className="price-row-note">incl. return flights</div>
                </div>
                <div className="price-row price-child">
                  <div className="price-row-lbl">Child (9–14)</div>
                  <div className="price-row-amt"><sup>€</sup>1,061</div>
                  <div className="price-row-note">incl. return flights</div>
                </div>
              </div>
              <div className="pkg-meta">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 2"/></svg>
                10 Days &nbsp;·&nbsp; Aug–Sep 2026
              </div>
              <button className="btn-book" onClick={() => handleBook("Nature & Discovery", "Nature & Discovery — Adult €2,772 · Child €1,061")} aria-label="Reserve Nature & Discovery journey">
                Reserve This Journey
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ──═ WHY US ═── */}
      <section className="section" id="why-us" aria-labelledby="why-h">
        <div className="wrap" style={{ marginBottom: "44px" }}>
          <div className="section-lbl">Our Philosophy</div>
          <h2 className="section-h2" id="why-h">Crafted with <em>Obsessive</em> Care</h2>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-num" aria-hidden="true">01</div>
            <h3 className="why-title">Your Private Expert</h3>
            <p className="why-text">One dedicated travel expert manages your entire journey — not a call centre, a person who knows your family&apos;s preferences by name.</p>
          </div>
          <div className="why-card">
            <div className="why-num" aria-hidden="true">02</div>
            <h3 className="why-title">Bespoke by Design</h3>
            <p className="why-text">Every itinerary is individually crafted around your family&apos;s ages, interests, and pace. No two journeys are ever the same.</p>
          </div>
          <div className="why-card">
            <div className="why-num" aria-hidden="true">03</div>
            <h3 className="why-title">Seamless from Departure</h3>
            <p className="why-text">Private transfers, pre-arranged check-ins, confirmed reservations — your family steps into a world already perfectly arranged.</p>
          </div>
          <div className="why-card">
            <div className="why-num" aria-hidden="true">04</div>
            <h3 className="why-title">Always There for You</h3>
            <p className="why-text">24/7 support throughout your journey. Whether it&apos;s a changed flight or a spontaneous request — we handle it before you notice.</p>
          </div>
        </div>
      </section>

      {/* ──═ TESTIMONIALS ═── */}
      <section className="section section-alt" aria-labelledby="testi-h">
        <div className="wrap" style={{ marginBottom: "44px" }}>
          <div className="section-lbl">Guest Experiences</div>
          <h2 className="section-h2" id="testi-h">Families Who <em>Trusted</em> Us</h2>
        </div>
        <div className="testi-grid">
          <blockquote className="testi">
            <div className="testi-stars" aria-label="5 stars">★★★★★</div>
            <p className="testi-quote">&quot;Every single detail was handled with extraordinary care. My children still talk about the moment they first saw Neuschwanstein through the morning mist.&quot;</p>
            <div className="testi-author">Alexandra &amp; James Thornton</div>
            <div className="testi-loc">London, United Kingdom</div>
          </blockquote>
          <blockquote className="testi">
            <div className="testi-stars" aria-label="5 stars">★★★★★</div>
            <p className="testi-quote">&quot;The private transfer waiting at the airport set the tone for everything that followed. Pure, effortless luxury — exactly what our family needed.&quot;</p>
            <div className="testi-author">Henrik &amp; Marta Lindqvist</div>
            <div className="testi-loc">Stockholm, Sweden</div>
          </blockquote>
          <blockquote className="testi">
            <div className="testi-stars" aria-label="5 stars">★★★★★</div>
            <p className="testi-quote">&quot;Our concierge knew our children&apos;s names, their favourite foods, even remembered our son&apos;s fear of heights before the Zugspitze trip. Remarkable.&quot;</p>
            <div className="testi-author">Priya &amp; Arjun Mehta</div>
            <div className="testi-loc">Dubai, UAE</div>
          </blockquote>
        </div>
      </section>

      {/* ──═ LEAD FORM ═── */}
      <LeadForm externalSelectedPkg={selectedPkg} />

      <Footer />
    </>
  );
}
