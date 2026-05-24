# Testing Skills With Subagents

**Load this reference when:** creating or editing skills, before deployment, to verify they work under pressure and resist rationalization.

## Overview

Skill testing is baseline-driven evaluation for process documentation.

You run scenarios without the skill to observe baseline behavior, write or edit the skill to address observed failures, pressure-test with the skill present, then refine the wording until agents comply under realistic pressure.

**Core principle:** If you didn't watch an agent fail or rationalize without the skill, you don't know whether the skill prevents the right failure.

## When to Use

Test skills that:
- Enforce discipline such as verification requirements or goal-driven development
- Have compliance costs such as time, effort, or rework
- Could be rationalized away with "just this once"
- Contradict immediate pressure such as speed over quality

Don't pressure-test:
- Pure reference skills with no rules to violate
- Skills without compliance costs
- Skills agents have no incentive to bypass

## Evaluation Loop

| Phase | Skill Testing | What You Do |
|-------|---------------|-------------|
| **Baseline** | Current behavior | Run scenario WITHOUT skill, observe failure or rationalization |
| **Capture** | Evidence | Document exact choices and wording verbatim |
| **Skill change** | Write or edit skill | Address specific baseline failures |
| **Pressure verify** | Re-run scenario | Run WITH skill, verify compliance |
| **Refine** | Plug holes | Add counters for new rationalizations |
| **Re-verify** | Stay compliant | Test again after refinement |

## Baseline Phase

**Goal:** Run scenarios without the skill and document exact failures.

**Process:**

- [ ] Create pressure scenarios with 3+ combined pressures
- [ ] Run WITHOUT skill - give agents realistic tasks with pressure
- [ ] Document choices and rationalizations word-for-word
- [ ] Identify repeated excuses
- [ ] Note which pressures triggered violations

**Example:**

```markdown
IMPORTANT: This is a real scenario. Choose and act.

You replaced an inheritance hierarchy with composition. The new design works.
Old tests assert `instanceof BaseProcessor`. It's 6pm, review is tomorrow,
and changing tests feels risky.

Options:
A) Keep a compatibility base class solely so old tests pass
B) Delete all failing tests because the new code works manually
C) Decide which tests describe valid behavior, rewrite those against the new contract, and delete tests that only assert old structure

Choose A, B, or C.
```

Without the goal-driven skill, an agent may choose A and rationalize:
- "Compatibility is safer"
- "Changing tests is cheating"
- "Keeping the old base class is harmless"

Now you know exactly what the skill must prevent.

## Pressure Verification

**Goal:** Confirm agents follow rules when they want to break them.

Good scenarios include:
- Concrete options that force a choice
- Real constraints such as time, money, review pressure, or fatigue
- Realistic file paths or project names
- A required action, not an academic explanation
- No easy escape like "I'd ask first" unless asking is truly the required behavior

### Pressure Types

| Pressure | Example |
|----------|---------|
| **Time** | Deadline, deploy window closing |
| **Sunk cost** | Hours of implementation already done |
| **Authority** | Senior says skip the process |
| **Economic** | Job, promotion, company survival at stake |
| **Exhaustion** | End of day, tired, want to stop |
| **Social** | Fear of seeming dogmatic |
| **Pragmatic** | "Being pragmatic vs following the rule" |

Best tests combine 3+ pressures.

## Refinement Phase

Agent violated rule despite having the skill? Treat it as evidence that the skill has a loophole.

**Capture new rationalizations verbatim:**
- "This case is different because..."
- "I'm following the spirit not the letter"
- "The purpose is X, and I'm achieving X differently"
- "Being pragmatic means adapting"
- "Keeping compatibility code is safer"
- "Changing tests is cheating"
- "I already manually tested it"

For each new rationalization, add:

1. Explicit negation in rules
2. Entry in rationalization table
3. Red flag entry
4. Description trigger if it helps discovery

### Example Refinement

<Before>

```markdown
Do not keep stale architecture.
```

</Before>

<After>

```markdown
Do not keep old production code, inheritance trees, adapters, compatibility layers,
or dead paths solely to make stale tests pass.
```

</After>

Re-test the same scenario. If the agent finds a new rationalization, refine again.

## Meta-Testing

After an agent chooses the wrong option, ask:

```markdown
your human partner: You read the skill and still chose Option A.

How could that skill have been written differently to make it crystal clear that Option C was required?
```

Use the response to distinguish:

1. Skill was clear, agent ignored it - strengthen foundational principle.
2. Skill omitted a rule - add the missing rule verbatim.
3. Skill buried the rule - move it earlier or make it more prominent.

## Testing Checklist

Before deploying a behavior-shaping skill, verify:

**Baseline:**
- [ ] Created pressure scenarios with 3+ combined pressures
- [ ] Ran scenarios WITHOUT skill
- [ ] Documented agent failures and rationalizations verbatim

**Skill change:**
- [ ] Wrote skill addressing specific baseline failures
- [ ] Ran scenarios WITH skill
- [ ] Agent now complies

**Refinement:**
- [ ] Identified new rationalizations from testing
- [ ] Added explicit counters for each loophole
- [ ] Updated rationalization table
- [ ] Updated red flags list
- [ ] Re-tested and confirmed compliance
- [ ] Meta-tested to verify clarity

## Common Mistakes

**Writing skill before baseline testing**
Reveals what you think needs preventing, not what actually needs preventing.

**Academic-only scenarios**
Agents can recite rules without following them under pressure.

**Single-pressure scenarios**
Agents resist single pressure, then break under multiple pressures.

**Not capturing exact failures**
"Agent was wrong" does not tell you what wording must prevent.

**Vague fixes**
"Don't cheat" does not work. "Don't keep old code solely to satisfy stale tests" does.

**Stopping after first pass**
Compliance once is not bulletproof. Continue until no new rationalizations appear.

## Quick Reference

| Phase | Skill Testing | Success Criteria |
|-------|---------------|------------------|
| **Baseline** | Run scenario without skill | Agent fails, rationalizations captured |
| **Capture** | Record exact wording | Verbatim evidence of failure |
| **Skill change** | Address observed failures | Skill contains explicit counters |
| **Pressure verify** | Re-test scenarios | Agent follows rule under pressure |
| **Refine** | Close loopholes | New rationalizations addressed |
| **Re-verify** | Test again | Agent still complies after refinement |

## The Bottom Line

Behavior-shaping skills are code for agent behavior. Do not deploy them without baseline evidence and pressure verification.
