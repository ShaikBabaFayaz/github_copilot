---
name: decision-router
description: Encodes the pipeline's decision-node rules (source selection, architecture create-vs-revise, review-gate looping) as explicit conditions, so agents apply them consistently instead of re-deriving the logic each time.
---

# Decision Router

## Node A — Input source (asked right after the session gate)

Skip Node A when a continued session already has a non-empty `state.extraction`.

Offer these choices through `askQuestions` with freeform input enabled (or as a numbered list
in chat); the final option is always available for custom input:
> "Where is the user story? Give a **Confluence** page URL, page ID, or `confluence: <title>`;
> a **document path** (`.docx`, `.md`, `.txt`, e.g. `input/sample-user-story.docx`); or
> **paste** the story text.
> 1. **Confluence page** — enter a URL, page ID, or `confluence: <title>`
> 2. **Document** — pick one of the files in `input/`
> 3. **Paste a story** — provide the story text
> 4. **Other (provide custom input)**"

**Document branch — never ask the user to type a path.** When the answer is choice 2 (or any
answer that names a document source without a usable path), list `input/` yourself and offer
what's there:

```
files = entries of input/ with extension .docx | .md | .txt, excluding README.md (recurse one level)
  none            -> say input/ has no supported documents, and offer:
                     paste the story | Confluence | Other (provide custom input) | cancel
  one or more     -> show each as a choice labelled "<name> · <relative path>",
                     then "Other (provide custom input)" last (a path outside input/, pasted text)
selected choice -> document-extractor (file), using that literal relative path
```

```
classify(answer):
  URL on *.atlassian.net or containing /wiki/   -> confluence-extractor  (page URL)
  all digits                                     -> confluence-extractor  (page ID)
  starts with "confluence:"                      -> confluence-extractor  (title search)
  path ending .docx | .md | .txt, inside the workspace, file exists
                                                 -> document-extractor    (file)
  free text of >= 20 words describing a feature  -> document-extractor    (pasted text)
  "cancel" | "stop" | "exit" | "quit"            -> CLOSE("cancelled by user")
  anything else                                  -> UNSUPPORTED(reason)

UNSUPPORTED(reason):   # Jira keys/URLs, .pdf/.xlsx/.pptx/images, other URLs, missing file,
                       # path outside the workspace, too-short or empty text
  attempt 1 -> say why it can't be used, repeat the supported options and add
               Other (provide custom input) last, ask again
               (for a document-shaped answer, re-offer the `input/` listing above)
  attempt 2 -> CLOSE(reason)

extractor returns needs-input (several Confluence matches) -> show candidates as options,
  add Other (provide custom input) last, re-invoke with the selected ID or custom input
extractor returns blocked (server down, 401/403, unreadable file, no story found)
  -> offer: retry | use a different input | close | Other (provide custom input)
     ("close" -> CLOSE(reason))
```

**CLOSE(reason)** — graceful exit, no partial work: if a session exists, **Checkpoint**
`lastStep: "closed"` and `closeReason`; tell the user in two lines what happened, which
inputs are supported, and that they can start again with "Let's start" (choosing **continue**
resumes at Node A). Then stop — never call another specialist or guess at content.

## Node B — Architecture create vs. revise
```
if state.architecture.versions is empty:
    mode = CREATE, input = this session's requirements.md
        (resolve the literal path via session-store's Resolve output path operation)
elif state.designReview.verdict == "changes-requested":
    mode = REVISE, input = (latest architecture version, state.designReview.findings)
else:
    mode = CREATE   # e.g. requirements changed after an approved architecture — treat as new baseline, note it explicitly
```

## Node C — Review gate loop
```
applies after: design-reviewer (stage="design"), implementation-reviewer (stage="implementation")
if verdict == "approved":
    advance()
elif verdict == "changes-requested":
    state.reviewIterations[stage] += 1
    if state.reviewIterations[stage] <= 3:
        loop_back_with_findings()
    else:
        escalate_to_human(summary_of_unresolved_findings)
```

Any agent implementing one of these nodes should apply the condition exactly as written here
rather than improvising — if a case falls outside what's covered (e.g. an ambiguous verdict
string), stop and ask the human rather than picking a branch.
