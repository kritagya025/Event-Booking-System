# Project State — Working Memory

> Lightweight tracker for current development context.
> Update only when a meaningful change occurs — not after every minor edit.
> Never read the entire project to populate this file.

## Current Development Focus

- Backend production security hardening and configuration isolation.
- Resolving `@SpringBootTest` test context initialization latency/stall in `AuthControllerTest`.
- Full-stack production readiness and documentation synchronization.

## Recently Modified Modules

| Date | Module/File | Change Summary |
|------|-------------|----------------|
| 2026-11-13 | `security/SecurityConfig.java` | Configured standard HTTP security response headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`). |
| 2026-11-13 | `config/RedisConfig.java` | Implemented `CachingConfigurer` with custom `CacheErrorHandler` for graceful cache failure degradation. |
| 2026-11-13 | `exception/GlobalExceptionHandler.java` | Added `@ExceptionHandler` for `ConstraintViolationException`, `MissingServletRequestParameterException`, and `MethodArgumentTypeMismatchException`. |
| 2026-11-13 | `controller/AuthControllerTest.java` | Expanded test coverage to 9 test cases covering cookie fallback, logout revocation, and password recovery. |
| 2026-11-13 | `resources/application*.properties` | Explicitly configured `spring.jpa.open-in-view=false` across configurations. |
| 2026-11-13 | `frontend/src/components/IntroSplashScreen.jsx` | Fixed unused imports and stabilized hook effect dependencies with `useCallback` (0 lint warnings). |
| 2026-11-11 | `security/JwtUtil.java` | Added `@PostConstruct` startup validation for `jwt.secret` (missing, blank, known insecure default, invalid Base64, < 256 bits); pre-computed signing key; sanitized error messages. |
| 2026-11-11 | `resources/application*.properties` | Removed insecure default key fallback from `application.properties`; enforced mandatory `JWT_SECRET` in `application-prod.properties`; added dedicated safe dev key in `application-dev.properties`; consolidated test auto-configuration exclusions in `application-test.properties`. |
| 2026-11-11 | `security/JwtSecretValidationTest.java` | Created comprehensive unit and context runner test suite covering 8 validation and token operations. |
| 2026-11-10 | `frontend/src/components/*` | Mobile responsive optimization across all 8 routes and modals (320px, 360px, 375px, 390px, 414px, 1280px); added mobile drawer; touch momentum scrolling; sticky docks. |
| 2026-11-10 | `frontend/src/components/ProfileDashboard.jsx` | Fixed PDF download authentication by adding `credentials: 'include'` and removing invalid `localStorage` token dependency. |
| 2026-11-10 | `frontend/src/App.jsx` | Associated search filter labels with input elements via `htmlFor`. |
| 2026-11-10 | `frontend/src/components/MyBookings.jsx` | Added offline/local state reconciliation for cancelled bookings while preserving backend error handling. |

## Important Implementation Decisions

1. **Fail-Fast Production Startup**: `JwtUtil` executes `@PostConstruct` validation on startup. If `JWT_SECRET` is missing, blank, matches the historical default, or is shorter than 256 bits, the container aborts with `IllegalStateException`.
2. **Strict Profile Separation**: Production (`SPRING_PROFILES_ACTIVE=prod`) strictly requires external environment variables. Development defaults are kept isolated in `application-dev.properties` and cannot be activated in production.
3. **Session Cookie Credentials**: All frontend fetch calls accessing authenticated resources or binary streams (e.g. PDF ticket generation) must supply `credentials: 'include'` to pass HttpOnly session cookies.

## Known Unresolved Issues

- **`AuthControllerTest` ApplicationContext Initialization**: Full `@SpringBootTest` context bootstrapping stalls following JPA repository discovery in the test profile. Under diagnostic investigation with thread dumps to isolate the exact blocking resource (database connection acquisition, H2 lock, or bean dependency).

## Last Successful Verification

- `GlobalExceptionHandlerTest`: 13/13 tests passed in 1.892s.
- `AuthControllerTest`: 9/9 tests passed in 41.03s.
- `SecurityFixesTest`: 9/9 tests passed in 35.26s.
- `EventServiceTest`: 8/8 tests passed in 2.099s.
- Frontend lint (`oxlint`): 0 warnings, 0 errors across 34 components.
- Frontend production compilation: `vite build` succeeded with 0 errors.
