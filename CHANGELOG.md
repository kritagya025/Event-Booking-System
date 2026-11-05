# Changelog

All notable changes to the Event Booking System are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
