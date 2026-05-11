# BuyTripsNow — Design System & Guidelines

This document serves as the single source of truth for the design direction, typography, color palette, and UI tokens used across the BuyTripsNow landing page and sub-pages.

## 1. Brand Identity & Aesthetic
BuyTripsNow positions itself as a **luxury, bespoke family travel concierge**. The design must always reflect this positioning. It should evoke:
* **Elegance & Exclusivity:** Deep dark backgrounds with metallic gold accents.
* **Warmth:** Soft cream and white text for high readability and approachability.
* **Refinement:** Thin, precise borders and smooth, premium micro-animations (glassmorphism, subtle fades, hover interactions).

---

## 2. Color Palette
The color system relies heavily on a dark "ink" foundation, accented by luxurious golds and muted neutrals.

### Dark Tones (Backgrounds & Foundations)
* `--ink`: `#0D0F14` — Primary background color (very deep blue/black).
* `--ink-soft`: `#1A1E28` — Secondary background (used for cards, panels, and the trust bar).
* `--ink-mid`: `#2C3040` — Mid-tone background for slight contrast.

### Brand Accents (Golds)
* `--gold`: `#C9A458` — Primary brand color. Used for primary buttons, active tabs, and emphasized icons.
* `--gold-lt`: `#E2C07A` — Light gold. Used for hover states on primary buttons and highlighted statistics.
* `--gold-pale`: `#F7EDD4` — Very light/pale gold. Used for subtle backgrounds.

### Light Neutrals (Typography & Sections)
* `--cream`: `#FAF8F3` — Primary background for light sections (like the Lead Form).
* `--white`: `#FFFFFF` — Primary text color on dark backgrounds.
* `--mist`: `#8A8F9E` — Muted text color for secondary labels, small metadata, and footer descriptions.

### System & Utility Colors
* `--border`: `rgba(201, 164, 88, 0.22)` — Transparent gold used universally for subtle borders and dividers.
* `--green`: `#5DC47A` — Success color (used for "Included" package checklist icons).
* `--red-soft`: `#E05252` — Error/Warning color (used for form validation states).

---

## 3. Typography
The typography system pairs a classic serif for display headings with a modern, clean sans-serif for body copy and UI elements.

### Display / Headings
* **Font Family:** `Cormorant Garamond`, Georgia, serif (`--ff-d`)
* **Usage:** H1, H2, package names, statistics numbers, and testimonial quotes.
* **Weights:** Mostly Light (300) and Regular (400) to keep an elegant, airy feel. Italics (`<em>`) are heavily used within headings to emphasize key words.

### Body / UI Text
* **Font Family:** `Jost`, sans-serif (`--ff-b`)
* **Usage:** Body paragraphs, navigation, buttons, small labels, and form inputs.
* **Weights:** Light (300) for body text, Medium (500) and Semi-Bold (600) for buttons and small uppercase labels.

### Text Styling Patterns
* **Eyebrows & Labels:** Small text (usually 10px-11px), uppercase, wide letter-spacing (`1.5px` to `3px`), and `Semi-Bold (600)`.
* **Body Text:** Font size `14px-16px`, `Light (300)`, with a generous line-height of `1.8` to improve readability on dark backgrounds.

---

## 4. UI Tokens & Components

### Border Radius
* `--r`: `2px` — A very subtle, sharp border radius used uniformly across all buttons, cards, and form inputs to maintain a crisp, tailored look.

### Animations & Easing
All interactions should feel deliberate, smooth, and physical.
* `--ease`: `cubic-bezier(.22, .68, 0, 1.2)` — Slight overshoot curve used for bouncy reveals.
* `--ease-out`: `cubic-bezier(.16, 1, .3, 1)` — Extremely smooth ease-out used for hover states and modal panels.

### Buttons
1. **Primary Button:** Solid `--gold` background with `--ink` text. Hover state shifts background to `--gold-lt` with a `-2px` Y-axis lift and a soft gold drop-shadow.
2. **Ghost Button:** Transparent background, white text, and a semi-transparent white border. Hover state shifts border and text to `--gold`.

### Glassmorphism
Used sparingly but effectively for floating elements (like the sticky scrolled Nav bar and Cookie Banner) to blend beautifully over the background images.
* **Recipe:** `background: rgba(13, 15, 20, 0.92); backdrop-filter: blur(14px);`

---

## 5. Developer Guidelines

1. **Keep it DRY:** Always utilize the CSS custom properties (`var(--name)`) listed above. Avoid hard-coding HEX colors or fonts in new files.
2. **Responsiveness:** Favor `clamp()` functions for font sizes, padding, and layout gaps to ensure fluid scaling across all devices without requiring excessive media queries.
3. **Accessibility:** Ensure all interactive elements have focus states. Use semantic HTML5 tags properly (`nav`, `header`, `main`, `section`, `article`, `footer`).
4. **Modularity:** When creating new pages (e.g., policy pages), link to the existing `css/policy.css` or `css/main.css` rather than creating inline `<style>` tags.
