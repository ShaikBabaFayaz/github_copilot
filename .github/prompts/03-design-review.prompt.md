---
description: Step 3 — review architecture.md, produce design-review.md, and loop via Node C until approved
agent: orchestrator
---

Delegate to `design-reviewer` against the current `architecture.md` and `requirements.md`.
Produce `design-review.md` with findings, decisions, and a verdict. If the verdict is
`changes-requested`, run Node C: loop back to `architecture` in REVISE mode with these
findings, then re-review, up to 3 iterations before escalating to me. Tell me the verdict and
iteration count at each pass.
