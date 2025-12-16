# Workspace Branding Feature

**Location:** `convex/features/workspaceBranding/`

**Purpose:** Handles workspace-level branding customization (colors, logo) for visual workspace identity.

---

## Tables

| Table        | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| `workspaces` | Patches `branding` field with primaryColor, secondaryColor, and logo |

## Key Functions

| Function            | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| `updateBranding`    | Updates workspace branding colors and logo (admin/owner only) |
| `findBranding`      | Gets branding settings for a workspace                        |
| `getAllOrgBranding` | Gets branding for all workspaces the user belongs to          |

## Dependencies

- Depends on: `core/workspaces` (workspace access), `core/people` (workspace membership)
- Used by: Frontend workspace settings UI

## Status

**Active** — Workspace branding management with OKLCH color format validation.
