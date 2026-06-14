# Brainstorming Grill-Me Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Explicitly invoke/load superpowers:goal-driven-development before implementation tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Grill Me` probing mode to the existing `brainstorming` skill so agents respect and stress-test a user's starting plan instead of resetting to blank-slate brainstorming.

**Architecture:** Keep `brainstorming` as the only discoverable skill. Add one same-directory support document, `skills/brainstorming/grill-me.md`, and update `skills/brainstorming/SKILL.md` to conditionally load it the same way the visual companion is conditionally loaded.

**Tech Stack:** Markdown skill documentation, OpenCode native skill loading, existing shell-based skill tests and manual transcript evaluation.

---

## File Structure

| Path | Action | Responsibility |
|------|--------|----------------|
| `docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md` | Read | Approved design source of truth. |
| `docs/superpowers/plans/2026-06-14-brainstorming-grill-me-mode.md` | Create | This implementation plan. |
| `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md` | Create | Baseline and post-change behavior evidence. |
| `skills/brainstorming/grill-me.md` | Create | Local support document copied from upstream `grill-me`; not an OpenCode-discoverable skill. |
| `skills/brainstorming/SKILL.md` | Modify | Main skill instructions: activation rules, process flow, probing behavior, and approaches guidance. |

No source-code file is expected to exceed 500 lines. This change touches Markdown documentation only, so the source-code line threshold does not apply.

## Task 1: Capture Baseline Behavior Evidence

**Files:**
- Create: `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md`
- Read: `docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md`
- Read: `skills/brainstorming/SKILL.md`

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: document how current `brainstorming` behaves before the wording change, especially whether it resets user-provided plans to generic options.

Acceptance evidence:
- `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md` exists.
- The file records four baseline prompts from the approved spec.
- Each scenario records `Prompt`, `Expected risk`, `Observed behavior`, `Pass/Fail`, and `Notes`.

- [ ] **Step 2: Create the evaluation evidence file**

Create `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md` with this exact structure:

```markdown
# Brainstorming Grill-Me Mode Evaluation

## Purpose

This evaluation records baseline and post-change behavior for adding `Grill Me` mode to `skills/brainstorming/SKILL.md`.

## Baseline Scenarios

| Scenario | Prompt | Expected Risk | Observed Behavior | Result | Notes |
|----------|--------|---------------|-------------------|--------|-------|
| Vague request should not over-trigger | `Let's make a React todo list` | Agent might treat every creative task as grill-me probing. | Pending baseline run. | Pending | Normal brainstorming should ask clarifying questions without `Grill Me` language. |
| Concrete plan should not be reset | `I have a plan: add Grill Me mode as a support doc under brainstorming, trigger it when the user already has a design, and still write a spec. Help refine it.` | Agent may ignore the plan and propose generic alternatives from scratch. | Pending baseline run. | Pending | Desired future behavior keeps the user's plan as baseline. |
| Explicit grill-me request should probe dependencies | `Grill me on this design: the brainstorming skill should load a same-directory prompt when I already have an architecture sketch.` | Agent may ask generic clarification questions instead of interrogating decision branches. | Pending baseline run. | Pending | Desired future behavior asks one probing question with a recommendation. |
| Repo-answerable question should be checked locally | `I want to add a support file next to the brainstorming visual companion. Grill me on whether that matches the existing pattern.` | Agent may ask the user where support files live instead of inspecting the repo. | Pending baseline run. | Pending | Desired future behavior checks `skills/brainstorming/visual-companion.md` and `skills/brainstorming/SKILL.md`. |

## Post-Change Scenarios

| Scenario | Prompt | Expected Behavior | Observed Behavior | Result | Notes |
|----------|--------|-------------------|-------------------|--------|-------|
| Vague request keeps normal brainstorming | `Let's make a React todo list` | Agent uses normal brainstorming and does not announce `Grill Me` mode. | Pending post-change run. | Pending | Protects against over-triggering. |
| Concrete plan triggers announced probing | `I have a plan: add Grill Me mode as a support doc under brainstorming, trigger it when the user already has a design, and still write a spec. Help refine it.` | Agent announces `Grill Me` mode before the first probing question. | Pending post-change run. | Pending | Uses inferred activation with explicit announcement. |
| Explicit grill-me loads support doc | `Grill me on this design: the brainstorming skill should load a same-directory prompt when I already have an architecture sketch.` | Agent loads `skills/brainstorming/grill-me.md`, asks one question, and gives a recommended answer. | Pending post-change run. | Pending | Uses explicit activation. |
| Repo-answerable question uses code inspection | `I want to add a support file next to the brainstorming visual companion. Grill me on whether that matches the existing pattern.` | Agent checks the repo before asking the user. | Pending post-change run. | Pending | Preserves upstream `If a question can be answered by exploring the codebase...` rule. |

## Summary

- Baseline result: Pending.
- Post-change result: Pending.
- Wording refinements needed: Pending.
```

- [ ] **Step 3: Run baseline pressure sessions**

Use fresh read-only subagent sessions or manual OpenCode sessions for each baseline scenario. Store any copied transcript excerpts or prompt scratch files under:

```text
.tmp/brainstorming-grill-me-mode/
```

Do not use the existing `tests/skill-triggering/run-test.sh` helper for this evaluation unless it has first been changed to write under the project `.tmp/` directory; its current output path is outside the project workspace.

For each baseline scenario, record the first assistant response and whether it shows the expected baseline risk. If using subagents, use this prompt shape and replace `[SCENARIO PROMPT]` with the scenario prompt:

```text
Read-only pressure scenario. Do not edit files. You are evaluating current brainstorming behavior before a proposed skill wording change.

User prompt to evaluate:
[SCENARIO PROMPT]

Act as the main agent would after loading the current `brainstorming` skill. Return only:
- Whether `brainstorming` was used.
- The first response you would give the user.
- Whether the behavior resets a provided plan, enters probing mode, asks more than one question, or asks the user something the repo can answer.
```

- [ ] **Step 4: Replace baseline placeholders with observations**

Update only the `Baseline Scenarios` table and `Summary` in `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md`.

Use this result vocabulary:

```text
Pass = current behavior already meets the desired future behavior.
Fail = current behavior shows the risk this change is intended to address.
Inconclusive = the harness could not exercise the scenario clearly.
```

- [ ] **Step 5: Verify baseline evidence is explicit**

Run:

```bash
grep -n "Pending baseline run\|Baseline result: Pending" docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md
```

Expected: no matching lines after baseline observations are recorded. If matches remain, complete the baseline observations before modifying skill behavior.

## Task 2: Add Grill-Me Support Document

**Files:**
- Create: `skills/brainstorming/grill-me.md`
- Read: `docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md`

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: add the upstream `grill-me` behavior as local support material without registering a new OpenCode skill.

Acceptance evidence:
- `skills/brainstorming/grill-me.md` exists.
- It does not begin with YAML frontmatter.
- It contains the original upstream instructions and records source/license context.

- [ ] **Step 2: Create the support file**

Create `skills/brainstorming/grill-me.md` with this content:

```markdown
# Grill Me

Source: `https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md`

License: MIT License, copyright Matt Pocock.

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.
```

Do not add `---` YAML frontmatter to this file.

- [ ] **Step 3: Verify it is not a discoverable skill**

Run:

```bash
grep -n "^---$\|^name:\|^description:" skills/brainstorming/grill-me.md
```

Expected: no output. If this command prints a frontmatter delimiter or skill metadata, remove it.

## Task 3: Integrate Grill-Me Mode Into Brainstorming

**Files:**
- Modify: `skills/brainstorming/SKILL.md`
- Read: `skills/brainstorming/grill-me.md`
- Read: `docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md`

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: teach `brainstorming` to conditionally use `Grill Me` mode while preserving all hard gates and the visual companion pattern.

Acceptance evidence:
- Checklist step 3 mentions clarifying or probing questions.
- Process flow includes a `Starting plan provided?` decision before question asking.
- The process section defines non-overlapping explicit, inferred, and non-activation rules.
- The process section instructs the agent to read `skills/brainstorming/grill-me.md` when the mode applies.
- The approaches section keeps 2-3 approaches but treats the user's plan as the baseline when applicable.
- Existing hard gate and terminal `writing-plans` rule remain unchanged.

- [ ] **Step 2: Update checklist wording**

In `skills/brainstorming/SKILL.md`, replace checklist item 3:

```markdown
3. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
```

with:

```markdown
3. **Ask clarifying or probing questions** — one at a time, based on whether the user is starting from a rough idea or an existing plan
```

- [ ] **Step 3: Update the process flow diagram**

In the `digraph brainstorming` block, replace the current question node and edges:

```dot
    "Ask clarifying questions" [shape=box];
```

with:

```dot
    "Starting plan provided?" [shape=diamond];
    "Load Grill Me support doc" [shape=box];
    "Ask clarifying or probing questions" [shape=box];
```

Then replace these edges:

```dot
    "Visual questions ahead?" -> "Ask clarifying questions" [label="no"];
    "Offer Visual Companion\n(own message, no other content)" -> "Ask clarifying questions";
    "Ask clarifying questions" -> "Propose 2-3 approaches";
```

with:

```dot
    "Visual questions ahead?" -> "Starting plan provided?" [label="no"];
    "Offer Visual Companion\n(own message, no other content)" -> "Starting plan provided?";
    "Starting plan provided?" -> "Load Grill Me support doc" [label="yes"];
    "Starting plan provided?" -> "Ask clarifying or probing questions" [label="no"];
    "Load Grill Me support doc" -> "Ask clarifying or probing questions";
    "Ask clarifying or probing questions" -> "Propose 2-3 approaches";
```

- [ ] **Step 4: Add Grill-Me activation rules**

In the `Understanding the idea` section, after the existing scope-decomposition bullets and before the general question bullets, add:

```markdown
- If the user already has a concrete plan, design, architecture sketch, or proposed implementation direction, switch from blank-slate clarification to `Grill Me` mode.
- Explicit activation: use `Grill Me` mode when the user directly asks to be grilled, challenged, interrogated, or stress-tested.
- Inferred activation: if the user has a starting plan, design, architecture sketch, or proposed implementation direction but does not directly ask to be grilled or challenged, first say: "You already have a starting plan, so I'll use Grill Me mode: I'll probe the plan one decision at a time and give a recommended answer for each question."
- Non-activation: if the user only gives a vague idea or asks to build something from scratch, continue with normal brainstorming.
- When `Grill Me` mode applies, read `skills/brainstorming/grill-me.md` before asking probing questions. Then probe the plan one dependency at a time, include your recommended answer with each question, and inspect the codebase instead of asking the user when the answer is available in the repo.
```

Keep the existing bullets that require one question per message and multiple choice when possible.

- [ ] **Step 5: Update approaches guidance**

In the `Exploring approaches` section, after the current three bullets, add:

```markdown
- In `Grill Me` mode, treat the user's starting plan as the baseline option under review. Do not discard it and restart from a blank slate.
- Still explore alternatives when they reveal a meaningful trade-off, risk, or simpler path, but frame them against the user's baseline plan.
```

- [ ] **Step 6: Verify protected gates remain intact**

Run:

```bash
grep -n "Do NOT invoke any implementation skill\|The ONLY skill you invoke after brainstorming is writing-plans\|User reviews written spec" skills/brainstorming/SKILL.md
```

Expected: output includes all three protected gate phrases. If any phrase is missing, restore it before continuing.

## Task 4: Run Post-Change Evaluation and Refine

**Files:**
- Modify: `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md`
- Modify if needed: `skills/brainstorming/SKILL.md`
- Read: `skills/brainstorming/grill-me.md`

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: prove the skill wording changes behavior without over-triggering or bypassing gates.

Acceptance evidence:
- Every `Post-Change Scenarios` row has `Observed Behavior` and `Result` filled in.
- Vague requests do not enter `Grill Me` mode.
- Explicit and inferred starting-plan prompts enter `Grill Me` mode correctly.
- No post-change run asks multiple probing questions in one message.
- No post-change run skips design/spec/user-review gates.

- [ ] **Step 2: Run post-change pressure sessions**

Use the same evaluation method and prompts used for baseline. Store any copied transcript excerpts or prompt scratch files under:

```text
.tmp/brainstorming-grill-me-mode/
```

For each scenario, record the first relevant assistant behavior in `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md`. Each excerpt must show whether the mode was announced or not announced. If using subagents, use this prompt shape and replace `[SCENARIO PROMPT]` with the scenario prompt:

```text
Read-only pressure scenario. Do not edit files. You are evaluating brainstorming behavior after the Grill Me mode wording change.

User prompt to evaluate:
[SCENARIO PROMPT]

Act as the main agent would after loading the current `brainstorming` skill. Return only:
- Whether `brainstorming` was used.
- Whether `skills/brainstorming/grill-me.md` should be read.
- The first response you would give the user.
- Whether the behavior over-triggers, fails to announce inferred mode, asks multiple questions, skips code inspection, or bypasses design/spec gates.
```

- [ ] **Step 3: Fill post-change results**

Use this result vocabulary:

```text
Pass = observed behavior matches the expected post-change behavior.
Fail = observed behavior violates the expected post-change behavior.
Inconclusive = the harness could not exercise the scenario clearly.
```

Update the summary with one of these exact forms:

```markdown
- Baseline result: [recorded]
- Post-change result: Pass — all required scenarios match expected behavior.
- Wording refinements needed: None.
```

or:

```markdown
- Baseline result: [recorded]
- Post-change result: Issues found — see scenario rows.
- Wording refinements needed: [specific wording change required]
```

- [ ] **Step 4: Refine only observed failures**

If post-change behavior fails, update `skills/brainstorming/SKILL.md` only for the observed failure.

Use these mappings:

| Observed failure | Allowed wording refinement |
|------------------|----------------------------|
| Over-triggers on vague requests | Strengthen `Non-activation` bullet. |
| Does not announce inferred mode | Strengthen `Inferred activation` bullet. |
| Does not load support doc | Move `read skills/brainstorming/grill-me.md` earlier in the activation bullet. |
| Asks multiple questions at once | Add `Grill Me mode still obeys one question per message.` |
| Skips design/spec gates | Add `Grill Me mode changes questioning style only; it does not change the hard gates.` |

Do not add unrelated examples or broad rewrites.

- [ ] **Step 5: Verify no pending evaluation placeholders remain**

Run:

```bash
grep -n "Pending baseline run\|Pending post-change run\|Baseline result: Pending\|Post-change result: Pending\|Wording refinements needed: Pending" docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md
```

Expected: no output.

## Task 5: Final Verification and Review Prep

**Files:**
- Read: `skills/brainstorming/SKILL.md`
- Read: `skills/brainstorming/grill-me.md`
- Read: `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md`
- Read: `docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md`

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: verify the final diff is focused, evidence-backed, and ready for human review.

Acceptance evidence:
- `aft_inspect` reports no diagnostics for modified Markdown files.
- `grep` checks confirm support file is not discoverable as a skill.
- `grep` checks confirm protected brainstorming gates remain.
- `git diff --check` reports no whitespace errors.
- `git status --short` shows only intended files.

- [ ] **Step 2: Run diagnostics**

Use the `aft_inspect` tool with these parameters:

```json
{
  "scope": [
    "skills/brainstorming",
    "docs/superpowers/evals",
    "docs/superpowers/specs"
  ],
  "sections": ["todos"],
  "topK": 50
}
```

Expected: no diagnostics. Existing project-level dead-code or duplicate hints outside this scope are not blockers for this documentation change.

- [ ] **Step 3: Verify support file remains non-discoverable**

Run:

```bash
grep -n "^---$\|^name:\|^description:" skills/brainstorming/grill-me.md
```

Expected: no output.

- [ ] **Step 4: Verify hard gates remain**

Run:

```bash
grep -n "Do NOT invoke any implementation skill\|The ONLY skill you invoke after brainstorming is writing-plans\|User reviews written spec" skills/brainstorming/SKILL.md
```

Expected: output includes all three protected gate phrases.

- [ ] **Step 5: Check formatting and intended files**

Run:

```bash
git diff --check && git status --short
```

Expected: no whitespace errors. Intended files:

```text
docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md
docs/superpowers/plans/2026-06-14-brainstorming-grill-me-mode.md
docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md
skills/brainstorming/SKILL.md
skills/brainstorming/grill-me.md
```

- [ ] **Step 6: Prepare final review notes**

Summarize for the human reviewer:

```markdown
## Change Summary

- Added `skills/brainstorming/grill-me.md` as a non-discoverable support document copied from upstream MIT-licensed `grill-me`.
- Updated `skills/brainstorming/SKILL.md` to detect existing user plans and load `grill-me.md` on demand.
- Preserved hard gates: no implementation before design approval, spec review remains required, and the terminal skill remains `writing-plans`.
- Recorded baseline and post-change behavior in `docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md`.

## Verification

- `aft_inspect` passed for modified docs/skill scope.
- `grep` confirmed `grill-me.md` has no OpenCode skill frontmatter.
- `grep` confirmed brainstorming hard gates remain.
- `git diff --check` passed.
```

- [ ] **Step 7: Commit only if the user explicitly asks**

Do not commit automatically. If the user asks for a commit, first run:

```bash
git status --short && git diff --check && git diff -- skills/brainstorming/SKILL.md skills/brainstorming/grill-me.md docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md docs/superpowers/plans/2026-06-14-brainstorming-grill-me-mode.md
```

Then stage only intended files and use a focused message:

```bash
git add skills/brainstorming/SKILL.md skills/brainstorming/grill-me.md docs/superpowers/evals/2026-06-14-brainstorming-grill-me-mode.md docs/superpowers/specs/2026-06-14-brainstorming-grill-me-mode-design.md docs/superpowers/plans/2026-06-14-brainstorming-grill-me-mode.md
git commit -m "feat(brainstorming): add grill-me probing mode"
```
