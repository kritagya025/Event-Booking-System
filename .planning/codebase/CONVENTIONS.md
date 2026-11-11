---
last_mapped_commit: 2e8f2f230d41c144fee000103e22e13cea755041
last_mapped_at: 2026-11-11
---
# Coding Conventions & Best Practices

**Analysis Date:** 2026-11-11

## 1. Backend Java & Spring Boot Conventions

### Dependency Injection
- **Rule:** Always use **constructor injection**; never use field injection (`@Autowired` on private fields).
- **Pattern:** Use Lombok's `@RequiredArgsConstructor` with `private final` fields:
  ```java
  @Service
  @RequiredArgsConstructor
  public class BookingServiceImpl implements BookingService {
      private final BookingRepository bookingRepository;
      private final EventRepository eventRepository;
      private final EmailService emailService;
  }
  ```

### Controller Design
- **REST Semantic Verbs:**
  - `GET`: Read operations (safe, idempotent, no side effects)
  - `POST`: Resource creation or state-changing actions
  - `PUT`: Full resource replacement
  - `PATCH`: Partial updates
  - `DELETE`: Resource removal
- **Validation:** Always annotate request DTO parameters with `@Valid` or `@Validated`.
- **Response Wrapping:** Return explicit `ResponseEntity<T>` with accurate HTTP status codes:
  ```java
  @PostMapping
  public ResponseEntity<BookingResponse> createBooking(
          @Valid @RequestBody BookingCreateRequest request,
          @AuthenticationPrincipal UserDetails userDetails) {
      BookingResponse response = bookingService.createBooking(request, userDetails.getUsername());
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
  ```
- **API Documentation:** Annotate endpoints with SpringDoc annotations (`@Operation(summary = "...")`, `@ApiResponse`).

### Service Layer Boundaries
- **Interface Segregation:** Every service must declare an interface in `com.kritagya.event_booking_system.service` and implement it in `com.kritagya.event_booking_system.service.impl`.
- **Transaction Discipline:**
  - Read-only methods: `@Transactional(readOnly = true)`
  - Mutating methods: `@Transactional`
- **Entity Exposure Rule:** **Never** return JPA entities directly from controller endpoints. Always transform entities to Response DTOs before crossing the controller boundary to prevent infinite JSON recursion and leaky abstractions.

### Entity & JPA Practices
- Always extend `BaseEntity` for consistent `id`, `createdAt`, and `updatedAt`.
- Explicitly define column constraints (`@Column(nullable = false, length = 100)`).
- Use fetch type `LAZY` for all `@ManyToOne` and `@OneToMany` relationships to avoid `N+1` query traps.
- Use enums with `@Enumerated(EnumType.STRING)` (never `ORDINAL`).

### Error Handling Pattern
- Throw domain-specific runtime exceptions rather than generic `RuntimeException` or `Exception`:
  ```java
  Event event = eventRepository.findById(eventId)
      .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
  ```
- All exceptions are caught and transformed into structured JSON responses by `GlobalExceptionHandler.java`.

---

## 2. Frontend React Conventions

### Component Architecture
- Use functional components with React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- Keep components focused and modular (single responsibility).
- Handle loading and error states explicitly in all data-fetching views.

### Network Requests & Authentication
- Every `fetch` request calling the backend must include `credentials: 'include'` so that HttpOnly authentication cookies are transmitted:
  ```javascript
  const response = await fetch('/api/bookings/my-bookings', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  ```
- Parse JSON safely and check `response.ok` before consuming payloads.

### Styling & Design System
- Utilize Tailwind utility classes for all layout, spacing, typography, and responsive breakpoints.
- Support standard responsive viewport breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px).
- Provide accessible form inputs by always pairing `<label htmlFor="id">` with `<input id="id">`.

---

## 3. Git Commit Conventions

All commits follow the **Conventional Commits** specification:
- `feat: <description>` — New feature or capability
- `fix: <description>` — Bug fix or error resolution
- `refactor: <description>` — Code change that neither fixes a bug nor adds a feature
- `test: <description>` — Adding or improving test suites
- `docs: <description>` — Documentation, README, or planning updates
- `chore: <description>` — Build, dependencies, or toolchain maintenance

---

*Conventions analysis: 2026-11-11*
*Update after adopting new coding guidelines or team standards*
