import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — BuyTripsNow",
};

export default function TermsAndConditions() {
  return (
    <div className="policy-page">
      <nav className="nav">
        <div className="wrap" style={{ padding: 0 }}>
          <Link href="/">← Back to Home</Link>
        </div>
      </nav>

      <main className="wrap">
        <h1>Terms &amp; Conditions</h1>
        <p>Last Updated: April 25, 2026</p>

        <p>Please read these Terms and Conditions carefully before using the services provided by BuyTripsNow OÜ. By making an enquiry or booking a travel package, you agree to be bound by these terms.</p>

        <h2>1. Booking &amp; Payments</h2>
        <p>All bookings are subject to availability at the time of confirmation. A bespoke itinerary will be provided following your enquiry. A deposit is required to secure your booking, with the balance due 60 days before departure. We accept bank transfers and major credit cards.</p>

        <h2>2. Cancellations &amp; Refunds</h2>
        <p>Cancellation policies vary by package and service provider. Generally:</p>
        <ul>
          <li>Cancellations made more than 90 days before departure: Loss of deposit.</li>
          <li>Cancellations 60-89 days before departure: 50% of total trip cost.</li>
          <li>Cancellations less than 60 days before departure: 100% of total trip cost.</li>
        </ul>
        <p>We strongly recommend comprehensive travel insurance to cover unforeseen cancellations.</p>

        <h2>3. Itinerary Changes</h2>
        <p>While we make every effort to adhere to the confirmed itinerary, circumstances beyond our control (weather, flight cancellations, etc.) may necessitate changes. We reserve the right to modify itineraries to ensure the safety and comfort of our guests.</p>

        <h2>4. Responsibility &amp; Liability</h2>
        <p>BuyTripsNow OÜ acts as an agent for airlines, hotels, and local service providers. While we handpick our partners for their excellence, we are not liable for the acts, errors, or omissions of these third-party suppliers.</p>

        <h2>5. Travel Documents</h2>
        <p>It is the traveller&apos;s responsibility to ensure they possess valid passports, visas, and any required health certifications for entry into Germany and other destinations in the itinerary.</p>

        <h2>6. Governing Law</h2>
        <p>These terms are governed by and construed in accordance with the laws of Estonia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Tallinn, Estonia.</p>

        <h2>7. Contact</h2>
        <p>For any questions regarding these terms, please contact us at <a href="mailto:chima@buytripsnow.com" style={{ color: "var(--gold)" }}>chima@buytripsnow.com</a>.</p>
      </main>

      <footer className="footer">
        © 2026 BuyTripsNow OÜ. All rights reserved.
      </footer>
    </div>
  );
}
