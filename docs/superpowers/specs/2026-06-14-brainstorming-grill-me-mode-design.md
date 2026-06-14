# Brainstorming Grill-Me Mode Design

## Problem

The current `brainstorming` skill works well when the user brings a rough or ambiguous idea, but it can over-reset the conversation when the user already has a starting plan. In that situation, the useful behavior is not to guide from a blank slate. The useful behavior is to interrogate the user's plan, expose assumptions, resolve decision branches, and converge to a spec.

The goal is to add that behavior without creating a separate discoverable skill, without weakening the existing brainstorming hard gates, and without changing the way OpenCode discovers skills.

## Goals

- Add a `Grill Me` mode to `brainstorming` for users who already have an idea, plan, design, or architecture sketch.
- Reuse the existing support-document pattern used by `visual-companion.md`: the main skill detects the situation, then loads a same-directory supporting document when that mode applies.
- Preserve the current brainstorming sequence: context exploration, one question at a time, design approval, written spec, spec self-review, user review, then `writing-plans`.
- Make mode activation explicit: direct user requests always trigger it; inferred activation requires the agent to announce the mode before asking the first probing question.
- Keep the user's starting plan as the baseline being tested, not discard it in favor of a from-scratch option list.

## Non-Goals

- Do not add `grill-me` as an independent OpenCode skill with frontmatter discovery.
- Do not change `brainstorming` frontmatter or broaden global skill discovery triggers.
- Do not remove the requirement to propose alternatives where alternatives are useful.
- Do not bypass spec writing, spec review, or user approval gates.
- Do not add third-party dependencies or runtime integration with the upstream `mattpocock/skills` repository.

## Source Material

The supporting document will copy the upstream `grill-me` skill text into the `brainstorming` skill directory as local reference material.

Upstream source:

- `https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md`
- License checked from `https://raw.githubusercontent.com/mattpocock/skills/main/LICENSE`: MIT License, copyright Matt Pocock.

Because the upstream material is short and MIT licensed, the implementation may preserve the original text in a local support document. Any future PR should mention the copied source and license in the PR body.

## Design

### Supporting Document

Create a new support document next to the existing brainstorming support files:

```text
skills/brainstorming/grill-me.md
```

This file is not a standalone skill. It should not include OpenCode skill frontmatter. It is loaded only because `skills/brainstorming/SKILL.md` instructs the agent to read it when `Grill Me` mode applies.

The file initially preserves the upstream `grill-me` behavior text. If additional local guidance is needed later, it should be added around the copied text in a way that keeps the source material identifiable.

### Main Skill Integration

Update `skills/brainstorming/SKILL.md` to add a conditional branch after project context exploration and before ordinary clarification questions.

Activation rules:

1. Explicit activation: if the user directly asks to be grilled, challenged, interrogated, or stress-tested, use `Grill Me` mode.
2. Inferred activation: if the user message already contains a concrete starting plan, design, architecture, or proposed implementation direction but does not directly ask to be grilled or challenged, the agent may use `Grill Me` mode, but must first state that it is doing so.
3. Non-activation: if the user only gives a vague idea or asks to build something from scratch, continue with normal brainstorming.

The explicit announcement for inferred activation should be short and operational, for example:

```text
You already have a starting plan, so I’ll use Grill Me mode: I’ll probe the plan one decision at a time and give a recommended answer for each question.
```

### Grill-Me Behavior

When active, the agent should:

- Load `skills/brainstorming/grill-me.md` before asking probing questions.
- Ask one question at a time.
- Walk the dependency tree of decisions instead of asking a flat checklist.
- For each question, include the recommended answer.
- If the question can be answered by inspecting the codebase, inspect the codebase instead of asking the user.
- Keep the user's starting plan as the baseline under review.
- Stop probing once the key assumptions, scope boundaries, failure modes, and acceptance criteria are clear enough to present the design.

This mode should make the normal `Exploring approaches` step more respectful of the user's starting point. The user's plan becomes the baseline option. Alternatives should be introduced only when they reveal a meaningful trade-off or risk.

### Flow Placement

The existing flow remains intact. Conceptually, the updated flow is:

1. Explore project context.
2. If the topic needs visual support, offer the visual companion as before.
3. Determine whether the user already has a starting plan.
4. If yes, optionally enter `Grill Me` mode and load `grill-me.md`.
5. Ask clarifying or probing questions one at a time.
6. Present approaches with the user's plan as the baseline when applicable.
7. Present the design and get approval.
8. Write the spec, self-review it, and ask the user to review it.
9. Transition only to `writing-plans`.

## Safety and Compatibility

- The hard gate in `brainstorming` remains unchanged: no implementation action before design approval.
- The terminal state remains unchanged: after brainstorming, the only next skill is `writing-plans`.
- The visual companion remains independent. A task can use both modes only if both conditions apply: visual questions and an existing plan that benefits from probing.
- The integration does not add a new discoverable skill, so it does not change OpenCode skill discovery behavior.
- The mode must not become adversarial in tone. “Grill” means rigorous and persistent, not hostile.

## Evaluation Plan

This is a behavior-shaping skill change, so implementation must include baseline-driven evaluation before final acceptance.

Baseline scenarios before the change:

1. User gives a vague request, such as “Let’s make a React todo list.” Expected baseline: normal brainstorming should ask clarifying questions, not enter `Grill Me` mode.
2. User provides a concrete architecture sketch and asks to refine it. Expected baseline failure to look for: agent may discard the sketch and restart from generic options.
3. User asks “grill me on this design.” Expected baseline failure to look for: agent may ask generic brainstorming questions rather than probing decision dependencies.
4. User asks a question whose answer exists in the repo. Expected baseline failure to look for: agent asks the user instead of checking the codebase.

Post-change scenarios:

1. Vague request still follows normal brainstorming.
2. Concrete starting plan triggers an explicit `Grill Me` announcement before probing.
3. Explicit “grill me” request loads `skills/brainstorming/grill-me.md` and asks one question at a time with a recommended answer.
4. Repo-answerable questions are answered by code inspection instead of being sent to the user.
5. The resulting design still goes through approval, spec writing, self-review, user review, and transition to `writing-plans`.

Acceptance evidence should include the exact scenario prompts, observed before/after behavior, and any rationalizations that the wording had to close.

## Implementation Plan Preview

The later implementation plan should include these steps:

1. Capture baseline behavior with pressure scenarios.
2. Add `skills/brainstorming/grill-me.md` with the upstream text.
3. Update `skills/brainstorming/SKILL.md` checklist, process flow, understanding section, and approach section.
4. Run post-change pressure scenarios.
5. Refine wording only if observed agents still skip the mode, over-trigger the mode, ask multiple questions, or bypass approval gates.

## Open Questions

None. The activation strategy is explicit: direct trigger first, inferred trigger only with an announcement before probing.
