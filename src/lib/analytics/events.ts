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

