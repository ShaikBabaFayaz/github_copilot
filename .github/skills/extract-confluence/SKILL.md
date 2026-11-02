---
name: extract-confluence
description: Field-mapping rules for turning a raw Confluence page (from the `confluence` MCP server's confluence_get_page / confluence_search, or Atlassian's remote MCP server) into the normalized extraction shape defined in pipeline-contracts.
---

# Extract Confluence

Map the page payload as follows — use the first field that is present, since server versions
differ:

| Normalized field | Confluence source |
|---|---|
| `title` | `metadata.title` → `title` |
| `description` | `content` (already markdown) → `body.storage.value` with HTML stripped, headings kept as `## Heading` |
| `acceptanceCriteria` | Items under a heading matching `/acceptance criteria/i`, split by bullet/line |
| `rawSource` | `{ "system": "confluence", "id": metadata.id → id, "url": metadata.url → _links.webui }` |

If no heading matches `/acceptance criteria/i`, return an empty array — don't infer criteria
from unrelated bullet lists. Preserve tables as markdown tables rather than dropping them.
