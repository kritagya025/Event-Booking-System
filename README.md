# Event Booking System

[![Backend CI](https://github.com/kritagya025/Event-Booking-System/actions/workflows/backend.yml/badge.svg)](https://github.com/kritagya025/Event-Booking-System/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/kritagya025/Event-Booking-System/actions/workflows/frontend.yml/badge.svg)](https://github.com/kritagya025/Event-Booking-System/actions/workflows/frontend.yml)

A distributed event management and ticket reservation platform built with Spring Boot 3, React 19, and PostgreSQL. The system supports seat selection and locking, QR-coded ticket generation, real-time seat availability over WebSocket (STOMP), payment processing, and administrative analytics.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Initialization](#database-initialization)
  - [Configuration](#configuration)
  - [Installation and Execution](#installation-and-execution)
- [Testing](#testing)
- [Seed Data](#seed-data)
- [API Overview](#api-overview)
- [Documentation Index](#documentation-index)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Event Booking System provides end-to-end event management, ticket booking, and attendee admission workflows:

- **Organizers and Administrators** can create venues, configure seat arrangements, publish events, monitor sales analytics, and validate attendee tickets at check-in.
- **Customers** can browse and filter events, view interactive seat maps, reserve seats with temporary locks, complete payments, and download QR-coded PDF tickets.

The backend is built as a modular Spring Boot 3 monolith adhering to domain-driven layer boundaries. Concurrency controls (optimistic locking via `@Version`), distributed cache fallback (Redis with in-memory fallback), rate limiting via Bucket4j, and structured audit logging ensure safe operation under concurrent load.

---

## System Architecture

The platform uses a decoupled client-server architecture:

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

## Core Features

### Authentication and Access Control
- Stateless JWT authentication using HMAC-SHA256 tokens transported via HttpOnly cookies and authorization headers.
- Automatic refresh token rotation: old tokens are revoked upon token refresh, password resets, or logout.
- Role-based authorization: `ADMIN`, `ORGANIZER`, and `CUSTOMER`.
- BCrypt password hashing with startup migration runner for legacy credentials.
- Configurable email verification and password reset workflows.

### Event Lifecycle and Discovery
- Status state machine: `DRAFT` -> `PUBLISHED` -> `COMPLETED` / `CANCELLED`.
- Dynamic query filtering via JPA Specifications (category, date range, venue, city, price range, and keyword tokenization).
- Trending, popular, and recommendation discovery feeds.
- Soft deletion preserving auditability for historical bookings.
- Multipart banner image upload with validation and local UUID storage.

### Seat Management and Concurrency Control
- Venue-based seat configuration across `VIP`, `PREMIUM`, and `REGULAR` tiers.
- Temporary seat locking with configurable lock duration (default: 10 minutes).
- Automated background expiration scheduler releasing expired seat locks every 60 seconds.
- Real-time seat status broadcasts over WebSocket (`/topic/events/{id}/seats`) using STOMP.
- Optimistic concurrency control (`@Version`) on Booking, Event, and Seat entities to prevent race conditions during high-demand sales.

### Booking, Invoicing, and Ticketing
- Atomic seat reservation workflow.
- PDF e-ticket generation and booking summaries with embedded QR codes (Google ZXing, iText 8).
- High-throughput check-in validation via QR code scanning or ticket ID lookup.
- Booking cancellation with automated seat restoration.

### Payments and Financials
- Integrated payment processing supporting `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, and `NET_BANKING`.
- Full and partial refund management with booking status synchronization.
- Coupon engine supporting `PERCENTAGE`, `FIXED`, and `EARLY_BIRD` discounts with minimum spend and redemption thresholds.

### Administrative Analytics
- Operational dashboard displaying revenue, ticket volume, active users, and event metrics.
- Exportable reports and booking trend analysis.
- Live system diagnostics endpoint exposing JVM memory, active threads, and system uptime.

---

## Technology Stack

### Backend
- **Runtime**: Java 17
- **Framework**: Spring Boot 3.4.1
- **Security**: Spring Security 6, JJWT 0.12.6
- **Persistence**: Spring Data JPA, Hibernate 6, PostgreSQL JDBC Driver
- **Caching**: Spring Cache, Redis 7 (via Spring Data Redis), with in-memory fallback
- **Real-Time**: Spring WebSocket, STOMP, SockJS
- **Rate Limiting**: Bucket4j 8.10.1
- **Document Generation**: iText Core 8.0.5, Google ZXing 3.5.3
- **API Documentation**: SpringDoc OpenAPI 2.7.0 (OpenAPI 3.0)
- **Build Tool**: Maven 3.9+ (wrapper included)

### Frontend
- **Framework**: React 19.2.8
- **Build Tool**: Vite 8.2.0
- **Networking**: Axios, STOMP.js 7.3.0, SockJS Client 1.6.1
- **Icons**: Lucide React
- **Linter**: OxLint 1.75.0

---

## Repository Structure

```
.
|-- src/main/java/com/kritagya/event_booking_system/
|   |-- auth/               # Authentication controllers, services, and token DTOs
|   |-- config/             # Spring configuration (Security, Redis, WebSocket, OpenAPI)
|   |-- controller/         # REST API endpoints (15 controllers)
|   |-- dto/                # Request and response transfer models
|   |   `-- admin/          # Reporting, analytics, and diagnostics DTOs
|   |-- entity/             # JPA entity definitions extending BaseEntity
|   |-- enums/              # Domain enumerations (Role, Statuses, Types)
|   |-- exception/          # Global exception advice and domain exceptions
|   |-- logging/            # Structured audit logging
|   |-- mapper/             # Entity-DTO mapping components
|   |-- repository/         # Spring Data JPA repositories
|   |-- scheduler/          # Background tasks for seat expiration and event reminders
|   |-- security/           # Token filters, rate limiting, and user principals
|   |-- service/            # Core business domain services
|   |-- specification/      # Dynamic JPA Criteria queries for event search
|   `-- websocket/          # WebSocket publishers for real-time seat status
|-- src/main/resources/
|   |-- application.properties          # Base settings
|   |-- application-dev.properties      # Development overrides (seed data, DDL update)
|   `-- application-prod.properties     # Production profile (DDL validate)
|-- src/test/java/                      # 24 automated unit and integration test suites
|-- frontend/                           # React 19 single-page application
`-- pom.xml                             # Maven build configuration
```

---

## Getting Started

### Prerequisites
- Java Development Kit (JDK) 17 or higher
- Node.js 18.x or higher and npm
- PostgreSQL 16 or higher
- Redis 7.x (optional; defaults to in-memory cache if absent)

### Database Initialization
Connect to your local PostgreSQL instance and provision the application database:

```sql
CREATE DATABASE event_booking_db;
```

### Configuration
The application reads settings from environment variables or Spring property profiles. Default development values are defined in `src/main/resources/application-dev.properties`.

| Variable | Required in Production | Default (Development) | Purpose |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Yes | `dev` | Active environment profile (`dev` or `prod`) |
| `DB_URL` | Yes | `jdbc:postgresql://localhost:5432/event_booking_db` | JDBC connection string |
| `DB_USERNAME` | Yes | `postgres` | Database username |
| `DB_PASSWORD` | Yes | `kritagya` | Database password |
| `JWT_SECRET` | Yes | Configured in dev properties | Base64-encoded secret key (256-bit minimum) |
| `JWT_EXPIRATION` | No | `86400000` (24 hours) | Access token validity in milliseconds |
| `JWT_REFRESH_EXPIRATION` | No | `604800000` (7 days) | Refresh token validity in milliseconds |
| `CACHE_TYPE` | No | `simple` | Caching provider (`simple` or `redis`) |
| `REDIS_HOST` | No | `localhost` | Redis server hostname |
| `REDIS_PORT` | No | `6379` | Redis server port |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000,http://localhost:5173` | Allowed cross-origin domains |
| `APP_SEED_DATA` | No | `true` (dev) / `false` (prod) | Whether to populate demo records on start |

### Installation and Execution

#### Combined Execution (Development)
The root `package.json` provides scripts to launch both backend and frontend concurrently:

```bash
npm install
npm run dev
```

#### Individual Service Execution

**Backend**:
```bash
./mvnw spring-boot:run
```
The server will start on port `8080`.

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
The client will be available at `http://localhost:5173`.

#### Service Access Points

| Service | Address |
|---|---|
| Web Application | `http://localhost:5173` |
| REST API Base | `http://localhost:8080/api` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI Specification | `http://localhost:8080/api-docs` |
| Actuator Health Check | `http://localhost:8080/actuator/health` |
| STOMP WebSocket | `ws://localhost:8080/ws` |

---

## Testing

The backend includes 24 automated test suites covering controllers, business logic, persistence layers, and security configurations. Tests execute against an embedded H2 database.

```bash
# Execute entire test suite
./mvnw test

# Run a specific test suite
./mvnw test -Dtest=BookingControllerTest

# Run all controller tests
./mvnw test -Dtest=*ControllerTest

# Verify compilation without executing test runtime
./mvnw test-compile
```

### Test Suite Structure

| Component Layer | Suites |
|---|---|
| Controllers | `AdminControllerTest`, `AuthControllerTest`, `BookingControllerTest`, `CalendarControllerTest`, `EventControllerTest`, `PaymentControllerTest` |
| Services | `AdminServiceTest`, `BookingServiceTest`, `CalendarServiceTest`, `CouponServiceTest`, `EventServiceTest`, `PaymentServiceTest`, `QrCodeServiceTest`, `ReviewServiceTest`, `SeatServiceTest`, `TicketServiceTest`, `UserServiceTest`, `VenueServiceTest`, `WaitlistServiceTest`, `WishlistServiceTest` |
| Persistence | `BookingRepositoryTest`, `EventRepositoryTest` |
| Security | `SecurityFixesTest` |
| Context | `EventBookingSystemApplicationTests` |

---

## Seed Data

When started with the `dev` profile and `APP_SEED_DATA=true`, the `DataInitializerRunner` populates test records:

### Default Accounts

| Email | Password | Role |
|---|---|---|
| `admin@eventhub.com` | `Admin@123` | `ADMIN` |
| `customer@eventhub.com` | `Customer@123` | `CUSTOMER` |

### Sample Records
- **Venues**: 15 locations across North America, Europe, Asia, and Australia.
- **Events**: 4 featured events with configured ticket pricing, categories, and seating layouts.
- **Seats**: Automatically generated seat maps with VIP and regular tiers for each active venue.

---

## API Overview

The platform exposes 88 REST endpoints. Full request/response schemas and authentication requirements are detailed in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

| Namespace | Base Path | Endpoints | Access Policy |
|---|---|---|---|
| Authentication | `/api/auth` | Register, login, token refresh, logout, password recovery | Public |
| Events | `/api/events` | Event CRUD, search, recommendations, analytics, publishing | Public / Organizer / Admin |
| Bookings | `/api/bookings` | Create reservation, view user bookings, cancel reservation | Authenticated |
| Payments | `/api/payments` | Process payment, inspect transactions, issue refunds | Authenticated / Admin |
| Tickets | `/api/tickets` | Generate tickets, QR download, PDF download, check-in | Authenticated / Staff |
| Venues | `/api/venues` | Venue CRUD and capacity management | Public / Admin |
| Seats | `/api/seats` | Seat availability, layouts, manual lock/unlock | Public / Authenticated |
| Check-In | `/api/checkin` | Ticket check-in and QR validation | Organizer / Admin |
| Coupons | `/api/coupons` | Validation and discount management | Public / Admin |
| Reviews | `/api` | Submit, edit, delete, and list event reviews | Authenticated |
| Wishlist | `/api/wishlist` | Saved event management | Authenticated |
| Waitlist | `/api/waitlist` | Waitlist enrollment and status checks | Authenticated |
| Calendar | `/api/events` | ICS file export, Google Calendar integration | Public |
| Images | `/api/images` | Banner upload, retrieval, and deletion | Authenticated |
| Admin | `/api/admin` | Operational metrics, revenue analytics, system diagnostics | Admin |
| Users | `/api/users` | Profile management and role assignment | Authenticated / Admin |

---

## Documentation Index

- [Architecture Reference](ARCHITECTURE.md): System design, component interactions, caching, and concurrency control.
- [API Reference](API_DOCUMENTATION.md): Complete catalog of REST endpoints, request payloads, and status codes.
- [Database Schema](DATABASE.md): Entity-relationship definitions, indexes, constraints, and audit structure.
- [Deployment Guide](DEPLOYMENT.md): Production setup using Docker, Nginx reverse proxying, and systemd.
- [Security Policy](SECURITY.md): Threat mitigation, token security, rate limiting, and vulnerability reporting.
- [Project Structure](PROJECT_STRUCTURE.md): Detailed inventory of files and architectural packages.
- [Contribution Guidelines](CONTRIBUTING.md): Git branch strategies, coding style, and pull request procedures.
- [Changelog](CHANGELOG.md): Historical record of versions and breaking changes.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for code style guidelines, testing requirements, and branch workflows prior to opening a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for terms.
