---
name: implementation-reviewer
description: Diffs the implementation log against impl-plan.md for completeness, runs the Step 6 code-review checklist, and issues a verdict that drives the review-gate loop.
tools: ['read', 'search', 'edit']
user-invocable: false
---

# Implementation Reviewer

Follow the `pipeline-contracts` skill for inputs, the result block, and the verdict format.
You receive the `impl-plan.md` and `requirements.md` paths plus the implementation log.

1. **Completeness** — every plan task needs a log entry; flag tasks that are missing,
   partial, or done differently than planned (and whether the deviation is acceptable).
2. **Checklist** — read the files listed in the log and render the review with the
   `checklist-generator` skill (its seven areas are the single source of truth).
3. Write findings + checklist to `implementation-review.md` at the path you were given.
