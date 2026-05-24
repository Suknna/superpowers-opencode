# Superpowers for OpenCode

This project is an OpenCode-focused adaptation of [obra/superpowers](https://github.com/obra/superpowers).

It is not an official OpenCode project. It is a specialized fork/adaptation for using the Superpowers workflow inside OpenCode.

## What Changed From Upstream

This project intentionally removes support for other coding agents and harnesses. The active target is OpenCode only.

Removed or de-emphasized support includes:
- Claude Code
- Codex CLI and Codex App
- Gemini CLI
- Cursor
- GitHub Copilot CLI
- Factory Droid

The OpenCode integration is specialized around:
- OpenCode's native `skill` tool
- OpenCode primary agents
- OpenCode subagents
- OpenCode project/global configuration conventions

## OpenCode Bootstrap

The original `using-superpowers` bootstrap has been moved into the OpenCode primary agent model.

In this adaptation, the bootstrap behavior lives in the `superpowers` primary agent, loaded from:

```text
agents/superpowers.md
```

The OpenCode plugin registers that agent at startup and sets it as the default agent when no other default is configured. The plugin also registers the local `skills/` directory so OpenCode can discover Superpowers skills without symlinks.

Relevant OpenCode plugin file:

```text
.opencode/plugins/superpowers.js
```

## Installation

Add this project as an OpenCode plugin in your `opencode.json` or `.opencode/opencode.json`:

```json
{
  "plugin": ["<path-or-git-url-to-this-project>"]
}
```

Restart OpenCode after changing plugin, agent, or skill files. OpenCode loads these at startup; running sessions do not hot-reload them.

After restart, verify skill discovery with OpenCode's native `skill` tool.

## How It Works

The workflow starts when the `superpowers` primary agent is active. The agent requires relevant skills to be loaded before work begins.

Current OpenCode workflow:

1. **brainstorming** - Understand the user's intent before design or implementation.
2. **using-git-worktrees** - Decide whether to isolate work in a worktree and verify the baseline.
3. **writing-plans** - Convert an approved design into small, explicit, verifiable tasks.
4. **subagent-driven-development** or **executing-plans** - Execute the plan with review checkpoints.
5. **goal-driven-development** - Implement from the user's target outcome and complete tests before acceptance.
6. **requesting-code-review** - Review changes before they cascade.
7. **verification-before-completion** - Require fresh evidence before claiming success.
8. **finishing-a-development-branch** - Decide how to integrate or preserve completed work.

## Goal-Driven Development

This adaptation replaces the original default `test-driven-development` workflow with `goal-driven-development`.

The goal is to avoid the model "painting the target after shooting the arrow": writing tests first, then shaping implementation around making those tests pass, even when the tests encode an old architecture or the wrong contract.

Instead, `goal-driven-development` teaches the model to:
- Start from what the user wants to achieve.
- Define the target behavior or structural outcome.
- Define acceptance evidence before claiming completion.
- Implement the smallest correct change for that goal.
- Write or update tests before acceptance.
- Treat tests as evidence of the goal, not as the goal itself.
- Update or delete stale tests that only describe old implementation details.
- Avoid keeping old production code solely to satisfy old tests.

Tests still matter. They are mandatory before acceptance. The change is about ordering and authority:

```text
User goal and accepted behavior -> implementation -> tests and verification before completion
```

not:

```text
test shape -> implementation shaped to pass that test -> claim success
```

## Why Not Test-Driven Development

The original `test-driven-development` skill enforced strict test-first development. That can be useful in some contexts, but it caused a failure mode this adaptation explicitly avoids:

- The model writes or preserves code to satisfy the first test it created.
- Tests can accidentally encode implementation details instead of user goals.
- Architecture changes become harder because old tests pressure the model to keep old structures.
- The model may retain compatibility layers, adapters, inheritance trees, or dead code just to keep tests green.

`goal-driven-development` keeps the useful part of testing: evidence before completion. It removes the part that made tests the driver of architecture.

The new rule is:

```text
No completion claim without verified goals and passing required tests.
```

Code may be written before tests. Work may not be accepted before tests and verification evidence exist.

## Skills Included

### Core Workflow

- **brainstorming** - Refine rough ideas into a design.
- **writing-plans** - Produce explicit implementation plans.
- **subagent-driven-development** - Execute plans with implementer and reviewer subagents.
- **executing-plans** - Execute plans inline when subagents are not appropriate.
- **using-git-worktrees** - Keep work isolated when requested.

### Implementation And Verification

- **goal-driven-development** - Implement from user goals and verify before acceptance.
- **systematic-debugging** - Find root cause before fixing.
- **verification-before-completion** - Require fresh verification before success claims.
- **requesting-code-review** - Review changes before continuing.
- **receiving-code-review** - Evaluate review feedback rigorously.
- **finishing-a-development-branch** - Decide what to do with completed work.

### Meta

- **writing-skills** - Create or revise skills using baseline-driven evaluation.
- **dispatching-parallel-agents** - Split independent research or review work across subagents.

## Project Status

This repository is OpenCode-specialized and intentionally diverges from upstream Superpowers.

Use upstream [obra/superpowers](https://github.com/obra/superpowers) if you need the original multi-harness project or support for other coding tools.

Use this project if you want the OpenCode-specific workflow with `goal-driven-development` as the default implementation discipline.

## License

MIT License - see `LICENSE` for details.
