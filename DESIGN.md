# EVENTHUB: Brutalist Live Event Ticketing & Seat Reservation System
## Design System & Component Architecture Specification

---

## 1. Executive Summary & Design Vision

**EVENTHUB** is a high-impact, raw brutalist live event ticketing and real-time seat reservation platform. Engineered to break away from sanitized, generic AI-generated SaaS templates, EventHub combines high-contrast industrial aesthetics (hazard tapes, solid offset drop-shadow stamps, monospaced typography, and sharp 0px borders) with enterprise-grade ticketing capabilities:

- **Distributed Concurrency**: 10-minute isolated seat holds via real-time WebSocket STOMP messaging backed by Redis mutex locks.
- **Cryptographic Admission**: Unique tamper-proof QR code generation, PDF export stubs, and sub-second optical gate scanners.
- **Full Catalog Dispatch**: Multi-category live event discovery (Concerts, Conferences, Theater, Sports, and Workshops) with real-time seat inventory counters.
- **Role-Based Workflows**: Dedicated dashboards for attendees (My Bookings, QR Tickets, Wishlist) and event organizers (Event Creation, Capacity Quotas, Sales Telemetry).

---

## 2. Anti-AI Design Compliance

EVENTHUB deliberately eliminates common AI-generated design tells:

| AI Interface Tell | Replacement in EVENTHUB |
| :--- | :--- |
| Harsh generic purple gradients | Asphalt Black (`#0e0e11`) with Acid Yellow (`#eefc54`) & Neon Magenta (`#ff1f6d`) |
| Pure white backgrounds | High-contrast asphalt surfaces with subtle tactile grit texture |
| Heavy liquid glass drop shadows | Hard 3D offset solid black/white/acid shadow stamps (`shadow-[4px_4px_0px_#ffffff]`) |
| Soft generic rounded corners | Strict rectangular geometry (`rounded-none` and sharp 0px borders) |
| Standard Inter / Geist / Space Grotesk | Tripartite brutalist typography: `Bebas Neue` (display), `Oswald` (impact/buttons), `Courier Prime` (monospace labels), `JetBrains Mono` (real-time telemetry) |
| Floating radial gradient orbs | Repeating diagonal hazard warning stripes (`#eefc54` & `#0e0e11` at -45deg) |
| Bento grids & 3 pricing tiers | Real-time interactive seating matrix, perforated admission stubs, and STOMP concurrency hold indicators |
| Fake testimonials & sparkle icons | Live telemetry: real-time database health, active WebSocket connection counters, and cryptographic QR signatures |
| Default generic Lucide emojis | Clean industrial vector icons, technical badges, and monospaced timestamps |

---

## 3. Color Tokens & Visual Identity

### 3.1 Palette Specification

| Token Name | Hex Code | Utility / Context |
| :--- | :--- | :--- |
| `acid-yellow` | `#eefc54` | Primary high-voltage accent, ticket highlights, primary CTA stamps |
| `acid-yellow-hover` | `#dbed2d` | Active interactive hover state for acid yellow controls |
| `neon-magenta` | `#ff1f6d` | Booking status badges, VIP passes, gate scanners, urgent warnings |
| `neon-magenta-dark` | `#d40c50` | Active state for magenta controls |
| `electric-cobalt` | `#1d4ed8` | System telemetry badges, active WebSocket indicators, category tags |
| `asphalt-black` | `#0e0e11` | Primary base canvas, high-contrast dark room background |
| `asphalt-surface` | `#16161c` | Elevated card container frames, navigation bars, modal overlays |
| `asphalt-card` | `#1b1c24` | Input fields, sub-panels, perforated tear stub backing |
| `asphalt-border` | `#2c2d3a` | Dividers, structural grid borders, dashed perforations |
| `grit-white` | `#f5f5f0` | High-contrast typography, bold structural borders, sharp offset stamps |
| `grit-dim` | `#90929e` | Monospace metadata, secondary location coordinates, ticket specifications |
| `danger-red` | `#ff3333` | Gate entry denial, invalid ticket codes, booking cancellations |

---

## 4. Typography Scale

```
Display Headings  →  'Bebas Neue', sans-serif (Tight letter spacing, uppercase, bold)
Impact & Badges   →  'Oswald', sans-serif (Heavyweight industrial stamps, button CTAs)
Monospace Labels  →  'Courier Prime', monospace (Technical specs, event descriptions)
Telemetry Tickers →  'JetBrains Mono', monospace (Real-time seat timers, barcodes, serials)
```

| Hierarchy | Font | Size | Weight | Application |
| :--- | :--- | :--- | :--- | :--- |
| Hero Title | `Bebas Neue` | `clamp(2.5rem, 7vw, 5.5rem)` | 800 | Main hero headline banner |
| Section Header | `Bebas Neue` | `2.25rem - 3.5rem` | 700 | Upcoming events, Seat matrix headers |
| Card Title | `Oswald` | `1.35rem - 1.65rem` | 700 | Event card names, modal headings |
| Button CTA | `Oswald` | `1.05rem - 1.25rem` | 700 | "BOOK TICKETS", "SELECT SEATS" |
| Specifications | `Courier Prime` | `0.85rem - 0.95rem` | 400 | Event details, venue addresses |
| Barcode Stub | `JetBrains Mono` | `0.70rem - 0.75rem` | 700 | Live socket counters, ticket serials |

---

## 5. Structural Components

### 5.1 Platform Protocol Notice Marquee
- Sticky top ribbon with repeating diagonal yellow/black warning tape (`-45deg`).
- Continuous CSS marquee announcing live STOMP seat mutex active, 10-minute hold window, cryptographic QR tickets, and multi-currency exchange rates.

### 5.2 Brutalist Navigation Bar
- Stamped `EVENTHUB` brand logo tilted `-2deg` with neon magenta 3D drop shadow.
- Real-time platform status indicator (`REAL-TIME SEAT RESERVATION & PASSES`).
- Role-based tabs: `EXPLORE EVENTS`, `ALL CATALOG`, `WISHLIST`, `MY TICKETS`, `CREATE EVENT`, `GATE SCANNER`, `ADMIN DASHBOARD`.
- Multi-currency selector (USD, EUR, GBP, JPY, CAD, AUD, INR) with instant dynamic rate conversions.
- Live inventory counter displaying verified tickets available.

### 5.3 High-Impact Hero Section
- Clean brutalist headline: `LIVE EVENT TICKETING & SEAT RESERVATIONS.`
- Technical metadata stamps: `SPRING BOOT 3.4`, `10-MIN MUTEX`, `POSTGRESQL TLS`, `QR + PDF PASS`.
- Interactive Digital Admission Pass graphic with spinning reels, ticket serial `#EHB-PASS-2026-90`, and verified security seal.

### 5.4 Live Inventory Search & Radar
- Acid-yellow search capsule with monospaced inputs:
  - Event title / Performer keyword search
  - Venue location selector (All Venues, Arenas, Convention Centers)
  - Date & Schedule filter
  - "DISPATCH RADAR" trigger button

### 5.5 Event Admission Cards
- Tilted angular badges (`FEATURED EVENT`, `SELLING FAST`, `VIP AVAILABLE`).
- Grayscale event imagery with high-contrast filter.
- Perforated dashed lines separating upper banner artwork from admission ticket details.
- Monospaced price display, remaining seat count, and SVG barcode validation strips.
- Direct CTA: "SELECT SEATS" triggering interactive seat map modal.

### 5.6 Interactive Seat Map & Lock System
- Real-time grid of Stage & Arena Floor Seating (`ROW A`, `ROW B`, `ROW C`).
- Visual seat states: Available, Selected, Locked by other users, Booked.
- Distributed 10-minute reservation countdown timer synchronized via STOMP WebSockets.
- Dynamic order summary with coupon validation, subtotal calculation, and instant booking submission.

### 5.7 Ticketing Guarantees & Security Pillars
- Four brutalist numbered guarantee cards:
  - 01: 100% VERIFIED PASSES (Cryptographic QR verification prevents fraud)
  - 02: REAL-TIME SEAT HOLD (10-minute isolated lock prevents double-booking)
  - 03: INSTANT DIGITAL PASSES (Instant PDF download and Google Calendar sync)
  - 04: RAPID GATE SCANNER (Sub-second camera scanner for venue staff)

### 5.8 Cinema Premiere & Movie Seating Experience
- **Curved Amphitheater Screen**: High-contrast illuminated projection arc with stage lighting glow.
- **Sound Tower Beacons**: Flanking stereo sound towers with blinking signal telemetry.
- **Center Aisle Architecture**: Strict industrial aisle dividing seating into Left and Right wings with clear aisle clearance.
- **Directional Viewing Angle Radar**: HUD indicating screen sightlines and optimal acoustic zones.
- **Category Tier Distinction**: Distinct visual styling for `VIP`, `PREMIUM`, and `REGULAR` tiers with responsive touch states.

### 5.9 3D Stacked Event Slide Cards
- **Layered Deck Geometry**: 3 to 4 event cards physically stacked on top of each other with progressive z-index, scale, and offset transformations.
- **Interactive Slide Transition**: Clicking or swiping slides the top card outward and cycles the deck with spring-physics motion.
- **Perforated Ticket Header**: Retains brutalist perforated stub detailing, barcode strips, and pricing badges during slide animations.

### 5.10 Site-Wide Skeleton Loading System (Zero CLS)
- **Bounding-Box Parity**: Dedicated skeleton components (`EventCardSkeleton`, `SeatMapSkeleton`, `AdminDashboardSkeleton`, `BookingCardSkeleton`, `WishlistCardSkeleton`, `ProfileSkeleton`) engineered to mirror exact rendered container dimensions, preventing layout shifts (CLS = 0).
- **Brutalist Shimmer Wave**: High-contrast monochrome pulse gradient traversing asphalt card frames instead of generic pastel gray placeholders.
- **Monospaced Placeholders**: Preserves the structural alignment of timestamps, badges, and pricing elements during asynchronous data fetching.

### 5.11 Sold-Out Event Monochrome Distinction
- **High-Contrast Grayscale Filter**: Automatically desaturates promotional artwork and event containers when `availableSeats === 0` or status is `SOLD_OUT`.
- **Industrial "SOLD OUT" Stamp**: High-impact diagonal badge stamp overlaid with muted dark border styling.
- **Disabled Interaction State**: Disables primary CTAs, preventing ticket reservation modal triggers while preserving catalog browseability and waitlist enrollment.

### 5.12 Motion, Atmospheric Effects & Theme Transitions
- **Acoustic Harmonic Waveform Canvas Engine**: Bespoke WebGL/2D canvas rendering an interactive resonant waveform grid reacting to mouse coordinates with physical impulse attenuation.
- **Laser Aperture & CRT Scanline Sweeps**: Circular laser view transition animations and retro CRT cathode-ray beam sweeps across header pills and modal frames.
- **Dual-Theme Synchronization**: Seamless transition between Asphalt Brutalist Dark Mode and High-Contrast Industrial Light Mode via synchronized CSS variables and `data-theme` attributes.

---

## 6. Real-Time Telemetry & Verification

The platform maintains live backend connections:
- **WebSocket / STOMP Topic**: `/topic/seat-locks/{eventId}` for millisecond-latency seat mutexes.
- **REST Endpoints**: `/api/events`, `/api/bookings`, `/api/checkin/validate/{code}`, `/api/coupons/validate`.
- **Database Engine**: PostgreSQL relational schema backed by Redis distributed locking cache.
