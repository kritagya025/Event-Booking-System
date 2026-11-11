---
last_mapped_commit: 2e8f2f230d41c144fee000103e22e13cea755041
last_mapped_at: 2026-11-11
---
# Codebase Directory Structure & Organization

**Analysis Date:** 2026-11-11

## Repository Layout Overview

```
event-booking-system/
├── .agents/                      # Agent instruction rules, skills, and working state
│   ├── rules/                    # Specific language rules (java-backend.md, database.md)
│   ├── skills/                   # Local skills (add-feature, quick-change, debug)
│   └── PROJECT_STATE.md          # Working memory and current dev focus
├── .planning/                    # GSD (Get Shit Done) planning and codebase mapping
│   └── codebase/                 # 7 codebase reference maps
├── frontend/                     # React 19 + Vite + Tailwind frontend application
│   ├── public/                   # Static assets (favicons, images)
│   ├── src/
│   │   ├── assets/               # Local icons and SVGs
│   │   ├── components/           # UI components, modals, and views
│   │   ├── context/              # React Context providers (AuthContext, etc.)
│   │   ├── services/             # API client and WebSocket service modules
│   │   ├── App.jsx               # Main application routing and shell
│   │   ├── index.css             # Tailwind base styles and utility overrides
│   │   └── main.jsx              # Application bootstrap entry point
│   ├── package.json              # Frontend npm dependencies and scripts
│   ├── vite.config.js            # Vite configuration and backend API proxy
│   └── tailwind.config.js        # Tailwind CSS design system configuration
├── src/
│   ├── main/
│   │   ├── java/com/kritagya/event_booking_system/
│   │   │   ├── auth/             # Auth controllers, login/register request DTOs
│   │   │   ├── config/           # Spring configuration classes
│   │   │   ├── controller/       # REST API endpoints (15 controllers)
│   │   │   ├── dto/              # Request and Response transfer objects
│   │   │   │   └── admin/        # Admin dashboard and system metrics DTOs
│   │   │   ├── entity/           # JPA database entities (BaseEntity + 12 domain models)
│   │   │   ├── enums/            # State enums (Role, BookingStatus, PaymentStatus, etc.)
│   │   │   ├── exception/        # Custom runtime exceptions and GlobalExceptionHandler
│   │   │   ├── logging/          # HTTP request/response logging filters
│   │   │   ├── mapper/           # ModelMapper / manual entity-DTO transformers
│   │   │   ├── repository/       # Spring Data JPA repositories
│   │   │   ├── scheduler/        # Background scheduled tasks (booking expiration, etc.)
│   │   │   ├── security/         # SecurityFilterChain, JwtUtil, RateLimiter
│   │   │   ├── service/          # Service interfaces
│   │   │   │   └── impl/         # Service business logic implementations
│   │   │   ├── specification/    # Dynamic JPA specifications for query filtering
│   │   │   └── websocket/        # STOMP/SockJS handlers and message dispatchers
│   │   └── resources/
│   │       ├── application.properties         # Shared application configuration
│   │       ├── application-dev.properties     # Development profile
│   │       ├── application-prod.properties    # Production profile
│   │       └── application-test.properties    # Test runner profile
│   └── test/
│       └── java/com/kritagya/event_booking_system/
│           ├── controller/       # Controller web layer MockMvc tests
│           ├── repository/       # DataJpaTest repository tests
│           ├── security/         # Security and JWT validation test suites
│           └── service/          # Service layer Mockito unit tests
├── pom.xml                       # Maven build descriptor and dependencies
├── mvnw / mvnw.cmd               # Maven wrappers for Linux/macOS and Windows
├── PROJECT_MAP.md                # Fast architecture orientation index
└── README.md                     # Project documentation and setup guide
```

---

## Where to Place New Code

| If You Are Adding... | Place It In... | File Naming Pattern |
| :--- | :--- | :--- |
| **New REST Endpoint** | `src/main/java/.../controller/` | `[Entity]Controller.java` |
| **New Service Contract** | `src/main/java/.../service/` | `[Entity]Service.java` |
| **Service Implementation** | `src/main/java/.../service/impl/` | `[Entity]ServiceImpl.java` |
| **New Request/Response DTO** | `src/main/java/.../dto/` | `[Action][Entity]Request.java`, `[Entity]Response.java` |
| **New Database Entity** | `src/main/java/.../entity/` | `[Entity].java` (extends `BaseEntity`) |
| **New Repository Query** | `src/main/java/.../repository/` | `[Entity]Repository.java` |
| **Dynamic Search Query** | `src/main/java/.../specification/` | `[Entity]Specification.java` |
| **Custom Domain Exception** | `src/main/java/.../exception/` | `[Problem]Exception.java` |
| **Backend Unit Test** | `src/test/java/.../service/` | `[Entity]ServiceTest.java` |
| **Controller Integration Test**| `src/test/java/.../controller/` | `[Entity]ControllerTest.java` |
| **Frontend UI Component** | `frontend/src/components/` | `[FeatureName].jsx` |
| **Frontend API Service** | `frontend/src/services/` | `[feature]Service.js` |

---

## File Naming Conventions

### Backend (Java)
- **Classes & Interfaces:** `UpperCamelCase` (e.g., `BookingServiceImpl`, `TicketRepository`).
- **Methods & Variables:** `lowerCamelCase` (e.g., `findActiveEventsByCategory()`, `seatLockTimeout`).
- **Constants & Enums:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`, `BookingStatus.CONFIRMED`).
- **Packages:** `lowercase_with_underscores` or `lowercase` (e.g., `com.kritagya.event_booking_system.controller`).

### Frontend (JavaScript / React)
- **Component Files:** `UpperCamelCase.jsx` (e.g., `BookingModal.jsx`, `SeatSelector.jsx`).
- **Utility / Service Modules:** `lowerCamelCase.js` (e.g., `apiClient.js`, `websocketService.js`).
- **CSS / Styles:** `lower-kebab-case.css` or Tailwind utility classes directly in JSX.

---

*Structure analysis: 2026-11-11*
*Update after moving folders or introducing new package categories*
