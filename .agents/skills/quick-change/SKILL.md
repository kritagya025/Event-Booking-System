---
name: quick-change
description: >-
  Use this skill for small, focused code changes: fixing a bug, adding a field,
  tweaking validation, updating a single method, or making a minor configuration change.
  Do not use for new features or multi-file architectural changes.
---

# Quick Change Workflow

For small, targeted modifications to existing code.

## Steps

1. **Identify the target**
   - Determine the exact class, method, endpoint, or configuration to modify.
   - Search for it by name — do not browse the full project.

2. **Read only the relevant file(s)**
   - Open the target file and read only the relevant section.
   - If the change depends on another class (e.g., a DTO or entity), read only that dependency.

3. **Make the minimal modification**
   - Change only what the task requires.
   - Preserve existing code style, comments, and formatting.
   - Do not refactor surrounding code unless explicitly requested.

4. **Run targeted verification**
   - If a corresponding test file exists, run it: `./mvnw test -Dtest=RelevantTest`.
   - If the change is purely cosmetic or a configuration tweak, compilation verification is sufficient.

5. **Report**
   - List the file(s) changed and summarize what was modified.
   - Note if any test was run and its result.

## Anti-Patterns (Do NOT)

- Do not scan the entire `src/` directory.
- Do not read `pom.xml` unless the change involves dependencies.
- Do not read unrelated controllers, services, or entities.
- Do not run the full test suite for a single-file change.

