---
name: Skill Authoring
description: Guidelines for writing effective AI agent skills
version: 1.0.0
triggers:
  - write a skill
  - create skill
  - author skill
  - skill template
  - how to write skills
tags:
  - meta
  - authoring
  - skills
  - writing
difficulty: intermediate
estimatedTime: 20
relatedSkills: []
---

# Skill Authoring Guide

You are authoring a skill for AI coding agents. A well-written skill provides clear, actionable guidance that agents can follow consistently.

## Core Principle

**A skill should be the description that triggers it, NOT a summary of the workflow.**

The trigger/description tells the agent WHEN to use the skill. The content tells the agent HOW to execute it.

## Skill Anatomy

### SKILL.md Structure

```markdown
---
name: [Human-readable name]
description: [What this skill does - for triggers]
version: [Semantic version]
triggers:
  - [keyword 1]
  - [keyword 2]
tags:
  - [tag 1]
  - [tag 2]
difficulty: [beginner|intermediate|advanced]
estimatedTime: [minutes]
relatedSkills:
  - [pack/skill-name]
---

# [Skill Title]

[Introduction paragraph explaining the skill's purpose]

## Core Principle

**[Single most important rule in bold]**

[Brief explanation of why this principle matters]

## [Main Content Sections]

[Detailed guidance organized into logical sections]

## [Decision Points / When to Use]

[Help the agent know when to apply this skill]

## [Verification / Checklist]

[How to verify the skill was applied correctly]
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Human-readable skill name |
| description | Yes | Brief description (triggers) |
| version | Yes | Semantic version (1.0.0) |
| triggers | Recommended | Keywords that activate skill |
| tags | Recommended | Categorization tags |
| difficulty | Optional | beginner/intermediate/advanced |
| estimatedTime | Optional | Minutes to apply |
| relatedSkills | Optional | Related skill IDs |

## Writing Effective Triggers

Triggers should be phrases users naturally type:

**Good triggers:**
- "write tests first"
- "tdd"
- "test driven development"
- "failing test before code"

**Bad triggers:**
- "testing methodology" (too vague)
- "red-green-refactor-cycle-for-test-driven-development" (too specific)
- "skill-123" (not natural language)

### Trigger Guidelines

1. **Natural language** - How would a human ask for this?
2. **Multiple variations** - Different ways to say the same thing
3. **Specific enough** - Don't trigger on too many queries
4. **Common terms** - Use terms people actually use

## Writing Skill Content

### Voice and Tone

Use **second person, present tense, active voice**:

- "You are implementing TDD"
- "Write the test first"
- "Verify the output"

Avoid:
- "The developer should..." (passive)
- "One might consider..." (vague)
- "It is recommended that..." (wordy)

### Structure Guidelines

1. **Start with context** - What is the agent doing and why
2. **State the core principle** - Most important rule upfront
3. **Provide process** - Step-by-step guidance
4. **Include examples** - Concrete illustrations
5. **Add checklists** - Verification criteria
6. **End with integration** - How this connects to other skills

### Directive Language

Use clear, unambiguous directives:

**Strong directives:**
- "You MUST..."
- "ALWAYS..."
- "NEVER..."
- "Do NOT..."

**Softer guidance:**
- "Prefer..."
- "Consider..."
- "When possible..."

Use strong directives for critical rules, softer guidance for recommendations.

## Content Patterns

### Decision Trees

When the agent needs to choose paths:

```markdown
## Decision: [What to Decide]

If [condition A]:
→ [Action for A]

If [condition B]:
→ [Action for B]

If uncertain:
→ [Default action]
```

### Process Steps

For sequential workflows:

```markdown
### Step 1: [Action]

[Detailed explanation]

**Verification:** [How to know step is complete]

### Step 2: [Action]
...
```

### Tables for Comparisons

```markdown
| Situation | Action | Rationale |
|-----------|--------|-----------|
| [Case 1] | [Do X] | [Why] |
| [Case 2] | [Do Y] | [Why] |
```

### Code Examples

Show, don't just tell:

```typescript
// BAD - Shows what NOT to do
const result = doTheThing(badInput);

// GOOD - Shows correct approach
const validated = validate(input);
const result = doTheThing(validated);
```

### Checklists

For verification:

```markdown
## Verification Checklist

Before marking complete:

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
```

## Anti-Patterns to Avoid

### The Encyclopedia

**Problem:** Too much information, agent gets lost
**Fix:** Focus on actionable guidance, link to details

### The Vague Guide

**Problem:** "Consider best practices" (What practices?)
**Fix:** Be specific: "Use Arrange-Act-Assert pattern"

### The Constraint-Free Skill

**Problem:** No clear rules, agent improvises
**Fix:** Include explicit constraints and rules

### The Monologue

**Problem:** Wall of text with no structure
**Fix:** Use headers, lists, tables, code blocks

### The Outdated Skill

**Problem:** References deprecated patterns/tools
**Fix:** Version skills, include validity dates

## Skill Testing

Before publishing, verify:

1. **Trigger test** - Does it activate on expected phrases?
2. **Completeness test** - Can agent follow without external info?
3. **Clarity test** - Is every instruction unambiguous?
4. **Contradiction test** - No conflicting guidance?
5. **Edge case test** - Handles unusual situations?

### Manual Verification

```
Test Query: "[trigger phrase]"
Expected: Skill activates and provides relevant guidance
Actual: [Record what happened]
```

## Pack Organization

Skills should be organized into methodology packs:

```
packs/
├── testing/
│   ├── pack.json
│   ├── red-green-refactor/
│   │   └── SKILL.md
│   └── test-patterns/
│       └── SKILL.md
├── debugging/
│   ├── pack.json
│   └── ...
```

### Pack Manifest

```json
{
  "name": "testing",
  "version": "1.0.0",
  "description": "Testing methodology skills",
  "skills": ["red-green-refactor", "test-patterns"],
  "tags": ["testing", "tdd", "quality"],
  "compatibility": ["all"]
}
```

## Skill Maintenance

### Version Updates

When to increment version:
- **Patch (1.0.x):** Typos, clarifications, minor fixes
- **Minor (1.x.0):** New sections, examples, capabilities
- **Major (x.0.0):** Breaking changes, fundamental rewrites

### Deprecation

If skill becomes obsolete:

```markdown
---
deprecated: true
deprecatedReason: "Superseded by skill-v2"
deprecatedSince: "2024-01-15"
---

> **DEPRECATED:** This skill is deprecated. Use [skill-v2] instead.

[Original content for reference]
```

## Quality Checklist

Before publishing:

- [ ] Frontmatter is complete and valid
- [ ] Triggers are natural and specific
- [ ] Core principle is clear and prominent
- [ ] Content is structured with headers
- [ ] Examples are included
- [ ] Verification checklist exists
- [ ] Related skills are linked
- [ ] No spelling/grammar errors
- [ ] Tested with target agents
