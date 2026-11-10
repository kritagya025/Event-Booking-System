# Agent Instructions — Event Booking System

## Exploration Policy

- **Never** start ordinary tasks with a full repository scan or broad file listing.
- Identify the requested feature, class, endpoint, or error **first**.
- Use targeted file and symbol searches (grep, find-by-name) to locate relevant code.
- Read only the implementation files and their immediate dependencies.
- Expand exploration only when technically necessary and evidence-driven.
- Do **not** reread unchanged files across turns unnecessarily.

## Modification Policy

- Avoid unrelated refactoring — change only what the task requires.
- Preserve existing architecture, naming conventions, and code style.
- Never modify unrelated files or introduce unplanned changes.
- Do not assume project architecture without checking relevant evidence.

## Testing Policy

- Run focused, targeted tests before broader verification.
- Prefer running the single relevant test class first (e.g., `./mvnw test -pl . -Dtest=BookingServiceTest`).
- Run the full test suite only when cross-cutting changes justify it.

## Context Efficiency

- Consult `PROJECT_MAP.md` at the workspace root for a lightweight architecture reference when orientation is needed.
- Consult `.agents/PROJECT_STATE.md` for current development context when it is relevant to the task.
- Consult `.agents/rules/java-backend.md` for Java/Spring Boot conventions.
- Consult `.agents/rules/database.md` for database and JPA conventions.
- Consult `.agents/skills/` for reusable workflows (quick-change, add-feature, debug).
- Do **not** re-inspect `pom.xml`, `application.properties`, or configuration classes unless the task specifically involves them.

## Context Reuse

- Reuse information already established in the current conversation — do not re-read files whose contents are already known and unchanged.
- Avoid reopening unchanged files across turns.
- Consult `PROJECT_MAP.md` and `.agents/PROJECT_STATE.md` only when they add value, not routinely.
- Do **not** update documentation files after every minor code change.
- Never claim to remember file contents that are no longer available in context or may have changed externally.

## Exploration Budget (Starting Guidelines)

| Task Size | Initial File Budget | Scope |
|-----------|---------------------|-------|
| **Small** (fix a bug, tweak a field) | 1–3 files | Only the directly affected file(s). No architecture analysis. |
| **Medium** (add endpoint, modify feature) | 3–7 files | The relevant controller → service → repository flow and related DTOs. |
| **Large** (new module, cross-cutting concern) | Expand incrementally | Affected modules systematically. Create a short plan before coding. |
| **Repeated** | Minimal | Reuse established knowledge. Do not re-inspect unchanged files. |

These are starting guidelines, not hard limits. Correctness, security, and data integrity always take priority over budget constraints.

## Safety

- Never sacrifice correctness, security, or data integrity to reduce file reads.
- If uncertain, read more — but do so incrementally, not wholesale.

