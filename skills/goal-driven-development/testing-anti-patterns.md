# Testing Anti-Patterns

**Load this reference when:** writing or changing tests, adding mocks, changing architecture, or tempted to add test-only methods to production code.

## Overview

Tests must verify accepted behavior, not mock behavior or stale implementation details. Mocks are a means to isolate, not the thing being tested.

**Core principle:** Test the behavior the goal requires.

## The Iron Laws

```
1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER preserve stale architecture just to satisfy old tests
4. NEVER claim completion before required tests pass
```

## Anti-Pattern 1: Testing Mock Behavior

**The violation:**

```typescript
// BAD: Testing that the mock exists
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**Why this is wrong:**
- You're verifying the mock works, not that the component works
- Test passes when mock is present, fails when it's not
- Tells you nothing about accepted behavior

**your human partner's correction:** "Are we testing the behavior of a mock?"

**The fix:**

```typescript
// GOOD: Test real component behavior or don't mock it
test('renders sidebar navigation', () => {
  render(<Page />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

### Gate Function

```
BEFORE asserting on any mock element:
  Ask: "Am I testing accepted behavior or just mock existence?"

  IF testing mock existence:
    STOP - Delete the assertion or unmock the component

  Test accepted behavior instead
```

## Anti-Pattern 2: Test-Only Methods in Production

**The violation:**

```typescript
// BAD: destroy() only used in tests
class Session {
  async destroy() {
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}
```

**Why this is wrong:**
- Production class polluted with test-only code
- Dangerous if accidentally called in production
- Violates YAGNI and separation of concerns
- Confuses object lifecycle with entity lifecycle

**The fix:**

```typescript
// GOOD: Test utilities handle test cleanup
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}
```

### Gate Function

```
BEFORE adding any method to production class:
  Ask: "Is this only used by tests?"

  IF yes:
    STOP - Don't add it
    Put it in test utilities instead

  Ask: "Does this class own this resource's lifecycle?"

  IF no:
    STOP - Wrong class for this method
```

## Anti-Pattern 3: Mocking Without Understanding

**The violation:**

```typescript
// BAD: Mock breaks test logic
test('detects duplicate server', async () => {
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config); // Should throw, but won't if the mock skipped config writes
});
```

**Why this is wrong:**
- Mocked method had side effects the test depended on
- Over-mocking breaks actual behavior
- Test passes for the wrong reason or fails mysteriously

**The fix:** Mock at the lowest level that removes cost or nondeterminism while preserving behavior the test accepts.

### Gate Function

```
BEFORE mocking any method:
  STOP - Don't mock yet

  1. Ask: "What side effects does the real method have?"
  2. Ask: "Does this test depend on any of those side effects?"
  3. Ask: "Do I fully understand what this test needs?"

  IF depends on side effects:
    Mock at lower level or use a behavior-preserving test double

  IF unsure what test depends on:
    Run with real implementation first
```

## Anti-Pattern 4: Incomplete Mocks

**The violation:**

```typescript
// BAD: Partial mock - only fields you think you need
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // Missing metadata that downstream code uses
};
```

**Why this is wrong:**
- Partial mocks hide structural assumptions
- Downstream code may depend on omitted fields
- Tests pass but integration fails
- False confidence

**The Iron Rule:** Mock the complete data structure as it exists in reality, not just fields your immediate test uses.

## Anti-Pattern 5: Tests After Completion

**The violation:**

```
Implementation complete
No tests written
"Ready for testing"
```

**Why this is wrong:**
- Testing is part of acceptance, not optional follow-up
- You cannot claim completion without repeatable evidence
- Missing tests hide regressions and stale architecture

**The fix:**

```
1. Define the accepted behavior
2. Implement the minimal change
3. Add or update required tests
4. Run verification
5. THEN claim complete
```

## Anti-Pattern 6: Preserving Stale Architecture

**The violation:**

```typescript
// BAD: Kept only because old tests assert inheritance
class NewProcessor extends OldBaseProcessor {
  constructor(private readonly delegate: ProcessorDelegate) {
    super();
  }
}
```

**Why this is wrong:**
- The test is preserving old structure, not behavior
- Compatibility code adds maintenance cost and hidden coupling
- Architecture changes never finish if old implementation details remain sacred

**The fix:** Rewrite tests around the new contract, then remove old production code unless there is a real compatibility requirement.

## When Mocks Become Too Complex

**Warning signs:**
- Mock setup longer than test logic
- Mocking everything to make test pass
- Mocks missing methods real components have
- Test breaks when mock changes

**your human partner's question:** "Do we need to be using a mock here?"

Consider integration tests with real components. They are often simpler than complex mocks.

## Quick Reference

| Anti-Pattern | Fix |
|--------------|-----|
| Assert on mock elements | Test real component behavior or unmock it |
| Test-only methods in production | Move to test utilities |
| Mock without understanding | Understand dependencies first, mock minimally |
| Incomplete mocks | Mirror real API completely |
| Tests after completion | Tests are acceptance evidence, not follow-up |
| Stale architecture tests | Rewrite or delete tests that only assert old structure |
| Over-complex mocks | Consider integration tests |

## Red Flags

- Assertion checks for `*-mock` test IDs
- Methods only called in test files
- Mock setup is more than half of the test
- Test fails when you remove a mock but behavior still works
- Can't explain why mock is needed
- Mocking "just to be safe"
- Keeping old code only because an old test fails
- Reporting done before test evidence exists

## The Bottom Line

Tests are acceptance evidence. If they do not prove accepted behavior, they are not helping.

Fix: test real behavior, update stale tests, and remove old production code when the goal no longer requires it.
