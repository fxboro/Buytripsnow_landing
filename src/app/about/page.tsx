import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us | BuyTripsNow Luxury Travel Concierge",
};

export default function AboutPage() {
  return (
    <>
      <Nav isHome={false} />

      {/* ─── HERO ─── */}
      <header className="hero hero-about" role="banner">
        <div className="hero-inner" style={{ textAlign: "center" }}>
          <p className="hero-eyebrow" style={{ justifyContent: "center", opacity: 1, transform: "none", animation: "none" }}>
            EST. 2024 &nbsp;·&nbsp; TALLINN, ESTONIA
          </p>
          <h1 className="hero-h1" style={{ opacity: 1, transform: "none", animation: "none" }}>
            Redefining Luxury Travel Through<br /><em>Elegance</em> and <em>Innovation</em>
          </h1>
          <p className="hero-sub" style={{ marginInline: "auto", opacity: 1, transform: "none", animation: "none", fontSize: "clamp(15px, 2vw, 18px)", maxWidth: "800px", marginBottom: 0 }}>
            Welcome to BuyTripsNow, a premier luxury online travel concierge based in the digital heart of Europe—Tallinn, Estonia. We do not just book trips; we architect extraordinary journeys. Born from a passion for exploration and a commitment to flawless execution, we cater to discerning corporate executives and private travel enthusiasts who demand nothing less than perfection.
          </p>
        </div>
      </header>

      {/* ─── ABOUT CONTENT ─── */}
      <main>
        {/* Two Years of Extraordinary Journeys */}
        <section className="section section-alt">
          <div className="about-section-grid two-cols">
            <div className="col-text">
              <h2 className="section-h2 reveal vis">Two Years of <em>Extraordinary</em> Journeys</h2>
              <p className="section-p reveal d1 vis" style={{ maxWidth: "100%", marginBottom: 0 }}>
                Over the past two years, BuyTripsNow has rapidly emerged as a trusted partner in high-end travel. We specialize in curating bespoke travel packages that transcend the ordinary. From exclusive corporate retreats to intimate family getaways, our dedicated concierge team meticulously handles every detail. We blend insider knowledge with unparalleled access to ensure your experience is seamless, private, and entirely unforgettable.
              </p>
            </div>
            <div className="col-img reveal d2 vis">
              <div className="stat-grid" style={{ boxShadow: "0 20px 64px rgba(0,0,0,.3)" }}>
                <div className="stat-cell"><div className="stat-num">500+</div><div className="stat-lbl">Families Served</div></div>
                <div className="stat-cell"><div className="stat-num">2</div><div className="stat-lbl">Years Excellence</div></div>
                <div className="stat-cell"><div className="stat-num">98%</div><div className="stat-lbl">Satisfaction Rate</div></div>
                <div className="stat-cell"><div className="stat-num">24/7</div><div className="stat-lbl">Concierge Support</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* Where Concept Meets Technology */}
        <section className="section">
          <div className="about-section-grid two-cols rev">
            <div className="col-text">
              <h2 className="section-h2 reveal vis">Where <em>Concept</em> Meets <em>Technology</em></h2>
              <p className="section-p reveal d1 vis" style={{ maxWidth: "100%", marginBottom: 0 }}>
                What truly distinguishes BuyTripsNow is our unique synergy of visionary travel concepts and cutting-edge technology. In today&apos;s fast-paced world, true luxury is the absence of friction. By leveraging intuitive, technology-driven travel solutions, we eliminate the complexities of planning. From your initial inquiry to your safe return, our digital platforms and bespoke UI provide a frictionless, highly personalized, and secure experience.
              </p>
            </div>
            <div className="col-img reveal d2 vis">
              <img src="/images/about_tech.png" alt="Concept Meets Technology" className="about-image" />
            </div>
          </div>
        </section>

        {/* The EU Standard of Excellence */}
        <section className="section section-alt">
          <div className="about-section-grid">
            <div style={{ textAlign: "center", maxWidth: "800px", marginInline: "auto" }}>
              <h2 className="section-h2 reveal vis">The <em>EU Standard</em> of Excellence</h2>
              <p className="section-p reveal d1 vis" style={{ maxWidth: "100%", marginInline: "auto", marginBottom: 0 }}>
                As a proud EU-registered travel startup, we operate with the highest standards of transparency, security, and discretion. Our deep-rooted connections across the globe allow us to unlock hidden gems, secure premium accommodations, and provide VIP treatment at every touchpoint. With BuyTripsNow, your journey is safeguarded by rigorous European standards and elevated by our unwavering dedication to service.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-banner">
          <div className="wrap">
            <h2 className="section-h2 reveal vis" style={{ marginBottom: "24px" }}>Embark on Your Next <em>Masterpiece</em></h2>
            <p className="section-p reveal d1 vis" style={{ marginInline: "auto", maxWidth: "600px", marginBottom: "36px" }}>
              Your time is your most valuable asset. Allow us to transform it into lifelong memories. Whether you are envisioning a late-summer escape in Germany or a highly coordinated corporate excursion, BuyTripsNow is ready to craft your next masterpiece.
            </p>
            <div className="reveal d2 vis" style={{ display: "flex", justifyContent: "center" }}>
              <Link href="/#enquiry-form" className="btn-primary" aria-label="Begin Your Journey">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ width: "16px", height: "16px", marginRight: "8px" }}><path d="M8 1l7 7-7 7M1 8h14"/></svg>
                Begin Your Journey
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
