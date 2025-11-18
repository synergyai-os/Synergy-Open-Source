import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
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
					type: v.union(v.literal('personal'), v.literal('organization')),
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

	// Organizations table - ready for future multi-tenancy
	organizations: defineTable({
		name: v.string(),
		slug: v.string(), // URL-friendly identifier
		createdAt: v.number(),
		updatedAt: v.number(),
		plan: v.string()
	}).index('by_slug', ['slug']),

	// Teams table - ready for future multi-tenancy
	teams: defineTable({
		organizationId: v.id('organizations'),
		name: v.string(),
		slug: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_organization', ['organizationId']),

	// Organization members (many-to-many)
	organizationMembers: defineTable({
		organizationId: v.id('organizations'),
		userId: v.id('users'),
		role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
		joinedAt: v.number()
	})
		.index('by_organization', ['organizationId'])
		.index('by_user', ['userId'])
		.index('by_organization_user', ['organizationId', 'userId']),

	// Team members (many-to-many)
	teamMembers: defineTable({
		teamId: v.id('teams'),
		userId: v.id('users'),
		role: v.union(v.literal('admin'), v.literal('member')),
		joinedAt: v.number()
	})
		.index('by_team', ['teamId'])
		.index('by_user', ['userId'])
		.index('by_team_user', ['teamId', 'userId']),

	// Circles - work organization units (not people grouping)
	// Represents value streams, functions, or coordination contexts
	circles: defineTable({
		organizationId: v.id('organizations'),
		name: v.string(), // "Active Platforms"
		slug: v.string(), // "active-platforms"
		purpose: v.optional(v.string()), // Why this work exists
		parentCircleId: v.optional(v.id('circles')), // Nested circles
		createdAt: v.number(),
		updatedAt: v.number(),
		archivedAt: v.optional(v.number())
	})
		.index('by_organization', ['organizationId'])
		.index('by_parent', ['parentCircleId'])
		.index('by_slug', ['organizationId', 'slug']),

	// Circle members (many-to-many)
	circleMembers: defineTable({
		circleId: v.id('circles'),
		userId: v.id('users'),
		joinedAt: v.number()
	})
		.index('by_circle', ['circleId'])
		.index('by_user', ['userId'])
		.index('by_circle_user', ['circleId', 'userId']),

	// Circle roles - organizational roles within circles (NOT RBAC permissions)
	// Examples: "Circle Lead", "Dev Lead", "Facilitator"
	circleRoles: defineTable({
		circleId: v.id('circles'),
		name: v.string(), // "Circle Lead"
		purpose: v.optional(v.string()), // Optional description of role
		createdAt: v.number()
	}).index('by_circle', ['circleId']),

	// User circle role assignments (many-to-many)
	// Users can fill multiple roles, roles can have multiple fillers
	userCircleRoles: defineTable({
		userId: v.id('users'),
		circleRoleId: v.id('circleRoles'),
		assignedAt: v.number(),
		assignedBy: v.id('users') // Who made the assignment
	})
		.index('by_user', ['userId'])
		.index('by_role', ['circleRoleId'])
		.index('by_user_role', ['userId', 'circleRoleId']),

	// Meetings - scheduled meetings with recurrence support
	meetings: defineTable({
		organizationId: v.id('organizations'),
		circleId: v.optional(v.id('circles')), // null = ad-hoc meeting
		title: v.string(),
		templateId: v.optional(v.id('meetingTemplates')), // Future: meeting templates

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
			v.literal('public'), // All org members
			v.literal('circle'), // Circle members only
			v.literal('private') // Invited only
		),

		// Real-time meeting session (SYOS-173)
		startedAt: v.optional(v.number()), // When meeting started (live session)
		currentStep: v.optional(v.string()), // Current step: "check-in" | "agenda" | "closing"
		closedAt: v.optional(v.number()), // When meeting closed
		secretaryId: v.optional(v.id('users')), // Meeting facilitator (defaults to createdBy)

		createdAt: v.number(),
		createdBy: v.id('users'),
		updatedAt: v.number()
	})
		.index('by_organization', ['organizationId'])
		.index('by_circle', ['circleId'])
		.index('by_start_time', ['organizationId', 'startTime']),

	// Meeting attendees - polymorphic attendees (user/role/circle)
	meetingAttendees: defineTable({
		meetingId: v.id('meetings'),

		// Polymorphic attendee (exactly one must be set)
		attendeeType: v.union(
			v.literal('user'), // Specific user
			v.literal('role'), // Anyone filling this role
			v.literal('circle'), // All circle members
			v.literal('team') // All team members
		),
		userId: v.optional(v.id('users')),
		circleRoleId: v.optional(v.id('circleRoles')),
		circleId: v.optional(v.id('circles')),
		teamId: v.optional(v.id('teams')),

		addedAt: v.number()
	})
		.index('by_meeting', ['meetingId'])
		.index('by_user', ['userId']),

	// Meeting Agenda Items - real-time collaborative agenda (SYOS-173)
	meetingAgendaItems: defineTable({
		meetingId: v.id('meetings'),
		title: v.string(), // Agenda item title
		order: v.number(), // Display order (for sorting)
		notes: v.optional(v.string()), // Markdown notes for the item (SYOS-218)
		isProcessed: v.optional(v.boolean()), // Processing state, defaults to false (SYOS-218)
		createdBy: v.id('users'), // Who created this item
		createdAt: v.number()
	}).index('by_meeting', ['meetingId']),

	// Secretary Change Requests - workflow for changing meeting secretary
	secretaryChangeRequests: defineTable({
		meetingId: v.id('meetings'),
		requestedBy: v.id('users'), // Who requested the change
		requestedFor: v.id('users'), // Who they want to become secretary
		status: v.union(v.literal('pending'), v.literal('approved'), v.literal('denied')),
		createdAt: v.number(),
		resolvedAt: v.optional(v.number()),
		resolvedBy: v.optional(v.id('users'))
	})
		.index('by_meeting_status', ['meetingId', 'status'])
		.index('by_meeting', ['meetingId']),

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

	// Meeting Action Items - tasks/projects captured during meetings (SYOS-219)
	meetingActionItems: defineTable({
		meetingId: v.id('meetings'),
		agendaItemId: v.id('meetingAgendaItems'), // Traceability to agenda item
		circleId: v.optional(v.id('circles')),

		// Type
		type: v.union(v.literal('next-step'), v.literal('project')),

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
		.index('by_meeting', ['meetingId'])
		.index('by_agenda_item', ['agendaItemId'])
		.index('by_assignee_user', ['assigneeUserId']),

	// Meeting Decisions - decisions made during meetings (SYOS-220)
	meetingDecisions: defineTable({
		meetingId: v.id('meetings'),
		agendaItemId: v.id('meetingAgendaItems'), // Traceability to agenda item
		circleId: v.optional(v.id('circles')),

		// Decision content
		title: v.string(),
		description: v.string(), // Markdown

		// Metadata
		decidedAt: v.number(),
		createdBy: v.id('users'),
		updatedAt: v.optional(v.number())
	})
		.index('by_meeting', ['meetingId'])
		.index('by_agenda_item', ['agendaItemId'])
		.index('by_circle', ['circleId']),

	// Meeting Templates - reusable meeting structures with predefined agenda steps
	meetingTemplates: defineTable({
		organizationId: v.id('organizations'),
		name: v.string(), // "Weekly Tactical", "Governance"
		description: v.optional(v.string()), // Optional template description
		createdAt: v.number(),
		createdBy: v.id('users')
	}).index('by_organization', ['organizationId']),

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

	// Organization invites (pending membership)
	organizationInvites: defineTable({
		organizationId: v.id('organizations'),
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
		.index('by_organization', ['organizationId'])
		.index('by_user', ['invitedUserId'])
		.index('by_email', ['email']),

	// Team invites (pending team membership)
	teamInvites: defineTable({
		teamId: v.id('teams'),
		organizationId: v.id('organizations'),
		invitedUserId: v.optional(v.id('users')),
		email: v.optional(v.string()),
		role: v.union(v.literal('admin'), v.literal('member')),
		invitedBy: v.id('users'),
		code: v.string(),
		createdAt: v.number(),
		expiresAt: v.optional(v.number()),
		acceptedAt: v.optional(v.number()),
		revokedAt: v.optional(v.number())
	})
		.index('by_code', ['code'])
		.index('by_team', ['teamId'])
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

	// Organization settings - org-owned settings (admin-controlled)
	organizationSettings: defineTable({
		organizationId: v.id('organizations'),
		claudeApiKey: v.optional(v.string()), // Organization's Claude API key (encrypted/secure)
		// Future: billing settings, default preferences, org-wide configurations, etc.
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_organization', ['organizationId']),

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
		organizationId: v.optional(v.id('organizations')), // Future: org-owned content
		teamId: v.optional(v.id('teams')), // Future: team-owned content
		ownershipType: v.optional(
			v.union(
				v.literal('user'), // User-owned (default)
				v.literal('organization'), // Org-owned
				v.literal('team'), // Team-owned
				v.literal('purchased') // Purchased content
			)
		)
	})
		.index('by_user', ['userId'])
		.index('by_author', ['authorId'])
		.index('by_external_id', ['externalId']) // Prevent duplicates
		.index('by_user_category', ['userId', 'category'])
		.index('by_user_source_type', ['userId', 'sourceType'])
		.index('by_organization', ['organizationId']) // Future index
		.index('by_team', ['teamId']), // Future index

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
		organizationId: v.optional(v.id('organizations')), // Future: org-owned content
		teamId: v.optional(v.id('teams')), // Future: team-owned content
		ownershipType: v.optional(
			v.union(
				v.literal('user'), // User-owned (default)
				v.literal('organization'), // Org-owned
				v.literal('team'), // Team-owned
				v.literal('purchased') // Purchased content
			)
		)
	})
		.index('by_user', ['userId'])
		.index('by_source', ['sourceId'])
		.index('by_external_id', ['externalId']) // Prevent duplicates
		.index('by_user_source', ['userId', 'sourceId'])
		.index('by_organization', ['organizationId']) // Future index
		.index('by_team', ['teamId']), // Future index

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
				organizationId: v.optional(v.id('organizations')), // Future: org-owned content
				teamId: v.optional(v.id('teams')), // Future: team-owned content
				ownershipType: v.optional(
					v.union(
						v.literal('user'), // User-owned (default)
						v.literal('organization'), // Org-owned
						v.literal('team'), // Team-owned
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
				organizationId: v.optional(v.id('organizations')), // Future: org-owned content
				teamId: v.optional(v.id('teams')), // Future: team-owned content
				ownershipType: v.optional(
					v.union(
						v.literal('user'), // User-owned (default)
						v.literal('organization'), // Org-owned
						v.literal('team'), // Team-owned
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
				organizationId: v.optional(v.id('organizations')), // Future: org-owned content
				teamId: v.optional(v.id('teams')), // Future: team-owned content
				ownershipType: v.optional(
					v.union(
						v.literal('user'), // User-owned (default)
						v.literal('organization'), // Org-owned
						v.literal('team'), // Team-owned
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
				organizationId: v.optional(v.id('organizations')),
				teamId: v.optional(v.id('teams')),
				ownershipType: v.optional(
					v.union(
						v.literal('user'),
						v.literal('organization'),
						v.literal('team'),
						v.literal('purchased')
					)
				)
			})
		)
	)
		.index('by_user', ['userId'])
		.index('by_user_type', ['userId', 'type'])
		.index('by_user_processed', ['userId', 'processed'])
		.index('by_organization', ['organizationId']) // Future index
		.index('by_team', ['teamId']), // Future index

	// Tags table - proper relational table for filtering with hierarchical support
	tags: defineTable({
		userId: v.id('users'),
		name: v.string(), // Tag name (normalized, lowercase for matching)
		displayName: v.string(), // Original tag name as provided
		externalId: v.optional(v.number()), // Readwise tag ID (if available)
		color: v.string(), // User-assigned color (hex code)
		parentId: v.optional(v.id('tags')), // Parent tag for hierarchical relationships
		createdAt: v.number(),
		organizationId: v.optional(v.id('organizations')),
		teamId: v.optional(v.id('teams')),
		ownershipType: v.optional(
			v.union(v.literal('user'), v.literal('organization'), v.literal('team'))
		)
	})
		.index('by_user', ['userId'])
		.index('by_user_name', ['userId', 'name']) // Unique tag per user
		.index('by_user_parent', ['userId', 'parentId']) // Efficient hierarchical queries
		.index('by_organization', ['organizationId'])
		.index('by_organization_name', ['organizationId', 'name'])
		.index('by_team', ['teamId'])
		.index('by_team_name', ['teamId', 'name']),

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
		organizationId: v.optional(v.id('organizations')), // Future: org-owned content
		teamId: v.optional(v.id('teams')), // Future: team-owned content
		ownershipType: v.optional(
			v.union(
				v.literal('user'), // User-owned (default)
				v.literal('organization'), // Org-owned
				v.literal('team'), // Team-owned
				v.literal('purchased') // Purchased content
			)
		),
		// FSRS algorithm fields
		algorithm: v.string(), // "fsrs" (for now, can add others later)
		fsrsStability: v.optional(v.number()), // Memory stability
		fsrsDifficulty: v.optional(v.number()), // Card difficulty
		fsrsDue: v.optional(v.number()), // Next review timestamp (milliseconds)
		fsrsState: v.optional(
			v.union(v.literal('new'), v.literal('learning'), v.literal('review'), v.literal('relearning'))
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
		.index('by_organization', ['organizationId']) // Future index
		.index('by_team', ['teamId']), // Future index

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
		allowedOrganizationIds: v.optional(v.array(v.id('organizations'))), // Specific organizations who can see this
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
		slug: v.string(), // Unique identifier (e.g., "admin", "team-lead")
		name: v.string(), // Display name (e.g., "Admin", "Team Lead")
		description: v.string(), // Role description
		isSystem: v.boolean(), // System role (can't be deleted)
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_slug', ['slug']), // Unique role lookup

	// Permissions - Define available permissions in the system
	permissions: defineTable({
		slug: v.string(), // Unique identifier (e.g., "teams.create")
		category: v.string(), // Category: "users", "teams", "organizations"
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
		organizationId: v.optional(v.id('organizations')), // Role scoped to org
		teamId: v.optional(v.id('teams')), // Role scoped to specific team
		resourceType: v.optional(v.string()), // "team", "organization", etc.
		resourceId: v.optional(v.string()), // ID of the resource
		assignedBy: v.id('users'), // Who assigned this role
		assignedAt: v.number(),
		expiresAt: v.optional(v.number()), // Optional expiration
		revokedAt: v.optional(v.number()) // When role was revoked
	})
		.index('by_user', ['userId'])
		.index('by_role', ['roleId'])
		.index('by_user_role', ['userId', 'roleId'])
		.index('by_user_organization', ['userId', 'organizationId'])
		.index('by_user_team', ['userId', 'teamId'])
		.index('by_user_resource', ['userId', 'resourceType', 'resourceId']),

	// Resource Guests - Guest access to specific resources (like Notion/Google Docs)
	resourceGuests: defineTable({
		userId: v.id('users'), // Guest user
		resourceType: v.string(), // "team", "project", "document", etc.
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
		organizationId: v.optional(v.id('organizations')), // Context: organization
		teamId: v.optional(v.id('teams')), // Context: team
		result: v.union(v.literal('allowed'), v.literal('denied')), // Check result
		reason: v.optional(v.string()), // Why denied (if applicable)
		metadata: v.optional(v.any()), // Additional context
		timestamp: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_timestamp', ['timestamp'])
		.index('by_user_timestamp', ['userId', 'timestamp'])
		.index('by_organization', ['organizationId'])
		.index('by_team', ['teamId'])
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
		.index('by_expires', ['expiresAt']) // Cleanup expired codes
});

export default schema;
