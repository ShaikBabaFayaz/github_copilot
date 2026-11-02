---
name: checklist-generator
description: Renders the Step 6 code-review areas as a markdown tick-list against a specific diff/implementation log, used by implementation-reviewer and referenced again by the pr agent for the Reviewer Checklist section.
---

# Checklist Generator

Given a diff/implementation log and `requirements.md`, produce:

```markdown
- [ ] Correctness — <one line: does behavior match requirements.md, cite FR-#s covered>
- [ ] Security — <one line: secrets excluded? inputs validated? cite any boundary checked>
- [ ] Error Handling — <one line: which failure modes (API failure, missing file, empty repo) are handled>
- [ ] Test Coverage — <one line: happy path + which edge cases are covered>
- [ ] Code Clarity — <one line: any names/functions flagged as unclear>
- [ ] DRY — <one line: any duplicated logic found, and whether it was refactored>
- [ ] Dependency Safety — <one line: any new dependency, and its known-vulnerability status>
```

Check the box (`[x]`) only for items with no open finding against them. Leave it unchecked
(`[ ]`) and put the specific gap in the one-line note if there's anything outstanding — a
checked box must mean "verified", not "assumed fine".
