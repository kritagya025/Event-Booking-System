# REST API Reference

Comprehensive reference for the Event Booking System RESTful application programming interface.

- **Base URL**: `http://localhost:8080`
- **Interactive Documentation**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema (JSON)**: `http://localhost:8080/api-docs`
- **Authentication**: JWT Bearer Token via HTTP header `Authorization: Bearer <token>` or secure HttpOnly cookie.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Events](#2-events)
3. [Bookings](#3-bookings)
4. [Payments](#4-payments)
5. [Tickets](#5-tickets)
6. [Venues](#6-venues)
7. [Seats](#7-seats)
8. [Reviews](#8-reviews)
9. [Coupons](#9-coupons)
10. [Wishlist](#10-wishlist)
11. [Waitlist](#11-waitlist)
12. [Calendar Integration](#12-calendar-integration)
13. [Check-In](#13-check-in)
14. [Images](#14-images)
15. [Administration](#15-administration)
16. [Users](#16-users)
17. [Standard Error Responses](#17-standard-error-responses)

---

## 1. Authentication

Base Path: `/api/auth`  
Access: Public unless otherwise indicated.

### POST `/api/auth/register`
Creates a new customer or organizer account.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

| Parameter | Type | Required | Validation |
|---|---|---|---|
| `firstName` | String | Yes | `@NotBlank` |
| `lastName` | String | No | None |
| `email` | String | Yes | `@Email`, `@NotBlank` |
| `password` | String | Yes | `@NotBlank`, `@Size(min=6)` |
| `phone` | String | No | None |
| `role` | String | No | Enum: `ADMIN`, `ORGANIZER`, `CUSTOMER`. Defaults to `CUSTOMER`. |

**Response**: `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "4df1fc15-7756-42bb-92e1-7caee2759976",
  "email": "john.doe@example.com",
  "role": "CUSTOMER",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "CUSTOMER"
  }
}
```

### POST `/api/auth/login`
Authenticates user credentials and issues tokens.

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response**: `200 OK` (Same schema as registration)

### POST `/api/auth/refresh`
Rotates access and refresh tokens. Revokes the supplied refresh token and issues a new pair.

**Request Body**:
```json
{
  "refreshToken": "4df1fc15-7756-42bb-92e1-7caee2759976"
}
```

**Response**: `200 OK` (Same schema as registration)

### POST `/api/auth/logout`
Revokes active refresh tokens for the authenticated user and clears session cookies.

**Request Header**: `Authorization: Bearer <token>`  
**Response**: `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### POST `/api/auth/forgot-password`
Initiates a password reset workflow by dispatching a verification token via email.

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Response**: `200 OK`
```json
{
  "message": "Password reset email sent if account exists"
}
```

### POST `/api/auth/reset-password`
Updates the account password using an emailed reset token.

**Request Body**:
```json
{
  "token": "4df1fc15-7756-42bb-92e1-7caee2759976",
  "newPassword": "NewSecurePassword456"
}
```

**Response**: `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

### GET `/api/auth/verify-email`
Validates an email address via a token link.

**Query Parameters**:
| Parameter | Type | Required | Description |
|---|---|---|---|
| `token` | String | Yes | Verification token string |

**Response**: `200 OK`
```json
{
  "message": "Email verified successfully"
}
```

---

## 2. Events

Base Path: `/api/events`

### GET `/api/events`
Returns a paginated list of published events.  
**Access**: Public.

**Query Parameters**:
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | Integer | `0` | Zero-indexed page number |
| `size` | Integer | `10` | Records per page |
| `sort` | String | `eventDate,asc` | Sort property and direction |

**Response**: `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "name": "Global AI & Autonomous Tech Summit",
      "description": "Annual conference on autonomous intelligence.",
      "eventDate": "2026-10-10",
      "startTime": "09:00",
      "endTime": "18:00",
      "category": "CONFERENCE",
      "status": "PUBLISHED",
      "ticketPrice": 299.00,
      "currency": "USD",
      "availableSeats": 45,
      "registrationDeadline": "2026-10-09T23:59:59",
      "viewCount": 150,
      "bannerImageUrl": "/api/images/summit.jpg",
      "venueId": 2,
      "venueName": "Silicon Valley Convention Center",
      "venueAddress": "100 Innovation Parkway, San Jose, CA, USA",
      "venueCapacity": 5000,
      "organizerName": "Tech Summits LLC",
      "organizerEmail": "organizer@example.com",
      "createdAt": "2026-08-01T10:00:00",
      "updatedAt": "2026-08-01T10:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

### GET `/api/events/search`
Dynamic event search evaluated via JPA Specifications.  
**Access**: Public.

**Query Parameters**:
| Parameter | Type | Description |
|---|---|---|
| `keyword` | String | Case-insensitive tokenized search across name, description, category, and venue |
| `category` | String | Exact category filter |
| `city` | String | Substring match against venue address |
| `dateFrom` | LocalDate | ISO date filter (`YYYY-MM-DD`) |
| `dateTo` | LocalDate | ISO date filter (`YYYY-MM-DD`) |
| `venueId` | Long | Venue identifier |
| `minPrice` | BigDecimal | Minimum price boundary |
| `maxPrice` | BigDecimal | Maximum price boundary |
| `sort` | String | Sort expression (`eventDate,asc`, `ticketPrice,asc`, `ticketPrice,desc`) |

**Response**: `200 OK` (Paginated list of `EventResponseDTO`)

### GET `/api/events/{id}`
Returns full event details by event ID. Increments the event view counter.  
**Access**: Public.

### GET `/api/events/{id}/analytics`
Returns aggregate statistics for an individual event (views, bookings, revenue, attendance).  
**Access**: `ADMIN` or the event's assigned `ORGANIZER`.

### GET `/api/events/popular`
Returns the top 10 published events ordered by view count.  
**Access**: Public.

### GET `/api/events/trending`
Returns the top 10 published events ordered by booking volume over the last 7 days.  
**Access**: Public.

### GET `/api/events/recommendations`
Returns personalized event suggestions based on user booking and wishlist history.  
**Access**: Authenticated.

### GET `/api/events/venue/{venueId}`
Returns all events scheduled at a specific venue.  
**Access**: Public.

### POST `/api/events`
Creates a new event in `DRAFT` status.  
**Access**: `ADMIN` or `ORGANIZER`.

**Request Body**:
```json
{
  "name": "Distributed Systems Colloquium",
  "description": "Deep dive into consensus and fault-tolerant architectures.",
  "eventDate": "2026-11-20",
  "startTime": "10:00",
  "endTime": "17:00",
  "category": "TECHNOLOGY",
  "ticketPrice": 120.00,
  "currency": "USD",
  "availableSeats": 200,
  "registrationDeadline": "2026-11-19T23:59:59",
  "bannerImageUrl": "/api/images/systems.jpg",
  "venueId": 3
}
```

**Response**: `201 Created`

### PUT `/api/events/{id}`
Updates details of an existing event.  
**Access**: `ADMIN` or the owning `ORGANIZER`.

### DELETE `/api/events/{id}`
Soft-deletes an event by setting its `deleted` flag to true.  
**Access**: `ADMIN` or the owning `ORGANIZER`.  
**Response**: `204 No Content`

### PATCH `/api/events/{id}/publish`
Transitions an event status from `DRAFT` to `PUBLISHED`.  
**Access**: `ADMIN` or the owning `ORGANIZER`.

### PATCH `/api/events/{id}/unpublish`
Reverts an event from `PUBLISHED` to `DRAFT`.  
**Access**: `ADMIN` or the owning `ORGANIZER`.

---

## 3. Bookings

Base Path: `/api/bookings`

### POST `/api/bookings`
Creates a ticket reservation and transitions selected seats to `BOOKED`. Enforces optimistic locking.  
**Access**: Authenticated.

**Request Body**:
```json
{
  "eventId": 1,
  "seatIds": [101, 102],
  "couponCode": "SUMMER10"
}
```

**Response**: `201 Created`
```json
{
  "id": 50,
  "bookingDate": "2026-11-05T12:00:00",
  "bookingStatus": "PENDING",
  "totalAmount": 270.00,
  "eventId": 1,
  "eventName": "Global AI & Autonomous Tech Summit",
  "userId": 10,
  "seatIds": [101, 102],
  "seatNumbers": ["A1", "A2"]
}
```

### GET `/api/bookings`
Lists all bookings across the platform.  
**Access**: `ADMIN`.

### GET `/api/bookings/{id}`
Retrieves booking details by booking ID.  
**Access**: `ADMIN`, or the booking owner.

### GET `/api/bookings/user/{userId}`
Retrieves booking history for a specific user.  
**Access**: `ADMIN`, or the target user.

### PATCH `/api/bookings/{id}/cancel`
Cancels a reservation, updates status to `CANCELLED`, restores `Event.availableSeats`, and releases booked seats back to `AVAILABLE`.  
**Access**: `ADMIN`, or the booking owner.

---

## 4. Payments

Base Path: `/api/payments`

### POST `/api/payments`
Processes transaction settlement for a pending booking.  
**Access**: Authenticated.

**Request Body**:
```json
{
  "bookingId": 50,
  "paymentMethod": "CREDIT_CARD"
}
```

| Parameter | Type | Required | Values |
|---|---|---|---|
| `bookingId` | Long | Yes | Must reference a `PENDING` booking |
| `paymentMethod` | String | Yes | `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING` |

**Response**: `201 Created`
```json
{
  "id": 100,
  "amount": 270.00,
  "paymentMethod": "CREDIT_CARD",
  "paymentStatus": "COMPLETED",
  "transactionId": "TXN-8392019482",
  "bookingId": 50
}
```

### GET `/api/payments/{id}`
Retrieves payment record by payment ID.  
**Access**: `ADMIN`, or the booking owner.

### GET `/api/payments/booking/{bookingId}`
Retrieves payment record associated with a booking.  
**Access**: `ADMIN`, or the booking owner.

### GET `/api/payments`
Lists all payment transactions in the system.  
**Access**: `ADMIN`.

### PATCH `/api/payments/{id}/refund`
Processes a refund on a completed payment and marks the associated booking as cancelled.  
**Access**: `ADMIN`, or the booking owner.

### PATCH `/api/payments/booking/{bookingId}/refund`
Processes a refund identified by the booking ID.  
**Access**: `ADMIN`, or the booking owner.

---

## 5. Tickets

Base Path: `/api/tickets`

### POST `/api/tickets/booking/{bookingId}`
Generates electronic tickets with unique QR code identifiers for an approved booking.  
**Access**: `ADMIN`, or the booking owner.

### GET `/api/tickets/booking/{bookingId}`
Lists all tickets associated with a booking.  
**Access**: `ADMIN`, or the booking owner.

### GET `/api/tickets/{id}`
Retrieves ticket metadata by ticket ID.  
**Access**: `ADMIN`, or the ticket owner.

### GET `/api/tickets/validate/{qrCode}`
Validates ticket authenticity by QR token without executing check-in.  
**Access**: Public / Authenticated.

### POST `/api/tickets/checkin/{qrCode}`
Performs admission check-in via QR token. Updates status to `USED` and records `checkInTime`.  
**Access**: `ADMIN` or `ORGANIZER`.

### GET `/api/tickets/{id}/qrcode`
Downloads ticket QR code image (`image/png`).  
**Access**: Authenticated.

### GET `/api/tickets/{id}/pdf`
Downloads an individualized PDF e-ticket with embedded QR code (`application/pdf`).  
**Access**: Authenticated.

### GET `/api/tickets/booking/{bookingId}/pdf`
Downloads a combined PDF document containing all tickets for a booking (`application/pdf`).  
**Access**: Authenticated.

---

## 6. Venues

Base Path: `/api/venues`

### POST `/api/venues`
Registers a new venue.  
**Access**: `ADMIN` or `ORGANIZER`.

**Request Body**:
```json
{
  "name": "Pacific Convention Center",
  "address": "500 Harbor Boulevard, Seattle, WA, USA",
  "capacity": 8000,
  "description": "Multi-tier waterfront venue."
}
```

### GET `/api/venues`
Lists all configured venues.  
**Access**: Public.

### GET `/api/venues/{id}`
Retrieves a single venue by ID.  
**Access**: Public.

### PUT `/api/venues/{id}`
Modifies venue attributes.  
**Access**: `ADMIN` or `ORGANIZER`.

### DELETE `/api/venues/{id}`
Removes a venue record.  
**Access**: `ADMIN`.

---

## 7. Seats

Base Path: `/api/seats`

### POST `/api/seats`
Creates an individual seat record.  
**Access**: `ADMIN` or `ORGANIZER`.

**Request Body**:
```json
{
  "seatNumber": "12",
  "rowNumber": "C",
  "seatType": "PREMIUM",
  "status": "AVAILABLE",
  "venueId": 2,
  "eventId": 1
}
```

| Parameter | Type | Required | Values |
|---|---|---|---|
| `seatNumber` | String | Yes | Alphanumeric seat label |
| `rowNumber` | String | Yes | Row designation |
| `seatType` | String | Yes | `REGULAR`, `VIP`, `PREMIUM` |
| `status` | String | Yes | `AVAILABLE`, `BOOKED`, `LOCKED` |
| `venueId` | Long | Yes | Target venue foreign key |
| `eventId` | Long | No | Optional event-specific override |

### GET `/api/seats`
Lists all seats in the system.  
**Access**: Authenticated.

### GET `/api/seats/{id}`
Retrieves a seat by seat ID.  
**Access**: Authenticated.

### GET `/api/seats/venue/{venueId}`
Returns the entire seating layout for a venue.  
**Access**: Public.

### GET `/api/seats/venue/{venueId}/available`
Returns only seats with status `AVAILABLE` for a venue.  
**Access**: Public.

### PUT `/api/seats/{id}`
Updates seat metadata or tier assignment.  
**Access**: `ADMIN` or `ORGANIZER`.

### DELETE `/api/seats/{id}`
Deletes a seat record.  
**Access**: `ADMIN`.

### POST `/api/seats/lock`
Acquires a temporary lock on one or more seats for a specified timeout.  
**Access**: Authenticated.

**Request Body**:
```json
{
  "seatIds": [101, 102],
  "timeoutMinutes": 10
}
```

**Response**: `200 OK`

### POST `/api/seats/unlock`
Manually releases temporary locks on specified seats.  
**Access**: Authenticated.

**Request Body**:
```json
{
  "seatIds": [101, 102]
}
```

**Response**: `200 OK`

---

## 8. Reviews

Base Path: `/api`

### POST `/api/events/{eventId}/reviews`
Submits a rating and comment for an event. Enforces a database unique constraint of one review per user per event.  
**Access**: Authenticated.

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Exceptionally well-organized technical conference."
}
```

| Parameter | Type | Required | Validation |
|---|---|---|---|
| `rating` | Integer | Yes | `@Min(1)`, `@Max(5)` |
| `comment` | String | No | Maximum 1000 characters |

### GET `/api/events/{eventId}/reviews`
Returns a paginated list of reviews alongside the composite average rating.  
**Access**: Public.

### PUT `/api/reviews/{id}`
Edits an existing review authored by the current user.  
**Access**: Authenticated (Author only).

### DELETE `/api/reviews/{id}`
Deletes a review.  
**Access**: Authenticated (Author or `ADMIN`).

---

## 9. Coupons

Base Path: `/api/coupons`

### POST `/api/coupons`
Creates a promotional discount coupon.  
**Access**: `ADMIN`.

**Request Body**:
```json
{
  "code": "EARLYBIRD20",
  "discountType": "PERCENTAGE",
  "discountValue": 20.00,
  "expiryDate": "2026-12-31T23:59:59",
  "usageLimit": 500,
  "minBookingAmount": 100.00,
  "active": true
}
```

### POST `/api/coupons/validate`
Validates a coupon code against current cart criteria.  
**Access**: Public.

**Request Body**:
```json
{
  "code": "EARLYBIRD20",
  "bookingAmount": 150.00
}
```

### GET `/api/coupons`
Lists all configured coupons.  
**Access**: `ADMIN`.

### PATCH `/api/coupons/{id}/toggle-status`
Enables or disables an active coupon.  
**Access**: `ADMIN`.

### DELETE `/api/coupons/{id}`
Deletes a coupon record.  
**Access**: `ADMIN`.

---

## 10. Wishlist

Base Path: `/api/wishlist`  
Access: Authenticated.

### POST `/api/wishlist/{eventId}`
Adds an event to the authenticated user's wishlist.

### DELETE `/api/wishlist/{eventId}`
Removes an event from the authenticated user's wishlist.

### GET `/api/wishlist`
Returns the list of saved events for the authenticated user.

### GET `/api/wishlist/{eventId}/status`
Returns a boolean indicating whether the specified event is in the user's wishlist.

---

## 11. Waitlist

Base Path: `/api/waitlist`

### POST `/api/waitlist/{eventId}`
Enrolls the authenticated user in the waitlist for a sold-out event.  
**Access**: Authenticated.

### DELETE `/api/waitlist/{eventId}`
Withdraws the authenticated user from an event waitlist.  
**Access**: Authenticated.

### GET `/api/waitlist/{eventId}/count`
Returns the total count of users currently enrolled on an event waitlist.  
**Access**: Public.

### GET `/api/waitlist/{eventId}/status`
Returns the current user's waitlist position and state (`WAITING`, `NOTIFIED`, `PROMOTED`, `CANCELLED`).  
**Access**: Authenticated.

---

## 12. Calendar Integration

Base Path: `/api/events`  
Access: Public.

### GET `/api/events/{id}/calendar.ics`
Exports event schedule in RFC 5545 iCalendar format.  
**Response Header**: `Content-Type: text/calendar`

### GET `/api/events/{id}/google-calendar-link`
Generates a structured Google Calendar event creation URL.

**Response**: `200 OK`
```json
{
  "googleCalendarUrl": "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Global+AI+Summit..."
}
```

---

## 13. Check-In

Base Path: `/api/checkin`  
Access: `ADMIN` or `ORGANIZER`.

### POST `/api/checkin/{ticketId}`
Records ticket admission by ticket ID, setting status to `USED` and recording the admission timestamp.

### GET `/api/checkin/validate/{ticketId}`
Inspects ticket validity and admission eligibility by ticket ID without altering ticket state.

---

## 14. Images

Base Path: `/api/images`

### POST `/api/images/upload`
Uploads a banner image. Enforces a 20MB file size ceiling.  
**Access**: Authenticated.  
**Content-Type**: `multipart/form-data` with parameter `file`.

**Response**: `201 Created`
```json
{
  "imageUrl": "/api/images/d3b07384-d113-40e8-9279-05d6e2e5c8e3.png"
}
```

### GET `/api/images/{filename}`
Retrieves stored image binary.  
**Access**: Public.  
**Content-Type**: `image/jpeg`, `image/png`, or `image/webp`.

### DELETE `/api/images/{filename}`
Deletes an image from disk storage.  
**Access**: `ADMIN` or `ORGANIZER`.

---

## 15. Administration

Base Path: `/api/admin`  
Access: `ADMIN` only.

### GET `/api/admin/dashboard`
Aggregates platform statistics: total users, active events, cumulative bookings, gross revenue, and pending refunds.

### GET `/api/admin/analytics/revenue`
Returns time-series revenue metrics grouped by day, week, or month.

### GET `/api/admin/analytics/bookings`
Returns booking volume metrics, confirmation rates, and cancellation distributions.

### GET `/api/admin/statistics/users`
Returns user demographics, registration velocity, and role distributions.

### GET `/api/admin/statistics/events`
Returns event category breakdowns, average attendance figures, and venue utilization rates.

### GET `/api/admin/reports`
Generates aggregate operational reports formatted for administrative reporting.

### GET `/api/admin/system-health`
Exposes system diagnostics: JVM heap utilization, total memory, active processor cores, thread counts, and service uptime.

---

## 16. Users

Base Path: `/api/users`

### GET `/api/users/me`
Retrieves current authenticated user profile.  
**Access**: Authenticated.

### PUT `/api/users/me`
Updates first name, last name, or phone number of the authenticated user.  
**Access**: Authenticated.

### POST `/api/users`
Administrative user creation endpoint.  
**Access**: `ADMIN`.

### GET `/api/users`
Lists all registered users.  
**Access**: `ADMIN`.

### GET `/api/users/{id}`
Retrieves user record by user ID.  
**Access**: `ADMIN`.

### PUT `/api/users/{id}`
Updates attributes of any user account.  
**Access**: `ADMIN`.

### PUT `/api/users/{id}/role`
Updates account role assignment (`ADMIN`, `ORGANIZER`, `CUSTOMER`).  
**Access**: `ADMIN`.

### DELETE `/api/users/{id}`
Deletes a user account.  
**Access**: `ADMIN`.

---

## 17. Standard Error Responses

Errors return a uniform JSON error payload:

```json
{
  "status": 404,
  "message": "Event not found with ID: 45",
  "timestamp": "2026-11-05T12:00:00",
  "details": {}
}
```

### Standard Status Codes

| Status Code | Label | Typical Trigger |
|---|---|---|
| `200` | OK | Successful query or update |
| `201` | Created | Successful entity creation |
| `204` | No Content | Successful deletion |
| `400` | Bad Request | Constraint violation, malformed input payload |
| `401` | Unauthorized | Missing, invalid, or expired authentication token |
| `403` | Forbidden | Insufficient role privileges for the requested endpoint |
| `404` | Not Found | Requested entity ID does not exist |
| `409` | Conflict | Duplicate unique key or optimistic locking collision |
| `429` | Too Many Requests | Rate limit exceeded (Bucket4j threshold reached) |
| `500` | Internal Server Error | Uncaught server-side exception |

### Rate Limiting Specification

Sensitive endpoints (`/api/auth/**`, `/api/bookings/**`, `/api/payments/**`) enforce a token bucket algorithm:

- **Bucket Capacity**: 10 tokens
- **Refill Rate**: 10 tokens per minute
- **Scope**: Partitioned by client IP address
- **Rejection Status**: `429 Too Many Requests`
- **Response Header**: `X-Rate-Limit-Retry-After-Seconds: 60`
