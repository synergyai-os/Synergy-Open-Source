# Meetings Module (convex/modules/meetings)

Feature-level functions for meetings built on core domains (circles, roles, workspaces).

## Files

- `meetings.ts` — meeting CRUD, recurrence, attendance, real-time session controls.
- `templates.ts` — meeting templates and steps (create/update/list/delete/reorder/seed).
- `agendaItems.ts` — agenda item notes and status.
- `invitations.ts` — invite users or circles; enforce workspace membership.
- `presence.ts` — heartbeat-based active presence and attendance views.
- `index.ts` — barrel exports for the module.

## Dependency Rules

- Imports allowed from: `convex/core/**`, shared utilities (e.g., `sessionValidation`), Convex generated types.
- Imports NOT allowed: other modules or application layer.
- Authorization: validate session and workspace membership before reads/writes.

## API Surface

Convex will generate `api.modules.meetings.<file>.*` for each file above. Update callers to use this namespace when adding new functions.
