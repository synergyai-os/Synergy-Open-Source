export type OrganizationRole = 'owner' | 'admin' | 'member';
export type TeamRole = 'admin' | 'member';

export enum AnalyticsEventName {
	ORGANIZATION_CREATED = 'organization_created',
	ORGANIZATION_JOINED = 'organization_joined',
	ORGANIZATION_SWITCHED = 'organization_switched',
	TEAM_CREATED = 'team_created',
	TEAM_JOINED = 'team_joined',
	TEAM_INVITE_SENT = 'team_invite_sent',
	TEAM_INVITE_ACCEPTED = 'team_invite_accepted',
	ORGANIZATION_TAG_ASSIGNED = 'organization_tag_assigned',
	TEAM_TAG_ASSIGNED = 'team_tag_assigned',
	TAG_STUDY_STARTED = 'tag_study_started',
	TAG_SHARED = 'tag_shared',
	// Feature Flags
	FEATURE_FLAG_CHECKED = 'feature_flag_checked',
	// Quick Create events
	QUICK_CREATE_OPENED = 'quick_create_opened',
	QUICK_CREATE_TYPE_SELECTED = 'quick_create_type_selected',
	QUICK_CREATE_TAGS_MODIFIED = 'quick_create_tags_modified',
	QUICK_CREATE_COMPLETED = 'quick_create_completed',
	QUICK_CREATE_ABANDONED = 'quick_create_abandoned'
}

export type OwnershipScope = 'user' | 'organization' | 'team';

export type AnalyticsEventPayloads = {
	[AnalyticsEventName.ORGANIZATION_CREATED]: {
		scope: 'organization';
		organizationId: string;
		organizationName: string;
		plan: string;
		createdVia: 'dashboard' | 'api';
		totalOrganizationsOwned: number;
	};
	[AnalyticsEventName.ORGANIZATION_JOINED]: {
		scope: 'organization';
		organizationId: string;
		organizationName: string;
		role: OrganizationRole;
		inviteChannel?: 'email' | 'link' | 'manual';
	};
	[AnalyticsEventName.ORGANIZATION_SWITCHED]: {
		scope: 'organization';
		fromOrganizationId?: string;
		toOrganizationId: string;
		availableTeamCount: number;
	};
	[AnalyticsEventName.TEAM_CREATED]: {
		scope: 'team';
		organizationId: string;
		organizationName: string;
		teamId: string;
		teamName: string;
		createdVia: 'dashboard' | 'api';
	};
	[AnalyticsEventName.TEAM_JOINED]: {
		scope: 'team';
		organizationId: string;
		organizationName: string;
		teamId: string;
		teamName: string;
		role: TeamRole;
	};
	[AnalyticsEventName.TEAM_INVITE_SENT]: {
		scope: 'team';
		organizationId: string;
		organizationName: string;
		teamId: string;
		teamName: string;
		inviteChannel: 'email' | 'link' | 'manual';
		inviteTarget?: string;
		role: TeamRole;
	};
	[AnalyticsEventName.TEAM_INVITE_ACCEPTED]: {
		scope: 'team';
		organizationId: string;
		organizationName: string;
		teamId: string;
		teamName: string;
		role: TeamRole;
		inviteChannel: 'email' | 'link' | 'manual';
	};
	[AnalyticsEventName.ORGANIZATION_TAG_ASSIGNED]: {
		scope: 'organization';
		organizationId: string;
		tagId: string;
		tagName: string;
		tagsAssignedCount: number;
	};
	[AnalyticsEventName.TEAM_TAG_ASSIGNED]: {
		scope: 'team';
		organizationId: string;
		teamId: string;
		tagId: string;
		tagName: string;
		tagsAssignedCount: number;
	};
	[AnalyticsEventName.TAG_STUDY_STARTED]: {
		scope: OwnershipScope;
		organizationId?: string;
		teamId?: string;
		tagId: string;
		tagName: string;
		studyMode: 'spaced_repetition' | 'quick_review';
	};
	[AnalyticsEventName.TAG_SHARED]: {
		scope: 'organization' | 'team';
		tag_id: string;
		tag_name: string;
		shared_from: 'user';
		shared_at: number;
		organization_id?: string;
		organization_name?: string;
		team_id?: string;
		team_name?: string;
		content_type: 'highlights' | 'flashcards' | 'mixed';
		shared_via: 'tags_page' | 'inline' | 'bulk';
	};
	// Feature Flags
	[AnalyticsEventName.FEATURE_FLAG_CHECKED]: {
		scope: 'user';
		flag: string;
		enabled: boolean;
		rollout_percentage?: number;
		evaluation_method: 'allowed_user' | 'allowed_domain' | 'percentage' | 'global';
	};
	// Quick Create events
	[AnalyticsEventName.QUICK_CREATE_OPENED]: {
		scope: 'user';
		trigger_method: 'keyboard_n' | 'header_button' | 'footer_button';
		has_active_item: boolean;
		current_view: 'inbox' | 'flashcards' | 'tags' | 'my_mind' | 'study';
		items_in_view: number;
	};
	[AnalyticsEventName.QUICK_CREATE_TYPE_SELECTED]: {
		scope: 'user';
		content_type: 'note' | 'flashcard' | 'highlight';
		selection_method: 'click' | 'keyboard_c' | 'keyboard_nav';
		time_to_select_ms: number;
	};
	[AnalyticsEventName.QUICK_CREATE_TAGS_MODIFIED]: {
		scope: 'user';
		content_type: 'note' | 'flashcard' | 'highlight';
		tags_added_count: number;
		tags_removed_count: number;
		total_tags: number;
		used_tag_search: boolean;
		created_new_tag: boolean;
		tag_assignment_time_ms: number;
	};
	[AnalyticsEventName.QUICK_CREATE_COMPLETED]: {
		scope: 'user';
		content_type: 'note' | 'flashcard' | 'highlight';
		trigger_method: 'keyboard_n' | 'header_button' | 'footer_button';
		total_time_ms: number;
		type_selection_time_ms: number;
		tag_assignment_time_ms: number;
		content_length_chars: number;
		has_tags: boolean;
		tag_count: number;
	};
	[AnalyticsEventName.QUICK_CREATE_ABANDONED]: {
		scope: 'user';
		content_type?: 'note' | 'flashcard' | 'highlight';
		abandon_stage: 'type_selection' | 'tag_assignment' | 'content_entry';
		time_to_abandon_ms: number;
		abandon_method: 'escape_key' | 'click_outside' | 'back_button';
		had_content: boolean;
		had_tags: boolean;
	};
};

export type AnalyticsEventGroups = {
	organization?: string;
	team?: string;
};

export type AnalyticsEvent<K extends AnalyticsEventName> = {
	name: K;
	distinctId: string;
	groups?: AnalyticsEventGroups;
	properties: AnalyticsEventPayloads[K];
};

export type AnyAnalyticsEvent = AnalyticsEvent<AnalyticsEventName>;
