# 📡 API Documentation — Event Booking System

> **Base URL**: `http://localhost:8080`
>
> **Interactive Docs**: [Swagger UI](http://localhost:8080/swagger-ui.html) | [OpenAPI JSON](http://localhost:8080/api-docs)
>
> **Authentication**: JWT Bearer Token — include `Authorization: Bearer <token>` header on authenticated endpoints.

---

## Table of Contents

- [Authentication](#1-authentication)
- [Events](#2-events)
- [Bookings](#3-bookings)
- [Payments](#4-payments)
- [Tickets](#5-tickets)
- [Venues](#6-venues)
- [Seats](#7-seats)
- [Reviews](#8-reviews)
- [Coupons](#9-coupons)
- [Wishlist](#10-wishlist)
- [Waitlist](#11-waitlist)
- [Calendar](#12-calendar)
- [Check-In](#13-check-in)
- [Images](#14-images)
- [Admin](#15-admin)
- [Users](#16-users)
- [Error Responses](#error-responses)

---

## 1. Authentication

**Base Path**: `/api/auth`

All auth endpoints are **public** (no token required).

### POST `/api/auth/register`

Register a new user account.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `firstName` | String | ✅ | `@NotBlank` |
| `lastName` | String | ❌ | — |
| `email` | String | ✅ | `@Email`, `@NotBlank` |
| `password` | String | ✅ | `@NotBlank`, `@Size(min=6)` |
| `phone` | String | ❌ | — |
| `role` | String | ❌ | `ADMIN`, `ORGANIZER`, `CUSTOMER` (defaults to `CUSTOMER`) |

**Response** `201 Created`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

### POST `/api/auth/login`

Authenticate and receive tokens.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** `200 OK`: Same structure as register response.

### POST `/api/auth/refresh`

Rotate access and refresh tokens.

**Request Body**:
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** `200 OK`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "new-uuid-token",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

### POST `/api/auth/logout`

Revoke all refresh tokens for the user.

**Request Body**:
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** `200 OK`:
```json
{
  "message": "Logged out successfully"
}
```

### POST `/api/auth/forgot-password`

Request a password reset email.

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** `200 OK`:
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

### POST `/api/auth/reset-password`

Reset password using the token from the email.

**Request Body**:
```json
{
  "token": "reset-uuid-token",
  "newPassword": "newSecurePassword456"
}
```

**Response** `200 OK`:
```json
{
  "message": "Password reset successfully"
}
```

### GET `/api/auth/verify-email?token={token}`

Verify user's email address.

**Response** `200 OK`:
```json
{
  "message": "Email verified successfully"
}
```

---

## 2. Events

**Base Path**: `/api/events`

### GET `/api/events`

Get all events (paginated). **Public**.

**Query Parameters**:
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | 0 | Page number |
| `size` | int | 10 | Page size |
| `sort` | string | — | Sort field (e.g., `eventDate,asc`) |

**Response** `200 OK`:
```json
{
  "content": [
    {
      "id": 1,
      "name": "Neon Horizon Cyber Music Festival 2026",
      "description": "Experience 3 days of immersive electronic music...",
      "eventDate": "2026-09-15",
      "startTime": "19:00",
      "endTime": "23:30",
      "category": "MUSIC",
      "status": "PUBLISHED",
      "ticketPrice": 85.00,
      "currency": "USD",
      "availableSeats": 120,
      "registrationDeadline": null,
      "viewCount": 42,
      "bannerImageUrl": "/images/concert.png",
      "venueId": 1,
      "venueName": "Metro Arena Center",
      "venueAddress": "450 Innovation Way, San Francisco, CA, USA",
      "venueCapacity": 15000,
      "organizerName": null,
      "organizerEmail": null,
      "createdAt": "2026-08-01T10:00:00",
      "updatedAt": "2026-08-01T10:00:00"
    }
  ],
  "totalElements": 4,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

### GET `/api/events/search`

Advanced event search with dynamic filters. **Public**.

**Query Parameters**:
| Parameter | Type | Description |
|---|---|---|
| `keyword` | String | Case-insensitive search across name, description, venue, category |
| `category` | String | Exact category match |
| `city` | String | Partial match on venue address |
| `dateFrom` | LocalDate | Events on or after this date |
| `dateTo` | LocalDate | Events on or before this date |
| `venueId` | Long | Filter by venue ID |
| `minPrice` | BigDecimal | Minimum ticket price |
| `maxPrice` | BigDecimal | Maximum ticket price |
| `page` | int | Page number |
| `size` | int | Page size |

**Response** `200 OK`: Same paginated format as `GET /api/events`.

### GET `/api/events/{id}`

Get event by ID (increments view count). **Public**.

### GET `/api/events/{id}/analytics`

Get event analytics. **Requires**: `ADMIN` or `ORGANIZER`.

**Response** `200 OK`:
```json
{
  "eventId": 1,
  "eventName": "Neon Horizon Cyber Music Festival 2026",
  "totalBookings": 25,
  "confirmedBookings": 20,
  "cancelledBookings": 5,
  "totalRevenue": 1700.00,
  "totalTicketsSold": 20,
  "averageBookingValue": 85.00,
  "viewCount": 42,
  "conversionRate": 47.62
}
```

### GET `/api/events/popular?limit=5`

Get popular events by view count. **Public**.

### GET `/api/events/trending?limit=5`

Get trending events by recent bookings. **Public**.

### GET `/api/events/recommendations?limit=5`

Get personalized recommendations. **Requires**: Authenticated user.

### GET `/api/events/venue/{venueId}`

Get events by venue. **Public**.

### POST `/api/events`

Create a new event. **Requires**: `ADMIN`, `ORGANIZER`, or `CUSTOMER`.

**Request Body**:
```json
{
  "name": "Summer Music Festival",
  "description": "An amazing outdoor music festival",
  "eventDate": "2026-12-15",
  "startTime": "18:00",
  "endTime": "23:00",
  "category": "MUSIC",
  "ticketPrice": 50.00,
  "currency": "USD",
  "availableSeats": 500,
  "registrationDeadline": "2026-12-10",
  "venueId": 1,
  "bannerImageUrl": "/images/summer.png"
}
```

**Response** `201 Created`: EventResponseDTO.

### PUT `/api/events/{id}`

Update an event. **Requires**: `ADMIN` or `ORGANIZER`.

### DELETE `/api/events/{id}`

Soft-delete an event. **Requires**: `ADMIN` or `ORGANIZER`.

### PATCH `/api/events/{id}/publish`

Publish a draft event. **Requires**: `ADMIN` or `ORGANIZER`.

### PATCH `/api/events/{id}/unpublish`

Unpublish an event. **Requires**: `ADMIN` or `ORGANIZER`.

---

## 3. Bookings

**Base Path**: `/api/bookings`

### POST `/api/bookings`

Create a booking. **Requires**: `ADMIN` or `CUSTOMER`.

**Request Body**:
```json
{
  "userId": 1,
  "eventId": 1,
  "quantity": 2,
  "seatIds": [1, 2],
  "couponCode": "SAVE20"
}
```

**Response** `201 Created`:
```json
{
  "id": 1,
  "bookingDate": "2026-08-03T14:30:00",
  "bookingStatus": "PENDING",
  "quantity": 2,
  "totalAmount": 170.00,
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "eventId": 1,
  "eventName": "Neon Horizon Cyber Music Festival 2026",
  "eventDate": "2026-09-15",
  "venueName": "Metro Arena Center",
  "seatNumbers": ["A1", "A2"],
  "createdAt": "2026-08-03T14:30:00"
}
```

### GET `/api/bookings`

Get all bookings. **Requires**: Authenticated.

### GET `/api/bookings/{id}`

Get booking by ID. **Requires**: Authenticated.

### GET `/api/bookings/user/{userId}`

Get bookings by user. **Requires**: `ADMIN` or `CUSTOMER`.

### PATCH `/api/bookings/{id}/cancel`

Cancel a booking (releases seats, updates availability). **Requires**: `ADMIN` or `CUSTOMER`.

---

## 4. Payments

**Base Path**: `/api/payments`

### POST `/api/payments`

Process a payment. **Requires**: `ADMIN` or `CUSTOMER`.

**Request Body**:
```json
{
  "bookingId": 1,
  "paymentMethod": "CREDIT_CARD"
}
```

| paymentMethod | Values |
|---|---|
| Options | `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `NET_BANKING` |

**Response** `201 Created`:
```json
{
  "id": 1,
  "amount": 170.00,
  "paymentMethod": "CREDIT_CARD",
  "paymentStatus": "COMPLETED",
  "transactionId": "TXN-uuid-string",
  "bookingId": 1,
  "createdAt": "2026-08-03T14:31:00"
}
```

### GET `/api/payments/{id}`

Get payment by ID.

### GET `/api/payments/booking/{bookingId}`

Get payment by booking ID.

### GET `/api/payments`

Get all payments.

---

## 5. Tickets

**Base Path**: `/api/tickets`

### POST `/api/tickets/booking/{bookingId}`

Generate tickets for a confirmed booking. **Requires**: `ADMIN` or `CUSTOMER`.

**Response** `201 Created`:
```json
[
  {
    "id": 1,
    "qrCode": "TKT-uuid-string",
    "issueDate": "2026-08-03T14:32:00",
    "checkInTime": null,
    "ticketStatus": "ACTIVE",
    "bookingId": 1
  }
]
```

### GET `/api/tickets/booking/{bookingId}`

Get all tickets for a booking.

### GET `/api/tickets/{id}`

Get ticket by ID.

### GET `/api/tickets/validate/{qrCode}`

Validate a ticket by QR code. **Requires**: `ADMIN` or `ORGANIZER`.

### POST `/api/tickets/checkin/{qrCode}`

Check in a ticket via QR code scan. **Requires**: `ADMIN` or `ORGANIZER`.

### GET `/api/tickets/{id}/qrcode`

Download QR code as PNG image.

**Response**: `image/png` binary.

### GET `/api/tickets/{id}/pdf`

Download individual ticket as PDF.

**Response**: `application/pdf` binary.

### GET `/api/tickets/booking/{bookingId}/pdf`

Download all tickets for a booking as PDF.

**Response**: `application/pdf` binary.

---

## 6. Venues

**Base Path**: `/api/venues`

### POST `/api/venues`

Create a venue. **Requires**: `ADMIN` or `ORGANIZER`.

**Request Body**:
```json
{
  "name": "Grand Convention Center",
  "address": "123 Main St, New York, NY, USA",
  "capacity": 5000,
  "description": "Premier event venue"
}
```

### GET `/api/venues`

Get all venues. **Public**.

### GET `/api/venues/{id}`

Get venue by ID. **Public**.

### PUT `/api/venues/{id}`

Update venue. **Requires**: `ADMIN` or `ORGANIZER`.

### DELETE `/api/venues/{id}`

Delete venue. **Requires**: `ADMIN` or `ORGANIZER`.

---

## 7. Seats

**Base Path**: `/api/seats`

### POST `/api/seats`

Create a seat. **Requires**: `ADMIN` or `ORGANIZER`.

**Request Body**:
```json
{
  "seatNumber": "A1",
  "rowNumber": "A",
  "seatType": "VIP",
  "status": "AVAILABLE",
  "venueId": 1,
  "eventId": 1
}
```

| Field | Values |
|---|---|
| `seatType` | `REGULAR`, `VIP`, `PREMIUM` |
| `status` | `AVAILABLE`, `BOOKED`, `LOCKED` |

### GET `/api/seats`

Get all seats.

### GET `/api/seats/{id}`

Get seat by ID.

### GET `/api/seats/venue/{venueId}`

Get all seats for a venue.

### GET `/api/seats/venue/{venueId}/available`

Get only available seats for a venue.

### PUT `/api/seats/{id}`

Update seat. **Requires**: `ADMIN` or `ORGANIZER`.

### DELETE `/api/seats/{id}`

Delete seat. **Requires**: `ADMIN` or `ORGANIZER`.

---

## 8. Reviews

**Base Path**: `/api`

### POST `/api/events/{eventId}/reviews`

Add a review. **Requires**: Authenticated. One review per user per event.

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Amazing event! Highly recommended."
}
```

| Field | Type | Validation |
|---|---|---|
| `rating` | Integer | `@NotNull`, `@Min(1)`, `@Max(5)` |
| `comment` | String | `@NotBlank`, max 1000 chars |

### GET `/api/events/{eventId}/reviews?page=0&size=10`

Get event review summary with paginated reviews. **Public**.

**Response** `200 OK`:
```json
{
  "eventId": 1,
  "averageRating": 4.5,
  "totalReviews": 12,
  "reviews": {
    "content": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Amazing event!",
        "userName": "John Doe",
        "createdAt": "2026-08-03T15:00:00"
      }
    ]
  }
}
```

### PUT `/api/reviews/{reviewId}`

Edit own review. **Requires**: Authenticated (owner only).

### DELETE `/api/reviews/{reviewId}`

Delete own review. **Requires**: Authenticated (owner only).

---

## 9. Coupons

**Base Path**: `/api/coupons`

### POST `/api/coupons`

Create a coupon. **Requires**: `ADMIN`.

**Request Body**:
```json
{
  "code": "SAVE20",
  "discountType": "PERCENTAGE",
  "discountValue": 20.00,
  "expiryDate": "2026-12-31",
  "usageLimit": 100,
  "minBookingAmount": 50.00
}
```

| discountType | Values |
|---|---|
| Options | `PERCENTAGE`, `FIXED`, `EARLY_BIRD` |

### POST `/api/coupons/validate?code=SAVE20&bookingAmount=100`

Validate a coupon. **Public**.

### GET `/api/coupons`

List all coupons. **Requires**: `ADMIN`.

---

## 10. Wishlist

**Base Path**: `/api/wishlist`

### POST `/api/wishlist/{eventId}`

Add event to wishlist. **Requires**: `ADMIN` or `CUSTOMER`.

**Response** `201 Created` (empty body).

### DELETE `/api/wishlist/{eventId}`

Remove event from wishlist. **Requires**: `ADMIN` or `CUSTOMER`.

### GET `/api/wishlist`

Get user's wishlist. **Requires**: `ADMIN` or `CUSTOMER`.

**Response** `200 OK`: Array of `EventResponseDTO`.

---

## 11. Waitlist

**Base Path**: `/api/waitlist`

### POST `/api/waitlist/{eventId}`

Join waitlist for a sold-out event. **Requires**: Authenticated.

**Response** `201 Created`:
```json
{
  "message": "Successfully joined the waitlist."
}
```

### DELETE `/api/waitlist/{eventId}`

Leave waitlist. **Requires**: Authenticated.

### GET `/api/waitlist/{eventId}/count`

Get waitlist count for an event.

**Response** `200 OK`:
```json
{
  "waitlistCount": 15
}
```

---

## 12. Calendar

**Base Path**: `/api/events`

### GET `/api/events/{id}/calendar.ics`

Download iCalendar (.ics) file for an event. **Public**.

**Response**: `text/calendar` with `Content-Disposition: attachment`.

### GET `/api/events/{id}/google-calendar-link`

Get Google Calendar deep link. **Public**.

**Response** `200 OK`:
```json
{
  "googleCalendarUrl": "https://calendar.google.com/calendar/render?action=TEMPLATE&text=..."
}
```

---

## 13. Check-In

**Base Path**: `/api/checkin`

All check-in endpoints require `ADMIN` or `ORGANIZER` role.

### POST `/api/checkin/{ticketId}`

Check in a ticket by ticket ID.

### GET `/api/checkin/validate/{ticketId}`

Validate a ticket by ticket ID without checking in.

---

## 14. Images

**Base Path**: `/api/images`

### POST `/api/images/upload`

Upload an image (max 20MB). **Requires**: Authenticated.

**Request**: `multipart/form-data` with `file` field.

**Response** `201 Created`:
```json
{
  "imageUrl": "/api/images/uuid-filename.jpg"
}
```

### GET `/api/images/{filename}`

Get an image. **Public**.

**Response**: `image/jpeg` binary.

### DELETE `/api/images/{filename}`

Delete an image. **Requires**: `ADMIN` or `ORGANIZER`.

---

## 15. Admin

**Base Path**: `/api/admin`

All admin endpoints require `ADMIN` role.

### GET `/api/admin/dashboard`

Get admin dashboard overview.

### GET `/api/admin/analytics/revenue`

Get revenue analytics.

### GET `/api/admin/analytics/bookings`

Get booking analytics.

### GET `/api/admin/statistics/users`

Get user statistics.

### GET `/api/admin/statistics/events`

Get event statistics.

### GET `/api/admin/reports`

Get comprehensive system report.

---

## 16. Users

**Base Path**: `/api/users`

### GET `/api/users/me`

Get current authenticated user's profile. **Requires**: Authenticated.

### PUT `/api/users/me`

Update current user's profile. **Requires**: Authenticated.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### POST `/api/users`

Create a user (admin). **Requires**: `ADMIN`.

### GET `/api/users`

List all users. **Requires**: `ADMIN`.

### GET `/api/users/{id}`

Get user by ID. **Requires**: `ADMIN`.

### PUT `/api/users/{id}`

Update user. **Requires**: `ADMIN`.

### DELETE `/api/users/{id}`

Delete user. **Requires**: `ADMIN`.

---

## Error Responses

All errors follow a consistent format:

```json
{
  "status": 404,
  "message": "Event not found with ID: 99",
  "timestamp": "2026-08-03T14:30:00",
  "details": {}
}
```

### HTTP Status Codes

| Code | Meaning | Typical Cause |
|---|---|---|
| `200` | OK | Successful GET/PUT/PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation failure, invalid input |
| `401` | Unauthorized | Missing/invalid/expired JWT |
| `403` | Forbidden | Insufficient role permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Duplicate resource or optimistic lock failure |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

### Rate Limiting

Rate-limited endpoints: `/api/auth/**`, `/api/bookings`, `/api/payments`

- **Capacity**: 10 requests
- **Refill**: 10 tokens per minute
- **Scope**: Per client IP

**Rate limit exceeded response** `429`:
```json
{
  "status": 429,
  "message": "Too Many Requests. Rate limit exceeded. Please try again in 1 minute.",
  "timestamp": "2026-08-03T14:30:00"
}
```

Header: `X-Rate-Limit-Retry-After-Seconds: 60`
