---
last_mapped_commit: 2e8f2f230d41c144fee000103e22e13cea755041
last_mapped_at: 2026-11-11
---
# Architecture & System Design

**Analysis Date:** 2026-11-11

## Architecture Overview
The Event Booking System follows a strictly layered, domain-driven clean architecture on the backend, complemented by a modular, component-based single-page application on the frontend.

```
Client (Browser / React 19)
    │
    ▼
Reverse Proxy / Vite Proxy (Port 3000 -> 8080)
    │
    ▼
Spring Security Filter Chain (RateLimitFilter -> JwtAuthenticationFilter)
    │
    ▼
REST Controllers (`/controller/*`) ─── OpenAPI Docs
    │  (Consumes/Produces DTOs only)
    ▼
Service Layer (`/service/*` interfaces -> `/service/impl/*`)
    │  (Business logic, validation, @Transactional boundaries)
    ▼
Mappers (`/mapper/*`) ── Data Transfer Objects (`/dto/*`)
    │
    ▼
Spring Data JPA Repositories (`/repository/*`) + Specifications (`/specification/*`)
    │
    ▼
Domain Entities (`/entity/*` extending `BaseEntity`)
    │
    ▼
Database (PostgreSQL / H2)
```

---

## 1. Core Architectural Layers

### Controller Layer (`com.kritagya.event_booking_system.controller`)
- **Role:** HTTP transport orchestration, request validation (`@Valid`), status codes, and routing.
- **Rules:**
  - Controllers **never** interact directly with database entities; all inputs and outputs are strictly typed DTOs.
  - Endpoints return `ResponseEntity<ApiResponse<T>>` or typed DTO payloads with semantic HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`, `409 Conflict`).
  - Total 15 REST controllers covering authentication, events, bookings, tickets, seats, venues, coupons, reviews, waitlists, wishlists, and administration.

### Service Layer (`com.kritagya.event_booking_system.service`)
- **Role:** Pure business logic, authorization rules, transactional consistency, external integrations.
- **Contract:** Clean interface segregation (`BookingService` interface) with implementation in `com.kritagya.event_booking_system.service.impl.BookingServiceImpl`.
- **Transactions:** Method-level `@Transactional` declarations. Write operations use `@Transactional`, while read operations explicitly designate `@Transactional(readOnly = true)` to optimize Hibernate dirty checking.

### Repository Layer (`com.kritagya.event_booking_system.repository`)
- **Role:** Persistence abstraction using Spring Data JPA.
- **Specifications:** Complex dynamic searches (e.g. event filtering by category, date range, venue, price range) leverage `JpaSpecificationExecutor<T>` via dedicated specification builders in `com.kritagya.event_booking_system.specification`.

### Entity Model (`com.kritagya.event_booking_system.entity`)
- **Foundation:** All domain entities inherit from `BaseEntity.java` providing:
  - `id`: Auto-incrementing primary key
  - `createdAt`: `@CreatedDate` audit timestamp
  - `updatedAt`: `@LastModifiedDate` audit timestamp
- **Key Domain Entities:**
  - `User`: Accounts, credentials, roles (`ADMIN`, `USER`, `ORGANIZER`), status.
  - `Venue`: Physical locations, address, capacity, layout geometry.
  - `Event`: Event schedule, pricing tiers, venue linkage, categories, media.
  - `Seat`: Row and number allocation, section tier, real-time reservation locks.
  - `Booking`: Header record linking user, event, reserved seats, total price, and lifecycle status (`PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`).
  - `Payment`: Transaction logs, payment method, gateway reference, payment status.
  - `Ticket`: Digital admission pass with unique serial number, QR code payload, and check-in status.
  - `Coupon`: Discount rules, percentage/fixed amounts, usage limits, expiration.
  - `Waitlist` & `Wishlist`: Engagement and queue management for sold-out events.
  - `RefreshToken`: Cryptographically secure tokens for rotating JWT access credentials.

---

## 2. Authentication & Security Architecture

### Token Lifecycle & Dual-Transport Support
1. **Login:** User authenticates against `/api/auth/login`. On success, backend issues:
   - Access Token (short-lived JWT, 15–30 minutes)
   - Refresh Token (persisted in DB with revocation support, 7 days)
2. **Transport Flexibility:**
   - Supported via `Authorization: Bearer <token>` header for mobile/API clients.
   - Supported via secure `HttpOnly`, `SameSite=Lax` cookies for the web frontend to prevent XSS credential theft.
3. **Fail-Fast Security Validation:**
   - `JwtUtil.java` runs `@PostConstruct` validation at application bootstrap.
   - Rejects missing keys, blank keys, keys shorter than 256 bits, or known insecure default secret keys (`secret123`, `changeme`), preventing accidental deployment with compromised defaults.

---

## 3. Exception Handling Architecture

- **Global Exception Handler:** `src/main/java/com/kritagya/event_booking_system/exception/GlobalExceptionHandler.java`
- **Pattern:** Centralized `@RestControllerAdvice` catching custom domain exceptions (`ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`, `ConflictException`) and standard Spring validation failures (`MethodArgumentNotValidException`).
- **Response Format:** Uniform `ErrorResponse` structure:
  ```json
  {
    "timestamp": "2026-11-11T14:00:00Z",
    "status": 404,
    "error": "Not Found",
    "message": "Event with id 42 not found",
    "path": "/api/events/42"
  }
  ```

---

## 4. Real-Time Seat Reservation Concurrency

- **Challenge:** Preventing double-booking when multiple users attempt to reserve the same seat simultaneously.
- **Strategy:**
  1. **Database Lock:** Pessimistic/optimistic locking on `Seat` rows during reservation transactions.
  2. **Temporary Hold:** Selected seats transition to `LOCKED` status with an automatic 15-minute expiration timestamp.
  3. **WebSocket Broadcast:** State transitions are published immediately to `/topic/events/{id}/seats` to visually disable or re-enable seats on all connected client browsers.
  4. **Scheduler Cleanup:** A background cron task (`BookingExpirationScheduler`) regularly sweeps expired `PENDING` bookings and restores seat availability.

---

*Architecture analysis: 2026-11-11*
*Update after structural changes or layer reorganizations*
