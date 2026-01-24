---
name: Parallel Investigation
description: Coordinate multiple investigation threads for complex problems
version: 1.0.0
triggers:
  - investigate in parallel
  - multiple approaches
  - divide investigation
  - complex problem
  - explore options
tags:
  - collaboration
  - investigation
  - parallel
  - problem-solving
difficulty: advanced
estimatedTime: 15
relatedSkills:
  - debugging/root-cause-analysis
  - collaboration/handoff-protocols
---

# Parallel Investigation

You are coordinating parallel investigation threads to explore multiple hypotheses or approaches simultaneously. This is effective for complex problems where the root cause is unclear.

## Core Principle

**When uncertain, explore multiple paths in parallel. Converge when evidence points to an answer.**

Parallel investigation reduces time-to-solution for complex problems by eliminating serial bottlenecks.

## When to Use Parallel Investigation

Use this methodology when:

- Root cause is unknown with multiple plausible theories
- Problem is complex with many interacting components
- Time pressure requires faster resolution
- Multiple team members are available
- Initial investigation hasn't narrowed down the cause

Don't use when:
- Problem is straightforward
- Only one likely cause
- Resources are constrained

## Investigation Structure

### Phase 1: Problem Decomposition

Break the problem into independent investigation threads:

```
Problem: API responses are slow

Investigation Threads:
├── Thread A: Database performance
│   └── Check slow queries, indexes, connection pool
├── Thread B: Application code
│   └── Profile endpoint handlers, check for N+1
├── Thread C: Infrastructure
│   └── Check CPU, memory, network latency
└── Thread D: External services
    └── Check third-party API response times
```

Each thread should be:
- Independent (can be investigated without blocking others)
- Focused (clear scope and success criteria)
- Time-boxed (defined duration before sync)

### Phase 2: Thread Assignment

Assign threads with clear ownership:

```markdown
## Thread A: Database Performance
**Investigator:** [Name/Agent A]
**Duration:** 30 minutes
**Scope:**
- Query execution times
- Index utilization
- Connection pool metrics
**Report Format:** Summary + evidence

## Thread B: Application Code
**Investigator:** [Name/Agent B]
...
```

### Phase 3: Parallel Execution

Each thread follows this pattern:

```
1. Gather evidence specific to thread scope
2. Document findings as you go
3. Identify if thread is leading to answer or dead end
4. Prepare summary for sync point
```

**Thread Log Template:**
```markdown
## Thread: [Name]
**Start:** [Time]

### Findings
- [Timestamp] [Finding 1]
- [Timestamp] [Finding 2]

### Evidence
- [Screenshot/Log/Metric]

### Preliminary Conclusion
[What this thread suggests about the problem]
```

### Phase 4: Sync Points

Regular convergence to share findings:

```
Sync Point Agenda:
1. Thread A report (2 min)
2. Thread B report (2 min)
3. Thread C report (2 min)
4. Thread D report (2 min)
5. Discussion & correlation (5 min)
6. Decision: Continue, pivot, or converge (3 min)
```

**Sync Point Decisions:**
- **Continue**: Threads are progressing, continue parallel
- **Pivot**: Redirect threads based on new evidence
- **Converge**: One thread found the answer, others join

### Phase 5: Convergence

When a thread identifies the likely cause:

1. **Validate** - Other threads verify the finding
2. **Deep dive** - Focused investigation on identified cause
3. **Document** - Compile findings from all threads

## Coordination Patterns

### Hub and Spoke

One coordinator, multiple investigators:

```
        ┌─────────┐
        │  Hub    │
        │(Coord)  │
        └────┬────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌───────┐┌───────┐┌───────┐
│Thread ││Thread ││Thread │
│   A   ││   B   ││   C   │
└───────┘└───────┘└───────┘
```

Coordinator responsibilities:
- Assigns threads
- Tracks progress
- Calls sync points
- Makes convergence decisions

### Peer Network

Equal investigators sharing findings:

```
┌───────┐     ┌───────┐
│Thread │◄───▶│Thread │
│   A   │     │   B   │
└───┬───┘     └───┬───┘
    │             │
    ▼             ▼
    ◄─────────────►
         Shared
         Channel
```

Each investigator:
- Posts findings to shared channel
- Reviews others' findings
- Volunteers to converge when pattern emerges

## Communication Protocol

### During Investigation

```
[Thread A] [Status] Starting query analysis
[Thread B] [Finding] No N+1 patterns in user endpoint
[Thread A] [Finding] Slow query: SELECT * FROM orders WHERE...
[Thread C] [Dead End] CPU and memory within normal
[Thread A] [Hot Lead] Missing index on orders.user_id
```

### At Sync Point

```markdown
## Thread A Summary

**Status:** Hot Lead
**Key Finding:** Missing index on orders.user_id
**Evidence:** Query taking 3.2s, explain shows table scan
**Recommendation:** This is likely the cause, suggest converge
```

## Decision Framework

At each sync point:

| Thread Status | Action |
|---------------|--------|
| All exploring | Continue parallel |
| One hot lead | Validate lead, others support |
| Multiple leads | Prioritize by evidence strength |
| All dead ends | Reframe problem, new threads |
| Confirmed cause | Converge, begin fix |

## Time Management

```
Hour 1:
├── 0:00 - Problem decomposition
├── 0:10 - Thread assignment
├── 0:15 - Parallel investigation begins
├── 0:45 - Sync point #1
├── 0:50 - Continue/pivot/converge decision

Hour 2 (if needed):
├── 1:00 - Continue investigation
├── 1:30 - Sync point #2
├── 1:35 - Final convergence
```

## Documentation

### Final Report Structure

```markdown
# Investigation: [Problem]

## Summary
[Brief description and resolution]

## Threads Explored

### Thread A: [Area]
- Investigator: [Name]
- Findings: [Summary]
- Outcome: [Lead/Dead End/Root Cause]

### Thread B: [Area]
...

## Root Cause
[Detailed explanation of what was found]

## Evidence
- [Evidence 1]
- [Evidence 2]

## Resolution
[What was done to fix]

## Lessons Learned
- [Learning 1]
- [Learning 2]
```

## Integration with Other Skills

- **debugging/root-cause-analysis**: Each thread follows RCA principles
- **debugging/hypothesis-testing**: Threads test specific hypotheses
- **handoff-protocols**: When passing thread to another person
