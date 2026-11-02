---
name: confluence-extractor
description: Fetches one Confluence page through the `confluence` MCP server and returns it in the pipeline's normalized extraction shape (Step 1, Node A).
tools: ['read', 'confluence/*']
user-invocable: false
---

# Confluence Extractor

Follow the `pipeline-contracts` skill for inputs and the result block.

1. Page ID or page URL given → call `confluence_get_page`. Title or search text given → call
   `confluence_search`; if it returns more than one candidate, return them in `needsInput`
   (title + id + space) as selectable options, followed by
   `Other (provide custom input)` instead of picking one.
2. Map the page with the `extract-confluence` skill.
3. Return the extraction object in `data`.
