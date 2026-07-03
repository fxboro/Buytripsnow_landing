"use client";

import { useEffect, useRef } from "react";

interface Stop {
  name: string;
  coords: [number, number];
  desc: string;
}

interface RouteData {
  center: [number, number];
  zoom: number;
  stops: Stop[];
}

interface RouteMapProps {
  id: string;
  routeData: RouteData;
}

export default function RouteMap({ id, routeData }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mapInstance: any = null;

    const loadLeaflet = (callback: () => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).L) {
        callback();
        return;
      }

      // Add CSS link
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      // Add JS script
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => {
        callback();
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Double check in case of race conditions
      if (initialized.current) return;

      mapInstance = L.map(mapRef.current, {
        center: routeData.center,
        zoom: routeData.zoom,
        scrollWheelZoom: false,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapInstance);

      L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

      const coords: [number, number][] = [];
      const goldIcon = L.divIcon({
        className: "custom-gold-marker",
        html: '<div class="marker-pin"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      routeData.stops.forEach((stop, index) => {
        coords.push(stop.coords);
        const marker = L.marker(stop.coords, { icon: goldIcon }).addTo(mapInstance);

        const popupContent = `
          <div class="map-popup">
            <h5>Stop 0${index + 1}: ${stop.name}</h5>
            <p>${stop.desc}</p>
          </div>
        `;
        marker.bindPopup(popupContent, {
          className: "custom-leaflet-popup",
        });
      });

      L.polyline(coords, {
        color: "#C9A458",
        weight: 2,
        opacity: 0.8,
        dashArray: "5, 5",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(mapInstance);

      initialized.current = true;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadLeaflet(initMap);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "400px" }
    );

    observer.observe(mapRef.current);

    return () => {
      observer.disconnect();
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [routeData]);

  return (
    <div
      ref={mapRef}
      id={id}
      className="pkg-map"
      aria-label="Itinerary route map"
      style={{ minHeight: "220px" }}
    />
  );
}
