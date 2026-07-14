# .claude/ — Claude Code configuration

Adapted from Potential Inc's `claude-base` framework (`D:\PotentialAi\claude-base`), which normally
gets pulled into projects as a git submodule (Tier 1 of a 3-tier `base/{stack}/project` architecture).
This repo isn't part of that org's multi-repo setup, so the pieces were copied in directly and adapted
for brand-AId's actual stack: **Python/FastAPI backend + React/Vite frontend, single repo, no
submodules, no NestJS/Django/mobile.**

## Layout

```
.claude/
├── agents/       # Standalone specialist agents (invoke via Task tool)
├── commands/     # Slash commands (see caveat below)
├── hooks/        # UserPromptSubmit / PostToolUse automation (Node/TS, run via npx tsx)
├── skills/       # skill-rules.json trigger config + generic skill packages
├── templates/    # Reference-only doc/memory templates (see note below)
├── docs/         # Generic engineering guides (best practices, troubleshooting, E2E testing)
└── settings.json # Wires hooks + MCP servers + permissions for this project
```

## What was adapted (not just copied)

- **`hooks/error-handling-reminder.ts`** — rewritten from a NestJS/Prisma-flavored Stop-hook (which
  depended on a `post-tool-use-tracker.sh` file that doesn't exist anywhere in the source repos) into a
  self-contained PostToolUse hook that checks FastAPI routes/services (`backend/app/...`) and React API
  calls (`frontend/src/...`) directly.
- **`hooks/doc-update-reminder.ts`** — repointed at this project's actual `docs/*.md` files
  (`architecture.md`, `current_status.md`, `decisions.md`, per the Documentation Sync Rule in the root
  `CLAUDE.md`), instead of the `.claude-project/plans/*.md` layout used by other Potential Inc projects.
  Also fixed a path bug in the original `.sh` wrapper (`base/hooks` → `hooks`).
- **`hooks/skill-activation-prompt.ts`** — patched `discoverCommands()` to also scan `.claude/commands/`
  directly, since the original only looked for `.claude/{tier}/commands/` (a submodule-tier layout this
  repo doesn't use).
- **`settings.json`** — the previous version only had a `mcpServers` entry with a hardcoded WSL path
  (`/home/alvi105/...`), which doesn't resolve on this Windows machine. Fixed to use
  `${CLAUDE_PROJECT_DIR}/backend/.venv/Scripts/python.exe`, and added hook registration + a starter
  `permissions` block.

## What was copied mostly as-is

- **`agents/`** — 7 generic, framework-agnostic agents (code review, refactoring, documentation,
  planning, research, TS error resolution). Skipped `auth-route-tester`/`auth-route-debugger` since this
  project has no auth system.
- **`skills/skill-rules.json`** and the `skill-developer`, `error-tracking`, `generate-ppt` skill
  packages — generic domain knowledge, harmless if unused.
- **`commands/`** — the full command set. A handful assume Potential Inc's org infrastructure
  (`gh repo create potentialInc/...`, git submodules) and **won't work as-is** in this standalone repo:
  `new-project`, `init-claude-config`, `init-workspace`, `pull`. Kept for reference/future reuse rather
  than deleted, per the "bring the full toolset" choice — everything else (`commit`, `generate-prd*`,
  `fix-ticket`, `create-strategic-plan`, `generate-sop`, `figma-extract-screens`, etc.) works standalone.
- **`templates/claude-project/`** — reference templates only. **Not** applied to this repo: brand-AId
  already has its own `docs/` structure (`architecture.md`, `current_status.md`, `decisions.md`,
  `backlog.md`, `workflows.md`, `deployment.md`) governed by the Documentation Sync Rule in the root
  `CLAUDE.md`, which supersedes the generic `.claude-project/{docs,memory,plans}` convention these
  templates were built for.

## Setup

Hooks need Node deps installed once:

```bash
cd .claude/hooks
npm install
```

(Already done as part of this setup — `node_modules/` is gitignored.)
