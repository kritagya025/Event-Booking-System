# 🗄️ Database Documentation — Event Booking System

This document describes the complete database schema, entity relationships, indexing strategy, and audit conventions used in the Event Booking System.

---

## Table of Contents

- [Overview](#overview)
- [Database Configuration](#database-configuration)
- [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Table Definitions](#table-definitions)
- [Indexes](#indexes)
- [Enums](#enums)
- [Audit Fields](#audit-fields)
- [Concurrency Control](#concurrency-control)
- [Seed Data](#seed-data)

---

## Overview

| Property | Value |
|---|---|
| **Database** | PostgreSQL 16+ |
| **ORM** | Spring Data JPA / Hibernate |
| **Schema Management** | `spring.jpa.hibernate.ddl-auto=update` (auto-migration) |
| **Dialect** | `org.hibernate.dialect.PostgreSQLDialect` |
| **Auditing** | Spring Data JPA Auditing (`@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`) |
| **Concurrency** | Optimistic locking via `@Version` on `Booking`, `Event`, `Seat` |

---

## Database Configuration

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/event_booking_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:kritagya}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

---

## Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   app_user   │       │    venue     │       │    coupon    │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ first_name   │       │ name         │       │ code (UQ)    │
│ last_name    │       │ address      │       │ discount_type│
│ email (UQ)   │       │ capacity     │       │ discount_val │
│ password     │       │ description  │       │ expiry_date  │
│ phone        │       │ audit fields │       │ usage_limit  │
│ role         │       └──────┬───────┘       │ used_count   │
│ email_verified│              │               │ min_amount   │
│ verification_│              │               │ active       │
│   token (UQ) │              │               │ audit fields │
│ reset_token  │     ┌────────▼────────┐      └──────────────┘
│ reset_expiry │     │     event      │
│ audit fields │     │────────────────│
└──────┬───────┘     │ id (PK)        │
       │             │ name           │
       │             │ description    │
       │             │ event_date     │
       │             │ start_time     │
       │             │ end_time       │
       │             │ category       │
       │             │ status         │
       │             │ ticket_price   │
       │             │ currency       │
       │             │ available_seats│
       │             │ reg_deadline   │
       │             │ deleted        │
       │             │ view_count     │
       │             │ banner_url     │
       │             │ version        │
       │             │ venue_id (FK)  │
       │             │ organizer_id(FK)│
       │             │ audit fields   │
       │             └──────┬─────────┘
       │                    │
  ┌────▼────────────────────▼──────┐
  │           booking              │
  │────────────────────────────────│
  │ id (PK)                        │
  │ booking_date                   │
  │ booking_status                 │
  │ quantity                       │
  │ total_amount                   │
  │ version                        │
  │ user_id (FK → app_user)        │
  │ event_id (FK → event)          │
  │ audit fields                   │
  └─────┬────────────┬─────────────┘
        │            │
        │     ┌──────▼────────┐
        │     │ booking_seats │ (Join Table)
        │     │───────────────│
        │     │ booking_id(FK)│
        │     │ seat_id (FK)  │
        │     └───────────────┘
        │
  ┌─────▼─────────┐     ┌──────────────┐
  │    ticket     │     │   payment    │
  │───────────────│     │──────────────│
  │ id (PK)       │     │ id (PK)      │
  │ qr_code (UQ)  │     │ amount       │
  │ issue_date    │     │ payment_     │
  │ check_in_time │     │   method     │
  │ ticket_status │     │ payment_     │
  │ booking_id(FK)│     │   status     │
  │ audit fields  │     │ transaction_ │
  └───────────────┘     │   id         │
                        │ booking_id(FK)│
                        │ audit fields │
                        └──────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │    seat      │     │   review     │     │  wishlist    │
  │──────────────│     │──────────────│     │──────────────│
  │ id (PK)      │     │ id (PK)      │     │ id (PK)      │
  │ seat_number  │     │ rating       │     │ user_id (FK) │
  │ row_number   │     │ comment      │     │ event_id(FK) │
  │ seat_type    │     │ user_id (FK) │     │ audit fields │
  │ status       │     │ event_id(FK) │     └──────────────┘
  │ locked_until │     │ audit fields │
  │ version      │     └──────────────┘     ┌──────────────┐
  │ venue_id(FK) │                          │  waitlist    │
  │ event_id(FK) │     ┌──────────────┐     │──────────────│
  │ audit fields │     │refresh_token │     │ id (PK)      │
  └──────────────┘     │──────────────│     │ user_id (FK) │
                       │ id (PK)      │     │ event_id(FK) │
                       │ token (UQ)   │     │ status       │
                       │ expiry_date  │     │ audit fields │
                       │ revoked      │     └──────────────┘
                       │ user_id (FK) │
                       │ audit fields │
                       └──────────────┘
```

---

## Table Definitions

### `app_user`

User accounts for all roles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | User ID |
| `first_name` | `VARCHAR(255)` | — | First name |
| `last_name` | `VARCHAR(255)` | — | Last name |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Login email |
| `password` | `VARCHAR(255)` | — | BCrypt hashed password |
| `phone` | `VARCHAR(255)` | — | Phone number |
| `role` | `VARCHAR(255)` | — | `ADMIN`, `ORGANIZER`, `CUSTOMER` |
| `email_verified` | `BOOLEAN` | DEFAULT `false` | Email verification status |
| `email_verification_token` | `VARCHAR(255)` | UNIQUE | Verification token |
| `password_reset_token` | `VARCHAR(255)` | — | Password reset token |
| `password_reset_token_expiry` | `TIMESTAMP` | — | Reset token expiry |
| `created_at` | `TIMESTAMP` | NOT NULL, immutable | Audit: creation time |
| `updated_at` | `TIMESTAMP` | — | Audit: last modified |
| `created_by` | `VARCHAR(255)` | immutable | Audit: creator |
| `updated_by` | `VARCHAR(255)` | — | Audit: last modifier |

### `event`

Events with lifecycle management.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Event ID |
| `name` | `VARCHAR(255)` | — | Event name |
| `description` | `TEXT` | — | Event description |
| `event_date` | `DATE` | — | Date of event |
| `start_time` | `TIME` | — | Start time |
| `end_time` | `TIME` | — | End time |
| `category` | `VARCHAR(255)` | — | Category (MUSIC, TECH, etc.) |
| `status` | `VARCHAR(255)` | — | `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED` |
| `ticket_price` | `DECIMAL` | — | Base ticket price |
| `currency` | `VARCHAR(255)` | — | Currency code |
| `available_seats` | `INTEGER` | — | Remaining available seats |
| `registration_deadline` | `DATE` | — | Last date to register |
| `deleted` | `BOOLEAN` | DEFAULT `false` | Soft delete flag |
| `view_count` | `BIGINT` | DEFAULT `0` | Page view counter |
| `banner_image_url` | `VARCHAR(255)` | — | Banner image URL/path |
| `version` | `BIGINT` | — | Optimistic lock version |
| `venue_id` | `BIGINT` | FK → `venue.id` | Associated venue |
| `organizer_id` | `BIGINT` | FK → `app_user.id` | Event organizer |
| `created_at` ... | — | — | Audit fields |

### `venue`

Event venues with capacity.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Venue ID |
| `name` | `VARCHAR(255)` | — | Venue name |
| `address` | `VARCHAR(255)` | — | Full address |
| `capacity` | `INTEGER` | — | Maximum capacity |
| `description` | `VARCHAR(255)` | — | Venue description |

### `seat`

Individual seats within venues.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Seat ID |
| `seat_number` | `VARCHAR(255)` | — | Seat identifier (e.g., "A1") |
| `row_number` | `VARCHAR(255)` | — | Row identifier (e.g., "A") |
| `seat_type` | `VARCHAR(255)` | — | `REGULAR`, `VIP`, `PREMIUM` |
| `status` | `VARCHAR(255)` | — | `AVAILABLE`, `BOOKED`, `LOCKED` |
| `locked_until` | `TIMESTAMP` | — | Lock expiry time |
| `version` | `BIGINT` | — | Optimistic lock version |
| `venue_id` | `BIGINT` | FK → `venue.id` | Parent venue |
| `event_id` | `BIGINT` | FK → `event.id` | Associated event (nullable) |

### `booking`

Booking records linking users to events.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Booking ID |
| `booking_date` | `TIMESTAMP` | — | Booking timestamp |
| `booking_status` | `VARCHAR(255)` | — | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `quantity` | `INTEGER` | — | Number of seats booked |
| `total_amount` | `DECIMAL` | — | Total booking amount |
| `version` | `BIGINT` | — | Optimistic lock version |
| `user_id` | `BIGINT` | FK → `app_user.id` | Booking user |
| `event_id` | `BIGINT` | FK → `event.id` | Booked event |

### `booking_seats` (Join Table)

Many-to-many relationship between bookings and seats.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `booking_id` | `BIGINT` | FK → `booking.id` | Booking reference |
| `seat_id` | `BIGINT` | FK → `seat.id` | Seat reference |

### `ticket`

E-tickets with QR codes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Ticket ID |
| `qr_code` | `VARCHAR(255)` | UNIQUE | Unique QR code string |
| `issue_date` | `TIMESTAMP` | — | Ticket issue date |
| `check_in_time` | `TIMESTAMP` | — | When ticket was used |
| `ticket_status` | `VARCHAR(255)` | — | `ACTIVE`, `USED`, `CANCELLED` |
| `booking_id` | `BIGINT` | FK → `booking.id` | Parent booking |

### `payment`

Payment records (1:1 with booking).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Payment ID |
| `amount` | `DECIMAL` | — | Payment amount |
| `payment_method` | `VARCHAR(255)` | — | `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING` |
| `payment_status` | `VARCHAR(255)` | — | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |
| `transaction_id` | `VARCHAR(255)` | — | Transaction reference |
| `booking_id` | `BIGINT` | FK → `booking.id`, UNIQUE | Associated booking |

### `review`

Event reviews and ratings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Review ID |
| `rating` | `INTEGER` | NOT NULL, 1-5 | Star rating |
| `comment` | `VARCHAR(1000)` | NOT BLANK | Review text |
| `user_id` | `BIGINT` | FK → `app_user.id`, NOT NULL | Reviewer |
| `event_id` | `BIGINT` | FK → `event.id`, NOT NULL | Reviewed event |

### `coupon`

Discount coupons.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Coupon ID |
| `code` | `VARCHAR(255)` | UNIQUE, NOT NULL | Coupon code |
| `discount_type` | `VARCHAR(255)` | NOT NULL | `PERCENTAGE`, `FIXED`, `EARLY_BIRD` |
| `discount_value` | `DECIMAL` | NOT NULL | Discount amount/percentage |
| `expiry_date` | `DATE` | — | Coupon expiry |
| `usage_limit` | `INTEGER` | — | Max usage count |
| `used_count` | `INTEGER` | DEFAULT `0` | Current usage |
| `min_booking_amount` | `DECIMAL` | DEFAULT `0` | Minimum booking amount |
| `active` | `BOOLEAN` | DEFAULT `true` | Active flag |

### `wishlist`

User's saved events.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Wishlist entry ID |
| `user_id` | `BIGINT` | FK → `app_user.id`, NOT NULL | User |
| `event_id` | `BIGINT` | FK → `event.id`, NOT NULL | Event |

### `waitlist`

Users waiting for event availability.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Waitlist entry ID |
| `user_id` | `BIGINT` | FK → `app_user.id`, NOT NULL | User |
| `event_id` | `BIGINT` | FK → `event.id`, NOT NULL | Event |
| `status` | `VARCHAR(255)` | NOT NULL, DEFAULT `WAITING` | `WAITING`, `NOTIFIED`, `PROMOTED`, `CANCELLED` |

### `refresh_token`

JWT refresh tokens.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Token ID |
| `token` | `VARCHAR(255)` | UNIQUE, NOT NULL | UUID token string |
| `expiry_date` | `TIMESTAMP` | NOT NULL | Expiration time |
| `revoked` | `BOOLEAN` | DEFAULT `false` | Revocation flag |
| `user_id` | `BIGINT` | FK → `app_user.id`, NOT NULL | Token owner |

---

## Indexes

| Table | Index Name | Columns | Type | Purpose |
|---|---|---|---|---|
| `app_user` | `idx_user_email` | `email` | B-tree | Fast login lookup |
| `event` | `idx_event_date` | `event_date` | B-tree | Date range queries |
| `event` | `idx_event_category` | `category` | B-tree | Category filtering |
| `event` | `idx_event_status` | `status` | B-tree | Status filtering |
| `booking` | `idx_booking_user` | `user_id` | B-tree | User's bookings |
| `booking` | `idx_booking_event` | `event_id` | B-tree | Event's bookings |
| `seat` | `idx_seat_venue_status` | `venue_id, status` | Composite | Available seats by venue |
| `seat` | `idx_seat_event` | `event_id` | B-tree | Event's seats |
| `ticket` | `idx_ticket_qrcode` | `qr_code` | Unique | QR code validation |
| `review` | `idx_review_event` | `event_id` | B-tree | Event reviews |
| `review` | `idx_review_user_event` | `user_id, event_id` | Unique | One review per user/event |
| `coupon` | `idx_coupon_code` | `code` | Unique | Coupon lookup |
| `wishlist` | `idx_wishlist_user` | `user_id` | B-tree | User's wishlist |
| `wishlist` | `idx_wishlist_user_event` | `user_id, event_id` | Unique | Prevent duplicates |
| `waitlist` | `idx_waitlist_event` | `event_id` | B-tree | Event waitlist |
| `waitlist` | `idx_waitlist_user_event` | `user_id, event_id` | Unique | Prevent duplicates |
| `refresh_token` | `idx_refresh_token` | `token` | Unique | Token lookup |

---

## Enums

### Role
| Value | Description |
|---|---|
| `ADMIN` | System administrator |
| `ORGANIZER` | Event organizer |
| `CUSTOMER` | Regular customer |

### EventStatus
| Value | Description |
|---|---|
| `DRAFT` | Not yet published |
| `PUBLISHED` | Live and bookable |
| `CANCELLED` | Event cancelled |
| `COMPLETED` | Event finished |

### BookingStatus
| Value | Description |
|---|---|
| `PENDING` | Awaiting payment |
| `CONFIRMED` | Payment completed |
| `CANCELLED` | Booking cancelled |

### PaymentMethod
| Value | Description |
|---|---|
| `CREDIT_CARD` | Credit card |
| `DEBIT_CARD` | Debit card |
| `UPI` | Unified Payments Interface |
| `NET_BANKING` | Internet banking |

### PaymentStatus
| Value | Description |
|---|---|
| `PENDING` | Not yet processed |
| `COMPLETED` | Successfully processed |
| `FAILED` | Payment failed |
| `REFUNDED` | Payment refunded |

### SeatType
| Value | Description |
|---|---|
| `REGULAR` | Standard seat |
| `VIP` | VIP seat |
| `PREMIUM` | Premium seat |

### SeatStatus
| Value | Description |
|---|---|
| `AVAILABLE` | Open for booking |
| `BOOKED` | Reserved by a booking |
| `LOCKED` | Temporarily locked |

### TicketStatus
| Value | Description |
|---|---|
| `ACTIVE` | Valid for entry |
| `USED` | Already checked in |
| `CANCELLED` | Ticket cancelled |

### DiscountType
| Value | Description |
|---|---|
| `PERCENTAGE` | Percentage discount |
| `FIXED` | Fixed amount discount |
| `EARLY_BIRD` | Early registration discount |

### WaitlistStatus
| Value | Description |
|---|---|
| `WAITING` | In queue |
| `NOTIFIED` | Availability notification sent |
| `PROMOTED` | Promoted to booking |
| `CANCELLED` | Left waitlist |

---

## Audit Fields

All entities extend `BaseEntity` which provides:

| Field | Annotation | Behavior |
|---|---|---|
| `createdAt` | `@CreatedDate` | Auto-set on INSERT, immutable |
| `updatedAt` | `@LastModifiedDate` | Auto-set on UPDATE |
| `createdBy` | `@CreatedBy` | Set to authenticated user's email or `SYSTEM` |
| `updatedBy` | `@LastModifiedBy` | Set to authenticated user's email or `SYSTEM` |

Auditing is enabled via `JpaAuditingConfig` with `@EnableJpaAuditing`.

---

## Concurrency Control

**Optimistic Locking** is implemented on high-contention entities:

| Entity | `@Version` Field | Protection Against |
|---|---|---|
| `Event` | `version` | Concurrent event updates, race conditions on `availableSeats` |
| `Booking` | `version` | Concurrent booking modifications |
| `Seat` | `version` | Double-booking the same seat |

When a concurrent modification is detected, Hibernate throws `ObjectOptimisticLockingFailureException`, which is caught by `GlobalExceptionHandler` and returned as HTTP `409 Conflict`.

---

## Seed Data

On application startup, `DataInitializerRunner` ensures consistent demo data:

### Venues (15 total)
Across USA, India, UK, Europe, Australia, and Asia including Metro Arena Center, Silicon Valley Convention Center, Royal Opera House, Jio World Centre, Wembley Stadium, Sydney Opera House, Tokyo Dome, and more.

### Events (4 primary)
1. Neon Horizon Cyber Music Festival 2026 (MUSIC)
2. Global AI & Autonomous Tech Summit 2026 (TECH)
3. Phantom of the Opera — Broadway Revival (THEATER)
4. Grand Prix eSports World Championship (SPORTS)

### Seats
Auto-seeded per venue with VIP (row A) and REGULAR types, organized in rows of 10.

### Cleanup
Extra/test events and their dependencies (tickets, bookings, wishlists, waitlists, reviews) are automatically purged on startup to maintain a clean demo state.
