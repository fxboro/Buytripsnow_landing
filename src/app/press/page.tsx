import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Press & Media | BuyTripsNow Luxury Travel Concierge",
};

export default function PressPage() {
  return (
    <>
      <Nav isHome={false} />

      {/* ─── HERO ─── */}
      <header className="hero hero-press" role="banner">
        <div className="hero-inner" style={{ textAlign: "center" }}>
          <p className="hero-eyebrow" style={{ justifyContent: "center", opacity: 1, transform: "none", animation: "none" }}>
            OFFICIAL COMMUNICATIONS &amp; ASSETS
          </p>
          <h1 className="hero-h1" style={{ opacity: 1, transform: "none", animation: "none" }}>
            Press &amp; <em>Media</em> Center
          </h1>
          <p className="hero-sub" style={{ marginInline: "auto", opacity: 1, transform: "none", animation: "none", fontSize: "clamp(15px, 2vw, 18px)", maxWidth: "800px", marginBottom: 0 }}>
            Welcome to the official BuyTripsNow media hub. We are always eager to collaborate with luxury lifestyle publications, industry analysts, and journalists who share our passion for the evolution of premium travel. Here, you will find our latest announcements, downloadable brand assets, and direct channels to our media relations team.
          </p>
        </div>
      </header>

      {/* ─── PRESS CONTENT ─── */}
      <main>
        {/* Company Boilerplate */}
        <section className="section section-alt" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="press-section-grid">
            <div style={{ textAlign: "center" }}>
              <h2 className="section-h2 reveal vis">Company <em>Boilerplate</em></h2>
              <div className="section-lbl reveal d1 vis" style={{ justifyContent: "center", marginBottom: "24px" }}>For immediate use in publications</div>
              <div className="summary-box reveal d2 vis" style={{ textAlign: "left", background: "var(--ink)", borderColor: "rgba(201,164,88,.2)" }}>
                <strong style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: "var(--white)", marginBottom: "12px" }}>About BuyTripsNow</strong>
                <p style={{ fontSize: "15px", fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,.7)", margin: 0 }}>
                  Founded in 2024 and headquartered in Tallinn, Estonia, BuyTripsNow is an elite online travel concierge redefining the European luxury travel landscape. By seamlessly merging visionary travel concepts with frictionless, cutting-edge digital solutions, BuyTripsNow curates extraordinary, bespoke journeys for discerning private enthusiasts and corporate executives. With an unwavering commitment to the highest EU standards of privacy, security, and service, BuyTripsNow unlocks exclusive global access, transforming travel into effortless masterpieces.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Announcements */}
        <section className="section">
          <div className="press-section-grid">
            <div>
              <h2 className="section-h2 reveal vis" style={{ textAlign: "center", marginBottom: "40px" }}>Recent <em>Announcements</em></h2>
              
              <div className="press-card reveal d1 vis">
                <span className="press-date">Upcoming</span>
                <h3 className="press-title">Announcing the Winter Travel Package (December 2026 - February 2027)</h3>
                <p className="press-desc">&quot;Discover our highly anticipated winter collection, offering bespoke luxury experiences for the ultimate cold-weather escape.&quot;</p>
                <a href="#" className="press-link">Read Full Release <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" style={{ marginLeft: "4px" }}><path d="M4 2l4 4-4 4"/></svg></a>
              </div>
              
              <div className="press-card reveal d2 vis">
                <span className="press-date">October 2026</span>
                <h3 className="press-title">BuyTripsNow Celebrates Two Years of Redefining Luxury Travel Experiences</h3>
                <p className="press-desc">&quot;Read our reflections on curating unparalleled European escapes and our vision for the future of tech-driven concierge services.&quot;</p>
                <a href="#" className="press-link">Read Full Release <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" style={{ marginLeft: "4px" }}><path d="M4 2l4 4-4 4"/></svg></a>
              </div>
              
              <div className="press-card reveal d3 vis">
                <span className="press-date">August 2026</span>
                <h3 className="press-title">Introducing the Late Summer Germany 2026 Collection</h3>
                <p className="press-desc">&quot;An exclusive look into our latest meticulously crafted itinerary, blending cultural immersion with unmatched private luxury.&quot;</p>
                <a href="#" className="press-link">Read Full Release <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" style={{ marginLeft: "4px" }}><path d="M4 2l4 4-4 4"/></svg></a>
              </div>
              
              <div className="press-card reveal d4 vis">
                <span className="press-date">Early 2025</span>
                <h3 className="press-title">How BuyTripsNow is Bringing &apos;Frictionless Tech&apos; to High-End Corporate Travel</h3>
                <p className="press-desc">&quot;A deep dive into our proprietary booking workflows and seamless itinerary management systems built for the modern executive.&quot;</p>
                <a href="#" className="press-link">Read Full Release <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" style={{ marginLeft: "4px" }}><path d="M4 2l4 4-4 4"/></svg></a>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section className="section section-alt" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <div className="assets-grid">
              <div className="col-text">
                <h2 className="section-h2 reveal vis">Brand <em>Assets</em> &amp; Guidelines</h2>
                <p className="section-p reveal d1 vis" style={{ maxWidth: "100%" }}>We require all media partners to adhere to our visual identity standards to maintain the elegance and consistency of the BuyTripsNow brand.</p>
                
                <ul className="asset-list reveal d2 vis">
                  <li><strong>The BuyTripsNow Logo Pack:</strong> High-resolution SVG and PNG formats tailored for both dark and light backgrounds.</li>
                  <li><strong>Typography &amp; Color Guidelines:</strong> Details on our signature Gold (#C9A458) and typographic hierarchy.</li>
                  <li><strong>Approved Lifestyle &amp; Destination Imagery:</strong> A curated selection of high-resolution images representing our travel experiences.</li>
                </ul>
                
                <div className="reveal d3 vis">
                  <a href="#" className="btn-ghost" style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" style={{ width: "14px", height: "14px" }}><path d="M8 2v10M4 8l4 4 4-4M2 14h12"/></svg>
                    Download Media Kit (ZIP)
                  </a>
                </div>
              </div>
              <div className="col-img reveal d2 vis">
                <img src="/images/press_assets.png" alt="BuyTripsNow Brand Assets" className="press-img" />
              </div>
            </div>
          </div>
        </section>

        {/* Media Inquiries */}
        <section className="section">
          <div className="press-section-grid">
            <div className="contact-box reveal vis">
              <h2 className="section-h2">Media <em>Inquiries</em></h2>
              <p className="section-p" style={{ marginInline: "auto", marginBottom: "32px" }}>For press opportunities, interview requests with our founders, or additional media assets, please contact our dedicated communications team. We aim to respond to all media inquiries within 24 hours.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <div className="section-lbl" style={{ justifyContent: "center", marginBottom: "6px" }}>Press Contact</div>
                  <a href="mailto:chima@buytripsnow.com" style={{ fontSize: "18px", color: "var(--gold)", transition: "color .2s" }}>chima@buytripsnow.com</a>
                </div>
                <div>
                  <div className="section-lbl" style={{ justifyContent: "center", marginBottom: "6px" }}>Corporate Headquarters</div>
                  <div style={{ fontSize: "15px", color: "var(--white)", fontWeight: 300 }}>BuyTripsNow OÜ<br />Tallinn, Estonia</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
