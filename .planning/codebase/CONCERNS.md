---
last_mapped_commit: 2e8f2f230d41c144fee000103e22e13cea755041
last_mapped_at: 2026-11-11
---
# Codebase Concerns & Technical Debt

**Analysis Date:** 2026-11-11

## Overview
This document tracks known technical debt, potential architectural bottlenecks, test runner anomalies, and operational risks across the event booking system.

---

## 1. High Priority Concerns

### 1.1 `AuthControllerTest` ApplicationContext Bootstrapping Stall
- **Symptom:** Running the full `@SpringBootTest` context suite for `AuthControllerTest` can stall or experience prolonged initialization latency following JPA repository auto-configuration.
- **Root Cause Analysis:** Full Spring context initialization attempts to bootstrap all repositories, auditing beans, and security filters simultaneously. If connection pool locks or un-stubbed background beans contend for resources in the test profile, test startup hangs.
- **Remediation Plan:**
  - Convert web layer integration tests to `@WebMvcTest(AuthController.class)` with targeted `@MockBean` dependencies instead of bootstrapping the entire `@SpringBootTest` monolith.
  - Ensure `application-test.properties` explicitly disables Redis connection attempts (`spring.autoconfigure.exclude=...RedisAutoConfiguration`).

### 1.2 Redis Availability in Local Development
- **Symptom:** Developers or automated CI runners without a running Redis server (`localhost:6379`) may encounter connection refused errors during catalog lookups.
- **Remediation Plan:**
  - Implement a graceful fallback in `RedisConfig.java` to `ConcurrentMapCacheManager` when the Redis connection factory fails to ping the server on startup.

---

## 2. Medium Priority Concerns & Scalability

### 2.1 In-Memory WebSocket STOMP Broker Scalability
- **Symptom:** The current WebSocket configuration uses Spring's `enableSimpleBroker("/topic", "/queue")`, which is held entirely in JVM memory.
- **Impact:** In a multi-instance or clustered deployment behind a load balancer, users connected to Instance A will not receive seat lock broadcasts emitted by Instance B.
- **Remediation Plan:**
  - Transition to a full external message broker (RabbitMQ or Redis Pub/Sub STOMP relay) using `enableStompBrokerRelay` before multi-node horizontal scaling.

### 2.2 In-Memory PDF Ticket Generation Buffering
- **Symptom:** `PdfServiceImpl` builds ticket receipts using in-memory byte streams (`ByteArrayOutputStream`).
- **Impact:** High concurrent ticket downloads (e.g. immediately after a major stadium concert sells out) could place heavy pressure on the JVM heap.
- **Remediation Plan:**
  - Introduce disk-spooled temp streams or asynchronous off-heap file generation with pre-signed CDN download links for high-volume events.

### 2.3 Frontend State Management Growth
- **Symptom:** State is currently coordinated through React component state and lightweight context providers.
- **Impact:** As complex multi-step checkout, coupon stacking, waitlist notifications, and seat map geometry grow, prop drilling and re-renders become harder to coordinate.
- **Remediation Plan:**
  - Adopt a lightweight state library like Zustand for cohesive cart, seat reservation, and auth state management.

---

## 3. Fragile Areas & Developer Traps

### 3.1 Lazy Loading / `LazyInitializationException`
- **Location:** Entities with `@ManyToOne` or `@ManyToMany` relations (`Booking` -> `tickets`, `Event` -> `venue`).
- **Risk:** Accessing lazily loaded collections outside the `@Transactional` service boundary (e.g., inside mappers or controllers) triggers `LazyInitializationException`.
- **Guideline:** Always fetch required child collections eagerly in repository queries using `JOIN FETCH` or Entity Graphs when preparing response DTOs.

### 3.2 Production Secret Key Hard-Stop
- **Location:** `com.kritagya.event_booking_system.security.JwtUtil.java`
- **Behavior:** The `@PostConstruct` startup hook strictly aborts container startup if `JWT_SECRET` is missing, blank, under 256 bits, or equals default development strings.
- **Notice for Operators:** Production deployments must always inject a cryptographically secure 256-bit+ Base64 string in the `JWT_SECRET` environment variable, or the container will fail to launch by design.

---

*Concerns analysis: 2026-11-11*
*Review and update as issues are resolved or new debt is incurred*
