# 📋 Changelog — Event Booking System

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-08-03

### 🎉 Initial Release

The first production-ready release of the Event Booking System — a full-stack event management and ticket booking platform.

### Added

#### Authentication & Authorization
- JWT-based stateless authentication with access and refresh token rotation
- Role-based access control (RBAC) with three roles: `ADMIN`, `ORGANIZER`, `CUSTOMER`
- User registration with configurable email verification flow
- Login with BCrypt password validation
- Password reset via email with time-limited tokens
- Automatic plain-text password migration to BCrypt on startup
- Refresh token revocation on logout and password reset

#### Event Management
- Full CRUD operations for events with organizer assignment
- Event lifecycle: `DRAFT` → `PUBLISHED` → `COMPLETED` / `CANCELLED`
- Soft delete with `deleted` flag
- Advanced search with JPA Specification-based dynamic queries
- Case-insensitive, tokenized keyword search across name, description, venue, and category
- Filters: category, date range, venue, city, price range
- View count tracking
- Popular events (by view count) and trending events (by recent bookings)
- Personalized event recommendations
- Banner image upload support
- Paginated event listing

#### Venue & Seat Management
- Venue CRUD with capacity management
- Seat management with row/number, type (`VIP`, `PREMIUM`, `REGULAR`), and status
- Temporary seat locking with configurable timeout (default: 10 minutes)
- Automatic seat lock expiration scheduler (runs every 60 seconds)
- Real-time seat availability broadcast via WebSocket/STOMP

#### Booking & Ticketing
- Booking creation with atomic seat allocation
- Optimistic locking on Booking, Event, and Seat entities
- Booking cancellation with automatic seat release and availability update
- Ticket generation with unique UUID-based QR codes (Google ZXing)
- Individual ticket PDF download (iText)
- Booking summary PDF download
- Ticket validation by QR code
- Ticket check-in with timestamp recording

#### Payment Processing
- Payment entity linked 1:1 with Booking
- Support for CREDIT_CARD, DEBIT_CARD, UPI, and NET_BANKING
- Payment status tracking: PENDING, COMPLETED, FAILED, REFUNDED
- Simulated payment processing with transaction ID generation

#### Coupons & Discounts
- Coupon management with PERCENTAGE, FIXED, and EARLY_BIRD types
- Usage limits, expiry dates, and minimum booking amount validation
- Admin-only creation; public validation endpoint

#### Waitlist & Wishlist
- Join/leave waitlist for sold-out events with status tracking
- Personal wishlist for saving events
- Unique constraints preventing duplicate entries

#### Reviews & Ratings
- User reviews with 1-5 star ratings and comments
- One review per user per event constraint
- Review summary with average rating
- Edit and delete own reviews

#### Admin Dashboard
- Admin-only dashboard with system-wide statistics
- Revenue analytics
- Booking analytics
- User and event statistics
- Comprehensive reports endpoint

#### Calendar Integration
- iCalendar (.ics) file download for events
- Google Calendar deep-link generation

#### Image Management
- Banner image upload (up to 20MB)
- Local file system storage with UUID filenames
- Image retrieval and deletion

#### Real-Time Features
- STOMP over WebSocket for live seat updates
- SockJS fallback for browser compatibility
- Client-side WebSocket integration in React

#### Infrastructure
- PostgreSQL database with auto-schema generation
- Redis caching with ConcurrentMapCache fallback
- Bucket4j rate limiting on auth, booking, and payment endpoints
- Spring Actuator health, info, and metrics endpoints
- Swagger/OpenAPI 3 interactive documentation
- JPA Auditing (createdAt, updatedAt, createdBy, updatedBy)
- Structured audit logging for security events
- CORS configuration for frontend origins
- Spring Retry and AOP for email retry support
- Async email sending

#### Frontend
- React 19 SPA with Vite 8
- Event catalog with real-time search and filtering
- Seat selection modal with visual seat map
- Booking flow with payment method selection (Credit Card, Debit Card, UPI with QR, Net Banking)
- User authentication (login/register modals)
- Avatar dropdown with Profile, My Tickets, and Logout
- Profile dashboard
- My Bookings page
- Wishlist management
- Admin dashboard
- Event creation modal
- Check-in modal
- Confetti animation on booking success
- Multi-currency formatting

#### Documentation
- README.md with setup instructions and feature overview
- ARCHITECTURE.md with system design documentation
- API_DOCUMENTATION.md with complete REST API reference
- DATABASE.md with schema and entity documentation
- DEPLOYMENT.md with production deployment guide
- CONTRIBUTING.md with contribution guidelines
- SECURITY.md with security policies
- CHANGELOG.md (this file)
- PROJECT_STRUCTURE.md with file tree

#### Seed Data
- 4 primary demo events (Music, Tech, Theater, Sports)
- 15 venues across USA, India, UK, Europe, Australia, and Asia
- Auto-seeded seats with VIP and REGULAR types
- Automatic cleanup of test/extra data on startup

---

## [Unreleased]

### Planned
- OAuth 2.0 social login (Google, GitHub)
- Email notification delivery (currently stubbed)
- Payment gateway integration (Stripe, Razorpay)
- Event search by geolocation
- Ticket transfer between users
- Multi-language support (i18n)
- Dark mode toggle
- Mobile responsive improvements
- CI/CD pipeline configuration
- Docker Compose production setup
- Database migration with Flyway
