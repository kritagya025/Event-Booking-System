# Changelog

All notable changes to the Event Booking System are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
