<p align="center">
  <h1 align="center">🎫 Event Booking System</h1>
  <p align="center">
    A production-grade, full-stack event booking platform built with <strong>Spring Boot 3</strong> and <strong>React 19</strong>.
    <br />
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

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Running the Application](#-running-the-application)
- [Default Seed Data](#-default-seed-data)
- [API Summary](#-api-summary)
- [Project Documentation](#-project-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

The **Event Booking System** is a comprehensive event management and ticket booking platform designed for real-world production use. It enables event organizers to create and manage events with venue-based seat allocation, while customers can browse, search, book tickets, and receive QR-coded e-tickets.

The system implements enterprise patterns including JWT authentication with refresh token rotation, role-based access control (RBAC), optimistic locking for concurrent bookings, real-time seat availability via WebSocket (STOMP), rate limiting, audit logging, scheduled tasks, and caching with Redis fallback.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication with access + refresh token rotation
- Role-based access control: **ADMIN**, **ORGANIZER**, **CUSTOMER**
- Email verification flow (configurable)
- Password reset via email with token expiry
- BCrypt password hashing with automatic plain-text migration

### 🎪 Event Management
- Full CRUD operations for events with organizer assignment
- Event lifecycle management: `DRAFT` → `PUBLISHED` → `COMPLETED` / `CANCELLED`
- Soft-delete support with `deleted` flag
- Event search with multi-field, case-insensitive, tokenized keyword matching
- JPA Specification-based dynamic query builder with filters for category, date range, venue, city, keyword, and price range
- View count tracking and analytics
- Banner image upload support

### 🏟️ Venue & Seat Management
- Venue CRUD with capacity management
- Seat-level management with row/number, type (`VIP`, `PREMIUM`, `REGULAR`), and status (`AVAILABLE`, `LOCKED`, `BOOKED`)
- Temporary seat locking with configurable timeout
- Automatic seat lock expiration via scheduled task (every 60 seconds)
- Real-time seat availability broadcast via WebSocket/STOMP

### 🎟️ Booking & Ticketing
- Booking creation with seat allocation and atomic seat locking
- Optimistic locking (`@Version`) on Booking, Event, and Seat entities to prevent double-booking
- Booking cancellation with automatic seat release
- Ticket generation with unique QR codes (Google ZXing)
- Ticket PDF download (iText)
- Booking summary PDF download
- Ticket validation and check-in via QR code scan

### 💳 Payment Processing
- Payment entity linked 1:1 with Booking
- Supported methods: `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING`
- Payment status tracking: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
- Audit logging for all payment events

### 🏷️ Coupons & Discounts
- Coupon management with types: `PERCENTAGE`, `FIXED`, `EARLY_BIRD`
- Usage limits, expiry dates, and minimum booking amount validation
- Admin-only coupon creation; public validation endpoint

### 📋 Waitlist & Wishlist
- Join/leave waitlist for sold-out events
- Automatic waitlist promotion notification when seats become available
- Personal wishlist management for saved events

### ⭐ Reviews & Ratings
- User reviews with 1-5 star rating and comments
- Unique constraint: one review per user per event
- Review summary with average rating and paginated review list
- Edit and delete own reviews

### 📊 Admin Dashboard & Analytics
- Admin-only dashboard with system-wide statistics
- Revenue analytics with booking trends
- User and event statistics
- Comprehensive reports endpoint

### 📅 Calendar Integration
- iCalendar (.ics) file download for events
- Google Calendar deep-link generation

### 🖼️ Image Management
- Banner image upload (up to 20MB) for events
- Local file system storage with UUID-based filenames
- Image retrieval and deletion endpoints

### ⚡ Real-Time Features
- STOMP over WebSocket for live seat availability updates
- SockJS fallback for browser compatibility
- Client-side WebSocket integration

### 🔧 Infrastructure & DevOps
- Redis caching with `ConcurrentMapCache` fallback
- Bucket4j rate limiting on auth, booking, and payment endpoints
- Spring Actuator health, info, and metrics endpoints
- Swagger/OpenAPI 3 interactive documentation
- JPA Auditing with `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- Structured audit logging for login, booking, payment, and event operations
- CORS configuration for frontend origins

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language runtime |
| Spring Boot | 3.4.1 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | ORM & data access |
| Spring WebSocket | 3.x | Real-time communication |
| Spring Mail | 3.x | Email notifications |
| Spring Retry | 2.x | Retry with exponential backoff |
| Spring Actuator | 3.x | Monitoring & health checks |
| PostgreSQL | 16+ | Primary database |
| Redis | 7+ | Caching layer |
| jjwt (io.jsonwebtoken) | 0.12.6 | JWT token management |
| Bucket4j | 8.10.1 | Rate limiting |
| Google ZXing | 3.5.3 | QR code generation |
| iText | 8.0.5 | PDF generation |
| SpringDoc OpenAPI | 2.7.0 | API documentation |
| Lombok | Latest | Boilerplate reduction |
| Maven | 3.9+ | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.8 | UI framework |
| Vite | 8.2.0 | Build tool & dev server |
| Lucide React | 1.28.0 | Icon library |
| STOMP.js | 7.3.0 | WebSocket client |
| SockJS Client | 1.6.1 | WebSocket fallback |
| Canvas Confetti | 1.9.4 | Booking success animations |

## 🏗️ Architecture

The application follows a **layered monolithic architecture** with clear separation of concerns:

```
┌──────────────────────────────────────────────────┐
│                React Frontend (Vite)             │
│         SPA • STOMP WebSocket • REST API         │
└───────────────────────┬──────────────────────────┘
                        │ HTTP / WebSocket
┌───────────────────────▼──────────────────────────┐
│              Spring Boot Backend                 │
│  ┌─────────────────────────────────────────────┐ │
│  │  Security Layer (JWT + Rate Limiting)       │ │
│  ├─────────────────────────────────────────────┤ │
│  │  Controller Layer (REST API)                │ │
│  ├─────────────────────────────────────────────┤ │
│  │  Service Layer (Business Logic)             │ │
│  ├─────────────────────────────────────────────┤ │
│  │  Repository Layer (Spring Data JPA)         │ │
│  ├─────────────────────────────────────────────┤ │
│  │  Entity Layer (JPA Entities)                │ │
│  └─────────────────────────────────────────────┘ │
└─────────────┬───────────────────┬────────────────┘
              │                   │
     ┌────────▼────────┐  ┌──────▼──────┐
     │   PostgreSQL    │  │    Redis    │
     │  (Primary DB)   │  │  (Cache)    │
     └─────────────────┘  └─────────────┘
```

> For a detailed architectural breakdown, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Java JDK | 17+ |
| Node.js | 18+ |
| PostgreSQL | 16+ |
| Redis | 7+ (optional — falls back to in-memory cache) |
| Maven | 3.9+ (Maven Wrapper included) |

### 1. Clone the Repository

```bash
git clone https://github.com/kritagya025/Event-Booking-System.git
cd Event-Booking-System
```

### 2. Database Setup

```sql
CREATE DATABASE event_booking_db;
```

### 3. Configure Environment Variables

Create environment variables or edit `src/main/resources/application.properties`:

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/event_booking_db` | PostgreSQL connection URL |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `kritagya` | Database password |
| `JWT_SECRET` | Base64 encoded key | JWT signing secret |
| `JWT_EXPIRATION` | `86400000` (24h) | Access token expiry (ms) |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7d) | Refresh token expiry (ms) |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP mail host |
| `MAIL_PORT` | `587` | SMTP mail port |
| `MAIL_USERNAME` | - | SMTP mail username |
| `MAIL_PASSWORD` | - | SMTP mail password |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `CACHE_TYPE` | `simple` | `simple` or `redis` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Frontend origins |

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## ▶️ Running the Application

### Option 1: Run Both Together (Recommended)

```bash
npm install        # Install root dependencies (concurrently)
npm run dev        # Starts both backend and frontend
```

### Option 2: Run Separately

**Backend** (runs on port 8080):
```bash
./mvnw spring-boot:run
```

**Frontend** (runs on port 5173):
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
| WebSocket | ws://localhost:8080/ws |

## 🌱 Default Seed Data

On application startup, `DataInitializerRunner` seeds the database with:

- **4 Events**: Neon Horizon Cyber Music Festival, Global AI & Autonomous Tech Summit, Phantom of the Opera — Broadway Revival, Grand Prix eSports World Championship
- **15 Venues**: Across USA, India, UK, Europe, Australia, and Asia
- **Seats**: Auto-seeded for each primary event venue with VIP and REGULAR types

## 📡 API Summary

| Module | Base Path | Key Endpoints |
|---|---|---|
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `POST /forgot-password`, `POST /reset-password`, `GET /verify-email` |
| **Events** | `/api/events` | `GET /`, `GET /{id}`, `GET /search`, `GET /popular`, `GET /trending`, `GET /recommendations`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/publish` |
| **Bookings** | `/api/bookings` | `POST /`, `GET /`, `GET /{id}`, `GET /user/{userId}`, `PATCH /{id}/cancel` |
| **Payments** | `/api/payments` | `POST /`, `GET /{id}`, `GET /booking/{bookingId}`, `GET /` |
| **Tickets** | `/api/tickets` | `POST /booking/{bookingId}`, `GET /booking/{bookingId}`, `GET /{id}`, `GET /{id}/qrcode`, `GET /{id}/pdf`, `GET /booking/{bookingId}/pdf` |
| **Venues** | `/api/venues` | `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` |
| **Seats** | `/api/seats` | `POST /`, `GET /`, `GET /{id}`, `GET /venue/{venueId}`, `GET /venue/{venueId}/available`, `PUT /{id}`, `DELETE /{id}` |
| **Reviews** | `/api` | `POST /events/{eventId}/reviews`, `GET /events/{eventId}/reviews`, `PUT /reviews/{id}`, `DELETE /reviews/{id}` |
| **Coupons** | `/api/coupons` | `POST /`, `POST /validate`, `GET /` |
| **Wishlist** | `/api/wishlist` | `POST /{eventId}`, `DELETE /{eventId}`, `GET /` |
| **Waitlist** | `/api/waitlist` | `POST /{eventId}`, `DELETE /{eventId}`, `GET /{eventId}/count` |
| **Calendar** | `/api/events` | `GET /{id}/calendar.ics`, `GET /{id}/google-calendar-link` |
| **Check-In** | `/api/checkin` | `POST /{ticketId}`, `GET /validate/{ticketId}` |
| **Images** | `/api/images` | `POST /upload`, `GET /{filename}`, `DELETE /{filename}` |
| **Admin** | `/api/admin` | `GET /dashboard`, `GET /analytics/revenue`, `GET /analytics/bookings`, `GET /statistics/users`, `GET /statistics/events`, `GET /reports` |
| **Users** | `/api/users` | `GET /me`, `PUT /me`, `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` |

> For complete request/response schemas, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 📚 Project Documentation

| Document | Description |
|---|---|
| [README.md](README.md) | Project overview and setup guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design decisions |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete REST API reference |
| [DATABASE.md](DATABASE.md) | Database schema and entity relationships |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment guide for production |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](SECURITY.md) | Security policies and implementation |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Complete project file structure |

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) guide before submitting a pull request.

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/kritagya025">Kritagya</a>
</p>
