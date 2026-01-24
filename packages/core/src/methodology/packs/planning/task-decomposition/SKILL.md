---
name: Task Decomposition
description: Break down complex tasks into small, manageable, atomic units
version: 1.0.0
triggers:
  - break down
  - decompose
  - split into tasks
  - too big
  - where to start
  - complex task
tags:
  - planning
  - decomposition
  - tasks
  - organization
difficulty: beginner
estimatedTime: 10
relatedSkills:
  - planning/design-first
  - planning/verification-gates
---

# Task Decomposition

You are breaking down a complex task into smaller, atomic units. Each unit should be independently completable and verifiable.

## Core Principle

**If a task feels too big, it is too big. Break it down until each piece is obvious.**

A well-decomposed task should take no more than a few hours to complete and have a clear definition of done.

## What Makes a Good Atomic Task

A properly decomposed task is:

- **Small** - Completable in one focused session
- **Independent** - Can be done without blocking on other tasks
- **Testable** - Has clear success criteria
- **Valuable** - Delivers some increment of value
- **Estimatable** - Scope is clear enough to estimate

**Task Size Targets:**
- Ideal: 1-2 hours of focused work
- Maximum: Half a day
- If larger: Break it down further

## Decomposition Techniques

### 1. Vertical Slicing

Break by user-visible functionality:

```
Feature: User Registration

Slice 1: Email/password signup
- Form renders with email and password fields
- Validation shows errors for invalid input
- Success creates account and shows confirmation

Slice 2: Email verification
- Sends verification email on signup
- Clicking link verifies email
- Shows different UI for unverified accounts

Slice 3: Social login (OAuth)
- "Sign in with Google" button
- OAuth flow completes
- Account linked to Google ID
```

Each slice is deployable and testable independently.

### 2. Horizontal Layering

Break by system layer:

```
Feature: Order Processing

Layer 1: Data Model
- Create Order entity
- Create OrderItem entity
- Add database migrations

Layer 2: Repository/Data Access
- Create OrderRepository
- Implement CRUD operations
- Add query methods

Layer 3: Business Logic
- Create OrderService
- Implement order creation flow
- Add validation rules

Layer 4: API Endpoints
- Create POST /orders endpoint
- Create GET /orders/:id endpoint
- Add error handling

Layer 5: Frontend Integration
- Create order form component
- Add API client methods
- Handle loading and error states
```

### 3. Workflow Decomposition

Break by process steps:

```
Task: Implement checkout flow

Step 1: Cart validation
- Verify items are in stock
- Validate quantities
- Calculate totals

Step 2: Payment processing
- Collect payment details
- Validate payment method
- Process transaction

Step 3: Order creation
- Create order record
- Associate with payment
- Update inventory

Step 4: Confirmation
- Send confirmation email
- Display success page
- Generate invoice
```

### 4. Component Decomposition

Break by UI or system component:

```
Task: Build dashboard page

Component 1: Header section
- Logo and navigation
- User menu dropdown

Component 2: Stats cards row
- Revenue card
- Orders card
- Customers card

Component 3: Chart section
- Sales trend chart
- Data fetching and transformation

Component 4: Recent orders table
- Table with sorting
- Pagination
- Row actions
```

## Task Template

For each decomposed task, define:

```markdown
## Task: [Brief Title]

**Description:**
[What needs to be done in 1-2 sentences]

**Files to Create/Modify:**
- [ ] path/to/file1.ts
- [ ] path/to/file2.ts

**Steps:**
1. [First specific step]
2. [Second specific step]
3. [Third specific step]

**Done When:**
- [ ] [Success criterion 1]
- [ ] [Success criterion 2]
- [ ] Tests pass

**Dependencies:**
- Requires: [Other task if any]
- Blocks: [What this enables]
```

## Dependency Management

### Identify Dependencies

```
Task Graph:

[Data Model] ──┬──▶ [Repository]
               │
               └──▶ [API Types]
                        │
[Repository] ──────────▶ [Service]
                              │
[API Types] ──────────────────┤
                              ▼
                         [API Endpoints]
```

### Minimize Dependencies

- Prefer tasks that can run in parallel
- Use interfaces to decouple dependencies
- Start with foundational tasks first

### Order by Dependencies

```
Phase 1 (No dependencies):
- Task A: Data model
- Task B: API type definitions
- Task C: UI component skeletons

Phase 2 (Depends on Phase 1):
- Task D: Repository (needs A)
- Task E: API client (needs B)
- Task F: UI logic (needs C)

Phase 3 (Depends on Phase 2):
- Task G: Service (needs D)
- Task H: Connected UI (needs E, F)
```

## Decomposition Checklist

For each task, verify:

- [ ] **Atomic?** - Can be done without interruption
- [ ] **Clear?** - Scope is unambiguous
- [ ] **Testable?** - Know when it's done
- [ ] **Independent?** - Minimal dependencies
- [ ] **Small?** - Less than half a day

## Signs of Poor Decomposition

- "This task keeps growing"
- "I'm not sure where to start"
- "It depends on too many things"
- "I can't test it yet"
- "This is taking longer than expected"

When you see these signs, stop and re-decompose.

## Example: Full Decomposition

```markdown
# Feature: Password Reset

## Epic Overview
Users can reset their forgotten password via email link.

---

## Task 1: Password Reset Request API

**Description:** Create endpoint to request password reset.

**Files:**
- [ ] src/api/auth/reset-request.ts
- [ ] src/services/email/templates/reset.html

**Steps:**
1. Create POST /auth/reset-password endpoint
2. Validate email exists in database
3. Generate secure reset token
4. Store token with expiry (1 hour)
5. Send email with reset link

**Done When:**
- [ ] Endpoint returns 200 for valid email
- [ ] Endpoint returns 200 for invalid email (no leak)
- [ ] Email sent with valid token
- [ ] Token stored in database

---

## Task 2: Password Reset Form UI

**Description:** Create form for entering new password.

**Files:**
- [ ] src/pages/reset-password.tsx
- [ ] src/components/PasswordResetForm.tsx

**Steps:**
1. Create page component at /reset-password?token=X
2. Build form with password and confirm fields
3. Add password strength validation
4. Show loading state during submission

**Done When:**
- [ ] Form renders with token in URL
- [ ] Validation shows for weak passwords
- [ ] Form submits to API

---

## Task 3: Password Reset Complete API

**Description:** Create endpoint to set new password.

**Files:**
- [ ] src/api/auth/reset-complete.ts

**Steps:**
1. Create POST /auth/reset-password/complete endpoint
2. Validate token is valid and not expired
3. Hash new password
4. Update user record
5. Invalidate token
6. Return success

**Done When:**
- [ ] Valid token + new password updates user
- [ ] Expired token returns error
- [ ] Invalid token returns error
- [ ] Token cannot be reused
```

## Integration with Other Skills

- Use **design-first** to understand the full scope before decomposing
- Use **verification-gates** to define checkpoints between phases
- Use **testing/red-green-refactor** to implement each task
