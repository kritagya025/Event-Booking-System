# 🔒 Security Policy — Event Booking System

This document describes the security architecture, authentication mechanisms, vulnerability handling, and security best practices implemented in the Event Booking System.

---

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Password Security](#password-security)
- [Token Security](#token-security)
- [Rate Limiting](#rate-limiting)
- [Input Validation](#input-validation)
- [Data Protection](#data-protection)
- [CORS Policy](#cors-policy)
- [Audit Logging](#audit-logging)
- [Dependency Security](#dependency-security)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)
- [Security Checklist](#security-checklist)

---

## Security Overview

The Event Booking System implements a defense-in-depth security model:

```
Request → Rate Limiting → JWT Auth → RBAC → Input Validation → Business Logic → Audit Log
```

| Layer | Implementation |
|---|---|
| Transport | HTTPS (production), CORS restrictions |
| Rate Limiting | Bucket4j per-IP token bucket |
| Authentication | JWT Bearer tokens (HMAC-SHA256) |
| Authorization | Spring Security RBAC + method-level `@PreAuthorize` |
| Input Validation | Jakarta Bean Validation |
| Data Protection | BCrypt password hashing, parameterized queries |
| Audit | Structured audit logging for security-relevant events |
| Concurrency | Optimistic locking to prevent race conditions |

---

## Authentication

### JWT Token Flow

1. **Login**: User submits credentials → receives `accessToken` + `refreshToken`
2. **API Access**: Include `Authorization: Bearer <accessToken>` on all authenticated requests
3. **Token Refresh**: When access token expires, use refresh token to obtain new token pair
4. **Logout**: All refresh tokens for the user are revoked

### Token Configuration

| Token | Default Expiry | Configurable Via |
|---|---|---|
| Access Token | 24 hours (86400000 ms) | `JWT_EXPIRATION` |
| Refresh Token | 7 days (604800000 ms) | `JWT_REFRESH_EXPIRATION` |

### Token Implementation

- **Library**: JJWT 0.12.6
- **Algorithm**: HMAC-SHA256
- **Claims**: `sub` (email), `role` (authority), `iat` (issued at), `exp` (expiration)
- **Signing Key**: Base64-encoded secret via `JWT_SECRET` environment variable

### Refresh Token Rotation

On every refresh:
1. Old refresh token is **revoked** (marked `revoked=true`)
2. New access token + new refresh token are issued
3. This prevents refresh token reuse attacks

### Session Management

- **Stateless**: `SessionCreationPolicy.STATELESS` — no server-side sessions
- No cookies used for authentication
- Each request is independently authenticated via JWT

---

## Authorization

### Role-Based Access Control (RBAC)

Three roles with hierarchical permissions:

| Role | Description |
|---|---|
| `ADMIN` | Full system access |
| `ORGANIZER` | Event and venue management |
| `CUSTOMER` | Booking, payment, ticket access |

### Endpoint Authorization Matrix

| Endpoint Pattern | ADMIN | ORGANIZER | CUSTOMER | Anonymous |
|---|---|---|---|---|
| `POST /api/auth/**` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/events/**` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/venues/**` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/events` | ✅ | ✅ | ✅ | ❌ |
| `PUT/DELETE /api/events/**` | ✅ | ✅ | ❌ | ❌ |
| `POST /api/bookings` | ✅ | ❌ | ✅ | ❌ |
| `POST /api/payments` | ✅ | ❌ | ✅ | ❌ |
| `/api/admin/**` | ✅ | ❌ | ❌ | ❌ |
| `/api/users/**` (CRUD) | ✅ | ❌ | ❌ | ❌ |
| `GET /api/users/me` | ✅ | ✅ | ✅ | ❌ |
| `/api/checkin/**` | ✅ | ✅ | ❌ | ❌ |
| `/api/wishlist/**` | ✅ | ❌ | ✅ | ❌ |

### Method-Level Security

`@PreAuthorize` is used for fine-grained access control:

```java
@PreAuthorize("hasRole('ADMIN')")          // Admin only
@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")  // Admin or Organizer
```

---

## Password Security

### Hashing

- **Algorithm**: BCrypt via `BCryptPasswordEncoder`
- **Cost Factor**: Default (10 rounds)
- Passwords are **never** stored or transmitted in plain text

### Password Migration

`PasswordMigrationRunner` automatically detects plain-text passwords on startup and re-hashes them with BCrypt. It safely skips already-hashed passwords (starting with `$2a$` or `$2b$`).

### Password Reset Flow

1. User requests reset via `POST /api/auth/forgot-password`
2. Server generates UUID token with 1-hour expiry
3. Reset link sent via email
4. User submits new password with token via `POST /api/auth/reset-password`
5. Token is consumed and all refresh tokens are revoked
6. Response is always generic to prevent email enumeration

### Password Validation

- Minimum 6 characters (`@Size(min=6)`)
- Required field (`@NotBlank`)

---

## Token Security

### Access Token

- Short-lived (24h default)
- Contains: email, role, issued time, expiry
- Validated on every request by `JwtAuthenticationFilter`
- Invalid tokens silently rejected (no authentication set)

### Refresh Token

- Stored in `refresh_token` table with:
  - `revoked` flag (prevents reuse)
  - `expiry_date` (prevents indefinite use)
- Rotation on every refresh (old token revoked, new token issued)
- All tokens revoked on password reset and logout

### Token Revocation

| Action | Tokens Revoked |
|---|---|
| Logout | All refresh tokens for the user |
| Password Reset | All refresh tokens for the user |
| Token Refresh | Only the used refresh token |

---

## Rate Limiting

### Implementation

- **Library**: Bucket4j 8.10.1
- **Strategy**: Per-IP token bucket
- **Storage**: In-memory `ConcurrentHashMap`

### Configuration

```properties
app.rate-limiting.enabled=true
app.rate-limiting.capacity=10         # Max burst
app.rate-limiting.tokens-per-minute=10  # Refill rate
```

### Protected Endpoints

| Path Pattern | Description |
|---|---|
| `/api/auth/**` | Authentication endpoints |
| `/api/bookings` | Booking creation |
| `/api/payments` | Payment processing |

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
X-Rate-Limit-Retry-After-Seconds: 60
Content-Type: application/json

{
  "status": 429,
  "message": "Too Many Requests. Rate limit exceeded. Please try again in 1 minute."
}
```

---

## Input Validation

### Server-Side Validation

Jakarta Bean Validation annotations are used on all DTOs:

| Annotation | Usage |
|---|---|
| `@NotBlank` | Required string fields |
| `@NotNull` | Required non-string fields |
| `@Email` | Email format validation |
| `@Size(min, max)` | String length constraints |
| `@Min`, `@Max` | Numeric range (e.g., rating 1-5) |
| `@Valid` | Triggers nested DTO validation |

### SQL Injection Prevention

- All database queries use JPA parameterized queries
- No raw SQL string concatenation
- JPA Specifications use `CriteriaBuilder` for dynamic queries

### File Upload Validation

- Maximum file size: 20MB
- Configured via:
  ```properties
  spring.servlet.multipart.max-file-size=20MB
  spring.servlet.multipart.max-request-size=20MB
  ```
- File type validation in `ImageStorageService`
- UUID-based filenames prevent path traversal

---

## Data Protection

### Sensitive Data

| Data | Protection |
|---|---|
| Passwords | BCrypt hashed |
| JWT Secret | Environment variable (not in source) |
| Database credentials | Environment variables |
| Email credentials | Environment variables |
| Refresh tokens | UUID-based, stored with expiry + revocation |
| Password reset tokens | UUID-based, 1-hour expiry, single-use |

### Database Security

- Parameterized queries (JPA/Hibernate)
- Database credentials via environment variables
- `@Column(unique = true)` constraints prevent duplicates
- Optimistic locking prevents concurrent data corruption

---

## CORS Policy

### Configuration

```properties
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

### Settings

| Setting | Value |
|---|---|
| Allowed Origins | Configurable via environment variable |
| Allowed Methods | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` |
| Allowed Headers | `*` (all) |
| Allow Credentials | `true` |
| Max Age | 3600 seconds (1 hour) |
| Applied To | `/api/**` |

### Production

Update `CORS_ALLOWED_ORIGINS` to your production frontend domain only:

```properties
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

---

## Audit Logging

### Audited Events

| Event | Data Logged |
|---|---|
| Login | Email, success/failure, IP, timestamp |
| Booking Created | Booking ID, user email, event ID, quantity, amount |
| Booking Cancelled | Booking ID, user email, event ID |
| Event Created | Event ID, name, organizer email |
| Event Updated | Event ID, name, updated by |
| Payment Processed | Payment ID, booking ID, method, status, amount |

### Log Format

```
[AUDIT] EVENT=LOGIN | EMAIL=john@example.com | SUCCESS=true | IP=192.168.1.1 | TIMESTAMP=2026-08-03T14:30:00
```

### Request Logging

`RequestLoggingFilter` logs HTTP method, URI, status code, and response time for every request.

---

## Dependency Security

### Key Security Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `spring-boot-starter-security` | 3.4.1 | Security framework |
| `jjwt-api` / `jjwt-impl` / `jjwt-jackson` | 0.12.6 | JWT token handling |
| `bucket4j-core` | 8.10.1 | Rate limiting |
| `spring-boot-starter-validation` | 3.4.1 | Input validation |

### Keeping Dependencies Updated

```bash
# Check for outdated dependencies
./mvnw versions:display-dependency-updates

# Check for security vulnerabilities
./mvnw org.owasp:dependency-check-maven:check
```

---

## Reporting Vulnerabilities

### Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub issue
2. Email: kritagya@example.com with subject: `[SECURITY] Event Booking System`
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
4. We will acknowledge within 48 hours
5. We will provide a fix timeline within 7 days

### Scope

In scope:
- Authentication/authorization bypass
- SQL injection
- Cross-site scripting (XSS)
- Rate limiting bypass
- Privilege escalation
- Data exposure
- JWT token vulnerabilities

Out of scope:
- Denial of service (DoS)
- Social engineering
- Issues in third-party dependencies (report upstream)

---

## Security Checklist

### Production Deployment

- [ ] Change `JWT_SECRET` to a cryptographically random 256-bit key
- [ ] Set strong `DB_PASSWORD`
- [ ] Configure HTTPS (SSL/TLS) termination
- [ ] Restrict `CORS_ALLOWED_ORIGINS` to production frontend domain
- [ ] Set `spring.jpa.show-sql=false`
- [ ] Restrict `/actuator/**` endpoints
- [ ] Configure firewall rules (only expose 80/443)
- [ ] Enable Redis for rate limiting persistence (multi-instance)
- [ ] Configure email SMTP credentials for password reset flow
- [ ] Review and rotate secrets periodically
- [ ] Set up log monitoring for `[AUDIT]` events
- [ ] Run OWASP dependency check before deployment
