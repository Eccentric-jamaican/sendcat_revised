---
trigger: model_decision
description: Guidelines for managing CRUD operations for [planned feature].md files
---

# CRUD [planned feature].md MANAGEMENT

### A comprehensive “plan mode” spec with required `[planned-feature].md` CRUD

## Core idea
When the user invokes **plan mode**, the assistant must maintain a single source of truth: **`[planned-feature].md`** with the /plans/ directory. The chat response is a summary; the file is the authoritative plan and gets updated as understanding evolves.

## `[planned-feature].md` goals
- **Traceability**: why a decision was made, what assumptions existed, what changed.
- **Executability**: steps are actionable and ordered, with acceptance criteria.
- **Safety**: constraints, risks, rollback, and validation are explicit.
- **Incremental**: plan evolves without losing history.

---

## Canonical `[planned-feature].md` structure (recommended)
Use a stable schema so updates are predictable and diff-friendly:

# Plan: <short title>

## 0. Metadata
- Status: draft | approved | in_progress | blocked | done | superseded
- Owner: <user/agent>
- Created: <date>
- Last updated: <date>
- Related: <tickets/PRs/links>

## 1. Goal
One crisp sentence describing the desired outcome.

## 2. Non-goals (out of scope)
- ...

## 3. Requirements
### Functional
- ...

### Non-functional
- Performance:
- Security/Privacy:
- Reliability:
- Compatibility:

## 4. Assumptions & Open Questions
### Assumptions
- ...

### Open questions (blocking vs non-blocking)
- [BLOCKER] ...
- [NON-BLOCKER] ...

## 5. Proposed Approach
### Architecture / design sketch
- ...

### Interfaces & contracts
- APIs:
- DB schema:
- Events/queues:
- Errors:

## 6. Work Breakdown (ordered)
1. ...
2. ...
3. ...

## 7. Testing & Validation
- Unit:
- Integration:
- E2E:
- Manual QA checklist:
- Success metrics:

## 8. Rollout / Migration / Rollback
- Migrations/backfills:
- Feature flags:
- Monitoring/alerts:
- Rollback steps:

## 9. Risks & Mitigations
- Risk:
- Mitigation:

## 10. Change Log
- <date>: Created plan
- <date>: Updated: <what changed and why>
```

---

## CRUD requirements for `plan.md` in “plan mode”

### Create (`[planned-feature].md`)
**When to create**
- Immediately when entering Ask mode or when the user explicitly requests a plan or when the user wants a major feature added (or on first plan-mode response).
- Even if information is incomplete: create with assumptions + open questions.

**Create rules**
- Set **Status: draft**
- Populate: Goal, initial requirements, assumptions/questions, initial approach, rough breakdown.
- Add first entry to **Change Log**.

---

### Read (use `[planned-feature].md` as the source of truth)
**Read rules**
- Every plan-mode response should be derived from the current `planned-feature.md`.
- If there’s a mismatch between chat discussion and file, **update the file** (don’t keep “hidden plan state” only in chat).
- If the user asks “what are we doing next?”, answer from **Work Breakdown** + **Status**.

---

### Update (edit `[planned-feature].md`)
**When to update**
- New requirements or constraints appear.
- An assumption becomes confirmed/false.
- The chosen approach changes.
- A risk is discovered.
- Steps are completed (status/progress updates).
- The user approves the plan (Status: approved).

**Update rules**
- Prefer **small, surgical edits**: avoid rewriting everything unless necessary.
- Keep sections stable; update content inside them.
- Always update:
  - **Last updated**
  - **Change Log** (what/why)
- Promote status carefully:
  - `draft` → `approved` when user signs off
  - `approved` → `in_progress` when implementation starts
  - `in_progress` → `blocked` if a blocker arises
  - `in_progress` → `done` when acceptance criteria pass

**Conflict handling**
- If user changes direction: update **Goal**, move previous approach to a short “superseded notes” section or record in Change Log.
- If there are blockers: mark them explicitly under **Open Questions** with `[BLOCKER]`.

---

### Delete (or Archive) `[planned-feature].md`
In practice, **deleting is usually the wrong default** because plans are useful audit/history. Prefer **archive/supersede**.

**Recommended policy**
- If work completes: keep `[planned-feature].md`, set **Status: done**.
- If plan becomes obsolete: set **Status: superseded**, and optionally move it to `plans/<timestamp>-<title>.md`.
- Only delete if:
  - User explicitly requests deletion, or
  - The repo policy forbids keeping plans.

---

## “Plan mode” behavioral rules (how planning happens step-by-step)

- **Start from outcomes**: define Goal + acceptance criteria first.
- **Lock constraints early**: security, performance, compatibility, deadlines.
- **Minimize questions**: ask only blockers; otherwise proceed with stated assumptions.
- **Design before tasks**: clarify contracts (API/DB/events/errors) so tasks aren’t vague.
- **Make it shippable**: break into milestones that can land incrementally.
- **Bake in validation**: every milestone has a verification method.
- **Include rollback**: every risky change has a reversal story.
- **Keep plan current**: the plan is living documentation, not a one-time artifact.

# Final
- You must always ask the user if the plan aligns with the goal they have in mind and ask the user to proceed with the plan.
- Once the user confirms, you can proceed with the implementation.
- If the user wants to make changes after confirmation, you should go back to the planning phase to update the plan accordingly.
- Always communicate the current status and next steps clearly to the user.
- Maintain a clear audit trail of all decisions and changes made during the planning and implementation process.
- You must always revert back to the plan. You must always do a constant back-and-forth with the plan once it is created to check its status and to check what needs to be changed.


---

### Important note about this chat
You’re currently in **Ask mode**, so I can’t actually create/update a real `plan.md` file in your workspace from here. If you want, tell me your repo conventions (where plans live, naming, approval flow), and I can:
- generate a ready-to-paste `plan.md` template tailored to your project, or
- if you switch to Agent mode, I can create/manage the file directly.