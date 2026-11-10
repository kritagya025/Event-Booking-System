# Java & Spring Boot Backend Conventions

Apply these conventions when working on Java files in this Spring Boot project.

## Java Coding Conventions

- Java 17 with modern language features (records, text blocks, sealed classes where appropriate).
- Use Lombok annotations (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Getter`, `@Setter`) — this project depends on Lombok.
- Follow standard Java naming: `PascalCase` for classes, `camelCase` for methods/fields, `UPPER_SNAKE_CASE` for constants.
- Keep methods focused and short. Extract private helpers for complex logic.
- Use `final` for method parameters and local variables where practical.

## Spring Boot Architecture

- **Layered architecture**: Controller → Service (interface) → ServiceImpl → Repository → Entity.
- Services have an interface in `service/` and implementation in `service/impl/`.
- Each domain entity has its own controller, service, repository, and DTOs.
- Configuration classes are in the `config/` package.
- Security classes are in the `security/` package.

## Dependency Injection

- **Always** use constructor injection (Lombok `@RequiredArgsConstructor` or explicit constructors).
- Never use `@Autowired` on fields.

## DTOs and Validation

- Request and response DTOs are separate (`*RequestDTO`, `*ResponseDTO`).
- Admin-specific DTOs are in `dto/admin/`.
- Use Jakarta Bean Validation annotations (`@NotNull`, `@NotBlank`, `@Size`, `@Valid`, etc.).
- Validate request DTOs at the controller level with `@Valid`.
- Use mappers in the `mapper/` package to convert between entities and DTOs.

## Exception Handling

- Use a centralized `@RestControllerAdvice` global exception handler.
- Define domain-specific exceptions in the `exception/` package.
- Return consistent error response structures.
- Never expose stack traces or internal details to API consumers.

## REST API Conventions

- Controllers are annotated with `@RestController` and `@RequestMapping`.
- Use proper HTTP methods: `GET` (read), `POST` (create), `PUT` (full update), `PATCH` (partial), `DELETE`.
- Return appropriate HTTP status codes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `500`).
- Use `ResponseEntity<>` for explicit status control.
- API documentation via SpringDoc OpenAPI (`/swagger-ui.html`).

## JPA and Hibernate

- Entities extend `BaseEntity` where applicable (provides common audit fields).
- Use JPA annotations (`@Entity`, `@Table`, `@Column`, `@ManyToOne`, `@OneToMany`, etc.).
- Prefer `FetchType.LAZY` for associations; use `@EntityGraph` or fetch joins for eager loading when needed.
- Use enums from the `enums/` package for status fields (e.g., `BookingStatus`, `PaymentStatus`, `EventStatus`).
- Avoid `CascadeType.ALL` unless the relationship truly warrants it.

## Transaction Management

- Service methods that modify data should be `@Transactional`.
- Read-only operations should use `@Transactional(readOnly = true)`.
- Keep transactions as short as possible.
- Be aware of `LazyInitializationException` — fetch needed data within the transaction boundary.

## Testing Conventions

- Unit tests use JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`).
- Test classes are in `src/test/java/` mirroring the main package structure.
- Test file naming: `*Test.java` (e.g., `BookingServiceTest.java`).
- H2 in-memory database for repository integration tests.
- Spring Security test support via `spring-security-test`.
- Run a specific test: `./mvnw test -Dtest=ClassName`.
- Run all tests: `./mvnw test`.

## Dependency Management

- Maven with `pom.xml`. Use Spring Boot starter dependency management.
- Do not add dependencies without clear justification.
- Prefer Spring Boot starters over manually managed library versions.
- Keep `pom.xml` organized by category (core, security, documentation, testing, etc.).

