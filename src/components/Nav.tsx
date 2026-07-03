"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavProps {
  isHome?: boolean;
}

export default function Nav({ isHome = false }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} id="mainNav" role="navigation" aria-label="Main navigation">
      {isHome ? (
        <a href="#" className="nav-logo" aria-label="BuyTripsNow Home">
          <img src="/images/buytripsnow_icon.png" alt="BuyTripsNow Logo" width="32" height="32" />
        </a>
      ) : (
        <Link href="/" className="nav-logo" aria-label="BuyTripsNow Home">
          <img src="/images/buytripsnow_icon.png" alt="BuyTripsNow Logo" width="32" height="32" />
        </Link>
      )}

      {isHome ? (
        <a href="#enquiry-form" className="nav-cta" aria-label="Request your bespoke itinerary">
          Request Itinerary
        </a>
      ) : (
        <Link href="/#enquiry-form" className="nav-cta" aria-label="Request your bespoke itinerary">
          Request Itinerary
        </Link>
      )}
    </nav>
  );
}
