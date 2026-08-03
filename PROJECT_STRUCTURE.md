# 📁 Project Structure — Event Booking System

Complete file tree of the Event Booking System repository.

---

```
event-booking-system/
│
├── 📄 README.md                          # Project overview & setup guide
├── 📄 ARCHITECTURE.md                    # System architecture documentation
├── 📄 API_DOCUMENTATION.md              # Complete REST API reference
├── 📄 DATABASE.md                        # Database schema documentation
├── 📄 DEPLOYMENT.md                      # Production deployment guide
├── 📄 CONTRIBUTING.md                    # Contribution guidelines
├── 📄 SECURITY.md                        # Security policies
├── 📄 CHANGELOG.md                       # Version history
├── 📄 PROJECT_STRUCTURE.md              # This file
│
├── 📄 pom.xml                            # Maven build configuration
├── 📄 mvnw / mvnw.cmd                   # Maven Wrapper (Unix/Windows)
├── 📄 package.json                       # Root package (concurrently scripts)
├── 📄 .gitignore                         # Git ignore rules
│
├── 📂 .mvn/                              # Maven Wrapper configuration
│
├── 📂 src/
│   ├── 📂 main/
│   │   ├── 📂 java/com/kritagya/event_booking_system/
│   │   │   │
│   │   │   ├── 📄 EventBookingSystemApplication.java    # Spring Boot entry point
│   │   │   │                                             # @EnableScheduling, @EnableAsync, @EnableRetry
│   │   │   │
│   │   │   ├── 📂 auth/                                 # Authentication Module
│   │   │   │   ├── 📄 AuthController.java               # POST /api/auth/** endpoints
│   │   │   │   ├── 📄 AuthService.java                  # Register, login, refresh, logout, password reset
│   │   │   │   ├── 📄 AuthResponseDTO.java              # Auth response (tokens + user info)
│   │   │   │   ├── 📄 LoginRequestDTO.java              # Login request (email, password)
│   │   │   │   ├── 📄 RegisterRequestDTO.java           # Registration request
│   │   │   │   ├── 📄 RefreshTokenRequestDTO.java       # Token refresh request
│   │   │   │   ├── 📄 ForgotPasswordRequestDTO.java     # Forgot password request
│   │   │   │   └── 📄 ResetPasswordRequestDTO.java      # Reset password request
│   │   │   │
│   │   │   ├── 📂 config/                               # Application Configuration
│   │   │   │   ├── 📄 DataInitializerRunner.java        # Seeds demo venues, events, seats on startup
│   │   │   │   ├── 📄 JpaAuditingConfig.java            # Enables JPA auditing with AuditorAware
│   │   │   │   ├── 📄 OpenApiConfig.java                # Swagger/OpenAPI configuration
│   │   │   │   ├── 📄 PasswordMigrationRunner.java      # Migrates plain-text passwords to BCrypt
│   │   │   │   ├── 📄 RedisConfig.java                  # Redis cache + simple cache fallback
│   │   │   │   └── 📄 WebSocketConfig.java              # STOMP WebSocket configuration
│   │   │   │
│   │   │   ├── 📂 controller/                           # REST API Controllers (15)
│   │   │   │   ├── 📄 AdminController.java              # GET /api/admin/** (ADMIN only)
│   │   │   │   ├── 📄 BookingController.java            # /api/bookings CRUD
│   │   │   │   ├── 📄 CalendarController.java           # GET /api/events/{id}/calendar.ics
│   │   │   │   ├── 📄 CheckInController.java            # POST /api/checkin/{ticketId}
│   │   │   │   ├── 📄 CouponController.java             # /api/coupons management
│   │   │   │   ├── 📄 EventController.java              # /api/events CRUD + search + analytics
│   │   │   │   ├── 📄 ImageController.java              # /api/images upload/download/delete
│   │   │   │   ├── 📄 PaymentController.java            # /api/payments processing
│   │   │   │   ├── 📄 ReviewController.java             # /api/events/{id}/reviews, /api/reviews
│   │   │   │   ├── 📄 SeatController.java               # /api/seats CRUD
│   │   │   │   ├── 📄 TicketController.java             # /api/tickets generation, QR, PDF
│   │   │   │   ├── 📄 UserController.java               # /api/users CRUD + /me profile
│   │   │   │   ├── 📄 VenueController.java              # /api/venues CRUD
│   │   │   │   ├── 📄 WaitlistController.java           # /api/waitlist join/leave/count
│   │   │   │   └── 📄 WishlistController.java           # /api/wishlist add/remove/list
│   │   │   │
│   │   │   ├── 📂 dto/                                  # Data Transfer Objects (21)
│   │   │   │   ├── 📄 BookingRequestDTO.java
│   │   │   │   ├── 📄 BookingResponseDTO.java
│   │   │   │   ├── 📄 CouponRequestDTO.java
│   │   │   │   ├── 📄 CouponResponseDTO.java
│   │   │   │   ├── 📄 EventAnalyticsDTO.java
│   │   │   │   ├── 📄 EventRequestDTO.java
│   │   │   │   ├── 📄 EventResponseDTO.java
│   │   │   │   ├── 📄 EventReviewSummaryDTO.java
│   │   │   │   ├── 📄 PaymentRequestDTO.java
│   │   │   │   ├── 📄 PaymentResponseDTO.java
│   │   │   │   ├── 📄 ReviewRequestDTO.java
│   │   │   │   ├── 📄 ReviewResponseDTO.java
│   │   │   │   ├── 📄 SeatRequestDTO.java
│   │   │   │   ├── 📄 SeatResponseDTO.java
│   │   │   │   ├── 📄 SeatUpdateDTO.java                # WebSocket payload for real-time seat updates
│   │   │   │   ├── 📄 TicketResponseDTO.java
│   │   │   │   ├── 📄 UserProfileUpdateDTO.java
│   │   │   │   ├── 📄 UserRequestDTO.java
│   │   │   │   ├── 📄 UserResponseDTO.java
│   │   │   │   ├── 📄 VenueRequestDTO.java
│   │   │   │   ├── 📄 VenueResponseDTO.java
│   │   │   │   └── 📂 admin/                            # Admin-specific DTOs (6)
│   │   │   │       ├── 📄 AdminDashboardDTO.java
│   │   │   │       ├── 📄 BookingAnalyticsDTO.java
│   │   │   │       ├── 📄 EventStatisticsDTO.java
│   │   │   │       ├── 📄 ReportsDTO.java
│   │   │   │       ├── 📄 RevenueAnalyticsDTO.java
│   │   │   │       └── 📄 UserStatisticsDTO.java
│   │   │   │
│   │   │   ├── 📂 entity/                               # JPA Entities (13)
│   │   │   │   ├── 📄 BaseEntity.java                   # Abstract base with audit fields
│   │   │   │   ├── 📄 Booking.java                      # Booking with seats (M:N) + @Version
│   │   │   │   ├── 📄 Coupon.java                       # Discount coupons
│   │   │   │   ├── 📄 Event.java                        # Events with organizer + venue + @Version
│   │   │   │   ├── 📄 Payment.java                      # Payment (1:1 with Booking)
│   │   │   │   ├── 📄 RefreshToken.java                 # JWT refresh tokens
│   │   │   │   ├── 📄 Review.java                       # Event reviews (1-5 stars)
│   │   │   │   ├── 📄 Seat.java                         # Venue seats with lock timeout + @Version
│   │   │   │   ├── 📄 Ticket.java                       # E-tickets with QR codes
│   │   │   │   ├── 📄 User.java                         # User accounts (app_user table)
│   │   │   │   ├── 📄 Venue.java                        # Event venues
│   │   │   │   ├── 📄 Waitlist.java                     # Waitlist entries
│   │   │   │   └── 📄 Wishlist.java                     # Wishlist entries
│   │   │   │
│   │   │   ├── 📂 enums/                                # Enum Types (10)
│   │   │   │   ├── 📄 BookingStatus.java                # PENDING, CONFIRMED, CANCELLED
│   │   │   │   ├── 📄 DiscountType.java                 # PERCENTAGE, FIXED, EARLY_BIRD
│   │   │   │   ├── 📄 EventStatus.java                  # DRAFT, PUBLISHED, CANCELLED, COMPLETED
│   │   │   │   ├── 📄 PaymentMethod.java                # CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING
│   │   │   │   ├── 📄 PaymentStatus.java                # PENDING, COMPLETED, FAILED, REFUNDED
│   │   │   │   ├── 📄 Role.java                         # ADMIN, ORGANIZER, CUSTOMER
│   │   │   │   ├── 📄 SeatStatus.java                   # AVAILABLE, BOOKED, LOCKED
│   │   │   │   ├── 📄 SeatType.java                     # REGULAR, VIP, PREMIUM
│   │   │   │   ├── 📄 TicketStatus.java                 # ACTIVE, USED, CANCELLED
│   │   │   │   └── 📄 WaitlistStatus.java               # WAITING, NOTIFIED, PROMOTED, CANCELLED
│   │   │   │
│   │   │   ├── 📂 exception/                            # Exception Handling (11)
│   │   │   │   ├── 📄 BookingNotFoundException.java
│   │   │   │   ├── 📄 DuplicateEmailException.java
│   │   │   │   ├── 📄 DuplicateResourceException.java
│   │   │   │   ├── 📄 ErrorResponse.java                # Standardized error response body
│   │   │   │   ├── 📄 EventNotFoundException.java
│   │   │   │   ├── 📄 GlobalExceptionHandler.java       # @ControllerAdvice — centralized error handling
│   │   │   │   ├── 📄 ResourceNotFoundException.java
│   │   │   │   ├── 📄 SeatNotFoundException.java
│   │   │   │   ├── 📄 TokenExpiredException.java
│   │   │   │   ├── 📄 UserNotFoundException.java
│   │   │   │   └── 📄 VenueNotFoundException.java
│   │   │   │
│   │   │   ├── 📂 logging/                              # Audit Logging
│   │   │   │   └── 📄 AuditLogger.java                  # Structured audit events (login, booking, payment)
│   │   │   │
│   │   │   ├── 📂 mapper/                               # Entity ↔ DTO Mappers (7)
│   │   │   │   ├── 📄 BookingMapper.java
│   │   │   │   ├── 📄 EventMapper.java
│   │   │   │   ├── 📄 PaymentMapper.java
│   │   │   │   ├── 📄 SeatMapper.java
│   │   │   │   ├── 📄 TicketMapper.java
│   │   │   │   ├── 📄 UserMapper.java
│   │   │   │   └── 📄 VenueMapper.java
│   │   │   │
│   │   │   ├── 📂 repository/                           # JPA Repositories (12)
│   │   │   │   ├── 📄 BookingRepository.java
│   │   │   │   ├── 📄 CouponRepository.java
│   │   │   │   ├── 📄 EventRepository.java
│   │   │   │   ├── 📄 PaymentRepository.java
│   │   │   │   ├── 📄 RefreshTokenRepository.java
│   │   │   │   ├── 📄 ReviewRepository.java
│   │   │   │   ├── 📄 SeatRepository.java
│   │   │   │   ├── 📄 TicketRepository.java
│   │   │   │   ├── 📄 UserRepository.java
│   │   │   │   ├── 📄 VenueRepository.java
│   │   │   │   ├── 📄 WaitlistRepository.java
│   │   │   │   └── 📄 WishlistRepository.java
│   │   │   │
│   │   │   ├── 📂 scheduler/                            # Background Scheduled Tasks (2)
│   │   │   │   ├── 📄 EventReminderScheduler.java       # Daily 8 AM — sends event reminder emails
│   │   │   │   └── 📄 SeatLockScheduler.java            # Every 60s — releases expired seat locks
│   │   │   │
│   │   │   ├── 📂 security/                             # Security Configuration (8)
│   │   │   │   ├── 📄 CustomUserDetails.java            # UserDetails implementation
│   │   │   │   ├── 📄 CustomUserDetailsService.java     # Loads user from database
│   │   │   │   ├── 📄 JwtAuthenticationEntryPoint.java  # 401 handler for unauthenticated requests
│   │   │   │   ├── 📄 JwtAuthenticationFilter.java      # Extracts & validates JWT from requests
│   │   │   │   ├── 📄 JwtUtil.java                      # JWT generation, parsing, validation
│   │   │   │   ├── 📄 RateLimitingFilter.java           # Bucket4j per-IP rate limiting
│   │   │   │   ├── 📄 RequestLoggingFilter.java         # HTTP request/response logging
│   │   │   │   └── 📄 SecurityConfig.java               # Security filter chain + CORS + auth rules
│   │   │   │
│   │   │   ├── 📂 service/                              # Business Logic Services (16 + 1 impl)
│   │   │   │   ├── 📄 AdminService.java                 # Dashboard, analytics, reports
│   │   │   │   ├── 📄 BookingService.java               # Booking CRUD with seat allocation
│   │   │   │   ├── 📄 CalendarService.java              # iCal & Google Calendar generation
│   │   │   │   ├── 📄 CouponService.java                # Coupon CRUD and validation
│   │   │   │   ├── 📄 EmailService.java                 # Email interface (7 methods)
│   │   │   │   ├── 📄 EventService.java                 # Event CRUD, search, analytics
│   │   │   │   ├── 📄 ImageStorageService.java          # File upload/download/delete
│   │   │   │   ├── 📄 PaymentService.java               # Payment processing
│   │   │   │   ├── 📄 QrCodeService.java                # QR code image generation (ZXing)
│   │   │   │   ├── 📄 ReviewService.java                # Review CRUD with summaries
│   │   │   │   ├── 📄 SeatService.java                  # Seat CRUD and locking
│   │   │   │   ├── 📄 TicketService.java                # Ticket gen, validation, check-in, PDF
│   │   │   │   ├── 📄 UserService.java                  # User CRUD and profile
│   │   │   │   ├── 📄 VenueService.java                 # Venue CRUD
│   │   │   │   ├── 📄 WaitlistService.java              # Waitlist management + promotion
│   │   │   │   ├── 📄 WishlistService.java              # Wishlist management
│   │   │   │   └── 📂 impl/
│   │   │   │       └── 📄 EmailServiceImpl.java         # Email implementation (Spring Mail + Retry)
│   │   │   │
│   │   │   ├── 📂 specification/                        # JPA Specifications
│   │   │   │   └── 📄 EventSpecification.java           # Dynamic query builder for event search
│   │   │   │
│   │   │   └── 📂 websocket/                            # WebSocket Publishers
│   │   │       └── 📄 SeatUpdatePublisher.java          # Publishes seat updates to STOMP
│   │   │
│   │   └── 📂 resources/
│   │       ├── 📄 application.properties                # Application configuration
│   │       ├── 📂 static/                               # Static files
│   │       └── 📂 templates/                            # Template files
│   │
│   └── 📂 test/
│       └── 📂 java/com/kritagya/event_booking_system/
│           ├── 📄 EventBookingSystemApplicationTests.java  # Application context test
│           ├── 📂 controller/                              # Controller integration tests
│           ├── 📂 repository/                              # Repository tests
│           └── 📂 service/                                 # Service unit tests
│
├── 📂 frontend/                                          # React Frontend (Vite)
│   ├── 📄 package.json                                   # Frontend dependencies
│   ├── 📄 vite.config.js                                 # Vite configuration
│   ├── 📄 index.html                                     # HTML entry point
│   └── 📂 src/
│       ├── 📄 main.jsx                                   # React entry point
│       ├── 📄 App.jsx                                    # Main application (routing, state, layout)
│       ├── 📄 App.css                                    # App-specific styles
│       ├── 📄 index.css                                  # Global design system
│       ├── 📂 assets/                                    # Static assets (images)
│       ├── 📂 components/                                # React Components (11)
│       │   ├── 📄 AdminDashboard.jsx                     # Admin analytics dashboard
│       │   ├── 📄 AuthModal.jsx                          # Login/register modal
│       │   ├── 📄 CheckInModal.jsx                       # Ticket check-in interface
│       │   ├── 📄 CreateEventModal.jsx                   # Event creation form
│       │   ├── 📄 LoginPage.jsx                          # Standalone login page
│       │   ├── 📄 MyBookings.jsx                         # User booking history
│       │   ├── 📄 Navbar.jsx                             # Top navigation + avatar dropdown
│       │   ├── 📄 ProfileDashboard.jsx                   # User profile management
│       │   ├── 📄 RegisterPage.jsx                       # Standalone registration page
│       │   ├── 📄 SeatMapModal.jsx                       # Seat selection + booking + payment
│       │   └── 📄 Wishlist.jsx                           # Saved events wishlist
│       └── 📂 services/                                  # Frontend Services (3)
│           ├── 📄 api.js                                 # HTTP client with JWT interceptor
│           ├── 📄 currency.js                            # Multi-currency formatting
│           └── 📄 websocket.js                           # STOMP WebSocket client
│
├── 📂 uploads/                                           # Image upload directory (runtime)
│
├── 📂 postman/                                           # Postman Collection
│   ├── 📂 collections/                                   # API collections
│   ├── 📂 environments/                                  # Environment configs
│   ├── 📂 flows/                                         # Test flows
│   ├── 📂 globals/                                       # Global variables
│   ├── 📂 mocks/                                         # Mock servers
│   └── 📂 specs/                                         # API specifications
│
└── 📂 target/                                            # Maven build output (gitignored)
```

---

## File Counts Summary

| Category | Count |
|---|---|
| **Entities** | 13 |
| **Enums** | 10 |
| **Controllers** | 15 + 1 Auth |
| **Services** | 16 + 1 Implementation |
| **Repositories** | 12 |
| **DTOs** | 21 + 6 Admin |
| **Mappers** | 7 |
| **Exceptions** | 10 + 1 Handler |
| **Config Classes** | 6 |
| **Security Classes** | 8 |
| **Schedulers** | 2 |
| **React Components** | 11 |
| **Frontend Services** | 3 |
| **Total Java Files** | ~100+ |
