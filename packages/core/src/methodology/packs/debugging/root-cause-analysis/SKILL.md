---
name: Root Cause Analysis
description: Systematic approach to finding the true source of bugs, not just symptoms
version: 1.0.0
triggers:
  - root cause
  - debugging
  - find the bug
  - why is this happening
  - investigate issue
  - bug investigation
tags:
  - debugging
  - investigation
  - problem-solving
  - systematic
difficulty: intermediate
estimatedTime: 20
relatedSkills:
  - debugging/trace-and-isolate
  - debugging/hypothesis-testing
---

# Root Cause Analysis

You are performing systematic root cause analysis to find the true source of a bug. Do not apply fixes until you understand WHY the bug exists.

## Core Principle

**Never fix a symptom. Always find and fix the root cause.**

A root cause is the earliest point in the causal chain where intervention could prevent the defect.

## The Five Whys Method

Ask "Why?" repeatedly to drill down to the root cause:

1. **Why** did the API return an error?
   → The database query failed
2. **Why** did the database query fail?
   → The connection timed out
3. **Why** did the connection time out?
   → The connection pool was exhausted
4. **Why** was the connection pool exhausted?
   → Connections weren't being released
5. **Why** weren't connections being released?
   → **ROOT CAUSE:** Missing `finally` block to close connections

## Investigation Phases

### Phase 1: Reproduce the Bug

Before investigating:

1. **Reproduce consistently** - If you can't reproduce it, you can't verify a fix
2. **Document reproduction steps** - Exact sequence of actions
3. **Note environment details** - OS, versions, configuration
4. **Identify minimal reproduction** - Smallest case that shows the bug

Questions to answer:
- Does it happen every time or intermittently?
- Does it happen in all environments?
- When did it start happening? (recent changes)

### Phase 2: Gather Evidence

Collect information before forming theories:

```
Evidence Types:
├── Error messages and stack traces
├── Log files (application, system, database)
├── Recent code changes (git log, blame)
├── User reports and reproduction steps
├── Monitoring data (metrics, APM)
└── Related issues (search issue tracker)
```

Do NOT:
- Make changes while gathering evidence
- Assume you know the cause without evidence
- Ignore related symptoms

### Phase 3: Form Hypotheses

Based on evidence, create ranked hypotheses:

| Priority | Hypothesis | Evidence | Test Plan |
|----------|------------|----------|-----------|
| 1 | Connection leak in UserService | Stack trace shows connection pool | Add logging, check usage |
| 2 | Query timeout too short | Occurs under load | Test with longer timeout |
| 3 | Database server overload | Correlates with peak hours | Check DB metrics |

For each hypothesis:
- What evidence supports it?
- What evidence contradicts it?
- How can we test it?

### Phase 4: Test Hypotheses

Test each hypothesis systematically:

1. **Start with highest probability**
2. **Design a definitive test** - Should clearly confirm or reject
3. **Make ONE change at a time**
4. **Document results**

If hypothesis is rejected:
- Cross it off the list
- Re-evaluate remaining hypotheses
- Consider if new evidence suggests new hypotheses

### Phase 5: Verify Root Cause

Before declaring root cause found:

- [ ] Can you explain the full causal chain?
- [ ] Does fixing it consistently prevent the bug?
- [ ] Does it explain ALL observed symptoms?
- [ ] Is there nothing earlier in the chain that could be fixed?

## Common Root Cause Categories

### Code Defects
- Logic errors
- Boundary conditions
- Race conditions
- Resource leaks
- Null/undefined handling

### Design Issues
- Missing error handling
- Inadequate validation
- Poor state management
- Coupling issues

### Environment
- Configuration errors
- Resource constraints
- Version mismatches
- Network issues

### Data Issues
- Invalid input data
- Data corruption
- Schema mismatches
- Encoding problems

## Evidence Collection Commands

```bash
# Recent changes to relevant files
git log --oneline -20 -- path/to/file

# Who changed this line
git blame path/to/file

# Changes since last working version
git diff v1.2.3..HEAD -- src/

# Search for related error handling
grep -r "catch\|error\|throw" --include="*.ts" src/
```

## Red Flags - You Haven't Found Root Cause

- "I'm not sure why, but this fix works"
- "The bug went away after I restarted"
- "I added a check to prevent this case"
- "It's probably a race condition somewhere"

These suggest symptom treatment, not root cause resolution.

## Documentation Template

When root cause is found, document:

```markdown
## Bug: [Description]

### Root Cause
[Clear explanation of why the bug occurred]

### Evidence
- [Evidence 1]
- [Evidence 2]

### Causal Chain
1. [Initial trigger]
2. [Intermediate cause]
3. [Root cause]
4. [Observed symptom]

### Fix
[Description of the fix and why it addresses root cause]

### Prevention
[How to prevent similar issues in the future]
```

## Integration with Other Skills

After finding root cause:
- Use **testing/red-green-refactor** to write a test that exposes the bug
- Use **planning/verification-gates** to validate the fix
- Consider **collaboration/structured-review** for complex fixes
