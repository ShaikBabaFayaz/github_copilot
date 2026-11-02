---
name: model-router
description: Picks the cheapest model tier that can handle a delegation (fast / standard / reasoning) by scoring task effort, so small tasks use low-cost models and complex or risky tasks use a premium/thinking model. Use before every runSubagent call in the SDLC pipeline. This is the ONLY file that names concrete models.
---

# Model Router

The orchestrator applies this before **every** subagent delegation and passes the chosen
model as the `model` parameter of the `runSubagent` call. Specialist agents do not pin a
`model:` in their frontmatter — this table is the single place to retune cost vs. quality.

## 1. Tiers (edit only this table to change models)

| Tier | Use for | Models, in priority order |
|---|---|---|
| `fast` | Mechanical mapping, templated output, running commands | `GPT-5 mini (copilot)`, `GPT-4.1 (copilot)` |
| `standard` | Normal judgment: requirements, design, typical code | `Claude Sonnet 4.5 (copilot)`, `GPT-5 (copilot)` |
| `reasoning` | Deep reasoning: risky/large design, hard bugs, repeated review failures | `Claude Opus 4.5 (copilot)`, `GPT-5.2 (copilot)` |

Labels must match the chat model picker exactly (`Model Name (vendor)`). If your org exposes
different models, change the names here — nothing else in the repo references them.

## 2. Effort score

Compute from data already in `state.json` / the inputs you are about to pass. Add up:

| Signal | +0 | +1 | +2 |
|---|---|---|---|
| **Size** — FR+NFR count, or tasks in plan, or files in this task's diff | ≤ 5 | 6–15 | > 15 |
| **Breadth** — components / services / integrations touched | ≤ 2 | 3–6 | > 6 |
| **Risk** — distinct topics among: auth, payments, PII/compliance, security boundary, concurrency, data migration, distributed state | none | 1–2 | ≥ 3 |
| **Ambiguity** — open questions or `missing` fields | 0–1 | 2–4 | > 4 |
| **Rework** — `state.reviewIterations[stage]` for this stage | 0 | 1 | ≥ 2 |

Score → tier: **0–2 → `fast`**, **3–5 → `standard`**, **≥ 6 → `reasoning`**.

For `implementation`, score **each task separately** — a config tweak and an auth flow in
the same plan should not run on the same model.

## 3. Per-agent band (clamp the scored tier into [floor, ceiling])

| Agent | Floor | Ceiling |
|---|---|---|
| `confluence-extractor`, `document-extractor` | fast | standard |
| `analysis` | standard | reasoning |
| `architecture` | standard | reasoning |
| `design-reviewer` | standard | reasoning |
| `implementation-planner` | fast | reasoning |
| `implementation` | fast | reasoning |
| `implementation-reviewer` | standard | reasoning |
| `verification` | fast | standard |
| `pr` | fast | fast |

## 4. Overrides and fallbacks

- **User override wins**: "use cheap/fast" → `fast`; "use best/think hard" → `reasoning`
  (still clamped to the agent's ceiling unless the user names the agent explicitly).
- **Cost ceiling**: VS Code refuses a subagent model above the cost tier of the model the
  user selected for the main chat. If `runSubagent` reports the model is unavailable or over
  the ceiling, try the next model in the tier, then drop one tier, and tell the user which
  model actually ran.
- **Escalate on failure**: if a subagent returns an empty, malformed, or self-declared
  incomplete result, retry once at the next tier up (within the ceiling) before reporting.

## 5. Record it

Append one entry per delegation to `state.json.modelRouting` (via `session-store`
**Checkpoint**) and include it in the status line shown to the user:

```json
{ "step": "architecture", "score": 4, "tier": "standard", "model": "Claude Sonnet 4.5 (copilot)", "reason": "12 FRs, auth NFR" }
```
