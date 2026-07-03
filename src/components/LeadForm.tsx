"use client";

import { useState, useEffect } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5_vUSvE0OHJxPtdXaDSohv9CH35diPkTu17Jo-gT-RS5pswkZS98EaWo70rVA0DM/exec";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  howHeard: string;
  selectedPkg: string;
  numAdults: string;
  numChildren: string;
  depDate: string;
  depCity: string;
  budget: string;
  hotelPref: string;
  flightClass: string;
  dietReq: string;
  specialReq: string;
  prevExp: string;
  contactPref: string;
  consent1: boolean;
  consent2: boolean;
}

interface LeadFormProps {
  externalSelectedPkg?: string;
}

export default function LeadForm({ externalSelectedPkg = "" }: LeadFormProps) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    howHeard: "",
    selectedPkg: "",
    numAdults: "2",
    numChildren: "2",
    depDate: "",
    depCity: "",
    budget: "",
    hotelPref: "",
    flightClass: "",
    dietReq: "",
    specialReq: "",
    prevExp: "",
    contactPref: "Email",
    consent1: false,
    consent2: false,
  });

  const [prevExternalSelectedPkg, setPrevExternalSelectedPkg] = useState(externalSelectedPkg);

  if (externalSelectedPkg !== prevExternalSelectedPkg) {
    setPrevExternalSelectedPkg(externalSelectedPkg);
    if (externalSelectedPkg) {
      setValues((prev) => ({ ...prev, selectedPkg: externalSelectedPkg }));
    }
  }

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Estimator States
  const [estimate, setEstimate] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<Array<{ label: string; amount: number }>>([]);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(false);

  // Field validation functions
  const rules = {
    firstName: (v: string) => v.trim().length > 0,
    lastName: (v: string) => v.trim().length > 0,
    email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    phone: (v: string) => v.trim().length > 5,
    selectedPkg: (v: string) => v.length > 0,
    numAdults: (v: string) => v.length > 0,
    depDate: (v: string) => {
      if (!v) return false;
      const d = new Date(v);
      const minD = new Date("2026-08-01");
      const maxD = new Date("2026-09-30");
      return d >= minD && d <= maxD;
    },
  };

  const handleBlur = (field: keyof typeof rules, value: string) => {
    const isValid = rules[field](value);
    setErrors((prev) => ({ ...prev, [field]: !isValid }));
  };

  const handleInputChange = (field: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user types valid input
    if (field in rules) {
      const fieldKey = field as keyof typeof rules;
      const isValid = rules[fieldKey](value as string);
      if (isValid) {
        setErrors((prev) => ({ ...prev, [field]: false }));
      }
    }
  };

  const validateStep = (s: number) => {
    const stepErrors: Record<string, boolean> = {};
    let ok = true;

    if (s === 1) {
      const fields: Array<"firstName" | "lastName" | "email" | "phone"> = [
        "firstName",
        "lastName",
        "email",
        "phone",
      ];
      fields.forEach((f) => {
        const isValid = rules[f](values[f]);
        if (!isValid) {
          stepErrors[f] = true;
          ok = false;
        }
      });
    }

    if (s === 2) {
      if (!values.selectedPkg) {
        stepErrors.selectedPkg = true;
        ok = false;
      }
      if (!rules.numAdults(values.numAdults)) {
        stepErrors.numAdults = true;
        ok = false;
      }
      if (!rules.depDate(values.depDate)) {
        stepErrors.depDate = true;
        ok = false;
      }
    }

    if (s === 4) {
      if (!values.consent1) {
        stepErrors.consent1 = true;
        ok = false;
      }
    }

    setErrors(stepErrors);
    return ok;
  };

  // Dynamic Quote Estimator effect (debounced 400ms)
  useEffect(() => {
    if (!values.selectedPkg) {
      setEstimate(null);
      setBreakdown([]);
      return;
    }

    setLoadingQuote(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedPkg: values.selectedPkg,
            numAdults: values.numAdults,
            numChildren: values.numChildren,
            flightClass: values.flightClass,
            hotelPref: values.hotelPref,
          }),
        });

        if (!res.ok) throw new Error("Quote fetch failed");
        const data = await res.json();
        setEstimate(data.estimate);
        setBreakdown(data.breakdown);
        setQuoteError(false);
      } catch (err) {
        console.error("Failed to load estimate:", err);
        setQuoteError(true);
      } finally {
        setLoadingQuote(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [
    values.selectedPkg,
    values.numAdults,
    values.numChildren,
    values.flightClass,
    values.hotelPref,
  ]);

  const renderQuoteEstimator = () => {
    if (!values.selectedPkg) return null;

    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(amount / 100);
    };

    return (
      <div className={`quote-estimator ${loadingQuote ? "loading" : ""}`}>
        <h4 className="quote-title">Estimated Total (Indicative)</h4>

        {quoteError ? (
          <div style={{ color: "var(--red-soft)", fontSize: "13px" }}>
            Error loading live estimate. We will confirm final pricing manually.
          </div>
        ) : (
          <>
            <div className="quote-breakdown">
              {breakdown.map((item, idx) => (
                <div className="quote-line" key={idx}>
                  <span className="quote-line-label">{item.label}</span>
                  <span className="quote-line-amount">{formatPrice(item.amount)}</span>
                </div>
              ))}
            </div>

            <div className="quote-divider" />

            <div className="quote-total-row">
              <span className="quote-total-label">Estimated Total</span>
              <span className="quote-total-value">
                {estimate !== null ? formatPrice(estimate) : "Calculating..."}
              </span>
            </div>

            <p className="quote-disclaimer">
              * This is an initial estimate. Your concierge will confirm final bespoke pricing.
            </p>
          </>
        )}
      </div>
    );
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(4, prev + 1));
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setSubmitError(false);

    const payload = {
      timestamp: new Date().toISOString(),
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      howHeard: values.howHeard,
      selectedPkg: values.selectedPkg,
      numAdults: values.numAdults,
      numChildren: values.numChildren,
      depDate: values.depDate,
      depCity: values.depCity,
      budget: values.budget,
      hotelPref: values.hotelPref,
      flightClass: values.flightClass,
      dietReq: values.dietReq,
      specialReq: values.specialReq,
      prevExp: values.prevExp,
      contactPref: values.contactPref,
      marketing: values.consent2 ? "Yes" : "No",
      source: "Germany 2026 Landing Page",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = await res.json();
      if (result.status === "success") {
        setSubmitSuccess(true);
        const win = window as unknown as { fbq?: (action: string, event: string, data?: Record<string, unknown>) => void };
        if (typeof win.fbq !== "undefined") {
          win.fbq("track", "Lead", { content_name: values.selectedPkg });
        }
      } else {
        throw new Error(result.message || "Server error");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Lead submission failed:", err);
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  return (
    <section className="form-section" id="enquiry-form" aria-labelledby="form-h">
      <div style={{ maxWidth: "820px", marginInline: "auto", marginBottom: "36px", paddingInline: 0 }}>
        <div className="section-lbl">Your Bespoke Journey Awaits</div>
        <h2 className="section-h2" id="form-h">Begin Your <em>Journey</em></h2>
        <p className="section-p">
          Complete this short enquiry and your personal travel expert will be in touch within 2 business hours to craft your bespoke Germany itinerary.
        </p>
      </div>

      <div className="form-wrap" role="form" aria-label="Travel enquiry form">
        {submitSuccess ? (
          <div className="form-success show" role="alert" aria-live="polite">
            <div className="success-ico">
              <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="14" cy="14" r="12" />
                <path d="M9 14l4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="success-h">Your Journey Begins</h3>
            <p className="success-p">
              Thank you — your enquiry has been received and your personal travel expert notified.
              <br />We will be in touch within <strong>2 business hours</strong>.<br /><br />
              Follow us on Instagram <a href="https://instagram.com/buytripsnow" target="_blank" rel="noopener noreferrer">@buytripsnow</a> for inspiration.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* TABS */}
            <div className="form-tabs" role="tablist" aria-label="Form steps" style={{ display: "flex" }}>
              <div className={`tab ${step === 1 ? "active" : ""} ${step > 1 ? "done" : ""}`} role="tab" aria-selected={step === 1}><div className="tab-n">1</div><span>Your Details</span></div>
              <div className={`tab ${step === 2 ? "active" : ""} ${step > 2 ? "done" : ""}`} role="tab" aria-selected={step === 2}><div className="tab-n">2</div><span>Your Trip</span></div>
              <div className={`tab ${step === 3 ? "active" : ""} ${step > 3 ? "done" : ""}`} role="tab" aria-selected={step === 3}><div className="tab-n">3</div><span>Preferences</span></div>
              <div className={`tab ${step === 4 ? "active" : ""} ${step > 4 ? "done" : ""}`} role="tab" aria-selected={step === 4}><div className="tab-n">4</div><span>Confirm</span></div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="panel active" id="panel-1" role="tabpanel" aria-label="Step 1: Your details">
                <h3 className="panel-title">Tell us about yourself</h3>
                <p className="panel-sub">Your concierge uses this to personalise your experience from day one.</p>
                <div className="field-row">
                  <div className={`field ${errors.firstName ? "err" : ""}`} id="ff-fn">
                    <label htmlFor="firstName">First Name <span style={{ color: "var(--red-soft)" }}>*</span></label>
                    <input
                      type="text"
                      id="firstName"
                      placeholder="Alexandra"
                      autoComplete="given-name"
                      value={values.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName", values.firstName)}
                      required
                    />
                    <span className="field-err">Please enter your first name</span>
                  </div>
                  <div className={`field ${errors.lastName ? "err" : ""}`} id="ff-ln">
                    <label htmlFor="lastName">Last Name <span style={{ color: "var(--red-soft)" }}>*</span></label>
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Thornton"
                      autoComplete="family-name"
                      value={values.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName", values.lastName)}
                      required
                    />
                    <span className="field-err">Please enter your last name</span>
                  </div>
                </div>
                <div className="field-row">
                  <div className={`field ${errors.email ? "err" : ""}`} id="ff-em">
                    <label htmlFor="email">Email Address <span style={{ color: "var(--red-soft)" }}>*</span></label>
                    <input
                      type="email"
                      id="email"
                      placeholder="alexandra@example.com"
                      autoComplete="email"
                      value={values.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleBlur("email", values.email)}
                      required
                    />
                    <span className="field-err">Please enter a valid email</span>
                  </div>
                  <div className={`field ${errors.phone ? "err" : ""}`} id="ff-ph">
                    <label htmlFor="phone">Phone / WhatsApp <span style={{ color: "var(--red-soft)" }}>*</span></label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="+44 7700 900000"
                      autoComplete="tel"
                      value={values.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone", values.phone)}
                      required
                    />
                    <span className="field-err">Please enter your phone number</span>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="country">Country of Residence</label>
                    <select id="country" value={values.country} onChange={(e) => handleInputChange("country", e.target.value)}>
                      <option value="">Select country…</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Australia</option>
                      <option>Canada</option>
                      <option>Germany</option>
                      <option>France</option>
                      <option>Sweden</option>
                      <option>Norway</option>
                      <option>Denmark</option>
                      <option>Finland</option>
                      <option>Estonia</option>
                      <option>Netherlands</option>
                      <option>Switzerland</option>
                      <option>Austria</option>
                      <option>UAE</option>
                      <option>Singapore</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="howHeard">How did you hear about us?</label>
                    <select id="howHeard" value={values.howHeard} onChange={(e) => handleInputChange("howHeard", e.target.value)}>
                      <option value="">Select…</option>
                      <option>Google Search</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                      <option>LinkedIn</option>
                      <option>Friend / Family Referral</option>
                      <option>Travel Magazine</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="panel active" id="panel-2" role="tabpanel" aria-label="Step 2: Your trip">
                <h3 className="panel-title">About your journey</h3>
                <p className="panel-sub">Help us understand your travel group so we can tailor every detail.</p>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(13,15,20,.52)", marginBottom: "10px" }}>
                  Select a package <span style={{ color: "var(--red-soft)" }}>*</span>
                </p>
                <div className="pkg-picks" id="pkgPicks">
                  <label className={`pick ${values.selectedPkg.startsWith("Bavaria & Fairy Tales") ? "sel" : ""}`} id="pick-1">
                    <input
                      type="radio"
                      name="pkg"
                      value="Bavaria & Fairy Tales — Adult €2,557 · Child €1,080"
                      checked={values.selectedPkg.startsWith("Bavaria & Fairy Tales")}
                      onChange={(e) => handleInputChange("selectedPkg", e.target.value)}
                    />
                    <span className="pick-e">🏰</span>
                    <div className="pick-name">Bavaria &amp; Fairy Tales</div>
                    <div className="pick-price">Adult €2,557 · Child €1,080</div>
                    <div className="pick-ck" aria-hidden="true">
                      <svg viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4l3 3 5-6" /></svg>
                    </div>
                  </label>
                  <label className={`pick ${values.selectedPkg.startsWith("Theme Parks & Cities") ? "sel" : ""}`} id="pick-2">
                    <input
                      type="radio"
                      name="pkg"
                      value="Theme Parks & Cities — Adult €2,990 · Child €1,195"
                      checked={values.selectedPkg.startsWith("Theme Parks & Cities")}
                      onChange={(e) => handleInputChange("selectedPkg", e.target.value)}
                    />
                    <span className="pick-e">🎢</span>
                    <div className="pick-name">Theme Parks &amp; Cities</div>
                    <div className="pick-price">Adult €2,990 · Child €1,195</div>
                    <div className="pick-ck" aria-hidden="true">
                      <svg viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4l3 3 5-6" /></svg>
                    </div>
                  </label>
                  <label className={`pick ${values.selectedPkg.startsWith("Nature & Discovery") ? "sel" : ""}`} id="pick-3">
                    <input
                      type="radio"
                      name="pkg"
                      value="Nature & Discovery — Adult €2,772 · Child €1,061"
                      checked={values.selectedPkg.startsWith("Nature & Discovery")}
                      onChange={(e) => handleInputChange("selectedPkg", e.target.value)}
                    />
                    <span className="pick-e">🌲</span>
                    <div className="pick-name">Nature &amp; Discovery</div>
                    <div className="pick-price">Adult €2,772 · Child €1,061</div>
                    <div className="pick-ck" aria-hidden="true">
                      <svg viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4l3 3 5-6" /></svg>
                    </div>
                  </label>
                </div>
                {errors.selectedPkg && <span className="field-err" id="pkg-err" style={{ display: "block", marginBottom: "12px" }}>Please select a package</span>}
                <div className="field-row">
                  <div className={`field ${errors.numAdults ? "err" : ""}`} id="ff-ad">
                    <label htmlFor="numAdults">Number of Adults <span style={{ color: "var(--red-soft)" }}>*</span></label>
                    <select id="numAdults" value={values.numAdults} onChange={(e) => handleInputChange("numAdults", e.target.value)} required>
                      <option value="">Select…</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6+</option>
                    </select>
                    <span className="field-err">Required</span>
                  </div>
                  <div className="field">
                    <label htmlFor="numChildren">Children (ages 9–14)</label>
                    <select id="numChildren" value={values.numChildren} onChange={(e) => handleInputChange("numChildren", e.target.value)}>
                      <option value="">None</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5+</option>
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <div className={`field ${errors.depDate ? "err" : ""}`} id="ff-dt">
                    <label htmlFor="depDate">Preferred Departure Date <span style={{ color: "var(--red-soft)" }}>*</span></label>
                    <input
                      type="date"
                      id="depDate"
                      min="2026-08-01"
                      max="2026-09-30"
                      value={values.depDate}
                      onChange={(e) => handleInputChange("depDate", e.target.value)}
                      onBlur={() => handleBlur("depDate", values.depDate)}
                      required
                    />
                    <span className="field-err">Please select a date (Aug–Sep 2026)</span>
                  </div>
                  <div className="field">
                    <label htmlFor="depCity">Departure City / Airport</label>
                    <input
                      type="text"
                      id="depCity"
                      placeholder="e.g. London Heathrow, Dubai"
                      value={values.depCity}
                      onChange={(e) => handleInputChange("depCity", e.target.value)}
                    />
                  </div>
                </div>
                {renderQuoteEstimator()}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="panel active" id="panel-3" role="tabpanel" aria-label="Step 3: Preferences">
                <h3 className="panel-title">Your preferences</h3>
                <p className="panel-sub">The more you share, the more precisely we can curate your journey.</p>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="budget">Total Family Budget</label>
                    <select id="budget" value={values.budget} onChange={(e) => handleInputChange("budget", e.target.value)}>
                      <option value="">Prefer not to say</option>
                      <option>€5,000 – €8,000</option>
                      <option>€8,000 – €12,000</option>
                      <option>€12,000 – €18,000</option>
                      <option>€18,000 – €25,000</option>
                      <option>€25,000+</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="hotelPref">Hotel Preference</label>
                    <select id="hotelPref" value={values.hotelPref} onChange={(e) => handleInputChange("hotelPref", e.target.value)}>
                      <option value="">No preference</option>
                      <option>4-Star Luxury</option>
                      <option>5-Star Deluxe</option>
                      <option>Boutique / Design Hotel</option>
                      <option>Castle / Heritage Property</option>
                      <option>Family Resort with Amenities</option>
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="flightClass">Flight Class</label>
                    <select id="flightClass" value={values.flightClass} onChange={(e) => handleInputChange("flightClass", e.target.value)}>
                      <option value="">Economy (included in price)</option>
                      <option>Premium Economy (upgrade)</option>
                      <option>Business Class (upgrade)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="dietReq">Dietary Requirements</label>
                    <input
                      type="text"
                      id="dietReq"
                      placeholder="e.g. vegetarian, halal, nut allergy"
                      value={values.dietReq}
                      onChange={(e) => handleInputChange("dietReq", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field-row" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="field">
                    <label htmlFor="specialReq">Special Requests or Occasions</label>
                    <textarea
                      id="specialReq"
                      placeholder="Anniversary celebrations, mobility requirements, specific experiences your family dreams of…"
                      value={values.specialReq}
                      onChange={(e) => handleInputChange("specialReq", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="prevExp">Previous Luxury Travel</label>
                    <select id="prevExp" value={values.prevExp} onChange={(e) => handleInputChange("prevExp", e.target.value)}>
                      <option value="">Select…</option>
                      <option>First luxury trip</option>
                      <option>Occasional luxury traveller</option>
                      <option>Frequent luxury traveller</option>
                      <option>We travel in luxury exclusively</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="contactPref">Preferred Contact Method</label>
                    <select id="contactPref" value={values.contactPref} onChange={(e) => handleInputChange("contactPref", e.target.value)}>
                      <option>Email</option>
                      <option>WhatsApp</option>
                      <option>Phone Call</option>
                      <option>Video Call</option>
                    </select>
                  </div>
                </div>
                {renderQuoteEstimator()}
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="panel active" id="panel-4" role="tabpanel" aria-label="Step 4: Confirm and submit">
                <h3 className="panel-title">Final confirmation</h3>
                <p className="panel-sub">Please review your enquiry below. Your concierge will respond within 2 business hours.</p>
                <div className="summary-box" id="summaryBox">
                  <strong style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontSize: "16px", color: "var(--ink)", marginBottom: "8px" }}>
                    Your Enquiry Summary
                  </strong>
                  <b>Name:</b> {values.firstName} {values.lastName}<br />
                  <b>Email:</b> {values.email}<br />
                  <b>Phone:</b> {values.phone}<br />
                  <b>Package:</b> {values.selectedPkg ? values.selectedPkg.split(" — ")[0] : "—"}<br />
                  <b>Adults:</b> {values.numAdults}
                  {values.numChildren && <> &nbsp;·&nbsp; <b>Children (9–14):</b> {values.numChildren}</>}<br />
                  <b>Departure:</b> {values.depDate}
                  {values.depCity && <> &nbsp;·&nbsp; {values.depCity}</>}<br />
                  {estimate !== null && (
                    <>
                      <b>Estimated Total:</b> {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimate / 100)} (Indicative)<br />
                    </>
                  )}
                  {values.specialReq && <><b>Special Requests:</b> {values.specialReq}</>}
                </div>
                <div className="consent">
                  <input
                    type="checkbox"
                    id="consent1"
                    checked={values.consent1}
                    onChange={(e) => handleInputChange("consent1", e.target.checked)}
                    required
                  />
                  <label htmlFor="consent1" className="consent-text">
                    I agree to BuyTripsNow OÜ&apos;s <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and consent to my personal data being processed to handle this enquiry. <span style={{ color: "var(--red-soft)" }}>*</span>
                  </label>
                </div>
                <div className="consent">
                  <input
                    type="checkbox"
                    id="consent2"
                    checked={values.consent2}
                    onChange={(e) => handleInputChange("consent2", e.target.checked)}
                  />
                  <label htmlFor="consent2" className="consent-text">
                    I&apos;d like to receive exclusive travel inspiration and early-access offers from BuyTripsNow OÜ. I can unsubscribe at any time.
                  </label>
                </div>
                {errors.consent1 && <span className="field-err" id="consent-err" style={{ display: "block", marginBottom: "12px" }}>You must accept our privacy policy to continue</span>}
                {submitError && (
                  <div className="submit-err show" id="submitErr">
                    Something went wrong. Please try again or email <strong>chima@buytripsnow.com</strong>
                  </div>
                )}
              </div>
            )}

            {/* NAV */}
            <div className="form-nav" id="formNav">
              <button
                type="button"
                className="btn-prev"
                id="prevBtn"
                onClick={handlePrev}
                style={{ visibility: step > 1 ? "visible" : "hidden" }}
                aria-label="Previous step"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 2L3 6.5l5 4.5" /></svg>
                Previous
              </button>
              {step === 4 ? (
                <button type="submit" className="btn-next submit" id="nextBtn" disabled={submitting} aria-label="Submit enquiry">
                  {submitting ? (
                    <>
                      <span className="spin"></span> Submitting…
                    </>
                  ) : (
                    <>
                      Submit Enquiry
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 2l5 4.5L5 11" /></svg>
                    </>
                  )}
                </button>
              ) : (
                <button type="button" className="btn-next" id="nextBtn" onClick={handleNext} aria-label="Next step">
                  Next Step
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 2l5 4.5L5 11" /></svg>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
