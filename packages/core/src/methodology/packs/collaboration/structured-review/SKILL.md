---
name: Structured Code Review
description: Multi-stage code review process for thorough and constructive feedback
version: 1.0.0
triggers:
  - code review
  - review this
  - feedback on code
  - PR review
  - review my changes
tags:
  - collaboration
  - code-review
  - quality
  - feedback
difficulty: intermediate
estimatedTime: 15
relatedSkills:
  - collaboration/parallel-investigation
  - planning/verification-gates
---

# Structured Code Review

You are performing a structured, multi-stage code review. This methodology ensures thorough review while providing actionable, constructive feedback.

## Core Principle

**Review in stages. Each stage has a specific focus. Don't mix concerns.**

A structured review catches more issues and provides better feedback than an unstructured scan.

## Review Stages

### Stage 1: Requirements Compliance

First, verify the code meets its requirements.

**Questions to Answer:**
- Does this implement what was requested?
- Are all acceptance criteria met?
- Are edge cases handled?
- Is scope appropriate (not too little, not too much)?

**Checklist:**
- [ ] Implements stated requirements
- [ ] Handles specified edge cases
- [ ] No scope creep (unexpected additions)
- [ ] No missing functionality

**Feedback at this stage:**
- "This doesn't appear to handle the case when X is empty"
- "The requirement specified Y, but this implements Z"
- "This adds feature F which wasn't requested - is that intentional?"

### Stage 2: Correctness

Next, verify the code works correctly.

**Questions to Answer:**
- Is the logic correct?
- Are there bugs or errors?
- Are error conditions handled?
- Is the code complete?

**Checklist:**
- [ ] Logic is sound
- [ ] No obvious bugs
- [ ] Error paths are handled
- [ ] No unfinished code (TODOs without tickets)

**Feedback at this stage:**
- "This will throw if `user` is null"
- "The loop exits early before processing all items"
- "What happens when the API call fails?"

### Stage 3: Code Quality

Then, evaluate code quality and maintainability.

**Questions to Answer:**
- Is the code readable?
- Does it follow conventions?
- Is it appropriately simple?
- Is it maintainable?

**Checklist:**
- [ ] Clear naming
- [ ] Reasonable function/method length
- [ ] No unnecessary complexity
- [ ] Follows project conventions
- [ ] Appropriate abstractions

**Feedback at this stage:**
- "Could you rename `data` to `userProfile` for clarity?"
- "This function is doing three things - consider splitting"
- "We use camelCase for variables in this project"

### Stage 4: Testing

Evaluate test coverage and quality.

**Questions to Answer:**
- Is there adequate test coverage?
- Do tests verify the right things?
- Are tests maintainable?

**Checklist:**
- [ ] New code has tests
- [ ] Tests cover main paths and edge cases
- [ ] Tests are readable and maintainable
- [ ] Tests don't test implementation details

**Feedback at this stage:**
- "Please add a test for the error case"
- "This test will break if we change the implementation"
- "Consider using a parameterized test for these cases"

### Stage 5: Security & Performance

Finally, check for security and performance concerns.

**Questions to Answer:**
- Are there security vulnerabilities?
- Are there performance issues?
- Is data handled appropriately?

**Checklist:**
- [ ] No SQL injection, XSS, etc.
- [ ] Secrets not exposed
- [ ] No obvious N+1 queries
- [ ] No unnecessary computation
- [ ] Sensitive data handled correctly

**Feedback at this stage:**
- "This input should be sanitized before use"
- "Consider adding an index for this query"
- "This API key should come from environment variables"

## Writing Good Feedback

### Feedback Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| **Blocker** | Must fix before merge | "Security: This allows SQL injection" |
| **Major** | Should fix, but not critical | "This will fail for empty arrays" |
| **Minor** | Suggestion, nice to have | "Consider renaming for clarity" |
| **Nit** | Trivial, stylistic | "Extra blank line here" |

### Constructive Feedback Template

```
[Level] [Category]: [Issue]

**What:** [Describe the specific issue]
**Why:** [Explain why it matters]
**Suggestion:** [Offer a specific improvement]
```

Example:
```
[Major] Correctness: Null reference possible

**What:** `user.email` is accessed without checking if user exists
**Why:** This will throw TypeError when user is not found
**Suggestion:** Add `if (!user) return null;` before accessing properties
```

### Feedback Anti-Patterns

**Don't:**
- "This is wrong" (not actionable)
- "I would have done it differently" (without explanation)
- "Why didn't you...?" (sounds accusatory)
- Nitpicking on preferences (not conventions)

**Do:**
- Be specific about the issue
- Explain the impact
- Offer a solution or alternative
- Ask questions to understand intent

## Review Conversation

### Responding to Feedback

When receiving review comments:

1. **Acknowledge** - Confirm you've read and understood
2. **Clarify** if needed - Ask questions if unclear
3. **Address** - Make changes or explain why not
4. **Resolve** - Mark as resolved when done

### Disagreeing Constructively

If you disagree with feedback:

```
I see your point about [X]. In this case, I chose [Y] because [reason].
Would you like to discuss further, or is this approach acceptable?
```

## Review Checklist Summary

```markdown
## Review: [PR Title]

### Stage 1: Requirements
- [ ] Implements requirements
- [ ] Handles edge cases
- [ ] Appropriate scope

### Stage 2: Correctness
- [ ] Logic is sound
- [ ] No bugs
- [ ] Errors handled

### Stage 3: Quality
- [ ] Readable
- [ ] Follows conventions
- [ ] Maintainable

### Stage 4: Testing
- [ ] Has tests
- [ ] Tests are good

### Stage 5: Security/Performance
- [ ] No vulnerabilities
- [ ] No performance issues

### Verdict: [ ] Approve [ ] Request Changes [ ] Comment
```

## Time Management

For different PR sizes:

| Size | Expected Time | Approach |
|------|---------------|----------|
| Small (< 100 lines) | 10-15 minutes | Full structured review |
| Medium (100-300 lines) | 20-30 minutes | Full structured review |
| Large (300+ lines) | 45-60 minutes | Consider splitting PR |

If PR is too large, request it be split before review.

## Integration with Other Skills

- **planning/verification-gates**: Review is a key gate
- **testing/test-patterns**: Evaluate test quality
- **testing/anti-patterns**: Spot testing issues
