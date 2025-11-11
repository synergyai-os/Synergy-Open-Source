# Data Models

> 🚧 **Coming Soon** - Schema documentation for engineers and product managers

---

## What Will Be Here

This section will document the database schema:

- **Schema Overview** - High-level entity relationships
- **Entity Details** - Field descriptions, types, validation rules
- **Relationships** - How entities connect (1:1, 1:many, many:many)
- **Queries** - Common query patterns
- **Migrations** - Schema evolution history

---

## Planned Documentation

### Core Entities

#### **Users & Auth**

- `users` - User accounts, profiles, preferences
- `sessions` - Authentication sessions
- `organizations` - Multi-tenancy support (future)
- `teams` - Team membership within orgs (future)

#### **Product Discovery**

- `opportunities` - Opportunity tree nodes
- `research` - User research interviews, observations
- `insights` - Tagged insights from research
- `hypotheses` - Testable assumptions
- `experiments` - A/B tests, prototypes

#### **Product Delivery**

- `objectives` - OKRs (objectives & key results)
- `keyResults` - Measurable outcomes
- `roadmapItems` - Features, initiatives, milestones
- `dependencies` - Inter-feature relationships

#### **Team Collaboration**

- `meetings` - Stand-ups, retros, planning sessions
- `actionItems` - Tasks from meetings
- `decisions` - Documented decision log with rationale
- `statusUpdates` - Automated + manual progress updates

#### **Knowledge Management**

- `glossaryTerms` - Team vocabulary, definitions
- `documents` - Docs, specs, templates
- `tags` - Taxonomy for categorization
- `comments` - Discussion threads

#### **AI & Automation**

- `aiContext` - Company-specific training data
- `workflows` - Custom automation rules
- `integrations` - External tool connections (Jira, Notion, etc.)

---

## Documentation Format

Each entity follows this structure:

````markdown
# EntityName

> One-sentence description

## Schema

| Field  | Type        | Required | Default | Description |
| ------ | ----------- | -------- | ------- | ----------- |
| \_id   | Id<"table"> | ✅       | auto    | Convex ID   |
| userId | Id<"users"> | ✅       | -       | Owner       |
| ...    | ...         | ...      | ...     | ...         |

## Relationships

- **Belongs to**: User (via `userId`)
- **Has many**: ChildEntity (via `parentId`)

## Discriminated Unions (if applicable)

```typescript
type InboxItem =
	| {
			type: 'readwise_highlight';
			// ...
	  }
	| {
			type: 'manual_note';
			// ...
	  };
```
````

## Validation Rules

- `title`: 1-200 characters
- `status`: enum ["draft", "active", "archived"]
- `dueDate`: optional, must be future date

## Common Queries

```typescript
// Get all active items for user
ctx.db
	.query('table')
	.withIndex('by_user_status', (q) => q.eq('userId', userId).eq('status', 'active'))
	.collect();
```

## Indexes

- `by_user` - userId
- `by_user_status` - userId + status
- `by_createdAt` - createdAt (desc)

## Migrations

### v2 (2025-02-01)

- Added `tags` field (string[])
- Migrated existing items

### v1 (2025-01-01)

- Initial schema

```

---

## Why This Matters

**For Engineers:**
- Understand data structure quickly
- Write efficient queries
- Avoid schema violations
- Plan migrations safely

**For Product Managers:**
- Understand system capabilities
- Know what data is available for features
- Make informed decisions about scope

**For Designers:**
- Understand constraints (field types, validation)
- Design realistic features
- Avoid impossible interactions

---

## Current State vs. Future

### ✅ Current Schema (Flashcard App)
- `users` - User accounts
- `inboxItems` - Readwise highlights, notes (discriminated union)
- `flashcards` - Generated study cards
- `tags` - Categorization
- `syncStatus` - Readwise sync state

### 🔄 Evolving Schema (Product OS)
- `organizations` - Multi-tenancy (already stubbed)
- `teams` - Team membership (already stubbed)
- `objectives` - OKRs (to be added)
- `opportunities` - Discovery tree (to be added)
- `meetings` - Collaboration (to be added)
- `glossaryTerms` - Knowledge (to be added)

**See**: [Multi-Tenancy Migration](../multi-tenancy-migration.md) for org/team details

---

## Schema Evolution Strategy

### Phase 1: Foundation (Current)
- Core user model
- Universal inbox pattern
- Discriminated unions for flexibility

### Phase 2: Multi-Tenancy (Next)
- Organizations & teams
- Permission system
- Data isolation

### Phase 3: Product OS Features
- Discovery entities (opportunities, research)
- Delivery entities (OKRs, roadmaps)
- Collaboration entities (meetings, decisions)
- Knowledge entities (glossaries, docs)

### Phase 4: Marketplace
- Builder apps
- Custom workflows
- Integration configs

---

## Tools & References

- **Schema Location**: `/convex/schema.ts`
- **Type Generation**: Convex auto-generates TypeScript types
- **Migrations**: Convex migrations are code-based (no SQL)
- **Documentation**: [Convex Schema Docs](https://docs.convex.dev/database/schemas)

---

## Related

- **[Architecture](../architecture.md)** - Tech stack overview
- **[Convex Patterns](../patterns/convex-integration.md)** - Query/mutation patterns
- **[Multi-Tenancy](../multi-tenancy-migration.md)** - Org/team architecture
- **[Validation](../../VALIDATION-PRODUCT-TRIO.md)** - Why this is needed

---

**Next Steps**:
1. Generate schema docs from `/convex/schema.ts`
2. Document current entities (users, inboxItems, flashcards)
3. Add relationship diagrams (Mermaid)
4. Document future entities (OKRs, opportunities, etc.)

**Estimated**: 0.5 day for current schema + future planning


```
