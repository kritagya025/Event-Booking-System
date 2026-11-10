---
name: debug
description: >-
  Use this skill when debugging an error, exception, test failure, or unexpected behavior
  in the Spring Boot backend. This includes stack trace analysis, endpoint debugging,
  test failures, and runtime errors.
---

# Debug Workflow

For diagnosing and fixing errors in the event booking system.

## Steps

1. **Understand the problem**
   - Read the error message, stack trace, or description of unexpected behavior.
   - Identify the exception type, the class/method where it occurred, and the expected vs. actual behavior.

2. **Locate the relevant code**
   - Search for the exact class, method, or endpoint mentioned in the error.
   - Do **not** browse the entire project — go directly to the source of the error.

3. **Trace the execution path**
   - Follow only the relevant call chain: Controller → Service → Repository (or wherever the error originates).
   - Read immediate dependencies (DTOs, entities, mappers) only if needed to understand the bug.
   - Check configuration files only if the error is configuration-related.

4. **Identify root cause**
   - Determine whether the issue is in business logic, data mapping, validation, database queries, security config, or external integration.
   - Check for common Spring Boot issues:
     - `LazyInitializationException` → missing `@Transactional` or fetch strategy.
     - `ConstraintViolationException` → validation or DB constraint issue.
     - `403 Forbidden` → security configuration.
     - `NullPointerException` → missing null checks or uninitialized optional.
     - Test failures → mock setup, assertion logic, or test data issues.

5. **Implement the fix**
   - Apply the smallest safe fix that addresses the root cause.
   - Do not refactor unrelated code alongside the fix.
   - Preserve existing behavior for unaffected code paths.

6. **Add regression test (when appropriate)**
   - If the bug was not caught by existing tests, add a test case that reproduces it.
   - Run the specific test to confirm the fix: `./mvnw test -Dtest=RelevantTest`.

7. **Report**
   - Explain: root cause, what was changed, why, and test results.
   - Note any related areas that may need attention but were not modified.

## Anti-Patterns (Do NOT)

- Do not read all service implementations to find a bug in one service.
- Do not run the full test suite unless the fix touches shared infrastructure.
- Do not apply speculative fixes without understanding the root cause.
- Do not refactor code that is unrelated to the bug.

