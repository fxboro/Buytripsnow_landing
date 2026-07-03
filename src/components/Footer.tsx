import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">BuyTrips<span>Now</span></div>
          <p className="footer-desc">Luxury bespoke travel concierge based in Tallinn, Estonia. Crafting extraordinary journeys for discerning families since 2024.</p>
          <p className="footer-reg">BuyTripsNow OÜ · Registry: 16835008 · Tallinn, Estonia</p>
        </div>
        <div>
          <div className="footer-col-h">Destinations</div>
          <ul className="footer-links">
            <li><Link href="/#packages">Germany</Link></li>
            <li><a href="#">Austria &amp; Switzerland</a></li>
            <li><a href="#">Scandinavia</a></li>
            <li><a href="#">Italy &amp; France</a></li>
            <li><a href="#">Bespoke Worldwide</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-h">Company</div>
          <ul className="footer-links">
            <li><Link href="/about">About Us</Link></li>
            <li><a href="#">Meet the Team</a></li>
            <li><Link href="/press">Press &amp; Media</Link></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-h">Contact</div>
          <ul className="footer-links">
            <li><a href="mailto:chima@buytripsnow.com">chima@buytripsnow.com</a></li>
            <li><a href="tel:+37212345678">+372 1234 5678</a></li>
            <li><a href="#">WhatsApp Concierge</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 BuyTripsNow OÜ. All rights reserved.</div>
        <div className="footer-legal">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/privacy">GDPR</Link>
        </div>
      </div>
    </footer>
  );
}
