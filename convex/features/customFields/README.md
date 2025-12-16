# Custom Fields Feature

**Purpose**: Extensible custom field system for adding metadata to any entity type.

**Status**: New (SYOS-790)

---

## Overview

Custom fields allow workspaces to extend entities (circles, roles, people, tasks, etc.) with additional structured data. This replaces the legacy `circleItems` system with a more flexible, entity-agnostic approach.

### Key Concepts

| Concept          | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| **Definition**   | Schema for a custom field (name, type, validation rules)                  |
| **Value**        | Actual data stored for a specific entity                                  |
| **System Field** | Pre-defined field (e.g., "Purpose") that exists on all entities of a type |
| **User Field**   | Custom field created by workspace users                                   |

### System Fields vs User Fields

**System Fields** (e.g., "Purpose", "Accountabilities"):

- Pre-seeded when workspace is created
- Cannot be deleted, only archived
- `isSystemField=true`, has `systemKey`
- Name can be customized per workspace
- Ensures consistent data structure across workspaces

**User Fields**:

- Created by workspace users
- Can be deleted (archived)
- `isSystemField=false`, no `systemKey`
- Fully customizable

---

## Tables

### customFieldDefinitions

Defines the schema for custom fields in a workspace.

| Column               | Type               | Purpose                                |
| -------------------- | ------------------ | -------------------------------------- |
| `workspaceId`        | `Id<'workspaces'>` | Workspace scoping                      |
| `entityType`         | union              | Which entity type this applies to      |
| `name`               | string             | Display name                           |
| `description`        | string?            | Help text for UI                       |
| `order`              | number             | Display order                          |
| `systemKey`          | string?            | Internal key for system fields         |
| `isSystemField`      | boolean            | True for pre-defined fields            |
| `isRequired`         | boolean            | Validation: must have value            |
| `fieldType`          | union              | Data type (text, number, select, etc.) |
| `options`            | string[]?          | For select/multiSelect types           |
| `searchable`         | boolean            | Include in full-text search            |
| `aiIndexed`          | boolean            | Include in AI context                  |
| `createdByPersonId`  | `Id<'people'>`     | Audit: who created                     |
| `updatedByPersonId`  | `Id<'people'>?`    | Audit: who last updated                |
| `archivedByPersonId` | `Id<'people'>?`    | Audit: who archived (soft delete)      |

**Indexes**:

- `by_workspace` — All definitions for workspace
- `by_workspace_entity` — Definitions for specific entity type
- `by_workspace_system_key` — Lookup system fields by key
- `by_searchable` — Find searchable definitions
- `by_ai_indexed` — Find AI-indexed definitions

### customFieldValues

Stores actual values for custom fields on entities.

| Column              | Type                           | Purpose                           |
| ------------------- | ------------------------------ | --------------------------------- |
| `workspaceId`       | `Id<'workspaces'>`             | Workspace scoping (denormalized)  |
| `definitionId`      | `Id<'customFieldDefinitions'>` | Links to definition               |
| `entityType`        | union                          | Target entity type (denormalized) |
| `entityId`          | string                         | ID of target entity               |
| `value`             | string                         | JSON-encoded value                |
| `searchText`        | string?                        | Extracted text for search         |
| `createdByPersonId` | `Id<'people'>`                 | Audit: who created                |
| `updatedByPersonId` | `Id<'people'>?`                | Audit: who last updated           |

**Indexes**:

- `by_entity` — All values for a specific entity
- `by_definition_entity` — Get specific value
- `by_workspace` — Workspace-wide queries
- `by_workspace_entity` — Filter by entity type
- `by_definition` — All values for a definition

---

## Entity Types

| Type        | Description                 | Example Use Case             |
| ----------- | --------------------------- | ---------------------------- |
| `circle`    | Organizational unit         | Purpose, Strategy, Domains   |
| `role`      | Authority distribution unit | Accountabilities, Domains    |
| `person`    | Workspace member            | Skills, Interests, Location  |
| `inboxItem` | Inbox/reading item          | Custom tags, Notes           |
| `task`      | Task/todo item              | Priority, Custom status      |
| `project`   | Project                     | Budget, Timeline, Risk level |
| `meeting`   | Meeting                     | Meeting type, Location       |

---

## Field Types

| Type          | Value Format    | UI Component                |
| ------------- | --------------- | --------------------------- |
| `text`        | string          | Single-line input           |
| `longText`    | string          | Textarea/rich text          |
| `number`      | number          | Number input                |
| `boolean`     | boolean         | Toggle/checkbox             |
| `date`        | ISO 8601 string | Date picker                 |
| `select`      | string          | Dropdown (single)           |
| `multiSelect` | string[]        | Multi-select                |
| `url`         | string          | URL input with validation   |
| `email`       | string          | Email input with validation |

---

## Common Queries

### Get all custom field definitions for an entity type

```typescript
const definitions = await ctx.db
	.query('customFieldDefinitions')
	.withIndex('by_workspace_entity', (q) =>
		q.eq('workspaceId', workspaceId).eq('entityType', 'circle')
	)
	.filter((q) => q.eq(q.field('archivedAt'), undefined))
	.collect();
```

### Get all values for an entity

```typescript
const values = await ctx.db
	.query('customFieldValues')
	.withIndex('by_entity', (q) => q.eq('entityType', 'circle').eq('entityId', circleId))
	.collect();
```

### Get specific field value

```typescript
const value = await ctx.db
	.query('customFieldValues')
	.withIndex('by_definition_entity', (q) =>
		q.eq('definitionId', definitionId).eq('entityId', entityId)
	)
	.first();
```

---

## Architecture Compliance

| Rule                         | Status | Notes                                  |
| ---------------------------- | ------ | -------------------------------------- |
| Uses `personId` not `userId` | ✅     | XDOM-01 compliant                      |
| Soft delete via `archivedAt` | ✅     | DR-008 compliant                       |
| Tables in `tables.ts`        | ✅     | Architecture pattern                   |
| Types in `schema.ts`         | ✅     | Architecture pattern                   |
| Feature layer (not core)     | ✅     | Workspace customization, not org truth |

---

## Migration from circleItems

| Old (circleItems)                | New (customFields)            |
| -------------------------------- | ----------------------------- |
| `circleItemCategories`           | `customFieldDefinitions`      |
| `circleItems`                    | `customFieldValues`           |
| `createdBy: userId`              | `createdByPersonId: personId` |
| `entityType: 'circle' \| 'role'` | Expanded to 7 entity types    |
| No system field concept          | `isSystemField`, `systemKey`  |
| No AI/search optimization        | `searchable`, `aiIndexed`     |

See SYOS-846 for data migration script.

---

## Files

| File           | Purpose                             |
| -------------- | ----------------------------------- |
| `tables.ts`    | Table definitions for Convex schema |
| `schema.ts`    | TypeScript types and aliases        |
| `README.md`    | This documentation                  |
| `queries.ts`   | Read operations (SYOS-845)          |
| `mutations.ts` | Write operations (SYOS-845)         |
| `rules.ts`     | Business rules (SYOS-845)           |
| `index.ts`     | Public exports (SYOS-845)           |

---

## Related Tickets

- **SYOS-790**: Parent ticket for full migration
- **SYOS-844**: This ticket (create structure)
- **SYOS-845**: Implement queries, mutations, rules
- **SYOS-846**: Data migration script
- **SYOS-847**: Fix audit fields (userId → personId)
- **SYOS-848**: Update imports, delete old circleItems
- **SYOS-849**: Final validation
