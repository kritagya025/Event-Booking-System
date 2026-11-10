# Event Booking System — Project Map

> A lightweight architecture reference. Consult this for quick orientation.
> Do **not** read the entire codebase to answer questions that this file covers.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Java | 17 |
| Framework | Spring Boot | 3.4.1 |
| Build | Maven (`pom.xml`) | Wrapper (`mvnw`) |
| Database (prod) | PostgreSQL | — |
| Database (test) | H2 (in-memory) | — |
| ORM | Spring Data JPA / Hibernate | — |
| Auth | Spring Security + JWT (jjwt 0.12.6) | — |
| API Docs | SpringDoc OpenAPI 2.7.0 | `/swagger-ui.html` |
| Caching | Spring Cache + Redis | — |
| Real-time | WebSocket (STOMP) | — |
| Email | Spring Mail + Spring Retry | — |
| Rate Limiting | Bucket4j 8.10.1 | — |
| PDF Generation | iText 8.0.5 | — |
| QR Codes | ZXing 3.5.3 | — |
| Monitoring | Spring Boot Actuator | — |
| Utility | Lombok | — |
| Frontend | Located in `frontend/` | — |

## Main Package

`com.kritagya.event_booking_system`

## Package Structure

```
src/main/java/com/kritagya/event_booking_system/
├── auth/                # Authentication controllers/DTOs
├── config/              # App configuration (JPA auditing, OpenAPI, Redis, WebSocket, data init)
├── controller/          # REST controllers (15 controllers)
├── dto/                 # Request/Response DTOs
│   └── admin/           # Admin-specific DTOs
├── entity/              # JPA entities (BaseEntity + 12 domain entities)
├── enums/               # Status & type enums (BookingStatus, PaymentStatus, Role, etc.)
├── exception/           # Custom exceptions & global handler
├── logging/             # Request/response logging
├── mapper/              # Entity ↔ DTO mappers
├── repository/          # Spring Data JPA repositories (12 repositories)
├── scheduler/           # Scheduled tasks
├── security/            # JWT filter, Security config, Rate limiting
├── service/             # Service interfaces (15 services)
│   └── impl/            # Service implementations
├── specification/       # JPA Specification classes for dynamic queries
└── websocket/           # WebSocket configuration/handlers
```

## Domain Entities

`User`, `Event`, `Venue`, `Booking`, `Payment`, `Ticket`, `Seat`, `Review`, `Coupon`, `Waitlist`, `Wishlist`, `RefreshToken`

## Controllers

`AdminController`, `BookingController`, `CalendarController`, `CheckInController`, `CouponController`, `EventController`, `ImageController`, `PaymentController`, `ReviewController`, `SeatController`, `TicketController`, `UserController`, `VenueController`, `WaitlistController`, `WishlistController`

## Authentication Architecture

- JWT-based authentication with access + refresh tokens.
- `JwtUtil` for token generation/validation.
- `JwtAuthenticationFilter` for request filtering.
- `CustomUserDetailsService` loads user by email.
- `SecurityConfig` defines endpoint access rules.
- Role-based authorization via `Role` enum.

## Configuration Profiles

- `application.properties` — shared/default configuration.
- `application-dev.properties` — development environment.
- `application-prod.properties` — production environment.

## Testing

- Test root: `src/test/java/com/kritagya/event_booking_system/`
- Controller tests, service tests, repository tests, security tests.
- **Run specific test**: `./mvnw test -Dtest=ClassName`
- **Run all tests**: `./mvnw test`
- **Run tests in a package**: `./mvnw test -Dtest="com.kritagya.event_booking_system.service.*"`

## API Documentation

- Swagger UI: `/swagger-ui.html`
- OpenAPI spec configured in `OpenApiConfig.java`

## Key Architectural Decisions

- Layered architecture: Controller → Service Interface → ServiceImpl → Repository.
- Separate Request/Response DTOs (never expose entities directly).
- Mapper layer for entity ↔ DTO conversion.
- Centralized exception handling.
- Specification pattern for dynamic filtering.
- Rate limiting via Bucket4j filter.
- Request logging filter.

---

> **Maintenance**: Update this file only when significant structural changes occur (new modules, technology changes, architecture decisions). Do not update for routine feature additions.

