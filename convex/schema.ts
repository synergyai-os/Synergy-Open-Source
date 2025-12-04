import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// TEMPORARY: Disable schema validation during ID migration
// Convex IDs encode table names, so old Workspace IDs need to be converted to workspace IDs
const schema = defineSchema(
	{
		// Ephemeral login state for WorkOS PKCE + state flow
		authLoginState: defineTable({
			stateHash: v.string(),
			codeVerifierCiphertext: v.string(),
			redirectTo: v.optional(v.string()),
			flowMode: v.optional(v.string()),
			linkAccount: v.optional(v.boolean()),
			primaryUserId: v.optional(v.id('users')),
			ipAddress: v.optional(v.string()),
			userAgent: v.optional(v.string()),
			createdAt: v.number(),
			expiresAt: v.number()
		})
			.index('by_state', ['stateHash'])
			.index('by_expires', ['expiresAt']),

		// Server-managed authenticated sessions
		authSessions: defineTable({
			sessionId: v.string(),
			convexUserId: v.id('users'),
			workosUserId: v.string(),
			workosSessionId: v.string(),
			accessTokenCiphertext: v.string(),
			refreshTokenCiphertext: v.string(),
			csrfTokenHash: v.string(),
			expiresAt: v.number(),
			createdAt: v.number(),
			lastRefreshedAt: v.optional(v.number()),
			lastSeenAt: v.optional(v.number()),
			ipAddress: v.optional(v.string()),
			userAgent: v.optional(v.string()),
			isValid: v.boolean(),
			revokedAt: v.optional(v.number()),
			userSnapshot: v.object({
				userId: v.id('users'),
				workosId: v.string(),
				email: v.string(),
				firstName: v.optional(v.string()),
				lastName: v.optional(v.string()),
				name: v.optional(v.string()),
				activeWorkspace: v.optional(
					v.object({
						type: v.union(v.literal('personal'), v.literal('workspace')),
						id: v.optional(v.string()),
						name: v.optional(v.string())
					})
				)
			})
		})
			.index('by_session', ['sessionId'])
			.index('by_convex_user', ['convexUserId'])
			.index('by_workos_session', ['workosSessionId']),

		// Users table - WorkOS authentication
		users: defineTable({
			// Auth provider identity (flexible for future provider switching)
			workosId: v.string(), // Current: WorkOS user ID (unique)
			// Future: Add clerkId, auth0Id, etc. if we switch providers
			email: v.string(), // User email from auth provider
			emailVerified: v.boolean(), // Email verification status

			// Profile
			firstName: v.optional(v.string()),
			lastName: v.optional(v.string()),
			name: v.optional(v.string()), // Computed: firstName + lastName
			profileImageUrl: v.optional(v.string()),

			// Timestamps
			createdAt: v.number(),
			updatedAt: v.number(),
			lastLoginAt: v.optional(v.number()),

			// Soft delete (optional)
			deletedAt: v.optional(v.number())
		})
			.index('by_workos_id', ['workosId']) // Fast lookup by WorkOS ID
			.index('by_email', ['email']), // Fast lookup by email

		// Account linking - Multiple email accounts for same person
		// Enables Slack-style account switching (CMD+1, CMD+2, CMD+3)
		accountLinks: defineTable({
			primaryUserId: v.id('users'), // Main account
			linkedUserId: v.id('users'), // Linked account (e.g., work email)
			linkType: v.optional(v.string()), // "work", "personal", etc.
			verifiedAt: v.number(), // When link was verified
			createdAt: v.number()
		})
			.index('by_primary', ['primaryUserId']) // Get all linked accounts
			.index('by_linked', ['linkedUserId']), // Check if account is linked

		// Workspaces table - ready for future multi-tenancy
		workspaces: defineTable({
			name: v.string(),
			slug: v.string(), // URL-friendly identifier
			createdAt: v.number(),
			updatedAt: v.number(),
			plan: v.string(),
			branding: v.optional(
				v.object({
					primaryColor: v.string(), // OKLCH format: "oklch(55% 0.2 250)"
					secondaryColor: v.string(), // OKLCH format
					logo: v.optional(v.string()), // Convex Storage ID or URL
					updatedAt: v.number(),
					updatedBy: v.id('users')
				})
			)
		}).index('by_slug', ['slug']),

		// Workspace slug aliases - for URL stability when workspace renames
		// Stores old slugs so bookmarks and shared links continue to work
		workspaceAliases: defineTable({
			workspaceId: v.id('workspaces'),
			slug: v.string(), // Old slug (before rename)
			createdAt: v.number()
		}).index('by_slug', ['slug']),

		// Workspace members (many-to-many)
		workspaceMembers: defineTable({
			workspaceId: v.id('workspaces'),
			userId: v.id('users'),
			role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
			joinedAt: v.number()
		})
			.index('by_workspace', ['workspaceId'])
			.index('by_user', ['userId'])
			.index('by_workspace_user', ['workspaceId', 'userId']),

		// Circles - work workspace units (not people grouping)
		// Represents value streams, functions, or coordination contexts
		circles: defineTable({
			workspaceId: v.id('workspaces'),
			name: v.string(), // "Active Platforms"
			slug: v.string(), // "active-platforms"
			purpose: v.optional(v.string()), // Why this work exists
			parentCircleId: v.optional(v.id('circles')), // Nested circles
			status: v.union(v.literal('draft'), v.literal('active')), // Draft status for imports
			// Operating mode fields
			circleType: v.optional(
				v.union(
					v.literal('hierarchy'), // Traditional: manager decides
					v.literal('empowered_team'), // Agile: team consensus
					v.literal('guild'), // Coordination only, no authority
					v.literal('hybrid') // Mixed: depends on decision type
				)
			), // Default: 'hierarchy' (null = hierarchy for backward compat)
			decisionModel: v.optional(
				v.union(
					v.literal('manager_decides'), // Single approver (manager/lead)
					v.literal('team_consensus'), // All members must agree
					v.literal('consent'), // No valid objections (IDM)
					v.literal('coordination_only') // Guild: must approve in home circle
				)
			), // Default: 'manager_decides' (null = manager_decides for backward compat)
			createdAt: v.number(),
			updatedAt: v.number(),
			updatedBy: v.optional(v.id('users')), // Who last modified
			archivedAt: v.optional(v.number()), // Soft delete timestamp
			archivedBy: v.optional(v.id('users')) // Who archived it
		})
			.index('by_workspace', ['workspaceId'])
			.index('by_parent', ['parentCircleId'])
			.index('by_slug', ['workspaceId', 'slug'])
			.index('by_workspace_archived', ['workspaceId', 'archivedAt']) // For efficient filtering of active/archived circles
			.index('by_workspace_status', ['workspaceId', 'status', 'archivedAt']), // For filtering by status

		// Circle members (many-to-many)
		circleMembers: defineTable({
			circleId: v.id('circles'),
			userId: v.id('users'),
			joinedAt: v.number(),
			addedBy: v.optional(v.id('users')), // Who added the member
			archivedAt: v.optional(v.number()), // Soft delete timestamp (when user leaves circle)
			archivedBy: v.optional(v.id('users')) // Who removed the member
		})
			.index('by_circle', ['circleId'])
			.index('by_user', ['userId'])
			.index('by_circle_user', ['circleId', 'userId'])
			.index('by_circle_archived', ['circleId', 'archivedAt']), // For efficient filtering of active/archived members

		// Circle roles - Workspace roles within circles (NOT RBAC permissions)
		// Examples: "Circle Lead", "Dev Lead", "Facilitator"
		circleRoles: defineTable({
			circleId: v.id('circles'),
			workspaceId: v.id('workspaces'), // Denormalized for efficient workspace-level queries
			name: v.string(), // "Circle Lead"
			purpose: v.optional(v.string()), // Optional description of role
			templateId: v.optional(v.id('roleTemplates')), // Which template this role is based on
			status: v.union(v.literal('draft'), v.literal('active')), // Draft status for imports
			isHiring: v.boolean(), // Open position flag
			createdAt: v.number(),
			updatedAt: v.number(), // Last modification timestamp
			updatedBy: v.optional(v.id('users')), // Who last modified
			archivedAt: v.optional(v.number()), // Soft delete timestamp
			archivedBy: v.optional(v.id('users')) // Who archived it
		})
			.index('by_circle', ['circleId'])
			.index('by_circle_archived', ['circleId', 'archivedAt']) // For efficient filtering of active/archived roles
			.index('by_template', ['templateId']) // For querying roles by template
			.index('by_circle_status', ['circleId', 'status', 'archivedAt']) // For filtering by status within circle
			.index('by_workspace_hiring', ['workspaceId', 'isHiring', 'archivedAt']), // For finding open positions

		// Role Templates - Reusable role definitions that can be marked as core roles
		// System-level templates have workspaceId = undefined, workspace-level templates have an ID
		roleTemplates: defineTable({
			// Nullable for system-level templates (undefined = system, ID = workspace)
			workspaceId: v.optional(v.id('workspaces')),
			name: v.string(), // e.g., "Circle Lead"
			description: v.optional(v.string()),
			// Template flags
			isCore: v.boolean(), // Should auto-create in new circles
			isRequired: v.boolean(), // Cannot be deleted (e.g., Circle Lead)
			// Soft delete
			archivedAt: v.optional(v.number()),
			archivedBy: v.optional(v.id('users')),
			// Timestamps
			createdAt: v.number(),
			createdBy: v.id('users'),
			updatedAt: v.number(),
			updatedBy: v.optional(v.id('users'))
		})
			.index('by_workspace', ['workspaceId']) // Get workspace templates (includes null for system)
			.index('by_core', ['workspaceId', 'isCore']), // Get core templates

		// User circle role assignments (many-to-many)
		// Users can fill multiple roles, roles can have multiple fillers
		userCircleRoles: defineTable({
			userId: v.id('users'),
			circleRoleId: v.id('circleRoles'),
			scope: v.optional(v.string()), // Member-level scope text (what this person is responsible for when filling the role)
			assignedAt: v.number(),
			assignedBy: v.id('users'), // Who made the assignment
			updatedAt: v.number(), // Last modification timestamp
			updatedBy: v.optional(v.id('users')), // Who last modified
			archivedAt: v.optional(v.number()), // Soft delete timestamp (when user removed from role)
			archivedBy: v.optional(v.id('users')) // Who removed the assignment
		})
			.index('by_user', ['userId'])
			.index('by_role', ['circleRoleId'])
			.index('by_user_role', ['userId', 'circleRoleId'])
			.index('by_role_archived', ['circleRoleId', 'archivedAt']) // For efficient filtering of active/archived assignments by role
			.index('by_user_archived', ['userId', 'archivedAt']), // For efficient filtering of active/archived assignments by user

		// Circle Item Categories - Customizable category containers for circles and roles
		// Examples: "Purpose", "Domains", "Accountabilities", "Policies", "Decision Rights", "Notes"
		circleItemCategories: defineTable({
			workspaceId: v.id('workspaces'),
			entityType: v.union(v.literal('circle'), v.literal('role')), // What entity type this category applies to
			name: v.string(), // "Domains", "Accountabilities", etc.
			order: v.number(), // Display order (drag/drop)
			isDefault: v.boolean(), // Created automatically with workspace
			createdAt: v.number(),
			createdBy: v.id('users'),
			updatedAt: v.number(),
			updatedBy: v.optional(v.id('users')),
			archivedAt: v.optional(v.number()), // Soft delete timestamp
			archivedBy: v.optional(v.id('users')) // Who archived it
		})
			.index('by_workspace', ['workspaceId']) // Get all categories for workspace
			.index('by_entity_type', ['workspaceId', 'entityType']), // Get categories by type

		// Circle Items - Content items within categories
		// Belong to a specific circle/role and category, draggable for user-defined ordering
		circleItems: defineTable({
			workspaceId: v.id('workspaces'),
			categoryId: v.id('circleItemCategories'),
			entityType: v.union(v.literal('circle'), v.literal('role')), // Denormalized for queries
			entityId: v.string(), // Circle or Role ID (stored as string for flexibility)
			content: v.string(), // Item text content
			order: v.number(), // Display order within category (drag/drop)
			createdAt: v.number(),
			createdBy: v.id('users'),
			updatedAt: v.number(),
			updatedBy: v.optional(v.id('users')),
			archivedAt: v.optional(v.number()), // Soft delete timestamp
			archivedBy: v.optional(v.id('users')) // Who archived it
			// Future: embedding field for AI/RAG vectorization
			// embeddingId: v.optional(v.id('embeddings'))
		})
			.index('by_category', ['categoryId']) // Get items in category
			.index('by_entity', ['entityType', 'entityId']) // Get items for specific circle/role
			.index('by_workspace', ['workspaceId']), // Get all items for workspace

		// Org Chart Version History - Complete audit trail of all organizational changes
		// Uses discriminated unions for type-safe before/after snapshots (no v.any())
		orgVersionHistory: defineTable(
			v.union(
				// Circle change
				v.object({
					entityType: v.literal('circle'),
					workspaceId: v.id('workspaces'),
					entityId: v.id('circles'),
					changeType: v.union(
						v.literal('create'),
						v.literal('update'),
						v.literal('archive'),
						v.literal('restore')
					),
					changedBy: v.id('users'),
					changedAt: v.number(),
					changeDescription: v.optional(v.string()),
					before: v.optional(
						v.object({
							name: v.string(),
							slug: v.string(),
							purpose: v.optional(v.string()),
							parentCircleId: v.optional(v.id('circles')), // undefined = root circle
							status: v.union(v.literal('draft'), v.literal('active')),
							archivedAt: v.optional(v.number())
						})
					),
					after: v.optional(
						v.object({
							name: v.string(),
							slug: v.string(),
							purpose: v.optional(v.string()),
							parentCircleId: v.optional(v.id('circles')), // undefined = root circle
							status: v.union(v.literal('draft'), v.literal('active')),
							archivedAt: v.optional(v.number())
						})
					)
				}),
				// Circle Role change
				v.object({
					entityType: v.literal('circleRole'),
					workspaceId: v.id('workspaces'),
					entityId: v.id('circleRoles'),
					changeType: v.union(
						v.literal('create'),
						v.literal('update'),
						v.literal('archive'),
						v.literal('restore')
					),
					changedBy: v.id('users'),
					changedAt: v.number(),
					changeDescription: v.optional(v.string()),
					before: v.optional(
						v.object({
							circleId: v.id('circles'),
							name: v.string(),
							purpose: v.optional(v.string()),
							templateId: v.optional(v.id('roleTemplates')),
							status: v.union(v.literal('draft'), v.literal('active')),
							isHiring: v.boolean(),
							archivedAt: v.optional(v.number())
						})
					),
					after: v.optional(
						v.object({
							circleId: v.id('circles'),
							name: v.string(),
							purpose: v.optional(v.string()),
							templateId: v.optional(v.id('roleTemplates')),
							status: v.union(v.literal('draft'), v.literal('active')),
							isHiring: v.boolean(),
							archivedAt: v.optional(v.number())
						})
					)
				}),
				// User Circle Role (assignment) change
				v.object({
					entityType: v.literal('userCircleRole'),
					workspaceId: v.id('workspaces'),
					entityId: v.id('userCircleRoles'),
					changeType: v.union(
						v.literal('create'),
						v.literal('update'),
						v.literal('archive'),
						v.literal('restore')
					),
					changedBy: v.id('users'),
					changedAt: v.number(),
					changeDescription: v.optional(v.string()),
					before: v.optional(
						v.object({
							userId: v.id('users'),
							circleRoleId: v.id('circleRoles'),
							scope: v.optional(v.string()),
							archivedAt: v.optional(v.number())
						})
					),
					after: v.optional(
						v.object({
							userId: v.id('users'),
							circleRoleId: v.id('circleRoles'),
							scope: v.optional(v.string()),
							archivedAt: v.optional(v.number())
						})
					)
				}),
				// Circle Member change
				v.object({
					entityType: v.literal('circleMember'),
					workspaceId: v.id('workspaces'),
					entityId: v.id('circleMembers'),
					changeType: v.union(
						v.literal('create'),
						v.literal('update'),
						v.literal('archive'),
						v.literal('restore')
					),
					changedBy: v.id('users'),
					changedAt: v.number(),
					changeDescription: v.optional(v.string()),
					before: v.optional(
						v.object({
							circleId: v.id('circles'),
							userId: v.id('users'),
							archivedAt: v.optional(v.number())
						})
					),
					after: v.optional(
						v.object({
							circleId: v.id('circles'),
							userId: v.id('users'),
							archivedAt: v.optional(v.number())
						})
					)
				}),
				// Circle Item Category change
				v.object({
					entityType: v.literal('circleItemCategory'),
					workspaceId: v.id('workspaces'),
					entityId: v.id('circleItemCategories'),
					changeType: v.union(
						v.literal('create'),
						v.literal('update'),
						v.literal('archive'),
						v.literal('restore')
					),
					changedBy: v.id('users'),
					changedAt: v.number(),
					changeDescription: v.optional(v.string()),
					before: v.optional(
						v.object({
							workspaceId: v.id('workspaces'),
							entityType: v.union(v.literal('circle'), v.literal('role')),
							name: v.string(),
							order: v.number(),
							isDefault: v.boolean(),
							archivedAt: v.optional(v.number())
						})
					),
					after: v.optional(
						v.object({
							workspaceId: v.id('workspaces'),
							entityType: v.union(v.literal('circle'), v.literal('role')),
							name: v.string(),
							order: v.number(),
							isDefault: v.boolean(),
							archivedAt: v.optional(v.number())
						})
					)
				}),
				// Circle Item change
				v.object({
					entityType: v.literal('circleItem'),
					workspaceId: v.id('workspaces'),
					entityId: v.id('circleItems'),
					changeType: v.union(
						v.literal('create'),
						v.literal('update'),
						v.literal('archive'),
						v.literal('restore')
					),
					changedBy: v.id('users'),
					changedAt: v.number(),
					changeDescription: v.optional(v.string()),
					before: v.optional(
						v.object({
							categoryId: v.id('circleItemCategories'),
							entityType: v.union(v.literal('circle'), v.literal('role')),
							entityId: v.string(), // Circle or Role ID (stored as string)
							content: v.string(),
							order: v.number(),
							archivedAt: v.optional(v.number())
						})
					),
					after: v.optional(
						v.object({
							categoryId: v.id('circleItemCategories'),
							entityType: v.union(v.literal('circle'), v.literal('role')),
							entityId: v.string(), // Circle or Role ID (stored as string)
							content: v.string(),
							order: v.number(),
							archivedAt: v.optional(v.number())
						})
					)
				})
			)
		)
			.index('by_entity', ['entityType', 'entityId']) // Get version history for specific entity
			.index('by_workspace', ['workspaceId', 'changedAt']) // Get workspace timeline (ordered by time)
			.index('by_user', ['changedBy', 'changedAt']), // Get all changes by user (ordered by time)

		// Meetings - scheduled meetings with recurrence support
		meetings: defineTable({
			workspaceId: v.id('workspaces'),
			circleId: v.optional(v.id('circles')), // null = ad-hoc meeting
			title: v.string(),
			templateId: v.id('meetingTemplates'), // Required: meeting template defines the meeting type/structure

			// Scheduling
			startTime: v.number(), // Unix timestamp
			duration: v.number(), // Minutes
			recurrence: v.optional(
				v.object({
					frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
					interval: v.number(), // Every N days/weeks/months
					daysOfWeek: v.optional(v.array(v.number())), // For weekly: [1,3,5] = Mon,Wed,Fri
					endDate: v.optional(v.number()) // Optional end date
				})
			),

			// Privacy
			visibility: v.union(
				v.literal('public'), // All workspace members can see and join
				v.literal('private') // Only invited users can see and join
			),

			// Real-time meeting session (SYOS-173)
			startedAt: v.optional(v.number()), // When meeting started (live session)
			currentStep: v.optional(v.string()), // Current step: "check-in" | "agenda" | "closing"
			closedAt: v.optional(v.number()), // When meeting closed
			recorderId: v.optional(v.id('users')), // User who controls meeting screen view and flow
			activeAgendaItemId: v.optional(v.id('meetingAgendaItems')), // Currently active agenda item (synchronized view)
			parentMeetingId: v.optional(v.id('meetings')), // For recurring meeting instances - links to original recurring meeting
			deletedAt: v.optional(v.number()), // Soft delete timestamp

			createdAt: v.number(),
			createdBy: v.id('users'),
			updatedAt: v.number()
		})
			.index('by_workspace', ['workspaceId'])
			.index('by_circle', ['circleId'])
			.index('by_start_time', ['workspaceId', 'startTime'])
			.index('by_template', ['workspaceId', 'templateId']) // For reporting and analytics
			.index('by_recorder', ['recorderId']) // For querying meetings by recorder
			.index('by_parent', ['parentMeetingId']) // For querying recurring instances
			.index('by_deleted', ['deletedAt']), // For filtering soft-deleted meetings

		// Meeting attendees - polymorphic attendees (user/role/circle)
		meetingAttendees: defineTable({
			meetingId: v.id('meetings'),
			userId: v.id('users'), // Required: attendees are always users
			joinedAt: v.number() // When user joined the meeting
		})
			.index('by_meeting', ['meetingId'])
			.index('by_user', ['userId'])
			.index('by_meeting_user', ['meetingId', 'userId']), // For upserts

		// Meeting Invitations - invitations to join a meeting
		meetingInvitations: defineTable({
			meetingId: v.id('meetings'),

			// Polymorphic invitation (exactly one must be set)
			invitationType: v.union(
				v.literal('user'), // Specific user
				v.literal('circle') // Entire circle
			),
			userId: v.optional(v.id('users')),
			circleId: v.optional(v.id('circles')),

			createdAt: v.number(),
			createdBy: v.id('users')
		})
			.index('by_meeting', ['meetingId'])
			.index('by_user', ['userId'])
			.index('by_circle', ['circleId']),

		// Meeting Agenda Items - real-time collaborative agenda (SYOS-173)
		meetingAgendaItems: defineTable({
			meetingId: v.id('meetings'),
			title: v.string(), // Agenda item title
			order: v.number(), // Display order (for sorting)
			notes: v.optional(v.string()), // Markdown notes for the item (SYOS-218)
			status: v.union(v.literal('todo'), v.literal('processed'), v.literal('rejected')), // Status enum: todo (default), processed, rejected
			createdBy: v.id('users'), // Who created this item
			createdAt: v.number()
		})
			.index('by_meeting', ['meetingId'])
			.index('by_status', ['meetingId', 'status']), // For filtering by status

		// Meeting Presence - real-time tracking of who's in the meeting (SYOS-227)
		meetingPresence: defineTable({
			meetingId: v.id('meetings'),
			userId: v.id('users'),
			joinedAt: v.number(), // First join timestamp
			lastSeenAt: v.number() // Heartbeat timestamp (updated every 30s)
		})
			.index('by_meeting', ['meetingId'])
			.index('by_meeting_lastSeen', ['meetingId', 'lastSeenAt']) // For active user queries
			.index('by_meeting_user', ['meetingId', 'userId']), // For upserts

		// Circle Proposals - Suggested changes to circles or roles
		circleProposals: defineTable({
			workspaceId: v.id('workspaces'),
			// Target entity (circle or role)
			entityType: v.union(v.literal('circle'), v.literal('role')),
			entityId: v.string(), // Circle ID or Role ID as string
			// For circle proposals, also store circleId for efficient queries
			circleId: v.optional(v.id('circles')),
			// Proposal content
			title: v.string(), // Short summary of the change
			description: v.string(), // Justification/context for the change
			// Status workflow
			status: v.union(
				v.literal('draft'), // Created, not yet submitted
				v.literal('submitted'), // Submitted, waiting for meeting
				v.literal('in_meeting'), // Being discussed in governance meeting
				v.literal('objections'), // Has unresolved objections
				v.literal('integrated'), // Objections integrated, ready for approval
				v.literal('approved'), // Approved, changes applied
				v.literal('rejected'), // Rejected, no changes applied
				v.literal('withdrawn') // Creator withdrew the proposal
			),
			// Meeting integration
			meetingId: v.optional(v.id('meetings')), // Linked governance meeting
			agendaItemId: v.optional(v.id('meetingAgendaItems')), // Agenda item in meeting
			// Version history integration
			versionHistoryEntryId: v.optional(v.id('orgVersionHistory')), // Link to applied change
			// Metadata
			createdBy: v.id('users'),
			createdAt: v.number(),
			updatedAt: v.number(),
			submittedAt: v.optional(v.number()), // When submitted to meeting
			processedAt: v.optional(v.number()), // When approved/rejected
			processedBy: v.optional(v.id('users')) // Who made final decision
		})
			.index('by_workspace', ['workspaceId'])
			.index('by_entity', ['entityType', 'entityId'])
			.index('by_circle', ['circleId'])
			.index('by_meeting', ['meetingId'])
			.index('by_status', ['workspaceId', 'status'])
			.index('by_creator', ['createdBy'])
			.index('by_workspace_status', ['workspaceId', 'status', 'createdAt']),

		// Proposal Evolutions - The actual changes in a proposal
		proposalEvolutions: defineTable({
			proposalId: v.id('circleProposals'),
			// What's changing
			fieldPath: v.string(), // e.g., "name", "purpose", "items.domains.0"
			fieldLabel: v.string(), // Human-readable: "Circle Name", "Domain #1"
			// Before/after values (JSON stringified for flexibility)
			beforeValue: v.optional(v.string()), // null for additions
			afterValue: v.optional(v.string()), // null for deletions
			// Change type
			changeType: v.union(
				v.literal('add'), // Adding new item
				v.literal('update'), // Modifying existing
				v.literal('remove') // Removing item
			),
			// Ordering
			order: v.number(), // Display order in proposal
			// Timestamps
			createdAt: v.number()
		})
			.index('by_proposal', ['proposalId'])
			.index('by_proposal_order', ['proposalId', 'order']),

		// Proposal Attachments - Files attached to proposals
		proposalAttachments: defineTable({
			proposalId: v.id('circleProposals'),
			fileId: v.id('_storage'), // Convex file storage
			fileName: v.string(),
			fileType: v.string(), // MIME type
			fileSize: v.number(), // Bytes
			uploadedBy: v.id('users'),
			uploadedAt: v.number()
		}).index('by_proposal', ['proposalId']),

		// Proposal Objections - Concerns raised during IDM process
		proposalObjections: defineTable({
			proposalId: v.id('circleProposals'),
			// Who raised the objection
			raisedBy: v.id('users'),
			// Objection content
			objectionText: v.string(), // The concern being raised
			// Validation (recorder determines if objection is valid)
			isValid: v.optional(v.boolean()), // null = not yet validated
			validationNote: v.optional(v.string()), // Why valid/invalid
			validatedBy: v.optional(v.id('users')), // Recorder who validated
			validatedAt: v.optional(v.number()),
			// Resolution
			isIntegrated: v.boolean(), // Has been integrated into proposal
			integrationNote: v.optional(v.string()), // How it was integrated
			integratedAt: v.optional(v.number()),
			// Timestamps
			createdAt: v.number()
		})
			.index('by_proposal', ['proposalId'])
			.index('by_raiser', ['raisedBy'])
			.index('by_proposal_valid', ['proposalId', 'isValid']),

		// Meeting Templates - reusable meeting structures with predefined agenda steps
		meetingTemplates: defineTable({
			workspaceId: v.id('workspaces'),
			name: v.string(), // "Weekly Tactical", "Governance"
			description: v.optional(v.string()), // Optional template description
			createdAt: v.number(),
			createdBy: v.id('users')
		}).index('by_workspace', ['workspaceId']),

		// Meeting Template Steps - ordered agenda steps for templates
		meetingTemplateSteps: defineTable({
			templateId: v.id('meetingTemplates'),
			stepType: v.union(
				v.literal('check-in'), // Opening round
				v.literal('agenda'), // Open agenda items
				v.literal('metrics'), // Review metrics
				v.literal('projects'), // Project updates
				v.literal('closing'), // Closing round
				v.literal('custom') // Custom step
			),
			title: v.string(), // Step title
			description: v.optional(v.string()), // Optional step description
			orderIndex: v.number(), // Display order (0-based)
			timebox: v.optional(v.number()), // Minutes (optional)
			createdAt: v.number()
		}).index('by_template', ['templateId']),

		// Projects - Lightweight wrappers around external project management tools
		// Links to Linear, Notion, Asana, Jira, etc. for bi-directional sync
		// See: src/lib/modules/projects/README.md for full definition
		projects: defineTable({
			workspaceId: v.id('workspaces'), // Required: all projects belong to a workspace
			circleId: v.optional(v.id('circles')), // Optional: circle association

			// Basic info
			name: v.string(), // Project name
			description: v.optional(v.string()), // Optional project description

			// External tool link (primary connection)
			externalTool: v.union(
				v.literal('linear'),
				v.literal('notion'),
				v.literal('asana'),
				v.literal('jira'),
				v.literal('trello')
			),
			externalProjectId: v.string(), // ID in external tool

			// Sync state
			syncStatus: v.optional(
				v.union(v.literal('synced'), v.literal('pending'), v.literal('error'))
			),
			lastSyncedAt: v.optional(v.number()), // Last sync timestamp

			// Quick access
			externalUrl: v.optional(v.string()), // Direct link to project in external tool

			// Metadata
			createdAt: v.number(),
			createdBy: v.id('users'),
			updatedAt: v.number()
		})
			.index('by_workspace', ['workspaceId'])
			.index('by_circle', ['circleId'])
			.index('by_external_tool', ['externalTool', 'externalProjectId']), // Unique constraint

		// Tasks - Individual tasks that can exist standalone or be linked to meetings/projects
		// Tasks are always individual tasks (no type field - always 'next-step' implicitly)
		// Can link to projects via `projectId` for external tool sync
		// See: src/lib/modules/meetings/docs/essentials.md#tasks for full definition
		tasks: defineTable({
			workspaceId: v.id('workspaces'), // Required: all tasks belong to a workspace
			meetingId: v.optional(v.id('meetings')), // Optional: task can exist standalone
			agendaItemId: v.optional(v.id('meetingAgendaItems')), // Optional: traceability to agenda item
			projectId: v.optional(v.id('projects')), // Optional: link to project
			circleId: v.optional(v.id('circles')),

			// Polymorphic assignment (user OR role)
			assigneeType: v.union(v.literal('user'), v.literal('role')),
			assigneeUserId: v.optional(v.id('users')),
			assigneeRoleId: v.optional(v.id('circleRoles')),

			// Details
			description: v.string(),
			dueDate: v.optional(v.number()),
			status: v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done')),

			// Phase 3 sync fields
			linearTicketId: v.optional(v.string()),
			notionPageId: v.optional(v.string()),

			// Metadata
			createdAt: v.number(),
			createdBy: v.id('users'),
			updatedAt: v.optional(v.number())
		})
			.index('by_workspace', ['workspaceId'])
			.index('by_meeting', ['meetingId'])
			.index('by_agenda_item', ['agendaItemId'])
			.index('by_project', ['projectId'])
			.index('by_assignee_user', ['assigneeUserId']),

		// Workspace invites (pending membership)
		workspaceInvites: defineTable({
			workspaceId: v.id('workspaces'),
			invitedUserId: v.optional(v.id('users')),
			email: v.optional(v.string()),
			role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
			invitedBy: v.id('users'),
			code: v.string(),
			createdAt: v.number(),
			expiresAt: v.optional(v.number()),
			acceptedAt: v.optional(v.number()),
			revokedAt: v.optional(v.number())
		})
			.index('by_code', ['code'])
			.index('by_workspace', ['workspaceId'])
			.index('by_user', ['invitedUserId'])
			.index('by_email', ['email']),

		// User settings - one per user
		userSettings: defineTable({
			userId: v.id('users'), // Reference to the authenticated user
			theme: v.optional(v.union(v.literal('light'), v.literal('dark'))), // Theme preference
			claudeApiKey: v.optional(v.string()), // Personal Claude API key (encrypted/secure)
			readwiseApiKey: v.optional(v.string()), // Readwise API key (encrypted/secure) - user-owned
			// Sync tracking
			lastReadwiseSyncAt: v.optional(v.number()) // Timestamp of last Readwise sync
			// Future: displayName, email preferences, etc.
		}).index('by_user', ['userId']), // Index for quick lookup by user

		// Workspace settings - org-owned settings (admin-controlled)
		workspaceSettings: defineTable({
			workspaceId: v.id('workspaces'),
			claudeApiKey: v.optional(v.string()), // Workspace's Claude API key (encrypted/secure)
			// Future: billing settings, default preferences, org-wide configurations, etc.
			createdAt: v.number(),
			updatedAt: v.number()
		}).index('by_workspace', ['workspaceId']),

		// Workspace Org Settings - Workspace-level configuration for org chart behavior
		workspaceOrgSettings: defineTable({
			workspaceId: v.id('workspaces'),
			// Circle Lead enforcement
			requireCircleLeadRole: v.boolean(), // Default: true
			// Core role template IDs for this workspace
			coreRoleTemplateIds: v.array(v.id('roleTemplates')),
			// Quick edit mode control
			allowQuickChanges: v.boolean(), // Default: false (proposals required)
			// Timestamps
			createdAt: v.number(),
			updatedAt: v.number()
		}).index('by_workspace', ['workspaceId']),

		// Authors table - normalized author names
		// Note: Readwise provides authors as strings, we normalize them
		authors: defineTable({
			userId: v.id('users'),
			name: v.string(), // Author name (normalized, lowercase for matching)
			displayName: v.string(), // Original author name as provided
			// Future: bio, avatar, etc.
			createdAt: v.number() // When first added
		})
			.index('by_user', ['userId'])
			.index('by_user_name', ['userId', 'name']), // Unique author per user

		// Sources table (books, articles, tweets, etc.)
		// Represents the source that highlights come from
		sources: defineTable({
			userId: v.id('users'),
			authorId: v.id('authors'), // Primary author (for multiple authors, we'll handle separately)
			title: v.string(),
			category: v.string(), // "books", "articles", "tweets", "pdfs", etc.
			sourceType: v.string(), // "kindle", "reader", etc.
			externalId: v.string(), // Readwise source/book ID
			sourceUrl: v.optional(v.string()), // Original source URL (for articles/web)
			coverImageUrl: v.optional(v.string()), // Cover/thumbnail image
			highlightsUrl: v.optional(v.string()), // Link to highlights in Readwise
			asin: v.optional(v.string()), // Amazon ASIN (for Kindle books)
			documentNote: v.optional(v.string()), // User's top-level note on source
			numHighlights: v.number(), // Count of highlights (from Readwise)
			lastHighlightAt: v.optional(v.number()), // Timestamp of most recent highlight
			updatedAt: v.number(), // When source was last updated (from Readwise)
			createdAt: v.number(), // When first added to Axon
			// Multi-tenancy fields (future)
			workspaceId: v.optional(v.id('workspaces')), // Future: org-owned content
			circleId: v.optional(v.id('circles')), // Future: circle-owned content
			ownershipType: v.optional(
				v.union(
					v.literal('user'), // User-owned (default)
					v.literal('workspace'), // Org-owned
					v.literal('circle'), // Circle-owned
					v.literal('purchased') // Purchased content
				)
			)
		})
			.index('by_user', ['userId'])
			.index('by_author', ['authorId'])
			.index('by_external_id', ['externalId']) // Prevent duplicates
			.index('by_user_category', ['userId', 'category'])
			.index('by_user_source_type', ['userId', 'sourceType'])
			.index('by_workspace', ['workspaceId']) // Future index
			.index('by_circle', ['circleId']), // Future index

		// Multiple authors per source (many-to-many relationship)
		// Some sources have comma-separated authors, we store them separately
		sourceAuthors: defineTable({
			sourceId: v.id('sources'),
			authorId: v.id('authors')
		})
			.index('by_source', ['sourceId'])
			.index('by_author', ['authorId'])
			.index('by_source_author', ['sourceId', 'authorId']), // Unique constraint

		// Highlights table - individual highlights from sources
		// Note: processed status is tracked in inboxItems table, not here
		highlights: defineTable({
			userId: v.id('users'),
			sourceId: v.id('sources'), // Link to source/book
			text: v.string(), // Highlight text content
			location: v.optional(v.number()), // Location in source (offset/page number)
			locationType: v.optional(v.string()), // "offset", "page", "chapter", etc.
			note: v.optional(v.string()), // User's note on highlight
			color: v.optional(v.string()), // Highlight color
			externalId: v.string(), // Readwise highlight ID
			externalUrl: v.string(), // Link to highlight in Readwise
			highlightedAt: v.optional(v.number()), // When user made the highlight (timestamp)
			updatedAt: v.number(), // When highlight was last updated (from Readwise)
			createdAt: v.number(), // When first added to Axon
			lastSyncedAt: v.optional(v.number()), // Last time synced from Readwise
			// Multi-tenancy fields (future)
			workspaceId: v.optional(v.id('workspaces')), // Future: org-owned content
			circleId: v.optional(v.id('circles')), // Future: circle-owned content
			ownershipType: v.optional(
				v.union(
					v.literal('user'), // User-owned (default)
					v.literal('workspace'), // Org-owned
					v.literal('circle'), // Circle-owned
					v.literal('purchased') // Purchased content
				)
			)
		})
			.index('by_user', ['userId'])
			.index('by_source', ['sourceId'])
			.index('by_external_id', ['externalId']) // Prevent duplicates
			.index('by_user_source', ['userId', 'sourceId'])
			.index('by_workspace', ['workspaceId']) // Future index
			.index('by_circle', ['circleId']), // Future index

		// Universal Inbox Items table - polymorphic table for all inbox content
		// Uses discriminated unions to support different source types
		inboxItems: defineTable(
			v.union(
				// Readwise Highlight - links to highlights table
				v.object({
					type: v.literal('readwise_highlight'),
					userId: v.id('users'),
					processed: v.boolean(), // User has reviewed/processed this item
					processedAt: v.optional(v.number()), // When processed
					createdAt: v.number(), // When first added to inbox
					highlightId: v.id('highlights'), // Link to highlights table
					// Multi-tenancy fields (future)
					workspaceId: v.optional(v.id('workspaces')), // Future: org-owned content
					circleId: v.optional(v.id('circles')), // Future: circle-owned content
					ownershipType: v.optional(
						v.union(
							v.literal('user'), // User-owned (default)
							v.literal('workspace'), // Org-owned
							v.literal('circle'), // Circle-owned
							v.literal('purchased') // Purchased content
						)
					)
				}),
				// Photo Note (for future)
				v.object({
					type: v.literal('photo_note'),
					userId: v.id('users'),
					processed: v.boolean(),
					processedAt: v.optional(v.number()),
					createdAt: v.number(),
					imageFileId: v.id('_storage'), // Convex file storage ID
					transcribedText: v.optional(v.string()), // OCR result
					source: v.optional(v.string()), // Where photo came from
					ocrStatus: v.optional(
						v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'))
					),
					// Multi-tenancy fields (future)
					workspaceId: v.optional(v.id('workspaces')), // Future: org-owned content
					circleId: v.optional(v.id('circles')), // Future: circle-owned content
					ownershipType: v.optional(
						v.union(
							v.literal('user'), // User-owned (default)
							v.literal('workspace'), // Org-owned
							v.literal('circle'), // Circle-owned
							v.literal('purchased') // Purchased content
						)
					)
				}),
				// Manual Text (for future)
				v.object({
					type: v.literal('manual_text'),
					userId: v.id('users'),
					processed: v.boolean(),
					processedAt: v.optional(v.number()),
					createdAt: v.number(),
					text: v.string(),
					bookTitle: v.optional(v.string()), // Optional manual attribution
					pageNumber: v.optional(v.number()),
					// Multi-tenancy fields (future)
					workspaceId: v.optional(v.id('workspaces')), // Future: org-owned content
					circleId: v.optional(v.id('circles')), // Future: circle-owned content
					ownershipType: v.optional(
						v.union(
							v.literal('user'), // User-owned (default)
							v.literal('workspace'), // Org-owned
							v.literal('circle'), // Circle-owned
							v.literal('purchased') // Purchased content
						)
					)
				}),
				// Rich Text Note - ProseMirror-based notes with AI detection
				v.object({
					type: v.literal('note'),
					userId: v.id('users'),
					processed: v.boolean(),
					processedAt: v.optional(v.number()),
					createdAt: v.number(),
					updatedAt: v.optional(v.number()), // Last edit timestamp
					title: v.optional(v.string()), // Optional note title
					content: v.string(), // Rich text stored as ProseMirror JSON
					contentMarkdown: v.optional(v.string()), // Markdown version for search/export
					isAIGenerated: v.optional(v.boolean()), // Flag for AI-generated content
					aiGeneratedAt: v.optional(v.number()), // When flagged as AI-generated
					embeddings: v.optional(
						v.array(
							v.object({
								type: v.string(), // "miro", "notion", "figma", "linear", etc.
								url: v.string(),
								metadata: v.optional(v.any()) // Provider-specific metadata
							})
						)
					),
					blogCategory: v.optional(v.string()), // "BLOG" for blog posts
					publishedTo: v.optional(v.string()), // Path to exported markdown file
					slug: v.optional(v.string()), // URL-friendly slug for blog posts
					// Multi-tenancy fields (future)
					workspaceId: v.optional(v.id('workspaces')),
					circleId: v.optional(v.id('circles')),
					ownershipType: v.optional(
						v.union(
							v.literal('user'),
							v.literal('workspace'),
							v.literal('circle'),
							v.literal('purchased')
						)
					)
				})
			)
		)
			.index('by_user', ['userId'])
			.index('by_user_type', ['userId', 'type'])
			.index('by_user_processed', ['userId', 'processed'])
			.index('by_workspace', ['workspaceId']) // Future index
			.index('by_circle', ['circleId']), // Future index

		// Tags table - proper relational table for filtering with hierarchical support
		tags: defineTable({
			userId: v.id('users'),
			name: v.string(), // Tag name (normalized, lowercase for matching)
			displayName: v.string(), // Original tag name as provided
			externalId: v.optional(v.number()), // Readwise tag ID (if available)
			color: v.string(), // User-assigned color (hex code)
			parentId: v.optional(v.id('tags')), // Parent tag for hierarchical relationships
			createdAt: v.number(),
			workspaceId: v.optional(v.id('workspaces')),
			circleId: v.optional(v.id('circles')),
			ownershipType: v.optional(
				v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'))
			)
		})
			.index('by_user', ['userId'])
			.index('by_user_name', ['userId', 'name']) // Unique tag per user
			.index('by_user_parent', ['userId', 'parentId']) // Efficient hierarchical queries
			.index('by_workspace', ['workspaceId'])
			.index('by_workspace_name', ['workspaceId', 'name'])
			.index('by_circle', ['circleId'])
			.index('by_circle_name', ['circleId', 'name']),

		// Many-to-many: Sources ↔ Tags
		// Tags are attached to sources in Readwise
		sourceTags: defineTable({
			sourceId: v.id('sources'),
			tagId: v.id('tags')
		})
			.index('by_source', ['sourceId'])
			.index('by_tag', ['tagId'])
			.index('by_source_tag', ['sourceId', 'tagId']), // Unique constraint

		// Many-to-many: Highlights ↔ Tags (if highlights can have tags)
		// Note: In examples, highlight tags are empty, but we support it for future
		highlightTags: defineTable({
			highlightId: v.id('highlights'),
			tagId: v.id('tags')
		})
			.index('by_highlight', ['highlightId'])
			.index('by_tag', ['tagId'])
			.index('by_highlight_tag', ['highlightId', 'tagId']), // Unique constraint

		// Sync Progress tracking - temporary table for tracking sync state
		// One row per user, cleaned up after sync completes or fails
		syncProgress: defineTable({
			userId: v.id('users'),
			step: v.string(), // Current step: "fetching_books", "fetching_highlights", "processing"
			current: v.number(), // Current count (items processed)
			total: v.optional(v.number()), // Total items to process (if known)
			message: v.optional(v.string()), // User-friendly message
			startedAt: v.number(), // When sync started
			updatedAt: v.number() // Last update timestamp
		}).index('by_user', ['userId']),

		// Flashcards table - stores all flashcards with FSRS algorithm support
		flashcards: defineTable({
			userId: v.id('users'),
			question: v.string(),
			answer: v.string(),
			sourceInboxItemId: v.optional(v.id('inboxItems')), // Link to source inbox item
			sourceType: v.optional(v.string()), // "readwise_highlight", "photo_note", "manual_text"
			// Multi-tenancy fields (future)
			workspaceId: v.optional(v.id('workspaces')), // Future: org-owned content
			circleId: v.optional(v.id('circles')), // Future: circle-owned content
			ownershipType: v.optional(
				v.union(
					v.literal('user'), // User-owned (default)
					v.literal('workspace'), // Org-owned
					v.literal('circle'), // Circle-owned
					v.literal('purchased') // Purchased content
				)
			),
			// FSRS algorithm fields
			algorithm: v.string(), // "fsrs" (for now, can add others later)
			fsrsStability: v.optional(v.number()), // Memory stability
			fsrsDifficulty: v.optional(v.number()), // Card difficulty
			fsrsDue: v.optional(v.number()), // Next review timestamp (milliseconds)
			fsrsState: v.optional(
				v.union(
					v.literal('new'),
					v.literal('learning'),
					v.literal('review'),
					v.literal('relearning')
				)
			),
			// Common fields
			reps: v.number(), // Total number of reviews
			lapses: v.number(), // Times forgotten
			lastReviewAt: v.optional(v.number()), // Last review timestamp
			createdAt: v.number() // When flashcard was created
		})
			.index('by_user', ['userId'])
			.index('by_user_algorithm', ['userId', 'algorithm'])
			.index('by_user_due', ['userId', 'algorithm', 'fsrsDue']) // For querying due cards
			.index('by_source', ['sourceInboxItemId'])
			.index('by_workspace', ['workspaceId']) // Future index
			.index('by_circle', ['circleId']), // Future index

		// Flashcard Reviews - history of all reviews for analytics and algorithm improvement
		flashcardReviews: defineTable({
			flashcardId: v.id('flashcards'),
			userId: v.id('users'),
			rating: v.union(
				v.literal('again'), // Rating.Again
				v.literal('hard'), // Rating.Hard
				v.literal('good'), // Rating.Good
				v.literal('easy') // Rating.Easy
			),
			algorithm: v.string(), // Which algorithm was used ("fsrs")
			reviewTime: v.optional(v.number()), // Time spent reviewing (seconds)
			reviewedAt: v.number(), // Timestamp of review
			// FSRS-specific review data
			fsrsLog: v.optional(
				v.object({
					stability: v.number(), // Stability before review
					difficulty: v.number(), // Difficulty before review
					scheduledDays: v.number(), // Days scheduled for next review
					elapsedDays: v.number() // Days since last review
				})
			)
		})
			.index('by_flashcard', ['flashcardId'])
			.index('by_user', ['userId'])
			.index('by_user_reviewed', ['userId', 'reviewedAt']),

		// User Algorithm Settings - per-user algorithm preferences
		userAlgorithmSettings: defineTable({
			userId: v.id('users'),
			defaultAlgorithm: v.string(), // "fsrs" (default)
			// FSRS parameters (optional, uses defaults if not set)
			fsrsParams: v.optional(
				v.object({
					enableFuzz: v.optional(v.boolean()), // Enable fuzzing for intervals
					maximumInterval: v.optional(v.number()), // Maximum interval in days
					requestRetention: v.optional(v.number()) // Target retention rate (0-1)
				})
			),
			createdAt: v.number(),
			updatedAt: v.number()
		}).index('by_user', ['userId']),

		// Flashcard Tags - many-to-many relationship between flashcards and tags
		flashcardTags: defineTable({
			flashcardId: v.id('flashcards'),
			tagId: v.id('tags')
		})
			.index('by_flashcard', ['flashcardId'])
			.index('by_tag', ['tagId'])
			.index('by_flashcard_tag', ['flashcardId', 'tagId']), // Unique constraint

		// Feature Flags - progressive rollout and A/B testing
		featureFlags: defineTable({
			flag: v.string(), // Unique flag identifier (e.g., "notes_prosemirror_beta")
			description: v.optional(v.string()), // Human-readable description of what this flag controls
			enabled: v.boolean(), // Global enabled/disabled state
			rolloutPercentage: v.optional(v.number()), // Percentage of users (0-100)
			allowedUserIds: v.optional(v.array(v.id('users'))), // Specific users who can see this
			allowedWorkspaceIds: v.optional(v.array(v.id('workspaces'))), // Specific workspaces who can see this
			allowedDomains: v.optional(v.array(v.string())), // Email domains (e.g., "@yourcompany.com")
			createdAt: v.number(),
			updatedAt: v.number()
		}).index('by_flag', ['flag']), // Unique flag lookup

		// Waitlist - early access signups
		waitlist: defineTable({
			email: v.string(),
			name: v.optional(v.string()),
			company: v.optional(v.string()),
			role: v.optional(v.string()), // "founder", "product", "engineer", "designer"
			reason: v.optional(v.string()), // Why interested?
			referralSource: v.optional(v.string()), // How found us?
			joinedAt: v.number(),
			invitedAt: v.optional(v.number()),
			status: v.union(v.literal('pending'), v.literal('invited'), v.literal('converted'))
		})
			.index('by_email', ['email'])
			.index('by_status', ['status'])
			.index('by_joined_at', ['joinedAt']),

		// ============================================================================
		// RBAC (Role-Based Access Control) - Permission System
		// ============================================================================

		// Roles - Define available roles in the system
		roles: defineTable({
			slug: v.string(), // Unique identifier (e.g., "admin", "circle-lead")
			name: v.string(), // Display name (e.g., "Admin", "Circle Lead")
			description: v.string(), // Role description
			isSystem: v.boolean(), // System role (can't be deleted)
			createdAt: v.number(),
			updatedAt: v.number()
		}).index('by_slug', ['slug']), // Unique role lookup

		// Permissions - Define available permissions in the system
		permissions: defineTable({
			slug: v.string(), // Unique identifier (e.g., "circles.create")
			category: v.string(), // Category: "users", "teams", "workspaces"
			action: v.string(), // Action: "create", "update", "delete", etc.
			description: v.string(), // Permission description
			requiresResource: v.boolean(), // Does this permission require a resource check?
			isSystem: v.boolean(), // System permission (can't be deleted)
			createdAt: v.number(),
			updatedAt: v.number()
		})
			.index('by_slug', ['slug']) // Unique permission lookup
			.index('by_category', ['category']), // Query by category

		// Role Permissions - Link roles to permissions with optional scope
		rolePermissions: defineTable({
			roleId: v.id('roles'),
			permissionId: v.id('permissions'),
			scope: v.union(
				v.literal('all'), // Can access all resources
				v.literal('own'), // Can only access own resources
				v.literal('none') // Explicitly no access (for override)
			),
			createdAt: v.number()
		})
			.index('by_role', ['roleId'])
			.index('by_permission', ['permissionId'])
			.index('by_role_permission', ['roleId', 'permissionId']), // Unique constraint

		// User Roles - Assign roles to users with optional resource scoping
		userRoles: defineTable({
			userId: v.id('users'),
			roleId: v.id('roles'),
			workspaceId: v.optional(v.id('workspaces')), // Role scoped to org
			circleId: v.optional(v.id('circles')), // Role scoped to specific circle
			resourceType: v.optional(v.string()), // "circle", "workspace", etc.
			resourceId: v.optional(v.string()), // ID of the resource
			assignedBy: v.id('users'), // Who assigned this role
			assignedAt: v.number(),
			expiresAt: v.optional(v.number()), // Optional expiration
			revokedAt: v.optional(v.number()) // When role was revoked
		})
			.index('by_user', ['userId'])
			.index('by_role', ['roleId'])
			.index('by_user_role', ['userId', 'roleId'])
			.index('by_user_workspace', ['userId', 'workspaceId'])
			.index('by_user_circle', ['userId', 'circleId'])
			.index('by_user_resource', ['userId', 'resourceType', 'resourceId']),

		// Resource Guests - Guest access to specific resources (like Notion/Google Docs)
		resourceGuests: defineTable({
			userId: v.id('users'), // Guest user
			resourceType: v.string(), // "circle", "project", "document", etc.
			resourceId: v.string(), // ID of the resource
			permissionIds: v.array(v.id('permissions')), // Specific permissions granted
			invitedBy: v.id('users'), // Who invited this guest
			invitedAt: v.number(),
			expiresAt: v.optional(v.number()), // Optional expiration
			revokedAt: v.optional(v.number()), // When access was revoked
			lastAccessedAt: v.optional(v.number()) // Last time guest accessed resource
		})
			.index('by_user', ['userId'])
			.index('by_resource', ['resourceType', 'resourceId'])
			.index('by_user_resource', ['userId', 'resourceType', 'resourceId']),

		// Permission Audit Log - Track all permission checks and role changes
		permissionAuditLog: defineTable({
			userId: v.id('users'), // User performing action
			action: v.string(), // "check", "grant", "revoke", "assign_role", etc.
			permissionSlug: v.optional(v.string()), // Permission being checked/changed
			roleSlug: v.optional(v.string()), // Role being assigned/revoked
			resourceType: v.optional(v.string()), // Type of resource
			resourceId: v.optional(v.string()), // ID of resource
			workspaceId: v.optional(v.id('workspaces')), // Context: workspace
			circleId: v.optional(v.id('circles')), // Context: circle
			result: v.union(v.literal('allowed'), v.literal('denied')), // Check result
			reason: v.optional(v.string()), // Why denied (if applicable)
			metadata: v.optional(v.any()), // Additional context
			timestamp: v.number()
		})
			.index('by_user', ['userId'])
			.index('by_timestamp', ['timestamp'])
			.index('by_user_timestamp', ['userId', 'timestamp'])
			.index('by_workspace', ['workspaceId'])
			.index('by_circle', ['circleId'])
			.index('by_action', ['action'])
			.index('by_permission', ['permissionSlug']),

		// ============================================================================
		// Email Verification Codes - For registration and passwordless auth
		// ============================================================================

		// Verification Codes - 6-digit PIN codes for email verification
		verificationCodes: defineTable({
			email: v.string(), // Email address to verify
			code: v.string(), // 6-digit PIN code
			type: v.union(
				v.literal('registration'), // Email verification during registration
				v.literal('login'), // Passwordless login (future)
				v.literal('email_change') // Email change verification (future)
			),
			attempts: v.number(), // Number of verification attempts
			verified: v.boolean(), // Whether code has been verified
			verifiedAt: v.optional(v.number()), // When code was verified
			createdAt: v.number(), // When code was created
			expiresAt: v.number(), // When code expires (10 minutes)
			ipAddress: v.optional(v.string()), // IP address of requester
			userAgent: v.optional(v.string()) // User agent of requester
		})
			.index('by_email_type', ['email', 'type']) // Fast lookup by email+type
			.index('by_code', ['code']) // Fast lookup by code
			.index('by_expires', ['expiresAt']), // Cleanup expired codes

		// ============================================================================
		// Documentation 404 Tracking - For maintaining documentation health
		// ============================================================================

		// 404 Errors - Track broken links in documentation
		doc404Errors: defineTable({
			url: v.string(), // The URL that returned 404 (e.g., "/dev-docs/2-areas/system-architecture")
			referrer: v.optional(v.string()), // Where the link came from (if available)
			userAgent: v.optional(v.string()), // User agent
			ipAddress: v.optional(v.string()), // IP address
			userId: v.optional(v.id('users')), // User who encountered the error (if authenticated)
			sessionId: v.optional(v.string()), // Session ID
			count: v.number(), // Number of times this URL has been accessed (for deduplication)
			firstSeenAt: v.number(), // When this URL was first accessed
			lastSeenAt: v.number(), // When this URL was last accessed
			resolved: v.boolean(), // Whether this has been fixed
			resolvedAt: v.optional(v.number()), // When it was resolved
			resolvedBy: v.optional(v.id('users')), // Who resolved it
			resolutionNote: v.optional(v.string()) // Notes about the resolution
		})
			.index('by_url', ['url']) // Fast lookup by URL
			.index('by_resolved', ['resolved']) // Get unresolved errors
			.index('by_last_seen', ['lastSeenAt']) // Sort by most recent
	},
	{
		schemaValidation: false // TEMPORARY: Disabled during ID migration
	}
);

export default schema;
