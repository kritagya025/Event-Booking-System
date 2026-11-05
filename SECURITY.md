# Security Architecture and Policy

This document details the security architecture, threat model, authentication mechanisms, authorization boundaries, cryptographic standards, and vulnerability reporting procedures implemented in the Event Booking System.

---

## Table of Contents

- [Security Model Overview](#security-model-overview)
- [Authentication Architecture](#authentication-architecture)
  - [JSON Web Tokens (JWT)](#json-web-tokens-jwt)
  - [Refresh Token Rotation](#refresh-token-rotation)
  - [Session Lifecycle](#session-lifecycle)
- [Authorization and Access Control](#authorization-and-access-control)
  - [Role Hierarchy](#role-hierarchy)
  - [Endpoint Security Matrix](#endpoint-security-matrix)
  - [Method-Level Security](#method-level-security)
- [Credential Management](#credential-management)
  - [Password Hashing](#password-hashing)
  - [Legacy Password Migration](#legacy-password-migration)
  - [Password Reset Protocol](#password-reset-protocol)
- [Traffic Filtering and Rate Limiting](#traffic-filtering-and-rate-limiting)
- [Input Validation and Sanitization](#input-validation-and-sanitization)
- [Data Protection and Privacy](#data-protection-and-privacy)
- [Cross-Origin Resource Sharing (CORS)](#cross-origin-resource-sharing-cors)
- [Structured Audit Logging](#structured-audit-logging)
- [Dependency Scanning and Supply Chain](#dependency-scanning-and-supply-chain)
- [Vulnerability Disclosure Policy](#vulnerability-disclosure-policy)
- [Production Hardening Checklist](#production-hardening-checklist)

---

## Security Model Overview

The system enforces defense-in-depth across transport, gateway, application, and persistence tiers:

```
Inbound HTTP Request
  |
  v
Transport Security (TLS 1.2 / 1.3 Termination)
  |
  v
Bucket4j Rate Limiting Filter (IP-scoped token bucket)
  |
  v
JWT Authentication Filter (HMAC-SHA256 signature and expiration check)
  |
  v
Spring Security Filter Chain (Role-Based Access Control)
  |
  v
Method Security (@PreAuthorize checks)
  |
  v
Input Validation (Jakarta Bean Validation constraints)
  |
  v
Service Domain Execution (Optimistic concurrency control)
  |
  v
Audit Logging (Structured event recording)
```

| Security Layer | Technical Mechanism |
|---|---|
| Transport | Mandatory TLS 1.2+ in production; strict CORS policy |
| Edge Filtering | Bucket4j token bucket rate limiting on sensitive routes |
| Authentication | Stateless HMAC-SHA256 signed JWTs with HttpOnly cookie support |
| Authorization | Spring Security 6 RBAC with granular `@PreAuthorize` guards |
| Input Validation | Jakarta Validation (`@Valid`) preventing injection and malformed input |
| Persistence | Parameterized queries via Spring Data JPA / Hibernate |
| Auditing | Immutable audit trail via `AuditingEntityListener` and `AuditLogger` |
| Concurrency Control | Version-checked optimistic locking preventing race exploitation |

---

## Authentication Architecture

### JSON Web Tokens (JWT)
User authentication is entirely stateless:

- **Algorithm**: HMAC-SHA256 (JJWT 0.12.6)
- **Token Claims**: `sub` (user email), `role` (assigned authority), `iat` (issued timestamp), `exp` (expiration timestamp)
- **Access Token TTL**: 24 hours (`86,400,000` ms, configurable via `JWT_EXPIRATION`)
- **Transport**: `Authorization: Bearer <token>` HTTP header or secure HttpOnly cookie

### Refresh Token Rotation
To mitigate the risk of long-lived credential compromise, the system enforces single-use refresh token rotation:

1. Initial login issues an access token and an opaque UUID refresh token recorded in the `refresh_token` table.
2. Refresh tokens carry a 7-day expiration (`604,800,000` ms, configurable via `JWT_REFRESH_EXPIRATION`).
3. When `POST /api/auth/refresh` is invoked, the supplied refresh token is validated, marked `revoked = true`, and superseded by an entirely new access and refresh token pair.
4. Any attempt to reuse a revoked refresh token fails immediately with `HTTP 401 Unauthorized`.

### Session Lifecycle

| Event Trigger | Scope of Revocation |
|---|---|
| Successful Token Refresh | Target refresh token revoked; replacement issued |
| Explicit User Logout | All active refresh tokens belonging to the user are revoked |
| Password Reset Completion | All existing refresh tokens belonging to the user are revoked |
| Administrative Role Change | Existing sessions invalidated upon access token expiration |

---

## Authorization and Access Control

### Role Hierarchy
The platform defines three authorization roles via `Role.java`:

- `ADMIN`: Unrestricted operational and administrative access, including user role updates, system analytics, financial reports, and global catalog management.
- `ORGANIZER`: Restricted management access covering venue administration, event authoring, seat layout definition, and gate check-in validation.
- `CUSTOMER`: End-user access permitting event browsing, seat selection, booking creation, payments, and ticket retrieval.

### Endpoint Security Matrix

| Endpoint Route Pattern | Anonymous | Customer | Organizer | Administrator |
|---|---|---|---|---|
| `POST /api/auth/register` | Allowed | Allowed | Allowed | Allowed |
| `POST /api/auth/login` | Allowed | Allowed | Allowed | Allowed |
| `POST /api/auth/refresh` | Allowed | Allowed | Allowed | Allowed |
| `POST /api/auth/logout` | Denied | Allowed | Allowed | Allowed |
| `GET /api/events/**` | Allowed | Allowed | Allowed | Allowed |
| `POST /api/events` | Denied | Denied | Allowed | Allowed |
| `PUT/DELETE /api/events/**` | Denied | Denied | Allowed (Own) | Allowed |
| `GET /api/venues/**` | Allowed | Allowed | Allowed | Allowed |
| `POST/PUT /api/venues/**` | Denied | Denied | Allowed | Allowed |
| `POST /api/bookings` | Denied | Allowed | Denied | Allowed |
| `PATCH /api/bookings/{id}/cancel` | Denied | Allowed (Own) | Denied | Allowed |
| `POST /api/payments` | Denied | Allowed | Denied | Allowed |
| `PATCH /api/payments/{id}/refund` | Denied | Allowed (Own) | Denied | Allowed |
| `POST /api/checkin/**` | Denied | Denied | Allowed | Allowed |
| `GET /api/admin/**` | Denied | Denied | Denied | Allowed |
| `GET /api/users/me` | Denied | Allowed | Allowed | Allowed |
| `PUT /api/users/{id}/role` | Denied | Denied | Denied | Allowed |

### Method-Level Security
Granular operation security is declared directly on controllers and services via `@PreAuthorize`:

```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
public ResponseEntity<TicketResponseDTO> checkInTicket(...) { ... }
```

---

## Credential Management

### Password Hashing
- **Algorithm**: BCrypt (`BCryptPasswordEncoder`)
- **Cost Factor**: 10 rounds (adaptive key derivation)
- Credentials are salted and hashed prior to persistence. Plaintext passwords never enter log streams or database records.

### Legacy Password Migration
The startup runner `PasswordMigrationRunner` audits persistent user accounts on initialization. If an unhashed credential legacy record is detected, it is immediately converted to a BCrypt hash, safely skipping hashes prefixed with `$2a$` or `$2b$`.

### Password Reset Protocol
1. User invokes `POST /api/auth/forgot-password`.
2. The response always returns `HTTP 200 OK` with a uniform message to prevent account enumeration.
3. If the account exists, a cryptographically secure UUID token with a 60-minute TTL is generated and emailed.
4. Submission of `POST /api/auth/reset-password` validates token expiration, updates the password hash, voids the token, and revokes all active refresh tokens for the account.

---

## Traffic Filtering and Rate Limiting

The application incorporates in-memory rate limiting via Bucket4j:

- **Filter Scope**: Applied in `RateLimitingFilter` ahead of security processing.
- **Protected Paths**: `/api/auth/**`, `/api/bookings/**`, `/api/payments/**`.
- **Bucket Capacity**: 10 tokens per client IP address.
- **Replenishment Rate**: 10 tokens per minute.
- **Rejection Behavior**: Responds with `HTTP 429 Too Many Requests` and includes header `X-Rate-Limit-Retry-After-Seconds: 60`.

---

## Input Validation and Sanitization

### Declarative Validation Constraints
Incoming DTO payloads enforce Jakarta Bean Validation constraints:
- Non-blank string verification: `@NotBlank`
- Structural email conformance: `@Email`
- Sizing bounds: `@Size(min = 6, max = 100)`
- Numeric thresholds: `@Min(1)`, `@Max(5)` on review ratings
- Complex object inspection: `@Valid`

### SQL Injection Mitigation
Database interactions are mediated exclusively through Spring Data JPA repositories and Hibernate ORM. No dynamic SQL concatenation is permitted. Dynamic search queries construct type-safe `Predicate` instances via `CriteriaBuilder`.

### Upload Security
- **Size Bounds**: Maximum 20MB enforced by Spring multipart configuration (`spring.servlet.multipart.max-file-size=20MB`).
- **Filename Sanitization**: Uploaded files are renamed using generated UUID strings, preventing directory traversal attacks.
- **Storage Boundary**: Stored outside application binary directories with restricted execution permissions.

---

## Data Protection and Privacy

- **Cryptographic Secrets**: Secrets (`JWT_SECRET`, database passwords) must be injected via environment variables.
- **PII Protection**: Customer passwords, tokens, and email addresses are omitted from unauthenticated responses and error payloads.
- **Error Obfuscation**: `GlobalExceptionHandler` intercepts exceptions and returns sanitized JSON error payloads, preventing stack traces or database schema disclosures in production.

---

## Cross-Origin Resource Sharing (CORS)

Configured within `SecurityConfig.java`:

- **Permitted Origins**: Sourced from `CORS_ALLOWED_ORIGINS` environment variable.
- **Allowed Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- **Allowed Headers**: Standard headers including `Authorization`, `Content-Type`, `X-Requested-With`.
- **Credentials Support**: `allowCredentials(true)` for HttpOnly cookie authentication.
- **Preflight Cache**: Max age set to 3600 seconds.

---

## Structured Audit Logging

The `AuditLogger` component records security-relevant events with structured metadata:

```
[AUDIT] EVENT=LOGIN | EMAIL=organizer@example.com | SUCCESS=true | IP=198.51.100.24 | TIMESTAMP=2026-11-05T12:00:00
[AUDIT] EVENT=BOOKING_CANCELLED | BOOKING_ID=42 | USER=customer@example.com | TIMESTAMP=2026-11-05T12:05:00
[AUDIT] EVENT=PAYMENT_REFUNDED | PAYMENT_ID=101 | AMOUNT=250.00 | ADMIN=admin@eventhub.com | TIMESTAMP=2026-11-05T12:10:00
```

Audited events include:
- Authentication attempts (success and failure)
- Account registration and role elevation
- Booking reservation and cancellation
- Payment authorization and refunds
- Event creation, publication, and deletion

---

## Dependency Scanning and Supply Chain

Maintain repository dependencies using standardized build checks:

```bash
# Verify available updates
./mvnw versions:display-dependency-updates

# Execute OWASP dependency vulnerability check
./mvnw org.owasp:dependency-check-maven:check
```

---

## Vulnerability Disclosure Policy

If you identify a security defect, follow responsible disclosure practices:

1. Do not file public GitHub issues for security vulnerabilities.
2. Direct all vulnerability reports to `security@eventhub.com` with the subject line `[SECURITY REPORT] Event Booking System`.
3. Include clear reproduction steps, request/response samples, and impact assessment.
4. Maintainers will acknowledge receipt within 48 hours and provide a remediation timeline within 7 calendar days.

---

## Production Hardening Checklist

Prior to production deployment, verify the following configuration controls:

- [ ] Cryptographically random 256-bit key supplied to `JWT_SECRET`.
- [ ] Database credentials updated to dedicated unprivileged accounts.
- [ ] Profile active set to `production` (`spring.jpa.hibernate.ddl-auto=validate`).
- [ ] SQL echo logging disabled (`spring.jpa.show-sql=false`).
- [ ] Reverse proxy enforces TLS termination with valid certificates.
- [ ] CORS origins strictly limited to production frontend domain.
- [ ] Actuator monitoring endpoints restricted to internal private networks.
- [ ] Operating system firewall limits ingress to ports 80 and 443.
- [ ] Bucket4j rate limiting thresholds verified against expected load.
- [ ] Log aggregation configured for ingestion of `[AUDIT]` streams.
