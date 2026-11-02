---
description: Step 1 — extract a user story from Confluence or a document and produce requirements.md
agent: orchestrator
---

Run the session gate first. Then run Node A: ask me for the user story input (Confluence page,
local document, or pasted text) — if I choose a local document, list the files in `input/` and
let me pick one instead of asking me to type a path. Classify the input and either delegate to
the matching extractor or close the pipeline gracefully if it isn't supported. Hand the normalized result to
`analysis` so it can ask me clarifying questions
and produce `requirements.md`. Stop and show me the draft before treating this step as done.
