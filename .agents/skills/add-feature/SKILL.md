---
name: add-feature
description: >-
  Use this skill when adding a new feature, endpoint, or domain capability to the
  Spring Boot backend. This includes new REST endpoints, new service methods, new
  entities, or extending existing feature flows with significant new behavior.
---

# Add Feature Workflow

For implementing new features in the event booking system.

## Steps

1. **Understand the feature scope**
   - Clarify what the feature should do, which domain entities are involved, and what API endpoints are needed.
   - Identify the relevant application flow (Controller → Service → Repository).

2. **Inspect related existing code**
   - Read the existing controller, service interface, service implementation, and repository for the relevant domain.
   - Read related DTOs and entity classes.
   - Check existing enums if the feature involves status fields.
   - **Do not** read unrelated domain packages.

3. **Reuse existing patterns**
   - Follow the same code structure as existing features in this project.
   - Use the same DTO conventions (separate Request/Response DTOs).
   - Use the same mapper patterns.
   - Use the same exception handling patterns.
   - Use the same validation annotation style.

4. **Implement the feature**
   - Create or modify files in this order: Entity → Enum (if needed) → Repository → DTO → Mapper → Service Interface → ServiceImpl → Controller.
   - Use constructor injection (Lombok `@RequiredArgsConstructor`).
   - Add proper validation annotations on request DTOs.
   - Add `@Transactional` on service methods as appropriate.

5. **Add tests**
   - Create or update the relevant test class (e.g., `BookingServiceTest`).
   - Test the happy path and key error cases.
   - Run the specific test: `./mvnw test -Dtest=NewFeatureTest`.

6. **Verify**
   - Ensure compilation succeeds: `./mvnw compile`.
   - Run related tests to confirm no regressions.
   - Summarize all created/modified files.

## Anti-Patterns (Do NOT)

- Do not scan the entire project before starting.
- Do not read all 15 controllers to understand patterns — one or two similar ones are enough.
- Do not modify unrelated features.
- Do not add new dependencies without explicit justification.

