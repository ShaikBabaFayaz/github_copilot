---
description: Step 7 — generate and run the verification suite (tests + doc content-quality check)
agent: orchestrator
---

Confirm `implementation-reviewer`'s verdict is `approved`. Delegate to `verification` to
ensure/generate unit + integration tests covering happy paths and edge cases for every
`impl-plan.md` task, actually run them, and cross-check `requirements.md`/`architecture.md`/
`design-review.md`/`impl-plan.md` for internal consistency. It must write both
`verification-report.md` and `test-cases.md` into this session's output folder. Report the
real test output and any consistency issues back to me.
