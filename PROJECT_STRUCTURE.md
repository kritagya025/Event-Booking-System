# Project Structure and Directory Layout

Complete inventory of the directory hierarchy, source modules, and configuration components of the Event Booking System.

---

## Directory Tree

```
event-booking-system/
|-- .github/workflows/
|   |-- backend.yml                    # Independent Backend CI workflow (Temurin JDK 17, Maven test & package)
|   `-- frontend.yml                   # Independent Frontend CI workflow (Node 20, Oxlint, Vite build)
|
|-- README.md                          # Project overview, architecture, and rapid setup guide
|-- ARCHITECTURE.md                    # System architecture and data flow documentation
|-- API_DOCUMENTATION.md              # Complete REST API reference specification
|-- DATABASE.md                        # Database schema, table definitions, and indexes
|-- DEPLOYMENT.md                      # Production deployment and configuration guide
|-- CONTRIBUTING.md                    # Engineering standards and git workflow
|-- SECURITY.md                        # Security policies and threat model
|-- CHANGELOG.md                       # Version release history
|-- PROJECT_STRUCTURE.md              # File and directory inventory
|-- embarko.json                       # Staging deployment configuration
|
|-- pom.xml                            # Maven build descriptor
|-- mvnw / mvnw.cmd                   # Maven Wrapper scripts (Linux / Windows)
|-- package.json                       # Root script orchestrator (concurrent dev execution)
|-- .gitignore                         # Version control ignore definitions
|
|-- .mvn/                              # Maven Wrapper binary configuration
|
|-- src/
|   |-- main/
|   |   |-- java/com/kritagya/event_booking_system/
|   |   |   |
|   |   |   |-- EventBookingSystemApplication.java    # Spring Boot application entry point
|   |   |   |
|   |   |   |-- auth/                                 # Authentication Subsystem
|   |   |   |   |-- AuthController.java               # Auth endpoints (/api/auth/**)
|   |   |   |   |-- AuthService.java                  # Credential verification & token lifecycle
|   |   |   |   |-- AuthResponseDTO.java              # Token delivery payload
|   |   |   |   |-- LoginRequestDTO.java              # User login payload
|   |   |   |   |-- RegisterRequestDTO.java           # Registration payload
|   |   |   |   |-- RefreshTokenRequestDTO.java       # Token rotation payload
|   |   |   |   |-- ForgotPasswordRequestDTO.java     # Reset request payload
|   |   |   |   `-- ResetPasswordRequestDTO.java      # Reset confirmation payload
|   |   |   |
|   |   |   |-- config/                               # Infrastructure Configuration
|   |   |   |   |-- DataInitializerRunner.java        # Dev seed data initialization
|   |   |   |   |-- JpaAuditingConfig.java            # JPA auditing and AuditorAware bean
|   |   |   |   |-- OpenApiConfig.java                # OpenAPI 3.0 / Swagger UI definition
|   |   |   |   |-- PasswordMigrationRunner.java      # Plaintext to BCrypt migration runner
|   |   |   |   |-- RedisConfig.java                  # Redis and in-memory cache managers
|   |   |   |   `-- WebSocketConfig.java              # STOMP over WebSocket broker config
|   |   |   |
|   |   |   |-- controller/                           # REST API Controllers (15)
|   |   |   |   |-- AdminController.java              # Administrative metrics & health endpoints
|   |   |   |   |-- BookingController.java            # Reservation operations
|   |   |   |   |-- CalendarController.java           # iCalendar & Google Calendar link generation
|   |   |   |   |-- CheckInController.java            # Gate admission check-in endpoints
|   |   |   |   |-- CouponController.java             # Discount coupon administration
|   |   |   |   |-- EventController.java              # Event CRUD, publishing, and search
|   |   |   |   |-- ImageController.java              # Banner file upload & retrieval
|   |   |   |   |-- PaymentController.java            # Payment execution & refunds
|   |   |   |   |-- ReviewController.java             # Event review management
|   |   |   |   |-- SeatController.java               # Seat layout & manual lock/unlock
|   |   |   |   |-- TicketController.java             # Ticket issuance, QR, and PDF generation
|   |   |   |   |-- UserController.java               # Profile & user administration
|   |   |   |   |-- VenueController.java              # Venue management
|   |   |   |   |-- WaitlistController.java           # Sold-out event waitlist queue
|   |   |   |   `-- WishlistController.java           # Customer event bookmarking
|   |   |   |
|   |   |   |-- dto/                                  # Data Transfer Objects (22)
|   |   |   |   |-- BookingRequestDTO.java
|   |   |   |   |-- BookingResponseDTO.java
|   |   |   |   |-- CouponRequestDTO.java
|   |   |   |   |-- CouponResponseDTO.java
|   |   |   |   |-- EventAnalyticsDTO.java
|   |   |   |   |-- EventRequestDTO.java
|   |   |   |   |-- EventResponseDTO.java
|   |   |   |   |-- EventReviewSummaryDTO.java
|   |   |   |   |-- PaymentRequestDTO.java
|   |   |   |   |-- PaymentResponseDTO.java
|   |   |   |   |-- ReviewRequestDTO.java
|   |   |   |   |-- ReviewResponseDTO.java
|   |   |   |   |-- SeatLockRequestDTO.java
|   |   |   |   |-- SeatRequestDTO.java
|   |   |   |   |-- SeatResponseDTO.java
|   |   |   |   |-- SeatUpdateDTO.java                # WebSocket real-time payload
|   |   |   |   |-- TicketResponseDTO.java
|   |   |   |   |-- UserProfileUpdateDTO.java
|   |   |   |   |-- UserRequestDTO.java
|   |   |   |   |-- UserResponseDTO.java
|   |   |   |   |-- VenueRequestDTO.java
|   |   |   |   |-- VenueResponseDTO.java
|   |   |   |   `-- admin/                            # Administrative DTOs (7)
|   |   |   |       |-- AdminDashboardDTO.java
|   |   |   |       |-- BookingAnalyticsDTO.java
|   |   |   |       |-- EventStatisticsDTO.java
|   |   |   |       |-- ReportsDTO.java
|   |   |   |       |-- RevenueAnalyticsDTO.java
|   |   |   |       |-- SystemHealthDTO.java
|   |   |   |       `-- UserStatisticsDTO.java
|   |   |   |
|   |   |   |-- entity/                               # Persistent Domain Model (13)
|   |   |   |   |-- BaseEntity.java                   # Abstract mapped superclass with audit fields
|   |   |   |   |-- Booking.java                      # Booking entity with @Version
|   |   |   |   |-- Coupon.java                       # Discount rules
|   |   |   |   |-- Event.java                        # Event entity with @Version
|   |   |   |   |-- Payment.java                      # 1:1 transaction record
|   |   |   |   |-- RefreshToken.java                 # Cryptographic refresh token
|   |   |   |   |-- Review.java                       # User event rating & comment
|   |   |   |   |-- Seat.java                         # Seat entity with lock duration & @Version
|   |   |   |   |-- Ticket.java                       # Admission pass with unique QR token
|   |   |   |   |-- User.java                         # User account (app_user table)
|   |   |   |   |-- Venue.java                        # Venue facility & capacity
|   |   |   |   |-- Waitlist.java                     # Queue entry
|   |   |   |   `-- Wishlist.java                     # Bookmark entry
|   |   |   |
|   |   |   |-- enums/                                # Domain Enumerations (10)
|   |   |   |   |-- BookingStatus.java                # PENDING, CONFIRMED, CANCELLED
|   |   |   |   |-- DiscountType.java                 # PERCENTAGE, FIXED, EARLY_BIRD
|   |   |   |   |-- EventStatus.java                  # DRAFT, PUBLISHED, CANCELLED, COMPLETED
|   |   |   |   |-- PaymentMethod.java                # CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING
|   |   |   |   |-- PaymentStatus.java                # PENDING, COMPLETED, FAILED, REFUNDED
|   |   |   |   |-- Role.java                         # ADMIN, ORGANIZER, CUSTOMER
|   |   |   |   |-- SeatStatus.java                   # AVAILABLE, BOOKED, LOCKED
|   |   |   |   |-- SeatType.java                     # REGULAR, VIP, PREMIUM
|   |   |   |   |-- TicketStatus.java                 # ACTIVE, USED, CANCELLED
|   |   |   |   `-- WaitlistStatus.java               # WAITING, NOTIFIED, PROMOTED, CANCELLED
|   |   |   |
|   |   |   |-- exception/                            # Exception Handling Architecture (11)
|   |   |   |   |-- BookingNotFoundException.java
|   |   |   |   |-- DuplicateEmailException.java
|   |   |   |   |-- DuplicateResourceException.java
|   |   |   |   |-- ErrorResponse.java                # Standardized JSON error response model
|   |   |   |   |-- EventNotFoundException.java
|   |   |   |   |-- GlobalExceptionHandler.java       # Centralized @RestControllerAdvice
|   |   |   |   |-- ResourceNotFoundException.java
|   |   |   |   |-- SeatNotFoundException.java
|   |   |   |   |-- TokenExpiredException.java
|   |   |   |   |-- UserNotFoundException.java
|   |   |   |   `-- VenueNotFoundException.java
|   |   |   |
|   |   |   |-- logging/                              # Operational Logging
|   |   |   |   `-- AuditLogger.java                  # Structured operational audit emitter
|   |   |   |
|   |   |   |-- mapper/                               # Explicit DTO Mappers (7)
|   |   |   |   |-- BookingMapper.java
|   |   |   |   |-- EventMapper.java
|   |   |   |   |-- PaymentMapper.java
|   |   |   |   |-- SeatMapper.java
|   |   |   |   |-- TicketMapper.java
|   |   |   |   |-- UserMapper.java
|   |   |   |   `-- VenueMapper.java
|   |   |   |
|   |   |   |-- repository/                           # Spring Data JPA Repositories (12)
|   |   |   |   |-- BookingRepository.java
|   |   |   |   |-- CouponRepository.java
|   |   |   |   |-- EventRepository.java
|   |   |   |   |-- PaymentRepository.java
|   |   |   |   |-- RefreshTokenRepository.java
|   |   |   |   |-- ReviewRepository.java
|   |   |   |   |-- SeatRepository.java
|   |   |   |   |-- TicketRepository.java
|   |   |   |   |-- UserRepository.java
|   |   |   |   |-- VenueRepository.java
|   |   |   |   |-- WaitlistRepository.java
|   |   |   |   `-- WishlistRepository.java
|   |   |   |
|   |   |   |-- scheduler/                            # Background Schedulers (2)
|   |   |   |   |-- EventReminderScheduler.java       # Morning event notification dispatcher
|   |   |   |   `-- SeatLockScheduler.java            # Recurring 60-second lock release task
|   |   |   |
|   |   |   |-- security/                             # Security Infrastructure (8)
|   |   |   |   |-- CustomUserDetails.java            # Spring Security UserDetails adapter
|   |   |   |   |-- CustomUserDetailsService.java     # User retrieval service
|   |   |   |   |-- JwtAuthenticationEntryPoint.java  # 401 Unauthorized handler
|   |   |   |   |-- JwtAuthenticationFilter.java      # Request JWT extraction and validation filter
|   |   |   |   |-- JwtUtil.java                      # Cryptographic token operations
|   |   |   |   |-- RateLimitingFilter.java           # Bucket4j token bucket rate limiter
|   |   |   |   |-- RequestLoggingFilter.java         # HTTP request/response metrics logger
|   |   |   |   `-- SecurityConfig.java               # SecurityFilterChain and CORS definitions
|   |   |   |
|   |   |   |-- service/                              # Business Logic Interfaces (16)
|   |   |   |   |-- AdminService.java
|   |   |   |   |-- BookingService.java
|   |   |   |   |-- CalendarService.java
|   |   |   |   |-- CouponService.java
|   |   |   |   |-- EmailService.java
|   |   |   |   |-- EventService.java
|   |   |   |   |-- ImageStorageService.java
|   |   |   |   |-- PaymentService.java
|   |   |   |   |-- QrCodeService.java
|   |   |   |   |-- ReviewService.java
|   |   |   |   |-- SeatService.java
|   |   |   |   |-- TicketService.java
|   |   |   |   |-- UserService.java
|   |   |   |   |-- VenueService.java
|   |   |   |   |-- WaitlistService.java
|   |   |   |   |-- WishlistService.java
|   |   |   |   `-- impl/
|   |   |   |       `-- EmailServiceImpl.java         # Email delivery implementation
|   |   |   |
|   |   |   |-- specification/                        # Composable Query Criteria
|   |   |   |   `-- EventSpecification.java           # Multi-predicate dynamic search builder
|   |   |   |
|   |   |   `-- websocket/                            # Real-Time Telemetry
|   |   |       `-- SeatUpdatePublisher.java          # STOMP message broadcaster
|   |   |
|   |   `-- resources/
|   |       |-- application.properties                # Base application properties
|   |       |-- application-dev.properties            # Development overrides & seed toggle
|   |       `-- application-prod.properties           # Production deployment configuration
|   |
|   `-- test/                                         # Test Source Hierarchy (24 Test Suites)
|       `-- java/com/kritagya/event_booking_system/
|           |-- EventBookingSystemApplicationTests.java
|           |-- controller/                           # Controller integration test suites
|           |-- repository/                           # JPA repository test suites
|           |-- security/                             # Security filter & policy test suites
|           `-- service/                              # Domain service unit test suites
|
|-- frontend/                                         # React Single-Page Application
|   |-- README.md                                     # Dedicated frontend documentation
|   |-- package.json                                  # NPM dependencies & scripts
|   |-- vite.config.js                                # Vite bundler configuration (proxy & manualChunks)
|   |-- index.html                                    # Browser HTML entry template
|   |-- tailwind.config.js                            # Tailwind CSS brutalist theme & colors
|   |-- postcss.config.js                             # PostCSS build configuration
|   `-- src/
|       |-- main.jsx                                  # React DOM bootstrap
|       |-- App.jsx                                   # Root layout coordinator, routing, & theme
|       |-- App.css                                   # Component layout styles
|       |-- index.css                                 # Core design tokens, hazard tapes, fonts
|       |-- assets/                                   # Optimized WebP hero artwork & SVG logos
|       |-- components/                               # UI Component Library (27 components)
|       |   |-- Navbar.jsx                            # Brutalist header & currency selector
|       |   |-- BackstageAuthTerminal.jsx             # Creative holographic VIP backstage pass accreditation terminal
|       |   |-- SeatMapModal.jsx                      # Arena & cinema interactive seating engine
|       |   |-- AdminDashboard.jsx                    # Administrative metrics & health gauges
|       |   |-- MyBookings.jsx                        # Customer bookings & QR ticket passes
|       |   |-- ProfileDashboard.jsx                  # Profile settings & password update
|       |   |-- Wishlist.jsx                          # Bookmarked events collection
|       |   |-- AuthModal.jsx                         # Login, registration, & recovery dialog
|       |   |-- CreateEventModal.jsx                  # Organizer event publishing modal
|       |   |-- CheckInModal.jsx                      # Optical QR & ticket check-in scanner
|       |   |-- DatabaseConsoleModal.jsx              # In-browser administrative SQL console
|       |   |-- SystemStatusModal.jsx                 # Live backend telemetry dialog
|       |   |-- ApiDocsModal.jsx                      # Embedded OpenAPI 3.0 explorer
|       |   |-- CookiesModal.jsx                      # Cookie consent & policy dialog
|       |   |-- PrivacyModal.jsx                      # Data protection & GDPR statement
|       |   |-- TermsModal.jsx                        # Ticketing terms & refund conditions
|       |   |-- LoginPage.jsx                         # Standalone authentication page
|       |   |-- RegisterPage.jsx                      # Standalone registration page
|       |   |-- Background3D.jsx                      # Acoustic harmonic waveform canvas engine
|       |   |-- IntroSplashScreen.jsx                 # Boot splash screen with telemetry
|       |   |-- ErrorBoundary.jsx                     # Crash-resilient React error boundary
|       |   |-- EventCardSkeleton.jsx                 # Skeleton placeholder for event cards
|       |   |-- SeatMapSkeleton.jsx                   # Skeleton placeholder for seating grid
|       |   |-- AdminDashboardSkeleton.jsx            # Skeleton placeholder for admin view
|       |   |-- BookingCardSkeleton.jsx               # Skeleton placeholder for booking list
|       |   |-- WishlistCardSkeleton.jsx              # Skeleton placeholder for wishlist
|       |   `-- ProfileSkeleton.jsx                   # Skeleton placeholder for profile
|       `-- services/                                 # API, WebSocket, & currency clients
|           |-- api.js                                # Axios HTTP client with JWT interceptor
|           |-- currency.js                           # Dynamic multi-currency rate engine
|           `-- websocket.js                          # STOMP/SockJS client with auto-reconnect
|
`-- target/                                           # Maven build output directory (ignored)
```

---

## Architectural Metrics

| Category | Count | Primary Technologies |
|---|---|---|
| JPA Entities | 13 | Hibernate 6, PostgreSQL |
| REST Controllers | 15 | Spring Web MVC |
| REST Endpoints | 88 | SpringDoc OpenAPI 3.0 |
| Service Interfaces | 16 | Spring Transaction Management |
| Data Transfer Objects | 29 | Jakarta Bean Validation |
| Repositories | 12 | Spring Data JPA |
| Background Schedulers | 2 | Spring Task Scheduling |
| Automated Test Suites | 24 | JUnit 5, Mockito, MockMvc, H2 |
| React Components | 27 | React 19, Lucide, Tailwind CSS |
| Frontend Linter | 1 | Oxlint 1.75.0 (sub-30ms) |
| CI/CD Pipelines | 2 | GitHub Actions (Backend CI, Frontend CI) |
| Real-Time Transports | 1 | STOMP over SockJS |
| Primary Database Tables | 13 | PostgreSQL 16+ |
