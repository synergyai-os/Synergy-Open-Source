# Architecture Decision Records and History

**Purpose**: Archive of architectural decisions and historical version changes from `architecture.md`.

**Last Updated**: 2026-01-05

---

## Decision Records

### DR-001: Convex as Backend
**Status**: Accepted  
**Decision**: Use Convex instead of traditional REST API + database.
**Rationale**: Real-time sync eliminates manual state management.

### DR-002: Svelte 5 for Frontend
**Status**: Accepted  
**Decision**: Use Svelte 5 with runes system.
**Rationale**: Excellent reactivity, natural fit with Convex.

### DR-003: Functions Only, No Classes
**Status**: Accepted  
**Decision**: Zero classes in codebase — pure functions only.
**Rationale**: Functions compose better, easier to test.

### DR-004: Three-Layer Architecture
**Status**: Accepted  
**Decision**: Organize code into Core/Features/Infrastructure layers.
**Rationale**: Clear dependencies, enables independent evolution.

### DR-005: Domain Cohesion over Technical Purity
**Status**: Accepted  
**Decision**: Organize by domain, not by technical concern.
**Rationale**: "Working on circles" means one directory.

### DR-006: Separate users and people Domains
**Status**: Accepted  
**Decision**: Two distinct domains for auth vs workspace identity.
**Rationale**: Security isolation, prevents cross-workspace correlation.

### DR-007: Authority Calculated, Not Stored
**Status**: Accepted  
**Decision**: Authority is computed from roles, not stored.
**Rationale**: Single source of truth, no sync bugs.

### DR-008: Soft Delete via archivedAt
**Status**: Accepted  
**Decision**: Use `archivedAt` timestamp, not status field or hard delete.
**Rationale**: Preserves history, enables audit trails.

### DR-009: Feature Code Naming Convention
**Status**: Accepted  
**Date**: 2025-12-13  
**Decision**: Backend uses `convex/features/`, frontend uses `src/lib/modules/`.
**Rationale**: Frontend "modules" reflects module system (registry, manifests). Backend "features" follows architecture layer naming. Different names for different systems is intentional.

### DR-010: Two-Scope RBAC Model
**Status**: Accepted  
**Date**: 2025-12-13  
**Decision**: RBAC split into `systemRoles` (userId) and `workspaceRoles` (personId).
**Rationale**: Same user can have different workspace roles. Platform access is independent of workspace. Workspace isolation via personId.

### DR-011: Governance Fields in Core Schema
**Status**: Accepted  
**Date**: 2026-01-05  
**Decision**: `purpose` and `decisionRights` are stored directly on core tables (`circles`, `circleRoles`), not in `customFieldValues`.
**Rationale**: 
1. **Invariant enforcement** — GOV-02 (purpose required) and GOV-03 (decision rights required) are critical invariants. Schema-level storage enables structural enforcement.
2. **Domain integrity** — Purpose and decision rights are governance vocabulary, not workspace customization. They're part of organizational truth (FROZEN domains).
3. **Query simplicity** — No joins required for fundamental governance data.
4. **Clear boundaries** — Custom fields are for extensibility (what each org tracks). Governance fields are foundational (what every org must have).

**Supersedes**: SYOS-960, SYOS-961 (which moved these to customFieldValues). This decision reverses that migration.

---

## Archived Version History

Historical changes prior to version 4.0. For recent changes, see `architecture.md`.

| Version | Date | Changes |
|---------|------|---------|
| 3.9 | 2025-01-XX | Error handling improvements. Updated: Error Codes section to document structured error format (`SYNERGYOS_ERROR|CODE|USER_MESSAGE|TECHNICAL_DETAILS`), `createError()` function usage, auto-logging, and serialization-safe design. Follows Principle #11 (functions only, no classes). See `dev-docs/2-areas/patterns/error-handling-improvements.md` for details. |
| 3.8 | 2025-12-15 | Constants pattern documentation. Added: `constants.ts` as OPTIONAL file in domain structure, tables.ts vs schema.ts vs constants.ts comparison, Frontend/Backend Constant Sync section. Updated: Domain File Structure to include constants.ts, schema.ts examples to show re-export pattern from constants.ts. Rationale: Separation of runtime constants (for iteration/validation) vs compile-time types. |
| 3.7 | 2025-12-15 | Governance Foundation implementation. Added: Governance Foundation section (workspace lifecycle, role auto-creation, governance invariants GOV-01 through GOV-08, schema changes for circleRoles/roleTemplates/workspaces). Updated: Core Invariants summary (83 total, 62 critical), Document Selection table (added governance-design.md). Cross-referenced governance-design.md throughout. Implementation: SYOS-884, SYOS-885, SYOS-886, SYOS-887, SYOS-888, SYOS-895. |
| 3.6 | 2025-12-14 | Added Guest Access Model section documenting guest identity model, access mechanisms, security model, and `resourceGuests` table schema. Updated RBAC Permission Infrastructure table to mark `resourceGuests` as "Schema ready". Implementation: SYOS-868, SYOS-874, SYOS-875, SYOS-876. |
| 3.5 | 2025-12-13 | Architecture gap resolution. Added: Frontend/Backend relationship section, Legacy Compatibility Layers, Analytics vs Domain Events, Feature Flags section, RBAC Permission Infrastructure, RoleTemplates→RBAC Bridge, Composed Access Helpers, DR-009 and DR-010. Updated: Dependency rules (infrastructure can import infrastructure), Directory structure (removed events/, added access/, featureFlags/), RBAC section (sourceCircleRoleId, permission helpers), Document Selection table, Known Tech Debt. |
| 3.4 | 2025-12-13 | Fixed cross-references, added SYOS-791 to active migrations, added implementation note to RBAC helpers. |
| 3.3 | 2025-12-13 | Added Trade-off Guidance (Even-Over Statements) section clarifying priority when principles conflict. Updated Principle #32 from hard rule to guideline with clarification. Added "The 300-Line Guideline (Clarified)" section with when to split/not split guidance and anti-pattern documentation. |
| 3.2 | 2025-12-13 | Added RBAC Scope Model subsection documenting two-scope model (systemRoles vs workspaceRoles) with table definitions and helper function signatures. |
| 3.1 | 2025-12-13 | Post-781 confidence check (SYOS-850). Marked circleItems→customFields migration DONE. Added Completed Migrations table. Added Known Tech Debt section with invariant status and validation results. Updated features list. |
| 3.0 | 2025-12-12 | Complete rewrite. Single source of truth. Consolidated from architecture.md + synergyos-core-architecture.md. Added: explicit file patterns (tables.ts vs schema.ts), legacy migration status, soft delete pattern, identity helpers table, users vs people clarification. |
| 2.3 | 2025-12-11 | Added FROZEN/STABLE classification, Identity Chain section, Core Invariants reference. |
| 2.2 | 2025-12-09 | Documented Convex public auth pattern, target ID whitelist. |
| 2.0 | 2025-12-06 | Domain cohesion model. AI-native optimization. |

---

*This file contains archived architectural decisions and historical changes. For current architecture, see `architecture.md`.*

