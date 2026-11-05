<p align="center">
  <h1 align="center">🎫 Event Booking System</h1>
  <p align="center">
    A production-grade event management and ticket booking platform built with <strong>Spring Boot 3</strong>, <strong>React 19</strong>, and <strong>PostgreSQL</strong>.
    <br />
    Featuring JWT auth with refresh-token rotation, real-time seat updates via WebSocket, QR-coded e-tickets, PDF generation, and a full admin analytics dashboard.
    <br /><br />
    <a href="#-features"><strong>Features</strong></a> · <a href="#-tech-stack"><strong>Tech Stack</strong></a> · <a href="#-getting-started"><strong>Getting Started</strong></a> · <a href="API_DOCUMENTATION.md"><strong>API Docs</strong></a> · <a href="ARCHITECTURE.md"><strong>Architecture</strong></a>
  </p>
</p>

---

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)
![License](https://img.shields.io/badge/License-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Endpoints](https://img.shields.io/badge/API%20Endpoints-88-informational)
![Tests](https://img.shields.io/badge/Tests-24%20suites-success)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Default Seed Data](#-default-seed-data)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Project Documentation](#-project-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

The **Event Booking System** is a comprehensive, full-stack platform that lets organizers create and manage events with venue-based seating, while customers can browse, search, book tickets, and receive QR-coded e-tickets — all backed by enterprise-grade infrastructure.

### What makes it production-ready

- **88 REST endpoints** across 15 controllers covering the entire event lifecycle
- **JWT authentication** with HttpOnly cookie transport and refresh-token rotation
- **Optimistic locking** (`@Version`) on Booking, Event, and Seat entities to prevent double-booking under concurrency
- **Real-time seat availability** pushed to connected clients via STOMP over WebSocket
- **Scheduled tasks** for automatic seat-lock expiration and event reminder notifications
- **Redis caching** with transparent `ConcurrentMapCache` fallback when Redis is unavailable
- **Bucket4j rate limiting** (10 requests/minute on sensitive endpoints)
- **JPA Auditing** with `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on all entities
- **Structured audit logging** for authentication, bookings, payments, and event operations
- **24 test suites** spanning controllers, services, repositories, and security policies

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based stateless auth with access + refresh token rotation and HttpOnly cookies
- Three roles with granular `@PreAuthorize` checks: **ADMIN**, **ORGANIZER**, **CUSTOMER**
- Email verification flow with configurable token expiry
- Password reset via email with time-limited tokens
- BCrypt password hashing with automatic plain-text migration on startup (`PasswordMigrationRunner`)
- Rate-limited login and registration endpoints

### 🎪 Event Management
- Full CRUD with organizer assignment and soft-delete support
- Event lifecycle: `DRAFT` → `PUBLISHED` → `COMPLETED` / `CANCELLED`
- Publish and unpublish actions with status validation
- Advanced search using JPA Specifications: filter by category, date range, venue, city, keyword, and price range
- Case-insensitive, tokenized keyword matching across multiple fields
- Discovery endpoints: `/popular`, `/trending`, `/recommendations`
- Per-event analytics and view-count tracking
- Banner image upload (up to 20 MB) with UUID-based storage

### 🏟️ Venue & Seat Management
- Venue CRUD with capacity tracking
- Seat-level management with row/number, type (`VIP`, `PREMIUM`, `REGULAR`), and status (`AVAILABLE`, `LOCKED`, `BOOKED`)
- Temporary seat locking with configurable timeout (default 10 minutes)
- `SeatLockScheduler` automatically expires stale locks every 60 seconds
- Real-time seat availability broadcast via `SeatUpdatePublisher` over STOMP/WebSocket
- Composite database indexes on `(venue_id, status)` and `(event_id)` for fast availability queries

### 🎟️ Booking & Ticketing
- Atomic booking creation with seat allocation and validation
- Optimistic locking (`@Version`) prevents double-booking under concurrent requests
- Booking cancellation with automatic seat release
- Ticket generation with unique QR codes (Google ZXing)
- Individual ticket PDF and booking summary PDF downloads (iText 8)
- Ticket validation and attendee check-in via QR code scan (ADMIN/ORGANIZER only)

### 💳 Payment Processing
- One-to-one Payment ↔ Booking relationship
- Methods: `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING`
- Status tracking: `PENDING` → `COMPLETED` / `FAILED` / `REFUNDED`
- Refund by payment ID or booking ID
- Audit logging for all payment state transitions

### 🏷️ Coupons & Discounts
- Coupon types: `PERCENTAGE`, `FIXED`, `EARLY_BIRD`
- Validation rules: usage limits, expiry dates, minimum booking amount
- Admin-only creation with public validation endpoint
- Toggle active/inactive status

### 📋 Waitlist & Wishlist
- Join and leave waitlists for sold-out events
- Waitlist status progression: `WAITING` → `NOTIFIED` → `PROMOTED` / `CANCELLED`
- Automatic promotion notifications when seats become available
- Personal wishlist for saving events with status checks

### ⭐ Reviews & Ratings
- 1–5 star ratings with optional comments (up to 1,000 characters)
- One review per user per event (enforced by unique constraint)
- Paginated review listings with average-rating summaries
- Edit and delete own reviews

### 📊 Admin Dashboard & Analytics
- System-wide dashboard: total users, events, bookings, revenue
- Revenue analytics with booking trends and cancellation rates
- User and event statistics breakdowns
- Comprehensive reports endpoint
- Live system health diagnostics (JVM memory, threads, uptime)

### 📅 Calendar Integration
- iCalendar (`.ics`) file download per event
- Google Calendar deep-link generation for one-click calendar adds

### ⚡ Real-Time Features
- STOMP over WebSocket with `/topic` message broker
- SockJS fallback for broad browser compatibility
- `SeatUpdatePublisher` broadcasts seat status changes to all subscribed clients
- Frontend `websocket.js` service for automatic reconnection

### 🔧 Infrastructure & DevOps
- Redis caching with `ConcurrentMapCacheManager` fallback (caches: `events`, `popularEvents`, `adminStats`)
- Bucket4j rate limiting on auth, booking, and payment endpoints
- Spring Actuator: health, info, and metrics endpoints exposed
- OpenAPI 3.0 / Swagger UI interactive documentation
- Structured request logging via `RequestLoggingFilter`
- `EventReminderScheduler` for automated event reminder notifications
- CORS configuration for frontend development origins

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language runtime |
| Spring Boot | 3.4.1 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | ORM & data access |
| Spring WebSocket | 3.x | Real-time STOMP communication |
| Spring Mail | 3.x | Email notifications |
| Spring Cache | 3.x | Caching abstraction |
| Spring Retry | 2.x | Retry with exponential backoff |
| Spring AOP | 3.x | Cross-cutting concerns |
| Spring Actuator | 3.x | Monitoring & health checks |
| PostgreSQL | 16+ | Primary relational database |
| Redis | 7+ | Distributed caching layer |
| H2 | — | In-memory test database |
| jjwt | 0.12.6 | JWT token creation & validation |
| Bucket4j | 8.10.1 | Token-bucket rate limiting |
| Google ZXing | 3.5.3 | QR code generation |
| iText | 8.0.5 | PDF document generation |
| SpringDoc OpenAPI | 2.7.0 | API documentation & Swagger UI |
| Lombok | Latest | Boilerplate reduction |
| Maven | 3.9+ | Build & dependency management |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.8 | UI framework |
| Vite | 8.2.0 | Build tool & dev server |
| STOMP.js | 7.3.0 | WebSocket client |
| SockJS Client | 1.6.1 | WebSocket fallback transport |
| Lucide React | 1.28.0 | Icon library |
| Canvas Confetti | 1.9.4 | Booking success animations |
| OxLint | 1.75.0 | Fast JavaScript linter |

## 🏗️ Architecture

The application follows a **layered monolithic architecture** with clear separation of concerns:

```
┌───────────────────────────────────────────────────────────┐
│                   React 19 Frontend (Vite)                │
│         20 Components · REST Client · STOMP WebSocket     │
└────────────────────────────┬──────────────────────────────┘
                             │ HTTP / WS
┌────────────────────────────▼──────────────────────────────┐
│                  Spring Boot 3.4.1 Backend                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Security Filters                                    │ │
│  │  JWT Auth · Rate Limiting · Request Logging · CORS   │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Controller Layer (15 controllers · 88 endpoints)    │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Service Layer (17 services · business logic)        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Repository Layer (12 Spring Data JPA repositories)  │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Entity Layer (13 JPA entities · JPA Auditing)       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  Schedulers  │  │  WebSocket  │  │   Audit Logger   │  │
│  │  Seat Lock   │  │  STOMP Pub  │  │   Structured     │  │
│  │  Reminders   │  │  SockJS     │  │   Event Logging  │  │
│  └─────────────┘  └─────────────┘  └──────────────────┘  │
└──────────┬────────────────────────────────┬───────────────┘
           │                                │
  ┌────────▼────────┐             ┌─────────▼──────────┐
  │   PostgreSQL    │             │      Redis         │
  │   Primary DB    │             │   Cache Layer      │
  │   13 Tables     │             │   (optional)       │
  └─────────────────┘             └────────────────────┘
```

> For a detailed architectural breakdown, design decisions, and data flow diagrams, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 📁 Project Structure

```
Event-Booking-System/
├── src/main/java/com/kritagya/event_booking_system/
│   ├── auth/                    # Auth controller, service, and DTOs
│   ├── config/                  # Redis, WebSocket, JPA Auditing, OpenAPI, data seeding
│   ├── controller/              # 14 REST controllers
│   ├── dto/                     # 22 request/response DTOs
│   │   └── admin/               # 7 admin analytics DTOs
│   ├── entity/                  # 13 JPA entities with BaseEntity auditing
│   ├── enums/                   # 10 enums (Role, BookingStatus, EventStatus, etc.)
│   ├── exception/               # Global exception handler + 10 custom exceptions
│   ├── logging/                 # AuditLogger for structured event logging
│   ├── mapper/                  # 7 entity ↔ DTO mappers
│   ├── repository/              # 12 Spring Data JPA repositories
│   ├── scheduler/               # SeatLockScheduler, EventReminderScheduler
│   ├── security/                # JWT filter, rate limiter, user details, security config
│   ├── service/                 # 17 service interfaces + implementations
│   ├── specification/           # JPA Specification for dynamic event queries
│   └── websocket/               # SeatUpdatePublisher (STOMP broadcasts)
├── src/main/resources/
│   ├── application.properties          # Base configuration
│   ├── application-dev.properties      # Dev profile (seed data, show SQL)
│   └── application-prod.properties     # Prod profile (validate schema, no seed)
├── src/test/java/                      # 24 test suites
├── frontend/                           # React 19 SPA
│   ├── src/components/                 # 20 React components
│   ├── src/services/                   # API, WebSocket, and currency utilities
│   └── package.json
├── pom.xml
└── docs/                               # Architecture, API, DB, deployment, security docs
```

> For a complete file listing, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Java JDK | 17+ | Required |
| Node.js | 18+ | For the React frontend |
| PostgreSQL | 16+ | Primary database |
| Redis | 7+ | Optional — falls back to in-memory cache automatically |
| Maven | 3.9+ | Maven Wrapper (`mvnw`) is included |

### 1. Clone the Repository

```bash
git clone https://github.com/kritagya025/Event-Booking-System.git
cd Event-Booking-System
```

### 2. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE event_booking_db;
```

> The schema is auto-managed by Hibernate. In `dev` profile, `ddl-auto=update` creates tables on first run. In `prod`, `ddl-auto=validate` expects an existing schema.

### 3. Configure Environment

For development, the defaults in `application-dev.properties` work out of the box with a local PostgreSQL instance. For production, set the required environment variables listed in the [Environment Variables](#-environment-variables) section.

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## ▶️ Running the Application

### Option 1: Run Both Together (Recommended)

```bash
npm install        # Install root-level dependencies (concurrently)
npm run dev        # Starts backend on :8080 and frontend on :5173
```

### Option 2: Run Separately

**Backend** (port 8080):
```bash
./mvnw spring-boot:run
```

**Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

### 🌐 Access Points

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| API Docs (JSON) | http://localhost:8080/api-docs |
| Actuator Health | http://localhost:8080/actuator/health |
| WebSocket (STOMP) | ws://localhost:8080/ws |

## 🧪 Testing

The project includes **24 test suites** covering controllers, services, repositories, and security policies. Tests use H2 in-memory database, MockMvc for controller integration tests, and Mockito for service-layer unit tests.

```bash
# Run all tests
./mvnw test

# Run a specific test class
./mvnw test -Dtest=BookingControllerTest

# Run multiple test classes
./mvnw test -Dtest=BookingControllerTest,PaymentControllerTest,SeatServiceTest

# Compile tests without running (fast verification)
./mvnw test-compile
```

### Test Coverage

| Layer | Test Suites |
|---|---|
| **Controllers** | AdminControllerTest, AuthControllerTest, BookingControllerTest, CalendarControllerTest, EventControllerTest, PaymentControllerTest |
| **Services** | AdminServiceTest, BookingServiceTest, CalendarServiceTest, CouponServiceTest, EventServiceTest, PaymentServiceTest, QrCodeServiceTest, ReviewServiceTest, SeatServiceTest, TicketServiceTest, UserServiceTest, VenueServiceTest, WaitlistServiceTest, WishlistServiceTest |
| **Repositories** | BookingRepositoryTest, EventRepositoryTest |
| **Security** | SecurityFixesTest |
| **Application** | EventBookingSystemApplicationTests |

## 🌱 Default Seed Data

When running with the `dev` profile, `DataInitializerRunner` automatically seeds the database:

### Default Users

| Email | Password | Role |
|---|---|---|
| `admin@eventhub.com` | `Admin@123` | ADMIN |
| `customer@eventhub.com` | `Customer@123` | CUSTOMER |

### Seed Events

| Event | Price | Seats |
|---|---|---|
| Neon Horizon Cyber Music Festival | $85 | 120 |
| Global AI & Autonomous Tech Summit | $299 | 45 |
| Phantom of the Opera — Broadway Revival | $120 | 40 |
| Grand Prix eSports World Championship | $45 | 300 |

### Venues

15 venues across 6 regions: USA (4), India (5), UK/Europe (4), Australia (1), Japan (1). Each event's primary venue is auto-seeded with VIP front-row and Regular seats.

> Seed data is controlled by the `app.seed-data` property (`true` in dev, `false` in prod).

## 📡 API Reference

The system exposes **88 REST endpoints** across 15 controllers. All endpoints require JWT authentication unless noted otherwise.

| Module | Base Path | Endpoints | Auth |
|---|---|---|---|
| **Auth** | `/api/auth` | `POST /register` · `POST /login` · `POST /refresh` · `POST /logout` · `POST /forgot-password` · `POST /reset-password` · `GET /verify-email` | Public |
| **Events** | `/api/events` | `POST /` · `GET /` · `GET /search` · `GET /{id}` · `GET /{id}/analytics` · `GET /popular` · `GET /trending` · `GET /recommendations` · `GET /venue/{venueId}` · `PUT /{id}` · `DELETE /{id}` · `PATCH /{id}/publish` · `PATCH /{id}/unpublish` | Mixed |
| **Bookings** | `/api/bookings` | `POST /` · `GET /` · `GET /{id}` · `GET /user/{userId}` · `PATCH /{id}/cancel` | JWT |
| **Payments** | `/api/payments` | `POST /` · `GET /{id}` · `GET /booking/{bookingId}` · `GET /` · `PATCH /{id}/refund` · `PATCH /booking/{bookingId}/refund` | JWT |
| **Tickets** | `/api/tickets` | `POST /booking/{bookingId}` · `GET /booking/{bookingId}` · `GET /{id}` · `GET /validate/{qrCode}` · `POST /checkin/{qrCode}` · `GET /{id}/qrcode` · `GET /{id}/pdf` · `GET /booking/{bookingId}/pdf` | JWT |
| **Venues** | `/api/venues` | `POST /` · `GET /` · `GET /{id}` · `PUT /{id}` · `DELETE /{id}` | JWT |
| **Seats** | `/api/seats` | `POST /` · `GET /` · `GET /{id}` · `GET /venue/{venueId}` · `GET /venue/{venueId}/available` · `PUT /{id}` · `DELETE /{id}` · `POST /lock` · `POST /unlock` | JWT |
| **Reviews** | `/api` | `POST /events/{eventId}/reviews` · `GET /events/{eventId}/reviews` · `PUT /reviews/{id}` · `DELETE /reviews/{id}` | JWT |
| **Coupons** | `/api/coupons` | `POST /` · `POST /validate` · `GET /` · `PATCH /{id}/toggle-status` · `DELETE /{id}` | JWT |
| **Wishlist** | `/api/wishlist` | `POST /{eventId}` · `DELETE /{eventId}` · `GET /` · `GET /{eventId}/status` | JWT |
| **Waitlist** | `/api/waitlist` | `POST /{eventId}` · `DELETE /{eventId}` · `GET /{eventId}/count` · `GET /{eventId}/status` | JWT |
| **Calendar** | `/api/events` | `GET /{id}/calendar.ics` · `GET /{id}/google-calendar-link` | JWT |
| **Check-In** | `/api/checkin` | `POST /{ticketId}` · `GET /validate/{ticketId}` | ADMIN/ORG |
| **Images** | `/api/images` | `POST /upload` · `GET /{filename}` · `DELETE /{filename}` | JWT |
| **Admin** | `/api/admin` | `GET /dashboard` · `GET /analytics/revenue` · `GET /analytics/bookings` · `GET /statistics/users` · `GET /statistics/events` · `GET /reports` · `GET /system-health` | ADMIN |
| **Users** | `/api/users` | `GET /me` · `PUT /me` · `POST /` · `GET /` · `GET /{id}` · `PUT /{id}` · `PUT /{id}/role` · `DELETE /{id}` | JWT |

> For complete request/response schemas and example payloads, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## ⚙️ Environment Variables

| Variable | Required | Description | Default (Dev) |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Yes | Active profile: `dev` or `prod` | `dev` |
| `DB_URL` | Yes | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/event_booking_db` |
| `DB_USERNAME` | Yes | Database username | `postgres` |
| `DB_PASSWORD` | Yes | Database password | `kritagya` |
| `JWT_SECRET` | Yes | Base64-encoded signing key (min 256 bits) | Dev fallback provided |
| `JWT_EXPIRATION` | No | Access token TTL in ms | `86400000` (24h) |
| `JWT_REFRESH_EXPIRATION` | No | Refresh token TTL in ms | `604800000` (7d) |
| `REDIS_HOST` | No | Redis hostname | `localhost` |
| `REDIS_PORT` | No | Redis port | `6379` |
| `CACHE_TYPE` | No | `redis` or `simple` (in-memory fallback) | `simple` |
| `MAIL_HOST` | No | SMTP server hostname | `smtp.gmail.com` |
| `MAIL_PORT` | No | SMTP server port | `587` |
| `MAIL_USERNAME` | No | SMTP username | `noreply@eventbookingsystem.com` |
| `MAIL_PASSWORD` | No | SMTP password | — |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated allowed origins | `http://localhost:3000,http://localhost:5173` |
| `TRUSTED_PROXIES` | No | Trusted reverse-proxy IPs | `127.0.0.1,0:0:0:0:0:0:0:1` |
| `APP_SEED_DATA` | No | Enable demo data seeding | `true` (dev) / `false` (prod) |

> **Production note**: `JWT_SECRET` has no fallback in the `prod` profile — the application will fail to start without it. See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

## 📚 Project Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, design patterns, and data flow |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete REST API reference with schemas |
| [DATABASE.md](DATABASE.md) | Entity-relationship diagrams and schema details |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [SECURITY.md](SECURITY.md) | Security policies, JWT flow, and threat model |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines and code standards |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Complete project file tree |

## 🗄️ Data Model

The system uses **13 JPA entities** with a shared `BaseEntity` providing audit fields:

```
User ──┬── 1:N ── Event (as organizer)
       ├── 1:N ── Booking ──┬── N:M ── Seat
       │                    ├── 1:1 ── Payment
       │                    └── 1:N ── Ticket
       ├── 1:N ── Review
       ├── 1:N ── Wishlist
       ├── 1:N ── Waitlist
       └── 1:N ── RefreshToken

Venue ──┬── 1:N ── Event
        └── 1:N ── Seat

Coupon (standalone)
```

> For full schema details and column definitions, see [DATABASE.md](DATABASE.md).

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) guide for code standards, branch naming conventions, and PR requirements before submitting a pull request.

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/kritagya025">Kritagya</a>
</p>
