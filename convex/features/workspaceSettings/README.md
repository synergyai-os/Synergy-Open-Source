# Workspace Settings Feature

**Location:** `convex/features/workspaceSettings/`

**Purpose:** Manages workspace-level settings including Claude API key and org chart configuration.

---

## Tables

| Table                  | Purpose                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `workspaceSettings`    | Stores workspace settings (Claude API key, etc.)                                                |
| `workspaceOrgSettings` | Stores org chart settings (allowQuickChanges, leadRequirementByCircleType, coreRoleTemplateIds) |

## Key Functions

| Function                         | Purpose                                                                    |
| -------------------------------- | -------------------------------------------------------------------------- |
| `getOrganizationSettings`        | Gets workspace settings with encrypted key flags (hasClaudeKey)            |
| `updateOrganizationClaudeApiKey` | Validates and saves Claude API key (admin only, validates via HTTP)        |
| `deleteOrganizationClaudeApiKey` | Removes Claude API key from workspace settings                             |
| `getOrgSettings`                 | Gets org chart settings (lead requirements, quick changes, role templates) |
| `updateOrgSettings`              | Updates org chart settings (admin only)                                    |

## Dependencies

- Depends on: `core/workspaces` (workspace access), `core/people` (workspace membership and roles)
- Used by: Frontend workspace settings pages

## Status

**Active** — Workspace settings management with API key validation and org chart configuration.
