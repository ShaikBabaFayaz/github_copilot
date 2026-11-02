# Agentic SDLC Pipeline — Repo-Wide Instructions

This repository implements an Agentic SDLC pipeline entirely through GitHub Copilot custom
agents (`.github/agents/`), skills (`.github/skills/`), prompt files (`.github/prompts/`),
and MCP servers (`.vscode/mcp.json`). Talk to the **`orchestrator`** agent — it routes every
request to the right specialist and never does domain work itself.

## Ground rules for every agent in this pipeline

- **Human in the loop.** Never silently finalize a session's `requirements.md`, an
  architecture revision, or an implementation task without the human's explicit go-ahead where
  the agent's own instructions call for it.
- **No fabrication.** If a source document is missing a field (acceptance criteria, an NFR,
  a test), say "Not Found" / flag it as an open question — never invent plausible-sounding
  content to fill a gap.
- **Traceability.** Every artifact after `requirements.md` must be traceable back to it —
  architecture components map to requirements, plan tasks map to components, code maps to
  plan tasks, tests map to acceptance criteria.
- **PR scope.** Step 8 may publish only `generated/<story-slug>/` to the user-selected target
  repository. Never include pipeline agents, prompts, skills, instructions, MCP settings,
  session files, changelog, or other workspace content in that merge request. Require explicit user
  confirmation after showing the staged file list and before commit/push/merge-request creation.
- **Session discipline.** Only the `orchestrator` reads/writes `sessions/`, and it does so via
  the `session-store` skill — that skill (not this file, not `orchestrator.agent.md`) is the
  source of truth for the session-gate question, the state shape, and each session's own
  `output/` folder. Other agents receive what they need as input, plus the exact output path
  to use — they never assume a fixed location and don't manage session state themselves.
- **Skill-first logic.** Pipeline decision rules (session gate, source routing, create-vs-
  revise, the review-loop iteration cap, model selection, the specialist I/O contract) live in
  `.github/skills/`, not in any agent's prose. If an agent's own file restates one of these
  rules instead of pointing at the skill, that's a bug — fix the agent file to delegate, don't
  duplicate the rule in two places.
- **Token economy.** Model choice per delegation comes only from the `model-router` skill — no
  agent pins a `model:`. Pass file paths between agents, not file contents.
- **Secrets.** Never print, log, or commit MCP tokens, API keys, or `.env` contents. See
  `.github/instructions/security.instructions.md`.

## Repo layout

- `.vscode/mcp.json` — MCP servers (read-only Confluence and workspace-scoped local Git) are
  configured here; secrets come from `${input:...}` prompts, never literals. The Git server
  is not a substitute for authenticated access to a separately selected GitLab project; Step 8
  uses the host-authenticated `glab` CLI.
- `input/` — user-story documents (`.docx`, `.md`, `.txt`) for `document-extractor`.
- `sessions/<id>/` — pipeline session state, managed only by `orchestrator` via the
  `session-store` skill: `state.json` plus that session's own `output/` folder
  (`requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`,
  `verification-report.md`, `test-cases.md`, `pr.md`) — isolated per session, so a new or reset session never overwrites
  another session's deliverables.
- `generated/<story-slug>/` — application project artifacts created during Step 5, including
  source, tests, manifests, configuration, lockfiles, and installed dependencies. Keep them
  inside this story-specific project root rather than placing them directly in the repository
  root. The slug is derived from the approved story title as defined in `pipeline-contracts`.
- `RUNBOOK.md` — how to actually drive the 8 SDLC steps in VS Code Copilot Chat.
