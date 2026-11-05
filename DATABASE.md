# Database Schema and Persistence Reference

This document provides a technical specification of the database architecture, table definitions, relational constraints, indexing strategies, and concurrency controls implemented in the Event Booking System.

---

## Table of Contents

- [Overview](#overview)
- [Datasource Configuration](#datasource-configuration)
- [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Table Definitions](#table-definitions)
- [Indexes and Optimization](#indexes-and-optimization)
- [Enumerated Types](#enumerated-types)
- [Audit and Lifecycle Tracking](#audit-and-lifecycle-tracking)
- [Concurrency Management](#concurrency-management)
- [Data Initialization](#data-initialization)

---

## Overview

| Configuration Parameter | Specification |
|---|---|
| Database Engine | PostgreSQL 16+ |
| Object-Relational Mapping | Spring Data JPA / Hibernate Core 6 |
| Schema Management | `spring.jpa.hibernate.ddl-auto=update` (Dev) / `validate` (Prod) |
| SQL Dialect | `org.hibernate.dialect.PostgreSQLDialect` |
| Auditing Framework | Spring Data JPA Auditing (`AuditingEntityListener`) |
| Concurrency Strategy | Optimistic locking via `@Version` columns |

---

## Datasource Configuration

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/event_booking_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:kritagya}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
```

---

## Entity-Relationship Diagram

```
+----------------+       +----------------+       +----------------+
|    app_user    |       |     venue      |       |     coupon     |
|----------------|       |----------------|       |----------------|
| id (PK)        |       | id (PK)        |       | id (PK)        |
| first_name     |       | name           |       | code (UQ)      |
| last_name      |       | address        |       | discount_type  |
| email (UQ)     |       | capacity       |       | discount_val   |
| password       |       | description    |       | expiry_date    |
| phone          |       | audit fields   |       | usage_limit    |
| role           |       +-------+--------+       | used_count     |
| email_verified |               |                | min_amount     |
| audit fields   |               | 1              | active         |
+-------+--------+               |                +----------------+
        |                        |
        | 1                      | N
        |                +-------v--------+
        |                |     event      |
        |                |----------------|
        |                | id (PK)        |
        |                | name           |
        |                | event_date     |
        |                | ticket_price   |
        |                | available_seats|
        |                | status         |
        |                | version        |
        |                | venue_id (FK)  |
        |                | organizer_id(FK|
        |                | audit fields   |
        |                +-------+--------+
        |                        |
        | 1                      | 1
        |                        |
        | N                      | N
+-------v--------+       +-------v--------+
|    booking     |       |      seat      |
|----------------|       |----------------|
| id (PK)        |       | id (PK)        |
| booking_date   |       | seat_number    |
| booking_status |       | row_number     |
| quantity       |       | seat_type      |
| total_amount   |       | status         |
| version        |       | locked_until   |
| user_id (FK)   |       | version        |
| event_id (FK)  |       | venue_id (FK)  |
+-------+--------+       | event_id (FK)  |
        |                +----------------+
        | 1                      |
        |                        |
        | N (via join table)     |
+-------v------------------------v--------+
|             booking_seats               |
|-----------------------------------------|
| booking_id (FK)                         |
| seat_id (FK)                            |
+-----------------------------------------+
        |
        +-------------------+
        | 1                 | 1
        |                   |
        | 1                 | N
+-------v--------+  +-------v--------+
|    payment     |  |     ticket     |
|----------------|  |----------------|
| id (PK)        |  | id (PK)        |
| amount         |  | qr_code (UQ)   |
| payment_method |  | issue_date     |
| payment_status |  | check_in_time  |
| transaction_id |  | ticket_status  |
| booking_id(FK) |  | booking_id(FK) |
+----------------+  +----------------+
```

---

## Table Definitions

### `app_user`
Stores account identities, authorization roles, and credential verification tokens.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Internal user identifier |
| `first_name` | `VARCHAR(255)` | Yes | None | Given name |
| `last_name` | `VARCHAR(255)` | Yes | None | Family name |
| `email` | `VARCHAR(255)` | No | Unique Index | Authentication identifier |
| `password` | `VARCHAR(255)` | Yes | None | BCrypt password hash |
| `phone` | `VARCHAR(255)` | Yes | None | Primary contact number |
| `role` | `VARCHAR(255)` | Yes | None | Enum: `ADMIN`, `ORGANIZER`, `CUSTOMER` |
| `email_verified` | `BOOLEAN` | Yes | Default: `false` | Verification state |
| `email_verification_token` | `VARCHAR(255)` | Yes | Unique | Activation token |
| `password_reset_token` | `VARCHAR(255)` | Yes | None | Password reset token |
| `password_reset_token_expiry`| `TIMESTAMP` | Yes | None | Reset token expiration time |
| `created_at` | `TIMESTAMP` | No | Immutable | Audit creation timestamp |
| `updated_at` | `TIMESTAMP` | Yes | None | Audit modification timestamp |
| `created_by` | `VARCHAR(255)` | Yes | None | Audit creator principal |
| `updated_by` | `VARCHAR(255)` | Yes | None | Audit modifier principal |

### `event`
Maintains event schedules, ticket pricing, publication states, and venue bindings.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Internal event identifier |
| `name` | `VARCHAR(255)` | Yes | None | Display title |
| `description` | `TEXT` | Yes | None | Comprehensive event overview |
| `event_date` | `DATE` | Yes | B-tree Index | Scheduled event date |
| `start_time` | `TIME` | Yes | None | Session start time |
| `end_time` | `TIME` | Yes | None | Session conclusion time |
| `category` | `VARCHAR(255)` | Yes | B-tree Index | Event genre/category |
| `status` | `VARCHAR(255)` | Yes | B-tree Index | Enum: `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED` |
| `ticket_price` | `DECIMAL` | Yes | None | Base admission fee |
| `currency` | `VARCHAR(255)` | Yes | None | ISO currency code (default: USD) |
| `available_seats` | `INTEGER` | Yes | None | Remaining unbooked seats |
| `registration_deadline` | `DATE` | Yes | None | Registration cutoff date |
| `deleted` | `BOOLEAN` | Yes | Default: `false` | Soft-deletion flag |
| `view_count` | `BIGINT` | Yes | Default: `0` | Cumulative profile views |
| `banner_image_url` | `VARCHAR(255)` | Yes | None | Relative banner image URI |
| `version` | `BIGINT` | Yes | None | Optimistic locking version |
| `venue_id` | `BIGINT` | Yes | Foreign Key -> `venue.id` | Host venue association |
| `organizer_id` | `BIGINT` | Yes | Foreign Key -> `app_user.id` | Assigned organizer account |
| Audit Fields | Multiple | — | — | Standard `BaseEntity` columns |

### `venue`
Physical sites and physical capacities.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Venue identifier |
| `name` | `VARCHAR(255)` | Yes | None | Venue facility name |
| `address` | `VARCHAR(255)` | Yes | None | Physical location address |
| `capacity` | `INTEGER` | Yes | None | Maximum legal occupancy |
| `description` | `VARCHAR(255)` | Yes | None | Facility overview |
| Audit Fields | Multiple | — | — | Standard `BaseEntity` columns |

### `seat`
Individual bookable seating positions with temporary lock support.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Seat identifier |
| `seat_number` | `VARCHAR(255)` | Yes | None | Column or chair designator (e.g., "12") |
| `row_number` | `VARCHAR(255)` | Yes | None | Row designator (e.g., "B") |
| `seat_type` | `VARCHAR(255)` | Yes | None | Enum: `REGULAR`, `VIP`, `PREMIUM` |
| `status` | `VARCHAR(255)` | Yes | None | Enum: `AVAILABLE`, `BOOKED`, `LOCKED` |
| `locked_until` | `TIMESTAMP` | Yes | None | Temporary lock expiration timestamp |
| `version` | `BIGINT` | Yes | None | Optimistic locking version |
| `venue_id` | `BIGINT` | Yes | Foreign Key -> `venue.id` | Parent venue |
| `event_id` | `BIGINT` | Yes | Foreign Key -> `event.id` | Optional event binding |

### `booking`
Reservation records linking users, events, and seat allocations.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Booking identifier |
| `booking_date` | `TIMESTAMP` | Yes | None | Reservation timestamp |
| `booking_status` | `VARCHAR(255)` | Yes | None | Enum: `PENDING`, `CONFIRMED`, `CANCELLED` |
| `quantity` | `INTEGER` | Yes | None | Reserved seat count |
| `total_amount` | `DECIMAL` | Yes | None | Net cost after discount applied |
| `version` | `BIGINT` | Yes | None | Optimistic locking version |
| `user_id` | `BIGINT` | Yes | Foreign Key -> `app_user.id` | Reservation owner |
| `event_id` | `BIGINT` | Yes | Foreign Key -> `event.id` | Reserved event |
| Audit Fields | Multiple | — | — | Standard `BaseEntity` columns |

### `booking_seats`
Join table establishing the many-to-many relationship between bookings and seats.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `booking_id` | `BIGINT` | No | Foreign Key -> `booking.id` | Parent booking identifier |
| `seat_id` | `BIGINT` | No | Foreign Key -> `seat.id` | Reserved seat identifier |

### `ticket`
Individual attendee admission units carrying unique verification tokens.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Ticket identifier |
| `qr_code` | `VARCHAR(255)` | Yes | Unique Index | Verification token payload |
| `issue_date` | `TIMESTAMP` | Yes | None | Generation timestamp |
| `check_in_time` | `TIMESTAMP` | Yes | None | Gate check-in timestamp |
| `ticket_status` | `VARCHAR(255)` | Yes | None | Enum: `ACTIVE`, `USED`, `CANCELLED` |
| `booking_id` | `BIGINT` | Yes | Foreign Key -> `booking.id` | Associated booking |
| Audit Fields | Multiple | — | — | Standard `BaseEntity` columns |

### `payment`
Transactional settlement records linked 1:1 with bookings.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Payment identifier |
| `amount` | `DECIMAL` | Yes | None | Transaction settlement amount |
| `payment_method` | `VARCHAR(255)` | Yes | None | Enum: `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING` |
| `payment_status` | `VARCHAR(255)` | Yes | None | Enum: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |
| `transaction_id` | `VARCHAR(255)` | Yes | None | External settlement reference |
| `booking_id` | `BIGINT` | Yes | Foreign Key -> `booking.id`, Unique | Associated booking |
| Audit Fields | Multiple | — | — | Standard `BaseEntity` columns |

### `review`
Customer event feedback and star ratings.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Review identifier |
| `rating` | `INTEGER` | No | Range: 1 to 5 | Quantitative rating |
| `comment` | `VARCHAR(1000)` | No | Max: 1000 chars | Customer comment |
| `user_id` | `BIGINT` | No | Foreign Key -> `app_user.id` | Reviewer identity |
| `event_id` | `BIGINT` | No | Foreign Key -> `event.id` | Evaluated event |
| Audit Fields | Multiple | — | — | Standard `BaseEntity` columns |

Unique Constraint: `(user_id, event_id)` prevents duplicate reviews for the same event by the same user.

### `coupon`
Promotional codes and discount rules.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Coupon identifier |
| `code` | `VARCHAR(255)` | No | Unique Index | Promotional alphanumeric code |
| `discount_type` | `VARCHAR(255)` | No | None | Enum: `PERCENTAGE`, `FIXED`, `EARLY_BIRD` |
| `discount_value` | `DECIMAL` | No | None | Value applied according to discount type |
| `expiry_date` | `DATE` | Yes | None | Last valid calendar day |
| `usage_limit` | `INTEGER` | Yes | None | Maximum permitted redemptions |
| `used_count` | `INTEGER` | Yes | Default: `0` | Current redemptions |
| `min_booking_amount`| `DECIMAL` | Yes | Default: `0` | Threshold cart amount required |
| `active` | `BOOLEAN` | Yes | Default: `true` | Promotional state |
| Audit Fields | Multiple | — | — | Standard `BaseEntity` columns |

### `wishlist`
Personal event collections for authenticated accounts.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Record identifier |
| `user_id` | `BIGINT` | No | Foreign Key -> `app_user.id` | Account reference |
| `event_id` | `BIGINT` | No | Foreign Key -> `event.id` | Event reference |

Unique Constraint: `(user_id, event_id)` prevents duplicate bookmarks.

### `waitlist`
Queue for sold-out event reservations.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Record identifier |
| `user_id` | `BIGINT` | No | Foreign Key -> `app_user.id` | Account reference |
| `event_id` | `BIGINT` | No | Foreign Key -> `event.id` | Event reference |
| `status` | `VARCHAR(255)` | No | Default: `WAITING` | Enum: `WAITING`, `NOTIFIED`, `PROMOTED`, `CANCELLED` |

Unique Constraint: `(user_id, event_id)` prevents duplicate queue entries.

### `refresh_token`
Cryptographic refresh tokens enabling stateless JWT rotation.

| Column | Data Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| `id` | `BIGINT` | No | Primary Key, Auto-increment | Record identifier |
| `token` | `VARCHAR(255)` | No | Unique Index | Opaque token identifier |
| `expiry_date` | `TIMESTAMP` | No | None | Token expiration point |
| `revoked` | `BOOLEAN` | Yes | Default: `false` | Revocation flag |
| `user_id` | `BIGINT` | No | Foreign Key -> `app_user.id` | Owning account |

---

## Indexes and Optimization

The database declares indexes to optimize frequently filtered and joined columns:

| Table | Index Identifier | Indexed Columns | Structure | Technical Justification |
|---|---|---|---|---|
| `app_user` | `idx_user_email` | `email` | B-tree (Unique) | Accelerates user lookup during login and token validation |
| `event` | `idx_event_date` | `event_date` | B-tree | Optimizes calendar searches and temporal range filtering |
| `event` | `idx_event_category` | `category` | B-tree | Accelerates category navigation |
| `event` | `idx_event_status` | `status` | B-tree | Filters draft versus published events |
| `booking` | `idx_booking_user` | `user_id` | B-tree | Speeds up account booking history retrievals |
| `booking` | `idx_booking_event` | `event_id` | B-tree | Accelerates organizer reservation lookups |
| `seat` | `idx_seat_venue_status` | `venue_id, status` | Composite B-tree | Provides instant resolution of available seats per venue |
| `seat` | `idx_seat_event` | `event_id` | B-tree | Speeds up event seat map resolution |
| `ticket` | `idx_ticket_qrcode` | `qr_code` | B-tree (Unique) | Guarantees O(1) gate check-in lookups |
| `review` | `idx_review_event` | `event_id` | B-tree | Resolves public reviews for event detail views |
| `review` | `idx_review_user_event` | `user_id, event_id` | Composite Unique | Guarantees single-review integrity per customer |
| `coupon` | `idx_coupon_code` | `code` | B-tree (Unique) | Ensures fast code validation during checkout |
| `wishlist` | `idx_wishlist_user` | `user_id` | B-tree | Loads customer wishlist |
| `wishlist` | `idx_wishlist_user_event` | `user_id, event_id` | Composite Unique | Enforces single-bookmark integrity |
| `waitlist` | `idx_waitlist_event` | `event_id` | B-tree | Resolves queue depth for sold-out events |
| `waitlist` | `idx_waitlist_user_event` | `user_id, event_id` | Composite Unique | Enforces single-waitlist integrity |
| `refresh_token`| `idx_refresh_token` | `token` | B-tree (Unique) | Provides O(1) token validation on session rotation |

---

## Enumerated Types

### `Role`
- `ADMIN`: Global administration privileges.
- `ORGANIZER`: Venue and event management privileges.
- `CUSTOMER`: Standard consumer reservation privileges.

### `EventStatus`
- `DRAFT`: Newly initialized event; hidden from public listings.
- `PUBLISHED`: Active, searchable, and open for reservation.
- `CANCELLED`: Withdrawn by organizer; reservations refunded.
- `COMPLETED`: Event concluded.

### `BookingStatus`
- `PENDING`: Reservation recorded; awaiting payment settlement.
- `CONFIRMED`: Payment cleared; seats committed and tickets generated.
- `CANCELLED`: Transaction aborted; seats released back to pool.

### `PaymentMethod`
- `CREDIT_CARD`: Major credit card networks.
- `DEBIT_CARD`: Bank-issued debit cards.
- `UPI`: Unified Payments Interface rail.
- `NET_BANKING`: Direct internet banking transfer.

### `PaymentStatus`
- `PENDING`: Processing payment intent.
- `COMPLETED`: Funds successfully captured.
- `FAILED`: Settlement rejected by gateway.
- `REFUNDED`: Reversal completed.

### `SeatType`
- `REGULAR`: Standard tier seating.
- `VIP`: Front-row, premium view, or expedited entrance tier.
- `PREMIUM`: Elevated comfort or preferred location tier.

### `SeatStatus`
- `AVAILABLE`: Open for customer selection and temporary locking.
- `LOCKED`: Temporarily held in checkout; cannot be booked by others.
- `BOOKED`: Confirmed reservation; unavailable.

### `TicketStatus`
- `ACTIVE`: Valid admission pass awaiting check-in.
- `USED`: Ticket scanned and admitted at gate.
- `CANCELLED`: Voided through booking refund.

### `DiscountType`
- `PERCENTAGE`: Proportional cart deduction.
- `FIXED`: Absolute monetary deduction.
- `EARLY_BIRD`: Tiered reduction based on early reservation timing.

### `WaitlistStatus`
- `WAITING`: Enrolled in queue.
- `NOTIFIED`: Notified of newly opened capacity.
- `PROMOTED`: Converted to reservation.
- `CANCELLED`: Withdrawn from queue.

---

## Audit and Lifecycle Tracking

All persistent entities inherit from `BaseEntity`:

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}
```

The `AuditorAware` bean resolves current authenticated user emails from Spring Security's `SecurityContextHolder` or falls back to `"SYSTEM"` for automated schedulers.

---

## Concurrency Management

High-demand ticket reservation introduces race condition vulnerability. The platform prevents over-allocation using optimistic concurrency control:

1. `Booking`, `Event`, and `Seat` declare an `@Version private Long version;` field.
2. During reservation submission, Hibernate appends `WHERE id = ? AND version = ?` to update statements.
3. If a conflicting transaction commits an update beforehand, Hibernate throws `OptimisticLockException`.
4. `GlobalExceptionHandler` intercepts the conflict and responds with `HTTP 409 Conflict`, prompting the client to retry with updated seat state.

---

## Data Initialization

When launched under the `dev` profile with `app.seed-data=true`, `DataInitializerRunner` executes the following sequence:

1. Creates default users (`admin@eventhub.com`, `customer@eventhub.com`).
2. Populates 15 global venues across North America, Europe, Asia, and Australia.
3. Provisions 4 seed events with configured pricing, descriptions, and venue mappings.
4. Auto-generates seat matrices for primary event venues with VIP front-row assignments.
