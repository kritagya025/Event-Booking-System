# VAULT://90s Underground Warehouse Acid-Zine Protocol
## Design System & Component Architecture Specification

---

## 1. Executive Summary & Design Vision

**VAULT://90s** is a raw, brutalist, underground warehouse club flyer & acid-zine design system engineered for an uncompromising industrial event booking experience. Departing completely from modern sanitized SaaS software and generic AI-generated interface tropes, VAULT://90s captures the visceral energy of 1990s illegal warehouse raves, DIY photocopied fanzines, magnetic tape cassette dubs, concrete subwoofer clusters, and high-voltage industrial machinery.

Every pixel is textured with photocopy grit, high-contrast monochrome printing artifacts, diagonal hazard warning tapes, and cryptographic pass stubs.

---

## 2. Anti-AI Design Compliance

VAULT://90s explicitly systematically eliminates common AI-generated interface tropes:

| AI Interface Tell | Replacement in VAULT://90s |
| :--- | :--- |
| Harsh generic purple gradients | Asphalt Black (`#0e0e11`) with Acid Yellow (`#eefc54`) & Neon Magenta (`#ff1f6d`) |
| Pure white backgrounds | Photocopy grit & asphalt surface textures |
| Heavy drop shadows & liquid glass | Hard 3D offset solid black/white/acid shadow stamps (`shadow-[4px_4px_0px_#ffffff]`) |
| Generic soft rounded corners | Strict rectangular geometry (`rounded-none` or sharp 0px borders) |
| Standard Inter/Geist/Space Grotesk | Tripartite brutalist fonts: `Bebas Neue` (display), `Oswald` (impact), `Courier Prime` (mono-zine), `JetBrains Mono` (ticker) |
| Floating radial gradient orbs | Repeating hazard tape stripes (`#eefc54` & `#0e0e11` at -45deg) and halftone dots |
| Bento grids & 3 pricing tiers | Industrial Pit Floor standing matrix, flyer decks, and real-time STOMP mutex lockers |
| Fake testimonials & sparkle icons | Live telemetry: 40KW subwoofer peak dB SPL, active WebSocket channels, and cryptographic verification |
| Generic Lucide emojis | Industrial vector symbols and monospaced technical stubs |

---

## 3. Color Tokens & Visual Identity

### 3.1 Palette Specification

| Token Name | Hex Code | Utility / Context |
| :--- | :--- | :--- |
| `acid-yellow` | `#eefc54` | Primary high-voltage accent, ticket highlights, primary CTA stamps |
| `acid-yellow-hover` | `#dbed2d` | Active interactive hover state for acid yellow controls |
| `neon-magenta` | `#ff1f6d` | Admittance urgency, VIP passes, secret gate warnings, security badges |
| `neon-magenta-dark` | `#d40c50` | Active state for magenta controls |
| `electric-cobalt` | `#1d4ed8` | Sound rig telemetry, STOMP socket indicators, cassette edition tags |
| `asphalt-black` | `#0e0e11` | Primary base canvas, high-contrast dark room background |
| `asphalt-surface` | `#16161c` | Elevated card container frames, navigation bars, bouncer enclave |
| `asphalt-card` | `#1b1c24` | Input fields, sub-panels, perforated tear stub backing |
| `asphalt-border` | `#2c2d3a` | Dividers, structural grid borders, dashed perforations |
| `grit-white` | `#f5f5f0` | High-contrast photocopy typography, bold borders, sharp shadows |
| `grit-dim` | `#90929e` | Monospace metadata, secondary coordinates, ticket specs |
| `danger-red` | `#ff3333` | Hard gate denial, invalid cipher codes, ticket cancellation |

---

## 4. Typography Scale

```
Display Headings  →  'Bebas Neue', sans-serif (Tight letter spacing, uppercase, bold)
Impact & Badges   →  'Oswald', sans-serif (Heavyweight industrial stamps, button CTAs)
Body & Manifesto  →  'Courier Prime', monospace (Raw typewriter fanzine text)
Ticker & Stubs    →  'JetBrains Mono', monospace (Real-time telemetry, barcodes, serials)
```

| Hierarchy | Font | Size | Weight | Application |
| :--- | :--- | :--- | :--- | :--- |
| Zine Hero Title | `Bebas Neue` | `clamp(2.5rem, 7vw, 5.5rem)` | 800 | Top hero manifesto banner |
| Section Header | `Bebas Neue` | `2.25rem - 3.5rem` | 700 | Flyer deck, Stage bouncer titles |
| Flyer Title | `Oswald` | `1.35rem - 1.65rem` | 700 | Event card names, modal headings |
| Button CTA | `Oswald` | `1.05rem - 1.25rem` | 700 | "LOCK WRISTBAND", "CLAIM PASS" |
| Zine Manifesto | `Courier Prime` | `0.85rem - 0.95rem` | 400 | Rules of engagement, event manifests |
| Barcode Stub | `JetBrains Mono` | `0.70rem - 0.75rem` | 700 | Live socket counters, ticket serials |

---

## 5. Structural Components

### 5.1 High Voltage Hazard Warning Marquee
- Top sticky ribbon with repeating diagonal yellow/black warning tape (`-45deg`).
- Continuous CSS keyframe marquee announcing sound system safety regulations, no-camera policies, and curfew times.

### 5.2 Brutalist Rave Navigation Bar
- Stamped `VAULT://90s` brand logo tilted `-2deg` with neon magenta 3D drop shadow.
- Stamped flyer navigation pills (`FLYER ARCHIVE`, `LINEUP & GIGS`, `40KW RIG STATUS`, `SECRET COORDS`).
- Role-based tabs: `SAVED TAPES`, `MY WRISTBANDS`, `HOST RAVE`, `GATE SCANNER`, `ADMIN RIG`.
- Currency converter dropdown with brutalist offset shadow.
- Live wristband availability counter (`#992 / 1200`).

### 5.3 90s Acid-Zine Hero Section
- Raw photocopy grit texture overlay.
- Tilted magenta stamp: `★ ALL NIGHT LONG // NO GUESTLIST ★`.
- Concrete industrial sound system specs: `40KW FUNKTION`, `32-MG SOCKET`, `OH OVERDRIVEN`, `TAPE / QR PASS`.
- Interactive spinning C-90 chrome cassette graphic with spinning tape reels, tape counter, and cryptographic verification tag.

### 5.4 High-Voltage Rave Radar (Search & Filtering)
- Acid-yellow search capsule with monospaced inputs:
  - Genre / Collective / Gig keyword search
  - Squats & Docks location selector
  - Curfew window selector (`MIDNIGHT TO 06:00 AM (RAW)`)
  - "RAVE RADAR" neon-magenta trigger button

### 5.5 Flyer Deck Admittance Cards
- Tilted angular badges (`17-OCT // DECAY 01`, `HARDCORE ONLY`, `10*TAPE DROPPED`).
- High-contrast grayscale event imagery with industrial photocopy grain.
- Perforated hazard tear lines separating the upper artwork from the admittance stub.
- Monospaced tariff display, available wristband counter, and high-density SVG barcode strips.
- "RUSH ENTRY" action button.

### 5.6 Stage Bouncer Pit Floor Conclave (Interactive Seat Matrix)
- Interactive grid of Pit Floor Standing Tiles (`F1`, `M2`, `B3`, etc.).
- Real-time STOMP WebSocket status synchronization (Available, Selected, Locked, Booked).
- 10-minute isolated seat lock countdown timer.
- Live tariff calculation and "LOCK WRISTBAND & GET COORDS" checkout button.

### 5.7 The Warehouse Rules of Engagement
- Four brutalist numbered stickers (`01`, `02`, `03`, `04`):
  - 01: NO CAMERAS / NO FLASH (Phone lenses sealed at gate)
  - 02: 40KW SUBWOOFER PRIORITY (Acoustic pressure peaks at 132.8 dB-C)
  - 03: SECRET GATE DISPATCH (Coordinates released 2 hours prior via encrypted comm)
  - 04: ANALOG CASSETTE DUBS (Live sessions recorded straight to magnetic tape)

---

## 6. Real-Time Telemetry & Verification

The platform maintains live backend connections:
- **WebSocket / STOMP Topic**: `/topic/seat-locks/{eventId}` for millisecond-latency seat mutexes.
- **REST Endpoints**: `/api/events`, `/api/bookings`, `/api/checkin/validate/{code}`, `/api/coupons/validate`.
- **Database Engine**: PostgreSQL relational schema backed by Redis distributed locking cache.
