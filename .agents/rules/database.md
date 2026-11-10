# Database & JPA Conventions

Apply these conventions when working on entities, repositories, database queries, or schema changes.

## Entity Design

- Entities are in `com.kritagya.event_booking_system.entity`.
- Extend `BaseEntity` for common audit fields (created/updated timestamps).
- Use meaningful table and column names via `@Table(name = "...")` and `@Column(name = "...")`.
- Define bidirectional relationships carefully — set the owning side explicitly.
- Use `@JoinColumn` on the owning side of `@ManyToOne` / `@OneToOne`.
- Map enums with `@Enumerated(EnumType.STRING)` — never use `ORDINAL`.

## Spring Data JPA Repositories

- Repositories extend `JpaRepository<Entity, Long>` (or the appropriate ID type).
- Repository interfaces are in `com.kritagya.event_booking_system.repository`.
- Use derived query methods for simple queries (`findByEmail`, `findByEventId`, etc.).
- Use `@Query` with JPQL for complex queries.
- Use Specification pattern (classes in `specification/`) for dynamic filtering.
- Return `Optional<Entity>` for single-result lookups.

## Query Best Practices

- Prefer JPQL over native SQL unless performance requires it.
- Use parameterized queries — never concatenate user input into queries.
- Use pagination (`Pageable`, `Page<T>`) for list endpoints.
- Avoid N+1 queries: use `@EntityGraph`, `JOIN FETCH`, or `@BatchSize`.

## Database Information

- **Production database**: PostgreSQL (driver: `org.postgresql`).
- **Test database**: H2 in-memory.
- Configuration profiles: `application.properties`, `application-dev.properties`, `application-prod.properties`.
- The project uses JPA/Hibernate DDL auto-generation (check `spring.jpa.hibernate.ddl-auto` in properties).

## Transaction Guidelines

- Service-layer methods that write data must be `@Transactional`.
- Use `@Transactional(readOnly = true)` for read-only service methods.
- Avoid long-running transactions; keep business logic outside the transaction where possible.
- Handle `OptimisticLockException` / `PessimisticLockException` gracefully when concurrency is a concern.

## Indexing

- Add database indexes for frequently queried columns (foreign keys, status fields, date ranges).
- Use `@Table(indexes = {...})` or manage indexes via migration scripts.
- Consider composite indexes for multi-column WHERE clauses.

## Concurrency and Data Integrity

- Use optimistic locking (`@Version`) for entities with concurrent updates.
- Use unique constraints (`@Column(unique = true)`) for business-key uniqueness.
- Handle constraint violations gracefully with proper error messages.
- Be cautious with `CascadeType.REMOVE` — prefer explicit deletion to avoid unintended cascading.

## Schema Changes

- Test schema changes against the H2 test database first.
- Verify that new columns have sensible defaults or are nullable.
- Never drop columns or tables without confirming no code references remain.
- Update related DTOs, mappers, and tests after schema changes.

