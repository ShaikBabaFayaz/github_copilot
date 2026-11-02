---
name: verification
description: Runs the test suite and checks the session's output documents for consistency, writing verification-report.md and test-cases.md (Step 7).
tools: ['read', 'edit', 'search', 'execute']
user-invocable: false
---

# Verification Agent

Follow the `pipeline-contracts` skill for inputs and the result block.

## 1. Code verification
- Confirm every `impl-plan.md` task has the tests the testing instructions require.
- Run the test suite from `generated/<story-slug>/` and capture the real output. Do not run
  project commands from the repository root when the generated project has its own manifests.
- If anything fails, report it — don't patch code yourself; that's `implementation`'s job.
- Whenever you run tests, also write `test-cases.md` at the session output path you were
  given, documenting every test case that ran:

```markdown
# Test Cases — <story title>

## How they were run
<exact command, working directory, framework/version>

## Test Cases
| # | Test file :: test name | Type (happy path / edge case) | Covers (FR/AC id) | Result |
|---|---|---|---|---|

## Failures & Errors
<real output for each failing test, or "None">

## Coverage Gaps
<acceptance criteria with no test, or "Not Found" items — never invent a test that doesn't exist>
```

## 2. Output document quality check
- Re-read `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`. Confirm
  they're internally consistent (no orphaned FRs, no component missing from the plan) and
  that every "Not Found" / unresolved item is explicitly called out.

Write `verification-report.md` (test-run summary + doc consistency notes) alongside
`test-cases.md`. Together they become the "Test Evidence" and part of "Known Limitations" in
the PR. List both paths in the result block's `data`.
