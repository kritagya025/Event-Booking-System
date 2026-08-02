# Event Booking System — Architecture & Technical Workflow Documentation

## Executive Overview
The **Event Booking System** is an enterprise-grade backend application built with **Spring Boot 3/4** and **Java 17**, designed to handle venue management, event scheduling, seat allocations, real-time ticket reservations, payment processing, and digital QR ticket issuance. 

The architecture adheres to clean layered principles, strict separation of concerns via DTOs and Mappers, stateless **JWT-based Security** with Role-Based Access Control (RBAC), robust Exception Handling, and a PostgreSQL database layer managed through Spring Data JPA.

---

## 1. System Architecture

### 1.1 Architectural Style & High-Level Components
The system follows a classic multi-tiered layered architecture with clear boundaries:

```mermaid
graph TD
    Client[Client App / Postman / Web UI] -->|HTTP REST Requests + Bearer JWT| SecurityFilter[JwtAuthenticationFilter]
    SecurityFilter -->|Validates Token & Loads UserDetails| SecContext[SecurityContextHolder]
    SecurityFilter -->|Routes to Controller| ControllerLayer[REST Controllers]
    
    subgraph Spring Boot Application Layer
        ControllerLayer -->|Validates DTO via @Valid| ServiceLayer[Service Layer]
        ServiceLayer -->|DTO <-> Entity Mapping| Mappers[Mapper Components]
        ServiceLayer -->|Encodes Password / Secures Operations| PasswordEncoder[BCryptPasswordEncoder]
        ServiceLayer -->|Executes Business Logic & Transactions| Repositories[Spring Data JPA Repositories]
    end
    
    subgraph Data Layer
        Repositories -->|SQL Queries / Hibernate ORM| Database[(PostgreSQL Database)]
    end
    
    subgraph Exception Handling
        ControllerLayer -.->|Throws Exceptions| GlobalAdvice[GlobalExceptionHandler]
        ServiceLayer -.->|Throws Domain Exceptions| GlobalAdvice
        GlobalAdvice -->|Returns Standard ErrorResponse| Client
    end
```

### 1.2 Technology Stack
| Layer / Domain | Technology Choice | Description / Purpose |
| :--- | :--- | :--- |
| **Language & Runtime** | Java 17 | JDK 17 LTS syntax, records, enhanced type safety, performance |
| **Core Framework** | Spring Boot 4.1.0 (Spring Framework 6.x) | Application bootstrap, Dependency Injection, Beans management |
| **Security Framework** | Spring Security 6.x + JJWT 0.12.6 | Stateless JWT-based authentication & RBAC authorization |
| **Persistence / ORM** | Spring Data JPA / Hibernate 6.x | Entity mapping, JPA Repositories, Automatic DDL schema generation |
| **Database** | PostgreSQL | Relational storage for transactional booking integrity |
| **Validation** | Jakarta Validation (`jakarta.validation-api`) | Declarative input validation on request DTOs (`@NotNull`, `@Email`) |
| **Utility & Boilerplate** | Project Lombok | Auto-generates getters, setters, constructors |

---

## 2. Database & Domain Data Model

### 2.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    app_user ||--o{ booking : "places"
    venue ||--o{ event : "hosts"
    venue ||--o{ seat : "contains"
    event ||--o{ booking : "reserved in"
    booking ||--o| payment : "paid via"
    booking ||--o{ ticket : "generates"

    app_user {
        bigint id PK
        string first_name
        string last_name
        string email UK
        string password
        string phone
        string role
    }

    venue {
        bigint id PK
        string name
        string address
        integer capacity
        string description
    }

    event {
        bigint id PK
        string name
        string description
        date event_date
        time start_time
        time end_time
        string category
        string status
        numeric ticket_price
        integer available_seats
        bigint venue_id FK
    }

    seat {
        bigint id PK
        string seat_number
        string row_number
        string seat_type
        string status
        bigint venue_id FK
    }

    booking {
        bigint id PK
        timestamp booking_date
        string booking_status
        integer quantity
        numeric total_amount
        bigint user_id FK
        bigint event_id FK
    }

    payment {
        bigint id PK
        numeric amount
        string payment_method
        string payment_status
        string transaction_id
        bigint booking_id FK, UK
    }

    ticket {
        bigint id PK
        string qr_code
        timestamp issue_date
        string ticket_status
        bigint booking_id FK
    }
```

### 2.2 Data Dictionary & Domain Entities

1. **`User` (`app_user` table)**:
   - Primary user identity storing credentials and authorization role (`ADMIN`, `ORGANIZER`, `CUSTOMER`).
   - Unique index enforced on `email`.

2. **`Venue` (`venue` table)**:
   - Represents physical or virtual locations hosting events.
   - Holds capacity constraints and maintains bidirectional `@OneToMany` relationships with `Event` and `Seat`.

3. **`Event` (`event` table)**:
   - Specific show or gathering scheduled at a venue.
   - Tracks `ticketPrice`, `availableSeats`, `eventDate`, and time windows.
   - Linked to `Venue` via `@ManyToOne` relationship.

4. **`Seat` (`seat` table)**:
   - Individual seat definitions for a venue.
   - Uses `SeatType` (`VIP`, `REGULAR`, `PREMIUM`) and `SeatStatus` (`AVAILABLE`, `BOOKED`, `RESERVED`).

5. **`Booking` (`booking` table)**:
   - Central transaction entity linking a `User` to an `Event`.
   - Tracks reserved seat `quantity`, `totalAmount`, and `bookingStatus` (`CONFIRMED`, `PENDING`, `CANCELLED`).

6. **`Payment` (`payment` table)**:
   - Financial record tied to a `Booking` via `@OneToOne`.
   - Stores `amount`, `paymentMethod` (`CREDIT_CARD`, `DEBIT_CARD`, `PAYPAL`, `UPI`), `paymentStatus` (`COMPLETED`, `PENDING`, `FAILED`, `REFUNDED`), and a unique `transactionId` UUID.

7. **`Ticket` (`ticket` table)**:
   - Digital tickets generated upon confirmed booking/payment.
   - Linked via `@ManyToOne` to `Booking`.
   - Contains a unique `qrCode` UUID for check-in verification.

---

## 3. End-to-End Core Workflows

### 3.1 Authentication & Registration Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant UserRepo as UserRepository
    participant Encoder as BCryptPasswordEncoder
    participant JwtUtil as JwtUtil
    participant DB as PostgreSQL Database

    rect rgb(240, 248, 255)
        note over Client, DB: Registration Flow (/api/auth/register)
        Client->>AuthCtrl: POST /api/auth/register (RegisterRequestDTO)
        AuthCtrl->>AuthSvc: register(request)
        AuthSvc->>UserRepo: existsByEmail(email)
        alt Email Exists
            UserRepo-->>AuthSvc: true
            AuthSvc-->>AuthCtrl: throw DuplicateEmailException
            AuthCtrl-->>Client: 409 CONFLICT (ErrorResponse)
        else Email Available
            UserRepo-->>AuthSvc: false
            AuthSvc->>Encoder: encode(rawPassword)
            Encoder-->>AuthSvc: hashedBCryptPassword
            AuthSvc->>UserRepo: save(User entity with Role.CUSTOMER)
            UserRepo->>DB: INSERT INTO app_user
            DB-->>UserRepo: Saved User
            AuthSvc->>JwtUtil: generateToken(CustomUserDetails)
            JwtUtil-->>AuthSvc: Signed JWT Token String
            AuthSvc-->>AuthCtrl: AuthResponseDTO(token, email, role)
            AuthCtrl-->>Client: 200 OK + JWT Response
        end
    end

    rect rgb(255, 250, 240)
        note over Client, DB: Login Flow (/api/auth/login)
        Client->>AuthCtrl: POST /api/auth/login (LoginRequestDTO)
        AuthCtrl->>AuthSvc: login(request)
        AuthSvc->>AuthSvc: authenticationManager.authenticate(...)
        AuthSvc->>JwtUtil: generateToken(userDetails)
        JwtUtil-->>AuthSvc: JWT Token String
        AuthSvc-->>AuthCtrl: AuthResponseDTO(token, email, role)
        AuthCtrl-->>Client: 200 OK + JWT Token Response
    end
```

### 3.2 Booking Creation & Seat Inventory Management Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant BookingCtrl as BookingController
    participant BookingSvc as BookingService
    participant UserRepo as UserRepository
    participant EventRepo as EventRepository
    participant BookingRepo as BookingRepository
    participant DB as PostgreSQL Database

    Customer->>BookingCtrl: POST /api/bookings (BookingRequestDTO: userId, eventId, quantity)
    note over BookingCtrl: Security check: User has ROLE_CUSTOMER or ROLE_ADMIN
    BookingCtrl->>BookingSvc: createBooking(request)
    
    BookingSvc->>UserRepo: findById(userId)
    alt User Not Found
        UserRepo-->>BookingSvc: Optional.empty()
        BookingSvc-->>BookingCtrl: throw UserNotFoundException
        BookingCtrl-->>Customer: 404 NOT FOUND
    end

    BookingSvc->>EventRepo: findById(eventId)
    alt Event Not Found
        EventRepo-->>BookingSvc: Optional.empty()
        BookingSvc-->>BookingCtrl: throw EventNotFoundException
        BookingCtrl-->>Customer: 404 NOT FOUND
    end

    alt Requested Quantity > Available Seats
        BookingSvc-->>BookingCtrl: throw IllegalArgumentException("Not enough seats available")
        BookingCtrl-->>Customer: 400 BAD REQUEST
    else Enough Seats Available
        BookingSvc->>BookingSvc: Calculate totalAmount = event.ticketPrice * quantity
        BookingSvc->>BookingSvc: Create new Booking (BookingStatus.CONFIRMED)
        BookingSvc->>EventRepo: event.setAvailableSeats(current - quantity) -> save(event)
        EventRepo->>DB: UPDATE event SET available_seats = ... WHERE id = ...
        BookingSvc->>BookingRepo: save(booking)
        BookingRepo->>DB: INSERT INTO booking ...
        BookingRepo-->>BookingSvc: Saved Booking entity
        BookingSvc-->>BookingCtrl: BookingResponseDTO
        BookingCtrl-->>Customer: 201 CREATED (Booking Details)
    end
```

### 3.3 Booking Cancellation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant BookingCtrl as BookingController
    participant BookingSvc as BookingService
    participant BookingRepo as BookingRepository
    participant EventRepo as EventRepository
    participant DB as PostgreSQL Database

    Customer->>BookingCtrl: PATCH /api/bookings/{id}/cancel
    BookingCtrl->>BookingSvc: cancelBooking(id)
    BookingSvc->>BookingRepo: findById(id)
    alt Booking Not Found
        BookingRepo-->>BookingSvc: Optional.empty()
        BookingSvc-->>BookingCtrl: throw BookingNotFoundException
        BookingCtrl-->>Customer: 404 NOT FOUND
    end

    alt Booking Already Cancelled
        BookingSvc-->>BookingCtrl: throw IllegalArgumentException("Booking is already cancelled")
        BookingCtrl-->>Customer: 400 BAD REQUEST
    else Active Booking
        BookingSvc->>BookingSvc: booking.setBookingStatus(CANCELLED)
        BookingSvc->>EventRepo: event.setAvailableSeats(current + booking.quantity) -> save(event)
        EventRepo->>DB: UPDATE event SET available_seats = ...
        BookingSvc->>BookingRepo: save(booking)
        BookingRepo->>DB: UPDATE booking SET status = 'CANCELLED' ...
        BookingSvc-->>BookingCtrl: BookingResponseDTO
        BookingCtrl-->>Customer: 200 OK (Cancelled Booking Response)
    end
```

### 3.4 Payment Processing & Digital Ticket Issuance Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant PayCtrl as PaymentController
    participant PaySvc as PaymentService
    participant TicketCtrl as TicketController
    participant TicketSvc as TicketService
    participant BookingRepo as BookingRepository
    participant PayRepo as PaymentRepository
    participant TicketRepo as TicketRepository

    rect rgb(240, 255, 240)
        note over Customer, TicketRepo: 1. Payment Processing
        Customer->>PayCtrl: POST /api/payments (PaymentRequestDTO: bookingId, paymentMethod)
        PayCtrl->>PaySvc: createPayment(request)
        PaySvc->>BookingRepo: findById(bookingId)
        PaySvc->>PaySvc: Generate UUID transactionId, set PaymentStatus.COMPLETED
        PaySvc->>PayRepo: save(Payment entity)
        PayRepo-->>PaySvc: Saved Payment
        PaySvc-->>PayCtrl: PaymentResponseDTO
        PayCtrl-->>Customer: 201 CREATED (Payment Details & Transaction ID)
    end

    rect rgb(255, 240, 255)
        note over Customer, TicketRepo: 2. Digital Ticket Generation
        Customer->>TicketCtrl: POST /api/tickets/generate/{bookingId}
        TicketCtrl->>TicketSvc: generateTickets(bookingId)
        TicketSvc->>BookingRepo: findById(bookingId)
        loop For i = 0 to booking.quantity - 1
            TicketSvc->>TicketSvc: Instantiate Ticket with UUID qrCode & TicketStatus.ACTIVE
        end
        TicketSvc->>TicketRepo: saveAll(tickets)
        TicketRepo-->>TicketSvc: Saved Ticket List
        TicketSvc-->>TicketCtrl: List<TicketResponseDTO>
        TicketCtrl-->>Customer: 200 OK (List of Generated Tickets with QR Codes)
    end
```

---

## 4. Security Architecture & Authorization Matrix

### 4.1 Request Interception Lifecycle
Every incoming HTTP request traverses the Spring Security Filter Chain:

1. **`JwtAuthenticationFilter`**: Intercepts requests, checks for `Authorization: Bearer <token>`.
2. **`JwtUtil`**: Decodes base64 secret, validates HMAC-SHA signature, verifies token expiration date, and extracts user email subject.
3. **`CustomUserDetailsService`**: Loads user details from `UserRepository` by email.
4. **`SecurityContextHolder`**: Populates authenticated `UsernamePasswordAuthenticationToken` containing granted authorities (`ROLE_ADMIN`, `ROLE_ORGANIZER`, `ROLE_CUSTOMER`).

### 4.2 API Endpoint Security Matrix
| HTTP Method | Endpoint Pattern | Allowed Roles / Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `PermitAll` (Public) | Customer self-registration |
| `POST` | `/api/auth/login` | `PermitAll` (Public) | Authenticate user & receive JWT |
| `GET` | `/api/events`, `/api/events/*` | `PermitAll` (Public) | Browse public event catalog |
| `GET` | `/api/venues`, `/api/venues/*` | `PermitAll` (Public) | View venue details & capacity |
| `POST`, `PUT`, `DELETE` | `/api/events/**` | `ADMIN`, `ORGANIZER` | Create, modify, cancel events |
| `POST`, `PUT`, `DELETE` | `/api/venues/**` | `ADMIN`, `ORGANIZER` | Manage venue structures |
| `POST`, `PUT`, `DELETE` | `/api/seats/**` | `ADMIN`, `ORGANIZER` | Configure venue seat maps |
| `POST` | `/api/bookings` | `ADMIN`, `CUSTOMER` | Reserve event seats |
| `PATCH` | `/api/bookings/{id}/cancel` | `ADMIN`, `CUSTOMER` | Cancel an active booking |
| `POST` | `/api/payments` | `ADMIN`, `CUSTOMER` | Make payment for booking |
| `POST` | `/api/tickets/generate/*` | `ADMIN`, `CUSTOMER` | Issue QR digital tickets |
| `ALL` | `/api/users/**` | `ADMIN` | User account administration |

---

## 5. Global Error Handling & Exception Flow

```mermaid
graph TD
    AppErr[Exception Raised in Application] --> ExceptionType{Exception Type?}

    ExceptionType -->|ResourceNotFound / UserNotFound / EventNotFound| 404Response[404 NOT FOUND]
    ExceptionType -->|DuplicateEmailException / DuplicateResource| 409Response[409 CONFLICT]
    ExceptionType -->|MethodArgumentNotValidException| 400Validation[400 BAD REQUEST - Validation Map]
    ExceptionType -->|IllegalArgumentException| 400BadReq[400 BAD REQUEST - Message]
    ExceptionType -->|BadCredentialsException| 401Unauth[401 UNAUTHORIZED]
    ExceptionType -->|AccessDeniedException| 403Forbidden[403 FORBIDDEN]
    ExceptionType -->|Unhandled / Generic Exception| 500ServerErr[500 INTERNAL SERVER ERROR]

    404Response --> StandardJSON[ErrorResponse DTO]
    409Response --> StandardJSON
    400Validation --> StandardJSON
    400BadReq --> StandardJSON
    401Unauth --> StandardJSON
    403Forbidden --> StandardJSON
    500ServerErr --> StandardJSON

    StandardJSON --> SendToClient[Return JSON Payload with Timestamp]
```

### Standardized Error Payload Structure (`ErrorResponse.java`):
```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-07-23T18:30:00",
  "details": {
    "email": "Email must be valid",
    "quantity": "Quantity must be at least 1"
  }
}
```

---

## 6. Password Migration Mechanism

The application includes an automated data migration component (`PasswordMigrationRunner`) that implements `CommandLineRunner`:

- **Startup Execution**: Runs automatically on Spring Boot application startup.
- **Plain-text Detection**: Queries all users from `UserRepository` and checks if the stored password begins with `$2a$` or `$2b$` (BCrypt signature prefixes).
- **In-place Re-hashing**: Any plain-text legacy passwords are passed through `BCryptPasswordEncoder` and updated back into PostgreSQL.
- **Idempotency**: Already-hashed passwords are skipped cleanly, preventing double-hashing issues.

---

## 7. Operational & Deployment Architecture

### 7.1 Configuration Properties (`application.properties`)
- **Database Driver**: PostgreSQL (`org.postgresql.Driver`)
- **Database URL**: `jdbc:postgresql://localhost:5432/event_booking_db`
- **JPA / Hibernate DDL**: `update` (auto-creates/modifies relational schemas)
- **JWT Config**: HMAC-SHA secret key with 24-hour token expiration (`86400000 ms`).

### 7.2 Maven Build Strategy (`pom.xml`)
- Built with **Maven**, packaging to executable JAR.
- Includes annotation processor configurations for **Lombok** code generation.
