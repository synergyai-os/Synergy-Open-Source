# Projects Module

**Team Ownership**: Projects Team  
**Status**: 🚧 Planned  
**Feature Flag**: `projects-module` (workspace-based)

---

## Core Ideas & Principles

### Lightweight Project Management

**"We don't want to be a project management app - we integrate with tools workspaces already use."**

Projects in SynergyOS are **lightweight wrappers** around external project management tools:

- **Not a PM App**: SynergyOS doesn't build project management features
- **Integration Layer**: Projects link to external tools (Linear, Notion, Asana, Jira, etc.)
- **Bi-directional Sync**: Status and metadata sync between SynergyOS and external tools
- **Quick Access**: Direct links to projects in external tools

### Key Principles

1. **Projects Live in External Tools**
   - Real project management happens in Linear, Notion, Asana, etc.
   - SynergyOS projects are lightweight references/wrappers
   - External tools handle complexity (milestones, tasks, hierarchies)

2. **Multi-Tool Support**
   - Organizations can have multiple project/task tools configured
   - Users choose which tool to use when creating projects
   - Circles can set default project tool but allow customization

3. **Integration Required**
   - Users must set up integrations at account level
   - Only users with defined userID in external tool can be assigned
   - Integrations enable bi-directional sync

4. **Minimal Internal Functionality**
   - Projects can exist purely internally (for orgs without external tools)
   - But functionality is minimal - external tools provide real PM features
   - Internal projects are primarily for linking action items

---

## Data Entities

### Action Items

- **Core Entity**: Tasks that can exist standalone or be linked to meetings/projects
- **Always Type**: `next-step` (individual tasks, not projects)
- **Creation Contexts**:
  - Standalone: Created independently for task management
  - In Meetings: Created during meetings, linked to meeting/agenda for traceability
- **Project Linking**: Optional link to projects via `projectId`
- **Assignment**: Polymorphic (user OR role)
- **Status**: `todo`, `in-progress`, `done`
- **External Sync**: Can sync to Linear, Notion, etc. (via project or individually)
- **Workspace-scoped**: Required `workspaceId` field
- **Optional Fields**: `meetingId`, `agendaItemId`, `projectId`, `circleId`, `dueDate`

### Projects

- **Lightweight Entity**: Basic project info + external tool link
- **External Tool Link**: Primary connection to Linear, Notion, etc.
- **Auto-Creation**: Creating project in SynergyOS automatically creates in external tool
- **Sync Capability**: Can pull projects from external tools via sync button
- **Bi-directional Status**: Status syncs both ways (SynergyOS ↔ External Tool)

### Action Items → Projects Relationship

- **Optional Link**: Action items can link to projects via `projectId`
- **Standalone Support**: Action items can exist without projects
- **Link Later**: Can link action items to projects during or after creation
- **Sync Behavior**: When linked to project, syncs to external tool as task within project

---

## Technical Requirements

### Schema Design

```typescript
projects: defineTable({
  workspaceId: v.id('workspaces'),
  circleId: v.optional(v.id('circles')),

  // Basic info
  name: v.string(),
  description: v.optional(v.string()),

  // External tool link (primary)
  externalTool: v.union(
    v.literal('linear'),
    v.literal('notion'),
    v.literal('asana'),
    v.literal('jira'),
    v.literal('trello'),
    // ... other tools
  ),
  externalProjectId: v.string(), // ID in external tool

  // Sync state
  syncStatus: v.union(
    v.literal('synced'),
    v.literal('pending'),
    v.literal('error')
  ),
  lastSyncedAt: v.optional(v.number()),

  // Quick access
  externalUrl: v.optional(v.string()), // Direct link to project in external tool

  // Metadata
  createdAt: v.number(),
  createdBy: v.id('users'),
  updatedAt: v.number()
})
.index('by_organization', ['workspaceId'])
.index('by_circle', ['circleId'])
.index('by_external_tool', ['externalTool', 'externalProjectId'])

// Update meetingActionItems schema
meetingActionItems: {
  // ... existing fields ...

  // Remove: type field (always 'next-step' now)
  // Add: optional project link
  projectId: v.optional(v.id('projects')),

  // Keep: individual item sync (for when not linked to project)
  linearTicketId: v.optional(v.string()),
  notionPageId: v.optional(v.string()),

  // ... rest stays same ...
}
```

### Integration Configuration

```typescript
// Organization-level integration settings
organizationIntegrations: defineTable({
	workspaceId: v.id('workspaces'),

	// Per-tool configuration
	linear: v.optional(
		v.object({
			apiKey: v.string(), // Encrypted
			workspaceId: v.string(),
			enabled: v.boolean()
		})
	),
	notion: v.optional(
		v.object({
			apiKey: v.string(), // Encrypted
			workspaceId: v.string(),
			enabled: v.boolean()
		})
	),
	// ... other tools

	createdAt: v.number(),
	updatedAt: v.number()
});

// User-level external tool user IDs (for assignment)
userExternalToolIds: defineTable({
	userId: v.id('users'),
	workspaceId: v.id('workspaces'),

	// External tool user IDs
	linearUserId: v.optional(v.string()),
	notionUserId: v.optional(v.string()),
	asanaUserId: v.optional(v.string()),
	// ... other tools

	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_user_org', ['userId', 'workspaceId']);

// Circle-level default project tool
circleProjectDefaults: defineTable({
	circleId: v.id('circles'),
	defaultProjectTool: v.optional(
		v.union(
			v.literal('linear'),
			v.literal('notion'),
			v.literal('asana')
			// ... other tools
		)
	),
	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_circle', ['circleId']);
```

---

## Workflows

### Creating Projects

1. **User Creates Project in SynergyOS**
   - User selects external tool (or uses circle default)
   - System automatically creates project in external tool
   - SynergyOS project links to external project
   - Project appears in both systems

2. **Syncing Projects from External Tool**
   - User clicks "Sync Projects" button
   - System loads projects from external tool
   - User selects which projects to sync
   - Selected projects are imported as SynergyOS projects
   - Bi-directional sync is established

### Linking Action Items to Projects

1. **During Creation**
   - User creates action item in meeting
   - Optionally selects project to link
   - If linked to project → syncs to external tool as task within project
   - If standalone → can sync as individual ticket

2. **After Creation**
   - User can link existing action item to project
   - Linking triggers sync to external tool
   - Status sync becomes bi-directional

### Bi-directional Status Sync

- **Status Change in SynergyOS** → Syncs to external tool
- **Status Change in External Tool** → Syncs to SynergyOS
- **Sync Frequency**: Real-time via webhooks (preferred) or polling (fallback)
- **Conflict Resolution**: External tool is source of truth for project metadata

---

## Current Gaps & Missing Features

### Phase 1: Foundation (Not Started)

- [ ] **Projects Table**: Schema not yet created
- [ ] **Integration Configuration**: No integration settings tables
- [ ] **User External Tool IDs**: No mapping table for user IDs
- [ ] **Circle Defaults**: No circle-level project tool defaults
- [ ] **Action Items Update**: Remove `type` field, add `projectId` optional field

### Phase 2: External Tool Integration (Not Started)

- [ ] **Linear Integration**: API client, authentication, project CRUD
- [ ] **Notion Integration**: API client, authentication, database/page CRUD
- [ ] **Asana Integration**: API client, authentication, project CRUD
- [ ] **Jira Integration**: API client, authentication, project CRUD
- [ ] **Integration UI**: Settings page for configuring integrations

### Phase 3: Project Creation & Sync (Not Started)

- [ ] **Auto-Create Projects**: Create in external tool when creating in SynergyOS
- [ ] **Sync Button**: Load projects from external tool
- [ ] **Project Selection UI**: Select which projects to sync
- [ ] **Project Linking**: Link action items to projects

### Phase 4: Bi-directional Sync (Not Started)

- [ ] **Webhook Setup**: Register webhooks with external tools
- [ ] **Status Sync**: Sync status changes both ways
- [ ] **Metadata Sync**: Pull project metadata from external tools
- [ ] **Conflict Resolution**: Handle sync conflicts

### Phase 5: User Assignment (Not Started)

- [ ] **User ID Mapping**: Map SynergyOS users to external tool users
- [ ] **Assignment Sync**: Sync assignees between systems
- [ ] **Validation**: Only allow assignment to users with external tool IDs

---

## Integration Requirements

### Linear Integration

**API**: GraphQL API  
**Authentication**: API Key  
**Key Endpoints**:

- Create Project: `mutation { projectCreate(...) }`
- List Projects: `query { projects { nodes { ... } } }`
- Create Issue: `mutation { issueCreate(...) }`
- Update Issue: `mutation { issueUpdate(...) }`

**User ID Mapping**: Linear user IDs required for assignment

### Notion Integration

**API**: REST API  
**Authentication**: OAuth 2.0 / Integration Token  
**Key Endpoints**:

- Create Page: `POST /v1/pages`
- Query Database: `POST /v1/databases/{database_id}/query`
- Update Page: `PATCH /v1/pages/{page_id}`

**User ID Mapping**: Notion user IDs required for assignment  
**Permissions**: Integration must be granted access to pages/databases

### Asana Integration

**API**: REST API  
**Authentication**: OAuth 2.0  
**Key Endpoints**:

- Create Project: `POST /projects`
- List Projects: `GET /projects`
- Create Task: `POST /tasks`
- Update Task: `PUT /tasks/{task_gid}`

**User ID Mapping**: Asana user IDs (GIDs) required for assignment

---

## Dependencies

### Required Modules

- **Core Module**: Organization context, user management
- **Meetings Module**: Action items that link to projects
- **Org Chart Module**: Circle defaults for project tools

### External Dependencies

- **Linear API**: GraphQL API client
- **Notion API**: REST API client
- **Asana API**: REST API client
- **Jira API**: REST API client (future)

---

## Success Metrics

### Phase 1 (Foundation)

- ✅ Projects can be created and linked to external tools
- ✅ Action items can link to projects
- ✅ Integration settings can be configured

### Phase 2 (Integration)

- ✅ Projects auto-create in external tools
- ✅ Projects can be synced from external tools
- ✅ Integration UI is intuitive and functional

### Phase 3 (Sync)

- ✅ Status syncs bi-directionally
- ✅ Sync completes in <2 seconds
- ✅ No data loss during sync

### Phase 4 (User Assignment)

- ✅ Users can be assigned from external tool user list
- ✅ Assignment syncs correctly
- ✅ Only valid users (with external IDs) can be assigned

---

## Related Documentation

- [Meetings Module - Action Items](../meetings/docs/essentials.md#action-items)
- [Core Module - Integrations](../core/README.md)
- [External Tool Integration Patterns](../../../../dev-docs/2-areas/patterns/external-integrations.md) (to be created)

---

## Implementation Notes

### Why Lightweight?

Projects are lightweight because:

1. **Not a PM App**: SynergyOS focuses on meetings and collaboration, not project management
2. **External Tools Are Better**: Linear, Notion, etc. have mature PM features
3. **Avoid Duplication**: Don't rebuild what external tools already do well
4. **Integration Focus**: Focus on seamless integration, not feature parity

### Multi-Tool Support

Organizations can use multiple tools because:

1. **Different Teams**: Different teams may prefer different tools
2. **Tool Specialization**: Some tools are better for specific use cases
3. **Migration**: Teams may be migrating between tools
4. **Flexibility**: Organizations should choose their own tools

### Circle Defaults

Circles can set defaults because:

1. **Team Preferences**: Different circles may prefer different tools
2. **Workflow Consistency**: Defaults reduce decision fatigue
3. **Flexibility**: Users can override defaults when needed
4. **Onboarding**: New members inherit circle defaults
