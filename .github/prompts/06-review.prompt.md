---
description: Step 6 — review the implementation against impl-plan.md, run the code-review checklist, loop via Node C until approved
agent: orchestrator
---

Delegate to `implementation-reviewer`. Diff the implementation log against `impl-plan.md` for
completeness, then run the full checklist (correctness, security, error handling, test
coverage, code clarity, DRY, dependency safety) against the actual diff. If the verdict is
`changes-requested`, run Node C: send the findings back to `implementation` to fix, then
re-review, up to 3 iterations before escalating to me. Show me the checklist and verdict.
