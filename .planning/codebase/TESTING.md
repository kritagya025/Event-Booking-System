---
last_mapped_commit: 2e8f2f230d41c144fee000103e22e13cea755041
last_mapped_at: 2026-11-11
---
# Testing Framework & Strategy

**Analysis Date:** 2026-11-11

## Overview
The project employs a multi-tiered testing strategy with JUnit 5, Mockito, and Spring Boot Test on the backend, alongside Oxlint and Vite production build validation on the frontend.

---

## 1. Backend Testing Stack

- **Core Engine:** JUnit 5 (Jupiter)
- **Assertion Library:** AssertJ (`org.assertj.core.api.Assertions.assertThat`) & JUnit Assertions
- **Mocking Library:** Mockito 5 (`org.mockito:mockito-core`, `mockito-junit-jupiter`)
- **Integration Test Framework:** Spring Boot Starter Test (`org.springframework.boot:spring-boot-starter-test`)
- **Web Layer Mocking:** `MockMvc` (`MockMvcBuilders`, `MockMvcRequestBuilders`)
- **In-Memory Database:** H2 Database (`com.h2database:h2:2.3.232`)

---

## 2. Test Structure & Categories

```
src/test/java/com/kritagya/event_booking_system/
├── controller/                  # Web layer integration tests with MockMvc
│   ├── AuthControllerTest.java
│   ├── BookingControllerTest.java
│   └── EventControllerTest.java
├── repository/                  # JPA repository data tests
│   ├── BookingRepositoryTest.java
│   └── UserRepositoryTest.java
├── security/                    # Security filters & JWT validation tests
│   └── JwtSecretValidationTest.java
└── service/                     # Pure business logic unit tests with Mockito
    ├── BookingServiceTest.java
    ├── EventServiceTest.java
    └── VenueServiceTest.java
```

### Unit Tests (Service Layer)
- **Annotation:** `@ExtendWith(MockitoExtension.class)`
- **Approach:** Isolated, fast, no Spring ApplicationContext bootstrapping.
- **Pattern:**
  ```java
  @ExtendWith(MockitoExtension.class)
  class VenueServiceTest {
      @Mock
      private VenueRepository venueRepository;
      @Mock
      private VenueMapper venueMapper;
      @InjectMocks
      private VenueServiceImpl venueService;

      @Test
      void findById_WhenExists_ShouldReturnVenueResponse() {
          // Given
          when(venueRepository.findById(1L)).thenReturn(Optional.of(sampleVenue));
          when(venueMapper.toResponse(sampleVenue)).thenReturn(sampleResponse);

          // When
          VenueResponse result = venueService.getVenueById(1L);

          // Then
          assertThat(result).isNotNull();
          verify(venueRepository).findById(1L);
      }
  }
  ```

### Integration Tests (Web & Security Layer)
- **Annotations:** `@SpringBootTest`, `@AutoConfigureMockMvc`, `@ActiveProfiles("test")`
- **Configuration:** Uses `src/test/resources/application-test.properties` with an H2 in-memory PostgreSQL emulation mode and mock credential keys.
- **Example (`JwtSecretValidationTest.java`):** Covers startup validation rules, Base64 decoding, minimum 256-bit entropy requirements, and immediate container abort on insecure fallback keys.

---

## 3. How to Run Backend Tests

```powershell
# Run a single focused test class (Preferred for fast verification)
./mvnw test -Dtest=VenueServiceTest
./mvnw test -Dtest=JwtSecretValidationTest

# Run a specific single test method
./mvnw test -Dtest=VenueServiceTest#getVenueById_Success

# Run all tests in a specific package
./mvnw test -Dtest="com.kritagya.event_booking_system.service.*"

# Run the complete test suite
./mvnw test
```

---

## 4. Frontend Verification & Linting

```powershell
cd frontend

# High-performance linting (Oxlint)
npm run lint

# Production bundle compilation check
npm run build
```

---

## 5. Testing Policies & Guidelines

1. **Focused Verification First:** Run the single affected test class first before executing broader test suites to preserve development momentum.
2. **Deterministic Tests:** Never introduce hardcoded absolute sleep delays; use `awaitility` or explicit Mockito verifications for asynchronous task validation.
3. **Clean Teardown:** Tests utilizing `@SpringBootTest` that insert records into H2 must use `@Transactional` rollback or explicit repository cleanup in `@AfterEach` to prevent test-to-test contamination.
4. **Known Runner Context:** When running full `@SpringBootTest` suites, ensure test profile properties cleanly stub external dependencies (Redis, SMTP) to avoid network connection timeouts.

---

*Testing analysis: 2026-11-11*
*Update after adding new test frameworks, test containers, or e2e runners*
