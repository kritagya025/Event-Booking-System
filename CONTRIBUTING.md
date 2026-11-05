# Contributing Guidelines

Guidelines and engineering standards for contributing to the Event Booking System repository.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Repository Organization](#repository-organization)
- [Engineering Standards](#engineering-standards)
  - [Java Backend](#java-backend)
  - [React Frontend](#react-frontend)
- [Git Workflow and Branch Strategy](#git-workflow-and-branch-strategy)
- [Commit Message Specifications](#commit-message-specifications)
- [Pull Request Requirements](#pull-request-requirements)
- [Testing Standards](#testing-standards)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

All contributors and maintainers are expected to adhere to the Contributor Covenant Code of Conduct. Please report unacceptable behavior or harassment to the repository administrators.

---

## Development Setup

### Prerequisites
- OpenJDK 17 or higher
- Node.js 18 or higher with npm
- PostgreSQL 16 or higher
- Redis 7 (optional; defaults to in-memory cache)
- Git 2.30 or higher

### Local Initialization

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/<your-username>/Event-Booking-System.git
   cd Event-Booking-System
   ```

2. Provision the local development database:
   ```sql
   CREATE DATABASE event_booking_db;
   ```

3. Build and launch backend services:
   ```bash
   ./mvnw clean install -DskipTests
   ./mvnw spring-boot:run
   ```

4. Install frontend dependencies and launch dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Confirm service health:
   - Backend Actuator: `http://localhost:8080/actuator/health`
   - Frontend Application: `http://localhost:5173`
   - OpenAPI Documentation: `http://localhost:8080/swagger-ui.html`

---

## Repository Organization

```
Event-Booking-System/
|-- src/main/java/com/kritagya/event_booking_system/
|   |-- auth/           # Authentication controllers and token handling
|   |-- config/         # Spring infrastructure beans (Security, Redis, STOMP)
|   |-- controller/     # REST controllers (15)
|   |-- dto/            # Data transfer models and admin metrics
|   |-- entity/         # JPA entities extending BaseEntity
|   |-- enums/          # Enumerated business types
|   |-- exception/      # Centralized exception handling advice
|   |-- logging/        # Structured audit logger
|   |-- mapper/         # Explicit DTO-Entity mappers
|   |-- repository/     # Spring Data JPA repositories
|   |-- scheduler/      # Background execution tasks
|   |-- security/       # JWT filters, rate limiters, security config
|   |-- service/        # Domain services and transaction boundaries
|   |-- specification/  # Dynamic JPA Specifications
|   `-- websocket/      # STOMP seat state publishers
|-- src/main/resources/ # Configuration profiles
|-- src/test/           # Automated test suites
|-- frontend/           # React 19 single-page application
`-- pom.xml             # Maven dependencies
```

---

## Engineering Standards

### Java Backend

- **Language Version**: Java 17. Use records, pattern matching, and text blocks where appropriate.
- **Formatting**: 4 spaces indentation, maximum line length of 120 characters.
- **Layering Principles**:
  - Keep controllers thin. Controllers must only parse requests, validate DTOs via `@Valid`, invoke services, and return `ResponseEntity`.
  - Service classes must define transactional boundaries (`@Transactional`). Read-only methods should explicitly specify `@Transactional(readOnly = true)`.
  - Never expose JPA entities in controller method signatures or return types. Use explicit DTOs.
  - Implement custom exceptions mapped to appropriate HTTP status codes in `GlobalExceptionHandler`.
- **Naming Conventions**:
  - Classes: `PascalCase` (`BookingService`, `SeatController`)
  - Methods and fields: `camelCase` (`findAvailableSeats`, `totalAmount`)
  - Constants: `UPPER_SNAKE_CASE` (`DEFAULT_PAGE_SIZE`)

### React Frontend

- **Language and Version**: React 19 functional components with standard hooks (`useState`, `useEffect`, `useCallback`).
- **Styling**: Standard CSS tokens defined in `index.css`. Do not introduce third-party utility-class CSS frameworks without architectural alignment.
- **API Communication**: All network operations must funnel through the unified `frontend/src/services/api.js` client.

---

## Git Workflow and Branch Strategy

We operate using a structured feature-branch model based on `main`:

1. Ensure your local `main` is current with upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Create an isolated feature or fix branch:
   ```bash
   git checkout -b feat/seat-lock-timeout
   ```
3. Naming conventions for branches:
   - `feat/<short-description>`: New functional features
   - `fix/<short-description>`: Defect repairs
   - `docs/<short-description>`: Documentation additions
   - `refactor/<short-description>`: Code structure refactoring
   - `test/<short-description>`: Test suite expansion

---

## Commit Message Specifications

Commits must follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

[optional body explaining technical rationale]

[optional footer referencing issue or breaking changes]
```

### Recognized Types
- `feat`: Addition of user-facing functionality.
- `fix`: Resolution of a defect or bug.
- `docs`: Documentation modifications only.
- `refactor`: Code restructuring without functional behavior modification.
- `test`: Addition or modification of automated tests.
- `chore`: Build tooling, dependency management, or internal scripts.
- `perf`: Optimizations targeted at execution latency or memory footprint.

### Examples
- `feat(seat): add temporary seat lock endpoint and background scheduler`
- `fix(booking): prevent double-booking race condition via optimistic locking`
- `docs(api): document missing query parameters for event search`

---

## Pull Request Requirements

Before opening a pull request, complete the following verification steps:

1. Confirm compilation succeeds cleanly:
   ```bash
   ./mvnw test-compile
   ```
2. Execute the backend test suite:
   ```bash
   ./mvnw test
   ```
3. Confirm the frontend bundles without errors:
   ```bash
   cd frontend && npm run build
   ```
4. Verify working tree is clean and commits are logically grouped.
5. Provide a clear pull request description outlining:
   - The problem or feature addressed
   - Technical approach taken
   - Automated tests added or modified

---

## Testing Standards

- **Backend**: Every service mutation and controller endpoint must have corresponding test coverage.
- **Fixtures**: Use the embedded H2 database configuration for integration tests to ensure test isolation.
- **Mocking**: Isolate third-party services (SMTP email delivery, filesystem storage) using Mockito mocks (`@MockitoBean`).
- **Structure**: Organize tests using the Arrange-Act-Assert (AAA) pattern with descriptive method names.

---

## Issue Reporting

### Defect Reports
When filing an issue, provide sufficient context for reproduction:
- Operating system and Java runtime version
- Database engine and deployment topology
- Exact reproduction steps with sample payloads
- Stack trace extracts from application log files

### Feature Inquiries
For functional changes, outline:
- Use case and domain motivation
- Proposed endpoint or interface design
- Potential concurrency or data migration implications
