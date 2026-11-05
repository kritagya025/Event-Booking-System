# System Architecture

This document describes the software architecture, design patterns, data flow, concurrency controls, and operational infrastructure of the Event Booking System.

---

## Table of Contents

- [Architectural Style](#architectural-style)
- [System Topology](#system-topology)
- [Backend Structure](#backend-structure)
  - [Package Layout](#package-layout)
  - [Layer Boundaries](#layer-boundaries)
  - [Domain Model](#domain-model)
- [Frontend Structure](#frontend-structure)
- [Security Architecture](#security-architecture)
  - [Authentication Flow](#authentication-flow)
  - [Filter Chain](#filter-chain)
  - [Authorization Matrix](#authorization-matrix)
- [Data Flow and State Transitions](#data-flow-and-state-transitions)
  - [Reservation and Payment Workflow](#reservation-and-payment-workflow)
  - [Event Search Flow](#event-search-flow)
- [Real-Time Messaging](#real-time-messaging)
- [Caching and Persistence](#caching-and-persistence)
- [Background Schedulers](#background-schedulers)
- [Exception Handling](#exception-handling)
- [Cross-Cutting Concerns](#cross-cutting-concerns)
- [Key Architectural Decisions](#key-architectural-decisions)

---

## Architectural Style

The application is structured as a **modular monolith** with a separated Single Page Application (SPA) frontend. 

The backend exposes stateless REST APIs for transactional queries and mutations, alongside STOMP WebSocket endpoints for broadcasting real-time seat availability updates. All application layers run within a single Spring Boot runtime instance, utilizing PostgreSQL for ACID persistence and an optional Redis instance for query acceleration.

---

## System Topology

```
+-------------------------------------------------------------+
|                     Client Tier (Browser)                   |
|         React 19 SPA (Vite)  *  STOMP over SockJS           |
+------------------------------+------------------------------+
                               | HTTP / WebSocket
+------------------------------v------------------------------+
|                    Application Tier (Spring Boot)           |
|                                                             |
|  Security Filters:                                          |
|    RateLimitingFilter -> JwtAuthenticationFilter -> CORS    |
|                                                             |
|  Web Layer:                                                 |
|    15 REST Controllers (88 Endpoints)                       |
|                                                             |
|  Business Layer:                                            |
|    17 Services + Event Reminder & Seat Lock Schedulers      |
|                                                             |
|  Persistence Layer:                                         |
|    12 Spring Data JPA Repositories + JPA Specifications     |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            |                                     |
+-----------v-----------+             +-----------v-----------+
|      PostgreSQL       |             |         Redis         |
|     (Primary DB)      |             |    (Cache Layer)      |
+-----------------------+             +-----------------------+
```

---

## Backend Structure

### Package Layout

The backend codebase is organized by technical layer, with distinct submodules for authentication and administrative operations:

```
com.kritagya.event_booking_system
|-- auth/               # Authentication controllers, token management, and auth DTOs
|-- config/             # Spring configuration (JPA Auditing, Redis, WebSocket, OpenAPI)
|-- controller/         # REST API endpoints (15 controllers)
|-- dto/                # Request and response data transfer objects
|   `-- admin/          # Admin dashboard, analytics, and diagnostic DTOs
|-- entity/             # JPA entity definitions extending BaseEntity
|-- enums/              # Enumerated types (Role, Statuses, Types)
|-- exception/          # GlobalExceptionHandler and custom application exceptions
|-- logging/            # AuditLogger component for structured operational logging
|-- mapper/             # Explicit entity-to-DTO conversion mappers
|-- repository/         # Spring Data JPA repositories
|-- scheduler/          # Background tasks for seat expiration and event notifications
|-- security/           # Token utilities, user authentication providers, and HTTP filters
|-- service/            # Core business domain service interfaces
|   `-- impl/           # Concrete service implementations
|-- specification/      # Dynamic JPA Criteria queries for event searching
`-- websocket/          # Real-time WebSocket event publishers
```

### Layer Boundaries

- **Controller Layer**: Handles HTTP requests, enforces request validation via Jakarta Bean Validation (`@Valid`), delegates to service components, and produces standardized HTTP response entities. Controllers contain no business logic.
- **Service Layer**: Manages business logic, cross-entity coordination, transactional boundaries (`@Transactional`), and event publishing.
- **Repository Layer**: Encapsulates persistence interactions through Spring Data JPA interfaces. Dynamic search criteria are composed via JPA Specifications.
- **Entity Layer**: Defines the relational domain model, foreign key associations, and lifecycle callbacks via JPA Auditing.
- **DTO and Mapper Layer**: Isolates internal database representations from external API contracts. Explicit mappers prevent unintended lazy-loading or internal schema leaks.

### Domain Model

```
User (app_user)
|-- 1:N -> Booking
|-- 1:N -> Review
|-- 1:N -> Wishlist
|-- 1:N -> Waitlist
|-- 1:N -> RefreshToken
`-- 1:N -> Event (as organizer)

Venue
|-- 1:N -> Event
`-- 1:N -> Seat

Event
|-- N:1 -> Venue
|-- N:1 -> User (organizer)
|-- 1:N -> Booking
|-- 1:N -> Review
|-- 1:N -> Seat
|-- 1:N -> Wishlist
`-- 1:N -> Waitlist

Booking
|-- N:1 -> User
|-- N:1 -> Event
|-- N:M -> Seat (via booking_seats join table)
|-- 1:1 -> Payment
`-- 1:N -> Ticket

Ticket
`-- N:1 -> Booking

Payment
`-- 1:1 -> Booking

Coupon (standalone entity)
```

---

## Frontend Structure

The frontend is an application built with React 19 and bundled using Vite.

```
frontend/src/
|-- App.jsx                    # Root component handling routing and global view state
|-- App.css                    # Layout styling
|-- index.css                  # Core CSS design tokens
|-- main.jsx                   # React entry point
|-- components/
|   |-- Navbar.jsx             # Top-level header with user authentication controls
|   |-- AuthModal.jsx          # Modal for login and registration
|   |-- SeatMapModal.jsx       # Interactive seat layout, reservation, and payment modal
|   |-- CreateEventModal.jsx   # Event creation form for organizers and administrators
|   |-- CheckInModal.jsx       # Staff check-in interface with QR scanner
|   |-- AdminDashboard.jsx     # Administrative analytics and system health view
|   |-- MyBookings.jsx         # Customer booking history and ticket downloads
|   |-- ProfileDashboard.jsx   # Profile management and password updates
|   `-- Wishlist.jsx           # Saved events collection
`-- services/
    |-- api.js                 # HTTP client with interceptors for JWT injection
    |-- currency.js            # Multi-currency formatting utilities
    `-- websocket.js           # STOMP connection manager with auto-reconnection
```

---

## Security Architecture

### Authentication Flow

1. **User Login**: The client submits email and password to `POST /api/auth/login`.
2. **Credential Verification**: Credentials are authenticated against BCrypt-hashed passwords in the database.
3. **Token Issuance**: The server generates an access token (24-hour expiration) and an opaque UUID refresh token (7-day expiration). Tokens are returned in the response body and set in secure HttpOnly cookies.
4. **Subsequent Invocations**: The client supplies the access token in the `Authorization: Bearer <token>` HTTP header.
5. **Token Rotation**: When the access token expires, `POST /api/auth/refresh` accepts the refresh token, revokes it in the database, and issues a new access and refresh token pair.

### Filter Chain

All inbound requests pass through the following filter sequence:

1. **RateLimitingFilter**: Intercepts requests to `/api/auth/**`, `/api/bookings/**`, and `/api/payments/**`. Uses Bucket4j token buckets mapped by client IP to limit requests to 10 requests per minute per IP address.
2. **JwtAuthenticationFilter**: Parses the `Authorization` header, validates the HMAC-SHA256 signature and expiration date, loads user details, and populates the `SecurityContextHolder`.
3. **RequestLoggingFilter**: Emits structured logs containing HTTP method, URI, remote IP, response status, and request duration.
4. **Spring Security Filter Chain**: Evaluates URL patterns and method-level security (`@PreAuthorize`).

### Authorization Matrix

| Domain Resource | Anonymous | Customer | Organizer | Administrator |
|---|---|---|---|---|
| Public Events | Read | Read | Read | Read |
| Event Management | Denied | Denied | Create, Edit Own | Full Access |
| Venues | Read | Read | Read | Full Access |
| Seat Reservation | Denied | Reserve, View | Reserve, View | Full Access |
| Bookings | Denied | Create, View Own | View Event Bookings | Full Access |
| Payments | Denied | Process Own | View Own Event | Full Access, Refund |
| Check-In / Validation | Denied | Denied | Validate, Check In | Validate, Check In |
| Admin Analytics | Denied | Denied | Denied | Full Access |
| User Administration | Denied | Self Only | Self Only | Full Access |

---

## Data Flow and State Transitions

### Reservation and Payment Workflow

```
1. Inquire Availability:
   Client -> GET /api/seats/venue/{venueId}/available
   Server returns available seats with seat IDs and pricing tiers.

2. Acquire Temporary Seat Lock:
   Client -> POST /api/seats/lock
   Server verifies seat status == AVAILABLE.
   Server sets status = LOCKED and lockedUntil = now() + 10 minutes.
   Server publishes update to STOMP topic.

3. Submit Reservation:
   Client -> POST /api/bookings
   Server verifies seat lock ownership and event PUBLISHED status.
   Server sets Booking status = PENDING.
   Server transitions seat status = BOOKED.
   Server decrements Event.availableSeats (optimistic locking enforced via @Version).

4. Submit Payment:
   Client -> POST /api/payments
   Server validates payment parameters and processes transaction.
   Server sets Payment status = COMPLETED.
   Server updates Booking status = CONFIRMED.
   Server invokes EmailService asynchronously to send confirmation.

5. Ticket Generation:
   Client -> POST /api/tickets/booking/{bookingId}
   Server generates unique ZXing QR codes per seat and stores tickets with status ACTIVE.
   Client -> GET /api/tickets/{id}/pdf to download printable e-ticket.
```

### Event Search Flow

1. The client submits search parameters to `GET /api/events/search` (supporting `keyword`, `category`, `city`, `startDate`, `endDate`, `minPrice`, `maxPrice`).
2. `EventSpecification` translates incoming filters into a composable JPA Criteria query.
3. Keywords are tokenized into whitespace-delimited terms. Each term is evaluated against `event.name`, `event.description`, `event.venue.name`, `event.venue.address`, and `event.category` using case-insensitive `ILIKE` patterns.
4. The database returns a paginated `Page<Event>` result set, mapped directly to `EventResponseDTO` objects.

---

## Real-Time Messaging

Real-time seat state changes are coordinated using Spring WebSocket:

- **Connection URL**: `/ws` (with SockJS transport fallback)
- **Message Broker**: Simple in-memory message broker with destination prefix `/topic`
- **Application Prefix**: `/app`
- **Publication Channel**: Whenever seat locks are acquired, released, or booked, `SeatUpdatePublisher` broadcasts an event to `/topic/events/{eventId}/seats`.
- **Payload Schema**:
  ```json
  {
    "eventId": 101,
    "seatId": 452,
    "status": "LOCKED",
    "availableSeats": 118,
    "timestamp": "2026-11-05T12:00:00"
  }
  ```

---

## Caching and Persistence

### Persistence
The system uses PostgreSQL 16+ as the source of truth. Schema structures, constraints, and composite indexes are defined through JPA entity annotations.

### Concurrency Control
Double-booking prevention is enforced through optimistic locking. Entities that mutate under concurrency (`Booking`, `Event`, `Seat`) declare an `@Version` column. If two requests attempt to book or modify the same record concurrently, Hibernate throws an `OptimisticLockException`, which is translated by `GlobalExceptionHandler` to an `HTTP 409 Conflict`.

### Caching Layer
Caching is configured in `RedisConfig.java`:
- When `CACHE_TYPE=redis`, the system connects to Redis and configures a default Time-To-Live (TTL) of 10 minutes using JSON serialization.
- When `CACHE_TYPE=simple` (default for development), `ConcurrentMapCacheManager` serves as an in-memory fallback, eliminating the Redis requirement for local development.
- Key cached domains: `events`, `popularEvents`, `adminStats`.

---

## Background Schedulers

Background jobs run using Spring's `@Scheduled` infrastructure:

| Scheduler | Frequency | Target Responsibility |
|---|---|---|
| `SeatLockScheduler` | Every 60 seconds | Queries seats where `status = 'LOCKED'` and `lockedUntil < now()`. Resets status to `AVAILABLE`, clears the lock timestamp, and publishes WebSocket notifications. |
| `EventReminderScheduler` | Daily at 08:00 AM | Scans for events occurring the following calendar day and dispatches reminder emails to confirmed ticket holders. |

---

## Exception Handling

`GlobalExceptionHandler` provides centralized error translation using `@RestControllerAdvice`:

| Exception Class | Response Status | Purpose |
|---|---|---|
| `ResourceNotFoundException` | 404 Not Found | Missing domain entity (user, event, booking, seat) |
| `DuplicateResourceException` | 409 Conflict | Constraint collision (duplicate email, duplicate review) |
| `DuplicateEmailException` | 409 Conflict | Email registration collision |
| `MethodArgumentNotValidException` | 400 Bad Request | Payload validation failure |
| `IllegalArgumentException` | 400 Bad Request | Invalid parameter ranges or values |
| `MaxUploadSizeExceededException` | 400 Bad Request | Image payload exceeding the 20MB threshold |
| `BadCredentialsException` | 401 Unauthorized | Authentication failure |
| `TokenExpiredException` | 401 Unauthorized | Expired JWT or refresh token |
| `AccessDeniedException` | 403 Forbidden | Insufficient role privileges |
| `DisabledException` | 403 Forbidden | Unverified account state |
| `OptimisticLockingFailureException` | 409 Conflict | Concurrent update collision |
| `Exception` (fallback) | 500 Internal Server Error | Unhandled server error |

---

## Cross-Cutting Concerns

- **JPA Auditing**: `BaseEntity` tracks `createdAt`, `updatedAt`, `createdBy`, and `updatedBy` for all persistent tables via `AuditingEntityListener`.
- **Audit Logging**: `AuditLogger` records structured logs for sensitive transactions, including login attempts, payment events, booking cancellations, and role updates.
- **Request Tracing**: `RequestLoggingFilter` logs incoming request methods, paths, processing latencies, and output status codes.

---

## Key Architectural Decisions

1. **Modular Monolith over Microservices**: Selected to minimize operational overhead, simplify distributed transactions across bookings and payments, and enable straightforward single-command deployment.
2. **Optimistic Locking over Pessimistic Row Locking**: Reduces database lock contention on seat rows while guaranteeing that double-bookings fail deterministically.
3. **JPA Specifications for Event Filtering**: Permits composable, type-safe query construction without relying on raw SQL strings.
4. **Decoupled Fallback Caching**: Enables zero-dependency local development via in-memory caching while supporting distributed Redis caching in production.
5. **Dual Token Authentication**: Combines short-lived access tokens with revocable refresh tokens to balance low verification latency with immediate session revocation capabilities.
