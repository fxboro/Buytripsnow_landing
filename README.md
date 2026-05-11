# BuyTripsNow — Landing Page & Static Site

![BuyTripsNow Logo](images/buytripsnow_icon.png)

Welcome to the repository for **BuyTripsNow**, a luxury, bespoke family travel concierge based in Tallinn, Estonia. This specific repository hosts the static landing page designed for the **Germany Late Summer 2026** campaign, along with its supporting policy pages.

## 📖 Project Overview

This project is a high-performance, single-page application (SPA) style landing page built with pure web technologies. It is designed to capture leads for highly curated, luxury family travel packages.

The primary goal of this site is to provide a premium, seamless user experience that matches the luxury nature of the services offered. It achieves this through bespoke UI/UX, glassmorphism aesthetics, smooth micro-animations, and a completely custom multi-step lead capture form.

## ✨ Key Features

- **Luxury UI/UX Design:** Dark mode aesthetic with gold accents, utilizing modern CSS features like CSS variables, `clamp()` for fluid typography, and backdrop-filter for glassmorphism.
- **Dynamic Multi-Step Form:** A custom-built, vanilla JavaScript multi-step lead capture form with inline validation, package pre-selection, and dynamic summary generation.
- **Google Sheets Integration:** The lead form submits directly to a Google Sheets backend via a Google Apps Script Web App webhook, entirely circumventing the need for a dedicated backend server.
- **GDPR Compliant Cookie Consent:** Custom, styled cookie banner that conditionally loads Google Tag Manager (GTM) and Meta Pixel only after the user has explicitly opted in.
- **SEO & Performance Optimized:** Fully semantic HTML5 structure, structured data (JSON-LD) for Travel Agencies, localized Open Graph tags, and extremely lightweight (zero external UI dependencies).

## 🗂️ Project Structure

The project has been refactored to follow standard web development best practices, emphasizing the separation of concerns:

```text
Buytripsnow_landing/
├── css/
│   ├── main.css         # Core styling, animations, and form logic for the index page
│   └── policy.css       # Shared lightweight styling for the legal/policy pages
├── js/
│   └── main.js          # Core logic: Scroll reveal, multi-step form, webhook submission, cookie consent
├── images/              # Static image assets (logos, background images)
├── index.html           # The primary landing page (Germany 2026 Campaign)
├── cookies.html         # Cookie Policy
├── privacy.html         # Privacy Policy
├── terms.html           # Terms & Conditions
├── design.md            # Single source of truth for design tokens and UI/UX guidelines
└── README.md            # Project documentation (this file)
```

## 🛠️ Setup & Development

Because this is a completely static site with no build tools, setup is exceptionally simple.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fxboro/Buytripsnow_landing.git
   cd Buytripsnow_landing
   ```

2. **Run a local development server:**
   To ensure that relative paths, CORS (if applicable), and local fonts load correctly, it is highly recommended to view the site via a local HTTP server rather than opening the files directly (`file:///`).

   If you have Python installed:
   ```bash
   python -m http.server 8080
   ```
   
   If you have Node.js installed:
   ```bash
   npx serve .
   ```

3. **View the site:**
   Open your browser and navigate to `http://localhost:8080` (or the port provided by your server).

## ⚙️ Integrations & Third-Party Scripts

### Lead Form Webhook (Google Apps Script)
When a user completes the multi-step enquiry form on `index.html`, the data is collected into a JSON payload and sent via a `POST` request to a Google Apps Script URL.
- **File:** `js/main.js`
- **Constant:** `SCRIPT_URL`
- *Note: Before deploying to production, ensure that `SCRIPT_URL` points to the active, published Apps Script Web App.*

### Analytics & Tracking
Tracking scripts are intentionally delayed and **will not execute** until the user clicks "Accept All" on the cookie banner.
- **Google Analytics (GA4):** ID `G-B0F08RWG2D`
- **Meta Pixel:** ID `958205627072290`
- **Implementation:** The `loadTrackingScripts()` function in `index.html` dynamically injects the scripts into the `<head>` upon consent.

## 🎨 Design & Architecture Guidelines

All aesthetic decisions, typography choices, and CSS tokens are strictly codified. 

Before making any visual changes to the website, please consult the [design.md](./design.md) file. It contains the exact HEX codes for the dark ink and gold palettes, typography weights, standard easing curves for animations, and rules for creating new components.

## 📄 License

© 2026 BuyTripsNow OÜ. All rights reserved. 
This codebase is proprietary and not licensed for external use.
