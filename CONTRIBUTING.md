# 🤝 Contributing — Event Booking System

Thank you for your interest in contributing to the Event Booking System! This document provides guidelines and instructions for contributing to this project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Event-Booking-System.git
   cd Event-Booking-System
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/kritagya025/Event-Booking-System.git
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Setup

### Prerequisites

- Java JDK 17+
- Node.js 18+
- PostgreSQL 16+
- Redis 7+ (optional)
- Maven 3.9+ (wrapper included)

### 1. Database Setup

```sql
CREATE DATABASE event_booking_db;
```

### 2. Backend Setup

```bash
# From project root
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Run Both Together

```bash
npm install     # Install root dependencies
npm run dev     # Starts backend + frontend concurrently
```

### 5. Verify Setup

- Backend: http://localhost:8080/actuator/health
- Frontend: http://localhost:5173
- Swagger: http://localhost:8080/swagger-ui.html

---

## Project Structure

```
event-booking-system/
├── src/main/java/com/kritagya/event_booking_system/
│   ├── auth/           # Authentication module
│   ├── config/         # Application configuration
│   ├── controller/     # REST controllers
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA entities
│   ├── enums/          # Enum types
│   ├── exception/      # Exception handling
│   ├── logging/        # Audit logging
│   ├── mapper/         # Entity ↔ DTO mappers
│   ├── repository/     # JPA repositories
│   ├── scheduler/      # Scheduled tasks
│   ├── security/       # Security configuration
│   ├── service/        # Business logic
│   ├── specification/  # JPA Specifications
│   └── websocket/      # WebSocket publishers
├── src/main/resources/
│   └── application.properties
├── src/test/
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API & WebSocket clients
│   │   ├── App.jsx     # Main application
│   │   └── index.css   # Global styles
│   └── package.json
└── pom.xml
```

---

## Coding Standards

### Java (Backend)

- **Java Version**: 17 (use modern language features)
- **Formatting**: 4-space indentation, 120 character line width
- **Naming**:
  - Classes: `PascalCase` (e.g., `EventService`, `BookingResponseDTO`)
  - Methods/Variables: `camelCase` (e.g., `createEvent`, `totalAmount`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `QR_WIDTH`)
  - Packages: `lowercase` (e.g., `com.kritagya.event_booking_system.service`)
- **Annotations**: Place on separate lines above the annotated element
- **DTOs**: Use separate Request and Response DTOs; never expose entities directly
- **Services**: Keep business logic in service layer, not controllers
- **Repositories**: Use Spring Data JPA conventions; custom queries via `@Query`
- **Exceptions**: Create specific exception classes; handle in `GlobalExceptionHandler`
- **Validation**: Use Jakarta Bean Validation annotations (`@NotBlank`, `@Min`, `@Email`)
- **Transactions**: Use `@Transactional` on service methods that modify data

### React (Frontend)

- **Framework**: React 19 with functional components and hooks
- **Styling**: Vanilla CSS (no TailwindCSS)
- **State**: `useState` and `useEffect` (no external state management)
- **API Calls**: Use the centralized `api.js` service
- **Components**: One component per file, named with PascalCase

### General

- Write self-documenting code with meaningful names
- Add comments only for non-obvious logic
- Keep functions focused and short (single responsibility)
- Don't leave `console.log` statements in production code
- Don't commit secrets, credentials, or `.env` files

---

## Git Workflow

We use a **feature branch workflow**:

1. Keep `main` branch always deployable
2. Create feature branches from `main`
3. Use descriptive branch names:
   - `feature/add-waitlist-notifications`
   - `bugfix/fix-seat-locking-race-condition`
   - `docs/update-api-documentation`
   - `refactor/extract-payment-service`
4. Keep branches focused on a single feature or fix
5. Rebase on `main` before creating a PR

```bash
# Sync with upstream
git fetch upstream
git rebase upstream/main

# Push feature branch
git push origin feature/your-feature-name
```

---

## Commit Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons) |
| `refactor` | Code refactoring (no feature/fix) |
| `test` | Adding or modifying tests |
| `chore` | Build, CI, dependency updates |
| `perf` | Performance improvements |

### Examples

```
feat(booking): add coupon code validation during booking creation
fix(seat): resolve race condition in concurrent seat locking
docs(api): add missing query parameters to search endpoint
refactor(auth): extract token rotation logic into separate method
test(event): add unit tests for EventService search functionality
```

---

## Pull Request Process

### Before Submitting

1. ✅ Ensure your code compiles: `./mvnw compile`
2. ✅ Run backend tests: `./mvnw test`
3. ✅ Frontend builds successfully: `cd frontend && npm run build`
4. ✅ No new warnings or lint errors
5. ✅ Update documentation if adding/changing API endpoints
6. ✅ Add tests for new functionality

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Backend tests pass
- [ ] Frontend builds
- [ ] Manual testing completed

## Screenshots (if UI changes)
```

### Review Process

1. Submit PR against `main` branch
2. Ensure CI checks pass
3. Address review feedback
4. Maintainer approves and merges

---

## Testing Guidelines

### Backend Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=EventServiceTest

# Run with test coverage
./mvnw test jacoco:report
```

### Test Structure

```
src/test/java/com/kritagya/event_booking_system/
├── controller/     # Controller integration tests
├── repository/     # Repository tests
├── service/        # Service unit tests
└── EventBookingSystemApplicationTests.java
```

### Testing Conventions

- Use H2 in-memory database for tests (already configured)
- Mock external dependencies (email, file storage)
- Test both success and failure paths
- Use descriptive test method names: `shouldCreateBookingWhenSeatsAreAvailable()`
- Follow Arrange-Act-Assert (AAA) pattern

### Frontend Tests

Currently using manual testing. Consider adding:
- Component tests with React Testing Library
- API integration tests

---

## Reporting Issues

### Bug Reports

When filing a bug, include:

1. **Environment**: OS, Java version, Node version, browser
2. **Steps to reproduce**: Exact steps to trigger the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots/Logs**: If applicable
6. **Error messages**: Full stack traces

### Feature Requests

When requesting a feature:

1. **Problem statement**: What problem does this solve?
2. **Proposed solution**: Your suggested approach
3. **Alternatives considered**: Other solutions you thought of
4. **Use case**: Who benefits and how?

---

## Questions?

If you have questions about contributing, feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing! 🎉
