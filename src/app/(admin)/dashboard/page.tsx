"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Lead,
  Concierge,
  Quote,
  ActivityLog,
  LeadStatus,
} from "@/types/database";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [concierges, setConcierges] = useState<Concierge[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [packageFilter, setPackageFilter] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Fetch concierges
  useEffect(() => {
    const fetchConcierges = async () => {
      const { data, error } = await supabase
        .from("concierges")
        .select("*")
        .eq("is_active", true);

      if (!error && data) {
        setConcierges(data as Concierge[]);
      }
    };
    fetchConcierges();
  }, []);

  // Fetch leads list
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Load details (quotes & activity logs) when selectedLead changes
  const fetchLeadDetails = useCallback(async (leadId: string) => {
    // 1. Fetch quotes
    const { data: quoteData } = await supabase
      .from("quotes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (quoteData) {
      setQuotes(quoteData as Quote[]);
    }

    // 2. Fetch logs
    const { data: logData } = await supabase
      .from("activity_log")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (logData) {
      setLogs(logData as ActivityLog[]);
    }
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchLeadDetails(selectedLead.id);
    } else {
      setQuotes([]);
      setLogs([]);
    }
  }, [selectedLead, fetchLeadDetails]);

  // Handle status transitions
  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!selectedLead) return;

    const oldStatus = selectedLead.status;

    // Update leads table
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", selectedLead.id);

    if (updateError) {
      alert("Failed to update status: " + updateError.message);
      return;
    }

    // Insert log row
    const { error: logError } = await supabase.from("activity_log").insert([
      {
        lead_id: selectedLead.id,
        action: "status_changed",
        performed_by: "Concierge User",
        notes: `Changed status from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
        metadata_json: { old_status: oldStatus, new_status: newStatus },
      },
    ]);

    if (logError) {
      console.error("Failed to insert log:", logError);
    }

    // Refresh layout data
    const updatedLead = { ...selectedLead, status: newStatus };
    setSelectedLead(updatedLead);
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? updatedLead : l))
    );
    fetchLeadDetails(selectedLead.id);
  };

  // Handle concierge reassignment
  const handleReassignment = async (conciergeId: string | null) => {
    if (!selectedLead) return;

    const conciergeName =
      conciergeId === null
        ? "Unassigned"
        : concierges.find((c) => c.id === conciergeId)?.name || "Unknown";

    const { error: updateError } = await supabase
      .from("leads")
      .update({ assigned_concierge_id: conciergeId })
      .eq("id", selectedLead.id);

    if (updateError) {
      alert("Failed to reassign: " + updateError.message);
      return;
    }

    const { error: logError } = await supabase.from("activity_log").insert([
      {
        lead_id: selectedLead.id,
        action: "lead_assigned",
        performed_by: "Concierge User",
        notes: `Reassigned lead ownership to: ${conciergeName}`,
      },
    ]);

    if (logError) {
      console.error("Failed to insert log:", logError);
    }

    const updatedLead = { ...selectedLead, assigned_concierge_id: conciergeId };
    setSelectedLead(updatedLead);
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? updatedLead : l))
    );
    fetchLeadDetails(selectedLead.id);
  };

  // Handle custom note submissions
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteInput.trim()) return;

    setSubmittingNote(true);

    const { error } = await supabase.from("activity_log").insert([
      {
        lead_id: selectedLead.id,
        action: "note_added",
        performed_by: "Concierge User",
        notes: noteInput,
      },
    ]);

    setSubmittingNote(false);

    if (error) {
      alert("Failed to add note: " + error.message);
    } else {
      setNoteInput("");
      fetchLeadDetails(selectedLead.id);
    }
  };

  // Helper formats
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getPackageLabel = (pkg: string) => {
    if (pkg === "bavaria_fairy_tales") return "Bavaria & Fairy Tales";
    if (pkg === "theme_parks_cities") return "Theme Parks & Cities";
    if (pkg === "nature_discovery") return "Nature & Discovery";
    return pkg;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filtering leads list in client side memory
  const filteredLeads = leads.filter((lead) => {
    const nameMatch = `${lead.first_name} ${lead.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const emailMatch = lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = lead.phone.includes(searchQuery);

    const matchQuery = nameMatch || emailMatch || phoneMatch;
    const matchStatus = statusFilter === "" || lead.status === statusFilter;
    const matchPackage = packageFilter === "" || lead.selected_package === packageFilter;

    return matchQuery && matchStatus && matchPackage;
  });

  return (
    <>
      <header className="crm-header">
        <h1 className="crm-header-title">Leads Pipeline</h1>
        <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.45)" }}>
          Germany Late Summer Late 2026 Campaign
        </div>
      </header>

      <div className="crm-content">
        {/* KPI Panel Grid */}
        <section className="crm-stats-grid" aria-label="KPI Stats Summary">
          <div className="crm-stat-card">
            <span className="crm-stat-label">Total Leads</span>
            <span className="crm-stat-val">{leads.length}</span>
          </div>
          <div className="crm-stat-card">
            <span className="crm-stat-label">New Enquiries</span>
            <span className="crm-stat-val crm-stat-accent">
              {leads.filter((l) => l.status === "new").length}
            </span>
          </div>
          <div className="crm-stat-card">
            <span className="crm-stat-label">Booked Journeys</span>
            <span className="crm-stat-val" style={{ color: "#00e676" }}>
              {leads.filter((l) => l.status === "booked").length}
            </span>
          </div>
          <div className="crm-stat-card">
            <span className="crm-stat-label">Active Workload</span>
            <span className="crm-stat-val">
              {leads.filter((l) => l.status !== "completed" && l.status !== "cancelled").length}
            </span>
          </div>
        </section>

        {/* Dashboard Split Sections */}
        <div className="crm-dashboard-split">
          {/* Left panel: Filters + Table */}
          <div className="crm-leads-list-section">
            <div className="crm-panel-card">
              {/* Filters bar */}
              <div className="crm-filters-row">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  className="crm-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="crm-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by Status"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="itinerary_sent">Itinerary Sent</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  className="crm-filter-select"
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                  aria-label="Filter by Package"
                >
                  <option value="">All Packages</option>
                  <option value="bavaria_fairy_tales">Bavaria & Fairy Tales</option>
                  <option value="theme_parks_cities">Theme Parks & Cities</option>
                  <option value="nature_discovery">Nature & Discovery</option>
                </select>
              </div>

              {/* Leads Table */}
              <div className="crm-table-container">
                {loading ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                    Loading leads database records...
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                    No leads match the active search filter criteria.
                  </div>
                ) : (
                  <table className="crm-table" aria-label="Leads Pipeline List">
                    <thead>
                      <tr>
                        <th scope="col">Received Date</th>
                        <th scope="col">Name</th>
                        <th scope="col">Package Selected</th>
                        <th scope="col">Pipeline Status</th>
                        <th scope="col">Owner Assignment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => {
                        const ownerName =
                          concierges.find((c) => c.id === lead.assigned_concierge_id)?.name ||
                          "Unassigned";
                        const isSelected = selectedLead?.id === lead.id;

                        return (
                          <tr
                            key={lead.id}
                            className={isSelected ? "selected" : ""}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <td>{formatDate(lead.created_at)}</td>
                            <td style={{ fontWeight: 600 }}>
                              {lead.first_name} {lead.last_name}
                            </td>
                            <td>{getPackageLabel(lead.selected_package)}</td>
                            <td>
                              <span className={`badge ${lead.status}`}>{lead.status}</span>
                            </td>
                            <td>{ownerName}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Details Card (Sticky slide-out feel) */}
          {selectedLead && (
            <div className="crm-lead-details-sidebar" aria-label="Lead details and action cards">
              <div className="crm-details-hdr">
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{
                    float: "right",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                  aria-label="Close details"
                >
                  ✕
                </button>
                <h2 className="crm-details-name">
                  {selectedLead.first_name} {selectedLead.last_name}
                </h2>
                <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)" }}>
                  Registered Enquiry · ID: {selectedLead.id.slice(0, 8)}
                </div>
              </div>

              {/* Status Action Pipeline Controllers */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "8px",
                  }}
                >
                  Pipeline Action State
                </label>
                <select
                  className="crm-filter-select"
                  style={{ width: "100%", background: "#161920" }}
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  aria-label="Update pipeline status"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="itinerary_sent">Itinerary Sent</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Concierge reassignment option */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "8px",
                  }}
                >
                  Concierge Assignment
                </label>
                <select
                  className="crm-filter-select"
                  style={{ width: "100%", background: "#161920" }}
                  value={selectedLead.assigned_concierge_id || ""}
                  onChange={(e) => handleReassignment(e.target.value || null)}
                  aria-label="Change assigned concierge"
                >
                  <option value="">Unassigned</option>
                  {concierges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Info and Group Details grid */}
              <h3 className="crm-details-sec-title">Contact & Enquiry Parameters</h3>
              <div className="crm-details-grid">
                <div>
                  <div className="crm-details-label">Email</div>
                  <div className="crm-details-val" style={{ fontSize: "12px" }}>
                    {selectedLead.email}
                  </div>
                </div>
                <div>
                  <div className="crm-details-label">Phone</div>
                  <div className="crm-details-val" style={{ fontSize: "12px" }}>
                    {selectedLead.phone}
                  </div>
                </div>
                <div>
                  <div className="crm-details-label">Departure Date</div>
                  <div className="crm-details-val">{selectedLead.dep_date}</div>
                </div>
                <div>
                  <div className="crm-details-label">Departure From</div>
                  <div className="crm-details-val">{selectedLead.dep_city || "—"}</div>
                </div>
                <div>
                  <div className="crm-details-label">Group Composition</div>
                  <div className="crm-details-val">
                    {selectedLead.num_adults} Adults
                    {selectedLead.num_children > 0 && ` · ${selectedLead.num_children} Children`}
                  </div>
                </div>
                <div>
                  <div className="crm-details-label">Contact Pref</div>
                  <div className="crm-details-val" style={{ textTransform: "capitalize" }}>
                    {selectedLead.contact_pref}
                  </div>
                </div>
                <div>
                  <div className="crm-details-label">Budget Range</div>
                  <div className="crm-details-val">{selectedLead.budget || "—"}</div>
                </div>
                <div>
                  <div className="crm-details-label">Residence</div>
                  <div className="crm-details-val">{selectedLead.country || "—"}</div>
                </div>
                <div className="crm-details-val-full">
                  <div className="crm-details-label">Marketing Consent</div>
                  <div className="crm-details-val">
                    {selectedLead.marketing_consent ? "✓ Consented" : "✕ Opted Out"}
                  </div>
                </div>
              </div>

              {/* Client Upgrades preferences */}
              <h3 className="crm-details-sec-title">Luxury Tiers</h3>
              <div className="crm-details-grid">
                <div>
                  <div className="crm-details-label">Hotel Class</div>
                  <div className="crm-details-val" style={{ textTransform: "capitalize" }}>
                    {selectedLead.hotel_pref?.replace(/_/g, " ")}
                  </div>
                </div>
                <div>
                  <div className="crm-details-label">Flight Class</div>
                  <div className="crm-details-val" style={{ textTransform: "capitalize" }}>
                    {selectedLead.flight_class.replace(/_/g, " ")}
                  </div>
                </div>
                {selectedLead.diet_req && (
                  <div className="crm-details-val-full">
                    <div className="crm-details-label">Dietary Requirements</div>
                    <div className="crm-details-val">{selectedLead.diet_req}</div>
                  </div>
                )}
                {selectedLead.special_req && (
                  <div className="crm-details-val-full">
                    <div className="crm-details-label">Special Requests</div>
                    <div className="crm-details-val">{selectedLead.special_req}</div>
                  </div>
                )}
              </div>

              {/* Financial calculations */}
              <h3 className="crm-details-sec-title">Enquiry Pricing Estimate</h3>
              <div style={{ background: "#161920", padding: "16px", borderRadius: "var(--r)" }}>
                {quotes.length > 0 ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
                        Calculation
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
                        Cents sum
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Base Package ({getPackageLabel(quotes[0].package_name)})</span>
                        <span>
                          {formatPrice(
                            quotes[0].base_price_adult * quotes[0].num_adults +
                              quotes[0].base_price_child * quotes[0].num_children
                          )}
                        </span>
                      </div>
                      {quotes[0].upgrades_json &&
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (quotes[0].upgrades_json as any[]).map((up, idx) => (
                          <div style={{ display: "flex", justifyContent: "space-between" }} key={idx}>
                            <span>{up.label}</span>
                            <span>{formatPrice(up.amount)}</span>
                          </div>
                        ))}
                    </div>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>
                        ESTIMATED TOTAL
                      </span>
                      <strong style={{ fontSize: "18px", color: "var(--white)" }}>
                        {formatPrice(quotes[0].total_estimate)}
                      </strong>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    No dynamic quote estimate has been calculated for this lead.
                  </div>
                )}
              </div>

              {/* Event Logs list & note submission */}
              <h3 className="crm-details-sec-title">Activity Trail & Logs</h3>
              <form onSubmit={handleAddNote} style={{ marginBottom: "20px", display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Type a concierge update or note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="crm-search-input"
                  style={{ background: "#161920", border: "1px solid rgba(255,255,255,0.05)" }}
                />
                <button
                  type="submit"
                  disabled={submittingNote || !noteInput.trim()}
                  style={{
                    background: "var(--gold)",
                    color: "var(--ink)",
                    border: "none",
                    borderRadius: "var(--r)",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {submittingNote ? "Saving..." : "Add"}
                </button>
              </form>

              <div className="crm-logs-list">
                {logs.map((log) => (
                  <div className="crm-log-item" key={log.id}>
                    <div className="crm-log-time">
                      {formatDate(log.created_at)} at{" "}
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="crm-log-notes">
                      <strong>
                        [{log.action.replace(/_/g, " ").toUpperCase()}] by {log.performed_by || "system"}
                      </strong>
                      <div style={{ marginTop: "4px", color: "rgba(255,255,255,0.75)" }}>{log.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
