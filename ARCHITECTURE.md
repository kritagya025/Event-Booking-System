# 🏗️ Architecture — Event Booking System

This document provides a comprehensive overview of the system architecture, design patterns, component interactions, and key technical decisions.

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Security Architecture](#security-architecture)
- [Data Flow](#data-flow)
- [Real-Time Communication](#real-time-communication)
- [Caching Strategy](#caching-strategy)
- [Scheduling & Background Tasks](#scheduling--background-tasks)
- [Error Handling Strategy](#error-handling-strategy)
- [Cross-Cutting Concerns](#cross-cutting-concerns)
- [Design Decisions](#design-decisions)

---

## System Overview

The Event Booking System is a **layered monolithic application** with a clear separation between the backend API (Spring Boot) and the frontend SPA (React + Vite). Communication between the two occurs over RESTful HTTP APIs and STOMP-based WebSocket connections.

```
                    ┌────────────────────────────────┐
                    │        Client (Browser)         │
                    │   React 19 SPA + STOMP Client   │
                    └───────────┬────────────────┬────┘
                        REST API│                │WebSocket
                                │                │
                    ┌───────────▼────────────────▼────┐
                    │      Spring Boot Application    │
                    │                                 │
                    │  ┌───────────────────────────┐  │
                    │  │ Security Filter Chain      │  │
                    │  │ ├─ RateLimitingFilter      │  │
                    │  │ ├─ JwtAuthenticationFilter │  │
                    │  │ └─ RequestLoggingFilter    │  │
                    │  └────────────┬──────────────┘  │
                    │               │                  │
                    │  ┌────────────▼──────────────┐  │
                    │  │   Controller Layer         │  │
                    │  │   15 REST Controllers      │  │
                    │  │   + 1 Auth Controller       │  │
                    │  └────────────┬──────────────┘  │
                    │               │                  │
                    │  ┌────────────▼──────────────┐  │
                    │  │   Service Layer            │  │
                    │  │   16 Service Classes       │  │
                    │  │   + Business Logic         │  │
                    │  └────────────┬──────────────┘  │
                    │               │                  │
                    │  ┌────────────▼──────────────┐  │
                    │  │   Repository Layer         │  │
                    │  │   12 JPA Repositories      │  │
                    │  │   + JPA Specifications      │  │
                    │  └────────────┬──────────────┘  │
                    │               │                  │
                    └───────────────┼──────────────────┘
                                    │
                    ┌───────────────▼──────────────────┐
                    │       Data Stores                 │
                    │  ┌─────────────┐ ┌─────────────┐ │
                    │  │ PostgreSQL  │ │   Redis     │ │
                    │  │ (Primary)   │ │  (Cache)    │ │
                    │  └─────────────┘ └─────────────┘ │
                    └──────────────────────────────────┘
```

---

## Backend Architecture

### Package Structure

The backend follows a **package-by-feature** structure within a standard Spring Boot layered architecture:

```
com.kritagya.event_booking_system
├── auth/               # Authentication module (controller, service, DTOs)
├── config/             # Application configuration classes
├── controller/         # REST API controllers (15 controllers)
├── dto/                # Data Transfer Objects (21 DTOs + 6 admin DTOs)
│   └── admin/          # Admin-specific DTOs
├── entity/             # JPA entity classes (13 entities)
├── enums/              # Enum types (10 enums)
├── exception/          # Custom exceptions + global handler
├── logging/            # Audit logging aspect
├── mapper/             # Entity ↔ DTO mappers (7 mappers)
├── repository/         # Spring Data JPA repositories (12 repositories)
├── scheduler/          # Scheduled tasks (2 schedulers)
├── security/           # Security configuration + JWT + filters
├── service/            # Business logic services (16 interfaces/classes)
│   └── impl/           # Service implementations
├── specification/      # JPA Specification builders
└── websocket/          # WebSocket message publishers
```

### Layer Responsibilities

| Layer | Responsibility | Key Classes |
|---|---|---|
| **Controller** | Request handling, input validation, response mapping | `EventController`, `BookingController`, `AuthController`, etc. |
| **Service** | Business logic, transaction management, orchestration | `EventService`, `BookingService`, `AuthService`, `TicketService` |
| **Repository** | Data access, custom queries | `EventRepository`, `BookingRepository`, `SeatRepository` |
| **Entity** | Domain model, JPA mappings, database schema | `Event`, `Booking`, `User`, `Seat`, `Ticket`, `Payment` |
| **DTO** | API contract, request/response shapes, validation | `EventRequestDTO`, `BookingResponseDTO`, `AuthResponseDTO` |
| **Mapper** | Entity ↔ DTO conversion | `EventMapper`, `BookingMapper`, `UserMapper` |
| **Specification** | Dynamic query building with JPA Criteria API | `EventSpecification` |

### Entity Relationships

```
User (app_user)
├── 1:N → Booking
├── 1:N → Review
├── 1:N → Wishlist
├── 1:N → Waitlist
├── 1:N → RefreshToken
└── 1:N → Event (as organizer)

Event
├── N:1 → Venue
├── N:1 → User (organizer)
├── 1:N → Booking
├── 1:N → Review
├── 1:N → Seat
├── 1:N → Wishlist
└── 1:N → Waitlist

Booking
├── N:1 → User
├── N:1 → Event
├── N:M → Seat (via booking_seats join table)
├── 1:1 → Payment
└── 1:N → Ticket

Venue
├── 1:N → Event
└── 1:N → Seat

Seat
├── N:1 → Venue
└── N:1 → Event (optional)

Ticket
└── N:1 → Booking

Payment
└── 1:1 → Booking

Coupon (standalone)
Wishlist → User + Event
Waitlist → User + Event
RefreshToken → User
Review → User + Event
```

---

## Frontend Architecture

### Technology Stack

- **React 19** — UI framework with functional components and hooks
- **Vite 8** — Build tool with HMR
- **Vanilla CSS** — Custom styling (no Tailwind/CSS framework)

### Component Structure

```
frontend/src/
├── App.jsx                    # Main application shell (routing, state, layout)
├── App.css                    # App-specific styles
├── index.css                  # Global design system
├── main.jsx                   # Vite entry point
├── components/
│   ├── Navbar.jsx             # Top navigation bar with avatar dropdown
│   ├── AuthModal.jsx          # Authentication modal (login/register)
│   ├── LoginPage.jsx          # Standalone login page
│   ├── RegisterPage.jsx       # Standalone registration page
│   ├── SeatMapModal.jsx       # Seat selection + booking + payment flow
│   ├── CreateEventModal.jsx   # Event creation form (organizer/admin)
│   ├── CheckInModal.jsx       # Ticket check-in scanner
│   ├── AdminDashboard.jsx     # Admin analytics dashboard
│   ├── MyBookings.jsx         # User's booking history
│   ├── ProfileDashboard.jsx   # User profile management
│   └── Wishlist.jsx           # Saved events wishlist
├── services/
│   ├── api.js                 # Axios-style HTTP client with JWT interceptor
│   ├── currency.js            # Multi-currency formatting utility
│   └── websocket.js           # STOMP WebSocket client
└── assets/                    # Static assets (images)
```

### State Management

The application uses **React built-in state** (`useState`, `useEffect`) without external state management libraries. Key state is managed in `App.jsx` and passed down via props:

- `user` — Current authenticated user
- `events` / `allMasterEvents` — Event catalog (master + filtered)
- `filters` — Active search filters (keyword, category, city)
- `selectedEvent` — Currently viewed event for booking
- `view` — Current page/view state

---

## Security Architecture

### Authentication Flow

```
┌──────────┐     POST /api/auth/login      ┌──────────────┐
│  Client  │ ──────────────────────────────→ │ AuthService  │
│          │ ←────────────────────────────── │              │
│          │  { accessToken, refreshToken }  └──────┬───────┘
│          │                                        │
│          │  Authorization: Bearer <accessToken>   │ Validates
│          │ ──────────────────────────────→         │ credentials
│          │                                        │
│          │     POST /api/auth/refresh             │ Issues JWT
│          │ ──────────────────────────────→         │ (HMAC-SHA256)
│          │ ←────────────────────────────── ────────┘
│          │  { newAccessToken, newRefreshToken }
└──────────┘  (old refresh token is revoked)
```

### Security Filter Chain Order

1. **RateLimitingFilter** — IP-based rate limiting via Bucket4j (10 req/min on `/api/auth/**`, `/api/bookings`, `/api/payments`)
2. **JwtAuthenticationFilter** — Extracts JWT from `Authorization: Bearer <token>` header, validates, and sets `SecurityContext`
3. **Spring Security Filter Chain** — URL-based authorization rules with method-level `@PreAuthorize`

### Authorization Matrix

| Role | Events | Venues | Bookings | Payments | Tickets | Admin | Users |
|---|---|---|---|---|---|---|---|
| **ADMIN** | Full CRUD | Full CRUD | Full access | Full access | Full access | ✅ | Full CRUD |
| **ORGANIZER** | Create/Edit/Delete | Create/Edit/Delete | View own | View | Validate/Check-in | ❌ | Self only |
| **CUSTOMER** | View/Create | View | Create/Cancel/View own | Create | Generate/Download | ❌ | Self only |
| **Anonymous** | View | View | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Data Flow

### Booking Flow

```
1. Customer browses events          GET /api/events
2. Selects event & views seats      GET /api/seats/venue/{venueId}/available
3. Locks seats (client-side)        Seat status → LOCKED (lockedUntil = now + 10min)
4. Creates booking                  POST /api/bookings
   ├── Validates event exists & is PUBLISHED
   ├── Validates seats are AVAILABLE/LOCKED
   ├── Creates Booking record (status: PENDING)
   ├── Updates seats → BOOKED
   ├── Decrements event.availableSeats
   ├── Publishes WebSocket seat update
   └── Returns BookingResponseDTO
5. Processes payment                POST /api/payments
   ├── Validates booking exists & is PENDING
   ├── Creates Payment record (status: COMPLETED)
   ├── Updates booking → CONFIRMED
   └── Sends confirmation email (async)
6. Generates tickets                POST /api/tickets/booking/{bookingId}
   ├── Generates unique QR codes per seat
   ├── Creates Ticket records (status: ACTIVE)
   └── Returns list of TicketResponseDTOs
7. Downloads ticket PDF             GET /api/tickets/{id}/pdf
```

### Search Flow

```
Client sends search query
    │
    ▼
Frontend applyLiveFilter()
    │ Case-insensitive, tokenized, multi-field matching
    │ Filters allMasterEvents in real-time
    │
    ▼ (Optional: backend search)
GET /api/events/search?keyword=...&category=...&city=...
    │
    ▼
EventSpecification.withFilters()
    │ Builds JPA Criteria predicates
    │ Searches: name, description, venue.name, venue.address, category
    │ Each search word is OR-matched across all fields
    │
    ▼
Returns paginated EventResponseDTOs
```

---

## Real-Time Communication

### WebSocket Architecture

```
                    ┌────────────────────┐
                    │   React Frontend   │
                    │  STOMP.js Client   │
                    └────────┬───────────┘
                             │ STOMP over WebSocket
                             │ (SockJS fallback)
                    ┌────────▼───────────┐
                    │  /ws endpoint      │
                    │  WebSocketConfig   │
                    └────────┬───────────┘
                             │
                    ┌────────▼───────────────────┐
                    │ SeatUpdatePublisher         │
                    │ → /topic/events/{id}/seats  │
                    └────────────────────────────┘
```

- **Endpoint**: `/ws` (STOMP with SockJS fallback)
- **Broker Prefix**: `/topic` (simple in-memory broker)
- **App Prefix**: `/app`
- **Seat Updates**: Published to `/topic/events/{eventId}/seats` with payload: `{ eventId, seatId, status, availableSeats, timestamp }`

---

## Caching Strategy

### Configuration

The system supports two caching backends:

| Mode | Configuration | Use Case |
|---|---|---|
| **Simple** (default) | `spring.cache.type=simple` | Development, single-instance |
| **Redis** | `spring.cache.type=redis` | Production, multi-instance |

### Cache Configuration

- **TTL**: 10 minutes (Redis mode)
- **Null values**: Disabled
- **Serialization**: Jackson JSON
- **Fallback cache names**: `events`, `popularEvents`, `adminStats`

---

## Scheduling & Background Tasks

| Scheduler | Frequency | Purpose |
|---|---|---|
| `EventReminderScheduler` | Daily at 08:00 AM | Sends reminder emails for events happening tomorrow |
| `SeatLockScheduler` | Every 60 seconds | Releases seats whose `lockedUntil` timestamp has expired |

Both schedulers are enabled via `@EnableScheduling` on the main application class.

---

## Error Handling Strategy

### Global Exception Handler

`GlobalExceptionHandler` (`@ControllerAdvice`) provides centralized error handling:

| Exception | HTTP Status | Scenario |
|---|---|---|
| `ResourceNotFoundException` | 404 | Entity not found |
| `DuplicateResourceException` | 409 | Duplicate entity |
| `DuplicateEmailException` | 409 | Email already registered |
| `MethodArgumentNotValidException` | 400 | Bean validation failure |
| `IllegalArgumentException` | 400 | Invalid input |
| `MaxUploadSizeExceededException` | 400 | File too large (>20MB) |
| `BadCredentialsException` | 401 | Wrong email/password |
| `TokenExpiredException` | 401 | Expired JWT or refresh token |
| `AccessDeniedException` | 403 | Insufficient permissions |
| `DisabledException` | 403 | Unverified email |
| `ObjectOptimisticLockingFailureException` | 409 | Concurrent modification |
| `Exception` (catch-all) | 500 | Unexpected errors |

### Error Response Format

```json
{
  "status": 404,
  "message": "Event not found with ID: 99",
  "timestamp": "2026-08-03T14:30:00",
  "details": {}
}
```

---

## Cross-Cutting Concerns

### JPA Auditing

All entities extend `BaseEntity` which provides automatic audit fields:
- `createdAt` — Set on entity creation (immutable)
- `updatedAt` — Set on every update
- `createdBy` — Authenticated user email or "SYSTEM"
- `updatedBy` — Authenticated user email or "SYSTEM"

### Audit Logging

`AuditLogger` records structured audit events for:
- Login attempts (success/failure + IP)
- Booking creation and cancellation
- Event creation and updates
- Payment processing

### Optimistic Locking

`@Version` is applied on `Booking`, `Event`, and `Seat` entities to prevent lost updates during concurrent modifications. `ObjectOptimisticLockingFailureException` is caught globally and returns HTTP 409 Conflict.

### Request Logging

`RequestLoggingFilter` logs method, URI, status code, and response time for every HTTP request.

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **Monolithic architecture** | Appropriate for the current scale; enables simpler development and deployment |
| **JPA Specifications** | Dynamic query building for complex search filters without native SQL |
| **Refresh token rotation** | Each refresh operation revokes the old token and issues a new pair |
| **In-memory rate limiting** | Bucket4j with `ConcurrentHashMap` — suitable for single-instance; swap to Redis-backed for horizontal scaling |
| **Simple cache fallback** | Allows development without Redis dependency |
| **STOMP over WebSocket** | Industry standard for real-time messaging with browser compatibility via SockJS |
| **Soft delete for events** | `deleted` flag preserves data integrity for analytics and historical bookings |
| **UUID-based QR codes** | Ensures unique, non-guessable ticket identifiers |
| **Manual mappers** | Explicit DTO ↔ Entity mapping without MapStruct dependency |
| **Password migration runner** | Safely migrates plaintext passwords to BCrypt on startup |
| **Data initializer** | Seeds consistent demo data for development and testing |
