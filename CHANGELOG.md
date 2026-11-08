# Changelog

All notable changes to the Event Booking System are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.1] - 2026-11-08

### Enhanced
- **Zero-Emoji Professional Neo-Brutalist Admission Pass & PDF Generation Engine (`TicketService.java`, `QrCodeService.java`, `MyBookings.jsx`, `BackstageAuthTerminal.jsx`)**:
  - **Complete Emoji Elimination**: Removed all emojis across the entire ticketing pipeline (PDF generation, printable web stubs, and terminal cards), replacing them with clean industrial ASCII indicators, bracketed security tags (`[ 10-MIN CART LOCK ]`, `[ ZERO OVERBOOKING ]`, `[ OFFLINE GATE AUDITED ]`), and crisp geometric microprint.
  - **Executive Document Layout**: Upgraded the A4 PDF canvas from an isolated floating box to a fully composed **Official Digital Admission Document** featuring an Executive Header bar (`EVENTHUB OFFICIAL PASS ISSUANCE NETWORK`), the central concert pass card, and a comprehensive 3-column **Gate Admission Protocol & Security Guide** filling the page with zero awkward empty voids.
  - **Authentic Two-Panel Concert Pass Architecture**: Structured tickets with a 71% Main Admission Panel (Event hero, 3-column temporal/spatial coordinates grid, giant Acid Yellow seat assignment chip, accredited attendee credential) separated by a dashed perforation notch divider from a 27% **Turnstile Gate Stub**.
  - **Real Scannable Code-128 Barcode Engine (`QrCodeService.java`)**: Integrated ZXing's `Code128Writer` to dynamically generate authentic, high-density 1D concert barcodes directly beneath the optical QR gate token.
  - **Multi-Ticket Booking Pagination**: Configured clean multi-ticket pagination (up to 2 passes per page with `AreaBreak`) for multi-seat orders.
  - **Upgraded Horizontal Printable Web Stub (`MyBookings.jsx`)**: Redesigned the HTML fallback window to feature circular tear notches, split 2-panel architecture, QR token, and turnstile protocol grid.
  - **Terminal Pass Refinement (`BackstageAuthTerminal.jsx`)**: Replaced Unicode tear scissors with industrial `::: DETACH AT TURNSTILE :::` typography.
- **High-Fidelity Neo-Brutalist VIP Pass & Ticket Stub Architecture (`BackstageAuthTerminal.jsx`)**:
  - **Tactical Lanyard & Mechanical Carabiner**: Added heavy-duty woven strap ribbon with repeating `EVENTHUB VIP` micro-text, brushed steel swivel ring, mechanical pivot block, and spring-loaded carabiner latch hook.
  - **Laminated Punch Slot & Industrial Hardware**: Added realistic top oval punch slot cutout where the carabiner attaches, plus 4 corner tactical rivet markers.
  - **Gold RFID Smart Card Chip**: Integrated simulated gold EMV/RFID contact microchip with etched contact pads, circuitry traces, and contactless NFC wave indicator.
  - **Dynamic Attendee HUD Viewfinder**: Designed tactical corner-bracketed reticle avatar displaying real-time user initials (with fallback fingerprint scanner graphic), synchronized live update indicator, and clear clearance badge tags (`CREW // STAGE + BOOTH` vs `LEVEL 01 // VIP PIT + LOUNGE`).
  - **Turnstile Tear-Line Perforation**: Upgraded perforation with deep semicircular edge punch notches and `✂ DETACH AT TURNSTILE ✂` laser guide micro-text.
  - **Cryptographic Gate Token & Concert Barcode**: Added dynamic hex hash generation based on attendee identity (`gateHash`), realistic variable-width concert ticket barcode (`* 8 4 9 2 0 1 7 4 3 *`), and high-contrast vector QR code with animated neon-magenta laser sweep beam.
  - **Audio VU Decibel / Security Entropy Meter**: Upgraded real-time decibel meter with glowing multi-tier LED bars, reactive overdrive animations, and live dB readouts.
  - **Prismatic Holographic Foil Overlay (`index.css`)**: Enhanced multi-frequency iridescence with cyan/sky blue prism refraction highlights and interactive hover lift.
- **Architectural Arena & Auditorium Seatmap Engine (`SeatMapModal.jsx`)**:
  - **Curved IMAX & Live Concert Proscenium**: Built ambient projector aperture beams, concave IMAX screen curvature, Dolby Atmos audio spec badges, and concert rigging truss with active audio graphic EQ spectrum visualizers.
  - **Smart Consecutive Adjacent Seat Selection**: Implemented sliding-window algorithm for `+2 PAIR` and `+4 SQUAD` that automatically identifies and selects adjacent side-by-side seats in the same row.
  - **Tactical Venue Blueprint Mini-Map**: Added compass-oriented spatial arena overview displaying real-time stage alignment and pulsing cart reservation dots.
  - **Tiered Architectural Dividers**: Grouped rows into distinct physical tiers (VIP Orchestra Pit, Mezzanine Club, Balcony Loge, and General Auditorium) with colored section accent dividers.
  - **Tactile Recliner Stadium Seats**: Upgraded seat silhouettes with ergonomic curved headrests, section-specific neon glow outlines, 3D hover lift, and high-voltage selection states.
  - **Illuminated Runway Aisle**: Replaced basic aisle text with an illuminated stadium runway featuring directional chevrons and floor step lights.
  - **Real-Time Seat Radar & Telemetry HUD**: Enhanced hover telemetry with distance to stage, direct line-of-sight metrics, and live rate indicators.
  - **Perforated Ticket Stubs Dock**: Displayed reserved cart seats as mini concert tickets with tear notches, section tags, and 1-click removal.

---

## [1.4.0] - 2026-11-07

### Added
- **Complete Mobile, Tablet & Multi-Device Responsive Architecture**:
  - **Mobile Navigation Drawer (`Navbar.jsx`)**: Added high-contrast brutalist mobile hamburger menu drawer with smooth backdrop blur, complete access to all customer/organizer/admin tabs, integrated multi-currency selector, theme toggle, and 1-tap session sign-in/out.
  - **Responsive Seat Map & Checkout Workflow (`SeatMapModal.jsx`)**: Designed touch-friendly seating matrix with horizontal momentum scrolling (`touch-scroll`), visual mobile swipe orientation indicator ("← SWIPE HORIZONTALLY TO VIEW ALL ROWS & SEATS →"), and full-width touch-target action buttons for Steps 1 through 4.
  - **Adaptive Backstage Auth Terminal (`BackstageAuthTerminal.jsx`)**: Re-architected mobile grid hierarchy (`order-1 lg:order-2`) prioritizing the authentication console for phone users while displaying real-time holographic VIP pass rendering underneath.
  - **Fluid Breakpoint Grid System (`App.jsx`)**: Replaced abrupt 1-to-4 column jumps with smooth breakpoint progression (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) for event lineup and skeleton loaders.
  - **Touch & Accessibility Utilities (`index.css`)**: Implemented 44x44px minimum tap targets, momentum scrolling (`-webkit-overflow-scrolling: touch`), viewport bounds clamping (`max-width: 100vw; overflow-x: hidden`), and responsive floating toast notifications (`left: 16px; right: 16px; sm:left-auto sm:right-6`).
  - **Adaptive Modals**: Refitted all modal dialogs (`CreateEventModal`, `CheckInModal`, `TermsModal`, `PrivacyModal`, `CookiesModal`, `DatabaseConsoleModal`, `ApiDocsModal`, `SystemStatusModal`) with responsive paddings, safe-area inset support, and viewport height ceilings (`max-h-[85vh]`).

### Changed
- Refactored Search & Filter capsule into balanced responsive columns (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Optimized Hero section typography scaling (`text-4xl sm:text-6xl lg:text-8xl`) and slanted badge offsets to eliminate mobile horizontal scroll leakage.
- Sanitized internal developer jargon (ports, STOMP mutex, TLS strings) across all modal dialogs and replaced with consumer-friendly Box Office terminology.

---

## [1.3.0] - 2026-11-07

### Added
- Dedicated independent GitHub Actions Backend CI workflow (`.github/workflows/backend.yml`) with path filtering (`src/**`, `pom.xml`, `mvnw*`, `.mvn/**`), Temurin Java 17 setup, Maven dependency caching, H2 in-memory test execution with required environment variables, and production JAR artifact uploading.
- Dedicated independent GitHub Actions Frontend CI workflow (`.github/workflows/frontend.yml`) with path filtering (`frontend/**`), Node.js 20 setup, npm dependency caching, Oxlint static analysis, production Vite bundling, and dist artifact uploading.
- Independent status badges for Backend CI and Frontend CI in project documentation.
- Concurrency group cancellation (`cancel-in-progress: true`) to avoid redundant pipeline runs during rapid pushes.

### Changed
- Replaced monolithic full-stack `ci.yml` pipeline with decoupled backend and frontend pipelines to optimize execution time and runner utilization.
- Fallback test database properties configured in `application.properties` to ensure out-of-the-box container and CI execution without external PostgreSQL dependencies.

---

## [1.2.0] - 2026-11-06

### Added
- Site-wide skeleton loaders suite (`EventCardSkeleton`, `SeatMapSkeleton`, `AdminDashboardSkeleton`, `BookingCardSkeleton`, `WishlistCardSkeleton`, `ProfileSkeleton`) matching exact container geometries to ensure zero Cumulative Layout Shift (CLS).
- High-contrast monochrome (grayscale) styling for sold-out events with distinct "SOLD OUT" badge stamp and disabled interactive actions.
- Interactive 3D stacked sliding event cards carousel on catalog discovery view with smooth transitions.
- Cinema Premiere seating layout mode in `SeatMapModal` featuring curved amphitheater projection screen, sound towers, stage lighting, center aisle partitioning, and directional radar telemetry HUD.
- Bespoke acoustic resonance harmonic waveform canvas engine (`HarmonicWaveGrid`) with mouse impulse physics, sweeping stage spotlights, rotating wireframe ticket passes, and archival 90s brutalist rave flyer textures.
- Circular laser aperture transitions, CRT scanline beam sweeps, and exposure pill HUD badges.
- Smooth light/dark theme toggle synchronizing CSS variables across all components with butter-smooth 60fps performance.
- Staging cloud deployment configuration via `embarko.json`.

### Optimized
- Converted heavy PNG/JPG raster hero and event artwork to modern WebP format, achieving >80% reduction in image payload size and dramatically accelerating First Contentful Paint (FCP).
- Configured dynamic Rollup `manualChunks` vendor splitting in `vite.config.js` (`vendor-react`, `vendor-icons`, `vendor-socket`) to eliminate oversized chunks.
- Replaced monolithic Lucide icon object lookups with statically tree-shakable static dictionary in `CategoryBadge.jsx`, shedding over 1,500 unreferenced SVG definitions.
- Migrated frontend linting from legacy ESLint to Rust-based `oxlint`, reducing static analysis duration from several seconds to under 30 milliseconds.
- Enabled production console and debugger statement stripping via Terser minification.

---

## [1.1.0] - 2026-11-05

### Added
- Explicit manual seat lock and unlock endpoints (`POST /api/seats/lock`, `POST /api/seats/unlock`) with OpenAPI documentation.
- Comprehensive `SeatServiceTest` suite covering grid auto-generation, temporary lock acquisition, and lock expiration flows.
- Structured logging on check-in operations in `TicketService`.
- Comprehensive `TicketServiceTest` suite validating check-in state transitions, QR tokens, and PDF generation restrictions on cancelled tickets.
- Comprehensive `PaymentControllerTest` suite verifying payment processing, RBAC restrictions, and refund flows.
- Comprehensive `AdminServiceTest` suite covering operational analytics calculations and diagnostic health reporting.

### Fixed
- Added duplicate email validation on profile update (`UserService.updateUser`) to prevent low-level database unique constraint exceptions.
- Added null safety checks for event dates and categories in `AdminService` stream aggregations.
- Enforced transactional boundaries across user and ticket operations.

---

## [1.0.0] - 2026-08-03

### Initial Release

The initial production-ready release of the Event Booking System.

### Added

#### Authentication and Access Control
- Stateless JWT authentication with access token and refresh token rotation.
- Role-based authorization across `ADMIN`, `ORGANIZER`, and `CUSTOMER` roles.
- Registration with email verification token workflows.
- Password hashing via BCrypt and automatic migration runner for legacy credentials.
- Password recovery workflow via emailed verification tokens.

#### Event Management
- Event CRUD operations with organizer assignment.
- Event lifecycle transitions: `DRAFT`, `PUBLISHED`, `COMPLETED`, `CANCELLED`.
- Soft-deletion support preserving referential integrity.
- Dynamic search queries built using JPA Specifications.
- Discovery feeds for popular, trending, and recommended events.
- Multipart image upload endpoint for event promotional banners.

#### Venue and Seat Management
- Venue inventory management with seat capacity enforcement.
- Seating configuration across `REGULAR`, `VIP`, and `PREMIUM` tiers.
- Temporary seat hold mechanism with configurable expiration.
- Background scheduler releasing expired seat holds every 60 seconds.
- Real-time seat status synchronization over STOMP WebSocket topics.

#### Booking and Ticketing
- Atomic seat reservation workflow.
- Optimistic concurrency control (`@Version`) on Booking, Event, and Seat entities.
- Reservation cancellation restoring inventory.
- QR-coded ticket generation using Google ZXing.
- PDF e-ticket and invoice generation via iText 8.
- Gate check-in validation by QR code scan or ticket ID.

#### Payments and Financials
- 1:1 Payment entity association with bookings.
- Supported settlement rails: `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING`.
- Transaction tracking across `PENDING`, `COMPLETED`, `FAILED`, and `REFUNDED` states.
- Promotional coupon engine supporting percentage, fixed, and early-bird deductions.

#### Waitlist and Wishlist
- Waitlist queue for sold-out events with automated promotion triggers.
- Personal event collections via user wishlist.

#### Reviews and Ratings
- 1-to-5 star event reviews with comments.
- Unique constraints enforcing single-review limit per user per event.

#### Administrative Dashboard
- Real-time metrics overview: revenue, bookings, user acquisition, and event inventory.
- Time-series analytics and system diagnostics endpoint.

#### Infrastructure
- Dual caching layer: Redis primary with in-memory `ConcurrentMapCacheManager` fallback.
- Bucket4j token bucket rate limiting on sensitive routes.
- Spring Actuator telemetry endpoints.
- SpringDoc OpenAPI interactive documentation.
- Structured audit logging via `AuditLogger`.
