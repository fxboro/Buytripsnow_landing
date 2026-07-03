(function() {
  const SCRIPT_SRC = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  const CSS_HREF = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

  // Coordinates data
  const routes = {
    bavaria: {
      center: [47.8, 10.9],
      zoom: 8,
      stops: [
        { name: "Munich", coords: [48.1351, 11.5820], desc: "Arrival flight, luxury hotel stay and city touring." },
        { name: "Füssen & Neuschwanstein", coords: [47.5696, 10.7004], desc: "Fairy tale castles and Alpine scenery." },
        { name: "Garmisch & Zugspitze", coords: [47.4917, 11.0955], desc: "Zugspitze mountain summit and Alpine lakes." }
      ]
    },
    themeparks: {
      center: [50.4, 10.5],
      zoom: 6,
      stops: [
        { name: "Berlin", coords: [52.5200, 13.4050], desc: "City history, exploration and modern culture." },
        { name: "Rhine Valley", coords: [50.1436, 7.7171], desc: "Ancient castles, river cruising and vineyards." },
        { name: "Europa-Park (Rust)", coords: [48.2660, 7.7220], desc: "Two full days at Europe's leading theme park." },
        { name: "Frankfurt", coords: [50.1109, 8.6821], desc: "Departure flight and modern metropolis." }
      ]
    },
    nature: {
      center: [50.6, 11.5],
      zoom: 6,
      stops: [
        { name: "Hamburg", coords: [53.5511, 9.9937], desc: "Elbphilharmonie and historic port." },
        { name: "Black Forest (Freiburg)", coords: [47.9990, 7.8421], desc: "Ancient woodlands, hiking trails and cuckoo clocks." },
        { name: "Berchtesgaden", coords: [47.6302, 13.0012], desc: "Alpine discovery and pristine lakes." }
      ]
    }
  };

  let leafletLoaded = false;

  function loadLeaflet(callback) {
    if (leafletLoaded) {
      if (callback) callback();
      return;
    }

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      leafletLoaded = true;
      if (callback) callback();
    };
    document.head.appendChild(script);
  }

  function initMaps() {
    initMap("map-bavaria", routes.bavaria);
    initMap("map-themeparks", routes.themeparks);
    initMap("map-nature", routes.nature);
  }

  function initMap(elementId, routeData) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const map = L.map(elementId, {
      center: routeData.center,
      zoom: routeData.zoom,
      scrollWheelZoom: false,
      zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const coords = [];

    const goldIcon = L.divIcon({
      className: 'custom-gold-marker',
      html: '<div class="marker-pin"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    routeData.stops.forEach((stop, index) => {
      coords.push(stop.coords);
      const marker = L.marker(stop.coords, { icon: goldIcon }).addTo(map);
      
      const popupContent = `
        <div class="map-popup">
          <h5>Stop 0${index + 1}: ${stop.name}</h5>
          <p>${stop.desc}</p>
        </div>
      `;
      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup'
      });
    });

    L.polyline(coords, {
      color: '#C9A458',
      weight: 2,
      opacity: 0.8,
      dashArray: '5, 5',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadLeaflet(initMaps);
        obs.disconnect();
      }
    });
  }, {
    rootMargin: "400px 0px 400px 0px"
  });

  const packagesSection = document.getElementById("packages");
  if (packagesSection) {
    observer.observe(packagesSection);
  }
})();
