# Workspaces Feature

**Location:** `convex/features/workspaces/`

**Purpose:** Thin wrapper providing backward compatibility for workspace member operations.

---

## Tables

| Table | Purpose                                   |
| ----- | ----------------------------------------- |
| N/A   | Re-exports from `core/workspaces/members` |

## Key Functions

| Function                   | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `removeOrganizationMember` | Removes a member from workspace (re-exported from core) |
| `listMembers`              | Lists workspace members (re-exported from core)         |

## Dependencies

- Depends on: `core/workspaces` (actual implementation)
- Used by: Frontend modules expecting `features/workspaces` namespace

## Status

**Scaffolded** — Backward compatibility wrapper. Implementation lives in `core/workspaces/members`.
