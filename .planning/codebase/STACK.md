---
last_mapped_commit: 2e8f2f230d41c144fee000103e22e13cea755041
last_mapped_at: 2026-11-11
---
# Technology Stack

**Analysis Date:** 2026-11-11

## Overview
Full-stack event booking platform with a Spring Boot 3.4 REST API backend and a Vite + React 19 single-page application frontend.

---

## Backend Languages & Runtime

**Primary Language:**
- Java 17 (Eclipse Temurin / OpenJDK 17) - All backend service, domain, security, and controller code

**Build Tool & Package Manager:**
- Apache Maven 3.9+ via Maven Wrapper (`./mvnw`, `mvnw.cmd`)
- Configuration: `pom.xml`

**Core Framework:**
- Spring Boot `3.4.1` (`org.springframework.boot:spring-boot-starter-web`)

---

## Backend Key Dependencies

**Data & Persistence:**
- Spring Data JPA (`spring-boot-starter-data-jpa`)
- Hibernate ORM 6.6+ (Core JPA provider)
- PostgreSQL JDBC Driver (`org.postgresql:postgresql`) - Production relational database
- H2 Database Engine (`com.h2database:h2:2.3.232`) - In-memory database for automated integration testing
- Flyway Core & Flyway Database PostgreSQL (`org.flywaydb:flyway-core`) - Database migrations

**Security & Authentication:**
- Spring Security (`spring-boot-starter-security`)
- JJWT (`io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl`, `jjwt-jackson`) - HMAC-SHA256 JWT generation, parsing, validation
- Spring Security Crypto (BCrypt password encoder)

**Caching & Real-Time Messaging:**
- Spring Data Redis (`spring-boot-starter-data-redis`) - Distributed caching for event lookups and session state
- Spring WebSocket (`spring-boot-starter-websocket`) - STOMP over SockJS for live seat reservation broadcasts

**Rate Limiting & Reliability:**
- Bucket4j (`com.bucket4j:bucket4j-core:8.10.1`) - Token-bucket rate limiting filter on public/auth endpoints
- Spring Retry (`org.springframework.retry:spring-retry`) - Automated retry on email dispatch and payment verification

**Document Generation & Media:**
- iText Core (`com.itextpdf:itext-core:8.0.5`) - PDF ticket receipt and invoice generation
- ZXing (`com.google.zxing:core:3.5.3`, `javase:3.5.3`) - QR code matrix generation for ticket validation

**Monitoring & Documentation:**
- Spring Boot Actuator (`spring-boot-starter-actuator`) - Health checks, metrics, and application info
- SpringDoc OpenAPI (`org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0`) - Swagger UI at `/swagger-ui.html`

**Developer Utilities:**
- Project Lombok (`org.projectlombok:lombok`) - Compile-time boilerplate reduction (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`)

---

## Frontend Languages & Runtime

**Primary Language:**
- JavaScript (ES Modules, JSX)

**Runtime & Bundler:**
- Node.js `v20+` / `v25.x`
- Vite `8.2.0` (`@vitejs/plugin-react: 6.0.4`)

**Core Frameworks:**
- React `19.2.8`
- React DOM `19.2.8`

**UI & Styling:**
- Tailwind CSS `3.4.19` (`tailwindcss`, `postcss`, `autoprefixer`)
- Lucide React `1.28.0` (Icon system)
- Canvas Confetti `1.9.4` (Booking success celebration)

**Real-Time & Networking:**
- `@stomp/stompjs: 7.3.0` (STOMP client over WebSocket)
- `sockjs-client: 1.6.1` (WebSocket fallback)
- Native Browser `fetch` API with `credentials: 'include'` for HttpOnly cookie authentication

**Frontend Tooling & Linters:**
- Oxlint `1.75.0` (`npm run lint`) - High-performance Rust-based linter

---

## Configuration & Environment

**Backend Properties Files:**
- `src/main/resources/application.properties`: Shared foundation (PostgreSQL default driver, JPA DDL mode `validate`, Hibernate naming conventions)
- `src/main/resources/application-dev.properties`: Local development profile (`dev`) with H2/local Postgres fallback and dev JWT key
- `src/main/resources/application-prod.properties`: Production profile (`prod`) enforcing strict `JWT_SECRET` presence and SSL PostgreSQL configuration
- `src/main/resources/application-test.properties`: Unit/integration testing profile with H2 in-memory DB and mocked mail/redis

**Frontend Configuration:**
- `frontend/vite.config.js`: Dev server port `3000`, API reverse proxy target `http://localhost:8080`
- `frontend/tailwind.config.js`: Custom color palette, fonts, keyframes, and layout breakpoints

---

*Stack analysis: 2026-11-11*
*Update after major dependency changes*
