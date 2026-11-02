---
name: extract-word
description: Converts a .docx file to text with the bundled Node script, and defines how any document text (.docx, .md, .txt, or pasted) is mapped to the normalized extraction shape. Use when document-extractor needs the content of a document.
---

# Extract Word

`.docx` files are zip archives of XML — reading them as plain text produces garbage. Run the
bundled script instead (`.md` / `.txt` / pasted text skip this step):

```
node .github/skills/extract-word/read-docx.js <path-to-file.docx>
```

It prints the document's plain text to stdout, with headings prefixed `## ` and paragraph
breaks preserved. Then map the text (Markdown `#` headings count as headings too):

1. The first heading (or the filename without extension / first line for pasted text if
   there's no heading — say so in `summary`) is the `title`.
2. Everything else is the `description`.
3. Text under a heading matching `/acceptance criteria/i` becomes `acceptanceCriteria`, split
   into an array by bullet/line — return an empty array if no such heading exists.
4. `rawSource` is `{ "system": "document" | "text", "id": "<file path or 'pasted'>", "url": "" }`.

If the script errors (file not found, not a valid `.docx`), report that back verbatim rather
than guessing at content.
