---
name: goal-driven-development
description: Use when implementing features, bug fixes, refactors, behavior changes, or architecture changes
---

# Goal-Driven Development

## Overview

Start from the goal, not from a test shape. Define the target behavior and acceptance evidence first, implement the smallest correct change, then complete automated tests before claiming the work is done.

**Core principle:** Implementation is not complete until the goal is verified by evidence the next agent can rerun.

## When to Use

Use for:
- New features
- Bug fixes
- Refactoring
- Behavior changes
- Architecture changes

Do not use this to avoid tests. Tests are part of acceptance.

## The Iron Law

```
NO COMPLETION CLAIM WITHOUT VERIFIED GOALS AND PASSING REQUIRED TESTS
```

Code can be written before tests. Done cannot be claimed before tests and acceptance evidence.

## Goal-Driven Loop

1. **Define the goal**
   - What observable behavior or structural outcome is required?
   - What is explicitly out of scope?

2. **Define acceptance evidence**
   - Which unit tests, integration tests, commands, logs, screenshots, or manual checks prove the goal?
   - Prefer automated tests. Use manual checks only when automation is not feasible.

3. **Implement the minimal correct change**
   - Build only what the goal requires.
   - Follow existing project patterns.
   - Do not add compatibility code without a concrete compatibility requirement.

4. **Add or update tests before acceptance**
   - Tests must describe accepted behavior, not implementation accidents.
   - Unit tests cover local logic.
   - Integration tests cover boundaries and real interactions.

5. **Run verification**
   - If verification passes, record the evidence.
   - If verification fails, fix implementation or re-evaluate stale tests.
   - If the goal was wrong or ambiguous, stop and clarify.

6. **Report only after evidence exists**
   - State what changed.
   - State why.
   - State exactly what verification ran and what passed.

## Architecture Transition Discipline

When the implementation architecture changes, tests are judged by business behavior, not old structure.

**Valid tests:** Describe behavior that should still exist. Keep them, but rewrite them against the new public contract if needed.

**Stale tests:** Assert implementation details from the old architecture. Update or delete them.

**Forbidden:** Keeping old production code, inheritance trees, adapters, compatibility layers, or dead paths solely to make stale tests pass.

Compatibility code is allowed only for concrete needs such as persisted data, shipped public APIs, external consumers, or an explicit human instruction.

## Testing Requirements

Good tests:
- Verify behavior the goal requires
- Fail when the accepted behavior is broken
- Use real code and real processes where practical
- Keep mocks minimal and behavior-preserving
- Cover important success paths, boundaries, and errors

Bad tests:
- Assert mock existence instead of real behavior
- Mirror the implementation without checking outcomes
- Lock old architecture after the goal changed
- Require production-only compatibility code for no external reason

When adding mocks or test utilities, read @testing-anti-patterns.md.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll add tests later" | Later means not done. Tests are part of acceptance. |
| "It works manually" | Manual checks are not repeatable unless documented, and they do not replace feasible automated tests. |
| "The old tests force this compatibility layer" | First decide whether those tests still describe valid behavior. Stale tests do not justify old code. |
| "Changing tests is cheating" | Updating stale implementation-detail tests is correct when the goal changed. Deleting valid behavior tests is cheating. |
| "Tests fail but the feature looks right" | Either the implementation is wrong, the test is stale, or the goal is unclear. Classify before proceeding. |
| "This is just a refactor" | Refactors still need verification that accepted behavior did not change. |

## Red Flags - STOP

- Reporting done before running required tests
- Saying "ready for testing" after implementation
- Keeping old architecture only to satisfy old tests
- Adding compatibility layers without persisted data, shipped API, external consumers, or explicit instruction
- Deleting behavior tests because they are inconvenient
- Changing tests to assert current implementation instead of accepted behavior
- Using mocks that hide the behavior being accepted
- Treating manual checks as enough when automated tests are feasible

All of these mean: stop, define the goal and evidence, then finish the verification loop.

## Example: Architecture Change

**Goal:** Replace inheritance-based payment processors with composition while preserving payment authorization behavior.

**Old stale test:**

```typescript
expect(cardProcessor).toBeInstanceOf(BasePaymentProcessor);
```

This test describes old structure, not accepted behavior. Delete or rewrite it.

**Behavior test to keep:**

```typescript
test('authorizes card payments with the configured gateway', async () => {
  const gateway = new FakeGateway({ approvalCode: 'ok-123' });
  const processor = createCardProcessor({ gateway });

  const result = await processor.authorize({ amount: 2500, currency: 'USD' });

  expect(result).toEqual({ status: 'approved', approvalCode: 'ok-123' });
});
```

The production code should not keep `BasePaymentProcessor` solely for the stale test. Preserve behavior, not the old architecture.

## Bug Fixes

Before fixing, reproduce the symptom or identify concrete evidence of the root cause. After fixing, add or update a regression test before claiming completion.

If the regression test cannot be automated, document the manual verification path and why automation is not feasible.

## Verification Checklist

Before marking work complete:

- [ ] Goal and acceptance evidence are explicit
- [ ] Implementation matches the goal and does not overbuild
- [ ] Unit tests cover local behavior where useful
- [ ] Integration tests cover cross-boundary behavior where relevant
- [ ] Tests do not assert stale architecture or mock behavior
- [ ] Stale tests were updated or deleted with a clear reason
- [ ] Valid behavior tests still pass
- [ ] Required verification commands were run and results recorded
- [ ] No compatibility code was kept without a concrete compatibility requirement

Can't check these boxes? The work is not complete.
