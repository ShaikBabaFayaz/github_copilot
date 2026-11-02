---
applyTo: "**"
---

# Testing Instructions

- Every implemented task needs at least one happy-path test and one edge-case test (missing
  field, "Not Found", empty input/repo) — this is checked by both
  `implementation-reviewer` (Step 6, reviewing for presence) and `verification` (Step 7,
  actually running them).
- Prefer real assertions over smoke tests — a test that can never fail is worse than no test,
  because it hides missing coverage from the checklist.
- Don't mock a dependency you can run for real in the target project (e.g. a local database in
  `docker-compose.yml`); mock only external services you can't run locally.
- Test file naming and framework should match whatever `impl-plan.md`'s target stack implies;
  if none is established yet, ask before introducing a new test framework.
