# RUNBOOK — Secrets and Troubleshooting

Setup and the step-by-step run are in [`README.md`](README.md). This file covers how
credentials are kept away from agents, and what to do when something doesn't work.

## Secrets

**The rule: no credential ever gets typed into a file the agent can read.** Every token in
[`.vscode/mcp.json`](.vscode/mcp.json) is an `inputs` entry with `"password": true`,
referenced from the server's `env` as `${input:<id>}`:

```jsonc
"inputs": [{ "type": "promptString", "id": "confluence-api-token", "password": true, ... }],
"servers": { "confluence": { "env": { "CONFLUENCE_API_TOKEN": "${input:confluence-api-token}" } } }
```

What happens at runtime: the first time this server starts, VS Code pops a masked input box
(because `"password": true`), you paste the token once, and VS Code stores it in your OS's
secure credential store (Windows Credential Manager / macOS Keychain / Linux Secret Service)
— **not** in `mcp.json`, not in any workspace file, not in chat history. Every later start
reuses the stored value silently. The value only exists as an environment variable inside the
spawned MCP server's process, which the agent talks to only through MCP tool calls.

This is deliberately preferred over a `.env` file: a `.env` file is still a file in the
workspace that a filesystem-reading tool *could* open. Input-backed secret storage isn't a
file at all.

Least privilege on top of that: the Confluence server runs with `READ_ONLY_MODE=true`,
`ENABLED_TOOLS` limited to the two tools the extractor needs, and is restricted to
the spaces in `confluence-spaces`.

Servers that don't need this mechanism:
- **Atlassian's remote MCP server** (commented alternative in `mcp.json`) uses OAuth — no
  static token exists anywhere.
- GitLab operations use the `glab` CLI; they do not use the Git server MCP configured for local
  workspace operations.

## GitLab CLI

Install `glab` from a company-approved source, then authenticate to the company host in a
terminal (never in chat):

```powershell
glab auth login --hostname git.epam.com --web --git-protocol ssh
glab auth status --hostname git.epam.com
glab api --hostname git.epam.com user --jq .username
```

Replace `git.epam.com` if your project uses another approved host. If browser login is not
available, follow the interactive CLI prompts and enter any token only in the terminal. Do not
put credentials in a command, URL, workspace file, or chat. `glab` uses the OS keyring when
available; follow company policy if it reports that credentials would be stored in plaintext.

## Troubleshooting

- **Hooks don't run** — enable `chat.useHooks`, trust the workspace, and check the
  *GitHub Copilot Chat Hooks* output channel. Hooks are an audit trail only; the orchestrator
  does the real checkpointing via the `session-store` skill, so the pipeline works without them.
- **Agents or skills missing** — open `agentic-sdlc-pipeline/` as the workspace root and run
  **Developer: Reload Window**. Right-click in Chat → **Diagnostics** lists loaded agents,
  skills, prompts, and errors. Specialists are hidden from the picker by design
  (`user-invocable: false`); only `orchestrator` shows.
- **`confluence` server won't start** — check `uvx --version`; run
  `uvx mcp-atlassian --help` in a terminal to see the real error; verify the base URL
  (Confluence Cloud URLs end in `/wiki`).
- **401 / 403 from Confluence** — the token or email is wrong, or the page's space isn't in
  `confluence-spaces`. Re-enter the stored inputs and restart the server.
- **"Model not available" / subagent didn't run** — the routed model is above the cost tier of
  the model selected in the chat picker, or not enabled for your org. Pick a higher ceiling
  model, or edit the tier table in `.github/skills/model-router/SKILL.md`.
- **A specialist asks you something directly and stalls** — subagents can't chat; it should
  return `needs-input`. Ask `orchestrator` to re-run that step.
- **Step 8 fails** — confirm `generated/<story-slug>/` exists, `glab auth status --hostname
  <host>` succeeds, and the selected GitLab project is accessible. The target is cloned
  separately; the pipeline workspace does not need a Git remote. If the staged file list
  includes anything outside `generated/<story-slug>/`, the agent must stop without committing
  or pushing.
- **GitLab CI does not run** — confirm the project root contains `.gitlab-ci.yml` and that a
  compatible GitLab Runner is available to the project.
