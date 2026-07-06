"use client";

import { useEffect, useState, useCallback, use } from "react";
import { supabase } from "@/lib/supabase";
import { Lead, ItineraryDay, Concierge } from "@/types/database";

interface PortalPageProps {
  params: Promise<{ id: string }>;
}

export default function PortalPage({ params }: PortalPageProps) {
  const { id: leadId } = use(params);

  const [lead, setLead] = useState<Lead | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [concierge, setConcierge] = useState<Concierge | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(0);
  const [clientNote, setClientNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Load client data
  const loadPortalData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch lead
      const { data: leadData, error: leadErr } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadErr || !leadData) {
        setLoading(false);
        return;
      }

      const currentLead = leadData as Lead;
      setLead(currentLead);

      // 2. Fetch concierge details
      if (currentLead.assigned_concierge_id) {
        const { data: cData } = await supabase
          .from("concierges")
          .select("*")
          .eq("id", currentLead.assigned_concierge_id)
          .single();
        if (cData) {
          setConcierge(cData as Concierge);
        }
      }

      // 3. Fetch itinerary days
      const res = await fetch(`/api/itinerary?leadId=${leadId}`);
      if (res.ok) {
        const days = await res.json();
        setItinerary(days as ItineraryDay[]);
      }
    } catch (err) {
      console.error("Portal load error:", err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Register PWA Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(
        (registration) => {
          console.log("PWA SW registered successfully on scope: ", registration.scope);
        },
        (err) => {
          console.error("PWA SW registration failed: ", err);
        }
      );
    }
  }, []);

  // Handle client feedback note
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNote.trim()) return;

    setSubmittingNote(true);
    setNoteSuccess(false);

    try {
      const { error } = await supabase.from("activity_log").insert([
        {
          lead_id: leadId,
          action: "note_added",
          performed_by: "Client User",
          notes: `Client feedback: "${clientNote}"`,
        },
      ]);

      if (error) throw error;

      setClientNote("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle Stripe Checkout redirection (3.3)
  const handleStripeCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      if (!res.ok) throw new Error("Checkout session creation failed");

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout page
      } else {
        throw new Error("Missing checkout url in response");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please contact your concierge.");
      setCheckingOut(false);
    }
  };

  const getConciergePhone = (c: Concierge) => {
    if (c.name.toLowerCase().includes("chima")) {
      return "+491701234567";
    }
    return "+491707654321";
  };

  const getPackageLabel = (pkg: string) => {
    if (pkg === "bavaria_fairy_tales") return "Bavaria & Fairy Tales";
    if (pkg === "theme_parks_cities") return "Theme Parks & Cities";
    if (pkg === "nature_discovery") return "Nature & Discovery";
    return pkg;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0b0c10",
          color: "var(--gold)",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(197, 168, 128, 0.1)",
            borderTopColor: "var(--gold)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "var(--font-jost)" }}>
          Loading Bespoke Journey Portal...
        </div>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render 404 if lead is invalid
  if (!lead) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0b0c10",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "40px",
          color: "var(--white)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", color: "var(--gold)", marginBottom: "16px" }}>
          Portal Access Unverified
        </h1>
        <p style={{ fontFamily: "var(--font-jost)", color: "rgba(255,255,255,0.6)", maxWidth: "480px", fontSize: "14px", lineHeight: "1.6" }}>
          This luxury portal link is invalid, expired, or deactivated. Please check the URL secure token or contact your travel concierge.
        </p>
      </div>
    );
  }

  const isBooked = lead.status === "booked" || lead.status === "completed";

  return (
    <div
      style={{
        backgroundColor: "#0b0c10",
        color: "#e3e4e6",
        fontFamily: "var(--font-jost), sans-serif",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      {/* Premium Luxury Hero Title */}
      <header
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "48px 40px",
          textAlign: "center",
          background: "radial-gradient(circle at top, #161920 0%, #0b0c10 100%)",
        }}
      >
        <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--gold)", letterSpacing: "3px", fontWeight: 600, marginBottom: "8px" }}>
          BuyTripsNow OÜ — Bespoke Co-Creation
        </div>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 400, color: "var(--white)" }}>
          Your <em>Bespoke</em> Germany Itinerary
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", maxWidth: "600px", marginInline: "auto", marginTop: "12px", lineHeight: "1.6" }}>
          Welcome, {lead.first_name}. Collaborate with your concierge below. Click any day in the timeline to view details, then approve to secure your travel arrangements.
        </p>
      </header>

      <div style={{ maxWidth: "1200px", margin: "48px auto 0 auto", paddingInline: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px", alignItems: "flex-start" }}>
          
          {/* Main Area: Interactive Timeline */}
          <section aria-label="Itinerary Timeline">
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "28px", color: "var(--white)", marginBottom: "24px" }}>
              Journey Schedule
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {itinerary.map((day, idx) => {
                const isActive = activeDayIdx === idx;

                return (
                  <div
                    key={day.id}
                    style={{
                      background: "#111318",
                      border: isActive ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.04)",
                      borderRadius: "var(--r)",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Header bar click triggers collapse */}
                    <div
                      onClick={() => setActiveDayIdx(isActive ? null : idx)}
                      style={{
                        padding: "20px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--gold)",
                            background: "rgba(197, 168, 128, 0.1)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          DAY {day.day_number}
                        </span>
                        <h3 style={{ fontSize: "16px", fontWeight: 500, color: "var(--white)", margin: 0 }}>
                          {day.title}
                        </h3>
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>{isActive ? "▲" : "▼"}</span>
                    </div>

                    {isActive && (
                      <div
                        style={{
                          padding: "0 24px 24px 24px",
                          borderTop: "1px solid rgba(255,255,255,0.03)",
                          paddingTop: "20px",
                        }}
                      >
                        {day.hotel && (
                          <div style={{ display: "flex", gap: "12px", alignItems: "baseline", marginBottom: "16px" }}>
                            <span style={{ fontSize: "12px", color: "var(--gold)" }}>🏨 Hotel:</span>
                            <strong style={{ fontSize: "14px", color: "var(--white)" }}>{day.hotel}</strong>
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                          {day.morning_activity && (
                            <div>
                              <strong style={{ color: "var(--white)" }}>🌅 Morning:</strong> {day.morning_activity}
                            </div>
                          )}
                          {day.afternoon_activity && (
                            <div>
                              <strong style={{ color: "var(--white)" }}>☀️ Afternoon:</strong> {day.afternoon_activity}
                            </div>
                          )}
                          {day.evening_activity && (
                            <div>
                              <strong style={{ color: "var(--white)" }}>🌙 Evening:</strong> {day.evening_activity}
                            </div>
                          )}
                          {day.notes && (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "12px",
                                background: "#161920",
                                borderLeft: "2px solid var(--gold)",
                                borderRadius: "0 4px 4px 0",
                                fontSize: "12px",
                                fontStyle: "italic",
                              }}
                            >
                              💡 Note: {day.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Area: Status, Billing & Concierge */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Payment & Sign-off Card */}
            <div
              style={{
                background: "#111318",
                border: "1px solid rgba(197, 168, 128, 0.15)",
                borderRadius: "var(--r)",
                padding: "32px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
            >
              <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", color: "var(--white)", marginBottom: "16px" }}>
                Enquiry Status
              </h3>

              <div style={{ marginBottom: "20px" }}>
                <span className={`badge ${lead.status}`} style={{ fontSize: "13px", padding: "6px 12px" }}>
                  {lead.status.replace(/_/g, " ")}
                </span>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                  <span>Chosen Package</span>
                  <span>{getPackageLabel(lead.selected_package)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                  <span>Group size</span>
                  <span>{lead.num_adults} Adults {lead.num_children > 0 && `, ${lead.num_children} Children`}</span>
                </div>
                {isBooked ? (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", alignItems: "baseline" }}>
                    <span style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 600 }}>CONFIRMED TOTAL</span>
                    <strong style={{ fontSize: "24px", color: "var(--white)" }}>
                      {formatPrice(lead.amount_paid_cents / 0.3)} {/* Back-calculate total if deposit paid */}
                    </strong>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", alignItems: "baseline" }}>
                    <span style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 600 }}>ESTIMATED TOTAL</span>
                    <strong style={{ fontSize: "24px", color: "var(--white)" }}>
                      {lead.budget ? lead.budget.split(" – ").pop() : "Calculated at checkout"}
                    </strong>
                  </div>
                )}
              </div>

              {isBooked ? (
                <div
                  style={{
                    background: "rgba(0, 230, 118, 0.08)",
                    border: "1px solid rgba(0, 230, 118, 0.2)",
                    borderRadius: "var(--r)",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#00e676", fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>
                    ✓ Booking Secured
                  </div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                    We have received your payment. Your itinerary is locked and our operations team is booking your accommodations.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleStripeCheckout}
                  disabled={checkingOut}
                  style={{
                    width: "100%",
                    background: "var(--gold)",
                    border: "none",
                    borderRadius: "var(--r)",
                    color: "var(--ink)",
                    padding: "14px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  {checkingOut ? "Generating Session..." : "Secure Bespoke Journey"}
                </button>
              )}

              {!isBooked && (
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "12px", textAlign: "center", lineHeight: "1.4" }}>
                  * Requires a 30% deposit booking premium. Balance due 30 days before departure. Secure payments handled via Stripe checkout.
                </p>
              )}
            </div>

            {/* Concierge Contact Card */}
            {concierge && (
              <div
                style={{
                  background: "#111318",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "var(--r)",
                  padding: "24px",
                }}
              >
                <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--gold)", letterSpacing: "1px", marginBottom: "16px" }}>
                  Your Concierge Host
                </h4>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--gold)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "var(--ink)",
                      fontWeight: 600,
                      fontSize: "18px",
                    }}
                  >
                    {concierge.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--white)" }}>{concierge.name}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Senior Travel Planner</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <a
                    href={`mailto:${concierge.email}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "#161920",
                      border: "1px solid rgba(255,255,255,0.06)",
                      padding: "10px",
                      borderRadius: "var(--r)",
                      fontSize: "13px",
                      color: "var(--white)",
                      textDecoration: "none",
                    }}
                  >
                    ✉ Email Concierge
                  </a>
                  {getConciergePhone(concierge) && (
                    <a
                      href={`https://wa.me/${getConciergePhone(concierge).replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        background: "#075e54",
                        padding: "10px",
                        borderRadius: "var(--r)",
                        fontSize: "13px",
                        color: "var(--white)",
                        textDecoration: "none",
                      }}
                    >
                      💬 WhatsApp Instant Chat
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Co-Creation Feedback Note Form */}
            <div
              style={{
                background: "#111318",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: "var(--r)",
                padding: "24px",
              }}
            >
              <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--gold)", letterSpacing: "1px", marginBottom: "12px" }}>
                Suggest Adjustments
              </h4>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: "1.5", marginBottom: "16px" }}>
                Want to change hotels, swap excursions, or adjust dates? Message your concierge directly here.
              </p>

              {noteSuccess && (
                <div style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: "4px", color: "#00e676", fontSize: "12px", padding: "10px", marginBottom: "16px", textAlign: "center" }}>
                  Feedback logged. Your concierge will review and reply shortly.
                </div>
              )}

              <form onSubmit={handleSubmitFeedback}>
                <textarea
                  placeholder="e.g. Can we swap day 4's hike for a helicopter flight over the peaks?"
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    background: "#161920",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "var(--r)",
                    color: "var(--white)",
                    padding: "12px",
                    fontSize: "13px",
                    outline: "none",
                    marginBottom: "12px",
                    resize: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={submittingNote || !clientNote.trim()}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid var(--gold)",
                    color: "var(--gold)",
                    padding: "10px",
                    borderRadius: "var(--r)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {submittingNote ? "Sending message..." : "Send Adjustment Request"}
                </button>
              </form>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
