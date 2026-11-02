---
applyTo: "*.md"
---

# Documentation Style Instructions

- `requirements.md`, `architecture.md`, `design-review.md`, and `impl-plan.md` each have a
  fixed section structure (see the corresponding agent's `.agent.md` for the exact template)
  — don't reorder or rename the required headings, since downstream agents parse them by
  heading.
- Use Mermaid code blocks for diagrams (` ```mermaid `) so they render natively in VS Code and
  GitHub.
- Never leave a heading empty — if a section has nothing to say yet, write "Not Found" or
  "None identified" explicitly rather than omitting the heading.
- Version headers on `architecture.md` (`vN`) and their `## Revision Log` entries are
  append-only — never delete a prior revision log entry when adding a new one.
