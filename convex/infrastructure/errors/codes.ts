export const ErrorCodes = {
	// ============================================
	// AUTH - Authentication failures (user identity)
	// ============================================
	AUTH_REQUIRED: 'AUTH_REQUIRED',
	AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
	SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
	SESSION_EXPIRED: 'SESSION_EXPIRED',
	SESSION_REVOKED: 'SESSION_REVOKED',

	// ============================================
	// AUTHZ - Authorization failures (permissions)
	// ============================================
	AUTHZ_NOT_CIRCLE_MEMBER: 'AUTHZ_NOT_CIRCLE_MEMBER',
	AUTHZ_NOT_CIRCLE_LEAD: 'AUTHZ_NOT_CIRCLE_LEAD',
	AUTHZ_INSUFFICIENT_RBAC: 'AUTHZ_INSUFFICIENT_RBAC',

	// ============================================
	// WORKSPACE - Workspace membership/access
	// ============================================
	WORKSPACE_ACCESS_DENIED: 'WORKSPACE_ACCESS_DENIED',
	WORKSPACE_MEMBERSHIP_REQUIRED: 'WORKSPACE_MEMBERSHIP_REQUIRED',
	WORKSPACE_NAME_REQUIRED: 'WORKSPACE_NAME_REQUIRED',
	WORKSPACE_SLUG_RESERVED: 'WORKSPACE_SLUG_RESERVED',
	WORKSPACE_SLUG_TAKEN: 'WORKSPACE_SLUG_TAKEN',
	WORKSPACE_SLUG_INVALID: 'WORKSPACE_SLUG_INVALID',
	WORKSPACE_LAST_OWNER: 'WORKSPACE_LAST_OWNER',
	WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
	WORKSPACE_ALREADY_MEMBER: 'WORKSPACE_ALREADY_MEMBER',

	// ============================================
	// PROPOSAL - Proposal domain errors
	// ============================================
	PROPOSAL_INVALID_STATE: 'PROPOSAL_INVALID_STATE',
	PROPOSAL_NOT_FOUND: 'PROPOSAL_NOT_FOUND',
	PROPOSAL_ACCESS_DENIED: 'PROPOSAL_ACCESS_DENIED',
	PROPOSAL_WORKSPACE_MISMATCH: 'PROPOSAL_WORKSPACE_MISMATCH',

	// ============================================
	// CIRCLE - Circle domain errors
	// ============================================
	CIRCLE_NOT_FOUND: 'CIRCLE_NOT_FOUND',
	CIRCLE_INVALID_PARENT: 'CIRCLE_INVALID_PARENT',
	CIRCLE_DEPTH_EXCEEDED: 'CIRCLE_DEPTH_EXCEEDED',
	CIRCLE_ARCHIVED: 'CIRCLE_ARCHIVED',
	CIRCLE_MEMBER_EXISTS: 'CIRCLE_MEMBER_EXISTS',
	CIRCLE_MEMBER_NOT_FOUND: 'CIRCLE_MEMBER_NOT_FOUND',

	// ============================================
	// ROLE - Role domain errors
	// ============================================
	ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
	ROLE_ALREADY_FILLED: 'ROLE_ALREADY_FILLED',

	// ============================================
	// ASSIGNMENT - Role assignment errors
	// ============================================
	ASSIGNMENT_NOT_FOUND: 'ASSIGNMENT_NOT_FOUND',
	ASSIGNMENT_ALREADY_EXISTS: 'ASSIGNMENT_ALREADY_EXISTS',

	// ============================================
	// PERSON - Person domain errors
	// ============================================
	PERSON_NOT_FOUND: 'PERSON_NOT_FOUND',

	// ============================================
	// POLICY - Policy domain errors
	// ============================================
	POLICY_NOT_FOUND: 'POLICY_NOT_FOUND',
	POLICY_CONFLICT: 'POLICY_CONFLICT',

	// ============================================
	// TAG - Tagging domain errors
	// ============================================
	TAG_NOT_FOUND: 'TAG_NOT_FOUND',
	TAG_ACCESS_DENIED: 'TAG_ACCESS_DENIED',
	TAG_ALREADY_EXISTS: 'TAG_ALREADY_EXISTS',
	TAG_ALREADY_SHARED: 'TAG_ALREADY_SHARED',
	TAG_INVALID_OWNERSHIP: 'TAG_INVALID_OWNERSHIP',
	TAG_CIRCLE_REQUIRED: 'TAG_CIRCLE_REQUIRED',
	TAG_NAME_REQUIRED: 'TAG_NAME_REQUIRED',
	TAG_NAME_TOO_LONG: 'TAG_NAME_TOO_LONG',
	TAG_CIRCULAR_REFERENCE: 'TAG_CIRCULAR_REFERENCE',
	TAG_PARENT_NOT_FOUND: 'TAG_PARENT_NOT_FOUND',
	TAG_PARENT_ACCESS_DENIED: 'TAG_PARENT_ACCESS_DENIED',
	TAG_PARENT_WORKSPACE_MISMATCH: 'TAG_PARENT_WORKSPACE_MISMATCH',
	TAG_PARENT_CIRCLE_MISMATCH: 'TAG_PARENT_CIRCLE_MISMATCH',

	// ============================================
	// NOTE - Notes domain errors
	// ============================================
	NOTE_NOT_FOUND: 'NOTE_NOT_FOUND',
	NOTE_ACCESS_DENIED: 'NOTE_ACCESS_DENIED',
	NOTE_INVALID_TYPE: 'NOTE_INVALID_TYPE',

	// ============================================
	// HIGHLIGHT - Highlight domain errors
	// ============================================
	HIGHLIGHT_NOT_FOUND: 'HIGHLIGHT_NOT_FOUND',
	HIGHLIGHT_ACCESS_DENIED: 'HIGHLIGHT_ACCESS_DENIED',

	// ============================================
	// FLASHCARD - Flashcard domain errors
	// ============================================
	FLASHCARD_NOT_FOUND: 'FLASHCARD_NOT_FOUND',
	FLASHCARD_ACCESS_DENIED: 'FLASHCARD_ACCESS_DENIED',
	FLASHCARD_INVALID_ALGORITHM: 'FLASHCARD_INVALID_ALGORITHM',
	FLASHCARD_INVALID_RATING: 'FLASHCARD_INVALID_RATING',
	FLASHCARD_GENERATION_FAILED: 'FLASHCARD_GENERATION_FAILED',

	// ============================================
	// INBOX - Inbox domain errors
	// ============================================
	INBOX_ITEM_NOT_FOUND: 'INBOX_ITEM_NOT_FOUND',

	// ============================================
	// MEETING - Meeting/Invitation errors
	// ============================================
	MEETING_NOT_FOUND: 'MEETING_NOT_FOUND',
	AGENDA_ITEM_NOT_FOUND: 'AGENDA_ITEM_NOT_FOUND',
	MEETING_INVITATION_ALREADY_EXISTS: 'MEETING_INVITATION_ALREADY_EXISTS',
	MEETING_INVITATION_NOT_FOUND: 'MEETING_INVITATION_NOT_FOUND',
	MEETING_CIRCLE_MISMATCH: 'MEETING_CIRCLE_MISMATCH',
	ATTENDEE_ALREADY_EXISTS: 'ATTENDEE_ALREADY_EXISTS',

	// ============================================
	// INVITE - Workspace invite flows
	// ============================================
	INVITE_NOT_FOUND: 'INVITE_NOT_FOUND',
	INVITE_EMAIL_MISMATCH: 'INVITE_EMAIL_MISMATCH',
	INVITE_USER_MISMATCH: 'INVITE_USER_MISMATCH',
	INVITE_ALREADY_ACCEPTED: 'INVITE_ALREADY_ACCEPTED',
	INVITE_REVOKED: 'INVITE_REVOKED',
	INVITE_EXPIRED: 'INVITE_EXPIRED',
	INVITE_ALREADY_EXISTS: 'INVITE_ALREADY_EXISTS',

	// ============================================
	// FEATURE FLAG - Feature flag management
	// ============================================
	FEATURE_FLAG_NOT_FOUND: 'FEATURE_FLAG_NOT_FOUND',
	FEATURE_FLAG_ALREADY_EXISTS: 'FEATURE_FLAG_ALREADY_EXISTS',
	FEATURE_FLAG_INVALID_PERCENTAGE: 'FEATURE_FLAG_INVALID_PERCENTAGE',

	// ============================================
	// EMAIL / INTEGRATIONS
	// ============================================
	EXTERNAL_API_KEY_MISSING: 'EXTERNAL_API_KEY_MISSING',
	EXTERNAL_SERVICE_FAILURE: 'EXTERNAL_SERVICE_FAILURE',
	EMAIL_SENDING_FAILED: 'EMAIL_SENDING_FAILED',

	// ============================================
	// VALIDATION - Input validation errors
	// ============================================
	VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
	VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',

	// ============================================
	// GENERIC / FALLBACK
	// ============================================
	GENERIC_ERROR: 'GENERIC_ERROR',

	// ============================================
	// TASKS - Task domain errors
	// ============================================
	TASK_NOT_FOUND: 'TASK_NOT_FOUND',
	PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
	TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
	TEMPLATE_STEP_NOT_FOUND: 'TEMPLATE_STEP_NOT_FOUND'
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export function createError(code: ErrorCode, message: string): Error {
	return new Error(`${code}: ${message}`);
}
