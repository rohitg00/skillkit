---
name: Red-Green-Refactor
description: Test-driven development cycle for writing reliable, well-designed code
version: 1.0.0
triggers:
  - tdd
  - test driven
  - write tests first
  - red green refactor
  - failing test
tags:
  - tdd
  - testing
  - quality
  - methodology
difficulty: intermediate
estimatedTime: 15
relatedSkills:
  - testing/test-patterns
  - testing/anti-patterns
---

# Red-Green-Refactor Methodology

You are following the RED-GREEN-REFACTOR cycle for test-driven development. This methodology ensures code is thoroughly tested and well-designed through iterative cycles.

## Core Principle

**Write a failing test BEFORE writing any production code.**

This is not optional. Every new feature, bug fix, or behavior change starts with a test that demonstrates the requirement.

## The Cycle

### 1. RED Phase - Write a Failing Test

Before writing any implementation:

1. **Understand the requirement** - What specific behavior needs to exist?
2. **Write a test** that asserts this behavior
3. **Run the test** - It MUST fail (red)
4. **Verify the failure** - Ensure it fails for the right reason, not due to syntax errors

The test should be:
- Focused on ONE specific behavior
- Named to describe what is being tested
- Using clear assertions with meaningful error messages

```
Example test structure:
describe('calculateTotal', () => {
  it('should apply discount when total exceeds threshold', () => {
    // Arrange - set up test data
    // Act - call the function
    // Assert - verify the result
  });
});
```

### 2. GREEN Phase - Make the Test Pass

Write the MINIMUM code necessary to make the test pass:

1. **Focus on passing**, not perfection
2. **Take the simplest path** - Even hardcoding is acceptable initially
3. **Do not add features** the test doesn't require
4. **Run the test** - It MUST pass (green)

Guidelines:
- If tempted to write more code than needed, STOP
- The goal is a passing test, not elegant code
- Ugly code is acceptable at this stage

### 3. REFACTOR Phase - Improve the Code

With a passing test as your safety net:

1. **Identify code smells** - Duplication, long methods, unclear names
2. **Refactor incrementally** - Small changes, run tests after each
3. **Maintain green** - Tests must pass after every change
4. **Stop when clean** - Don't over-engineer

Common refactorings:
- Extract method/function
- Rename for clarity
- Remove duplication
- Simplify conditionals

## Workflow Commands

When implementing a feature or fix:

1. **Start with a test file** - Create or update the test file first
2. **Write ONE failing test** - Focus on the smallest testable unit
3. **Implement minimally** - Just enough to pass
4. **Refactor if needed** - Clean up while tests are green
5. **Repeat** - Next test for next behavior

## Decision Points

### When to Write a New Test
- Adding a new feature or behavior
- Fixing a bug (test the bug first)
- Changing existing behavior
- Edge cases discovered during implementation

### When NOT to Write a Test
- Pure refactoring (existing tests cover it)
- Non-functional changes (formatting, comments)
- Third-party library behavior

## Verification Checklist

Before considering work complete:

- [ ] All new code has corresponding tests
- [ ] Tests fail when the feature is removed
- [ ] Tests pass consistently (not flaky)
- [ ] Code has been refactored for clarity
- [ ] No unnecessary code was added

## Common Mistakes to Avoid

1. **Writing tests after code** - Defeats the purpose of TDD
2. **Writing too many tests at once** - One test at a time
3. **Making tests pass with hacks** - The test should drive good design
4. **Skipping the refactor phase** - Technical debt accumulates
5. **Testing implementation details** - Test behavior, not internals

## Integration with Other Skills

This skill works well with:
- **test-patterns**: Provides patterns for structuring tests
- **anti-patterns**: Helps avoid common testing mistakes
- **debugging/root-cause-analysis**: When tests reveal unexpected failures
