---
last_mapped_commit: 2e8f2f230d41c144fee000103e22e13cea755041
last_mapped_at: 2026-11-11
---
# External Integrations & Services

**Analysis Date:** 2026-11-11

## Overview
This document records all databases, messaging brokers, external APIs, and protocol integrations across the event booking system.

---

## 1. Database & Persistence

### PostgreSQL (Production & Staging)
- **Driver:** `org.postgresql.Driver`
- **Configuration Keys:**
  - `spring.datasource.url`: `jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:event_booking}`
  - `spring.datasource.username`: `${DB_USER:postgres}`
  - `spring.datasource.password`: `${DB_PASSWORD}`
- **Connection Pool:** HikariCP (`maximum-pool-size: 20`, `minimum-idle: 5`, `idle-timeout: 300000`)
- **Schema Management:** Flyway migrations under `src/main/resources/db/migration/`
- **JPA DDL Mode:** `validate` (Strict production safety; Hibernate never auto-alters production tables)

### H2 Database (Integration Testing)
- **Configuration:** `src/main/resources/application-test.properties`
- **URL:** `jdbc:h2:mem:eventbookingtest;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE`
- **Dialect:** `org.hibernate.dialect.H2Dialect`

---

## 2. Distributed Caching

### Redis
- **Framework:** Spring Data Redis with Lettuce / Jedis connection provider
- **Configuration Keys:**
  - `spring.data.redis.host`: `${REDIS_HOST:localhost}`
  - `spring.data.redis.port`: `${REDIS_PORT:6379}`
- **Usage:**
  - Event catalog caching (`@Cacheable("events")`, `@CacheEvict`)
  - User session token revocation blacklist for refresh token cycling
  - Fallback: Local in-memory caching fallback when Redis is absent in test environments

---

## 3. Real-Time Communication

### WebSocket (STOMP over SockJS)
- **Configuration File:** `src/main/java/com/kritagya/event_booking_system/config/WebSocketConfig.java`
- **Endpoint:** `/ws` (with SockJS fallback enabled)
- **Message Broker:** Simple in-memory broker configured for `/topic` and `/queue`
- **Application Destination Prefix:** `/app`
- **Channels:**
  - `/topic/events/{eventId}/seats`: Live seat locking and release events broadcast to all users viewing the venue map
  - `/user/queue/notifications`: User-specific booking confirmations and waitlist alerts

---

## 4. Email & Notification Delivery

### Spring Mail & SMTP
- **Configuration Keys:**
  - `spring.mail.host`: `${MAIL_HOST:smtp.gmail.com}`
  - `spring.mail.port`: `${MAIL_PORT:587}`
  - `spring.mail.username`: `${MAIL_USERNAME}`
  - `spring.mail.password`: `${MAIL_PASSWORD}`
  - `spring.mail.properties.mail.smtp.auth`: `true`
  - `spring.mail.properties.mail.smtp.starttls.enable`: `true`
- **Resilience:** Wrapped in Spring Retry (`@Retryable(value = MailException.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))`)
- **Templates:** Plain text & HTML transactional emails for ticket confirmations, booking cancellations, and password resets

---

## 5. Payment Gateway Integration

### Payment Processing Flow
- **Controller:** `src/main/java/com/kritagya/event_booking_system/controller/PaymentController.java`
- **Service:** `src/main/java/com/kritagya/event_booking_system/service/impl/PaymentServiceImpl.java`
- **Architecture:** Decoupled payment provider contract supporting webhook verification and simulated sandbox transactions
- **Payment Lifecycle:**
  1. `Booking` created in `PENDING` status with 15-minute expiration lock on selected seats.
  2. `Payment` record generated with unique transaction reference.
  3. Gateway callback / webhook verification confirms charge.
  4. On `SUCCESS`: Booking moves to `CONFIRMED`, tickets issued, QR codes minted.
  5. On `FAILED` / `EXPIRED`: Seats automatically released via scheduler.

---

## 6. Document & Asset Generation

### PDF Tickets & Invoices (iText 8)
- **Service:** `src/main/java/com/kritagya/event_booking_system/service/impl/PdfServiceImpl.java`
- **Features:** Automated branded PDF generation with event metadata, seat numbering, barcode/QR code, and VAT invoice summary.

### QR Code Generator (ZXing)
- **Service:** `src/main/java/com/kritagya/event_booking_system/service/impl/QrCodeServiceImpl.java`
- **Output:** Encrypted 256x256 PNG data streams embedded directly into PDF tickets and displayed in the frontend modal for gate scanning.

---

## 7. Metrics, Health & Documentation

### Spring Boot Actuator
- **Endpoints Exposed:** `/actuator/health`, `/actuator/info`, `/actuator/metrics`
- **Role Restriction:** Admin-only for sensitive system metrics; liveness/readiness probes open for container orchestration.

### SpringDoc OpenAPI / Swagger UI
- **URL:** `http://localhost:8080/swagger-ui.html`
- **Configuration:** `src/main/java/com/kritagya/event_booking_system/config/OpenApiConfig.java`
- **Security Scheme:** Bearer JWT authorization configured in OpenAPI metadata.

---

*Integrations analysis: 2026-11-11*
*Update after adding external APIs, brokers, or cloud integrations*
